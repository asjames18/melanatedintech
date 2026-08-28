import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type JsonValue = string | number | boolean | null | JsonValue[] | JsonObject;
type JsonObject = { [key: string]: JsonValue };

const decisionSchema = z.enum(["refresh", "consolidate", "create", "reject"]);
const clusterSchema = z.enum([
  "beginners",
  "small-business",
  "safety-evaluation",
  "churches-nonprofits",
]);

const sourceSchema = z
  .object({
    title: z.string().min(3).max(300),
    url: z.string().url().max(2_000),
    publisher: z.string().min(2).max(160),
    updated_at: z.string().min(4).max(40),
    checked_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    primary: z.boolean(),
  })
  .strict();

const claimSchema = z
  .object({
    claim: z.string().min(5).max(1_500),
    source_url: z.string().url().max(2_000).nullable(),
    kind: z.enum(["fact", "example", "assumption", "opinion"]),
    confidence: z.enum(["high", "medium", "low"]),
    human_review: z.boolean(),
  })
  .strict();

const internalLinkSchema = z
  .object({
    url: z.string().min(1).max(500),
    anchor: z.string().min(2).max(160),
    reason: z.string().min(3).max(400),
  })
  .strict();

export const contentPacketSchema = z
  .object({
    decision: decisionSchema,
    decision_reason: z.string().min(20).max(800),
    cluster: clusterSchema,
    primary_query: z.string().min(3).max(200),
    reader_outcome: z.string().min(10).max(500),
    primary_url: z.string().min(1).max(500),
    merge_urls: z.array(z.string().min(1).max(500)).max(10),
    sources: z.array(sourceSchema).min(3).max(6),
    direct_answer: z.string().min(120).max(1_200),
    outline: z.array(z.string().min(3).max(300)).min(3).max(12),
    worked_example: z.string().min(20).max(1_500),
    claims: z.array(claimSchema).min(1).max(24),
    internal_links: z.array(internalLinkSchema).min(2).max(10),
    safety_flags: z.array(z.string().min(3).max(300)).max(12),
    seo: z
      .object({
        title: z.string().min(20).max(60),
        description: z.string().min(120).max(160),
        slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
        canonical: z.string().min(1).max(500),
        index: z.boolean(),
        author_name: z.string().min(2).max(160),
        author_slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
        review_interval_days: z.number().int().min(30).max(365),
        review_by: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      })
      .strict(),
    cta: z
      .object({
        label: z.string().min(2).max(120),
        url: z.string().min(1).max(500),
      })
      .strict(),
    product_opportunity: z
      .object({
        action: z.enum(["none", "lead-magnet", "product"]),
        name: z.string().max(160),
        rationale: z.string().min(10).max(600),
        target_url: z.string().min(1).max(500).nullable(),
      })
      .strict(),
    distribution: z
      .object({
        newsletter: z.string().min(40).max(2_500),
        linkedin: z.string().min(40).max(3_000),
        x: z.string().min(20).max(1_500),
        facebook: z.string().min(40).max(3_000),
        carousel_panels: z.array(z.string().min(5).max(500)).length(7),
      })
      .strict(),
  })
  .strict();

export type ContentPacket = z.infer<typeof contentPacketSchema>;

export type ContentPacketEvent = {
  id: number;
  packet_id: string;
  event_type: string;
  actor_id: string | null;
  from_status: string | null;
  to_status: string | null;
  details: JsonObject;
  created_at: string;
};

export type ContentReviewRow = {
  id: string;
  run_key: string;
  run_date: string;
  status: "requested" | "running" | "review" | "approved" | "rejected" | "failed";
  topic_hint: string | null;
  decision: ContentPacket["decision"] | null;
  cluster: ContentPacket["cluster"] | null;
  primary_query: string | null;
  reader_outcome: string | null;
  primary_url: string | null;
  packet: ContentPacket | Record<string, never>;
  source_annotations: JsonObject[];
  validation_errors: string[];
  provider: string;
  model_requested: string | null;
  model_used: string | null;
  provider_request_id: string | null;
  prompt_version: string;
  usage: JsonObject;
  duration_ms: number | null;
  failure_code: string | null;
  failure_message: string | null;
  requested_by: string | null;
  reviewed_by: string | null;
  review_notes: string | null;
  started_at: string | null;
  finished_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  events?: ContentPacketEvent[];
};

