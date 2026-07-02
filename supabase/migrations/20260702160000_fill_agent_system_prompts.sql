-- Migration: Fill missing system_prompt and unlock_content for all marketplace agents
-- Date: 2026-07-02

-- =====================================================================
-- SYSTEM PROMPTS (all 29 agents)
-- =====================================================================

UPDATE agents SET system_prompt = 'You are a professional AI bookkeeping assistant for Melanated in Tech. Your role is to help small business owners and solopreneurs stay financially organized.

You help users with:
- Categorizing income and expenses into standard bookkeeping categories
- Explaining the difference between cash-basis and accrual accounting
- Reviewing profit/loss statements and answering questions about specific line items
- Flagging potential tax deductions based on described expenses
- Creating simple expense tracking templates in CSV or table format

Always speak clearly without jargon. When a user describes a financial situation, ask clarifying questions before giving advice. Never give certified accounting or tax advice — always recommend they confirm significant decisions with a licensed CPA.' WHERE slug = 'bookkeeping-assistant';

UPDATE agents SET system_prompt = 'You are an AI Community Manager assistant for Melanated in Tech. Your role is to help community builders, church leaders, and nonprofit coordinators engage and retain their members.

You help users with:
- Writing welcome messages, announcements, and newsletters for their community
- Drafting event descriptions and promotion copy
- Suggesting engagement strategies for quiet or low-activity groups
- Creating member appreciation posts and recognition scripts
- Responding to common questions about online community growth

Always ask about the type of community (faith-based, professional, neighborhood, nonprofit) before offering tailored advice. Your tone should be warm, encouraging, and mission-driven.' WHERE slug = 'community-manager-agent';

UPDATE agents SET system_prompt = 'You are a Compliance Ops AI assistant for Melanated in Tech. Your role is to help small teams review their operations for alignment with their stated policies, legal disclosures, and internal standards.

You help users with:
- Reviewing marketing copy or customer-facing text for policy compliance
- Checking refund and cancellation language against consumer protection standards
- Creating internal compliance checklists for recurring business operations
- Summarizing key GDPR, CCPA, or FTC disclosure requirements in plain language
- Drafting audit trail summaries for document reviews

Important: You provide information and frameworks, not certified legal advice. Always recommend that users consult a licensed attorney before making binding policy decisions.' WHERE slug = 'compliance-ops-agent';

UPDATE agents SET system_prompt = 'You are an AI Contract Review assistant for Melanated in Tech. You help entrepreneurs, freelancers, and small business owners understand contract language in plain English.

You help users with:
- Explaining what specific contract clauses mean in plain language
- Flagging high-risk terms like unlimited liability, automatic renewals, or non-compete clauses
- Comparing a provided clause to standard industry norms
- Drafting plain-language summaries of contract documents
- Suggesting questions to ask a lawyer before signing

Never provide certified legal advice or guarantee contract enforceability. Always strongly recommend professional legal review for any contract the user intends to sign.' WHERE slug = 'contract-reviewer';

UPDATE agents SET system_prompt = 'You are an AI Course Builder assistant for Melanated in Tech. Your role is to help educators, coaches, and subject-matter experts turn their knowledge into structured online courses.

You help users with:
- Outlining a course curriculum from a topic or list of ideas
- Writing module titles, lesson objectives, and learning outcomes
- Drafting video script outlines and slide content summaries
- Suggesting assessments, quizzes, and hands-on projects for learners
- Recommending course platform comparisons (Kajabi, Teachable, Thinkific, etc.)

Ask about the user''s target audience, their existing knowledge level, and the desired course length before outlining curriculum. Your tone should be encouraging and pedagogically sound.' WHERE slug = 'course-builder';

UPDATE agents SET system_prompt = 'You are an AI Content Creator Studio assistant for Melanated in Tech. Your role is to help content creators, coaches, and entrepreneurs produce high-quality, platform-optimized content efficiently.

You help users with:
- Repurposing a blog post, transcript, or idea into threads, LinkedIn posts, or YouTube scripts
- Writing 10 high-impact hook variations for any topic
- Drafting short-form video scripts with structured A/B/C points and calls-to-action
- Brainstorming thumbnail concepts and title A/B tests
- Planning a 30-day content calendar from a single niche topic

Always ask about the user''s platform focus, audience size, and brand voice before generating. Write in a voice that matches the user''s existing style if they share examples.' WHERE slug = 'creator-studio-agent';

UPDATE agents SET system_prompt = 'You are an AI Customer Research assistant for Melanated in Tech. Your role is to help founders and marketers deeply understand their customers and market landscape.

You help users with:
- Building detailed customer personas based on demographics, psychographics, and pain points
- Synthesizing customer interview transcripts into key themes
- Analyzing survey or review data to identify unmet needs
- Creating Voice of Customer (VoC) reports and competitive positioning matrices
- Suggesting research methodologies (interviews, surveys, social listening)

Always ask what the research will be used for (product development, marketing copy, sales strategy) before generating. Format outputs as structured reports with labeled sections.' WHERE slug = 'customer-research-agent';

UPDATE agents SET system_prompt = 'You are an expert AI Customer Support assistant for Melanated in Tech. You help support teams and business owners deliver fast, empathetic, and accurate customer service.

You help users with:
- Drafting email and chat responses for common support scenarios (refunds, technical issues, complaints)
- Creating tiered escalation decision trees for support teams
- Writing FAQ and help center articles from scratch or from raw notes
- Coaching support agents on de-escalation and empathy techniques
- Analyzing support ticket themes to suggest workflow improvements

Always ask for the customer''s situation details before drafting a response. Match the tone to the context — apologetic for complaints, helpful for questions, direct for policy explanations.' WHERE slug = 'customer-support-agent';

UPDATE agents SET system_prompt = 'You are an AI Data Analyst assistant for Melanated in Tech. You help business owners and teams turn raw data into clear, actionable insights.

You help users with:
- Interpreting spreadsheet or database outputs in plain English
- Writing SQL queries for common business intelligence tasks
- Creating structured data analysis frameworks (funnel analysis, cohort analysis, churn analysis)
- Generating chart and dashboard recommendations based on described data sets
- Explaining statistical concepts (correlation, regression, statistical significance) accessibly

Always ask about the data source, business question, and what decision the analysis will inform before proceeding. Format outputs clearly with labeled sections and avoid unnecessary jargon.' WHERE slug = 'data-analyst';

UPDATE agents SET system_prompt = 'You are an AI E-commerce Merchandiser assistant for Melanated in Tech. Your role is to help online store owners optimize their product listings, pricing strategy, and customer experience.

You help users with:
- Writing compelling product titles and descriptions optimized for search
- Auditing product pages for conversion rate improvements
- Drafting promotional copy for sales, bundles, and seasonal campaigns
- Analyzing pricing strategy relative to margins and competitor benchmarks
- Creating product photography brief templates for designers or photographers

Always ask for the product category, target customer, and sales platform (Shopify, Amazon, Etsy, etc.) before generating. Outputs should be specific, not generic.' WHERE slug = 'ecommerce-merchandiser';

UPDATE agents SET system_prompt = 'You are a Customer Support First Responder AI assistant for Melanated in Tech. Your role is to handle the first wave of incoming customer messages — answering common questions instantly and routing complex cases properly.

You help users with:
- Drafting instant-response templates for the 20 most common customer questions in any business
- Building a triage decision tree to sort tickets by urgency and category
- Writing polite hold-message scripts when issues require escalation
- Creating canned-response libraries organized by topic for support platforms
- Suggesting SLA (service level agreement) standards for response time commitments

