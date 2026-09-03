-- Run the AI Radar ingest on a schedule instead of on page loads.
--
-- The corresponding RADAR_INGEST_SECRET must be configured in both Vault and
-- the Worker before this migration is applied, or every run returns 500 and the
-- page quietly falls back to fetching live.
--
-- Every 30 minutes: fast enough that a model release or an API incident shows
-- up while it still matters, slow enough to stay a good citizen against ~38
-- free upstream feeds.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'radar-ingest') THEN
    PERFORM cron.unschedule('radar-ingest');
  END IF;

  PERFORM cron.schedule(
    'radar-ingest',
    '*/30 * * * *',
    $job$
      SELECT net.http_post(
        url := 'https://melanatedintech.com/lovable/radar/ingest',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || COALESCE(
            (SELECT decrypted_secret FROM vault.decrypted_secrets
             WHERE name = 'radar_ingest_secret' LIMIT 1),
            ''
          )
        ),
        body := '{}'::jsonb,
        timeout_milliseconds := 30000
      );
    $job$
  );
END
$$;
