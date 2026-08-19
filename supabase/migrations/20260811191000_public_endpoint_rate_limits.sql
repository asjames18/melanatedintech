-- Atomic, shared rate-limit buckets for public endpoints running across many
-- Cloudflare Worker isolates. Only the service role may consume buckets.

CREATE TABLE IF NOT EXISTS public.public_endpoint_rate_limits (
  key_hash TEXT NOT NULL,
  window_started_at TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1 CHECK (request_count > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (key_hash, window_started_at)
);

ALTER TABLE public.public_endpoint_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.public_endpoint_rate_limits FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.public_endpoint_rate_limits TO service_role;

CREATE OR REPLACE FUNCTION public.consume_public_rate_limit(
  p_key_hash TEXT,
  p_window_seconds INTEGER,
  p_max_requests INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  bucket_start TIMESTAMPTZ;
  next_count INTEGER;
BEGIN
  IF p_key_hash IS NULL OR length(p_key_hash) < 16 THEN
    RAISE EXCEPTION 'invalid rate-limit key';
  END IF;
  IF p_window_seconds < 1 OR p_window_seconds > 86400 OR p_max_requests < 1 THEN
    RAISE EXCEPTION 'invalid rate-limit settings';
  END IF;

  bucket_start := to_timestamp(
    floor(extract(epoch FROM clock_timestamp()) / p_window_seconds) * p_window_seconds
  );

  INSERT INTO public.public_endpoint_rate_limits AS buckets
    (key_hash, window_started_at, request_count, updated_at)
  VALUES (p_key_hash, bucket_start, 1, now())
  ON CONFLICT (key_hash, window_started_at)
  DO UPDATE SET
    request_count = buckets.request_count + 1,
    updated_at = now()
  RETURNING request_count INTO next_count;

  -- Cheap opportunistic cleanup; every bucket is disposable operational data.
  IF random() < 0.01 THEN
    DELETE FROM public.public_endpoint_rate_limits
    WHERE window_started_at < now() - interval '2 days';
  END IF;

  RETURN next_count <= p_max_requests;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_public_rate_limit(TEXT, INTEGER, INTEGER)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_public_rate_limit(TEXT, INTEGER, INTEGER)
  TO service_role;