const generateInput = z.object({ topic_hint: z.string().trim().max(500).optional() });
const reviewInput = z.object({
  id: z.string().uuid(),
  status: z.enum(["review", "approved", "rejected"]),
  notes: z.string().trim().max(4_000).optional(),
});

const PROMPT_VERSION = "seo-review-v1";
const DEFAULT_MODEL = "openrouter/auto";
const MAX_INVENTORY_CHARS = 22_000;
const OPENROUTER_TIMEOUT_MS = 90_000;

const PRIMARY_SOURCE_DOMAINS = [
  "openai.com",
  "anthropic.com",
  "ai.google.dev",
  "cloud.google.com",
  "developers.googleblog.com",
  "microsoft.com",
  "github.com",
  "nist.gov",
  "cisa.gov",
  "owasp.org",
  "mitre.org",
  "ftc.gov",
  "irs.gov",
  "oecd.ai",
  "unesco.org",
  "supabase.com",
  "openrouter.ai",
];

type UntypedDb = {
  from: (table: string) => any;
};

async function getAdminDb(userId: string): Promise<UntypedDb> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const db = supabaseAdmin as unknown as UntypedDb;
  const { data, error } = await db
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required.");
  return db;
}

function readServerEnv(keys: string[]): string | undefined {
  for (const key of keys) {
    const value = typeof process !== "undefined" ? process.env[key] : undefined;
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function dailyLimit(): number {
  const raw = Number(readServerEnv(["CONTENT_AGENT_DAILY_LIMIT"]));
  return Number.isFinite(raw) ? Math.min(10, Math.max(1, Math.floor(raw))) : 3;
}

function trimInventory(value: unknown): string {
  const serialized = JSON.stringify(value);
  return serialized.length <= MAX_INVENTORY_CHARS
    ? serialized
    : `${serialized.slice(0, MAX_INVENTORY_CHARS)}\n[Inventory truncated at ${MAX_INVENTORY_CHARS} characters]`;
}

async function loadInventory(db: UntypedDb) {
  const [articles, products, agents, paths, authors] = await Promise.all([
    db
      .from("articles")
      .select("slug,title,excerpt,category,status,published,updated_at,read_time")
      .order("updated_at", { ascending: false })
      .limit(120),
    db
      .from("products")
      .select("slug,name,description,tier,status,updated_at")
      .order("updated_at", { ascending: false })
      .limit(100),
    db
      .from("agents")
      .select("slug,name,description,category,tier,status,updated_at")
      .order("updated_at", { ascending: false })
      .limit(80),
    db
      .from("learning_paths")
      .select("slug,title,description,status,updated_at")
      .order("updated_at", { ascending: false })
      .limit(40),
    db.from("authors").select("slug,name,bio,updated_at").order("name").limit(20),
  ]);

  for (const result of [articles, products, agents, paths, authors]) {
    if (result.error) throw new Error(`Inventory query failed: ${result.error.message}`);
  }

  return {
    articles: articles.data ?? [],
    products: products.data ?? [],
    agents: agents.data ?? [],
    learning_paths: paths.data ?? [],
    authors: authors.data ?? [],
  };
}

function packetJsonSchema() {
  const stringArray = (minItems: number, maxItems: number) => ({
    type: "array",
    minItems,
    maxItems,
    items: { type: "string" },
  });
  return {
    type: "object",
    additionalProperties: false,
    required: [
      "decision",
      "decision_reason",
      "cluster",
      "primary_query",
      "reader_outcome",
      "primary_url",
      "merge_urls",
      "sources",
      "direct_answer",
      "outline",
      "worked_example",
      "claims",
      "internal_links",
      "safety_flags",
      "seo",
      "cta",
      "product_opportunity",
      "distribution",
    ],
    properties: {
      decision: { type: "string", enum: decisionSchema.options },
      decision_reason: { type: "string" },
      cluster: { type: "string", enum: clusterSchema.options },
      primary_query: { type: "string" },
      reader_outcome: { type: "string" },
      primary_url: { type: "string" },
      merge_urls: stringArray(0, 10),
      sources: {
        type: "array",
        minItems: 3,
        maxItems: 6,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["title", "url", "publisher", "updated_at", "checked_at", "primary"],
          properties: {
            title: { type: "string" },
            url: { type: "string", format: "uri" },
            publisher: { type: "string" },
            updated_at: { type: "string" },
            checked_at: { type: "string" },
            primary: { type: "boolean" },
          },
        },
      },
      direct_answer: { type: "string" },
      outline: stringArray(3, 12),
      worked_example: { type: "string" },
      claims: {
        type: "array",
        minItems: 1,
        maxItems: 24,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["claim", "source_url", "kind", "confidence", "human_review"],
          properties: {
            claim: { type: "string" },
            source_url: { type: ["string", "null"], format: "uri" },
            kind: { type: "string", enum: ["fact", "example", "assumption", "opinion"] },
            confidence: { type: "string", enum: ["high", "medium", "low"] },
            human_review: { type: "boolean" },
          },
        },
      },
      internal_links: {
        type: "array",
        minItems: 2,
        maxItems: 10,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["url", "anchor", "reason"],
          properties: {
            url: { type: "string" },
            anchor: { type: "string" },
            reason: { type: "string" },
          },
        },
      },
      safety_flags: stringArray(0, 12),
      seo: {
        type: "object",
        additionalProperties: false,
        required: [
          "title",
          "description",
          "slug",
          "canonical",
          "index",
          "author_name",
          "author_slug",
          "review_interval_days",
          "review_by",
        ],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          slug: { type: "string" },
          canonical: { type: "string" },
          index: { type: "boolean" },
          author_name: { type: "string" },
          author_slug: { type: "string" },
          review_interval_days: { type: "integer", minimum: 30, maximum: 365 },
          review_by: { type: "string" },
        },
      },
      cta: {
        type: "object",
        additionalProperties: false,
        required: ["label", "url"],
        properties: { label: { type: "string" }, url: { type: "string" } },
      },
      product_opportunity: {
        type: "object",
        additionalProperties: false,
        required: ["action", "name", "rationale", "target_url"],
        properties: {
          action: { type: "string", enum: ["none", "lead-magnet", "product"] },
          name: { type: "string" },
          rationale: { type: "string" },
          target_url: { type: ["string", "null"] },
        },
      },
      distribution: {
        type: "object",
        additionalProperties: false,
        required: ["newsletter", "linkedin", "x", "facebook", "carousel_panels"],
        properties: {
          newsletter: { type: "string" },
          linkedin: { type: "string" },
          x: { type: "string" },
          facebook: { type: "string" },
          carousel_panels: stringArray(7, 7),
        },
      },
    },
  };
}

