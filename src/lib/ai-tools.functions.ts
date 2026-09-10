import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  AI_TOOLS,
  type AiTool,
  getAiTool,
  searchAiToolsQuery,
  type AiSearchFilters,
} from "./ai-tools-data";

// ----------------------------------------------------------------------
// LEAD QUALIFICATION SCORING SCHEMA
// ----------------------------------------------------------------------
export const qualificationTierSchema = z.enum([
  "low_priority",
  "qualified",
  "high_priority",
  "enterprise_opportunity",
]);

export const aiLeadInputSchema = z.object({
  contact_name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional(),
  company_name: z.string().trim().max(150).optional(),
  organization_type: z.string().trim().min(2).max(80),
  company_size: z.string().trim().min(1).max(50),
  industry: z.string().trim().min(2).max(100),
  problem_statement: z.string().trim().min(5).max(2000),
  current_systems: z.string().trim().max(500).optional(),
  monthly_software_budget: z.string().trim().max(50).optional(),
  implementation_budget: z.string().trim().min(1).max(50),
  timeline: z.string().trim().min(1).max(50),
  technical_skill_level: z.string().trim().max(50).optional(),
  architecture_preference: z.string().trim().max(50).optional(),
  compliance_requirements: z.array(z.string()).default([]),
  recommended_stack: z.record(z.unknown()).default({}),
  consent: z.literal(true),
  source: z.string().trim().max(80).optional(),
  campaign: z.string().trim().max(120).optional(),
  landing_path: z.string().trim().max(200).optional(),
  hp: z.string().trim().max(200).optional(), // Honeypot field
});

export type AiLeadInput = z.infer<typeof aiLeadInputSchema>;

export interface AiLeadResult {
  ok: boolean;
  leadId?: string;
  qualificationTier: z.infer<typeof qualificationTierSchema>;
  qualificationScore: number;
  message: string;
}

/**
 * Calculates a qualification score (0 - 100) and tier based on client parameters
 */
export function calculateLeadQualification(input: {
  implementation_budget: string;
  timeline: string;
  company_size: string;
  compliance_requirements: string[];
  organization_type: string;
}): { tier: z.infer<typeof qualificationTierSchema>; score: number } {
  let score = 30; // base score

  // Budget scoring
  const budget = input.implementation_budget.toLowerCase();
  if (budget.includes("10k") || budget.includes("10,000") || budget.includes("enterprise") || budget.includes("20k")) {
    score += 35;
  } else if (budget.includes("5k") || budget.includes("5,000") || budget.includes("3,000") || budget.includes("3k")) {
    score += 25;
  } else if (budget.includes("1,500") || budget.includes("1500") || budget.includes("2k")) {
    score += 15;
  } else if (budget.includes("under") || budget.includes("500") || budget.includes("zero")) {
    score += 0;
  } else {
    score += 10;
  }

  // Timeline urgency
  const timeline = input.timeline.toLowerCase();
  if (timeline.includes("immediately") || timeline.includes("2 weeks") || timeline.includes("30 days")) {
    score += 20;
  } else if (timeline.includes("1-3 months") || timeline.includes("60 days")) {
    score += 15;
  } else {
    score += 5;
  }

  // Company scale & organization
  const size = input.company_size.toLowerCase();
  if (size.includes("50+") || size.includes("100+") || size.includes("enterprise") || size.includes("college") || size.includes("university")) {
    score += 15;
  } else if (size.includes("11-50") || size.includes("6-10")) {
    score += 10;
  } else {
    score += 5;
  }

  // Compliance complexity
  if (input.compliance_requirements.length > 0) {
    score += 10;
  }

  // Determine tier
  let tier: z.infer<typeof qualificationTierSchema> = "qualified";
  if (score >= 80 || input.organization_type.toLowerCase().includes("higher education") || budget.includes("10k")) {
    tier = score >= 90 ? "enterprise_opportunity" : "high_priority";
  } else if (score >= 50) {
    tier = "qualified";
  } else {
    tier = "low_priority";
  }

  return { tier, score: Math.min(100, score) };
}

