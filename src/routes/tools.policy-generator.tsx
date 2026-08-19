import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, Copy, Download, ShieldCheck, Sparkles, Building, CheckCircle2 } from "lucide-react";
import { buildSeoMeta, ldScript, breadcrumbLd } from "@/lib/seo";
import { ToolCrossSell } from "@/components/tool-cross-sell";
import { ToolGuide } from "@/components/tool-guide";
import { trackEvent } from "@/lib/analytics";

const GUIDE_DATA = {
  whatItIs: "A formal Acceptable AI Use Policy document generator for small businesses, non-profits, ministries, and engineering teams.",
  whyUseIt: "Establishes legal and operational safeguards governing data privacy, customer PII, and approved AI tools across your organization.",
  howToUse: [
    "Enter your Organization Name and select your Organization Type (Small Business, Non-Profit/Ministry, Tech Company, Education).",
    "Specify Data Confidentiality level, Allowed AI Tool tiers, and Human Review mandates.",
    "Preview the generated Acceptable AI Use Policy document and click 'Download Markdown' or 'Copy Document'.",
  ],
};

export const Route = createFileRoute("/tools/policy-generator")({
  head: () => {
    const seo = buildSeoMeta({
      title: "Acceptable AI Use Policy Generator — Melanated In Tech",
      description:
        "Generate formal Acceptable AI Use Policy documents for small businesses, non-profits, ministries, and technology teams.",
      url: "/tools/policy-generator",
    });
    return {
      meta: seo.meta,
      links: seo.links,
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "AI Tools", path: "/tools" },
            { name: "AI Policy Generator", path: "/tools/policy-generator" },
          ]),
        ),
      ],
    };
  },
  component: PolicyGeneratorPage,
});

const ORG_TYPES = [
  "Small Business / Startup",
  "Non-Profit Organization",
  "Church / Ministry",
  "Higher Education / School",
  "Technology / Software Team",
  "Freelance Agency",
];