function inventoryRows(inventory: unknown, key: string): Array<Record<string, unknown>> {
  if (!inventory || typeof inventory !== "object") return [];
  const value = (inventory as Record<string, unknown>)[key];
  if (!Array.isArray(value)) return [];
  return value.filter(
    (row): row is Record<string, unknown> => Boolean(row) && typeof row === "object",
  );
}

function inventoryContext(inventory: unknown) {
  const urls = new Set([
    "/",
    "/knowledge",
    "/products",
    "/agents",
    "/paths",
    "/tools",
    "/tools/ai-playbook",
    "/tools/agent-architect",
    "/tools/model-playground",
    "/tools/gpt-trainer",
    "/tools/prompt-pilot",
    "/prompts",
  ]);
  const addUrls = (key: string, prefix: string) => {
    for (const row of inventoryRows(inventory, key)) {
      if (typeof row.slug === "string" && row.slug) urls.add(`${prefix}${row.slug}`);
    }
  };
  addUrls("articles", "/knowledge/");
  addUrls("products", "/products/");
  addUrls("agents", "/agents/");
  addUrls("learning_paths", "/paths/");
  const authors = new Map<string, string>();
  for (const row of inventoryRows(inventory, "authors")) {
    if (typeof row.slug === "string" && typeof row.name === "string") {
      authors.set(row.slug, row.name);
    }
  }
  return { urls, authors };
}