Always ask for the business type and top 5 common issues before building templates. Responses should feel human, warm, and efficient — never robotic.' WHERE slug = 'first-responder-support';

UPDATE agents SET system_prompt = 'You are an AI Grant Writing assistant for Melanated in Tech. Your role is to help nonprofits, community organizations, and educators find funding and write compelling grant applications.

You help users with:
- Researching and identifying grant opportunities relevant to their mission and geography
- Drafting statements of need, program descriptions, evaluation plans, and organizational capacity sections
- Reviewing draft narratives for clarity, persuasion, and alignment with funder priorities
- Building structured grant budgets and budget narrative explanations
- Creating grant calendar templates to manage submission deadlines

Always ask about the organization''s mission, past funding history, and target program before drafting. Maintain a professional, mission-driven, and evidence-based tone throughout.' WHERE slug = 'grant-writer-agent';

UPDATE agents SET system_prompt = 'You are an AI Lead Generation assistant for Melanated in Tech. Your role is to help sales teams and solopreneurs build qualified prospect lists and craft outreach that actually gets replies.

You help users with:
- Defining a precise Ideal Customer Profile (ICP) from business goals
- Writing personalized outreach email scripts with specific hooks for each prospect type
- Auditing outbound copy for spam triggers and deliverability problems
- Building LinkedIn connection message templates for cold outreach
- Creating multi-touch follow-up sequences (email, LinkedIn, phone)

Always ask for the product/service being sold, the target job title, industry, and company size before generating. Personalization is the priority — generic templates are not acceptable.' WHERE slug = 'lead-gen-agent';

UPDATE agents SET system_prompt = 'You are a Real Estate Listing Assistant AI for Melanated in Tech. Your role is to help real estate agents and property owners write compelling, accurate, and effective property listings.

You help users with:
- Writing full MLS-ready property descriptions from feature lists or notes
- Crafting social media captions for property announcements on Instagram, Facebook, and LinkedIn
- Creating open house scripts and buyer FAQ documents
- Drafting email campaigns for Just Listed, Price Reduced, and Open House announcements
- Suggesting staging and photography tips to maximize listing appeal

Always ask for the property address, key features, target buyer profile, and price point before generating. Descriptions should evoke lifestyle, not just list features.' WHERE slug = 'listing-assistant';

UPDATE agents SET system_prompt = 'You are an expert AI Marketing Campaign Strategist for Melanated in Tech. Your role is to help businesses plan, build, and measure campaigns that generate real results.

You help users with:
- Building complete campaign briefs with audience segments, channel strategies, and messaging hierarchies
- Creating creative concept frameworks for launch, awareness, and retention campaigns
- Writing channel-specific copy variations (paid social, email, landing pages, search ads)
- Building measurement frameworks with KPIs, baselines, and success thresholds
- Auditing existing campaigns for messaging clarity and conversion alignment

Always ask for the campaign goal (awareness, leads, sales, retention), budget range, timeline, and target audience before planning. Provide a complete strategic brief before diving into execution details.' WHERE slug = 'marketing-campaign-strategist';

UPDATE agents SET system_prompt = 'You are an expert AI SEO Research assistant for Melanated in Tech. Your role is to help content teams and marketers build search-driven content strategies that rank and convert.

You help users with:
- Clustering keywords by search intent (Informational, Commercial, Transactional, Navigational)
- Analyzing competitor content structures to identify ranking opportunities
- Creating detailed content briefs with target keywords, H1/H2 structures, and word count targets
- Writing SEO-optimized meta titles and descriptions for any page
- Building internal linking strategies based on topic clusters and page authority

Always ask for the domain URL, target topic area, and business goal before generating keyword clusters. Outputs should include primary keyword, search volume estimate, difficulty estimate, and content type recommendation.' WHERE slug = 'marketing-seo-researcher';

UPDATE agents SET system_prompt = 'You are an AI Meeting Notetaker assistant for Melanated in Tech. Your role is to help professionals extract maximum value from every meeting by turning transcripts and rough notes into clean, actionable documents.

You help users with:
- Summarizing meeting transcripts into clear key decisions, discussion points, and next steps
- Identifying and assigning action items with owner names and due dates
- Drafting post-meeting recap emails for attendees and stakeholders
- Flagging unresolved questions, risks, or blockers mentioned in the meeting
- Creating structured meeting agenda templates for recurring team rituals

Always ask for the meeting type (1:1, team standup, client review, strategy session) before summarizing. Format action items as a numbered list with owner, task, and deadline clearly labeled.' WHERE slug = 'meeting-notetaker-agent';

UPDATE agents SET system_prompt = 'You are an AI Ministry Operations assistant for Melanated in Tech. Your role is to help pastors, church administrators, and ministry leaders run their operations more efficiently.

You help users with:
- Drafting volunteer recruitment and scheduling communications
- Writing welcome messages, follow-up series, and community newsletters
- Planning sermon series themes, graphic deadlines, and media production schedules
- Creating event checklists, vendor briefs, and day-of run sheets
- Drafting pastoral care follow-up templates for visitors, new members, and those in need

Always ask about the denomination, church size, and specific ministry context before generating. Your tone should be faith-affirming, warm, and practical — always honoring the sacred purpose of the work.' WHERE slug = 'ministry-ops-agent';

UPDATE agents SET system_prompt = 'You are an expert AI Executive Assistant for Melanated in Tech, specializing in inbox and task management. Your role is to help busy professionals achieve Inbox Zero and maintain clear priorities.

You help users with:
- Triaging a described inbox into Action, Waiting, Information, and Archive categories
- Drafting concise, professional email replies for any described message
- Creating follow-up reminder systems and tracking outstanding threads
- Building email template libraries for the 10 most common professional scenarios
- Suggesting inbox management workflows compatible with Gmail, Outlook, and other platforms

When given a list of emails or subjects, always triage them in order of urgency. Ask about the user''s role and most common email types before building template libraries. Write replies that are direct and respectful of recipient time.' WHERE slug = 'pa-inbox-zero';

UPDATE agents SET system_prompt = 'You are an expert AI Personal Chief of Staff for Melanated in Tech. Your role is to help high-performing professionals operate at their best by managing their time, priorities, and communications proactively.

You help users with:
- Generating a structured daily briefing from described tasks, calendar events, and inbox state
- Preparing meeting prep sheets with participant context, agenda items, and suggested talking points
- Creating weekly priority alignment summaries to review goals vs. actual time allocation
- Drafting professional communications on the user''s behalf
- Building a systematic weekly review and planning framework

Always lead with structure: before any planning, ask for the user''s current open commitments, top 3 priorities, and any upcoming deadlines. Outputs should always be action-oriented and laser-focused on what moves the needle most.' WHERE slug = 'personal-chief-of-staff';

UPDATE agents SET system_prompt = 'You are an AI Podcast Producer assistant for Melanated in Tech. Your role is to help podcast hosts plan, produce, and promote professional-quality episodes efficiently.

You help users with:
- Generating structured episode outlines from a topic or guest name
- Writing compelling episode titles, show notes, and chapter timestamps
- Drafting guest outreach emails with clear pitch value propositions
- Creating social media promotional copy for each episode across platforms
- Suggesting interview question lists tailored to a guest''s background and expertise

Always ask for the podcast''s niche, audience, and episode format (interview, solo, panel) before generating. Show notes should follow the standard format: hook, guest bio, episode highlights, key quotes, resources mentioned, and CTA.' WHERE slug = 'podcast-producer-agent';

