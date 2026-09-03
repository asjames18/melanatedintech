import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Cpu, Copy, Download, Sparkles, Server, Plus, Folder, HelpCircle, Terminal, Trash2, Github, Star, GitFork, ExternalLink, Search, Check } from "lucide-react";
import { buildSeoMeta, ldScript, breadcrumbLd } from "@/lib/seo";
import { ToolCrossSell } from "@/components/tool-cross-sell";
import { ToolGuide } from "@/components/tool-guide";
import { trackEvent } from "@/lib/analytics";
import { fetchTrendingMcpServers, GitHubMcpRepo } from "@/lib/public-apis.functions";

const GUIDE_DATA = {
  whatItIs: "A visual Model Context Protocol (MCP) server environment builder for connecting AI agents to external tools and databases.",
  whyUseIt: "Generates syntactically correct JSON & SDK code configurations for Claude Desktop, Cursor, Roo Code, Python, and TypeScript without manual JSON formatting errors.",
  howToUse: [
    "Select MCP tools from the built-in catalog (Filesystem, Postgres, GitHub, Stripe, Slack, Brave Search, Memory, Puppeteer) or click '+ Add Custom' for internal company APIs.",
    "Enter required API keys and environment variables in the credential input fields.",
    "Select your target export format tab (Claude Desktop, Cursor, Roo/Cline, Python, TS) and click 'Copy Config' or 'Download Config'.",
  ],
};

export const Route = createFileRoute("/tools/mcp-builder")({
  head: () => {
    const seo = buildSeoMeta({
      title: "MCP Config & Server Builder — Melanated In Tech",
      description:
        "Visual Model Context Protocol (MCP) server & config generator. Export claude_desktop_config.json, Cursor mcp.json, Roo Code, Python and TS code.",
      url: "/tools/mcp-builder",
    });
    return {
      meta: seo.meta,
      links: seo.links,
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "AI Tools", path: "/tools" },
            { name: "MCP Config Generator", path: "/tools/mcp-builder" },
          ]),
        ),
      ],
    };
  },
  component: McpBuilderPage,
});

interface McpServerOption {
  id: string;
  name: string;
  command: string;
  args: string[];
  envKeys: string[];
  description: string;
  isCustom?: boolean;
}

const BUILTIN_SERVERS: McpServerOption[] = [
  {
    id: "filesystem",
    name: "Filesystem Access",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem", "C:/Users/Public"],
    envKeys: [],
    description: "Read, write, and list files inside designated local directories.",
  },
  {
    id: "postgres",
    name: "PostgreSQL Database",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-postgres", "postgresql://user:pass@localhost:5432/db"],
    envKeys: ["POSTGRES_URL"],
    description: "Query schema, inspect tables, and execute SQL queries safely.",
  },
  {
    id: "github",
    name: "GitHub Repository API",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-github"],
    envKeys: ["GITHUB_PERSONAL_ACCESS_TOKEN"],
    description: "Search repos, create issues, manage PRs and read commits.",
  },
  {
    id: "stripe",
    name: "Stripe Payment Gateway",
    command: "npx",
    args: ["-y", "@stripe/mcp"],
    envKeys: ["STRIPE_SECRET_KEY"],
    description: "Search customers, fetch subscriptions, inspect invoices and events.",
  },
  {
    id: "slack",
    name: "Slack Team Workspace",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-slack"],
    envKeys: ["SLACK_BOT_TOKEN", "SLACK_TEAM_ID"],
    description: "Read channels, post messages, and reply to threads in Slack.",
  },
  {
    id: "brave",
    name: "Brave Web Search API",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-brave-search"],
    envKeys: ["BRAVE_API_KEY"],
    description: "Perform privacy-first web searches and extract page content.",
  },
  {
    id: "memory",
    name: "Memory & Knowledge Graph",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-memory"],
    envKeys: [],
    description: "Persistent graph-based memory for agents across user sessions.",
  },
  {
    id: "puppeteer",
    name: "Puppeteer Web Automation",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-puppeteer"],
    envKeys: [],
    description: "Automate browser interactions, fill forms, and take screenshots.",
  },
  {
    id: "fetch",
    name: "Web Fetch & HTML Parser",
    command: "uvx",
    args: ["mcp-server-fetch"],
    envKeys: [],
    description: "Fetch web URLs, parse HTML content, and convert to markdown text.",
  },
  {
    id: "sqlite",
    name: "SQLite Database Engine",
    command: "uvx",
    args: ["mcp-server-sqlite", "--db-path", "./data.db"],
    envKeys: [],
    description: "Perform lightweight SQL database inspection and analytics.",
  },
  {
    id: "gdrive",
    name: "Google Drive & Workspace",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-gdrive"],
    envKeys: ["GDRIVE_CLIENT_ID", "GDRIVE_CLIENT_SECRET"],
    description: "Access, read, and search Google Docs, Sheets, and Drive files.",
  },
  {
    id: "supabase",
    name: "Supabase Database & Auth",
    command: "npx",
    args: ["-y", "@supabase/mcp-server-supabase"],
    envKeys: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
    description: "Query Supabase tables, manage auth policies, and view storage buckets.",
  },
];

