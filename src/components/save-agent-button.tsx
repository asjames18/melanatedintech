import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { listMySavedAgentIds, toggleSavedAgent } from "@/lib/account.functions";

export function SaveAgentButton({ agentId }: { agentId: string }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setAuthed(!!session?.user));
    return () => sub.subscription.unsubscribe();
  }, []);

  const listFn = useServerFn(listMySavedAgentIds);
  const toggleFn = useServerFn(toggleSavedAgent);

  const saved = useQuery({
    queryKey: ["saved-agent-ids"],
    queryFn: () => listFn(),
    enabled: authed === true,
  });
  const isSaved = (saved.data ?? []).includes(agentId);

  const mut = useMutation({
    mutationFn: () => toggleFn({ data: { agentId } }),
    onSuccess: (r) => {
      toast.success(r.saved ? "Saved to your library." : "Removed from your library.");
      qc.invalidateQueries({ queryKey: ["saved-agent-ids"] });
      qc.invalidateQueries({ queryKey: ["saved-agents"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (authed === false) {
    return (
      <Button
        variant="outline"
        onClick={() => navigate({ to: "/auth", search: { redirect: window.location.pathname } })}
      >
        <Bookmark className="h-4 w-4" /> Sign in to save
      </Button>
    );
  }

  return (
    <Button
      variant={isSaved ? "default" : "outline"}
      onClick={() => mut.mutate()}
      disabled={mut.isPending || authed === null}
    >
      {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
      {isSaved ? "Saved" : "Save"}
    </Button>
  );
}