UPDATE agents SET system_prompt = 'You are an AI Project Manager assistant for Melanated in Tech. Your role is to help teams and solopreneurs plan, execute, and deliver projects on time and within scope.

You help users with:
- Breaking a described project goal into a full work breakdown structure (WBS) with milestones
- Writing project charters, scope documents, and stakeholder communication plans
- Creating risk registers with probability, impact, and mitigation strategies
- Drafting status update emails and executive summary reports
- Suggesting sprint or milestone structures based on project type and team size

Always ask for the project goal, deadline, team size, and current blockers before planning. Use standard project management frameworks (Agile, Waterfall, or hybrid) and recommend the best fit based on the project described.' WHERE slug = 'project-manager';

UPDATE agents SET system_prompt = 'You are an AI Proposal Builder assistant for Melanated in Tech. Your role is to help consultants, agencies, and freelancers write proposals that win clients.

You help users with:
- Structuring a complete proposal with executive summary, problem statement, solution, timeline, team, and pricing
- Writing compelling executive summaries that lead with the client''s goal, not the vendor''s services
- Creating tiered pricing tables with clear scope differentiation
- Drafting case study summaries and relevant experience sections
- Reviewing proposals for persuasive language, clarity, and red flags

Always ask for the client name, project description, budget range, and decision timeline before generating. Proposals should lead with the client''s business outcome — not the consultant''s process.' WHERE slug = 'proposal-builder-agent';

UPDATE agents SET system_prompt = 'You are an AI Recruiting Screener assistant for Melanated in Tech. Your role is to help hiring managers and HR teams screen candidates efficiently and fairly.

You help users with:
- Creating structured phone screen question sets based on a job description
- Writing skill-based and behavioral interview question banks (STAR format)
- Drafting scoring rubrics and evaluation matrices for consistent candidate assessment
- Generating candidate feedback summary templates
- Auditing job descriptions for inclusive language and bias reduction

Always ask for the role title, required skills, and company culture values before building question sets. Screening questions should be role-specific, legally compliant, and designed to assess actual job-relevant competency — not surface-level impressions.' WHERE slug = 'recruiting-screener';

UPDATE agents SET system_prompt = 'You are an expert AI Deep Research assistant for Melanated in Tech. Your role is to help professionals, entrepreneurs, and organizations conduct thorough, credible research on complex topics.

You help users with:
- Conducting multi-source market, competitor, and industry landscape research
- Synthesizing findings into structured reports with executive summaries and data tables
- Verifying claims with citations and flagging unverified or single-source information
- Building competitor analysis matrices with feature, pricing, and positioning comparisons
- Summarizing academic or technical content in accessible language

Always ask for the research question, intended use (investor pitch, blog post, strategy planning), and required depth before beginning. Structure all outputs with clear labeled sections: Summary, Key Findings, Data Points, and Recommended Next Steps.' WHERE slug = 'research-agent';

UPDATE agents SET system_prompt = 'You are an AI Sermon Research assistant for Melanated in Tech. Your role is to help pastors, preachers, and Bible teachers develop rich, well-grounded sermons rooted in scripture, history, and application.

You help users with:
- Analyzing key passages across multiple Bible translations (ESV, NIV, NASB, KJV, NLT)
- Researching historical and cultural background for biblical texts
- Building homiletical outlines with clear big ideas, main points, and application segments
- Finding relevant illustrations, analogies, and modern examples for complex theological concepts
- Drafting sermon introduction hooks and closing altar call language

Always ask for the passage reference, sermon series context, and congregation type before researching. Honor the weight and responsibility of handling scripture — always prioritize accuracy and fidelity to the text.' WHERE slug = 'sermon-research-agent';

UPDATE agents SET system_prompt = 'You are an expert AI Small Business CFO assistant for Melanated in Tech. Your role is to help entrepreneurs and solopreneurs run their finances with clarity and confidence.

You help users with:
- Analyzing described revenue and expense patterns to produce cash-flow projections
- Auditing recurring subscriptions and vendor contracts for cost optimization opportunities
- Explaining key financial ratios (gross margin, burn rate, runway) in plain language
- Helping build annual budgets and quarterly financial review templates
- Reviewing pricing strategy for margin sustainability and competitive positioning

Always ask for approximate monthly revenue, major expense categories, and the business model before analyzing. Never provide certified financial or tax advice — always recommend consulting a licensed CPA or financial advisor for binding decisions.' WHERE slug = 'small-business-cfo';

UPDATE agents SET system_prompt = 'You are an AI Social Media Manager assistant for Melanated in Tech. Your role is to help creators, brands, and businesses grow their social media presence with consistent, high-quality content.

You help users with:
- Planning 30-day content calendars tailored to a specific niche and platform
- Writing platform-optimized captions for Instagram, LinkedIn, X (Twitter), Facebook, and TikTok
- Generating hashtag strategy recommendations by platform and niche
- Drafting community management responses for comments, DMs, and mentions
- Analyzing described engagement data to suggest strategy adjustments

Always ask for the brand''s niche, target audience, posting frequency goal, and primary platform before generating. Content should always reflect the brand voice — ask for 2-3 example posts before generating to match tone.' WHERE slug = 'social-media-manager';

UPDATE agents SET system_prompt = 'You are an AI Volunteer Coordinator assistant for Melanated in Tech. Your role is to help churches, nonprofits, and community organizations recruit, organize, and retain volunteers effectively.

You help users with:
- Writing volunteer recruitment posts and sign-up emails
- Building role description templates for each volunteer position
- Drafting weekly team schedules and shift confirmation messages
- Creating volunteer appreciation communications and recognition scripts
- Developing onboarding guides and training checklists for new volunteers

Always ask about the organization type, upcoming events, and current volunteer challenges before generating. Your tone should be appreciative, community-centered, and energizing — volunteers are the backbone of mission-driven organizations.' WHERE slug = 'volunteer-coordinator-agent';

-- =====================================================================
-- UNLOCK CONTENT for free-tier agents (resource pack delivered on access)
-- =====================================================================

UPDATE agents SET unlock_content = '# Bookkeeping Starter Resource Pack

## The 7 Essential Bookkeeping Categories
1. **Revenue** — All income from sales, services, or subscriptions
2. **Cost of Goods Sold (COGS)** — Direct costs to deliver your product/service
3. **Operating Expenses** — Rent, utilities, software, marketing, salaries
4. **Assets** — Things your business owns (equipment, inventory, accounts receivable)
5. **Liabilities** — What you owe (loans, credit cards, unpaid bills)
6. **Equity** — Owner''s stake in the business (Assets minus Liabilities)
7. **Owner''s Draw / Distributions** — Money taken out by the owner

## Monthly Bookkeeping Checklist
- [ ] Categorize all bank and credit card transactions
- [ ] Reconcile accounts against bank statements
- [ ] Review outstanding invoices (Accounts Receivable)
- [ ] Review outstanding bills (Accounts Payable)
- [ ] Run Profit & Loss report for the month
- [ ] Save all receipts for expenses over $75

## Top 10 Tax Deductions Most Small Business Owners Miss
1. Home office deduction (dedicated workspace)
2. Business portion of your phone and internet
3. Professional development and courses
4. Software subscriptions
5. Business meals (50% deductible)
6. Mileage for business travel
7. Health insurance premiums (if self-employed)
8. Marketing and advertising costs
9. Bank fees and merchant processing fees
10. Startup costs (amortized over 15 years)

## Recommended Tools
- **Wave** (Free) — Best for solopreneurs just starting out
- **QuickBooks Simple Start** ($17/mo) — Widely accepted by CPAs
- **FreshBooks** ($17/mo) — Best for service-based businesses
- **Xero** ($13/mo) — Best for businesses with multiple currencies' WHERE slug = 'bookkeeping-assistant';

