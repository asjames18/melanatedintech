
DROP POLICY "Anyone can insert analytics events" ON public.analytics_events;

CREATE POLICY "Insert analytics events (own user only)"
  ON public.analytics_events FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(name) BETWEEN 1 AND 80
    AND (user_id IS NULL OR user_id = auth.uid())
  );
