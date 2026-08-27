type EnvMap = Record<string, string | undefined>;

/**
 * Public config the server injected into the HTML at request time.
 *
 * `import.meta.env` is inlined by Vite when the bundle is BUILT, so a client
 * bundle built without VITE_SUPABASE_* baked in can never recover them — the
 * browser has no process.env to fall back to, and every Supabase call dies with
 * "Missing Supabase environment variable(s)". That makes a correct build depend
 * on whoever runs it having the right shell environment, which is fragile and
 * silently breaks auth in production when it is missing.
 *
 * The Worker already holds these as secrets, so it writes them into the page
 * instead (see injectPublicEnv in src/server.ts). Reading that first means
 * builds need no secrets and a rotated key takes effect without a rebuild.
 */
function injectedEnv(): EnvMap {
  if (typeof window === "undefined") return {};
  return (window as { __PUBLIC_ENV__?: EnvMap }).__PUBLIC_ENV__ ?? {};
}

function runtimeEnv(): EnvMap {
  return typeof process !== "undefined" ? process.env : {};
}

function viteEnv(): EnvMap {
  return import.meta.env as EnvMap;
}

function readEnv(keys: string[]): string | undefined {
  const sources = [injectedEnv(), viteEnv(), runtimeEnv()];

  for (const key of keys) {
    for (const source of sources) {
      const value = source[key];
      if (typeof value === "string" && value.trim()) return value;
    }
  }

  return undefined;
}

export function getSupabaseUrl() {
  return readEnv([
    "VITE_SUPABASE_URL",
    "SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "MIT_SUPABASE_URL",
  ]);
}

export function getSupabasePublishableKey() {
  return readEnv([
    "VITE_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "MIT_SUPABASE_PUBLISHABLE_KEY",
  ]);
}

export function getSupabaseServiceRoleKey() {
  return readEnv(["SUPABASE_SERVICE_ROLE_KEY", "MIT_SUPABASE_SERVICE_ROLE_KEY"]);
}

/** A private shared secret used only by the scheduled Website Launch nurture producer. */
export function getNurtureProcessorSecret() {
  return readEnv(["NURTURE_PROCESSOR_SECRET"]);
}

export function missingSupabaseMessage(missing: string[]) {
  return `Missing Supabase environment variable(s): ${missing.join(", ")}. Configure them in Cloudflare.`;
}