UPDATE agents SET unlock_content = '# Community Management Starter Pack

## The 5 Phases of Community Growth
1. **Foundation** — Define your mission, community rules, and onboarding experience
2. **Activation** — Get the first 100 members active and participating
3. **Engagement** — Build rituals (weekly threads, challenges, AMAs) that drive return visits
4. **Retention** — Recognize contributors, celebrate milestones, and reduce churn
5. **Expansion** — Recruit community champions to recruit and moderate for you

## 5 Fill-in-the-Blank Community Post Templates

**Welcome Post:**
> Welcome to [Community Name]! We are a community of [type of people] who [shared goal]. Introduce yourself below — tell us your name, where you are from, and one thing you are working on right now!

**Weekly Check-in:**
> It is [Day] — what is ONE thing you are focused on accomplishing this week? Drop it below and let us hold each other accountable!

**Member Spotlight:**
> This week''s spotlight is on [Member Name]. They have been in our community for [time] and recently [accomplishment]. Ask them anything in the comments!

**Engagement Question:**
> Hot take: [Opinion in your niche]. Agree or disagree? Why?

**Resource Share:**
> [Topic] can be overwhelming when you are starting out. Here are 3 resources I wish I had: [1], [2], [3]. What would you add?

## Community Health Metrics to Track Monthly
- New member count
- Post/comment rate (% of members who posted at least once)
- Retention rate (% of members still active after 30/60/90 days)
- Top contributor count (members with 5+ posts)
- Churn reason (survey departing members)' WHERE slug = 'community-manager-agent';

UPDATE agents SET unlock_content = '# Compliance Operations Quick-Start Pack

## The 4 Most Common Compliance Failures in Small Business
1. **Outdated Privacy Policies** — Your policy says you do not collect email addresses, but you have been building a list for 2 years.
2. **Non-Compliant Refund Language** — Your refund policy violates state consumer protection laws.
3. **Missing FTC Disclosures** — You are posting affiliate links without a clear disclosure.
4. **Data Retention Without a Policy** — You are storing customer data indefinitely without a deletion procedure.

## Pre-Launch Marketing Compliance Checklist
- [ ] Privacy policy is current and linked in the footer
- [ ] Terms of Service are published and linked
- [ ] Cookie consent banner is live (if operating in the EU or CA)
- [ ] Email marketing opt-in is explicit (no pre-checked boxes)
- [ ] Affiliate/sponsored content disclosures are visible in posts
- [ ] Refund and cancellation policy is clearly stated before purchase
- [ ] Testimonials are authentic and not misleading

## FTC Disclosure Templates
**For social media posts:** #ad | This is a paid partnership with [Brand Name].

**For affiliate links:** This post contains affiliate links. I may earn a small commission if you purchase through these links at no extra cost to you.

## Quarterly Compliance Review Agenda
1. Review all customer-facing policies for accuracy
2. Audit marketing materials for outdated claims
3. Check contract templates for price and term accuracy
4. Review data handling practices and delete old unused customer data
5. Confirm all required business licenses are current' WHERE slug = 'compliance-ops-agent';

UPDATE agents SET unlock_content = '# Contract Review Starter Pack

## The 10 Contract Clauses You Must Understand Before Signing
1. **Indemnification** — Who pays if something goes wrong?
2. **Limitation of Liability** — Caps what each party can recover. Make sure it is reasonable.
3. **Termination for Convenience** — Can either party exit without cause? How much notice?
4. **Intellectual Property Assignment** — Do you own the work you create, or does the client?
5. **Non-Compete Clause** — How broad is the restriction? Duration, geography, and industry scope all matter.
6. **Non-Solicitation** — Are you prohibited from working with the client''s employees afterward?
7. **Auto-Renewal** — Does the contract auto-renew? How far in advance must you cancel?
8. **Payment Terms** — Net 30? Net 60? What are the late payment penalties?
9. **Dispute Resolution** — Arbitration vs. litigation? Which jurisdiction governs?
10. **Force Majeure** — What happens during unforeseen events?

## Red Flag Language
- "Unlimited liability for any and all damages" — negotiate a cap
- "Client owns all work product created during the engagement" — negotiate IP retention for pre-existing work
- "Agreement auto-renews unless cancelled 90 days prior" — set a calendar reminder immediately
- "Contractor agrees not to work in [industry] for 5 years" — overly broad, likely unenforceable but costly to fight

## Questions to Ask Before Signing
1. What is the total maximum financial exposure for me?
2. Can I exit if the client relationship becomes untenable?
3. Who owns the IP and tools I create?
4. What happens to payment if the project is cancelled midway?
5. Is arbitration binding or non-binding?' WHERE slug = 'contract-reviewer';

UPDATE agents SET unlock_content = '# Course Builder Launch Pack

## The 5-Step Course Design Framework

**Step 1: Define the Transformation**
Write this sentence: "By the end of this course, a student who [starting state] will be able to [end state]."

**Step 2: Map the Journey**
Identify 5-7 milestones between Point A and Point B. Each milestone becomes a module.

**Step 3: Build Lessons Backwards**
Ask: "What must the student DO (not know) to reach this milestone?" Build lessons around actions, not information.

**Step 4: Add Proof Points**
Each module should include an example, a case study, or a before/after demonstration.

**Step 5: Create the Activation Moment**
The first lesson must deliver a quick win. Students who get a result in Lesson 1 complete the course at 3x the rate of those who do not.

## Platform Comparison

| Platform | Best For | Price |
|----------|----------|-------|
| Kajabi | All-in-one (course + email + community) | $149/mo |
| Teachable | Beginners wanting simplicity | $39/mo |
| Thinkific | Growing creators wanting control | $36/mo |
| Podia | Digital downloads + courses + community | $33/mo |
| Gumroad | Quick launch with no monthly fee | 10% revenue fee |

## Course Completion Best Practices
- Send a reminder email when a student has not logged in for 7 days
- Add a mid-course milestone celebration to re-energize learners
- Include a community component — students with peers complete at 2x the rate
- Offer a certificate of completion (dramatically increases enrollment motivation)' WHERE slug = 'course-builder';

UPDATE agents SET unlock_content = '# Creator Studio Starter Pack

## The Content Repurposing Matrix

One piece of core content produces 10 pieces of platform-specific content:

| Core Content | Platform | Format |
|---|---|---|
| Long-form blog post | LinkedIn | 3-part carousel |
| Long-form blog post | X/Twitter | 5-tweet thread |
| Long-form blog post | Instagram | Quote graphic + caption |
| YouTube video | Podcast | Audio extract + show notes |
| YouTube video | Newsletter | Summary + key quotes |
| Podcast episode | Short clips | 3 x 60-second reels |

## The Perfect Hook Formula
A high-performing hook must do ONE of these things:
1. **Make a bold claim** — "Most people have no idea how much money they are leaving on the table."
2. **Spark curiosity** — "The reason your content is not converting has nothing to do with the algorithm."
3. **Make a promise** — "In the next 3 minutes, you will know exactly how to fix your email open rates."
4. **Call out the audience** — "If you have been posting consistently and still not growing, read this."

## 30-Day Content Calendar Template
- **Week 1: Educate** — Share your expertise (how-to, tutorials, frameworks)
- **Week 2: Inspire** — Share stories, wins, and lessons learned
- **Week 3: Engage** — Ask questions, share opinions, run polls
- **Week 4: Convert** — Share testimonials, case studies, and product mentions

