import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { listMySavedArticleIds, toggleSavedArticle } from "@/lib/account.functions";

export function SaveArticleButton({ articleId }: { articleId: string }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setAuthed(!!session?.user),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const listFn = useServerFn(listMySavedArticleIds);
  const toggleFn = useServerFn(toggleSavedArticle);

  const saved = useQuery({
    queryKey: ["saved-article-ids"],
    queryFn: () => listFn(),
    enabled: authed === true,
  });
  const isSaved = (saved.data ?? []).includes(articleId);

  const mut = useMutation({
    mutationFn: () => toggleFn({ data: { articleId } }),
    onSuccess: (r) => {
      toast.success(r.saved ? "Saved to your reading list." : "Removed from your reading list.");
      qc.invalidateQueries({ queryKey: ["saved-article-ids"] });
      qc.invalidateQueries({ queryKey: ["saved-articles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (authed === false) {
    return (
      <Button variant="outline" size="sm" onClick={() => navigate({ to: "/auth" })}>
        <Bookmark className="h-4 w-4" /> Sign in to save
      </Button>
    );
  }

  return (
    <Button
      variant={isSaved ? "default" : "outline"}
      size="sm"
      onClick={() => mut.mutate()}
      disabled={mut.isPending || authed === null}
    >
      {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
      {isSaved ? "Saved" : "Save"}
    </Button>
  );
}
