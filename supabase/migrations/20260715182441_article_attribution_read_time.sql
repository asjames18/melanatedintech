-- Recorded remotely as migration version 20260715182441.
-- Normalize visible read-time estimates and ensure every published article has
-- at least an editorial attribution. A named human reviewer can replace the
-- editorial profile when each article is substantively reviewed.

with editorial_author as (
  select id
  from public.authors
  where slug = 'mit-editorial'
  limit 1
)
update public.articles
set author_id = (select id from editorial_author)
where author_id is null
  and exists (select 1 from editorial_author);

-- Estimate reading time from the Markdown body at 220 words per minute.
-- Strip fenced/inline Markdown punctuation from the count indirectly by
-- counting whitespace-delimited tokens; always show at least one minute.
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
where status in ('published', 'scheduled');
