/**
 * Shared admin-guard DB helper for server functions.
 * Verifies the caller holds the admin role, then returns the untyped
 * Supabase admin client for privileged queries.
 */
export type UntypedDb = {
  from: (table: string) => any;
};

export async function getAdminDb(userId: string): Promise<UntypedDb> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const db = supabaseAdmin as unknown as UntypedDb;
  const { data, error } = await db
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required.");
  return db;
}
