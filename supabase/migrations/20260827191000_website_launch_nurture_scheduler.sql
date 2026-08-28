-- Schedule the first-party nurture producer after the application route is deployed.
-- The endpoint is authenticated with the existing vault-stored service-role key.
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
             WHERE name = 'email_queue_service_role_key' LIMIT 1),
            ''
          )
        ),
        body := '{}'::jsonb
      );
    $job$
  );
END $$;
