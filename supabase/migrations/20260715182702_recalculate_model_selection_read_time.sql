-- Recorded remotely as migration version 20260715182702.
update public.articles
set read_minutes = greatest(
  1,
  ceil(
    coalesce(
      array_length(
        regexp_split_to_array(trim(coalesce(body, '')), E'\\s+'),
        1
      ),
      0
    ) / 220.0
  )::integer
)
where slug = 'choosing-the-right-model';