// ----------------------------------------------------------------------
// SERVER FUNCTION: SUBMIT AI STACK LEAD
// ----------------------------------------------------------------------
export const submitAiLead = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => aiLeadInputSchema.parse(v))
  .handler(async ({ data }) => {
    // 1. Honeypot check
    if (data.hp) {
      return {
        ok: true,
        qualificationTier: "low_priority",
        qualificationScore: 0,
        message: "Your inquiry has been received.",
      };
    }

    // 2. Rate limit check
    try {
      const { getClientIpHash, tooManyRecent } = await import("./rate-limit.server");
      const ipHash = await getClientIpHash();
      if (ipHash && (await tooManyRecent("service_system_leads", ipHash, 30, 4))) {
        throw new Error("Too many submissions from your network. Please wait a few minutes.");
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("Too many")) {
        throw err;
      }
      // Rate limiting fallback continues
    }

    // 3. Compute qualification score
    const { tier, score } = calculateLeadQualification({
      implementation_budget: data.implementation_budget,
      timeline: data.timeline,
      company_size: data.company_size,
      compliance_requirements: data.compliance_requirements,
      organization_type: data.organization_type,
    });

    // 4. Persist to database if available
    let leadId: string | undefined;
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const row = {
        contact_name: data.contact_name,
        email: data.email.toLowerCase(),
        phone: data.phone || null,
        company_name: data.company_name || null,
        organization_type: data.organization_type,
        company_size: data.company_size,
        industry: data.industry,
        problem_statement: data.problem_statement,
        current_systems: data.current_systems || null,
        monthly_software_budget: data.monthly_software_budget || null,
        implementation_budget: data.implementation_budget,
        timeline: data.timeline,
        technical_skill_level: data.technical_skill_level || null,
        architecture_preference: data.architecture_preference || null,
        compliance_requirements: data.compliance_requirements,
        recommended_stack: data.recommended_stack,
        qualification_tier: tier,
        qualification_score: score,
        status: "new",
        consent_at: new Date().toISOString(),
        source: data.source || "ai_tool_library",
        campaign: data.campaign || null,
        landing_path: data.landing_path || "/ai-stack-builder",
      };

      const { data: inserted, error } = await supabaseAdmin
        .from("ai_stack_leads" as never)
        .insert(row as never)
        .select("id" as never)
        .maybeSingle();

      if (!error && inserted) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        leadId = (inserted as any).id;
      }
    } catch (err) {
      // Graceful fallback if database migration is pending execution
      console.warn("Could not save to ai_stack_leads table:", err);
    }

    return {
      ok: true,
      leadId,
      qualificationTier: tier,
      qualificationScore: score,
      message:
        tier === "enterprise_opportunity" || tier === "high_priority"
          ? "Priority application received. Antonio and the MIT technical team will review your architecture requirements within 24 hours."
          : "Thank you. Your AI stack recommendation and implementation blueprint request has been received.",
    };
  });

// ----------------------------------------------------------------------
// SERVER FUNCTION: STACK GENERATION ALGORITHM
// ----------------------------------------------------------------------
export const stackGeneratorInputSchema = z.object({
  goal: z.string().trim().min(3),
  organizationType: z.enum(["small-business", "higher-education", "tech-agency", "enterprise", "other"]),
  skillLevel: z.enum(["no-code", "low-code", "developer-code"]),
  monthlyBudget: z.enum(["under-50", "50-200", "200-1000", "enterprise"]),
  dataAccess: z.string().optional(),
  selfHostRequired: z.boolean().default(false),
  complianceRequired: z.array(z.string()).default([]),
});

export type StackGeneratorInput = z.infer<typeof stackGeneratorInputSchema>;

export interface GeneratedStackResponse {
  primaryModel: { name: string; slug: string; reason: string };
  orchestration: { name: string; slug: string; reason: string };
  database: { name: string; slug: string; reason: string };
  interface: { name: string; reason: string };
  monitoring: { name: string; slug: string; reason: string };
  alternativeBudgetStack: string[];
  alternativeEnterpriseStack: string[];
  estimatedMonthlySoftwareCost: string;
  estimatedImplementationTimeline: string;
  diySuitabilityScore: number; // 0 - 100
  mitRecommendationVerdict: string;
}

