-- Cover the 20 foreign keys that had no index.
--
-- Postgres does not index a foreign key automatically. Without a covering index
-- every join across these columns is a sequential scan, and every delete on the
-- parent must scan the child table to enforce the constraint. At current row
-- counts that is invisible; it degrades sharply as the community feed grows,
-- which is exactly the table set most affected here.
--
-- Purely additive: no policy, constraint, or data is touched.

create index if not exists idx_agent_submissions_published_agent_id on public.agent_submissions (published_agent_id);
create index if not exists idx_agent_submissions_reviewed_by on public.agent_submissions (reviewed_by);
create index if not exists idx_analytics_events_user_id on public.analytics_events (user_id);
create index if not exists idx_content_review_packet_events_actor_id on public.content_review_packet_events (actor_id);
create index if not exists idx_content_review_packets_requested_by on public.content_review_packets (requested_by);
create index if not exists idx_content_review_packets_reviewed_by on public.content_review_packets (reviewed_by);
create index if not exists idx_discussion_comments_user_id on public.discussion_comments (user_id);
create index if not exists idx_discussion_posts_user_id on public.discussion_posts (user_id);
create index if not exists idx_mcp_servers_submitted_by on public.mcp_servers (submitted_by);
create index if not exists idx_notifications_actor_user_id on public.notifications (actor_user_id);
create index if not exists idx_notifications_post_id on public.notifications (post_id);
create index if not exists idx_notifications_reply_id on public.notifications (reply_id);
create index if not exists idx_post_reports_post_id on public.post_reports (post_id);
create index if not exists idx_post_shares_user_id on public.post_shares (user_id);
create index if not exists idx_profiles_pinned_post_id on public.profiles (pinned_post_id);
create index if not exists idx_saved_agents_agent_id on public.saved_agents (agent_id);
create index if not exists idx_saved_articles_article_id on public.saved_articles (article_id);
create index if not exists idx_service_system_leads_invoice_number on public.service_system_leads (invoice_number);
create index if not exists idx_user_learning_progress_current_item_id on public.user_learning_progress (current_item_id);
create index if not exists idx_user_learning_progress_path_id on public.user_learning_progress (path_id);
