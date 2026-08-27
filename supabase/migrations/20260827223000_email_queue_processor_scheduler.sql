-- Process transactional email automatically with a dedicated credential.
-- The corresponding EMAIL_QUEUE_PROCESSOR_SECRET must be configured in both Vault and the Worker before this migration is applied.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'process-email-queue') THEN
    PERFORM cron.unschedule('process-email-queue');
  END IF;

  PERFORM cron.schedule(
    'process-email-queue',
    '*/5 * * * *',
    $job$
      SELECT net.http_post(
        url := 'https://melanatedintech.com/lovable/email/queue/process',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || COALESCE(
            (SELECT decrypted_secret FROM vault.decrypted_secrets
             WHERE name = 'email_queue_processor_secret' LIMIT 1),
            ''
          )
        ),
        body := '{}'::jsonb
      );
    $job$
  );
END $$;