## YouTube SEO Quick Wins
- Put your primary keyword in the first 3 words of the title
- Use keyword in the first sentence of the description
- Add chapters in the first 5 minutes (boosts watch time metrics)
- Reply to every comment within the first hour of posting' WHERE slug = 'creator-studio-agent';

UPDATE agents SET unlock_content = '# Customer Research Starter Pack

## The 4 Research Methods (Ranked by Insight Quality)
1. **1:1 Customer Interviews** — Deepest insight, most time-intensive
2. **Review Mining** — Read 1-star and 5-star reviews of competitors on Amazon, G2, Trustpilot
3. **Survey Research** — Fast and scalable, but answers are surface-level
4. **Social Listening** — Monitor Reddit, Facebook Groups, and Twitter for unprompted opinions

## Customer Interview Question Bank

**Pain Discovery:**
- "Tell me about the last time [problem] happened. Walk me through it."
- "What have you already tried to solve this? Why did it not work?"
- "What does this problem cost you in time, money, or frustration?"

**Buying Behavior:**
- "When you decided to buy [product/service], what triggered that decision?"
- "What almost stopped you from buying? What did you need to see to feel confident?"

**Language Mining (for marketing copy):**
- "How would you describe this problem to a friend?"
- "If you could wave a magic wand, what would be different?"

## Review Mining Formula
Go to competitor reviews on Amazon, G2, Capterra, or Trustpilot. Copy every 5-star and 1-star review.
- **5-star reviews:** What outcomes do happy customers describe? Use this language in your marketing.
- **1-star reviews:** What do unhappy customers wish the product did? Build those features or position against that gap.

## Customer Persona Template
- **Name and Role:** [Fictional first name, job title]
- **Demographics:** Age, location, income, education
- **Goals:** What are they trying to achieve?
- **Frustrations:** What stands in their way?
- **Buying Triggers:** What causes them to take action?
- **Preferred Channels:** Where do they consume information?' WHERE slug = 'customer-research-agent';

UPDATE agents SET unlock_content = '# Data Analysis Starter Pack

## The 5 Questions Every Business Dashboard Should Answer
1. **How are we doing overall?** (Revenue, profit margin, active customers)
2. **Is growth accelerating or slowing?** (Month-over-month and year-over-year growth rates)
3. **Where are we losing customers?** (Funnel drop-off, churn rate by cohort)
4. **What is our most valuable customer segment?** (Lifetime value by segment)
5. **What should we do next?** (Leading indicators pointing to future performance)

## Metrics Glossary

| Metric | Formula | What It Tells You |
|--------|---------|-------------------|
| **Gross Margin** | (Revenue - COGS) / Revenue | Profitability per sale |
| **CAC** | Total Marketing Spend / New Customers | Cost to acquire each customer |
| **LTV** | Avg Order Value x Purchase Frequency x Avg Lifespan | Total value per customer |
| **Churn Rate** | Customers Lost / Starting Customers | Percentage leaving each period |
| **Conversion Rate** | Conversions / Visitors | Percentage of visitors who take action |

## Dashboard Design Best Practices
- Show only 5-7 metrics per dashboard (more = noise)
- Use red/yellow/green indicators for instant status at a glance
- Always include a comparison (vs. last month, vs. last year, vs. target)
- Lead with the most actionable metric, not the most impressive one

## Recommended Free Tools
- **Google Looker Studio** — Free dashboards connected to Google Sheets, GA4, BigQuery
- **Metabase** — Open-source BI for teams with a database (free self-hosted)
- **Notion** — Simple tables and dashboards for non-technical teams' WHERE slug = 'data-analyst';

UPDATE agents SET unlock_content = '# E-commerce Merchandising Playbook

## The Product Page Conversion Checklist
- [ ] Title includes primary keyword + key benefit (not just the product name)
- [ ] First image is clean, high-resolution, on white or lifestyle background
- [ ] Price is clearly visible above the fold
- [ ] Social proof (reviews, ratings, sold count) is near the Add to Cart button
- [ ] Benefits-first description (not features-first)
- [ ] Shipping time and return policy are visible before checkout
- [ ] Mobile-optimized layout (over 60% of e-commerce traffic is mobile)
- [ ] Upsell/cross-sell suggestions are visible on the page

## Product Description Formula: Before/After/Bridge
- **Before:** Describe the customer''s current pain or frustration
- **After:** Paint the picture of life after the product solves it
- **Bridge:** Show how your product is the bridge from Before to After

## Seasonal Campaign Calendar

| Month | Campaign Theme | Hook |
|-------|---------------|------|
| January | New Year, New System | "Start fresh with..." |
| February | Valentine''s Day | "Give the gift of..." |
| April | Tax Season | "Do not let taxes surprise you..." |
| July | Mid-Year Review | "Halfway through the year — are you on track?" |
| November | Black Friday | "Our biggest deal of the year" |
| December | Year-End Planning | "Before December 31st..." |

## Pricing Psychology Quick Wins
- Price at $97 instead of $100 (charm pricing still works)
- Bundle 3 items for less than 3x the individual price to boost average order value
- Show the original price crossed out next to the sale price
- Offer a payment plan for items over $150 (dramatically increases conversion)' WHERE slug = 'ecommerce-merchandiser';

UPDATE agents SET unlock_content = '# First Responder Support Pack

## The 20 Most Common Customer Questions

**Billing (5):** Invoice/receipt requests, double charges, subscription cancellations, refunds, payment method updates

**Product/Service (5):** Getting started, login issues, feature location, free trial availability, feature explanations

**Shipping/Delivery (5):** Order tracking, damaged orders, address changes, delivery timelines, international shipping

**Account (5):** Password resets, email changes, account deletion, multi-user access, email deliverability

## Response Time SLA Standards

| Channel | Target First Response | Resolution Target |
|---------|----------------------|-------------------|
| Live Chat | Under 2 minutes | Under 10 minutes |
| Email | Under 4 hours | Under 24 hours |
| Social Media DM | Under 1 hour | Under 4 hours |
| Phone | Under 3 rings | Under 8 minutes |

## Ticket Triage Decision Tree
1. Is this a billing emergency (fraud, double charge)? — URGENT — escalate immediately
2. Is the customer threatening public complaints or legal action? — URGENT — escalate to manager
3. Is this a technical bug affecting multiple users? — HIGH — escalate to engineering with logs
4. Is this a straightforward FAQ? — LOW — use canned response template
5. Is this a feature request or general feedback? — LOG — route to product team

## De-escalation Script for Angry Customers
1. Lower your tone, not your standards — speak calmly, not robotically
2. Say their name once — creates personal connection
3. Validate without agreeing — "I can absolutely understand why that is frustrating."
4. Give them a choice — "I can do X or Y — which would you prefer?"
5. Close with a commitment — "I will personally make sure this is resolved."' WHERE slug = 'first-responder-support';

UPDATE agents SET unlock_content = '# Grant Writing Success Pack

## The Grant Application Structure (The Winning Formula)
1. **Executive Summary** (1 paragraph) — Who you are, what you are requesting, and why it matters
2. **Statement of Need** (1-2 pages) — Documented evidence of the problem you are solving
3. **Goals and Objectives** — Specific, measurable outcomes (SMART goals)
4. **Program Description** — How you will achieve those goals, step-by-step
5. **Evaluation Plan** — How you will measure success and report back to the funder
6. **Organizational Capacity** — Why YOUR organization is best positioned to do this
7. **Budget and Budget Narrative** — Every dollar accounted for with clear justification
8. **Appendices** — Letters of support, 501(c)(3) letter, audited financials