function McpBuilderPage() {
  const [servers, setServers] = useState<McpServerOption[]>(BUILTIN_SERVERS);
  const [selectedServers, setSelectedServers] = useState<string[]>(["filesystem", "github", "stripe"]);
  const [envValues, setEnvValues] = useState<Record<string, string>>({
    GITHUB_PERSONAL_ACCESS_TOKEN: "ghp_xxxxxxxxxxxxxxxxxxxx",
    STRIPE_SECRET_KEY: "sk_test_51xxxxxxxxxxxxxxxxxxxx",
    POSTGRES_URL: "postgresql://postgres:password@localhost:5432/mydb",
    SLACK_BOT_TOKEN: "xoxb-xxxxxxxxxxxxxxxxxxxx",
    SLACK_TEAM_ID: "T01234567",
    BRAVE_API_KEY: "BSA_xxxxxxxxxxxxxxxxxxxx",
  });

  const [activeTab, setActiveTab] = useState<"claude" | "cursor" | "vscode" | "python" | "typescript">("claude");
  const [repoSearch, setRepoSearch] = useState("");
  const [trendingRepos, setTrendingRepos] = useState<GitHubMcpRepo[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  // GitHub search is unauthenticated and rate-limited, so an empty directory
  // has two very different meanings. Track which one we are looking at rather
  // than telling the reader everything is already imported.
  const [reposUnavailable, setReposUnavailable] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingRepos(true);
      fetchTrendingMcpServers({ data: { limit: 12, query: repoSearch } })
        .then((repos) => {
          const list = repos as GitHubMcpRepo[];
          setTrendingRepos(list);
          setReposUnavailable(list.length === 0 && !repoSearch.trim());
        })
        .catch((err) => {
          console.warn("Failed loading trending repos:", err);
          setTrendingRepos([]);
          setReposUnavailable(true);
        })
        .finally(() => setIsLoadingRepos(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [repoSearch]);

  // Exclude repos that are already added/imported into active servers list
  const availableDirectoryRepos = useMemo(() => {
    return trendingRepos.filter((repo) => {
      const ghId = `gh-${repo.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
      return !servers.some(
        (s) =>
          s.id === ghId ||
          s.id.toLowerCase() === repo.name.toLowerCase() ||
          s.name.toLowerCase() === repo.name.toLowerCase()
      );
    });
  }, [trendingRepos, servers]);

  const handleImportGithubRepo = (repo: GitHubMcpRepo) => {
    const id = `gh-${repo.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    if (servers.some((s) => s.id === id)) {
      toast.info(`Server "${repo.name}" is already in your active server list.`);
      if (!selectedServers.includes(id)) {
        setSelectedServers((prev) => [...prev, id]);
      }
      return;
    }

    const newServer: McpServerOption = {
      id,
      name: repo.name,
      command: "npx",
      args: ["-y", repo.full_name],
      envKeys: [],
      description: repo.description || `Community MCP server from GitHub (${repo.stargazers_count} stars)`,
      isCustom: true,
    };

    setServers((prev) => [newServer, ...prev]);
    setSelectedServers((prev) => [...prev, id]);
    toast.success(`Imported "${repo.name}" to your config!`);
  };

  // Custom server modal / form state
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCommand, setCustomCommand] = useState("npx");
  const [customArgs, setCustomArgs] = useState("-y my-mcp-server");
  const [customEnvs, setCustomEnvs] = useState("MY_API_KEY");

  const toggleServer = (id: string) => {
    if (selectedServers.includes(id)) {
      setSelectedServers(selectedServers.filter((s) => s !== id));
    } else {
      setSelectedServers([...selectedServers, id]);
    }
  };

  const handleEnvChange = (key: string, val: string) => {
    setEnvValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleAddCustomServer = () => {
    if (!customName.trim()) {
      toast.warning("Please enter a custom server name.");
      return;
    }

    const id = `custom-${Date.now()}`;
    const newServer: McpServerOption = {
      id,
      name: customName.trim(),
      command: customCommand.trim() || "npx",
      args: customArgs.split(" ").filter(Boolean),
      envKeys: customEnvs.split(",").map((s) => s.trim()).filter(Boolean),
      description: "Custom user-defined MCP server instance.",
      isCustom: true,
    };

    setServers((prev) => [...prev, newServer]);
    setSelectedServers((prev) => [...prev, id]);
    setShowCustomForm(false);
    setCustomName("");
    setCustomArgs("");
    setCustomEnvs("");
    toast.success(`Custom MCP server "${newServer.name}" added!`);
  };

  const handleRemoveCustomServer = (id: string) => {
    setServers((prev) => prev.filter((s) => s.id !== id));
    setSelectedServers((prev) => prev.filter((s) => s !== id));
    toast.info("Custom server removed.");
  };

  // Derived Config JSON
  const configJson = useMemo(() => {
    const mcpServersRecord: Record<string, any> = {};
    servers.filter((s) => selectedServers.includes(s.id)).forEach((s) => {
      const envObj: Record<string, string> = {};
      s.envKeys.forEach((k) => {
        if (envValues[k]) envObj[k] = envValues[k];
      });

      mcpServersRecord[s.id] = {
        command: s.command,
        args: s.args,
        ...(Object.keys(envObj).length > 0 ? { env: envObj } : {}),
      };
    });

    return JSON.stringify({ mcpServers: mcpServersRecord }, null, 2);
  }, [servers, selectedServers, envValues]);

  // Derived Python Code
  const pythonCode = useMemo(() => {
    const selected = servers.filter((s) => selectedServers.includes(s.id));
    let code = `import asyncio\nfrom mcp import ClientSession, StdioServerParameters\nfrom mcp.client.stdio import stdio_client\n\nasync function main():\n`;
    selected.forEach((s) => {
      code += `    # Connected MCP Tool: ${s.name}\n    server_params_${s.id.replace(/-/g, "_")} = StdioServerParameters(\n        command="${s.command}",\n        args=${JSON.stringify(s.args)},\n    )\n`;
    });
    code += `\nif __name__ == "__main__":\n    asyncio.run(main())\n`;
    return code;
  }, [servers, selectedServers]);

  // Derived TypeScript Code
  const typescriptCode = useMemo(() => {
    const selected = servers.filter((s) => selectedServers.includes(s.id));
    let code = `import { Client } from "@modelcontextprotocol/sdk/client/index.js";\nimport { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";\n\nasync function initMcpClients() {\n`;
    selected.forEach((s) => {
      const cleanId = s.id.replace(/-/g, "_");
      code += `  // ${s.name}\n  const transport_${cleanId} = new StdioClientTransport({\n    command: "${s.command}",\n    args: ${JSON.stringify(s.args)}\n  });\n  const client_${cleanId} = new Client({ name: "app-client", version: "1.0.0" });\n  await client_${cleanId}.connect(transport_${cleanId});\n\n`;
    });
    code += `}\n`;
    return code;
  }, [servers, selectedServers]);

  const outputContent = useMemo(() => {
    if (activeTab === "python") return pythonCode;
    if (activeTab === "typescript") return typescriptCode;
    return configJson;
  }, [activeTab, configJson, pythonCode, typescriptCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(outputContent).then(
      () => {
        trackEvent("mcp_builder_action", { action: "copy", tab: activeTab });
        toast.success(`Copied ${activeTab.toUpperCase()} config!`);
      },
      () => toast.error("Failed to copy.")
    );
  };

  const handleDownload = () => {
    const filename =
      activeTab === "claude"
        ? "claude_desktop_config.json"
        : activeTab === "cursor"
        ? "mcp.json"
        : activeTab === "vscode"
        ? "cline_mcp_settings.json"
        : activeTab === "python"
        ? "mcp_client.py"
        : "mcp_client.ts";
    const blob = new Blob([outputContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    trackEvent("mcp_builder_action", { action: "download", tab: activeTab });
    toast.success(`Downloaded ${filename}!`);
  };

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Interactive Utilities"
        title="MCP Config & Server Builder."
        description="Visual Model Context Protocol (MCP) server environment builder. Connect AI agents to databases, APIs, GitHub, Stripe, and filesystems with 1-click exports."
      />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ToolGuide guide={GUIDE_DATA} />
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Server Checklist & Envs (Col-span 6) */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="font-display text-lg font-bold flex items-center gap-2">
                    <Server className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    MCP Tools Catalog ({selectedServers.length} active)
                  </CardTitle>
                  <CardDescription>Select MCP servers to equip your AI agent workspace</CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCustomForm(!showCustomForm)}
                  className="gap-1 text-xs shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Custom
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Custom Add Form */}
                {showCustomForm && (
                  <div className="p-4 border border-indigo-200 bg-indigo-50/50 dark:border-indigo-900/50 dark:bg-indigo-950/20 rounded-xl space-y-3 mb-4">
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 block">
                      Add Custom Internal MCP Server
                    </span>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input
                        placeholder="Server Name (e.g. Internal DB)"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="text-xs"
                      />
                      <Input
                        placeholder="Command (e.g. npx, python)"
                        value={customCommand}
                        onChange={(e) => setCustomCommand(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                    <Input
                      placeholder="Space-separated args (e.g. -y @org/custom-mcp)"
                      value={customArgs}
                      onChange={(e) => setCustomArgs(e.target.value)}
                      className="text-xs font-mono"
                    />
                    <Input
                      placeholder="Comma-separated env keys (e.g. API_KEY, DB_URL)"
                      value={customEnvs}
                      onChange={(e) => setCustomEnvs(e.target.value)}
                      className="text-xs font-mono"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <Button size="sm" variant="ghost" onClick={() => setShowCustomForm(false)} className="text-xs">
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleAddCustomServer} className="text-xs">
                        Add Server
                      </Button>
                    </div>
                  </div>
                )}

                {servers.map((server) => {
                  const isChecked = selectedServers.includes(server.id);
                  return (
                    <label
                      key={server.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer relative ${
                        isChecked
                          ? "border-primary bg-primary/5 dark:bg-primary/10"
                          : "border-border hover:bg-muted/40"
                      }`}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleServer(server.id)}
                        className="mt-0.5"
                      />
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">{server.name}</span>
                            <span className="font-mono text-[10px] bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">
                              {server.command}
                            </span>
                          </div>
                          {server.isCustom && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveCustomServer(server.id);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-snug">{server.description}</p>
                      </div>
                    </label>
                  );
                })}
              </CardContent>
            </Card>

            {/* Environment Variables Inputs */}
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Environment Variables & API Keys</CardTitle>
                <CardDescription className="text-xs">
                  Credentials to embed safely into your local config file.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from(
                  new Set(
                    servers.filter((s) => selectedServers.includes(s.id)).flatMap((s) => s.envKeys)
                  )
                ).map((envKey) => (
                  <div key={envKey} className="space-y-1">
                    <Label htmlFor={envKey} className="text-xs font-mono font-semibold">
                      {envKey}
                    </Label>
                    <Input
                      id={envKey}
                      value={envValues[envKey] ?? ""}
                      onChange={(e) => handleEnvChange(envKey, e.target.value)}
                      placeholder={`Enter ${envKey}...`}
                      className="font-mono text-xs"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Live GitHub MCP Directory Card */}
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                    <Github className="h-4 w-4 text-emerald-500" /> Live GitHub MCP Directory
                  </CardTitle>
                  <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                    GitHub REST API
                  </span>
                </div>
                <CardDescription className="text-xs">
                  Discover, search, and 1-click import verified open-source MCP tools.
                </CardDescription>

                {/* Search Bar */}
                <div className="pt-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search MCP tools (e.g. notion, database, slack, puppeteer)..."
                      value={repoSearch}
                      onChange={(e) => setRepoSearch(e.target.value)}
                      className="pl-8 text-xs font-mono h-8 bg-background"
                    />
                  </div>

                  {/* Quick Tag Pills */}
                  <div className="flex flex-wrap items-center gap-1 pt-2">
                    {["Popular", "Database", "Search", "Automation", "Notion", "Slack"].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setRepoSearch(tag === "Popular" ? "" : tag.toLowerCase())}
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full border transition-all ${
                          (tag === "Popular" && !repoSearch) || repoSearch.toLowerCase() === tag.toLowerCase()
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/40 text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-2 text-xs">
                {isLoadingRepos ? (
                  <p className="text-muted-foreground animate-pulse py-2 text-center">
                    Searching GitHub repositories...
                  </p>
                ) : reposUnavailable ? (
                  <div className="p-4 rounded-lg border border-dashed border-border bg-muted/20 text-center space-y-1">
                    <p className="font-semibold text-foreground text-xs">GitHub directory unavailable</p>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      The public GitHub search API did not respond or is rate-limited. Everything
                      else on this page still works; try the directory again in a few minutes.
                    </p>
                  </div>
                ) : availableDirectoryRepos.length === 0 ? (
                  <div className="p-4 rounded-lg border border-dashed border-border bg-muted/20 text-center space-y-1">
                    <Check className="h-5 w-5 text-emerald-500 mx-auto" />
                    <p className="font-semibold text-foreground text-xs">All matching MCP tools are in your active list!</p>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      Deleting any imported server from your configuration above will return it here.
                    </p>
                  </div>
                ) : (
                  availableDirectoryRepos.map((repo) => (
                    <div
                      key={repo.id}
                      className="p-2.5 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-all flex items-start justify-between gap-2"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5 font-semibold text-foreground truncate">
                          <span className="truncate">{repo.name}</span>
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground shrink-0"
                            title="View on GitHub"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {repo.description || "Open source Model Context Protocol server."}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono pt-1">
                          <span className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 text-amber-500 fill-amber-500" /> {repo.stargazers_count}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <GitFork className="h-3 w-3" /> {repo.forks_count}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-[11px] shrink-0 font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => handleImportGithubRepo(repo)}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Import
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Placement Path Guide */}
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Folder className="h-4 w-4 text-indigo-500" /> Config Installation File Paths
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-foreground block">Claude Desktop (Windows):</span>
                  <code className="bg-muted px-2 py-0.5 rounded text-[11px] font-mono text-muted-foreground block truncate">
                    %APPDATA%\Claude\claude_desktop_config.json
                  </code>
                </div>
                <div>
                  <span className="font-semibold text-foreground block">Claude Desktop (macOS):</span>
                  <code className="bg-muted px-2 py-0.5 rounded text-[11px] font-mono text-muted-foreground block truncate">
                    ~/Library/Application Support/Claude/claude_desktop_config.json
                  </code>
                </div>
                <div>
                  <span className="font-semibold text-foreground block">Cursor IDE (Project-level):</span>
                  <code className="bg-muted px-2 py-0.5 rounded text-[11px] font-mono text-muted-foreground block truncate">
                    your-project-folder/.cursor/mcp.json
                  </code>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Code Export Preview (Col-span 6) */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="border border-border bg-card shadow-sm sticky top-20">
              <CardHeader>
                <CardTitle className="font-display text-xl font-bold flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Generated MCP Environment
                </CardTitle>
                <CardDescription>Ready-to-use config for AI Desktop Apps & Code SDKs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Format Tabs */}
                <div className="flex flex-wrap items-center gap-1 bg-muted p-1 rounded-lg">
                  {[
                    { id: "claude", label: "Claude Desktop" },
                    { id: "cursor", label: "Cursor" },
                    { id: "vscode", label: "Roo / Cline" },
                    { id: "python", label: "Python SDK" },
                    { id: "typescript", label: "TS SDK" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 px-2 py-1 text-[11px] font-semibold rounded-md transition-all ${
                        activeTab === tab.id
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Output Text Container */}
                <div className="rounded-lg border border-border bg-muted/40 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-[460px] overflow-y-auto select-all">
                  {outputContent}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button variant="outline" onClick={handleDownload} className="gap-1.5">
                    <Download className="h-4 w-4" /> Download Config
                  </Button>
                  <Button onClick={handleCopy} className="gap-1.5">
                    <Copy className="h-4 w-4" /> Copy Config
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <ToolCrossSell tool="mcp-builder" />
      </main>
    </SiteLayout>
  );
}
