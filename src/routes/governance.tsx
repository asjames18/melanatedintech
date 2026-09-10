import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { ToolCrossSell } from "@/components/tool-cross-sell";
import { buildSeoMeta } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";
import {
  ShieldCheck,
  FileText,
  Download,
  CheckCircle2,
  Lock,
  Building2,
  GraduationCap,
  Heart,
  Users,
  Copy,
  Check,
  Sparkles,
  Edit3,
  CheckSquare,
  Square,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/governance")({
  head: () => ({
    ...buildSeoMeta({
      title: "AI Governance, Ethics & Policy Starter Kit — Melanated In Tech",
      description:
        "Downloadable customizable AI acceptable use policy templates, data privacy guidelines, vendor risk frameworks, and ethical AI deployment checklists for businesses, nonprofits, higher ed, and ministries.",
      url: "/governance",
    }),
  }),
  component: GovernanceKit,
});

interface PolicyTemplate {
  id: string;
  title: string;
  targetAudience: string;
  category: string;
  description: string;
  fullMarkdown: string;
}

const TEMPLATES: PolicyTemplate[] = [
  {
    id: "acceptable_use",
    title: "Organizational AI Acceptable Use Policy (AUP)",
    targetAudience: "Small Businesses, IT Departments, Tech Teams",
    category: "Corporate Governance",
    description: "Defines permissible AI tool usage, data privacy standards, and zero-data-retention compliance for staff.",
    fullMarkdown: `# Organizational AI Acceptable Use Policy (AUP)
**Organization**: [ORGANIZATION NAME]
**Effective Date**: [EFFECTIVE DATE]
**AI Compliance Officer Contact**: [AI OFFICER EMAIL]

---

## 1. Purpose & Scope
This policy governs the acceptable use of Generative AI tools, Large Language Model (LLM) APIs, and autonomous AI Agents by all employees, contractors, and representatives of **[ORGANIZATION NAME]**.

## 2. Approved AI Tool Directory & Classification
To protect organizational IP and customer confidentiality, tools are classified into three tiers:
- **Tier 1 (Approved Enterprise Tools)**: Vendor systems with signed Enterprise Zero-Data-Retention (ZDR) agreements where data is not used for model retraining (e.g. OpenAI Enterprise, Claude Team, internal RAG proxies).
- **Tier 2 (Conditional Approval)**: Standalone tools approved for public or non-sensitive research only.
- **Tier 3 (Prohibited)**: Unsanctioned consumer AI chatbots where inputs are logged or used to train public foundation models.

## 3. Data Protection & Confidentiality Rules
- **Prohibited Data**: Staff shall **NEVER** input personally identifiable information (PII), Social Security numbers, credit card details, passwords, trade secrets, or unannounced financial records into Tier 2 or Tier 3 AI tools.
- **Sanitization**: All external customer data must be scrubbed using approved anonymization proxies prior to LLM processing.

## 4. Human-in-the-Loop (HITL) Requirement
- **Zero Automated Dispatch**: No AI-generated document, contract, financial projection, or customer support resolution may be dispatched to external parties without human review.

## 5. Violation & Compliance Enforcement
- Violations of this policy will be logged by the IT Security team and reported to **[AI OFFICER EMAIL]**. Non-compliance may lead to revoked access and disciplinary action.`,
  },
  {
    id: "higher_ed_academic",
    title: "Higher Education & Academic AI Policy",
    targetAudience: "Universities, Colleges, Academic Departments",
    category: "Higher Ed & Research",
    description: "Establishes guidelines for AI in academic research, student coursework, citation standards, and admissions integrity.",
    fullMarkdown: `# Higher Education & Academic AI Policy
**Institution**: [ORGANIZATION NAME]
**Effective Date**: [EFFECTIVE DATE]
**Academic Integrity Office**: [AI OFFICER EMAIL]

---

## 1. Academic Mission Statement
**[ORGANIZATION NAME]** recognizes the transformative potential of Generative AI in education and research while upholding uncompromising standards of intellectual honesty and original scholarship.

## 2. Student Coursework & Citation Protocol
- **Instructor Discretion**: Course syllabi explicitly govern AI usage. Students must verify whether AI tools are Permitted, Restricted, or Prohibited for specific assignments.
- **Mandatory Disclosure**: Whenever AI tools assist in literature reviews, code generation, or editing, students must provide a **Disclosure Statement** citing the model name, prompt used, and specific contribution.

## 3. Research Data Privacy & IP Rights
- Faculty and student researchers shall not upload unpublished research data, patent applications, or grant proposals to non-enterprise AI systems.

## 4. Admissions & Grading Integrity
- Automated AI scoring shall never serve as the sole determinant for student admissions, financial aid, or academic probation decisions.`,
  },
  {
    id: "nonprofit_ethics",
    title: "Nonprofit & Community Ethical AI Framework",
    targetAudience: "Nonprofits, Foundations, Community Organizers",
    category: "Community & Equity",
    description: "Ensures AI automation respects community trust, prevents algorithmic bias, and maintains authentic human relationships.",
    fullMarkdown: `# Nonprofit & Community Ethical AI Framework
**Organization**: [ORGANIZATION NAME]
**Effective Date**: [EFFECTIVE DATE]
**Community Trust Lead**: [AI OFFICER EMAIL]

---

## 1. Ethical Commitment
At **[ORGANIZATION NAME]**, we deploy AI technology to extend our community reach, streamline donor operations, and automate repetitive logistics—never to replace authentic human empathy.

## 2. Core Ethical Standards
1. **Algorithmic Fairness & Equity**: AI agent prompts and outputs must be audited quarterly to prevent cultural misrepresentation or racial bias against community members.
2. **Community Data Sovereignty**: Beneficiary case notes, trauma histories, and personal counseling logs are strictly barred from AI indexing.
3. **Full Disclosure**: Donors and community members will be notified when communicating with automated messaging assistants.

## 3. Oversight & Feedback
- Community members may direct feedback or report concerns regarding automated systems to **[AI OFFICER EMAIL]**.`,
  },
  {
    id: "ministry_ai_guidelines",
    title: "Faith & Ministry AI Deployment Guidelines",
    targetAudience: "Churches, Ministries, Faith-Based Organizations",
    category: "Ministry Governance",
    description: "Balanced guidelines for adopting AI in sermon transcript processing, volunteer coordination, and media outreach.",
    fullMarkdown: `# Faith & Ministry AI Deployment Guidelines
**Ministry / Church**: [ORGANIZATION NAME]
**Effective Date**: [EFFECTIVE DATE]
**Ministry Technology Lead**: [AI OFFICER EMAIL]
**Open-Source Standard**: [Ministry AI Skills Framework](https://github.com/asjames18/ministry-ai-skills)

---

## 1. Biblical Stewardship & Technology Statement
At **[ORGANIZATION NAME]**, we view technology as a practical tool for faithful stewardship, efficient administrative coordination, and global gospel outreach. We align our workflows with the open-source [Ministry AI Skills](https://github.com/asjames18/ministry-ai-skills) ethical framework.

## 2. Permissible Ministry Use Cases
- ✅ **Approved Administrative Use**: Summarizing Sunday sermon audio into study guides, drafting volunteer schedules, generating media packs and announcement scripts, translating media into multiple languages.
- ❌ **Prohibited Pastoral Use**: Utilizing AI to generate pastoral counseling responses, prayer communications, or replacing human spiritual care.

## 3. Content Integrity & Theological Review
- All teaching materials and media assets generated with AI assistance must undergo pastoral review to ensure theological alignment and absolute truth.

## 4. Privacy & Data Safeguarding
- No personal pastoral counseling notes, member prayer requests, giving records, or safeguarding data may be submitted to unvetted AI tools without Zero Data Retention (ZDR) guarantees. Refer to the open [Privacy & Data Handling Guide](https://github.com/asjames18/ministry-ai-skills/blob/main/docs/privacy-and-data-handling.md).`,
  },
  {
    id: "vendor_risk_scorecard",
    title: "AI Vendor Security & Risk Evaluation Matrix",
    targetAudience: "IT Directors, Procurement Officers, CTOs",
    category: "Vendor Assessment",
    description: "A 10-point checklist for auditing third-party AI software vendors for SOC2, data retention, and LLM safety.",
    fullMarkdown: `# AI Vendor Security & Risk Evaluation Matrix
**Auditing Organization**: [ORGANIZATION NAME]
**Evaluation Date**: [EFFECTIVE DATE]
**Security Auditor**: [AI OFFICER EMAIL]

---

## 1. Vendor Evaluation Criteria (Pass / Fail Audit)
1. **Zero Data Retention (ZDR)**: Does the vendor contractually guarantee user prompts and files are NOT stored for model training?
2. **SOC2 Type II Compliance**: Does the vendor hold active SOC2 Type II security certifications?
3. **Data Encryption**: Is customer data encrypted in transit (TLS 1.3) and at rest (AES-256)?
4. **Role-Based Access Control (RBAC)**: Does the platform support granular team permissions and Single Sign-On (SSO)?
5. **Prompt Injection Firewalls**: Does the vendor implement active prompt guard filtering against prompt exfiltration attacks?

## 2. Sign-Off Approval
- **Approved by IT Lead**: ___________________________
- **Contact**: [AI OFFICER EMAIL]`,
  },
];

