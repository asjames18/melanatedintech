-- Restrict paid deliverable columns to the service role.
--
-- The base schema granted table-wide SELECT on public.agents and public.products
-- to anon and authenticated (20260622173335, lines 97 and 146). RLS is row-level
-- only, so every column of every published row was readable straight from
-- PostgREST with the publishable key that ships in the client bundle:
--
--   GET /rest/v1/agents?select=unlock_content,system_prompt&status=eq.published
--
-- src/lib/public.functions.ts strips these fields server-side, but that is an
-- application-layer control and does not stop a direct API call. This migration
-- moves the boundary into the database with column-level privileges.
--
-- Gated columns:
--   unlock_content - the purchased pack markdown
--   system_prompt  - the agent's proprietary instructions
--   asset_path     - storage key for the paid download in the private
--                    product-assets bucket
--
-- Everything that legitimately needs these reads through the service-role client
-- (src/lib/fulfillment.functions.ts, product.functions.ts, seller.functions.ts,
-- admin.functions.ts) and is unaffected. public.functions.ts is updated in the
-- same change to use the service-role client for its gated-field lookup.

-- public.agents ------------------------------------------------------------

REVOKE SELECT ON public.agents FROM anon, authenticated;

GRANT SELECT (
  id,
  slug,
  name,
  tagline,
  description,
  category,
  capabilities,
  tier,
  price_cents,
  image_url,
  featured,
  active,
  status,
  scheduled_at,
  model,
  max_tokens,
  temperature,
  asset_name,
  seller_id,
  created_at,
  updated_at
) ON public.agents TO anon, authenticated;

-- public.products ----------------------------------------------------------

REVOKE SELECT ON public.products FROM anon, authenticated;

GRANT SELECT (
  id,
  slug,
  name,
  tagline,
  description,
  category,
  tier,
  price_cents,
  image_url,
  featured,
  active,
  status,
  scheduled_at,
  model,
  max_tokens,
  temperature,
  asset_name,
  seller_id,
  created_at,
  updated_at
) ON public.products TO anon, authenticated;

-- The service role keeps unrestricted access for fulfillment and admin writes.
GRANT ALL ON public.agents TO service_role;
GRANT ALL ON public.products TO service_role;
