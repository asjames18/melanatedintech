-- Remove has_role() from every anonymous code path, then take EXECUTE away
-- from anon.
--
-- The security advisor flagged has_role as a SECURITY DEFINER function callable
-- at /rest/v1/rpc/has_role without signing in, which let anyone probe whether a
-- known user id is an admin.
--
-- The reason anon needed EXECUTE at all was indirect. Three public content
-- tables carried their admin policy as FOR ALL TO public. RLS policies are
-- permissive and OR'd, so an anonymous SELECT evaluated the admin policy too
-- and called has_role on the way past. has_role(null, 'admin') is false for
-- anon by definition, so that policy never granted anon anything -- it only
-- created the dependency.
--
-- Scoping those three to `authenticated` changes no access, removes the call
-- from every anonymous read, and drops one permissive policy from the anon
-- path on each table. EXECUTE stays with authenticated, which 20 admin
-- policies and mcp.functions.ts / product.functions.ts still rely on.

alter policy "Admins manage builder challenges" on public.builder_challenges to authenticated;
alter policy "Admins manage learning paths" on public.learning_paths to authenticated;
alter policy "Admins manage learning path items" on public.learning_path_items to authenticated;

revoke execute on function public.has_role(uuid, public.app_role) from anon;