const COMPLIANCE_CHECKLIST = [
  { id: "dir", text: "Approved AI Tool Directory established for all employees" },
  { id: "zdr", text: "Zero-Data-Retention (ZDR) agreements verified with primary LLM vendors" },
  { id: "pii", text: "Prompt Guard proxy or PII scrubbing deployed for public webhooks" },
  { id: "hitl", text: "Human-in-the-Loop review enforced for all external communications" },
  { id: "audit", text: "Annual AI governance and algorithmic bias audit scheduled" },
];

export function GovernanceKit() {
  const [selectedId, setSelectedId] = useState<string>("acceptable_use");
  const [orgName, setOrgName] = useState<string>("Melanated In Tech Enterprise");
  const [officerEmail, setOfficerEmail] = useState<string>("compliance@melanatedintech.com");
  const [effectiveDate, setEffectiveDate] = useState<string>(new Date().toISOString().split("T")[0]);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [completedChecklist, setCompletedChecklist] = useState<Record<string, boolean>>({
    dir: true,
    zdr: true,
  });

  const activeTemplate = TEMPLATES.find((t) => t.id === selectedId) || TEMPLATES[0];

  // Dynamically replace variables in markdown text
  const customizedMarkdown = useMemo(() => {
    return activeTemplate.fullMarkdown
      .replaceAll("[ORGANIZATION NAME]", orgName || "[ORGANIZATION NAME]")
      .replaceAll("[AI OFFICER EMAIL]", officerEmail || "[AI OFFICER EMAIL]")
      .replaceAll("[EFFECTIVE DATE]", effectiveDate || "[EFFECTIVE DATE]");
  }, [activeTemplate, orgName, officerEmail, effectiveDate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(customizedMarkdown);
    setCopiedId(activeTemplate.id);
    trackEvent("tool_export", { tool: "governance_kit", template: activeTemplate.id, orgName });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([customizedMarkdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTemplate.id}_${orgName.toLowerCase().replace(/\s+/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    trackEvent("tool_export", { tool: "governance_kit_download", template: activeTemplate.id });
  };

  const toggleChecklist = (id: string) => {
    setCompletedChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const checklistScore = Object.values(completedChecklist).filter(Boolean).length;

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Governance & Enablement Hub"
        title="AI Governance, Ethics & Policy Starter Kit"
        description="Download ready-to-use policy templates, acceptable use agreements, and ethical AI deployment frameworks customized for your organization."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-2xl border border-primary/25 bg-primary/5 p-6 sm:flex sm:items-center sm:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-primary">
              <Users className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-wider">Community stewardship</p>
            </div>
            <h2 className="mt-2 font-display text-xl font-semibold">
              Practical AI needs clear boundaries—and people who can help improve them.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Open Commons is Melanated In Tech’s public home for shared tools, examples, and
              contribution paths. This governance hub explains the responsible practices behind that work.
            </p>
          </div>
          <Link
            to="/open-commons"
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-card px-4 py-2.5 text-sm font-semibold text-primary hover:border-primary/60 sm:mt-0"
          >
            Explore Open Commons <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Dynamic Variable Customizer Bar */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Edit3 className="h-4 w-4 text-primary" />
            <h3 className="font-display text-sm font-bold text-foreground">
              Customize Policy Variables (Instant Live Substitution)
            </h3>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-[11px] font-semibold uppercase text-muted-foreground">
                Organization / Company Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Acme Corp or Grace Community Church"
                className="mt-1.5 w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase text-muted-foreground">
                AI Compliance Contact Email
              </label>
              <input
                type="email"
                value={officerEmail}
                onChange={(e) => setOfficerEmail(e.target.value)}
                placeholder="e.g. ai-security@company.com"
                className="mt-1.5 w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase text-muted-foreground">
                Effective Implementation Date
              </label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Template Sidebar */}
          <div className="space-y-4 lg:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Available Policy Frameworks ({TEMPLATES.length})
            </p>

            {TEMPLATES.map((t) => {
              const isSelected = t.id === selectedId;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 ring-1 ring-primary shadow-sm"
                      : "border-border/70 bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-border bg-background px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                      {t.category}
                    </span>
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </div>
                  <h4 className="mt-2 font-display text-sm font-bold text-foreground">{t.title}</h4>
                  <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
                </div>
              );
            })}
          </div>

          {/* Template Document Reader */}
          <div className="space-y-6 lg:col-span-7">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
                <div>
                  <h3 className="font-display text-base font-bold">{activeTemplate.title}</h3>
                  <p className="text-xs text-muted-foreground">Target: {activeTemplate.targetAudience}</p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleDownload} variant="outline" className="gap-2 text-xs font-bold">
                    <Download className="h-4 w-4" /> Download .MD
                  </Button>
                  <Button onClick={handleCopy} className="gap-2 bg-primary text-xs font-bold">
                    {copiedId === activeTemplate.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copiedId === activeTemplate.id ? "Copied!" : "Copy Policy"}
                  </Button>
                </div>
              </div>

              <div className="mt-4">
                <pre className="max-h-[480px] overflow-y-auto rounded-xl border border-border bg-background p-5 font-mono text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                  {customizedMarkdown}
                </pre>
              </div>
            </div>

            {/* Interactive Compliance Scorecard */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h4 className="font-display text-sm font-bold text-foreground">
                    Organizational AI Compliance Readiness Checklist
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Verify key governance requirements before launching autonomous agents.
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 border border-primary/30 px-3 py-1 font-mono text-xs font-bold text-primary">
                  {checklistScore} / {COMPLIANCE_CHECKLIST.length} Verified
                </span>
              </div>

              <div className="mt-4 space-y-2.5">
                {COMPLIANCE_CHECKLIST.map((item) => {
                  const isChecked = !!completedChecklist[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklist(item.id)}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-xs transition-colors ${
                        isChecked
                          ? "border-emerald-500/40 bg-emerald-500/10 font-medium text-foreground"
                          : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40"
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="h-4 w-4 shrink-0" />
                      )}
                      <span>{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <ToolCrossSell tool="governance" />
      </section>
    </SiteLayout>
  );
}
