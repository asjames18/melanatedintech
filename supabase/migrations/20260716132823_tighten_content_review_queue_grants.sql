-- Supabase default privileges grant service_role broader access to new tables.
-- Revoke those defaults, then grant only what the server workflow needs.

revoke all on table public.content_review_packets from service_role;
revoke all on table public.content_review_packet_events from service_role;
revoke all on sequence public.content_review_packet_events_id_seq from service_role;

grant select, insert, update on table public.content_review_packets to service_role;
grant select, insert on table public.content_review_packet_events to service_role;
grant usage, select on sequence public.content_review_packet_events_id_seq to service_role;