function normalizeCitationUrl(value: string): string {
  try {
    const url = new URL(value);
    url.hash = "";
    if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/$/, "");
    return url.toString();
  } catch {
    return value;
  }
}

function annotationUrls(annotations: Array<Record<string, unknown>>): Set<string> {
  const urls = new Set<string>();
  for (const annotation of annotations) {
    if (annotation.type !== "url_citation") continue;
    const citation = annotation.url_citation;
    if (!citation || typeof citation !== "object") continue;
    const url = (citation as Record<string, unknown>).url;
    if (typeof url === "string") urls.add(normalizeCitationUrl(url));
  }
  return urls;
}

function validatePacket(
  packet: ContentPacket,
  today: string,
  inventory: unknown,
  annotations: Array<Record<string, unknown>>,
): string[] {
  const errors: string[] = [];
  const { urls: knownUrls, authors } = inventoryContext(inventory);
  const citedUrls = annotationUrls(annotations);
  const words = packet.direct_answer.trim().split(/\s+/).filter(Boolean).length;
  if (words < 40 || words > 60) errors.push(`Direct answer has ${words} words; expected 40-60.`);
  if (packet.sources.filter((source) => source.primary).length < 2) {
    errors.push("Fewer than two sources are marked primary.");
  }
  if (citedUrls.size < 3) errors.push("Web search returned fewer than three URL citations.");
  const sourceUrls = new Set(packet.sources.map((source) => source.url));
  for (const source of packet.sources) {
    if (!citedUrls.has(normalizeCitationUrl(source.url))) {
      errors.push(`Source URL was not returned by web search: ${source.url}`);
    }
  }
  for (const claim of packet.claims) {
    if (claim.kind === "fact" && !claim.source_url) {
      errors.push(`Factual claim is missing a source: ${claim.claim.slice(0, 100)}`);
    }
    if (claim.source_url && !sourceUrls.has(claim.source_url)) {
      errors.push(`Claim source is absent from sources[]: ${claim.source_url}`);
    }
  }
  for (const link of packet.internal_links) {
    if (!link.url.startsWith("/")) errors.push(`Internal link is not site-relative: ${link.url}`);
    else if (!knownUrls.has(link.url))
      errors.push(`Internal link is absent from inventory: ${link.url}`);
  }
  for (const mergeUrl of packet.merge_urls) {
    if (!knownUrls.has(mergeUrl)) errors.push(`Merge URL is absent from inventory: ${mergeUrl}`);
  }
  if (packet.decision === "consolidate" && packet.merge_urls.length === 0) {
    errors.push("A consolidate decision requires at least one merge URL.");
  }
  if (packet.decision === "reject" && packet.seo.index) {
    errors.push("A rejected topic cannot be marked indexable.");
  }
  if (!packet.primary_url.startsWith("/knowledge/")) {
    errors.push("Primary URL must be a /knowledge/ URL.");
  }
  if (packet.primary_url !== `/knowledge/${packet.seo.slug}`) {
    errors.push("SEO slug does not match primary_url.");
  }
  if (packet.seo.canonical !== packet.primary_url) {
    errors.push("SEO canonical does not match primary_url.");
  }
  if (
    packet.decision !== "create" &&
    packet.decision !== "reject" &&
    !knownUrls.has(packet.primary_url)
  ) {
    errors.push("Refresh and consolidation decisions must target an existing inventory URL.");
  }
  if (packet.decision === "create" && knownUrls.has(packet.primary_url)) {
    errors.push("Create decision conflicts with an existing inventory URL.");
  }
  if (packet.sources.some((source) => source.checked_at !== today)) {
    errors.push("One or more sources do not use today's checked_at date.");
  }
  if (packet.seo.title.length > 60) errors.push("SEO title exceeds 60 characters.");
  if (packet.seo.description.length < 120 || packet.seo.description.length > 160) {
    errors.push("SEO description must contain 120-160 characters.");
  }
  if (!authors.has(packet.seo.author_slug)) {
    errors.push(`SEO author is absent from inventory: ${packet.seo.author_slug}`);
  } else if (authors.get(packet.seo.author_slug) !== packet.seo.author_name) {
    errors.push("SEO author name does not match the selected inventory author.");
  }
  const expectedReviewDate = new Date(`${today}T00:00:00.000Z`);
  expectedReviewDate.setUTCDate(expectedReviewDate.getUTCDate() + packet.seo.review_interval_days);
  if (packet.seo.review_by !== expectedReviewDate.toISOString().slice(0, 10)) {
    errors.push("SEO review_by does not match review_interval_days.");
  }
  if (!packet.cta.url.startsWith("/") || !knownUrls.has(packet.cta.url)) {
    errors.push(`CTA URL is absent from site inventory: ${packet.cta.url}`);
  }
  if (
    packet.product_opportunity.target_url &&
    (!packet.product_opportunity.target_url.startsWith("/") ||
      !knownUrls.has(packet.product_opportunity.target_url))
  ) {
    errors.push(
      `Product opportunity URL is absent from site inventory: ${packet.product_opportunity.target_url}`,
    );
  }
  return errors.slice(0, 30);
}