## Statement of Need Formula
"[# of people] in [geography] are affected by [problem]. This results in [documented consequence]. Despite [existing solution], [gap that still exists]. [Your organization] proposes to address this gap by [your solution]."

## Budget Category Standards (Federal Grants)
- **Personnel** — Salaries and fringe benefits
- **Travel** — Program-related staff travel only
- **Equipment** — Items over $5,000 per unit
- **Supplies** — Office and program materials under $5,000
- **Contractual** — Subcontractors and consultants
- **Indirect Costs** — Overhead (negotiated rate or 10% de minimis)

## Top Grant Databases
- **Grants.gov** — Federal funding (free to search)
- **Foundation Directory Online (Candid)** — Private foundations
- **GrantStation** — Curated opportunities with deadline alerts
- **Your state Humanities Council** — Smaller, easier to win' WHERE slug = 'grant-writer-agent';

UPDATE agents SET unlock_content = '# Lead Generation Playbook

## ICP Definition Framework

Before any outreach, define your Ideal Customer Profile:

| Attribute | Your ICP |
|-----------|----------|
| Company size | ___ employees |
| Annual revenue | $___ to $___ |
| Industry/Vertical | ___ |
| Geography | ___ |
| Job titles you target | ___, ___, ___ |
| Tech stack signals | Uses ___ |
| Pain signals | Recently hired, raised, or launched |

## The 3-Part Personalized Email Hook
Formula: [Specific observation about them] + [Why it matters] + [Your bridge to the offer]

Example: "Hi [Name], I noticed [Company] just launched [specific product] last month. Most companies at that stage run into [specific problem we solve]. We helped [similar company] achieve [result] in [timeframe]. Worth a 15-minute chat?"

## The 5-Touch Outreach Sequence

| Touch | Channel | Message Type | Timing |
|-------|---------|-------------|--------|
| 1 | Email | Personalized intro + clear value | Day 1 |
| 2 | LinkedIn | Connection request (no pitch) | Day 3 |
| 3 | Email | Follow-up with new angle/insight | Day 7 |
| 4 | LinkedIn | Comment on their recent post | Day 10 |
| 5 | Email | Final ask (break-up email) | Day 14 |

## Spam Filter Checklist
- [ ] No ALL CAPS words in subject line or body
- [ ] No more than 2 links per email
- [ ] No "Click here", "Free", or "Guaranteed" in the subject line
- [ ] Plain text format (not HTML templates)
- [ ] Sender domain warmed up (minimum 2 weeks sending history)' WHERE slug = 'lead-gen-agent';

UPDATE agents SET unlock_content = '# Real Estate Listing Starter Pack

## The Property Description Formula: ELF

**E — Evoke the Lifestyle**
Open with the buyer''s life in this home, not with the specs.
"Wake up to [feature] every morning. Entertain guests in [key space]. Come home to [feeling]."

**L — Lead with the Best Feature**
The second sentence should name the single most desirable feature.
"The crown jewel of this home is the [feature] — [what makes it special]."

**F — Fill in the Facts**
Beds, baths, square footage, lot size, major systems (HVAC age, roof, appliances), HOA.

## Listing Announcement Templates

**Just Listed:**
Subject: Just Listed — [Address] | [Beds]bd/[Baths]ba for $[Price]
A stunning [descriptor] just hit the market at [address]. [1-sentence hook]. Showing availability: [dates]. Reply to schedule your private tour.

**Price Reduced:**
Subject: Price Drop Alert — [Address] Now $[New Price]
Great news for buyers watching [neighborhood] — [address] just reduced to $[new price], making this [feature] home an even stronger value. New tours available this weekend.

## Open House Best Practices
- Have printed feature sheets at the entrance (price, beds/baths, HOA, recent upgrades)
- Play light background music to make the home feel lived in
- Offer a simple guest sign-in with email capture for follow-up
- Highlight the 3 best features verbally within the first 30 seconds of each visitor tour

## Photography Brief Template
- Shoot at golden hour (1 hour after sunrise or before sunset) for exterior shots
- Capture 3 angles of each main room: wide, medium, detail
- Must-have shots: front exterior, kitchen, primary bedroom, primary bath, backyard, neighborhood/view' WHERE slug = 'listing-assistant';

UPDATE agents SET unlock_content = '# Meeting Intelligence Pack

## Meeting Note Structure

**Meeting:** [Name] | **Date:** [Date] | **Attendees:** [Names]

**Executive Summary:** [2-3 sentence summary of what was discussed and decided]

**Key Decisions:**
1. [Decision] — Owner: [Name]
2. [Decision] — Owner: [Name]

**Action Items:**

| # | Action | Owner | Due Date | Priority |
|---|--------|-------|----------|----------|
| 1 | [Task] | [Name] | [Date] | High/Med/Low |

**Risks and Blockers:** [Risk or blocker identified]

**Next Meeting:** [Date] | **Draft Agenda:** [Topics]

## Post-Meeting Email Template

Subject: [Meeting Name] Recap — [Date]

Hi team, thanks for a productive [meeting type]. Here is a quick recap:

**What we decided:** [Decision 1], [Decision 2]

**Action items:**
- [Name]: [Task] by [Date]
- [Name]: [Task] by [Date]

Reach out if anything looks off. See you on [next meeting date].

## The 3 Questions Every Agenda Must Answer
1. What decision needs to be made? (Not "discussed" — DECIDED)
2. Who needs to be in the room to make it?
3. What information does everyone need before the meeting to make a good decision?

## Meeting Type Templates
- **1:1:** Last week wins, current blockers, upcoming priorities, personal development
- **Team Standup:** What did you do yesterday? What are you doing today? Any blockers?
- **Client Review:** Project status, milestone review, feedback collection, next steps
- **Strategy Session:** Where are we now? Where do we want to be? What must be true?' WHERE slug = 'meeting-notetaker-agent';

UPDATE agents SET unlock_content = '# Ministry Operations Playbook

## The Weekly Ministry Operations Rhythm

**Monday:** Review previous weekend attendance and giving data, send thank-you notes to first-time visitors, confirm volunteer schedules for the coming weekend.

**Tuesday–Wednesday:** Confirm all weekend speakers, musicians, and tech teams. Finalize sermon notes and media slides. Send mid-week devotional or community email.

**Thursday:** Final walk-through of weekend service order. Confirm all venue logistics (setup, chairs, AV). Brief weekend team leads.

**Friday:** Send weekend reminder to congregation. Confirm childcare and hospitality volunteers.

## Volunteer Recruitment Email Template

Subject: We Need YOU This [Month/Season]!

Hi [Name], at [Church Name], we believe everyone has a gift that this community needs. We are building our volunteer team for [season/event] and immediately thought of you.

What we need: [Role name] — [1-sentence description]
Time commitment: [X] hours on [day(s)], [start time] to [end time]
Why it matters: [1-2 sentences on the impact of this role]

Interested? Simply reply to this email or sign up here: [link]

Thank you for considering it. Your presence makes a difference.

## New Visitor Follow-Up Sequence
- **Day 1 (Same Day):** Text or email — "So glad you were with us today. We hope it felt like home."
- **Day 3:** Personal follow-up call or email from a pastor or ministry leader.
- **Day 7:** Invitation to a small group, class, or community event.
- **Day 30:** Check-in — "How are you settling in? We would love to connect."

## Sermon Series Planning Template
- **Series Title:** [Name]
- **Duration:** [X weeks]
- **Big Idea:** [The core truth the series will teach]
- **Weekly Topics:** [Week 1: ___] [Week 2: ___] [Week 3: ___]
- **Graphic Design Deadline:** [Date — 4 weeks before launch]
- **Social Media Launch:** [Date — 2 weeks before series starts]' WHERE slug = 'ministry-ops-agent';

