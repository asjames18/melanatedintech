-- Re-enable the transactional-email processor after verifying existing queue entries are stale.
-- Stale entries are moved to the existing DLQ by the processor's transactional TTL before any send attempt.
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