function systemPrompt(today: string) {
  return `You are the Melanated In Tech editorial research agent. Prepare one review packet; never publish, schedule, redirect, unpublish, purchase, message, or modify any external system.

Today is ${today}. Work only within one authority cluster: AI agents for beginners, AI agents for small business, AI safety/evaluation, or AI for churches/nonprofits.

Rules:
- Use the web-search tool for every packet. Only include source URLs returned by that tool.
- Prefer refreshing or consolidating an existing URL over creating a duplicate.
- Explain the create, refresh, consolidate, or reject decision in decision_reason.
- Ground current facts in official documentation, original research, standards bodies, or first-party product pages.
- Use 3-6 sources, at least two primary. Use exact source URLs and today's date for checked_at.
- Never invent a statistic, quote, price, integration, customer result, ranking, or product capability.
- Treat vendor marketing as a vendor claim. Mark examples and assumptions explicitly.
- The direct answer must be 40-60 words and stand on its own.
- Recommend only site-relative internal links present in the inventory.
- Assign only an author present in inventory. Use a 30-60 day review interval for fast-changing technical content and 180-365 days for durable guidance.
- Suggest a product or lead magnet only when it is a natural next step; otherwise use action "none".
- Flag legal, financial, privacy, security, hiring, health, ministry, policy, comparison, and commercial claims for human review.
- The output is a brief, not a finished article. Approval means editorial approval only and cannot publish.
- Return only JSON matching the provided schema.`;
}

async function callContentAgent(args: {
  inventory: unknown;
  topicHint: string | null;
  today: string;
}) {
  const apiKey = readServerEnv(["OPENROUTER_LIVE_API_KEY", "OPENROUTER_API_KEY"]);
  if (!apiKey) throw new Error("OpenRouter API key is not configured on the server.");
  const model = readServerEnv(["CONTENT_AGENT_MODEL"]) ?? DEFAULT_MODEL;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OPENROUTER_TIMEOUT_MS);
  const started = Date.now();

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://melanatedintech.com",
        "X-Title": "Melanated In Tech Daily Content Agent",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt(args.today) },
          {
            role: "user",
            content: `Topic hint: ${args.topicHint ?? "Choose the strongest refresh or gap from the inventory."}\n\nCurrent site inventory:\n${trimInventory(args.inventory)}`,
          },
        ],
        tools: [
          {
            type: "openrouter:web_search",
            parameters: {
              engine: "exa",
              max_results: 6,
              max_total_results: 6,
              max_characters: 4_000,
              allowed_domains: PRIMARY_SOURCE_DOMAINS,
            },
          },
        ],
        plugins: [{ id: "response-healing" }],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "mit_content_review_packet",
            strict: true,
            schema: packetJsonSchema(),
          },
        },
        provider: { require_parameters: true },
        temperature: 0.2,
        max_tokens: 4_500,
      }),
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 1_000);
      throw new Error(`OpenRouter request failed (${response.status}): ${detail}`);
    }

    const data = (await response.json()) as {
      id?: string;
      model?: string;
      usage?: JsonObject;
      choices?: Array<{
        message?: { content?: string; annotations?: JsonObject[] };
      }>;
    };
    const message = data.choices?.[0]?.message;
    if (!message?.content) throw new Error("OpenRouter returned no packet content.");

    let decoded: unknown;
    try {
      decoded = JSON.parse(message.content);
    } catch {
      throw new Error("OpenRouter returned invalid JSON despite structured-output mode.");
    }
    const parsed = contentPacketSchema.safeParse(decoded);
    if (!parsed.success) {
      const problems = parsed.error.issues
        .slice(0, 12)
        .map((issue) => `${issue.path.join(".") || "packet"}: ${issue.message}`)
        .join("; ");
      throw new Error(`Generated packet failed schema validation: ${problems}`);
    }

    return {
      packet: parsed.data,
      annotations: message.annotations ?? [],
      validationErrors: validatePacket(
        parsed.data,
        args.today,
        args.inventory,
        message.annotations ?? [],
      ),
      modelRequested: model,
      modelUsed: data.model ?? model,
      requestId: data.id ?? null,
      usage: data.usage ?? {},
      durationMs: Date.now() - started,
    };
  } finally {
    clearTimeout(timer);
  }
}

