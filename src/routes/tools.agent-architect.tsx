import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  GitBranch,
  Play,
  RotateCcw,
  Sparkles,
  Download,
  Copy,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Settings,
  Terminal,
  ChevronUp,
  ChevronDown,
  Info,
  Check,
  FileCode,
} from "lucide-react";
import { buildSeoMeta, ldScript, breadcrumbLd } from "@/lib/seo";

// Define TypeScript structures for our agent blueprint
interface AgentNode {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  tools: string[];
  color: string; // Tailwind border/text color configuration
}

interface Connection {
  from: string;
  to: string;
  label?: string;
}

interface SimulationStep {
  nodeId: string;
  title: string;
  description: string;
  log: string;
  dataPassed: string;
}

// Built-in presets for popular agent patterns
const PRESETS: Record<
  string,
  {
    name: string;
    description: string;
    nodes: AgentNode[];
    connections: Connection[];
    simulationQuery: string;
    simulationSteps: SimulationStep[];
  }
> = {
  "single-agent": {
    name: "Single Agent + Tools",
    description: "A single autonomous assistant utilizing external tools for reasoning and math.",
    nodes: [
      {
        id: "assistant",
        name: "Generalist Assistant",
        role: "Helpful assistant equipped with calculators and search",
        systemPrompt:
          "You are a helpful generalist AI assistant. First analyze if the user's query requires external tools. Use the Calculator for math equations and Web Search for current facts. Synthesize the findings into a clear summary.",
        tools: ["Web Search", "Calculator"],
        color: "indigo",
      },
    ],
    connections: [],
    simulationQuery:
      "What is the current population of Tokyo, and what is that number multiplied by 1.15?",
    simulationSteps: [
      {
        nodeId: "assistant",
        title: "Query Received",
        description:
          "Assistant receives user request about Tokyo's population and math calculation.",
        log: "Received query: 'What is the current population of Tokyo, and what is that number multiplied by 1.15?'\nAnalyzing requirements...\n- Population requires real-time facts: Launching 'Web Search' tool.\n- Multiplication requires precise math: Launching 'Calculator' tool.",
        dataPassed:
          "User Query: 'What is the current population of Tokyo, and what is that number multiplied by 1.15?'",
      },
      {
        nodeId: "assistant",
        title: "Tool Execution: Web Search",
        description: "Assistant executes Web Search query to find Tokyo's population.",
        log: "Executing Web Search query: 'current population of Tokyo 2026'\nTool Response: 'Tokyo population in 2026 is approximately 37.4 million.'",
        dataPassed: "Search Result: '37.4 million people'",
      },
      {
        nodeId: "assistant",
        title: "Tool Execution: Calculator",
        description: "Assistant parses math query and executes Calculator.",
        log: "Executing calculation: 37,400,000 * 1.15\nTool Response: 43,010,000",
        dataPassed: "Calculation Output: 43,010,000",
      },
      {
        nodeId: "assistant",
        title: "Final Response Compiled",
        description: "Assistant merges the search findings and calculation output.",
        log: "Synthesizing outputs...\nGenerating response: 'The current population of Tokyo is approximately 37.4 million. Multiplied by 1.15, this is 43,010,000.'",
        dataPassed: "Final response returned to user successfully.",
      },
    ],
  },
  sequential: {
    name: "Sequential Chain",
    description:
      "A pipeline where output from one specialist agent flows directly as input to the next.",
    nodes: [
      {
        id: "planner",
        name: "Content Planner",
        role: "Structure planner and outline creator",
        systemPrompt:
          "You are a content planner. Given a topic, draft a detailed outline including key headers, focus keywords, and target reading length. Keep it concise.",
        tools: [],
        color: "pink",
      },
      {
        id: "researcher",
        name: "Deep Researcher",
        role: "Fact retriever and search expert",
        systemPrompt:
          "You are a technical researcher. Take the outline provided and search the web for concrete data points, metrics, and quotes to support each section header.",
        tools: ["Web Search"],
        color: "emerald",
      },
      {
        id: "writer",
        name: "Copywriter",
        role: "Persuasive and engaging content editor",
        systemPrompt:
          "You are a professional copywriter. Combine the outline from the Planner and the facts from the Researcher to write a cohesive, engaging final blog post.",
        tools: [],
        color: "violet",
      },
    ],
    connections: [
      { from: "planner", to: "researcher" },
      { from: "researcher", to: "writer" },
    ],
    simulationQuery: "Write a blog post about the rise of renewable energy in local communities.",
    simulationSteps: [
      {
        nodeId: "planner",
        title: "Step 1: Outline Creation",
        description: "Planner structures the blog post sections.",
        log: "Planner received request: ' renewable energy in local communities'\nCreating outline:\n1. Intro: The shifting energy grid\n2. Local Solar Co-ops: Power in community\n3. Financial benefits and challenges\n4. Conclusion: A decentralized future",
        dataPassed: "Outline with 4 sections, focus keywords: [community solar, energy bills]",
      },
      {
        nodeId: "researcher",
        title: "Step 2: Fact Gathering",
        description: "Researcher performs web searches to back outline with statistics.",
        log: "Researcher received outline.\nSearching for solar co-op statistics...\nFound: 'Community solar projects in the US grew by 18% in 2025.'\nSearching financial benefits...\nFound: 'Average homeowner saves 15% on monthly utility bills using community solar shares.'",
        dataPassed: "Outline backed by statistics: 18% growth, 15% utility bill savings.",
      },
      {
        nodeId: "writer",
        title: "Step 3: Synthesis & Draft",
        description: "Writer builds the final copy using the outline and facts.",
        log: "Writer received outline & stats.\nWriting article draft...\n'Power to the People: How Local Co-ops are Redefining the Grid... Community solar projects saw a massive 18% growth last year. The average homeowner saves 15% on monthly utility bills...'",
        dataPassed: "Polished 350-word copy ready for publishing.",
      },
    ],
  },
  router: {
    name: "Router Pattern",
    description: "An orchestrator classifies user intent and routes to the best specialist agent.",
    nodes: [
      {
        id: "router",
        name: "Intent Router",
        role: "Directs incoming requests to specialized agents",
        systemPrompt:
          "You are a customer router. Classify the user query into Billing, Tech Support, or General. Respond with a JSON including the route decision and a summary.",
        tools: [],
        color: "amber",
      },
      {
        id: "billing",
        name: "Billing Specialist",
        role: "Financial accounts and subscription auditor",
        systemPrompt:
          "You are a billing specialist. Query the payment history database to resolve invoice issues, subscription payments, or cancelations.",
        tools: ["Database API"],
        color: "pink",
      },
      {
        id: "tech",
        name: "Tech Support Specialist",
        role: "Troubleshooting and code inspection agent",
        systemPrompt:
          "You are a technical support agent. Examine server error reports or code snippets and offer solution steps.",
        tools: ["Code Sandbox"],
        color: "emerald",
      },
    ],
    connections: [
      { from: "router", to: "billing", label: "Billing intent" },
      { from: "router", to: "tech", label: "Tech support intent" },
    ],
    simulationQuery: "I got charged twice on my invoice last Monday, can you fix it?",
    simulationSteps: [
      {
        nodeId: "router",
        title: "Intent Analysis",
        description: "Router evaluates user query and routes to the billing node.",
        log: "Analyzing intent for: 'I got charged twice on my invoice last Monday...'\nKeywords detected: 'charged', 'invoice', 'double charge'.\nRouting decision: Billing Agent.",
        dataPassed: "User inquiry + classification: Billing",
      },
      {
        nodeId: "billing",
        title: "Account Audit",
        description: "Billing Specialist queries the DB to find duplicate charges.",
        log: "Billing Specialist active.\nQuerying database API for recent invoices...\nDatabase returns: 'Found invoice #91823 with two transaction IDs at 14:02:11 GMT.'\nDouble charge confirmed. Initiating refund process via payment processor integration.",
        dataPassed: "Action: Refund processed for invoice #91823 ($29.00 refunded)",
      },
      {
        nodeId: "billing",
        title: "Resolution Message",
        description: "Billing Specialist returns the outcome statement to user.",
        log: "Refunding completed.\nFinal Message: 'I found the duplicate charge on invoice #91823 from last Monday. I have initiated a refund of $29.00. Please allow 3-5 business days for it to reflect.'",
        dataPassed: "Refund transaction ID: tx_9a8f7b6c5d",
      },
    ],
  },
  orchestrator: {
    name: "Orchestrator-Workers",
    description:
      "A manager agent splits a request, assigns tasks in parallel, and compiles responses.",
    nodes: [
      {
        id: "orchestrator",
        name: "Project Orchestrator",
        role: "Manager that delegates sub-tasks and merges outputs",
        systemPrompt:
          "You are a manager. Split incoming requests into coding requirements and copywriting needs. Delegate in parallel, collect answers, and synthesize them.",
        tools: [],
        color: "indigo",
      },
      {
        id: "coder",
        name: "Specialist Coder",
        role: "Writes clean and optimized code blocks",
        systemPrompt:
          "You are a senior programmer. Write clean, self-contained scripts based on requested specifications.",
        tools: ["Code Sandbox"],
        color: "emerald",
      },
      {
        id: "writer",
        name: "Specialist Writer",
        role: "Writes marketing copy and sales content",
        systemPrompt:
          "You are a sales copywriter. Create catchy headlines, taglines, and descriptions for product launches.",
        tools: [],
        color: "pink",
      },
    ],
    connections: [
      { from: "orchestrator", to: "coder", label: "Delegate Code" },
      { from: "orchestrator", to: "writer", label: "Delegate Copy" },
      { from: "coder", to: "orchestrator", label: "Submit Code" },
      { from: "writer", to: "orchestrator", label: "Submit Copy" },
    ],
    simulationQuery:
      "Build an interactive tip calculator web widget with a catchy marketing description.",
    simulationSteps: [
      {
        nodeId: "orchestrator",
        title: "Task Breakdown",
        description: "Manager parses the project request and generates parallel tasks.",
        log: "Received query: 'Build tip calculator with marketing description'\nCreating worker assignments:\n- Worker 1 (Coder): Code tip calculation logic in HTML/JS.\n- Worker 2 (Writer): Write a snappy product pitch.",
        dataPassed: "Task A: Tip calculator JS. Task B: Catchy description.",
      },
      {
        nodeId: "coder",
        title: "Worker 1: Coding",
        description: "Coder writes the mathematical logic in JS.",
        log: "Coder active. Coding calculator JS...\n`function calcTip(bill, pct) { return bill * (pct/100); }`\nVerified script passes unit check in sandbox.",
        dataPassed: "Completed Widget Code Block (HTML/JS snippet)",
      },
      {
        nodeId: "writer",
        title: "Worker 2: Copywriting",
        description: "Writer drafts the marketing pitch.",
        log: "Writer active. Drafting pitch...\nTitle: 'TipEase — Hassle-Free Calculations.'\nTagline: 'Ditch the mental math. Split checks and calculate tips instantly.'",
        dataPassed: "Copywriting block: Title, Tagline, Body",
      },
      {
        nodeId: "orchestrator",
        title: "Synthesis & Delivery",
        description: "Manager consolidates code and copy into the final bundle.",
        log: "Collecting deliverables...\nMerging widget code and marketing copy.\nCompiled Output:\n'TipEase landing description is ready, coupled with the functional JS widget script.'",
        dataPassed: "Consolidated package delivered.",
      },
    ],
  },
  "evaluator-optimizer": {
    name: "Evaluator-Optimizer Loop",
    description: "An optimizer drafts content, an evaluator critiques it, looping until approved.",
    nodes: [
      {
        id: "optimizer",
        name: "Content Designer",
        role: "Generates drafts and refines them based on auditor critique",
        systemPrompt:
          "You are a content designer. Draft a press release based on the user topic. If the Auditor provides feedback, modify the press release accordingly.",
        tools: [],
        color: "violet",
      },
      {
        id: "evaluator",
        name: "Quality Auditor",
        role: "Critiques drafts and signs off when quality criteria met",
        systemPrompt:
          "You are a quality auditor. Critique the press release draft. Check for: 1) Professional tone, 2) Inclusion of a CTA, 3) Under 200 words. Respond with 'APPROVED' if perfect, else detail required edits.",
        tools: [],
        color: "amber",
      },
    ],
    connections: [
      { from: "optimizer", to: "evaluator", label: "Submit Draft" },
      { from: "evaluator", to: "optimizer", label: "Send Feedback" },
    ],
    simulationQuery: "Write a short press release about our new AI Agent Marketplace launch.",
    simulationSteps: [
      {
        nodeId: "optimizer",
        title: "Draft 1 Created",
        description: "Optimizer drafts the first version of the press release.",
        log: "Creating press release v1:\n'Hey guys! Today we're launching the AI Agent Marketplace. You can buy prompts and plugins. It's awesome and fast. Go sign up at our site.'",
        dataPassed: "Press Release v1 (Informal tone, lacking structured CTA, 32 words)",
      },
      {
        nodeId: "evaluator",
        title: "Evaluation 1",
        description: "Evaluator audits draft 1 and rejects it due to tone.",
        log: "Auditing draft 1...\n- Professional tone: FAILED ('Hey guys!', 'awesome')\n- CTA present: FAILED (vague link)\n- Under 200 words: PASSED.\nFeedback: 'Rewrite in formal corporate tone, add a specific CTA to visit /marketplace, and maintain professional language.'",
        dataPassed: "Rejection + Revision Feedback",
      },
      {
        nodeId: "optimizer",
        title: "Draft 2 Refined",
        description: "Optimizer applies the edits to draft the second version.",
        log: "Applying feedback. Rewriting v2:\n'FOR IMMEDIATE RELEASE: Melanated In Tech proudly launches the new AI Agent Marketplace, an educational repository of custom agents. Discover and configure starter templates to automate operations. Visit melanatedintech.com/marketplace to launch today.'",
        dataPassed: "Press Release v2 (Formal tone, CTA included, 44 words)",
      },
      {
        nodeId: "evaluator",
        title: "Evaluation 2 & Approval",
        description: "Evaluator audits draft 2 and signs off on it.",
        log: "Auditing draft 2...\n- Professional tone: PASSED\n- CTA present: PASSED (/marketplace)\n- Under 200 words: PASSED.\nOutcome: APPROVED.",
        dataPassed: "Approval Token: APPROVED",
      },
    ],
  },
};

