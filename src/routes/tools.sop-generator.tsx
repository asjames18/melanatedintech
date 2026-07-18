import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { FileCode, Copy, Download, Sparkles, Workflow, CheckCircle2 } from "lucide-react";
import { buildSeoMeta, ldScript, breadcrumbLd } from "@/lib/seo";
import { ToolCrossSell } from "@/components/tool-cross-sell";
import { ToolGuide } from "@/components/tool-guide";
import { trackEvent } from "@/lib/analytics";

const GUIDE_DATA = {
  whatItIs: "An operational SOP generator for creating formal collaboration documents between human staff and autonomous AI agents.",
  whyUseIt: "Establishes clear escalation boundaries, human QA review responsibilities, and operational safety protocols when deploying AI into team workflows.",
  howToUse: [
    "Enter your Workflow Title, Owner Team, Human Staff Roles, and AI Agent Name.",
    "Specify the AI Agent's specific automated task responsibilities and human escalation triggers.",
    "Preview the generated Markdown SOP document and click 'Download Markdown' or 'Copy Document'.",
  ],
};

export const Route = createFileRoute("/tools/sop-generator")({
  head: () => {
    const seo = buildSeoMeta({
      title: "AI Workflow SOP Generator — Melanated In Tech",
      description:
        "Generate Standard Operating Procedure (SOP) documents for teams collaborating with AI agents.",
      url: "/tools/sop-generator",
    });
    return {
      meta: seo.meta,
      links: seo.links,
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "AI Tools", path: "/tools" },
            { name: "SOP Generator", path: "/tools/sop-generator" },
          ]),
        ),
      ],
    };
  },
  component: SopGeneratorPage,
});

function SopGeneratorPage() {
  const [workflowTitle, setWorkflowTitle] = useState("Inbound Customer Support & Lead Intake");
  const [teamName, setTeamName] = useState("Customer Operations Team");
  const [humanRoles, setHumanRoles] = useState("Tier 2 Specialist, Operations Lead");
  const [agentName, setAgentName] = useState("Support Triage Agent");
  const [agentTasks, setAgentTasks] = useState(
    "Categorize incoming tickets, draft preliminary response, extract customer contact info, tag priority level."
  );
  const [escalationTriggers, setEscalationTriggers] = useState(
    "Billing disputes over $100, negative sentiment indicators, explicit request for human manager."
  );

  const compiledSop = useMemo(() => {
    return `# STANDARD OPERATING PROCEDURE (SOP)
**Workflow Name:** ${workflowTitle}
**Owner Team:** ${teamName}
**AI Agent Assigned:** ${agentName}
**Effective Date:** ${new Date().toISOString().split("T")[0]}

---

## 1. PURPOSE & OBJECTIVES
The purpose of this SOP is to define clear operational boundaries between human staff (${humanRoles}) and the AI Agent (${agentName}) to ensure high-quality, reliable, and compliant execution of ${workflowTitle}.

## 2. DIVISION OF RESPONSIBILITY

### 2.1 AI Agent Scope (${agentName})
The AI Agent is responsible for executing the following automated tasks:
${agentTasks.split(",").map((t) => `- ${t.trim()}`).join("\n")}

### 2.2 Human Staff Scope (${humanRoles})
Human team members are responsible for:
- Reviewing AI drafts and high-priority flagged items before sending.
- Managing complex escalations beyond agent knowledge boundaries.
- Auditing sample conversations weekly for quality assurance.

## 3. ESCALATION TRIGGERS
The AI Agent must immediately hand off execution to a human team member upon encountering any of the following conditions:
${escalationTriggers.split(",").map((t) => `- 🚨 **Trigger:** ${t.trim()}`).join("\n")}

## 4. STEP-BY-STEP OPERATIONAL FLOW
1. **Intake:** User query or task enters system via primary channel.
2. **AI Processing:** ${agentName} parses intent, categorizes topic, and generates initial candidate output or action.
3. **Escalation Check:** ${agentName} checks output against Escalation Triggers defined in Section 3.
4. **Human Verification:** If flagged or high-risk, assigned staff member (${humanRoles}) reviews and approves.
5. **Resolution & Logging:** Interaction is completed and logged to database for weekly quality audit.

---
*Generated via Melanated In Tech AI SOP Generator.*
`;
  }, [workflowTitle, teamName, humanRoles, agentName, agentTasks, escalationTriggers]);

  const handleCopy = () => {
    navigator.clipboard.writeText(compiledSop).then(
      () => {
        trackEvent("sop_generator_action", { action: "copy" });
        toast.success("SOP document copied to clipboard!");
      },
      () => toast.error("Failed to copy document.")
    );
  };

  const handleDownload = () => {
    const filename = `${workflowTitle.toLowerCase().replace(/\s+/g, "-")}-sop.md`;
    const blob = new Blob([compiledSop], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    trackEvent("sop_generator_action", { action: "download" });
    toast.success("Downloaded SOP document!");
  };

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Interactive Utilities"
        title="AI Workflow SOP Generator."
        description="Build formal Standard Operating Procedure (SOP) documents for human teams collaborating with autonomous AI agents."
      />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ToolGuide guide={GUIDE_DATA} />
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Form Settings (Left Col-span 5) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="font-display text-lg font-bold flex items-center gap-2">
                  <Workflow className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Workflow Parameters
                </CardTitle>
                <CardDescription>Configure team roles and agent responsibilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="workflow-title" className="text-xs font-semibold">
                    Workflow Title
                  </Label>
                  <Input
                    id="workflow-title"
                    value={workflowTitle}
                    onChange={(e) => setWorkflowTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="team-name" className="text-xs font-semibold">
                    Owner Team / Department
                  </Label>
                  <Input
                    id="team-name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="human-roles" className="text-xs font-semibold">
                    Human Roles Involved
                  </Label>
                  <Input
                    id="human-roles"
                    value={humanRoles}
                    onChange={(e) => setHumanRoles(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="agent-name" className="text-xs font-semibold">
                    AI Agent Name
                  </Label>
                  <Input
                    id="agent-name"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="agent-tasks" className="text-xs font-semibold">
                    AI Agent Tasks (comma-separated)
                  </Label>
                  <Textarea
                    id="agent-tasks"
                    value={agentTasks}
                    onChange={(e) => setAgentTasks(e.target.value)}
                    rows={3}
                    className="text-xs resize-y"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="escalation-triggers" className="text-xs font-semibold">
                    Escalation Triggers (comma-separated)
                  </Label>
                  <Textarea
                    id="escalation-triggers"
                    value={escalationTriggers}
                    onChange={(e) => setEscalationTriggers(e.target.value)}
                    rows={3}
                    className="text-xs resize-y"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SOP Document Preview (Right Col-span 7) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border border-border bg-card shadow-sm sticky top-20">
              <CardHeader>
                <CardTitle className="font-display text-xl font-bold flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Compiled SOP Document
                </CardTitle>
                <CardDescription>Formal operational specification ready for team distribution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/40 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-[480px] overflow-y-auto select-all">
                  {compiledSop}
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

        <ToolCrossSell tool="sop-generator" />
      </main>
    </SiteLayout>
  );
}
