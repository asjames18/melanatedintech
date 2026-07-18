import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

process.env.NODE_ENV = "production";
process.env.BABEL_ENV = "production";

const require = createRequire(import.meta.url);
const vitePackagePath = require.resolve("vite/package.json");
const viteCliPath = join(dirname(vitePackagePath), "bin", "vite.js");

process.argv = [process.argv[0], "vite", "build", ...process.argv.slice(2)];
await import(pathToFileURL(viteCliPath).href);