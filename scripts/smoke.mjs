/**
 * Smoke-test the built Worker.
 *
 * `vite build` succeeding proves the bundle was written, not that it runs. Two
 * production outages in one day got past lint, typecheck and build:
 *
 *   1. `createServerFn(...).validator is not a function` — TanStack renamed the
 *      builder method. Every route 500'd, because a server fn is reached from
 *      site-layout on every page.
 *   2. A client bundle built without VITE_SUPABASE_* baked in. SSR kept working
 *      (the server has process.env), so nothing looked wrong from outside, while
 *      auth and checkout were dead in the browser.
 *
 * Both are caught in seconds by starting the built Worker and fetching a page.
 * This runs it, asserts the routes render, and asserts the public config the
 * browser needs is actually present in the HTML.
 *
 * Routes are deliberately ones that need no database, so this works in CI with
 * no secrets. Supabase-backed routes fail there for want of credentials, which
 * says nothing about the build.
 */
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import process from "node:process";

// Resolve wrangler's entry and run it with node, rather than spawning the
// platform shim. Node refuses to spawn a .cmd without a shell on Windows
// (EINVAL), and going through a shell makes the child harder to kill cleanly.
// scripts/build.mjs resolves vite the same way.
// wrangler's "exports" map blocks subpath resolution, so resolve its
// package.json and join — the same approach scripts/build.mjs uses for vite.
const require = createRequire(import.meta.url);
const wranglerBin = join(dirname(require.resolve("wrangler/package.json")), "bin", "wrangler.js");

const PORT = Number(process.env.SMOKE_PORT ?? 8788);
const BASE = `http://127.0.0.1:${PORT}`;
const BOOT_TIMEOUT_MS = 120_000;

/** Routes that must render without any backing service. */
const ROUTES = ["/tools", "/privacy", "/terms", "/start-small", "/governance"];

/**
 * Values the browser cannot function without. The Worker injects these into
 * <head>; if that regresses, auth and payments break silently in production
 * while every server-rendered page still looks fine.
 */
const REQUIRED_PUBLIC_ENV = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForBoot(child) {
  const deadline = Date.now() + BOOT_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`worker exited early (code ${child.exitCode})`);
    try {
      await fetch(`${BASE}/tools`, { signal: AbortSignal.timeout(4000) });
      return;
    } catch {
      await sleep(1000);
    }
  }
  throw new Error(`worker did not start within ${BOOT_TIMEOUT_MS / 1000}s`);
}

async function main() {
  // The Worker sandbox does not inherit this process's environment, so the
  // values have to be handed over explicitly. Placeholders are fine and
  // deliberate: the assertion is that the Worker READS its environment and
  // injects it, not that any particular key is valid. Real secrets are never
  // needed to run this.
  const vars = {
    SUPABASE_URL: process.env.SUPABASE_URL ?? "https://smoke.supabase.co",
    SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_smoke",
    VITE_PAYMENTS_CLIENT_TOKEN: process.env.VITE_PAYMENTS_CLIENT_TOKEN ?? "pk_test_smoke",
  };

  const child = spawn(
    process.execPath,
    [
      wranglerBin,
      "dev",
      "--config",
      "dist/server/wrangler.json",
      "--port",
      String(PORT),
      "--local",
      ...Object.entries(vars).flatMap(([k, v]) => ["--var", `${k}:${v}`]),
    ],
    { stdio: ["ignore", "pipe", "pipe"] },
  );

  let log = "";
  child.stdout.on("data", (d) => (log += d));
  child.stderr.on("data", (d) => (log += d));

  const failures = [];
  try {
    await waitForBoot(child);

    for (const route of ROUTES) {
      const res = await fetch(`${BASE}${route}`, { signal: AbortSignal.timeout(20_000) });
      const body = await res.text();
      if (res.status !== 200) {
        failures.push(`${route} -> ${res.status} (expected 200)`);
        continue;
      }
      if (/This page didn't load|Something went wrong on our end/.test(body)) {
        failures.push(`${route} -> 200 but rendered the SSR error page`);
        continue;
      }
      console.log(`  ok  ${route}`);
    }

    const home = await fetch(`${BASE}/tools`, { signal: AbortSignal.timeout(20_000) });
    const html = await home.text();
    const injected = /window\.__PUBLIC_ENV__=(\{.*?\})<\/script>/.exec(html);
    if (!injected) {
      failures.push("public config was not injected into <head>");
    } else {
      const keys = Object.keys(JSON.parse(injected[1]));
      const missing = REQUIRED_PUBLIC_ENV.filter((k) => !keys.includes(k));
      if (missing.length) failures.push(`public config missing: ${missing.join(", ")}`);
      else console.log(`  ok  public config injected (${keys.length} keys)`);
    }

    // A server-fn API break shows up here rather than as a plain 500.
    if (/is not a function/.test(log)) {
      failures.push(`worker logged a TypeError: ${/(\S+ is not a function)/.exec(log)?.[1]}`);
    }
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error));
  } finally {
    child.kill();
    // wrangler leaves workerd children behind if killed too fast.
    await sleep(1500);
    child.kill("SIGKILL");
  }

  if (failures.length) {
    console.error("\nsmoke test FAILED:");
    for (const f of failures) console.error(`  - ${f}`);
    console.error("\n--- worker output ---\n" + log.slice(-4000));
    process.exit(1);
  }
  console.log("\nsmoke test passed");
}

main();