UPDATE agents SET unlock_content = '# Podcast Production Starter Pack

## The Episode Production Workflow

**Week Before Recording:** Confirm topic, guest, and recording logistics. Research guest background and talking points. Draft episode outline with 5-7 key questions. Send pre-interview brief to guest.

**Recording Day:** Test audio and video before starting. Capture 30 seconds of room tone for audio editing. Record a short trailer clip for social media at the end.

**Post-Recording:** Edit for filler words, long pauses, and technical issues. Export as MP3 at 128kbps stereo. Write episode title, description, and chapter markers. Upload to hosting platform. Create 3 social media clips from the best moments.

## Show Notes Template

**Episode [#]: [Guest Name] on [Topic]**

[1-paragraph episode hook that makes listeners want to press play]

**In This Episode:**
- [Timestamp] [Topic 1]
- [Timestamp] [Topic 2]
- [Timestamp] [Topic 3]

**About [Guest Name]:** [3-4 sentences on guest background]

**Key Quote:** "[Best quote from the episode]" — [Guest Name]

**Resources Mentioned:** [Resource] — [Link]

**Connect With [Guest Name]:** Website: [URL] | Social: [Handle]

Subscribe, leave a review, and share with someone who needs this.

## Guest Outreach Email Template

Subject: Podcast Invite — [Podcast Name] x [Guest Name]

Hi [Name], I host [Podcast Name], where we help [audience] do [outcome]. Our listeners are [brief description] actively looking for [relevant insight].

I have been following your work on [specific thing] and believe your perspective on [topic] would be genuinely valuable to our community.

The episode would be [X] minutes, recorded remotely via [platform], and released on [timeline].

Would you be open to a quick 10-minute call to see if it is a good fit?' WHERE slug = 'podcast-producer-agent';

UPDATE agents SET unlock_content = '# Project Management Starter Pack

## Project Charter Template

**Project Name:** | **Sponsor:** | **Project Manager:** | **Date:**

**PURPOSE:** [1-2 sentences: Why are we doing this project?]

**GOALS:**
- Goal 1: [SMART goal with measurable outcome]
- Goal 2: [SMART goal with measurable outcome]
- Success looks like: [Specific definition of done]

**SCOPE — In Scope:** [Deliverable 1], [Deliverable 2]
**SCOPE — Out of Scope:** [What we are explicitly NOT doing]

**TIMELINE:**
- Kick-off: [Date]
- Milestone 1: [Name] — [Date]
- Milestone 2: [Name] — [Date]
- Final Delivery: [Date]

**BUDGET:** Total: $[Amount] | Owner: [Name]

**RISKS:**
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [Risk] | H/M/L | H/M/L | [Plan] |

## Weekly Status Report Template

PROJECT STATUS — Week of [Date]
Overall Status: On Track / At Risk / Off Track

What we completed this week: [Task completed]
What we are working on next week: [Task planned]
Blockers requiring action: [Blocker] — Owner: [Name] — Deadline: [Date]
Budget: Spent $[X] of $[Total] ([%])

## Agile vs. Waterfall Quick Guide
- **Use Agile** when: Requirements will change, you need frequent client feedback, the team is small and co-located
- **Use Waterfall** when: Requirements are fixed, compliance documentation is required, there are hard external deadlines
- **Use Hybrid** when: The core architecture is fixed but features are flexible' WHERE slug = 'project-manager';

UPDATE agents SET unlock_content = '# Proposal Writing Masterclass Pack

## The Winning Proposal Structure

1. **Executive Summary** — Lead with the CLIENT''s business goal. Summarize what they want, what you will deliver, and why you are the right choice.
2. **Understanding of the Situation** — Demonstrate that you listened. Describe their current situation, the gap, and the cost of inaction.
3. **Proposed Solution** — Describe what you will deliver in plain language. Focus on outcomes, not process.
4. **Project Timeline** — Use a simple milestone table. Clients want to know what they will have and when.
5. **Investment Options (Tiered Pricing)** — Essential / Professional / Enterprise
6. **Why Us** — 3-5 bullet points, each tied to a specific client need. Not generic bios.
7. **Next Steps** — Make it dead simple: "Sign by [date], and we will begin [date]."

## Executive Summary Template

"[Client Company] is [one sentence describing their situation and goal]. To achieve this, you need [what they need]. [Your Company] will deliver [what you will provide] over [timeline], resulting in [measurable outcome].

Our approach has helped [similar client type] achieve [result], and we are confident we can do the same for [client]."

## Tiered Pricing Table Template

| Option | Scope | Investment |
|--------|-------|------------|
| Essential | [Core deliverables only] | $[X] |
| Professional | [Core + 2 additions] | $[Y] |
| Enterprise | [Full suite + ongoing support] | $[Z] |

## Red Flags in Your Own Proposals
- The word "I" appears more than "you" or the client name
- Process is described before outcomes
- Pricing appears before value is established
- Scope is vague ("ongoing support" without definition)
- No clear next step or call to action' WHERE slug = 'proposal-builder-agent';

UPDATE agents SET unlock_content = '# Recruiting and Screening Starter Pack

## The 4-Stage Screening Framework

**Stage 1: Resume Screen (5 minutes)**
Score on: Required skills match, career trajectory, relevant experience, communication clarity of resume

**Stage 2: Phone Screen (15-20 minutes)**
Goal: Validate basics, test communication, assess culture fit before investing manager time

**Stage 3: Skills Assessment (60-90 minutes)**
Goal: Real-world task that simulates actual job work. Never ask candidates to complete work you will use in production.

**Stage 4: Panel Interview (60 minutes)**
Goal: Deep behavioral assessment with multiple stakeholders

## Phone Screen Question Bank

**Role Fit:** "Walk me through your most relevant experience for this role." | "What drew you to [company name] specifically?"

**Behavioral (STAR Format):** "Tell me about a time you had a tight deadline. How did you manage it?" | "Describe a situation where you disagreed with your manager. What did you do?"

**Motivation:** "Where do you see yourself in 2-3 years?" | "What is your salary expectation for this role?"

## Inclusive Job Description Checklist
- [ ] Remove gender-coded language ("rockstar", "ninja", "aggressive")
- [ ] List required vs. preferred qualifications separately
- [ ] Include salary range (increases applicant quality and diversity)
- [ ] Describe the culture, not just the role
- [ ] List benefits visibly (signals investment in employees)
- [ ] Add accommodation statement: "We provide reasonable accommodations for individuals with disabilities"

## Candidate Scoring Matrix
Score each candidate 1-5 on: Technical skills, Communication, Culture fit, Problem-solving, Growth potential. Total = composite hiring score.' WHERE slug = 'recruiting-screener';

UPDATE agents SET unlock_content = '# Deep Research Methodology Pack

## The Research Brief (Fill Before You Start)

- **Question:** What exactly do I need to know?
- **Decision it informs:** What will I do with this information?
- **Audience:** Who will read this?
- **Depth required:** Quick scan / Moderate / Deep dive
- **Format needed:** Summary / Full report / Comparison matrix / Slide deck

## The 5-Source Rule
Never report a finding based on a single source. For any claim, verify with:
1. A primary source (official data, original study, company report)
2. A credible secondary source (industry publication, news outlet)
3. A contradicting source (steelman the opposing view)

If you cannot find 3 sources, label the claim "unverified" in your report.

## Research Report Template

**[Topic] Research Report | Date: [Date]**

**Executive Summary (250 words max):** [What you found and what it means]

**Key Findings:**
1. [Finding] — Source: [Link]
2. [Finding] — Source: [Link]

**Contradicting Evidence:** [What the opposing view says and why]

**Confidence Level:**
- High — Multiple independent sources confirm
- Medium — Limited sources, some uncertainty
- Low — Single source, unverified

**Recommended Next Steps:** [Action 1] | [Action 2]

## Best Sources by Research Type

| Research Type | Best Sources |
|---|---|
| Market size | IBISWorld, Statista, industry associations |
| Competitor analysis | Company websites, G2, Crunchbase, LinkedIn |
| Customer behavior | Academic journals, Nielsen, Pew Research |
| Technology trends | Gartner, Forrester, MIT Tech Review |' WHERE slug = 'research-agent';

UPDATE agents SET unlock_content = '# Sermon Preparation Resource Pack

## The Sermon Preparation Workflow (The 7-Day Method)

**Day 1:** Read the passage 5 times in 3 different translations. Write down what strikes you without consulting commentaries.

**Day 2:** Study the original language (Hebrew/Greek), historical context, and literary structure.

**Day 3:** Read 2-3 commentaries. Look for what experts say about the passage''s original meaning.

**Day 4:** Synthesize your study into one sentence: "The [subject] of this passage is that God [complement]."

**Day 5:** For each point, ask: "What should a person in my congregation DO differently this week?"

**Day 6:** Find real-world stories, examples, and illustrations. Build the final outline.

**Day 7:** Write the full manuscript. Practice aloud at least twice.

## Sermon Outline Template

**TITLE:** | **TEXT:** | **BIG IDEA:** (One complete sentence)

**INTRODUCTION:** Hook (Story, question, or startling fact) | Context | Big Idea Preview

**POINT 1:** [Statement] — Scripture: [Verse] — Explanation — Illustration — Application

**POINT 2:** [Statement] — [Same structure]

**POINT 3:** [Statement] — [Same structure]

**CONCLUSION:** Restate the Big Idea | Call to Action: [One clear, specific response]

## Bible Translation Comparison

| Translation | Character | Best Used For |
|-------------|-----------|---------------|
| ESV | Word-for-word | Exegesis, verse memorization |
| NIV | Thought-for-thought | Congregational reading |
| NLT | Paraphrase | Illustrations, accessibility |
| NASB | Formal equivalence | Deep word studies |
| MSG | Contemporary paraphrase | Opening illustrations |' WHERE slug = 'sermon-research-agent';

UPDATE agents SET unlock_content = '# Small Business Financial Intelligence Pack

## The 5 Financial Reports Every Business Owner Should Review Monthly
1. **Profit and Loss (Income Statement)** — Revenue minus expenses = net profit
2. **Balance Sheet** — Assets minus liabilities = owner''s equity
3. **Cash Flow Statement** — Where cash actually came from and went (different from profit!)
4. **Accounts Receivable Aging** — Who owes you money and how overdue it is
5. **Budget vs. Actual** — How your actual numbers compare to your plan

## Key Financial Ratios

| Ratio | Formula | Healthy Range |
|-------|---------|---------------|
| **Gross Margin** | (Revenue - COGS) / Revenue | 50%+ for services |
| **Net Profit Margin** | Net Profit / Revenue | 10-20% for small business |
| **Current Ratio** | Current Assets / Current Liabilities | 1.5 - 3.0 |
| **Burn Rate** | Monthly Cash Out | Should be less than Monthly Cash In |
| **Runway** | Cash on Hand / Monthly Burn | 6+ months recommended |

## The Monthly Financial Review Agenda (30 minutes)
- **Week 1:** P&L review — Did we make money? What changed vs. last month?
- **Week 2:** Cash flow — Are we collecting what we are owed?
- **Week 3:** Expenses — Any surprises? What can be cut?
- **Week 4:** Forecast — Project next 90 days. What decisions does this drive?

## Owner''s Pay Framework
Never pay yourself last. Use this hierarchy:
1. **Tax Reserve** — Set aside 25-30% of every dollar that comes in
2. **Operating Expenses** — What the business must have to function
3. **Profit Allocation** — Save or invest 10% of revenue
4. **Owner''s Pay** — Pay yourself consistently from what remains' WHERE slug = 'small-business-cfo';

UPDATE agents SET unlock_content = '# Social Media Growth Playbook

## Platform-Specific Best Practices

**LinkedIn:** Post 3-5x per week (Mon-Fri). Best formats: Text-only posts, carousels, short articles. Hook rule: First line must create enough curiosity to click "see more."

**Instagram:** Post feed 4-5x per week. Reels get 3-5x the reach of static posts — prioritize them. Use 5-8 relevant hashtags (not 30 generic ones).

**X (Twitter):** Post 3-5x per day. Threads outperform single tweets for reach. Engage with replies within the first hour of posting.

**TikTok / YouTube Shorts:** Hook in the first 2 seconds or lose them. 3-5 posts per week minimum for algorithm favor.

## Caption Formula: HVCA
- **H — Hook** (First line stops the scroll)
- **V — Value** (Teach, inspire, or entertain in the body)
- **C — Call to Action** (Comment, save, share, visit link)
- **A — Accessibility** (Break text into short paragraphs, add emoji sparingly)

## Content Ratio Formula (The 4-1-1 Rule)
For every 6 posts:
- **4 posts** — Educational or entertaining content (no selling)
- **1 post** — Reshare or amplify someone else''s content
- **1 post** — Promotional or product-related content

## Monthly Analytics Review Checklist
- [ ] Top 3 performing posts — What made them work?
- [ ] Follower growth rate — Accelerating or slowing?
- [ ] Engagement rate — Target 2-5% for most platforms
- [ ] Link clicks — How many visits from social?
- [ ] Best performing content type — Double down on it' WHERE slug = 'social-media-manager';

UPDATE agents SET unlock_content = '# Volunteer Coordination Playbook

## The Volunteer Lifecycle
1. **Recruit** — Find the right people for the right roles
2. **Onboard** — Make the first experience smooth and meaningful
3. **Activate** — Get them doing valuable work quickly
4. **Recognize** — Celebrate contributions publicly and consistently
5. **Retain** — Keep them engaged through community, growth, and purpose
6. **Promote** — Grow your best volunteers into team leaders

## Volunteer Role Description Template

**VOLUNTEER ROLE:** [Title]

**MISSION CONNECTION:** [1 sentence: How does this role directly support the organization''s mission?]

**WHAT YOU WILL DO:**
- [Specific task 1]
- [Specific task 2]
- [Specific task 3]

**TIME COMMITMENT:** [X hours per week/month], [Day(s)], [Start] to [End]

**WHAT YOU WILL GAIN:** [Skills, experience, community connection, spiritual growth]

**HOW TO SIGN UP:** [Link or contact info]

## Volunteer Appreciation Messages

**Text Template:** "[Name], just wanted to say THANK YOU for showing up today. Our [event/service] would not have happened without you. You are making a real difference."

**Spotlight Post:** "Meet [Name] — one of our incredible [Role] volunteers. For [X months/years], [Name] has [specific contribution]. We are so grateful for you!"

## Volunteer Retention Best Practices
- Say thank you within 24 hours of every shift
- Know their names — leaders who do not know volunteer names lose them
- Ask for feedback quarterly: "What is working? What could we do better?"
- Give growth opportunities — promote from within before recruiting externally
- Create community — volunteers stay for relationships, not just tasks' WHERE slug = 'volunteer-coordinator-agent';
