import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { submitAiLead, type AiLeadInput, type AiLeadResult } from "@/lib/ai-tools.functions";

interface AiLeadModalProps {
  buttonText?: string;
  buttonVariant?: "default" | "outline" | "secondary";
  buttonSize?: "default" | "sm" | "lg";
  buttonClassName?: string;
  defaultProblem?: string;
  recommendedStackSummary?: Record<string, unknown>;
  triggerElement?: React.ReactNode;
}

export function AiLeadModal({
  buttonText = "Want MIT to Build This for You?",
  buttonVariant = "default",
  buttonSize = "default",
  buttonClassName = "",
  defaultProblem = "",
  recommendedStackSummary = {},
  triggerElement,
}: AiLeadModalProps) {
  const [open, setOpen] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<AiLeadResult | null>(null);

  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [orgType, setOrgType] = useState("small-business");
  const [companySize, setCompanySize] = useState("2-10");
  const [industry, setIndustry] = useState("Professional Services");
  const [problem, setProblem] = useState(defaultProblem);
  const [currentSystems, setCurrentSystems] = useState("");
  const [implementationBudget, setImplementationBudget] = useState("$2,500 - $5,000");
  const [timeline, setTimeline] = useState("Within 30 days");
  const [formError, setFormError] = useState("");

  const submitFn = useServerFn(submitAiLead);

  const mutation = useMutation({
    mutationFn: async (payload: AiLeadInput) => {
      return await submitFn({ data: payload });
    },
    onSuccess: (data) => {
      setSubmittedResult(data);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to submit request. Please try again.";
      setFormError(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!contactName.trim() || !email.trim() || !problem.trim()) {
      setFormError("Please fill in your name, email, and description of your project.");
      return;
    }

    mutation.mutate({
      contact_name: contactName,
      email: email,
      phone: phone || undefined,
      company_name: companyName || undefined,
      organization_type: orgType,
      company_size: companySize,
      industry: industry,
      problem_statement: problem,
      current_systems: currentSystems || undefined,
      implementation_budget: implementationBudget,
      timeline: timeline,
      compliance_requirements: [],
      recommended_stack: recommendedStackSummary,
      consent: true,
      landing_path: typeof window !== "undefined" ? window.location.pathname : "/ai-tools",
    });
  };

  const resetForm = () => {
    setSubmittedResult(null);
    setFormError("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger asChild>
        {triggerElement ? (
          triggerElement
        ) : (
          <Button
            variant={buttonVariant}
            size={buttonSize}
            className={`font-semibold transition-all active:scale-[0.98] ${buttonClassName}`}
          >
            <Sparkles className="mr-1.5 h-4 w-4 text-emerald-400" />
            <span>{buttonText}</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        {submittedResult ? (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <DialogTitle className="text-xl font-bold text-foreground">
              Implementation Request Received
            </DialogTitle>

            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              {submittedResult.message}
            </p>

            <div className="rounded-xl border border-border/80 bg-muted/30 p-4 text-left text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Priority Classification:</span>
                <span className="capitalize font-bold text-primary">
                  {submittedResult.qualificationTier.replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Lead ID:</span>
                <span className="font-mono text-muted-foreground">
                  {submittedResult.leadId?.slice(0, 8) || "Recorded"}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                Antonio and the MIT engineering team review each solution architecture against production standards, data boundaries, and return on investment.
              </p>
            </div>

            <Button
              className="mt-4 w-full sm:w-auto"
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          </div>
        ) : (
          <div>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Request MIT Implementation
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Melanated In Tech designs, tests, and deploys production-grade AI systems, automated workflows, and custom agent integrations.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              {formError && (
                <div className="rounded-lg bg-destructive/10 p-2.5 text-xs font-medium text-destructive">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="lead-name" className="text-xs">
                    Your Name *
                  </Label>
                  <Input
                    id="lead-name"
                    required
                    placeholder="Jane Doe"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="lead-email" className="text-xs">
                    Work Email *
                  </Label>
                  <Input
                    id="lead-email"
                    type="email"
                    required
                    placeholder="jane@organization.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="lead-phone" className="text-xs">
                    Phone Number (Optional)
                  </Label>
                  <Input
                    id="lead-phone"
                    placeholder="(555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="lead-company" className="text-xs">
                    Company / Institution
                  </Label>
                  <Input
                    id="lead-company"
                    placeholder="Acme Inc. / State College"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="lead-org-type" className="text-xs">
                    Organization Type
                  </Label>
                  <Select value={orgType} onValueChange={setOrgType}>
                    <SelectTrigger id="lead-org-type" className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small-business">Small Business / Agency</SelectItem>
                      <SelectItem value="higher-education">College / University</SelectItem>
                      <SelectItem value="technology">Tech Company / SaaS</SelectItem>
                      <SelectItem value="healthcare">Healthcare / Practice</SelectItem>
                      <SelectItem value="enterprise">Mid-Market / Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="lead-budget" className="text-xs">
                    Implementation Budget
                  </Label>
                  <Select value={implementationBudget} onValueChange={setImplementationBudget}>
                    <SelectTrigger id="lead-budget" className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="$1,500 - $2,500">$1,500 - $2,500 (Sprint)</SelectItem>
                      <SelectItem value="$2,500 - $5,000">$2,500 - $5,000 (Standard)</SelectItem>
                      <SelectItem value="$5,000 - $10,000">$5,000 - $10,000 (Full System)</SelectItem>
                      <SelectItem value="$10,000+">$10,000+ (Enterprise Custom)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="lead-problem" className="text-xs">
                  What are you trying to accomplish? *
                </Label>
                <Textarea
                  id="lead-problem"
                  required
                  rows={3}
                  placeholder="Describe the workflow, repetitive task, or AI solution you need built..."
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  className="text-xs leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="lead-systems" className="text-xs">
                  Current Systems in Use (CRM, Database, Email, etc.)
                </Label>
                <Input
                  id="lead-systems"
                  placeholder="e.g. HubSpot, Google Workspace, PostgreSQL, Slate, Canvas"
                  value={currentSystems}
                  onChange={(e) => setCurrentSystems(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full font-semibold"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Evaluating Requirements...
                    </>
                  ) : (
                    "Submit Implementation Request"
                  )}
                </Button>
                <p className="mt-1.5 text-center text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" />
                  Your information is kept confidential and will never be shared or sold.
                </p>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
