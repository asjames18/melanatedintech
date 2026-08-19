import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  PhoneCall,
  PhoneForwarded,
  Volume2,
  Copy,
  Download,
  Sparkles,
  Bot,
  Play,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Code2,
} from "lucide-react";
import { buildSeoMeta, ldScript, breadcrumbLd } from "@/lib/seo";
import { ToolCrossSell } from "@/components/tool-cross-sell";
import { ToolGuide } from "@/components/tool-guide";
import { trackEvent } from "@/lib/analytics";

const GUIDE_DATA = {
  whatItIs: "A Voice AI call-flow builder with a scripted preview, designed for small businesses, non-profits, ministries, and customer service teams.",
  whyUseIt: "Allows you to design, rehearse, and export starter voice agent configurations for platforms like Vapi AI and Retell AI without code. Exports are templates — you supply your own voice and model IDs before importing them.",
  howToUse: [
    "Select a pre-built Voice Agent Preset (Ministry Hotline, Appointment Booking, Non-Profit Intake, or Customer Service).",
    "Customize the Agent Name, Business Context, Voice Persona, and Primary Goal.",
    "Edit the Initial Greeting, Knowledge Rules, and Human Escalation/Transfer rules.",
    "Use the scripted call preview to walk through how your phone script handles each turn.",
    "Export starter JSON configs for Vapi AI, Retell AI, or copy the plain text script.",
  ],
};

export const Route = createFileRoute("/tools/voice-agent-builder")({
  head: () => {
    const seo = buildSeoMeta({
      title: "Voice AI Agent Call-Flow Builder — Melanated In Tech",
      description:
        "Design, rehearse, and export starter phone voice AI agent call flows for Vapi and Retell AI.",
      url: "/tools/voice-agent-builder",
    });
    return {
      meta: seo.meta,
      links: seo.links,
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "AI Tools", path: "/tools" },
            { name: "Voice Agent Builder", path: "/tools/voice-agent-builder" },
          ]),
        ),
      ],
    };
  },
  component: VoiceAgentBuilderPage,
});

type PresetKey = "ministry" | "appointment" | "intake" | "sales";

const PRESETS: Record<PresetKey, {
  name: string;
  agentName: string;
  businessName: string;
  goal: string;
  persona: string;
  greeting: string;
  instructions: string;
  transferRule: string;
  sampleCallerInputs: string[];
}> = {
  ministry: {
    name: "Church & Ministry Hotline",
    agentName: "Faith",
    businessName: "Grace Community Church",
    goal: "Share service times, take prayer requests, and register visitors for upcoming events.",
    persona: "Warm, empathetic, respectful, and clear",
    greeting: "Hello and welcome to Grace Community Church! I'm Faith, your automated assistant. How can I serve or support you today?",
    instructions: "Answer questions about Sunday service times (9 AM & 11 AM), record prayer requests attentively, and offer to text event links. If the caller expresses urgent personal distress, offer immediate pastoral transfer.",
    transferRule: "Transfer to Pastoral Care (Ext. 104) if caller mentions crisis, emergency, or asks to speak with a pastor directly.",
    sampleCallerInputs: [
      "What time are your Sunday services?",
      "Can I put in a prayer request for my grandmother?",
      "I'm going through a really tough time and need someone to talk to right now.",
    ],
  },
  appointment: {
    name: "Small Business Scheduler",
    agentName: "Alex",
    businessName: "Summit HVAC & Contracting",
    goal: "Qualify service needs, check availability, and schedule technician dispatch.",
    persona: "Professional, efficient, reassuring, and articulate",
    greeting: "Thanks for calling Summit HVAC! My name is Alex. Are you calling for emergency repair, routine maintenance, or a quote?",
    instructions: "Identify caller's AC/Heating issue, confirm emergency status, collect name and zip code, and offer available dispatch slots for today or tomorrow.",
    transferRule: "Transfer to Dispatch (Ext. 201) if caller reports gas leak, smoke, or active flooding.",
    sampleCallerInputs: [
      "My air conditioner stopped blowing cold air this morning.",
      "How much does a furnace tune-up cost?",
      "I smell gas near my water heater!",
    ],
  },
  intake: {
    name: "Non-Profit Volunteer Intake",
    agentName: "Jordan",
    businessName: "Urban Youth Mentorship",
    goal: "Collect volunteer applicant information and schedule background orientation sessions.",
    persona: "Encouraging, organized, welcoming, and clear",
    greeting: "Hi there! Thank you for reaching out to Urban Youth Mentorship. I'm Jordan. Are you interested in becoming a mentor, donating, or learning about our programs?",
    instructions: "Gather volunteer contact info, ask about weekday availability, explain background check requirements, and send an SMS signup link.",
    transferRule: "Transfer to Director of Volunteer Operations if caller is a corporate sponsor or media inquiry.",
    sampleCallerInputs: [
      "I'd like to volunteer as a weekend youth mentor.",
      "Our company wants to sponsor your summer program.",
      "What are the requirements to pass a background check?",
    ],
  },
  sales: {
    name: "Service Lead Qualification",
    agentName: "Taylor",
    businessName: "Apex Digital Solutions",
    goal: "Qualify inbound leads by budget and timeline, then book a discovery call on Calendly.",
    persona: "Confident, articulate, inquisitive, and consultative",
    greeting: "Hello, thanks for calling Apex Digital Solutions! I'm Taylor. What project or service can we help your business build today?",
    instructions: "Ask about current digital agency needs (web app, AI automation, branding), estimated budget range ($5k+), and project timeline. If qualified, text discovery booking link.",
    transferRule: "Transfer to Senior Account Executive if budget exceeds $25,000 or immediate contract review is requested.",
    sampleCallerInputs: [
      "We need a custom web portal built for our healthcare business.",
      "What is your pricing for AI workflow automation?",
      "We have a $30,000 budget and want to start immediately.",
    ],
  },
};

