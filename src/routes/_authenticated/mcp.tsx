import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  listPublicMcpServers,
  listMyMcpServers,
  upsertMcpServer,
  deleteMcpServer,
  type McpServerRow,
} from "@/lib/mcp.functions";
import { toast } from "sonner";
import {
  ExternalLink,
  Plus,
  Search,
  Server,
  Trash2,
  Plug,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/mcp")({
  component: McpPage,
});

function McpPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <PageHeader
        title="MCP Server Registry"
        description="Browse, add, and connect to Model Context Protocol servers from any provider."
      />
      <Tabs defaultValue="browse" className="mt-6">
        <TabsList>
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="my">My Servers</TabsTrigger>
        </TabsList>
        <TabsContent value="browse">
          <BrowsePanel />
        </TabsContent>
        <TabsContent value="my">
          <MyServersPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BrowsePanel() {
  const [search, setSearch] = useState("");
  const [provider, setProvider] = useState<string>("all");

  const servers = useQuery({
    queryKey: ["mcp-public", provider, search],
    queryFn: () =>
      listPublicMcpServers({
        data: {
          provider:
            provider === "all" ? undefined : (provider as "anthropic" | "openai" | "custom"),
          search: search || undefined,
        },
      }),
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search servers…"
            className="pl-9"
          />
        </div>
        <Select value={provider} onValueChange={setProvider}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All providers</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {servers.isLoading && (
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg border bg-muted/50" />
          ))}
        </div>
      )}

      {servers.data && servers.data.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No public servers found. Try a different filter or submit one below.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {servers.data?.map((s) => (
          <McpServerCard key={s.id} server={s} />
        ))}
      </div>
    </div>
  );
}

type PublicMcpServer = Pick<
  McpServerRow,
  "id" | "name" | "description" | "url" | "provider" | "category" | "tags" | "created_at"
>;

function McpServerCard({ server }: { server: PublicMcpServer }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-primary" />
          <h3 className="font-medium">{server.name}</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {server.provider}
        </Badge>
      </div>
      {server.description && (
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{server.description}</p>
      )}
      <div className="mt-3 flex flex-wrap gap-1">
        {server.tags.slice(0, 4).map((tag) => (
          <Badge key={tag} variant="secondary" className="text-[10px]">
            {tag}
          </Badge>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <a
          href={server.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <ExternalLink className="h-3 w-3" /> Open endpoint
        </a>
        <Button size="sm" variant="outline" className="ml-auto h-7 text-xs">
          <Plug className="mr-1 h-3 w-3" /> Connect
        </Button>
      </div>
    </div>
  );
}

function MyServersPanel() {
  const qc = useQueryClient();
  const servers = useQuery({
    queryKey: ["mcp-mine"],
    queryFn: () => listMyMcpServers(),
  });
  const [open, setOpen] = useState(false);

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteMcpServer({ data: { id } }),
    onSuccess: () => {
      toast.success("Server removed.");
      qc.invalidateQueries({ queryKey: ["mcp-mine"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" /> Add server
            </Button>
          </DialogTrigger>
          <McpServerForm
            onClose={() => {
              setOpen(false);
              qc.invalidateQueries({ queryKey: ["mcp-mine"] });
            }}
          />
        </Dialog>
      </div>

      {servers.isLoading && <div className="h-32 animate-pulse rounded-lg border bg-muted/50" />}

      {servers.data && servers.data.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          You haven't submitted any servers yet. Click "Add server" to register one.
        </div>
      )}

      <div className="space-y-3">
        {servers.data?.map((s) => (
          <div key={s.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{s.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {s.provider}
                  </Badge>
                  {s.is_approved ? (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Approved
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="mr-1 h-3 w-3" /> Pending
                    </Badge>
                  )}
                </div>
                {s.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">URL: {s.url}</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive"
                onClick={() => deleteMut.mutate(s.id)}
                disabled={deleteMut.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function McpServerForm({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const upsert = useServerFn(upsertMcpServer);
  const [form, setForm] = useState({
    name: "",
    description: "",
    url: "",
    provider: "custom" as "anthropic" | "openai" | "custom",
    category: "general",
    tags: "",
    is_public: false,
  });

  const handleSubmit = async () => {
    try {
      await upsert({
        data: {
          name: form.name,
          description: form.description || null,
          url: form.url,
          provider: form.provider,
          category: form.category,
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          is_public: form.is_public,
        },
      });
      toast.success("Server submitted for review.");
      qc.invalidateQueries({ queryKey: ["mcp-mine"] });
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    }
  };

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Add MCP Server</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="My MCP Server"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Endpoint URL</label>
          <Input
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://mcp.example.com/sse"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Provider</label>
            <Select
              value={form.provider}
              onValueChange={(v) => setForm({ ...form, provider: v as typeof form.provider })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Custom</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Category</label>
            <Input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="general"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What does this server provide?"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Tags (comma-separated)</label>
          <Input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="tools, search, data"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_public}
            onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
            className="rounded border-gray-300"
          />
          Submit to public registry (requires admin approval)
        </label>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!form.name || !form.url}>
          Submit
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
