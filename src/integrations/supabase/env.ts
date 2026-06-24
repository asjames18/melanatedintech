type EnvMap = Record<string, string | undefined>;

function runtimeEnv(): EnvMap {
  return typeof process !== "undefined" ? process.env : {};
}

function viteEnv(): EnvMap {
  return import.meta.env as EnvMap;
}

function readEnv(keys: string[]): string | undefined {
  const sources = [viteEnv(), runtimeEnv()];

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

export function missingSupabaseMessage(missing: string[]) {
  return `Missing Supabase environment variable(s): ${missing.join(", ")}. Configure them in Cloudflare.`;
}
