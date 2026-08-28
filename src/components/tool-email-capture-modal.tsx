import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";
import { Mail, CheckCircle2, Sparkles, Send } from "lucide-react";

interface ToolEmailCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toolName: string;
  summaryText: string;
}

export function ToolEmailCaptureModal({
  open,
  onOpenChange,
  toolName,
  summaryText,
}: ToolEmailCaptureModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    trackEvent("starter_kit_email_captured", { tool: toolName, emailDomain: email.split("@")[1] });

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success("Audit report & AI Starter Kit sent to your inbox!");
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-card shadow-2xl rounded-2xl">
        <DialogHeader>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary mb-2">
            <Mail className="h-5 w-5" />
          </div>
          <DialogTitle className="font-display text-lg font-bold">
            Email My {toolName} Results & Starter Kit
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Get a formatted copy of your {toolName} summary delivered straight to your inbox, plus our free AI Operating Starter Kit.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-6 text-center space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="font-display text-base font-bold">Report Dispatched!</h4>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              We sent your personalized summary and AI Starter Kit to <strong className="text-foreground">{email}</strong>.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="mt-2 rounded-xl text-xs"
            >
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 text-xs">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Included in your report:
              </p>
              <p className="mt-1 text-muted-foreground line-clamp-2 italic">{summaryText}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Work Email</label>
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background rounded-xl text-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary text-primary-foreground font-semibold gap-2"
            >
              {loading ? "Dispatching..." : "Send Report & Starter Kit"}
              <Send className="h-3.5 w-3.5" />
            </Button>

            <p className="text-[10px] text-center text-muted-foreground">
              No spam ever. Explicit consent-based delivery. Unsubscribe at any time.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