async function insertEvent(
  db: UntypedDb,
  packetId: string,
  eventType: string,
  actorId: string | null,
  fromStatus: string | null,
  toStatus: string | null,
  details: Record<string, unknown> = {},
) {
  const { error } = await db.from("content_review_packet_events").insert({
    packet_id: packetId,
    event_type: eventType,
    actor_id: actorId,
    from_status: fromStatus,
    to_status: toStatus,
    details,
  });
  if (error) throw new Error(`Could not write content-agent audit event: ${error.message}`);
}

export const adminListContentReviewPackets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ContentReviewRow[]> => {
    const db = await getAdminDb(context.userId);
    const { data, error } = await db
      .from("content_review_packets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) throw new Error(error.message);

    const rows = (data ?? []) as ContentReviewRow[];
    const ids = rows.map((row) => row.id);
    if (!ids.length) return rows;
    const eventsResult = await db
      .from("content_review_packet_events")
      .select("*")
      .in("packet_id", ids)
      .order("created_at", { ascending: true });
    if (eventsResult.error) throw new Error(eventsResult.error.message);
    const byPacket = new Map<string, ContentPacketEvent[]>();
    for (const event of (eventsResult.data ?? []) as ContentPacketEvent[]) {
      const list = byPacket.get(event.packet_id) ?? [];
      list.push(event);
      byPacket.set(event.packet_id, list);
    }
    return rows.map((row) => ({ ...row, events: byPacket.get(row.id) ?? [] }));
  });

