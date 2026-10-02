import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Brain, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  getMemorySettings,
  setAgentMemoryEnabled,
  clearAgentMemories,
} from "@/lib/agent-memory.functions";

/**
 * Agent memory settings — paid bundle redeemers only. Renders nothing for
 * everyone else (free tier gets no memory and no UI). When the migration
 * hasn't landed yet, shows a quiet "setting up" note instead of controls.
 */
export function AgentMemorySettings() {
  const qc = useQueryClient();
  const getSettings = useServerFn(getMemorySettings);
  const setEnabled = useServerFn(setAgentMemoryEnabled);
  const clearMemories = useServerFn(clearAgentMemories);

  const settings = useQuery({
    queryKey: ["agent-memory-settings"],
    queryFn: () => getSettings(),
  });

  const [toggling, setToggling] = useState(false);
  const [clearing, setClearing] = useState(false);

  const data = settings.data;
  if (settings.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }
  if (settings.isError || !data || !data.isRedeemer) {
    // Free tier: no memory, no UI. Errors fail soft to nothing.
    return null;
  }

  const onToggle = async (enabled: boolean) => {
    setToggling(true);
    try {
      await setEnabled({ data: { enabled } });
      await qc.invalidateQueries({ queryKey: ["agent-memory-settings"] });
      toast.success(enabled ? "Agent memory turned on." : "Agent memory turned off.");
    } catch {
      toast.error("Could not save the memory setting — please try again.");
    } finally {
      setToggling(false);
    }
  };

  const onClear = async () => {
    setClearing(true);
    try {
      const res = await clearMemories();
      await qc.invalidateQueries({ queryKey: ["agent-memory-settings"] });
      toast.success(
        res.deleted > 0
          ? `Forgot everything (${res.deleted} ${res.deleted === 1 ? "note" : "notes"} deleted).`
          : "There was nothing to forget.",
      );
    } catch {
      toast.error("Could not clear memories — please try again.");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-primary/10 p-2.5">
          <Brain className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">Agent memory</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Your agents remember the important stuff — your name, business, goals, and
            preferences — so every conversation picks up where the last one left off.
            Notes are shared across your five agents unless you ask one to keep
            something between you. In any chat you can also say{" "}
            <span className="font-medium text-foreground">“remember that …”</span>,{" "}
            <span className="font-medium text-foreground">“keep this between us …”</span>,
            or <span className="font-medium text-foreground">“forget that …”</span>.
          </p>
        </div>
      </div>

      {!data.provisioned ? (
        <p className="text-sm text-muted-foreground rounded-xl bg-muted/40 border border-border p-4">
          Agent memory is being set up on your account — check back soon.
        </p>
      ) : (
        <>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/30 p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Remember me</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {data.enabled
                  ? `On — ${data.memoryCount} ${data.memoryCount === 1 ? "note" : "notes"} saved.`
                  : "Off — your agents won't save or use memory notes."}
              </p>
            </div>
            <Switch
              checked={data.enabled}
              disabled={toggling}
              onCheckedChange={onToggle}
              aria-label="Toggle agent memory"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground max-w-md">
              Forgetting is permanent — every note across all five agents is deleted.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={clearing} className="rounded-xl">
                  <Trash2 className="h-4 w-4 mr-2" /> Forget everything
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Forget everything?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently deletes all {data.memoryCount} saved{" "}
                    {data.memoryCount === 1 ? "note" : "notes"}. Your agents will no
                    longer remember anything about you. This can't be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onClear}>Forget everything</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
    </div>
  );
}
