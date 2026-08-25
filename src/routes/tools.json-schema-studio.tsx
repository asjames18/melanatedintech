import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { ToolCrossSell } from "@/components/tool-cross-sell";
import { buildSeoMeta } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";
import {
  Code2,
  Copy,
  Check,
  Plus,
  Trash2,
  FileCode,
  Sparkles,
  Layers,
} from "lucide-react";

export const Route = createFileRoute("/tools/json-schema-studio")({
  head: () => ({
    ...buildSeoMeta({
      title: "Structured Output & JSON Schema Studio — Melanated In Tech",
      description:
        "Visually build and export JSON Schema, Zod TypeScript, and Pydantic Python schemas for OpenAI Function Calling & Structured AI Outputs.",
      url: "/tools/json-schema-studio",
    }),
  }),
  component: JsonSchemaStudio,
});

type OutputFormat = "zod" | "pydantic" | "json-schema";

interface Property {
  id: string;
  name: string;
  type: "string" | "number" | "boolean" | "array";
  description: string;
  required: boolean;
}

export function JsonSchemaStudio() {
  const [schemaName, setSchemaName] = useState("LeadAssessment");
  const [format, setFormat] = useState<OutputFormat>("zod");
  const [properties, setProperties] = useState<Property[]>([
    {
      id: "1",
      name: "customerName",
      type: "string",
      description: "Full name of the inquiring customer",
      required: true,
    },
    {
      id: "2",
      name: "urgencyScore",
      type: "number",
      description: "Urgency rating from 1 (low) to 5 (critical)",
      required: true,
    },
    {
      id: "3",
      name: "existingClient",
      type: "boolean",
      description: "Whether caller matches an existing CRM contact record",
      required: false,
    },
    {
      id: "4",
      name: "requestedServices",
      type: "array",
      description: "List of services mentioned during intake call",
      required: true,
    },
  ]);

  const [copied, setCopied] = useState(false);

  const addProperty = () => {
    setProperties([
      ...properties,
      {
        id: Date.now().toString(),
        name: `field_${properties.length + 1}`,
        type: "string",
        description: "Field description for AI prompt context",
        required: true,
      },
    ]);
  };

  const removeProperty = (id: string) => {
    setProperties(properties.filter((p) => p.id !== id));
  };

  const updateProperty = (id: string, field: keyof Property, value: any) => {
    setProperties(properties.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const generateCode = () => {
    if (format === "zod") {
      const fields = properties
        .map((p) => {
          let t = p.type === "string" ? "z.string()" : p.type === "number" ? "z.number()" : p.type === "boolean" ? "z.boolean()" : "z.array(z.string())";
          if (p.description) t += `.describe(${JSON.stringify(p.description)})`;
          if (!p.required) t += `.optional()`;
          return `  ${p.name}: ${t},`;
        })
        .join("\n");
      return `import { z } from "zod";\n\nexport const ${schemaName}Schema = z.object({\n${fields}\n});\n\nexport type ${schemaName} = z.infer<typeof ${schemaName}Schema>;`;
    }

    if (format === "pydantic") {
      const fields = properties
        .map((p) => {
          let pyType = p.type === "string" ? "str" : p.type === "number" ? "float" : p.type === "boolean" ? "bool" : "List[str]";
          if (!p.required) pyType = `Optional[${pyType}] = None`;
          return `    ${p.name}: ${pyType} = Field(..., description="${p.description}")`;
        })
        .join("\n");
      return `from pydantic import BaseModel, Field\nfrom typing import List, Optional\n\nclass ${schemaName}(BaseModel):\n${fields}`;
    }

    // JSON Schema
    const propsObj: Record<string, any> = {};
    const reqList: string[] = [];

    properties.forEach((p) => {
      propsObj[p.name] = {
        type: p.type === "array" ? "array" : p.type,
        ...(p.type === "array" && { items: { type: "string" } }),
        description: p.description,
      };
      if (p.required) reqList.push(p.name);
    });

    return JSON.stringify(
      {
        $schema: "http://json-schema.org/draft-07/schema#",
        title: schemaName,
        type: "object",
        properties: propsObj,
        required: reqList,
      },
      null,
      2,
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateCode());
    setCopied(true);
    trackEvent("tool_export", { tool: "json_schema_studio", format });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Interactive Workbench Tool"
        title="Structured Output & JSON Schema Studio"
        description="Visually define data structures and generate validated Zod (TypeScript), Pydantic (Python), or JSON Schema code for OpenAI Function Calling and Structured AI Agents."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Builder */}
          <div className="space-y-6 lg:col-span-7">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <label className="text-xs font-semibold uppercase tracking-wider text-primary">
                Schema Class / Type Name
              </label>
              <input
                type="text"
                value={schemaName}
                onChange={(e) => setSchemaName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-2.5 font-display text-lg font-semibold text-foreground focus:border-primary focus:outline-none"
              />

              <div className="mt-6 flex items-center justify-between border-t border-border pt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Fields ({properties.length})
                </p>
                <Button size="sm" variant="outline" onClick={addProperty} className="gap-1.5 text-xs">
                  <Plus className="h-3.5 w-3.5" /> Add Field
                </Button>
              </div>

              <div className="mt-4 space-y-4">
                {properties.map((p) => (
                  <div
                    key={p.id}
                    className="group rounded-xl border border-border bg-muted/30 p-4 transition-all hover:border-primary/40"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => updateProperty(p.id, "name", e.target.value)}
                        placeholder="fieldName"
                        className="w-1/3 rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-semibold focus:border-primary focus:outline-none"
                      />
                      <select
                        value={p.type}
                        onChange={(e) => updateProperty(p.id, "type", e.target.value as Property["type"])}
                        className="w-1/4 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-semibold focus:border-primary focus:outline-none"
                      >
                        <option value="string">string</option>
                        <option value="number">number</option>
                        <option value="boolean">boolean</option>
                        <option value="array">array (string)</option>
                      </select>
                      <label className="flex items-center gap-1 text-xs font-medium">
                        <input
                          type="checkbox"
                          checked={p.required}
                          onChange={(e) => updateProperty(p.id, "required", e.target.checked)}
                          className="accent-primary"
                        />
                        Required
                      </label>

                      {properties.length > 1 && (
                        <button
                          onClick={() => removeProperty(p.id)}
                          className="ml-auto text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={p.description}
                      onChange={(e) => updateProperty(p.id, "description", e.target.value)}
                      placeholder="Prompt description for AI structured extraction context..."
                      className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Export Code */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Output Format
                </p>
                <FileCode className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {(["zod", "pydantic", "json-schema"] as OutputFormat[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`rounded-lg border py-2 text-xs font-bold uppercase transition-colors ${
                      format === f
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="relative mt-4">
                <pre className="max-h-[380px] overflow-x-auto rounded-xl border border-border bg-slate-950 p-4 font-mono text-xs text-blue-400">
                  {generateCode()}
                </pre>
                <Button
                  size="sm"
                  onClick={handleCopy}
                  className="absolute right-3 top-3 gap-1.5 bg-primary text-xs"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy Code"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <ToolCrossSell tool="json-schema-studio" />
      </section>
    </SiteLayout>
  );
}
