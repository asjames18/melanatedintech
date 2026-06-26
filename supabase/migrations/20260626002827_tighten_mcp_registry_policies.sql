drop policy if exists "mcp_read_public" on public.mcp_servers;
drop policy if exists "mcp_admin_all" on public.mcp_servers;
drop policy if exists "mcp_insert_authenticated" on public.mcp_servers;
drop policy if exists "mcp_update_owner" on public.mcp_servers;
drop policy if exists "mcp_delete_owner" on public.mcp_servers;

create policy "mcp_read_public" on public.mcp_servers
  for select
  to anon, authenticated
  using (is_public and is_approved);

create policy "mcp_admin_all" on public.mcp_servers
  for all
  to authenticated
  using (public.has_role((select auth.uid()), 'admin'))
  with check (public.has_role((select auth.uid()), 'admin'));

create policy "mcp_insert_authenticated" on public.mcp_servers
  for insert
  to authenticated
  with check (submitted_by = (select auth.uid()));

create policy "mcp_update_owner" on public.mcp_servers
  for update
  to authenticated
  using (submitted_by = (select auth.uid()))
  with check (submitted_by = (select auth.uid()));

create policy "mcp_delete_owner" on public.mcp_servers
  for delete
  to authenticated
  using (submitted_by = (select auth.uid()));