function PolicyGeneratorPage() {
  const [orgName, setOrgName] = useState("Acme Innovations");
  const [orgType, setOrgType] = useState(ORG_TYPES[0]);
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split("T")[0]);

  // Policy options
  const [allowPublicLlm, setAllowPublicLlm] = useState(true);
  const [allowCodeGenerators, setAllowCodeGenerators] = useState(true);
  const [requireHumanReview, setRequireHumanReview] = useState(true);
  const [banPiiInput, setBanPiiInput] = useState(true);
  const [requireDisclosure, setRequireDisclosure] = useState(false);
  const [requireDataRetentionOptOut, setRequireDataRetentionOptOut] = useState(true);

  // Derived Policy Document
  const compiledPolicy = useMemo(() => {
    const doc = `# ACCEPTABLE AI USE POLICY
**Organization:** ${orgName.trim() || "Organization"}
**Classification:** ${orgType}
**Effective Date:** ${effectiveDate}

---

## 1. PURPOSE & SCOPE
This Acceptable AI Use Policy establishes clear operational guidelines for employees, contractors, and team members of ${orgName} regarding the adoption and deployment of Artificial Intelligence (AI) software, Generative AI models, and AI Agent workflows.

## 2. PERMITTED AI UTILITIES
The following tools and AI platforms are approved for operational use:
${allowPublicLlm ? "- **Commercial Assistants:** ChatGPT, Claude, Gemini for drafting, research, and analysis.\n" : ""}${allowCodeGenerators ? "- **Developer Automation:** GitHub Copilot, Cursor, and code assistant agents.\n" : ""}- **Internal Tools:** Approved custom agents developed or deployed on official organization workspaces.

## 3. DATA PRIVACY & CONFIDENTIALITY BOUNDARIES
${banPiiInput ? "### 3.1 Strict PII Protection\nUnder no circumstances may team members enter Personally Identifiable Information (PII), social security numbers, private customer credentials, financial account details, or protected health information into public AI models.\n" : ""}${requireDataRetentionOptOut ? "\n### 3.2 Enterprise Privacy Settings\nTeam members must ensure that model data-sharing / training opt-out toggles are enabled for all public model accounts to prevent internal organization data from being used in model training sets.\n" : ""}
## 4. HUMAN-IN-THE-LOOP & VERIFICATION OVERSIGHT
${requireHumanReview ? "### 4.1 Mandatory Verification\nAll AI-generated outputs (written reports, software code, customer responses, marketing material) must undergo mandatory review by a qualified human team member prior to external publication, deployment, or customer delivery.\n" : ""}
## 5. TRANSPARENCY & ATTRIBUTION
${requireDisclosure ? "Team members must disclose when published content or customer-facing material was substantially generated or assisted by AI utilities.\n" : "AI utilities are intended as productivity augmentation tools; final responsibility for quality and compliance rests entirely with human authors."}

## 6. COMPLIANCE & GOVERNANCE
Violations of this policy will be reviewed by organizational leadership and may result in revocation of AI tool access.

---
*Generated via Melanated In Tech Acceptable AI Policy Generator.*
`;
    return doc;
  }, [orgName, orgType, effectiveDate, allowPublicLlm, allowCodeGenerators, requireHumanReview, banPiiInput, requireDisclosure, requireDataRetentionOptOut]);

  const handleCopy = () => {
    navigator.clipboard.writeText(compiledPolicy).then(
      () => {
        trackEvent("policy_generator_action", { action: "copy" });
        toast.success("Policy document copied to clipboard!");
      },
      () => toast.error("Failed to copy policy.")
    );
  };

  const handleDownload = () => {
    const filename = `${orgName.toLowerCase().replace(/\s+/g, "-")}-acceptable-ai-policy.md`;
    const blob = new Blob([compiledPolicy], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    trackEvent("policy_generator_action", { action: "download" });
    toast.success("Downloaded policy document!");
  };

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Interactive Utilities"
        title="Acceptable AI Use Policy Generator."
        description="Create official internal AI governance and acceptable use policy documents for your business, non-profit, ministry, or engineering team."
      />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ToolGuide guide={GUIDE_DATA} />
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Form Settings (Left Col-span 5) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="font-display text-lg font-bold flex items-center gap-2">
                  <Building className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Organization Details
                </CardTitle>
                <CardDescription>Tailor policy document metadata</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="org-name" className="text-xs font-semibold">
                    Organization Name
                  </Label>
                  <Input
                    id="org-name"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Grace Fellowship, NovaTech Solutions..."
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="org-type" className="text-xs font-semibold">
                    Organization Type
                  </Label>
                  <Select value={orgType} onValueChange={setOrgType}>
                    <SelectTrigger id="org-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORG_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="effective-date" className="text-xs font-semibold">
                    Effective Date
                  </Label>
                  <Input
                    id="effective-date"
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Policy Toggles */}
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Governance & Security Rules</CardTitle>
                <CardDescription className="text-xs">Check rules to include in policy document</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <Checkbox checked={banPiiInput} onCheckedChange={(c) => setBanPiiInput(!!c)} className="mt-0.5" />
                  <span className="text-xs font-medium text-foreground">
                    Strict Ban on PII & Customer Credentials in Public Models
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <Checkbox checked={requireHumanReview} onCheckedChange={(c) => setRequireHumanReview(!!c)} className="mt-0.5" />
                  <span className="text-xs font-medium text-foreground">
                    Mandatory Human-in-the-Loop Review Before Publishing
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <Checkbox checked={requireDataRetentionOptOut} onCheckedChange={(c) => setRequireDataRetentionOptOut(!!c)} className="mt-0.5" />
                  <span className="text-xs font-medium text-foreground">
                    Require Model Training Opt-Out Settings
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <Checkbox checked={allowCodeGenerators} onCheckedChange={(c) => setAllowCodeGenerators(!!c)} className="mt-0.5" />
                  <span className="text-xs font-medium text-foreground">
                    Authorize AI Coding Assistants (Copilot, Cursor)
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <Checkbox checked={requireDisclosure} onCheckedChange={(c) => setRequireDisclosure(!!c)} className="mt-0.5" />
                  <span className="text-xs font-medium text-foreground">
                    Require External AI Assistance Disclosures
                  </span>
                </label>
              </CardContent>
            </Card>
          </div>

          {/* Policy Preview (Right Col-span 7) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border border-border bg-card shadow-sm sticky top-20">
              <CardHeader>
                <CardTitle className="font-display text-xl font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Compiled Policy Document
                </CardTitle>
                <CardDescription>Ready to publish or distribute to your team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/40 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-[480px] overflow-y-auto select-all">
                  {compiledPolicy}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button variant="outline" onClick={handleDownload} className="gap-1.5">
                    <Download className="h-4 w-4" /> Download Markdown
                  </Button>
                  <Button onClick={handleCopy} className="gap-1.5">
                    <Copy className="h-4 w-4" /> Copy Document
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <ToolCrossSell tool="policy-generator" />
      </main>
    </SiteLayout>
  );
}