function VoiceAgentBuilderPage() {
  const [selectedPreset, setSelectedPreset] = useState<PresetKey>("ministry");
  const [agentName, setAgentName] = useState(PRESETS.ministry.agentName);
  const [businessName, setBusinessName] = useState(PRESETS.ministry.businessName);
  const [voiceProvider, setVoiceProvider] = useState<"vapi" | "retell" | "openai">("vapi");
  const [voiceStyle, setVoiceStyle] = useState("Warm & Friendly");
  const [goal, setGoal] = useState(PRESETS.ministry.goal);
  const [greeting, setGreeting] = useState(PRESETS.ministry.greeting);
  const [instructions, setInstructions] = useState(PRESETS.ministry.instructions);
  const [transferRule, setTransferRule] = useState(PRESETS.ministry.transferRule);

  // Simulator State
  const [simIndex, setSimIndex] = useState(0);
  const [callActive, setCallActive] = useState(false);
  const [callLog, setCallLog] = useState<{ sender: "agent" | "caller"; text: string }[]>([]);

  const handleApplyPreset = (key: PresetKey) => {
    setSelectedPreset(key);
    const p = PRESETS[key];
    setAgentName(p.agentName);
    setBusinessName(p.businessName);
    setGoal(p.goal);
    setGreeting(p.greeting);
    setInstructions(p.instructions);
    setTransferRule(p.transferRule);
    setCallActive(false);
    setCallLog([]);
    setSimIndex(0);
    toast.success(`Loaded preset: ${p.name}`);
  };

  const startSimCall = () => {
    setCallActive(true);
    setSimIndex(0);
    setCallLog([
      { sender: "agent", text: greeting },
    ]);
    trackEvent("voice_agent_sim_started", { preset: selectedPreset, provider: voiceProvider });
  };

  const advanceSimTurn = (userText: string) => {
    if (!callActive) return;
    const newLog = [...callLog, { sender: "caller" as const, text: userText }];

    // Scripted reply: keyword matching, not a model call. Kept deliberately
    // simple so the preview stays free and offline; the UI says as much.
    let agentResponse = `Thank you for sharing that. Based on your inquiry regarding "${userText.slice(0, 30)}...", I'm logging your request for ${businessName}. `;
    if (userText.toLowerCase().includes("urgent") || userText.toLowerCase().includes("emergency") || userText.toLowerCase().includes("talk to") || userText.toLowerCase().includes("crisis") || userText.toLowerCase().includes("gas")) {
      agentResponse += `[ESCALATION TRIGGERED] ${transferRule}`;
    } else if (userText.toLowerCase().includes("time") || userText.toLowerCase().includes("service") || userText.toLowerCase().includes("cost")) {
      agentResponse += `Here is what you need to know: ${instructions.slice(0, 100)}... I've also sent an instant SMS link to your phone!`;
    } else {
      agentResponse += `Is there anything else I can assist you with today regarding our services at ${businessName}?`;
    }

    newLog.push({ sender: "agent", text: agentResponse });
    setCallLog(newLog);
    setSimIndex((prev) => prev + 1);
  };

  const endSimCall = () => {
    setCallActive(false);
    toast.info("Call ended.");
  };

  // Vapi Configuration JSON Export
  const vapiConfigJson = useMemo(() => {
    return JSON.stringify(
      {
        name: `${businessName} - ${agentName}`,
        model: {
          provider: "openai",
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are ${agentName}, an voice AI assistant calling on behalf of ${businessName}. Primary Goal: ${goal}. Tone/Persona: ${voiceStyle}. Instructions: ${instructions}. Escalation Rule: ${transferRule}`,
            },
          ],
        },
        voice: {
          provider: "elevenlabs",
          // Replace with a voiceId from your own ElevenLabs voice library.
          voiceId: "REPLACE_WITH_YOUR_ELEVENLABS_VOICE_ID",
          style: voiceStyle,
        },
        firstMessage: greeting,
        endCallFunctionEnabled: true,
        recordingEnabled: true,
      },
      null,
      2
    );
  }, [agentName, businessName, goal, voiceStyle, instructions, transferRule, greeting]);

  // Retell AI Configuration JSON Export
  const retellConfigJson = useMemo(() => {
    return JSON.stringify(
      {
        agent_name: `${agentName} (${businessName})`,
        // Both IDs below come from your own Retell dashboard — the config will
        // not import until you replace them.
        voice_id: "REPLACE_WITH_YOUR_RETELL_VOICE_ID",
        response_engine: {
          type: "retell-llm",
          llm_id: "REPLACE_WITH_YOUR_RETELL_LLM_ID",
        },
        general_prompt: `System: You are ${agentName} at ${businessName}.\nGoal: ${goal}\nPersona: ${voiceStyle}\nInstructions: ${instructions}\nTransfer Trigger: ${transferRule}`,
        begin_message: greeting,
        enable_backchannel: true,
      },
      null,
      2
    );
  }, [agentName, businessName, goal, voiceStyle, instructions, transferRule, greeting]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
    trackEvent("voice_config_copied", { label });
  };

  const downloadJson = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Interactive Voice Studio"
        title="Voice AI Agent Call-Flow Builder."
        description="Design, rehearse, and export starter phone voice AI agent configs for Vapi AI and Retell AI, built for small businesses, ministries, and customer support."
      />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <ToolGuide guide={GUIDE_DATA} />

        {/* Preset Selector */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" /> Choose an Industry Preset
              </h3>
              <p className="text-xs text-muted-foreground">Select a pre-configured template to seed your voice agent.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(Object.keys(PRESETS) as PresetKey[]).map((key) => {
              const p = PRESETS[key];
              const isSelected = selectedPreset === key;
              return (
                <button
                  key={key}
                  onClick={() => handleApplyPreset(key)}
                  className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                      : "border-border bg-muted/30 hover:bg-muted"
                  }`}
                >
                  <span className="text-xs font-semibold text-primary mb-1">Preset</span>
                  <span className="text-sm font-bold text-foreground">{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Builder Form Controls */}
          <div className="lg:col-span-7 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Sliders className="h-5 w-5 text-primary" /> Agent Configuration
                </CardTitle>
                <CardDescription>Customize caller identity, system instructions, and escalation safety rules.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="agentName">Agent Name</Label>
                    <Input
                      id="agentName"
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      placeholder="e.g. Faith or Alex"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessName">Business / Org Name</Label>
                    <Input
                      id="businessName"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Summit Contracting"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="provider">Target Platform</Label>
                    <Select value={voiceProvider} onValueChange={(val: any) => setVoiceProvider(val)}>
                      <SelectTrigger id="provider">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vapi">Vapi AI (Developer-first)</SelectItem>
                        <SelectItem value="retell">Retell AI (Turnkey)</SelectItem>
                        <SelectItem value="openai">OpenAI Realtime API</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="style">Persona & Tone</Label>
                    <Select value={voiceStyle} onValueChange={(val) => setVoiceStyle(val)}>
                      <SelectTrigger id="style">
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Warm & Friendly">Warm & Friendly</SelectItem>
                        <SelectItem value="Professional & Clear">Professional & Clear</SelectItem>
                        <SelectItem value="Energetic & Enthusiastic">Energetic & Enthusiastic</SelectItem>
                        <SelectItem value="Direct & Consultative">Direct & Consultative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="goal">Primary Agent Goal</Label>
                  <Input
                    id="goal"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="Describe main call objective..."
                  />
                </div>

                <div>
                  <Label htmlFor="greeting">Initial Greeting (First Words Spoken)</Label>
                  <Textarea
                    id="greeting"
                    rows={2}
                    value={greeting}
                    onChange={(e) => setGreeting(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="instructions">System Instructions & Knowledge Base</Label>
                  <Textarea
                    id="instructions"
                    rows={3}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="transferRule" className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <PhoneForwarded className="h-4 w-4" /> Human Handoff / Emergency Transfer Rule
                  </Label>
                  <Input
                    id="transferRule"
                    value={transferRule}
                    onChange={(e) => setTransferRule(e.target.value)}
                    placeholder="Specify when agent should transfer call to live human..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Platform JSON Config Export */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-indigo-500" /> Platform Starter Config ({voiceProvider.toUpperCase()})
                  </CardTitle>
                  <CardDescription>
                    A starting template. Replace every <code>REPLACE_WITH_*</code> value with an ID
                    from your own {voiceProvider === "vapi" ? "ElevenLabs" : "Retell"} account before
                    importing.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(voiceProvider === "vapi" ? vapiConfigJson : retellConfigJson, `${voiceProvider.toUpperCase()} Config`)}
                  >
                    <Copy className="h-4 w-4 mr-1" /> Copy JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadJson(voiceProvider === "vapi" ? vapiConfigJson : retellConfigJson, `${agentName.toLowerCase()}-${voiceProvider}-config.json`)}
                  >
                    <Download className="h-4 w-4 mr-1" /> Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-56">
                  {voiceProvider === "vapi" ? vapiConfigJson : retellConfigJson}
                </pre>
              </CardContent>
            </Card>
          </div>

          {/* Phone Call Simulator */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-2 border-primary/20 shadow-md">
              <CardHeader className="bg-primary/5 rounded-t-xl pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2 text-foreground">
                    <PhoneCall className="h-5 w-5 text-emerald-500 animate-pulse" /> Scripted Call
                    Preview
                  </CardTitle>
                  <Badge variant={callActive ? "default" : "secondary"}>
                    {callActive ? "IN PREVIEW" : "IDLE"}
                  </Badge>
                </div>
                <CardDescription>
                  Walk through the call turn by turn. Replies come from a fixed script in your
                  browser, not from a language model, so use this to check your wording and
                  escalation rule — not to judge how a live agent would answer.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {!callActive ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Bot className="h-8 w-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{agentName} ({businessName})</h4>
                      <p className="text-xs text-muted-foreground">{voiceStyle} Voice Persona</p>
                    </div>
                    <Button onClick={startSimCall} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Play className="h-4 w-4 mr-2" /> Start Simulated Phone Call
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Active Conversation Display */}
                    <div className="h-72 overflow-y-auto p-3 rounded-xl bg-muted/40 border border-border space-y-3 text-xs">
                      {callLog.map((log, i) => (
                        <div
                          key={i}
                          className={`flex flex-col ${
                            log.sender === "agent" ? "items-start" : "items-end"
                          }`}
                        >
                          <span className="text-[10px] text-muted-foreground mb-0.5 font-semibold">
                            {log.sender === "agent" ? agentName : "Caller"}
                          </span>
                          <div
                            className={`p-2.5 rounded-2xl max-w-[85%] leading-relaxed ${
                              log.sender === "agent"
                                ? "bg-primary text-primary-foreground rounded-tl-none"
                                : "bg-card border border-border text-foreground rounded-tr-none"
                            }`}
                          >
                            {log.text}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Simulated Caller Speech Prompts */}
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground mb-2 block">
                        Select a simulated caller prompt:
                      </Label>
                      <div className="space-y-2">
                        {PRESETS[selectedPreset].sampleCallerInputs.map((sample, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            onClick={() => advanceSimTurn(sample)}
                            className="w-full text-left justify-start text-xs h-auto py-2 whitespace-normal"
                          >
                            💬 "{sample}"
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="destructive" size="sm" onClick={endSimCall} className="w-full">
                        End Call
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <ToolCrossSell tool="voice-agent-builder" />
      </section>
    </SiteLayout>
  );
}