export const generateAiStackRecommendation = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => stackGeneratorInputSchema.parse(v))
  .handler(async ({ data }): Promise<GeneratedStackResponse> => {
    const isHigherEd = data.organizationType === "higher-education";
    const isSelfHost = data.selfHostRequired || data.complianceRequired.includes("FERPA");
    const isBudget = data.monthlyBudget === "under-50";
    const isNoCode = data.skillLevel === "no-code";

    // Select Primary Model
    let primaryModel = {
      name: "Anthropic (Claude 3.7 Sonnet)",
      slug: "claude",
      reason: "Premier reasoning depth, superior instruction following, and clean writing tone.",
    };
    if (isSelfHost) {
      primaryModel = {
        name: "DeepSeek-R1 (Local via Ollama)",
        slug: "ollama",
        reason: "Runs 100% on-premises to guarantee data sovereignty and zero external transmission.",
      };
    } else if (isBudget) {
      primaryModel = {
        name: "DeepSeek (via API) / Claude 3.7",
        slug: "deepseek",
        reason: "Maximum cost efficiency at up to 90% lower inference expense.",
      };
    }

    // Select Orchestration Engine
    let orchestration = {
      name: "n8n (Fair-Code Workflow Engine)",
      slug: "n8n",
      reason: "No per-task execution fees, native AI agent nodes, and full self-hosting freedom.",
    };
    if (isNoCode && !isSelfHost) {
      orchestration = {
        name: "Make",
        slug: "make",
        reason: "Intuitive visual drag-and-drop canvas for non-coders without server maintenance.",
      };
    }

    // Select Database / Memory
    let database = {
      name: "Supabase (PostgreSQL + pgvector)",
      slug: "supabase",
      reason: "Unified relational data, authentication, and vector embeddings in one managed database.",
    };
    if (isSelfHost) {
      database = {
        name: "Self-Hosted Supabase / Qdrant",
        slug: "qdrant",
        reason: "Open-source high-speed vector search deployable on private infrastructure.",
      };
    }

    // Monitoring & Governance
    const monitoring = {
      name: "Langfuse",
      slug: "langfuse",
      reason: "Open-source token telemetry, prompt versioning, and agent loop execution tracing.",
    };

    // User Interface
    let ui = {
      name: "Custom Responsive Web Portal + Slack / Teams Bot",
      reason: "Direct integration into existing team communication channels.",
    };
    if (isHigherEd) {
      ui = {
        name: "Campus Web Widget + Two-Way SMS Line",
        reason: "Ensures students receive immediate answers on mobile without downloading extra apps.",
      };
    }

    // DIY score
    let diyScore = 65;
    if (data.skillLevel === "no-code" && !isSelfHost) diyScore = 80;
    if (data.skillLevel === "developer-code") diyScore = 75;
    if (isSelfHost || data.complianceRequired.length > 0) diyScore = 40;

    return {
      primaryModel,
      orchestration,
      database,
      interface: { name: ui.name, reason: ui.reason },
      monitoring,
      alternativeBudgetStack: ["Ollama (Local Models)", "Activepieces", "Supabase Free", "Resend"],
      alternativeEnterpriseStack: ["Anthropic Claude (Bedrock)", "n8n Self-Hosted VPC", "Pinecone Serverless", "Langfuse Enterprise"],
      estimatedMonthlySoftwareCost: isBudget ? "$20 - $45/mo" : isHigherEd ? "$90 - $250/mo" : "$50 - $120/mo",
      estimatedImplementationTimeline: isSelfHost ? "2 - 3 weeks" : "1 - 2 weeks",
      diySuitabilityScore: diyScore,
      mitRecommendationVerdict:
        diyScore < 50
          ? "Professional implementation recommended due to security and compliance constraints."
          : "Feasible for self-guided build; MIT provides architecture review and accelerated deployment if needed.",
    };
  });

// ----------------------------------------------------------------------
// SERVER FUNCTION: GET TOOLS LIST / DETAILS (Client-safe)
// ----------------------------------------------------------------------
export const listToolsServerFn = createServerFn({ method: "GET" })
  .inputValidator((v: unknown) =>
    z
      .object({
        query: z.string().optional(),
        category: z.string().optional(),
        pricing: z.enum(["all", "free", "open-source", "self-hosted"]).optional(),
        enterprise: z.boolean().optional(),
      })
      .optional()
      .parse(v),
  )
  .handler(async ({ data }): Promise<AiTool[]> => {
    if (!data) return AI_TOOLS;
    return searchAiToolsQuery(data as AiSearchFilters);
  });

export const getToolBySlugServerFn = createServerFn({ method: "GET" })
  .inputValidator((v: unknown) => z.object({ slug: z.string().min(1) }).parse(v))
  .handler(async ({ data }): Promise<AiTool | null> => {
    const tool = getAiTool(data.slug);
    return tool || null;
  });
