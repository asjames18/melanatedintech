# Daily AI Education and SEO Agent Specification

## Purpose

Prepare one evidence-backed knowledge asset or refresh recommendation per workday for Melanated In Tech. The system creates a review packet; it does not automatically publish factual, sensitive, or commercial content.

## Implementation status (July 16, 2026)

- The production Supabase review queue and append-only event history are live.
- The application generator uses one bounded OpenRouter call with strict JSON output.
- Current research uses the `openrouter:web_search` server tool with six total results, an official-source domain allowlist, and stored `url_citation` annotations.
- A source is not considered verified unless its URL appears in the returned search annotations.
- Anonymous and ordinary authenticated browser roles have no direct queue access. Server functions verify an admin before using the service role.
- Approval changes editorial state only. Publishing and scheduling remain separate, manual actions.

## Daily output

The agent produces one structured packet containing:

1. Recommended topic and authority cluster.
2. Reader problem and primary search intent.
3. Why the topic should be created, refreshed, consolidated, or rejected.
4. Three to six primary sources with checked dates.
5. Direct 40–60 word answer.
6. Article outline and worked-example plan.
7. Claims table with evidence and confidence.
8. Safety and human-review flags.
9. Internal-link recommendations.
10. SEO title, description, slug, canonical, author, review interval, and exact review date.
11. Newsletter section and platform-specific text adaptations.
12. Product or lead-magnet opportunity, if there is a natural fit.

## Required inputs

- Four authority clusters and their primary URLs.
- Existing article, agent, product, path, tool, and niche-page inventory.
- Content audit dispositions and redirect map.
- Brand voice and prohibited claims.
- Current primary-source allowlist.
- Current author inventory.
- Search Console query/page data when available.
- Analytics events and conversion performance.
- Content review dates and broken-link reports.

## Workflow

### 1. Research

Collect candidate topics from:

- Primary AI vendor and open-source project documentation.
- Search Console queries and high-impression/low-click pages.
- Reader questions, Fit Finder results, product support, and community prompts.
- Pages approaching their review date.
- Broken links, changed model availability, pricing changes, or deprecated APIs.

Reject a news item when it lacks practical value for the target audience or does not connect to an authority cluster.

### 2. Intent and cannibalization check

For each candidate:

- Identify the exact reader question.
- Search the MIT inventory for a page already serving that intent.
- Prefer refreshing or consolidating an existing URL.
- Create a new URL only when the intent and reader outcome are meaningfully distinct.

### 3. Evidence collection

- Prefer official documentation, original research, and first-party product pages.
- Record source title, URL, publisher, publication/update date, and checked date.
- Mark facts that could not be verified.
- Never invent a statistic, quotation, customer result, integration, or product capability.
- Treat vendor marketing claims as vendor claims, not independent facts.

### 4. Draft packet

Create the brief using `docs/seo-content-brief-template.md`. Keep the direct answer self-contained. Include a worked example, reusable artifact, or test plan.

### 5. Claim audit

For every sentence containing a number, superlative, guarantee, price, model name, API behavior, regulation, security instruction, or performance claim:

- Attach evidence.
- Label an assumption or example explicitly.
- Identify the review date.
- Remove the claim if evidence is insufficient and it is not necessary.

### 6. SEO audit

Check:

- One primary intent and one canonical URL.
- Unique title/H1 and descriptive meta description.
- Direct answer and question-led headings.
- Useful internal links across the cluster.
- Named author and freshness signals.
- Correct schema inputs.
- Index/noindex decision.
- No conflict with an existing primary URL.

### 7. Human approval

Human review is mandatory for:

- Publishing or scheduling.
- Legal, financial, compliance, hiring, security, privacy, health, ministry, or political claims.
- Prices, guarantees, comparisons, and claims about MIT products or integrations.
- Redirecting, unpublishing, or materially changing a ranking URL.
- Affiliate or sponsored recommendations.

### 8. Distribution packet

After article approval, create:

- One newsletter section linking to the article.
- One LinkedIn post.
- One short X post or thread.
- One Facebook post.
- One seven-panel carousel script.
- One reusable prompt, checklist, or action step.

Adapt the idea to each platform; do not repeat identical copy everywhere.

## Output schema

```json
{
  "decision": "refresh | consolidate | create | reject",
  "decision_reason": "string",
  "cluster": "beginners | small-business | safety-evaluation | churches-nonprofits",
  "primary_query": "string",
  "reader_outcome": "string",
  "primary_url": "string",
  "merge_urls": [],
  "sources": [
    {
      "title": "string",
      "url": "string",
      "publisher": "string",
      "updated_at": "YYYY-MM-DD or unknown",
      "checked_at": "YYYY-MM-DD",
      "primary": true
    }
  ],
  "direct_answer": "40-60 words",
  "outline": [],
  "worked_example": "string",
  "claims": [
    {
      "claim": "string",
      "source_url": "string or null",
      "kind": "fact | example | assumption | opinion",
      "confidence": "high | medium | low",
      "human_review": true
    }
  ],
  "internal_links": [],
  "safety_flags": [],
  "seo": {
    "title": "string",
    "description": "string",
    "slug": "string",
    "canonical": "string",
    "index": true,
    "author_name": "string",
    "author_slug": "string",
    "review_interval_days": 60,
    "review_by": "YYYY-MM-DD"
  },
  "cta": {
    "label": "string",
    "url": "string"
  },
  "product_opportunity": {
    "action": "none | lead-magnet | product",
    "name": "string",
    "rationale": "string",
    "target_url": "string or null"
  },
  "distribution": {
    "newsletter": "string",
    "linkedin": "string",
    "x": "string",
    "facebook": "string",
    "carousel_panels": ["exactly seven strings"]
  }
}
```

## Automatic rejection rules

Reject or send to human review without drafting when:

- The topic is outside the four authority clusters.
- The only angle is a vendor announcement with no practical reader action.
- An existing page already satisfies the intent and no refresh is needed.
- Primary sources are unavailable for a time-sensitive technical claim.
- The proposed content depends on a guarantee or fabricated social proof.
- The CTA points to a product that does not meet the paid-product quality gate.

## Operating cadence

### Daily

- Generate one review packet.
- Flag urgent freshness issues separately.
- Never publish automatically.

### Weekly

- Human selects one packet for publication or refresh.
- Refresh one aging technical page.
- Review one product page against its actual fulfillment.
- Record accepted/rejected topics to improve future selection.

### Monthly

- Import Search Console and conversion data.
- Test 20 tracked questions across Google, ChatGPT search, and Perplexity.
- Review citation sources and competitors.
- Update model/tool source allowlist.
- Review automation errors and unsupported-claim catches.

## Success criteria

- Fewer duplicate-intent drafts.
- Every published claim has evidence or an explicit example/assumption label.
- Every technical page has a review date.
- Every new article supports an authority cluster and useful next step.
- Search visibility, email conversion, and product trust improve without increasing correction, refund, or complaint rates.
