import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Cpu, Copy, Download, Sparkles, Server, CheckCircle2 } from "lucide-react";
import { buildSeoMeta, ldScript, breadcrumbLd } from "@/lib/seo";
import { ToolCrossSell } from "@/components/tool-cross-sell";
import { trackEvent } from "@/lib/analytics";

export const Route = createFileRoute("/tools/mcp-builder")({
  head: () => {
    const seo = buildSeoMeta({
      title: "MCP Config Generator — Melanated In Tech",
      description:
        "Visual config generator for Model Context Protocol (MCP). Export claude_desktop_config.json, Cursor mcp.json, Python and TS code.",
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
}

const MCP_SERVERS: McpServerOption[] = [
  {
    id: "filesystem",
    name: "Filesystem Access",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/dir"],
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
  const [selectedServers, setSelectedServers] = useState<string[]>(["filesystem", "github"]);
  const [envValues, setEnvValues] = useState<Record<string, string>>({
    GITHUB_PERSONAL_ACCESS_TOKEN: "ghp_xxxxxxxxxxxxxxxxxxxx",
    STRIPE_SECRET_KEY: "sk_test_51xxxxxxxxxxxxxxxxxxxx",
    POSTGRES_URL: "postgresql://postgres:password@localhost:5432/mydb",
  });
  const [activeTab, setActiveTab] = useState<"claude" | "cursor" | "python" | "typescript">("claude");

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

  // Derived Claude Config JSON
  const claudeConfigJson = useMemo(() => {
    const mcpServersRecord: Record<string, any> = {};
    MCP_SERVERS.filter((s) => selectedServers.includes(s.id)).forEach((s) => {
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
  }, [selectedServers, envValues]);

  // Derived Cursor Config JSON
  const cursorConfigJson = useMemo(() => {
    return claudeConfigJson;
  }, [claudeConfigJson]);

  // Derived Python Client Code
  const pythonCode = useMemo(() => {
    const selected = MCP_SERVERS.filter((s) => selectedServers.includes(s.id));
    let code = `import asyncio\nfrom mcp import ClientSession, StdioServerParameters\nfrom mcp.client.stdio import stdio_client\n\nasync function main():\n`;
    selected.forEach((s) => {
      code += `    # Setup ${s.name}\n    server_params_${s.id} = StdioServerParameters(\n        command="${s.command}",\n        args=${JSON.stringify(s.args)},\n    )\n`;
    });
    code += `\nif __name__ == "__main__":\n    asyncio.run(main())\n`;
    return code;
  }, [selectedServers]);

  // Derived TypeScript Client Code
  const typescriptCode = useMemo(() => {
    const selected = MCP_SERVERS.filter((s) => selectedServers.includes(s.id));
    let code = `import { Client } from "@modelcontextprotocol/sdk/client/index.js";\nimport { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";\n\nasync function initMcpClients() {\n`;
    selected.forEach((s) => {
      code += `  // ${s.name}\n  const transport_${s.id} = new StdioClientTransport({\n    command: "${s.command}",\n    args: ${JSON.stringify(s.args)}\n  });\n  const client_${s.id} = new Client({ name: "app-client", version: "1.0.0" });\n  await client_${s.id}.connect(transport_${s.id});\n\n`;
    });
    code += `}\n`;
    return code;
  }, [selectedServers]);

  const outputContent = useMemo(() => {
    if (activeTab === "cursor") return cursorConfigJson;
    if (activeTab === "python") return pythonCode;
    if (activeTab === "typescript") return typescriptCode;
    return claudeConfigJson;
  }, [activeTab, claudeConfigJson, cursorConfigJson, pythonCode, typescriptCode]);

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
        title="MCP Config Generator."
        description="Visual Model Context Protocol (MCP) server builder. Connect AI agents to databases, GitHub, Stripe, and file systems with 1-click config exports."
      />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Server Checklist & Envs (Col-span 6) */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="font-display text-lg font-bold flex items-center gap-2">
                  <Server className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Select MCP Tools & Servers
                </CardTitle>
                <CardDescription>Check tools to attach to your AI agent environment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {MCP_SERVERS.map((server) => {
                  const isChecked = selectedServers.includes(server.id);
                  return (
                    <label
                      key={server.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
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
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{server.name}</span>
                          <span className="font-mono text-[10px] bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">
                            {server.command}
                          </span>
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
                  Fill in your credentials to embed them into your exported config file.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from(
                  new Set(
                    MCP_SERVERS.filter((s) => selectedServers.includes(s.id)).flatMap((s) => s.envKeys)
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
          </div>

          {/* Right Column: Code Export Preview (Col-span 6) */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="border border-border bg-card shadow-sm sticky top-20">
              <CardHeader>
                <CardTitle className="font-display text-xl font-bold flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Generated MCP Config
                </CardTitle>
                <CardDescription>Ready-to-use config for Claude Desktop, Cursor, or code SDKs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Format Tabs */}
                <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                  {[
                    { id: "claude", label: "Claude Desktop" },
                    { id: "cursor", label: "Cursor IDE" },
                    { id: "python", label: "Python SDK" },
                    { id: "typescript", label: "TypeScript SDK" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
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
                <div className="rounded-lg border border-border bg-muted/40 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-[420px] overflow-y-auto select-all">
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
