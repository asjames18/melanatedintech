import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Cpu, Copy, Download, Sparkles, Server, Plus, Folder, HelpCircle, Terminal, Trash2 } from "lucide-react";
import { buildSeoMeta, ldScript, breadcrumbLd } from "@/lib/seo";
import { ToolCrossSell } from "@/components/tool-cross-sell";
import { trackEvent } from "@/lib/analytics";

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
