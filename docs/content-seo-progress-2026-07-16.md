# Content and SEO Progress Checkpoint

**Measured:** July 16, 2026  
**Scope:** Live Supabase content, production URLs, current application source, and the daily content-agent implementation.

## Outcome so far

Melanated In Tech now has a clear four-cluster strategy, a safer public article inventory, three substantial flagship products, and a server-only review queue for evidence-backed content briefs. The system still requires human approval and does not publish or schedule content automatically.

## Live article baseline

| Quality signal | Current result |
|---|---:|
| Published canonical articles | 43 |
| Articles with an assigned author | 43 / 43 |
| Articles with accurate calculated read time | 43 / 43 |
| Articles at least 800 words | 26 / 43 |
| Articles with at least two external references | 10 / 43 |
| Articles with at least three internal links | 10 / 43 |
| Articles with a reusable-artifact signal | 32 / 43 |

These are screening metrics, not automatic publishing rules. A short page can be useful when it fully answers a narrow intent; a long page can still be weak. External links must support actual claims, and internal links must help the reader continue a task.

## Completed in this checkpoint

- Created and secured the Supabase content review queue and append-only audit history.
- Restricted browser access and tightened the service role to the minimum table operations required by the workflow.
- Added a bounded, single-call content generator with strict structured output, daily limits, duplicate-run protection, a 90-second timeout, and human-only editorial approval.
- Migrated research from OpenRouter's deprecated web plugin to the current `openrouter:web_search` server tool.
- Required every proposed source URL to match a returned `url_citation` annotation.
- Added validation for search intent, canonical URL, duplicate intent, inventory-backed internal links, author identity, review interval, factual claim sources, CTA destination, and seven-panel carousel output.
- Added the admin review interface and links from mobile and desktop admin navigation.
- Routed all five published agents through the configured OpenRouter runtime; paid agents no longer depend on a missing direct OpenAI credential.
- Added explicit works-now, external-setup, and human-review sections to every published agent page.
- Replaced capability labels that implied refunds, mailbox access, persistent tracking, campaign publishing, or compliance certification.
- Unpublished the duplicate `choosing-your-first-agent-workflow` database row.
- Added a permanent application redirect from that old URL to `choose-your-first-agent-workflow`.
- Rebuilt the canonical workflow guide as a 1,158-word evidence-backed scorecard with five internal links, eight external source links, a reusable worksheet, and a dated review note.
- Rebuilt `agent-evaluation-golden-set` as an evidence-backed evaluation playbook with a 20-case starter mix, copy-and-use test schema, grading guidance, worked cases, six internal links, eight external links, and a dated review note. The article now makes clear that 20 cases is an illustrative starting point rather than a universal threshold.
- Replaced the misleading `prompt-injection-in-everyday-language` article, which conflated prompt injection with SQL and API injection and included an unsupported incident. The corrected guide covers direct and indirect injection, distinguishes neighboring security concepts, maps the everyday risk path, adds layered defenses, a reusable threat worksheet, a starter test matrix, six internal links, seven external links, and a dated review note.

## Next execution queue

### 1. Deploy and pilot the review workflow

1. Deploy the current Cloudflare build.
2. Verify the fifth duplicate URL returns an exact 301.
3. Sign in as an admin and generate one packet with no topic hint.
4. Confirm the packet includes three to six cited sources, no invented internal URLs, a real author, a matching review date, and no validation errors.
5. Reject the first packet if it fails any gate; improve the prompt or validator before another run.
6. Approve one packet only after manual source review. Confirm approval does not publish anything.

### 2. Refresh the next priority article group

Work in clusters, not isolated posts. The next pages with the largest depth, sourcing, and linking gaps are:

1. `human-in-the-loop-patterns-for-agents`
2. `agent-operating-system-for-small-teams`
3. `local-ai-with-ollama`
4. `rag-for-agents`
5. `agent-logs-what-to-capture-before-breaks`
6. `agent-memory-explained`

Each refresh must add a direct answer, current primary references, at least three useful internal links, a worked example or reusable artifact, limitations, and a dated review note.

### 3. Verify the corrected agent runtime after deployment

All five active agent descriptions now name the current browser behavior, external setup, and human-review boundary. After deployment, verify the runtime path itself:

1. Run the free `compliance-ops-agent` as an anonymous visitor and confirm it uses the OpenRouter free router.
2. Confirm an unentitled account cannot run a premium agent.
3. Run one paid-agent chat from an entitled account and confirm the OpenRouter `openai/gpt-4o-mini` model responds.
4. Confirm the response does not claim it performed an external action.

### 4. Reduce catalog trust debt

The catalog contains 78 active published products. The three flagship systems now have substantial delivery content, but many smaller paid listings still do not name format, license, prerequisites, support boundary, or setup time. Review paid products in this order:

1. Sensitive-industry kits: legal, compliance, hiring, donor relations, health and dental.
2. Products priced at $49-$59.
3. Integration and MCP guides that may depend on current external setup.
4. Thin products whose delivery content is under 500 characters.

Do not mass-hide products based only on string-length heuristics. Compare every listing with what the buyer actually receives, then improve it, mark it coming soon, reprice it, or unpublish it.

### 5. Add durable freshness data

The public article table currently relies on `updated_at`. Add explicit editorial fields after the pilot:

- `reviewed_at`
- `review_due_at`
- `review_interval_days`
- `primary_query`
- `canonical_slug`
- `content_cluster`

Use these fields for visible review dates, schema inputs, the refresh queue, and overdue-content reporting.

### 6. Schedule only after the quality gate

Daily scheduling remains disabled. Enable one weekday run only after:

- one real packet passes all automatic validators;
- a human verifies every cited source;
- approval is proven not to publish;
- errors are visible in the admin queue;
- the daily limit and duplicate-run guard are tested;
- expected OpenRouter cost is documented.

## Thirty-day operating plan

### Week 1

- Deploy, verify redirects, and run the controlled packet pilot.
- Refresh two priority articles.
- Verify free, blocked-premium, and entitled-premium agent chat behavior.

### Week 2

- Refresh two safety/evaluation articles.
- Review the first five sensitive-industry product listings against actual fulfillment.
- Add explicit review-date fields and admin visibility.

### Week 3

- Refresh two small-business articles.
- Build the first cluster navigation block across articles, products, agents, and paths.
- Create one free lead magnet from an approved knowledge asset.

### Week 4

- Refresh two beginners or ministry/nonprofit articles.
- Compare search and conversion behavior by cluster.
- If the pilot remains reliable, schedule one weekday review packet and retain human approval.

## Current external references

- [OpenRouter web-search server tool](https://openrouter.ai/docs/guides/features/server-tools/web-search)
- [OpenRouter structured outputs](https://openrouter.ai/docs/guides/features/structured-outputs)
- [OpenAI practical guide to building agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)
- [OpenAI evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices)
- [Anthropic evaluation design guidance](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
- [NIST AI RMF Measure Playbook](https://airc.nist.gov/airmf-resources/playbook/measure/)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
- [OWASP LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)
- [OWASP LLM Prompt Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html)
- [OWASP Agentic AI threats and mitigations](https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/)
