"use client";

import { FormEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare, X, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const buildSeedMessages = (): ChatMessage[] => [
  {
    id: `seed-${crypto.randomUUID()}`,
    role: "assistant",
    content: "Hi! I can explore the new feature roadmap, analyze your resume input in real time, or suggest next steps.",
    timestamp: Date.now(),
  },
  {
    id: `seed-${crypto.randomUUID()}`,
    role: "assistant",
    content: "Try pasting resume bullets, asking about skill gaps, or requesting a Market Pulse summary.",
    timestamp: Date.now(),
  },
];

const quickPrompts = [
  "Review my resume summary for tech roles",
  "What benefits does the Market Pulse deliver?",
  "Suggest next steps for my roadmap",
  "Highlight my critical skill gaps",
  "How should I prep for interviews next week?",
];

export function AIChatPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => buildSeedMessages());
  const [input, setInput] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: `user-${crypto.randomUUID()}`,
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };

    const assistantMessage: ChatMessage = {
      id: `assistant-${crypto.randomUUID()}`,
      role: "assistant",
      content: formatAssistantReply(trimmed),
      timestamp: Date.now() + 1,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      <Button
        size="lg"
        variant="default"
        className="pointer-events-auto shadow-lg"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="ai-chat-panel"
      >
        <MessageSquare className="mr-2 h-5 w-5" aria-hidden="true" />
        AI Career Guide
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            id="ai-chat-panel"
            className="pointer-events-auto flex w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                AI Career Copilot
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setMessages(buildSeedMessages())}
                  aria-label="Reset conversation"
                  className="rounded-full"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close AI chat"
                  className="rounded-full"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>

            <ScrollArea className="h-72 w-full px-4 py-3">
              <div className="space-y-3 text-sm">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={
                      message.role === "assistant"
                        ? "flex items-start gap-2"
                        : "flex items-start justify-end gap-2"
                    }
                  >
                    {message.role === "assistant" && (
                      <Badge variant="outline" className="mt-0.5 uppercase">
                        AI
                      </Badge>
                    )}
                    <div
                      className={
                        message.role === "assistant"
                          ? "rounded-lg bg-muted/60 px-3 py-2 text-muted-foreground"
                          : "rounded-lg bg-primary px-3 py-2 text-primary-foreground"
                      }
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t border-border/60 bg-muted/20 px-4 py-3">
              <div className="mb-3 flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <Button
                    key={prompt}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handlePromptClick(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  className="h-10 flex-1 rounded-md border border-border/60 bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  placeholder="Ask about a feature, roadmap, or skill gap..."
                />
                <Button type="submit" size="icon" disabled={!input.trim()}>
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatAssistantReply(prompt: string) {
  const normalized = prompt.toLowerCase();

  if (normalized.includes("resume") || normalized.includes("cv")) {
    return "Paste your resume excerpt and I’ll highlight missing metrics, active verbs, and alignment tips for your target role.";
  }
  if (normalized.includes("interview")) {
    return "The Adaptive Interview Simulator personalizes questions to your skill gaps and gives instant feedback after each session.";
  }
  if (normalized.includes("market") || normalized.includes("pulse")) {
    return "Market Pulse surfaces real-time demand indicators, salary bands, and trending requirements for your target roles.";
  }
  if (normalized.includes("referral")) {
    return "The Referral Marketplace connects you to hiring partners once you complete milestone checkpoints, opening warm intros.";
  }
  if (normalized.includes("wellbeing")) {
    return "The Wellbeing Lens balances workload and recovery suggestions so you can maintain momentum without burnout.";
  }
  if (normalized.includes("roadmap") || normalized.includes("next step")) {
    return "Focus on critical skill gaps first, schedule an interview sprint, and consider joining a peer accountability pod for momentum.";
  }
  if (normalized.includes("skill gap")) {
    return "Your critical gaps map to the roadmap checkpoints. Tackle high-priority skills first, then reinforce with portfolio projects.";
  }
  if (normalized.includes("interview") && normalized.includes("prep")) {
    return "Block two mock sessions this week, rehearse STAR stories tied to recent projects, and log insights in the dashboard streak tracker.";
  }
  if (normalized.includes("ats") || normalized.includes("application")) {
    return "Use the role-based templates to tailor keywords, mirror the job description, and export an ATS-friendly PDF.";
  }
  if (normalized.includes("job description")) {
    return "Paste the description and I’ll help map required skills to your current gaps so the roadmap can adapt.";
  }

  return "I logged your question. For deeper insights, tap a feature card on the landing experience or explore your dashboard analytics.";
}

export default AIChatPanel;
