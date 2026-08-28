-- Replace the queue-specific service credential with a dedicated shared secret for the nurture producer.
-- The corresponding NURTURE_PROCESSOR_SECRET must exist in the Worker before this migration is applied.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'website-launch-nurture') THEN
    PERFORM cron.unschedule('website-launch-nurture');
  END IF;

  PERFORM cron.schedule(
    'website-launch-nurture',
    '*/15 * * * *',
    $job$
      SELECT net.http_post(
        url := 'https://melanatedintech.com/lovable/email/nurture/process',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || COALESCE(
            (SELECT decrypted_secret FROM vault.decrypted_secrets
             WHERE name = 'website_launch_nurture_processor_secret' LIMIT 1),
            ''
          )
        ),
        body := '{}'::jsonb
      );
    $job$
  );
END $$;