const AVAILABLE_TOOLS = [
  "Web Search",
  "Calculator",
  "Database API",
  "Code Sandbox",
  "Email Service",
];

export const Route = createFileRoute("/tools/agent-architect")({
  head: () => {
    const seo = buildSeoMeta({
      title: "AI Agent Architect — Melanated In Tech",
      description:
        "Design multi-agent architectures and workflows visually, generate code boilerplate, and simulate executions.",
      url: "/tools/agent-architect",
    });
    return {
      meta: seo.meta,
      links: seo.links,
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "AI Tools", path: "/tools" },
            { name: "Agent Architect", path: "/tools/agent-architect" },
          ]),
        ),
      ],
    };
  },
  component: AgentArchitectPage,
});

function AgentArchitectPage() {
  const [presetKey, setPresetKey] = useState<string>("sequential");
  const [nodes, setNodes] = useState<AgentNode[]>(PRESETS["sequential"].nodes);
  const [connections, setConnections] = useState<Connection[]>(PRESETS["sequential"].connections);
  const [selectedNodeId, setSelectedNodeId] = useState<string>(PRESETS["sequential"].nodes[0].id);

  // Custom node input fields
  const [newNodeName, setNewNodeName] = useState("");
  const [newNodeRole, setNewNodeRole] = useState("");
  const [newNodePrompt, setNewNodePrompt] = useState("");
  const [newNodeTools, setNewNodeTools] = useState<string[]>([]);
  const [newNodeColor] = useState("indigo");

  // Simulation state
  const [simulationQuery, setSimulationQuery] = useState(PRESETS["sequential"].simulationQuery);
  const [simActive, setSimActive] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [simLog, setSimLog] = useState<string[]>([]);

  // Reset preset
  const handleLoadPreset = (key: string) => {
    if (PRESETS[key]) {
      setPresetKey(key);
      setNodes(PRESETS[key].nodes);
      setConnections(PRESETS[key].connections);
      setSelectedNodeId(PRESETS[key].nodes[0]?.id || "");
      setSimulationQuery(PRESETS[key].simulationQuery);
      setSimActive(false);
      setSimStep(0);
      setSimLog([]);
      toast.success(`Loaded ${PRESETS[key].name} template`);
    }
  };

  // Node editing state
  const activeNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  }, [nodes, selectedNodeId]);

  const handleUpdateActiveNode = (field: keyof AgentNode, value: any) => {
    if (!activeNode) return;
    setNodes((prev) => prev.map((n) => (n.id === activeNode.id ? { ...n, [field]: value } : n)));
  };

  const handleToggleToolForActiveNode = (tool: string) => {
    if (!activeNode) return;
    const hasTool = activeNode.tools.includes(tool);
    const updatedTools = hasTool
      ? activeNode.tools.filter((t) => t !== tool)
      : [...activeNode.tools, tool];
    handleUpdateActiveNode("tools", updatedTools);
  };

  // Node movement (reordering)
  const handleMoveNode = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === nodes.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const newNodes = [...nodes];
    const temp = newNodes[index];
    newNodes[index] = newNodes[targetIndex];
    newNodes[targetIndex] = temp;
    setNodes(newNodes);

    // Auto update sequential connections if in sequential preset
    if (presetKey === "sequential") {
      const newconns: Connection[] = [];
      for (let i = 0; i < newNodes.length - 1; i++) {
        newconns.push({ from: newNodes[i].id, to: newNodes[i + 1].id });
      }
      setConnections(newconns);
    }
  };

  // Delete node
  const handleDeleteNode = (id: string) => {
    if (nodes.length <= 1) {
      toast.error("You must have at least one agent node in the architecture.");
      return;
    }
    const filteredNodes = nodes.filter((n) => n.id !== id);
    setNodes(filteredNodes);
    setConnections((prev) => prev.filter((c) => c.from !== id && c.to !== id));
    if (selectedNodeId === id) {
      setSelectedNodeId(filteredNodes[0].id);
    }
    toast.info("Agent node deleted.");
  };

  // Add custom node
  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName.trim() || !newNodeRole.trim()) {
      toast.warning("Please provide a name and role for the custom agent.");
      return;
    }
    const id = newNodeName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    if (nodes.some((n) => n.id === id)) {
      toast.error("An agent with a similar name already exists.");
      return;
    }

    const newAgent: AgentNode = {
      id,
      name: newNodeName.trim(),
      role: newNodeRole.trim(),
      systemPrompt:
        newNodePrompt.trim() || `You are ${newNodeName.trim()}. Role: ${newNodeRole.trim()}.`,
      tools: newNodeTools,
      color: newNodeColor,
    };

    const updatedNodes = [...nodes, newAgent];
    setNodes(updatedNodes);

    // If sequential preset, stitch it to the end
    if (presetKey === "sequential") {
      setConnections((prev) => [...prev, { from: nodes[nodes.length - 1].id, to: id }]);
    } else if (presetKey === "orchestrator") {
      setConnections((prev) => [
        ...prev,
        { from: nodes[0].id, to: id, label: "Delegate Task" },
        { from: id, to: nodes[0].id, label: "Return Output" },
      ]);
    } else if (presetKey === "router") {
      setConnections((prev) => [
        ...prev,
        { from: nodes[0].id, to: id, label: "Conditional Route" },
      ]);
    }

    // Reset fields
    setNewNodeName("");
    setNewNodeRole("");
    setNewNodePrompt("");
    setNewNodeTools([]);
    setSelectedNodeId(id);

    toast.success(`Agent ${newAgent.name} added to graph.`);
  };

  // Simulator playback
  const currentPresetSteps = useMemo(() => {
    return PRESETS[presetKey]?.simulationSteps || [];
  }, [presetKey]);

  const startSimulation = () => {
    if (currentPresetSteps.length === 0) {
      toast.error("No simulation steps configured for this workflow.");
      return;
    }
    setSimActive(true);
    setSimStep(0);
    const initialStep = currentPresetSteps[0];
    setSimLog([
      `[System] Launching simulation workflow for query: "${simulationQuery}"`,
      `[${initialStep.title}] nodeId: ${initialStep.nodeId}`,
      initialStep.log,
    ]);
    setSelectedNodeId(initialStep.nodeId);
  };

  const advanceSimulation = () => {
    if (simStep >= currentPresetSteps.length - 1) {
      setSimActive(false);
      toast.success("Simulation workflow completed!");
      return;
    }
    const nextStepIdx = simStep + 1;
    setSimStep(nextStepIdx);
    const nextStep = currentPresetSteps[nextStepIdx];
    setSelectedNodeId(nextStep.nodeId);
    setSimLog((prev) => [
      ...prev,
      `--- Step ${nextStepIdx + 1}: ${nextStep.title} ---`,
      `[Transfer] Data Passed: ${nextStep.dataPassed}`,
      nextStep.log,
    ]);
  };

  const resetSimulation = () => {
    setSimActive(false);
    setSimStep(0);
    setSimLog([]);
  };

  // Dynamic code generators
  const generatedLangGraph = useMemo(() => {
    let code = `from typing import Annotated, TypedDict, List
from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_openai import ChatOpenAI
import os

# Set API key (or retrieve from environment)
os.environ["OPENAI_API_KEY"] = "your-openai-api-key"

# 1. Define the workflow state structure
class AgentState(TypedDict):
    messages: List[BaseMessage]
    outputs: dict
    next_step: str

# Initialize LLM model
model = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)

# 2. Define the Agent Nodes and their actions
`;

    nodes.forEach((n) => {
      code += `
# --- Specialist Node: ${n.name} ---
def node_${n.id.replace(/-/g, "_")}(state: AgentState) -> dict:
    print("--- Running Agent Node: ${n.name} ---")
    system_prompt = """${n.systemPrompt}"""
    
    # Compile messages including system instruction
    messages = [HumanMessage(content=system_prompt)] + state["messages"]
    response = model.invoke(messages)
    
    output_text = response.content
    ${
      n.tools.length > 0
        ? `# Agent has access to tools: ${n.tools.join(", ")}\n    # Custom tool invocation logic goes here`
        : `# No external tools required for this agent`
    }
    
    # Store outputs
    state_outputs = state.get("outputs", {})
    state_outputs["${n.id}"] = output_text
    
    return {
        "messages": [AIMessage(content=output_text)],
        "outputs": state_outputs
    }
`;
    });

    code += `
# 3. Initialize Graph Blueprint
workflow = StateGraph(AgentState)

# Register nodes with the graph
`;

    nodes.forEach((n) => {
      code += `workflow.add_node("${n.id}", node_${n.id.replace(/-/g, "_")})
`;
    });

    code += `
# Define start node
`;
    if (nodes.length > 0) {
      code += `workflow.set_entry_point("${nodes[0].id}")
`;
    }

    code += `
# 4. Bind flow connections and conditional edges
`;

    if (presetKey === "sequential") {
      for (let i = 0; i < nodes.length - 1; i++) {
        code += `workflow.add_edge("${nodes[i].id}", "${nodes[i + 1].id}")\n`;
      }
      if (nodes.length > 0) {
        code += `workflow.add_edge("${nodes[nodes.length - 1].id}", END)\n`;
      }
    } else if (presetKey === "router" && nodes.length > 1) {
      code += `
# Router function: decides path based on LLM output
def route_decision(state: AgentState) -> str:
    # Read router output to decide next step
    router_output = state["outputs"].get("${nodes[0].id}", "").lower()
    
    if "billing" in router_output:
        return "${nodes[1].id}"
    elif "tech" in router_output:
        return "${nodes[2]?.id ?? "END"}"
    else:
        return END

workflow.add_conditional_edges(
    "${nodes[0].id}",
    route_decision,
    {
        "${nodes[1].id}": "${nodes[1].id}",
        ${nodes[2] ? `"${nodes[2].id}": "${nodes[2].id}",` : ""}
        "END": END
    }
)
`;
      for (let i = 1; i < nodes.length; i++) {
        code += `workflow.add_edge("${nodes[i].id}", END)\n`;
      }
    } else if (presetKey === "orchestrator" && nodes.length > 1) {
      code += `
# Parallel delegator connections
workflow.add_edge("${nodes[0].id}", "${nodes[1].id}")
`;
      for (let i = 2; i < nodes.length; i++) {
        code += `workflow.add_edge("${nodes[0].id}", "${nodes[i].id}")\n`;
      }
      for (let i = 1; i < nodes.length; i++) {
        code += `workflow.add_edge("${nodes[i].id}", END)\n`;
      }
    } else if (presetKey === "evaluator-optimizer" && nodes.length > 1) {
      code += `
# Loop check function
def verify_approval(state: AgentState) -> str:
    auditor_feedback = state["outputs"].get("${nodes[1].id}", "").lower()
    if "approved" in auditor_feedback:
        return END
    else:
        return "${nodes[0].id}" # Loop back to content generator

workflow.add_edge("${nodes[0].id}", "${nodes[1].id}")
workflow.add_conditional_edges(
    "${nodes[1].id}",
    verify_approval,
    {
        "${nodes[0].id}": "${nodes[0].id}",
        "END": END
    }
)
`;
    } else {
      for (let i = 0; i < nodes.length - 1; i++) {
        code += `workflow.add_edge("${nodes[i].id}", "${nodes[i + 1].id}")\n`;
      }
      if (nodes.length > 0) {
        code += `workflow.add_edge("${nodes[nodes.length - 1].id}", END)\n`;
      }
    }

    code += `
# 5. Compile and run graph
app = workflow.compile()

# Invoke with user message
initial_state = {"messages": [HumanMessage(content="${simulationQuery}")]}
for update in app.stream(initial_state):
    print(update)
`;
    return code;
  }, [nodes, presetKey, simulationQuery]);

  const generatedCrewAI = useMemo(() => {
    let code = `import os
from crewai import Agent, Task, Crew, Process

# Set up API keys
os.environ["OPENAI_API_KEY"] = "your-openai-api-key"
os.environ["OPENAI_MODEL_NAME"] = "gpt-4o-mini"

# 1. Define Agent Specialists
`;

    nodes.forEach((n) => {
      code += `
agent_${n.id.replace(/-/g, "_")} = Agent(
    role="${n.name}",
    goal="Fulfill tasks requiring expertise: ${n.role}",
    backstory="""${n.systemPrompt.replace(/"/g, "'")}""",
    verbose=True,
    allow_delegation=True,
    ${n.tools.length > 0 ? `# Configured tools: ${n.tools.join(", ")}\n    tools=[]` : "tools=[]"}
)
`;
    });

    code += `
# 2. Define Crew Tasks
`;

    nodes.forEach((n, idx) => {
      code += `
task_${n.id.replace(/-/g, "_")} = Task(
    description="Analyze the input message and generate high quality responses aligning with the specialist goals.",
    expected_output="Detailed output resolving instructions for ${n.name}.",
    agent=agent_${n.id.replace(/-/g, "_")},
    ${idx > 0 ? `context=[task_${nodes[idx - 1].id.replace(/-/g, "_")}],` : ""}
)
`;
    });

    code += `
# 3. Assemble and execute Crew
crew = Crew(
    agents=[${nodes.map((n) => `agent_${n.id.replace(/-/g, "_")}`).join(", ")}],
    tasks=[${nodes.map((n) => `task_${n.id.replace(/-/g, "_")}`).join(", ")}],
    process=Process.sequential, # Can be sequential or hierarchical
    verbose=True
)

result = crew.kickoff(inputs={"query": "${simulationQuery}"})
print("--- Crew Execution Finished ---")
print(result)
`;
    return code;
  }, [nodes, simulationQuery]);

  const generatedTypeScript = useMemo(() => {
    let code = `import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface AgentState {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  outputs: Record<string, string>;
}

// 1. Declare Node Caller Functions
`;

    nodes.forEach((n) => {
      code += `
/**
 * Agent: ${n.name}
 * Role: ${n.role}
 */
async function run${n.name.replace(/[^a-zA-Z0-9]/g, "")}(state: AgentState): Promise<string> {
  console.log("-> Starting execution for agent node: ${n.name}...");
  const systemPrompt = \`${n.systemPrompt}\`;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      ...state.messages
    ],
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content || "";
  ${n.tools.length > 0 ? `// Handled tools: ${n.tools.join(", ")}\n  // Tool API integration goes here` : ""}
  return content;
}
`;
    });

    code += `
// 2. Orchestration Pipeline
export async function executeAgentWorkflow(query: string): Promise<AgentState> {
  const state: AgentState = {
    messages: [{ role: "user", content: query }],
    outputs: {},
  };
`;

    if (presetKey === "sequential") {
      nodes.forEach((n) => {
        code += `
  // Execute sequential step: ${n.name}
  const res${n.name.replace(/[^a-zA-Z0-9]/g, "")} = await run${n.name.replace(/[^a-zA-Z0-9]/g, "")}(state);
  state.outputs["${n.id}"] = res${n.name.replace(/[^a-zA-Z0-9]/g, "")};
  state.messages.push({ role: "assistant", content: res${n.name.replace(/[^a-zA-Z0-9]/g, "")} });
`;
      });
    } else if (presetKey === "router" && nodes.length > 1) {
      code += `
  // Router evaluation step
  const routerRes = await run${nodes[0].name.replace(/[^a-zA-Z0-9]/g, "")}(state);
  state.outputs["${nodes[0].id}"] = routerRes;
  state.messages.push({ role: "assistant", content: routerRes });

  const responseText = routerRes.toLowerCase();
  if (responseText.includes("billing")) {
    const out = await run${nodes[1].name.replace(/[^a-zA-Z0-9]/g, "")}(state);
    state.outputs["${nodes[1].id}"] = out;
  } else if (responseText.includes("tech") && ${nodes[2] ? "true" : "false"}) {
    ${
      nodes[2]
        ? `const out = await run${nodes[2].name.replace(/[^a-zA-Z0-9]/g, "")}(state);
    state.outputs["${nodes[2].id}"] = out;`
        : ""
    }
  }
`;
    } else if (presetKey === "orchestrator" && nodes.length > 1) {
      code += `
  // Orchestrator splits tasks and aggregates
  const managerRes = await run${nodes[0].name.replace(/[^a-zA-Z0-9]/g, "")}(state);
  state.outputs["${nodes[0].id}"] = managerRes;

  // Run worker agents in parallel
  const workers = await Promise.all([
    ${nodes
      .slice(1)
      .map((n) => `run${n.name.replace(/[^a-zA-Z0-9]/g, "")}(state)`)
      .join(",\n    ")}
  ]);

  ${nodes
    .slice(1)
    .map((n, idx) => `state.outputs["${n.id}"] = workers[${idx}];`)
    .join("\n  ")}
`;
    } else if (presetKey === "evaluator-optimizer" && nodes.length > 1) {
      code += `
  let loopCount = 0;
  let isApproved = false;

  while (!isApproved && loopCount < 3) {
    loopCount++;
    // Generate draft
    const draft = await run${nodes[0].name.replace(/[^a-zA-Z0-9]/g, "")}(state);
    state.outputs["${nodes[0].id}"] = draft;
    state.messages.push({ role: "assistant", content: \`Draft \${loopCount}: \${draft}\` });

    // Review draft
    const feedback = await run${nodes[1].name.replace(/[^a-zA-Z0-9]/g, "")}(state);
    state.outputs["${nodes[1].id}"] = feedback;

    if (feedback.toLowerCase().includes("approved")) {
      isApproved = true;
    } else {
      state.messages.push({ role: "user", content: \`Refine draft according to: \${feedback}\` });
    }
  }
`;
    } else {
      nodes.forEach((n) => {
        code += `
  const res${n.name.replace(/[^a-zA-Z0-9]/g, "")} = await run${n.name.replace(/[^a-zA-Z0-9]/g, "")}(state);
  state.outputs["${n.id}"] = res${n.name.replace(/[^a-zA-Z0-9]/g, "")};
  state.messages.push({ role: "assistant", content: res${n.name.replace(/[^a-zA-Z0-9]/g, "")} });
`;
      });
    }

    code += `
  return state;
}
`;
    return code;
  }, [nodes, presetKey]);

  // Mermaid graph compilation
  const mermaidGraph = useMemo(() => {
    let mermaid = `graph TD
  User([User Request]) --> ${nodes[0]?.id || "END"}
`;
    if (presetKey === "sequential") {
      for (let i = 0; i < nodes.length - 1; i++) {
        mermaid += `  ${nodes[i].id}[${nodes[i].name}] --> ${nodes[i + 1].id}[${nodes[i + 1].name}]\n`;
      }
      if (nodes.length > 0) {
        mermaid += `  ${nodes[nodes.length - 1].id} --> End([Final Output])\n`;
      }
    } else if (presetKey === "router" && nodes.length > 1) {
      mermaid += `  ${nodes[0].id}[${nodes[0].name} (Router)]\n`;
      for (let i = 1; i < nodes.length; i++) {
        mermaid += `  ${nodes[0].id} -- Conditional Route --> ${nodes[i].id}[${nodes[i].name}]\n`;
        mermaid += `  ${nodes[i].id} --> End([Final Output])\n`;
      }
    } else if (presetKey === "orchestrator" && nodes.length > 1) {
      mermaid += `  ${nodes[0].id}[${nodes[0].name} (Orchestrator)]\n`;
      for (let i = 1; i < nodes.length; i++) {
        mermaid += `  ${nodes[0].id} -- Assigns Task --> ${nodes[i].id}[${nodes[i].name}]\n`;
        mermaid += `  ${nodes[i].id} -- Returns Result --> ${nodes[0].id}\n`;
      }
      mermaid += `  ${nodes[0].id} --> End([Final Output])\n`;
    } else if (presetKey === "evaluator-optimizer" && nodes.length > 1) {
      mermaid += `  ${nodes[0].id}[${nodes[0].name} (Optimizer)] --> ${nodes[1].id}[${nodes[1].name} (Evaluator)]\n`;
      mermaid += `  ${nodes[1].id} -- Feedback Loop --> ${nodes[0].id}\n`;
      mermaid += `  ${nodes[1].id} -- Approved --> End([Final Output])\n`;
    } else {
      for (let i = 0; i < nodes.length - 1; i++) {
        mermaid += `  ${nodes[i].id}[${nodes[i].name}] --> ${nodes[i + 1].id}[${nodes[i + 1].name}]\n`;
      }
      if (nodes.length > 0) {
        mermaid += `  ${nodes[nodes.length - 1].id} --> End([Final Output])\n`;
      }
    }
    return mermaid;
  }, [nodes, presetKey]);

  // Copy helpers
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success(`${label} copied to clipboard!`),
      () => toast.error("Failed to copy."),
    );
  };

  // Download entire blueprint configuration as a JSON file
  const handleDownloadBlueprint = () => {
    const blueprint = {
      name: `mit-agent-blueprint-${presetKey}`,
      created_at: new Date().toISOString(),
      architecture_type: presetKey,
      nodes,
      connections,
      mermaid: mermaidGraph,
    };
    const blob = new Blob([JSON.stringify(blueprint, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mit-agent-blueprint-${presetKey}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Blueprint JSON downloaded successfully.");
  };

  return (
    <SiteLayout>
      <div className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/tools"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tools Dashboard
          </Link>
        </div>
      </div>

      <PageHeader
        eyebrow="AI Agent & Multi-Agent Planner"
        title="Agent Architect."
        description="Design multi-agent workflows visually. Select patterns like router, orchestrator, or evaluator, configure custom instructions and tools for each node, and generate production-ready code."
      />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Preset selector bar */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Select Blueprint Pattern
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Load a predefined multi-agent workflow layout to customize
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.keys(PRESETS).map((key) => (
                <Button
                  key={key}
                  variant={presetKey === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleLoadPreset(key)}
                  className="rounded-full"
                >
                  {PRESETS[key].name}
                </Button>
              ))}
            </div>
          </div>
          <div className="mt-4 border-t border-border/60 pt-3 text-sm text-muted-foreground flex items-start gap-2">
            <Info className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
            <span>
              <strong>Active Pattern:</strong> {PRESETS[presetKey]?.description}
            </span>
          </div>
        </div>

        {/* Core Layout Grid */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Configure Agent Nodes (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="font-display text-lg font-bold flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" /> Edit Node Persona
                </CardTitle>
                <CardDescription>
                  Tune selected agent's role, system instructions, and tool bindings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Node Selector Selector */}
                <div className="space-y-1.5">
                  <Label htmlFor="node-editor-select" className="text-xs font-semibold">
                    Select Agent to Configure
                  </Label>
                  <Select value={selectedNodeId} onValueChange={setSelectedNodeId}>
                    <SelectTrigger id="node-editor-select">
                      <SelectValue placeholder="Choose Agent..." />
                    </SelectTrigger>
                    <SelectContent>
                      {nodes.map((n) => (
                        <SelectItem key={n.id} value={n.id}>
                          {n.name} {activeNode?.id === n.id ? " (Selected)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {activeNode ? (
                  <div className="space-y-4 pt-3 border-t border-border animate-in fade-in duration-200">
                    <div className="space-y-1.5">
                      <Label htmlFor="node-name" className="text-xs font-semibold">
                        Agent Name
                      </Label>
                      <Input
                        id="node-name"
                        value={activeNode.name}
                        onChange={(e) => handleUpdateActiveNode("name", e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="node-role" className="text-xs font-semibold">
                        Expertise / Specialty Role
                      </Label>
                      <Input
                        id="node-role"
                        value={activeNode.role}
                        onChange={(e) => handleUpdateActiveNode("role", e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="node-prompt" className="text-xs font-semibold">
                        System Instruction Prompt
                      </Label>
                      <Textarea
                        id="node-prompt"
                        rows={6}
                        className="text-xs font-mono font-medium"
                        value={activeNode.systemPrompt}
                        onChange={(e) => handleUpdateActiveNode("systemPrompt", e.target.value)}
                      />
                    </div>

                    {/* Tools Selector */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">Bind Tools</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {AVAILABLE_TOOLS.map((tool) => {
                          const isBound = activeNode.tools.includes(tool);
                          return (
                            <button
                              key={tool}
                              type="button"
                              onClick={() => handleToggleToolForActiveNode(tool)}
                              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${
                                isBound
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border bg-background text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {isBound ? (
                                <Check className="h-3 w-3 shrink-0" />
                              ) : (
                                <Plus className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                              )}
                              <span className="truncate">{tool}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Reordering / Delete Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleMoveNode(
                              nodes.findIndex((n) => n.id === activeNode.id),
                              "up",
                            )
                          }
                          disabled={nodes.findIndex((n) => n.id === activeNode.id) === 0}
                          title="Move Node Up"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleMoveNode(
                              nodes.findIndex((n) => n.id === activeNode.id),
                              "down",
                            )
                          }
                          disabled={
                            nodes.findIndex((n) => n.id === activeNode.id) === nodes.length - 1
                          }
                          title="Move Node Down"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-1 h-8"
                        onClick={() => handleDeleteNode(activeNode.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete Node
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Select a node to begin tuning.</p>
                )}
              </CardContent>
            </Card>

            {/* Add Custom Agent Node Form */}
            <Card className="border border-border bg-card shadow-sm overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-sm font-bold flex items-center gap-1.5">
                  <Plus className="h-4 w-4 text-primary" /> Add Specialist Agent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddNode} className="space-y-3">
                  <div className="space-y-1">
                    <Label
                      htmlFor="new-name"
                      className="text-[10px] uppercase font-bold text-muted-foreground"
                    >
                      Agent Name
                    </Label>
                    <Input
                      id="new-name"
                      placeholder="e.g. SEO Auditor"
                      value={newNodeName}
                      onChange={(e) => setNewNodeName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="new-role"
                      className="text-[10px] uppercase font-bold text-muted-foreground"
                    >
                      Specialist Role
                    </Label>
                    <Input
                      id="new-role"
                      placeholder="e.g. Scans HTML and ranks keywords"
                      value={newNodeRole}
                      onChange={(e) => setNewNodeRole(e.target.value)}
                    />
                  </div>
                  <Button type="submit" size="sm" className="w-full">
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Inject Agent Node
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Visual Canvas & Code Export (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Visual Flow Canvas */}
            <Card className="border border-border bg-card shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/10 border-b border-border/80 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-display text-base font-bold">
                      Interactive Architecture Flowchart
                    </CardTitle>
                    <CardDescription>
                      Visual map of active agents and connections. Click a card to edit it.
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-8 font-medium text-xs"
                    onClick={handleDownloadBlueprint}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export Blueprint JSON
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8 bg-black/35 min-h-[300px] flex flex-col justify-center">
                {/* Visual rendering of architecture based on active selection */}
                <div className="flex flex-col items-center justify-center gap-6 w-full max-w-xl mx-auto">
                  {presetKey === "sequential" && (
                    <div className="flex flex-col items-center gap-4 w-full">
                      {nodes.map((node, index) => (
                        <div key={node.id} className="flex flex-col items-center w-full">
                          {/* Node Card */}
                          <div
                            onClick={() => setSelectedNodeId(node.id)}
                            className={`w-full max-w-sm rounded-xl border p-4 cursor-pointer transition-all duration-300 ${
                              selectedNodeId === node.id
                                ? "border-primary bg-primary/5 shadow-[0_0_12px_rgba(139,92,246,0.25)] translate-x-1"
                                : "border-border bg-card hover:border-foreground/20"
                            } ${simActive && selectedNodeId === node.id ? "animate-pulse border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.6)]" : ""}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs uppercase font-bold text-primary tracking-wider">
                                Agent #{index + 1}
                              </span>
                              <div className="flex gap-1.5">
                                {node.tools.map((t) => (
                                  <Badge
                                    key={t}
                                    variant="secondary"
                                    className="text-[10px] px-1.5 py-0"
                                  >
                                    {t}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <h3 className="font-display text-base font-bold mt-1.5">{node.name}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {node.role}
                            </p>
                          </div>
                          {/* Connection Arrow */}
                          {index < nodes.length - 1 && (
                            <div className="flex flex-col items-center my-1">
                              <ArrowRight className="h-5 w-5 text-muted-foreground/60 rotate-90" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {presetKey === "router" && nodes.length > 0 && (
                    <div className="flex flex-col items-center gap-8 w-full">
                      {/* Top: Router Node */}
                      <div
                        onClick={() => setSelectedNodeId(nodes[0].id)}
                        className={`w-full max-w-xs rounded-xl border p-4 cursor-pointer transition-all duration-300 text-center ${
                          selectedNodeId === nodes[0].id
                            ? "border-primary bg-primary/5 shadow-[0_0_12px_rgba(139,92,246,0.25)]"
                            : "border-border bg-card hover:border-foreground/20"
                        } ${simActive && selectedNodeId === nodes[0].id ? "animate-pulse border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.6)]" : ""}`}
                      >
                        <Badge
                          variant="outline"
                          className="text-[10px] border-amber-500/50 text-amber-500 bg-amber-500/5"
                        >
                          Query Router
                        </Badge>
                        <h3 className="font-display text-base font-bold mt-1.5">{nodes[0].name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{nodes[0].role}</p>
                      </div>

                      {/* Connection Arrows (Split) */}
                      <div className="relative w-full flex items-center justify-around h-6">
                        <div className="absolute top-0 bottom-0 left-[25%] right-[25%] border-t-2 border-dashed border-border/80"></div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground/60 rotate-90" />
                        {nodes.length > 2 && (
                          <ArrowRight className="h-5 w-5 text-muted-foreground/60 rotate-90" />
                        )}
                      </div>

                      {/* Bottom: Specialist Nodes */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        {nodes.slice(1).map((node) => (
                          <div
                            key={node.id}
                            onClick={() => setSelectedNodeId(node.id)}
                            className={`rounded-xl border p-4 cursor-pointer transition-all duration-300 ${
                              selectedNodeId === node.id
                                ? "border-primary bg-primary/5 shadow-[0_0_12px_rgba(139,92,246,0.25)]"
                                : "border-border bg-card hover:border-foreground/20"
                            } ${simActive && selectedNodeId === node.id ? "animate-pulse border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.6)]" : ""}`}
                          >
                            <div className="flex items-center justify-between">
                              <Badge className="text-[9px] px-1 py-0 bg-pink-500/10 text-pink-500 border-none">
                                Specialist
                              </Badge>
                              <div className="flex gap-1">
                                {node.tools.map((t) => (
                                  <Badge
                                    key={t}
                                    variant="secondary"
                                    className="text-[9px] px-1 py-0"
                                  >
                                    {t}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <h3 className="font-display text-sm font-bold mt-2">{node.name}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {node.role}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {presetKey === "orchestrator" && nodes.length > 0 && (
                    <div className="flex flex-col items-center gap-8 w-full">
                      {/* Top: Orchestrator Manager Node */}
                      <div
                        onClick={() => setSelectedNodeId(nodes[0].id)}
                        className={`w-full max-w-xs rounded-xl border p-4 cursor-pointer transition-all duration-300 text-center ${
                          selectedNodeId === nodes[0].id
                            ? "border-primary bg-primary/5 shadow-[0_0_12px_rgba(139,92,246,0.25)]"
                            : "border-border bg-card hover:border-foreground/20"
                        } ${simActive && selectedNodeId === nodes[0].id ? "animate-pulse border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.6)]" : ""}`}
                      >
                        <Badge
                          variant="outline"
                          className="text-[10px] border-indigo-500/50 text-indigo-500 bg-indigo-500/5"
                        >
                          Manager Node
                        </Badge>
                        <h3 className="font-display text-base font-bold mt-1.5">{nodes[0].name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{nodes[0].role}</p>
                      </div>

                      {/* Connections split downwards */}
                      <div className="relative w-full flex items-center justify-around h-6">
                        <div className="absolute top-0 bottom-0 left-[25%] right-[25%] border-t-2 border-dashed border-border/80"></div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground/60 rotate-90" />
                        {nodes.length > 2 && (
                          <ArrowRight className="h-5 w-5 text-muted-foreground/60 rotate-90" />
                        )}
                      </div>

                      {/* Bottom: Worker Nodes */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        {nodes.slice(1).map((node) => (
                          <div
                            key={node.id}
                            onClick={() => setSelectedNodeId(node.id)}
                            className={`rounded-xl border p-4 cursor-pointer transition-all duration-300 ${
                              selectedNodeId === node.id
                                ? "border-primary bg-primary/5 shadow-[0_0_12px_rgba(139,92,246,0.25)]"
                                : "border-border bg-card hover:border-foreground/20"
                            } ${simActive && selectedNodeId === node.id ? "animate-pulse border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.6)]" : ""}`}
                          >
                            <div className="flex items-center justify-between">
                              <Badge className="text-[9px] px-1 py-0 bg-emerald-500/10 text-emerald-500 border-none">
                                Worker Agent
                              </Badge>
                              <div className="flex gap-1">
                                {node.tools.map((t) => (
                                  <Badge
                                    key={t}
                                    variant="secondary"
                                    className="text-[9px] px-1 py-0"
                                  >
                                    {t}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <h3 className="font-display text-sm font-bold mt-2">{node.name}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {node.role}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {presetKey === "evaluator-optimizer" && nodes.length >= 2 && (
                    <div className="flex flex-col items-center gap-6 w-full">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center w-full">
                        {/* Left Optimizer */}
                        <div className="flex flex-col items-center gap-3">
                          <div
                            onClick={() => setSelectedNodeId(nodes[0].id)}
                            className={`w-full rounded-xl border p-4 cursor-pointer transition-all duration-300 ${
                              selectedNodeId === nodes[0].id
                                ? "border-primary bg-primary/5 shadow-[0_0_12px_rgba(139,92,246,0.25)]"
                                : "border-border bg-card hover:border-foreground/20"
                            } ${simActive && selectedNodeId === nodes[0].id ? "animate-pulse border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.6)]" : ""}`}
                          >
                            <Badge className="bg-violet-500/10 text-violet-500 border-none text-[9px] px-1 py-0">
                              Content Optimizer
                            </Badge>
                            <h3 className="font-display text-sm font-bold mt-2">{nodes[0].name}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{nodes[0].role}</p>
                          </div>
                        </div>

                        {/* Right Evaluator */}
                        <div className="flex flex-col items-center gap-3">
                          <div
                            onClick={() => setSelectedNodeId(nodes[1].id)}
                            className={`w-full rounded-xl border p-4 cursor-pointer transition-all duration-300 ${
                              selectedNodeId === nodes[1].id
                                ? "border-primary bg-primary/5 shadow-[0_0_12px_rgba(139,92,246,0.25)]"
                                : "border-border bg-card hover:border-foreground/20"
                            } ${simActive && selectedNodeId === nodes[1].id ? "animate-pulse border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.6)]" : ""}`}
                          >
                            <Badge className="bg-amber-500/10 text-amber-500 border-none text-[9px] px-1 py-0">
                              Quality Auditor
                            </Badge>
                            <h3 className="font-display text-sm font-bold mt-2">{nodes[1].name}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{nodes[1].role}</p>
                          </div>
                        </div>
                      </div>

                      {/* Loop Arrows Overlay */}
                      <div className="flex items-center justify-center gap-12 w-full text-xs text-muted-foreground font-semibold py-2">
                        <span className="flex items-center gap-1">
                          Draft Submit <ArrowRight className="h-3.5 w-3.5 text-primary" />
                        </span>
                        <span className="flex items-center gap-1">
                          <ArrowRight className="h-3.5 w-3.5 text-amber-500 rotate-180" /> Feedback
                          Loop
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Fallback layout for Custom Nodes */}
                  {presetKey === "custom" && (
                    <div className="flex flex-wrap justify-center gap-4 w-full">
                      {nodes.map((node, index) => (
                        <div
                          key={node.id}
                          onClick={() => setSelectedNodeId(node.id)}
                          className={`w-[220px] rounded-xl border p-4 cursor-pointer transition-all duration-300 ${
                            selectedNodeId === node.id
                              ? "border-primary bg-primary/5 shadow-[0_0_12px_rgba(139,92,246,0.25)]"
                              : "border-border bg-card hover:border-foreground/20"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-muted-foreground">
                              Node {index + 1}
                            </span>
                            <div className="flex gap-0.5">
                              {node.tools.map((t) => (
                                <Badge key={t} variant="secondary" className="text-[8px] px-1 py-0">
                                  {t}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <h3 className="font-display text-sm font-bold mt-2">{node.name}</h3>
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                            {node.role}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Code Generator & Configuration Export */}
            <Tabs defaultValue="langgraph" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-muted/65 p-1 rounded-xl">
                <TabsTrigger value="langgraph" className="rounded-lg text-xs font-semibold">
                  LangGraph (Py)
                </TabsTrigger>
                <TabsTrigger value="crewai" className="rounded-lg text-xs font-semibold">
                  CrewAI (Py)
                </TabsTrigger>
                <TabsTrigger value="typescript" className="rounded-lg text-xs font-semibold">
                  Vite / Node (TS)
                </TabsTrigger>
                <TabsTrigger value="instructions" className="rounded-lg text-xs font-semibold">
                  Mermaid Map
                </TabsTrigger>
              </TabsList>

              <TabsContent value="langgraph" className="mt-4">
                <Card className="border border-border bg-card shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-3 bg-muted/30 border-b border-border/80">
                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <FileCode className="h-4 w-4 text-primary" /> Python implementation using
                      LangGraph
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5"
                      onClick={() => handleCopyText(generatedLangGraph, "LangGraph template")}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy Code
                    </Button>
                  </div>
                  <pre className="p-4 max-h-[380px] overflow-y-auto text-xs font-mono bg-black/60 text-emerald-400/90 leading-relaxed rounded-b-xl select-all">
                    {generatedLangGraph}
                  </pre>
                </Card>
              </TabsContent>

              <TabsContent value="crewai" className="mt-4">
                <Card className="border border-border bg-card shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-3 bg-muted/30 border-b border-border/80">
                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <FileCode className="h-4 w-4 text-primary" /> Python implementation using
                      CrewAI
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5"
                      onClick={() => handleCopyText(generatedCrewAI, "CrewAI template")}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy Code
                    </Button>
                  </div>
                  <pre className="p-4 max-h-[380px] overflow-y-auto text-xs font-mono bg-black/60 text-pink-400/90 leading-relaxed rounded-b-xl select-all">
                    {generatedCrewAI}
                  </pre>
                </Card>
              </TabsContent>

              <TabsContent value="typescript" className="mt-4">
                <Card className="border border-border bg-card shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-3 bg-muted/30 border-b border-border/80">
                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <FileCode className="h-4 w-4 text-primary" /> TypeScript implementation using
                      OpenAI SDK
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5"
                      onClick={() => handleCopyText(generatedTypeScript, "TypeScript template")}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy Code
                    </Button>
                  </div>
                  <pre className="p-4 max-h-[380px] overflow-y-auto text-xs font-mono bg-black/60 text-indigo-400/90 leading-relaxed rounded-b-xl select-all">
                    {generatedTypeScript}
                  </pre>
                </Card>
              </TabsContent>

              <TabsContent value="instructions" className="mt-4">
                <Card className="border border-border bg-card shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-3 bg-muted/30 border-b border-border/80">
                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <GitBranch className="h-4 w-4 text-primary" /> Mermaid Flowchart Markdown
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5"
                      onClick={() => handleCopyText(mermaidGraph, "Mermaid Markdown")}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy Markdown
                    </Button>
                  </div>
                  <pre className="p-4 max-h-[380px] overflow-y-auto text-xs font-mono bg-black/60 text-slate-300 leading-relaxed rounded-b-xl select-all">
                    {mermaidGraph}
                  </pre>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Interactive Workflow Simulator Panel */}
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="font-display text-base font-bold flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-primary" /> Interactive Agent Simulator
                </CardTitle>
                <CardDescription>
                  Walk through step-by-step to see how data flows and how agents communicate.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Simulation Prompt Input */}
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1.5">
                    <Label htmlFor="sim-query" className="text-xs font-semibold">
                      Sample Query
                    </Label>
                    <Input
                      id="sim-query"
                      value={simulationQuery}
                      onChange={(e) => setSimulationQuery(e.target.value)}
                      disabled={simActive}
                      placeholder="Type a sample task prompt to trace..."
                    />
                  </div>
                  <div className="flex items-end">
                    {!simActive ? (
                      <Button onClick={startSimulation} className="gap-1.5 h-10">
                        <Play className="h-4 w-4" />
                        Run Simulation
                      </Button>
                    ) : (
                      <Button
                        onClick={advanceSimulation}
                        variant="default"
                        className="gap-1.5 h-10 bg-indigo-600 hover:bg-indigo-700"
                      >
                        <ArrowRight className="h-4 w-4" />
                        Next Step
                      </Button>
                    )}
                  </div>
                </div>

                {/* Simulation Console Screen */}
                <div className="rounded-xl bg-black/70 border border-border/80 p-4 font-mono text-xs text-slate-300 min-h-[180px] max-h-[280px] overflow-y-auto space-y-2.5">
                  <div className="text-muted-foreground/60 border-b border-border/30 pb-2 flex justify-between items-center">
                    <span>STATION OPERATIONAL CONSOLE TRACE</span>
                    {simActive && (
                      <span className="text-[10px] text-amber-500 animate-pulse font-semibold">
                        STEP {simStep + 1} OF {currentPresetSteps.length} ACTIVE
                      </span>
                    )}
                  </div>

                  {simLog.length === 0 ? (
                    <div className="h-[120px] flex items-center justify-center text-muted-foreground/45 text-center">
                      <p>
                        No active session logs.
                        <br />
                        Click "Run Simulation" above to visualize message routing.
                      </p>
                    </div>
                  ) : (
                    simLog.map((logLine, idx) => (
                      <div
                        key={idx}
                        className={`whitespace-pre-wrap ${
                          logLine.startsWith("---")
                            ? "text-primary font-bold mt-4"
                            : logLine.startsWith("[Transfer]")
                              ? "text-amber-400 font-semibold"
                              : logLine.startsWith("[System]")
                                ? "text-slate-400"
                                : "text-emerald-400"
                        }`}
                      >
                        {logLine}
                      </div>
                    ))
                  )}
                </div>

                {simActive && (
                  <div className="flex justify-between items-center bg-muted/20 border border-border/60 p-3 rounded-lg text-xs">
                    <span className="text-muted-foreground">
                      Current Agent Node Active: <strong>{activeNode?.name}</strong>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetSimulation}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" /> End Early
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </SiteLayout>
  );
}