export const adminGenerateContentReviewPacket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(generateInput)
  .handler(async ({ data, context }): Promise<ContentReviewRow> => {
    const db = await getAdminDb(context.userId);
    const today = new Date().toISOString().slice(0, 10);
    const topicHint = data.topic_hint?.trim() || null;

    const [{ data: running }, { count, error: countError }] = await Promise.all([
      db
        .from("content_review_packets")
        .select("id")
        .in("status", ["requested", "running"])
        .gte("created_at", new Date(Date.now() - 15 * 60_000).toISOString())
        .limit(1)
        .maybeSingle(),
      db
        .from("content_review_packets")
        .select("id", { count: "exact", head: true })
        .eq("run_date", today),
    ]);
    if (countError) throw new Error(countError.message);
    if (running) throw new Error("A content-agent run is already in progress.");
    if ((count ?? 0) >= dailyLimit()) {
      throw new Error(`Daily content-agent limit reached (${dailyLimit()}).`);
    }

    const modelRequested = readServerEnv(["CONTENT_AGENT_MODEL"]) ?? DEFAULT_MODEL;
    const runKey = `${today}:manual:${crypto.randomUUID()}`;
    const { data: created, error: createError } = await db
      .from("content_review_packets")
      .insert({
        run_key: runKey,
        run_date: today,
        status: "requested",
        topic_hint: topicHint,
        requested_by: context.userId,
        model_requested: modelRequested,
        prompt_version: PROMPT_VERSION,
      })
      .select("*")
      .single();
    if (createError || !created) throw new Error(createError?.message ?? "Could not create run.");

    await insertEvent(db, created.id, "requested", context.userId, null, "requested", {
      topic_hint_present: Boolean(topicHint),
      prompt_version: PROMPT_VERSION,
    });
    const startedAt = new Date().toISOString();
    const startUpdate = await db
      .from("content_review_packets")
      .update({ status: "running", started_at: startedAt })
      .eq("id", created.id);
    if (startUpdate.error) throw new Error(startUpdate.error.message);
    await insertEvent(db, created.id, "started", context.userId, "requested", "running");

    try {
      const inventory = await loadInventory(db);
      const result = await callContentAgent({ inventory, topicHint, today });
      const finishedAt = new Date().toISOString();
      const { data: updated, error: updateError } = await db
        .from("content_review_packets")
        .update({
          status: "review",
          decision: result.packet.decision,
          cluster: result.packet.cluster,
          primary_query: result.packet.primary_query,
          reader_outcome: result.packet.reader_outcome,
          primary_url: result.packet.primary_url,
          packet: result.packet,
          source_annotations: result.annotations,
          validation_errors: result.validationErrors,
          model_used: result.modelUsed,
          provider_request_id: result.requestId,
          usage: result.usage,
          duration_ms: result.durationMs,
          finished_at: finishedAt,
          failure_code: null,
          failure_message: null,
        })
        .eq("id", created.id)
        .select("*")
        .single();
      if (updateError || !updated)
        throw new Error(updateError?.message ?? "Could not save packet.");
      await insertEvent(db, created.id, "generated", context.userId, "running", "review", {
        model: result.modelUsed,
        source_count: result.packet.sources.length,
        validation_error_count: result.validationErrors.length,
        usage: result.usage,
      });
      return updated as ContentReviewRow;
    } catch (error) {
      const failureMessage =
        error instanceof Error ? error.message.slice(0, 4_000) : "Unknown error";
      const failureCode =
        error instanceof DOMException && error.name === "AbortError"
          ? "timeout"
          : "generation_failed";
      const finishedAt = new Date().toISOString();
      await db
        .from("content_review_packets")
        .update({
          status: "failed",
          failure_code: failureCode,
          failure_message: failureMessage,
          finished_at: finishedAt,
        })
        .eq("id", created.id);
      await insertEvent(db, created.id, "failed", context.userId, "running", "failed", {
        code: failureCode,
        message: failureMessage,
      });
      throw new Error(`Content-agent run failed: ${failureMessage}`);
    }
  });

export const adminReviewContentPacket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(reviewInput)
  .handler(async ({ data, context }): Promise<ContentReviewRow> => {
    const db = await getAdminDb(context.userId);
    const { data: current, error: currentError } = await db
      .from("content_review_packets")
      .select("*")
      .eq("id", data.id)
      .single();
    if (currentError || !current) throw new Error(currentError?.message ?? "Packet not found.");
    if (!["review", "approved", "rejected"].includes(current.status)) {
      throw new Error("Only generated review packets can be reviewed.");
    }

    const reviewed = data.status !== "review";
    const patch = {
      status: data.status,
      review_notes: data.notes?.trim() || null,
      reviewed_by: reviewed ? context.userId : null,
      reviewed_at: reviewed ? new Date().toISOString() : null,
    };
    const { data: updated, error: updateError } = await db
      .from("content_review_packets")
      .update(patch)
      .eq("id", data.id)
      .select("*")
      .single();
    if (updateError || !updated)
      throw new Error(updateError?.message ?? "Could not review packet.");

    const eventType = data.status === "review" ? "reopened" : data.status;
    await insertEvent(db, data.id, eventType, context.userId, current.status, data.status, {
      notes_present: Boolean(data.notes?.trim()),
      publication_performed: false,
    });
    return updated as ContentReviewRow;
  });
