-- Route the paid Revenue Leak Diagnostic through the working lead pipeline,
-- and retire the abandoned parallel one.
--
-- Background: 20260821120000_paid_diagnostic_funnel.sql created
-- public.diagnostic_leads as a second lead table for the $297 diagnostic. It was
-- never wired up — the table has three indexes, RLS and a read endpoint, but no
-- writer anywhere in the codebase, so /api/diagnostic/by-session returned
-- "processing" forever and no diagnostic buyer ever appeared in the admin.
--
-- public.service_system_leads already does this job: it has a submission form,
-- validation, rate limiting, an event log, an 8-stage status pipeline, an admin
-- screen at /admin/leads, and grantFromSession already advances it on payment.
-- Rather than build a second writer, the diagnostic becomes another
-- service_model on that pipeline.

-- 1. Allow the diagnostic as a service model.
alter table public.service_system_leads
  drop constraint if exists service_system_leads_service_model_check;

alter table public.service_system_leads
  add constraint service_system_leads_service_model_check
  check (service_model = any (array[
    'revenue-recovery',
    'estimate-recovery',
    'route-retention',
    'client-recovery',
    'revenue-leak-diagnostic'
  ]));

-- 2. Diagnostic intake is submitted after payment, so a lead may arrive already
--    at 'won'. Index the pairing the admin screen filters on.
create index if not exists idx_service_system_leads_model_created
  on public.service_system_leads (service_model, created_at desc);

-- 3. Retire the duplicate table. It has never held a row — nothing writes to it —
--    so this drops an empty table, not customer data.
drop table if exists public.diagnostic_leads;
