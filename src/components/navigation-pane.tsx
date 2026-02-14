"use client";

import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  Clock,
  Compass,
  FileText,
  History,
  LayoutDashboard,
  Link2,
  Map,
  Target,
} from "lucide-react";
import { CareerStep, useCareer } from "@/lib/career-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const stepMetadata: Record<CareerStep, { label: string; description: string; icon: LucideIcon }> = {
  landing: {
    label: "Welcome Overview",
    description: "Hero experience that introduces the AI co-pilot and core value props.",
    icon: Compass,
  },
  profile: {
    label: "Profile Intake",
    description: "Collect candidate details, resume text, links, and extracted skills.",
    icon: FileText,
  },
  "dream-role": {
    label: "Dream Role",
    description: "Select target role persona and calibrate desired outcomes.",
    icon: Target,
  },
  analysis: {
    label: "Gap Analysis",
    description: "Agent reasoning traces and prioritized skill gap assessment.",
    icon: Brain,
  },
  roadmap: {
    label: "Adaptive Roadmap",
    description: "AI-generated 30-day plan with checkpoints, projects, and resources.",
    icon: Map,
  },
  dashboard: {
    label: "Progress Dashboard",
    description: "Visualization of milestones, velocity, and performance metrics.",
    icon: LayoutDashboard,
  },
};

function formatTimestamp(timestamp: number, formatter: Intl.DateTimeFormat) {
  try {
    return formatter.format(timestamp);
  } catch {
    return "--:--";
  }
}

const keyboardShortcuts = [
  { combo: "Alt + ←", description: "Back" },
  { combo: "Alt + →", description: "Forward" },
  { combo: "Ctrl/Cmd + ←", description: "Back" },
  { combo: "Ctrl/Cmd + →", description: "Forward" },
];

export function NavigationPane() {
  const { state, goBack, goForward, jumpToHistory } = useCareer();
  const [copiedLink, setCopiedLink] = useState(false);
  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }),
    []
  );

  const historyWithIndex = useMemo(
    () =>
      state.history
        .map((entry, index) => ({ entry, index }))
        .reverse(),
    [state.history]
  );

  const futureEntries = useMemo(
    () => state.future.slice(0, 5),
    [state.future]
  );

  const canGoBack = state.history.length > 0;
  const canGoForward = state.future.length > 0;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditable = target?.isContentEditable || ["INPUT", "TEXTAREA"].includes(target?.tagName ?? "");
      if (isEditable) return;

      const isBackCombo =
        (event.altKey || event.metaKey || event.ctrlKey) &&
        !event.shiftKey &&
        event.key === "ArrowLeft";
      const isForwardCombo =
        (event.altKey || event.metaKey || event.ctrlKey) &&
        !event.shiftKey &&
        event.key === "ArrowRight";

      if (isBackCombo && canGoBack) {
        event.preventDefault();
        goBack();
      }
      if (isForwardCombo && canGoForward) {
        event.preventDefault();
        goForward();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canGoBack, canGoForward, goBack, goForward]);

  useEffect(() => {
    if (!copiedLink) return;
    const timeout = window.setTimeout(() => setCopiedLink(false), 2400);
    return () => window.clearTimeout(timeout);
  }, [copiedLink]);

  const handleCopyDeepLink = async () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopiedLink(true);
    } catch (error) {
      console.error("Failed to copy link", error);
    }
  };

  const handleHistorySelect = (index: number) => {
    jumpToHistory(index);
  };

  const currentMeta = stepMetadata[state.currentStep];

  return (
    <aside
      role="navigation"
      aria-label="Workflow navigation history"
      className="fixed bottom-4 left-4 z-50 w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border/70 bg-card/90 shadow-2xl backdrop-blur-xl"
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <History className="h-4 w-4 text-primary" aria-hidden="true" />
          Navigation
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={goBack}
            disabled={!canGoBack}
            aria-label="Go back"
            className="rounded-full"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={goForward}
            disabled={!canGoForward}
            aria-label="Go forward"
            className="rounded-full"
          >
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={handleCopyDeepLink}
            aria-live="polite"
            aria-label={copiedLink ? "Deep link copied" : "Copy deep link"}
            className={cn("rounded-full", copiedLink && "text-emerald-500")}
          >
            {copiedLink ? <Check className="h-4 w-4" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}
          </Button>
        </div>
      </div>
      <Separator />
      <div className="px-4 py-3" aria-live="polite">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
            <currentMeta.icon className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-2 text-sm font-semibold">
              <span>{currentMeta.label}</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {formatTimestamp(Date.now(), timeFormatter)}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{currentMeta.description}</p>
          </div>
        </div>
      </div>
      <Separator />
      <div className="max-h-52 space-y-3 overflow-y-auto px-4 py-3" aria-label="Visited steps">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>History</span>
          <span className="font-medium text-foreground">{historyWithIndex.length || "--"}</span>
        </div>
        {historyWithIndex.length === 0 ? (
          <p className="text-xs text-muted-foreground">Navigate between steps to build history.</p>
        ) : (
          <ul className="space-y-2">
            {historyWithIndex.map(({ entry, index }) => {
              const meta = stepMetadata[entry.step];
              const key = `${entry.step}-${entry.timestamp}-${index}`;
              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => handleHistorySelect(index)}
                    className="w-full rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-left transition hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span>{meta.label}</span>
                      <span className="text-[10px] uppercase text-muted-foreground">
                        {formatTimestamp(entry.timestamp, timeFormatter)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{meta.description}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <Separator />
      <div className="space-y-3 px-4 py-3" aria-label="Upcoming steps">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Upcoming</span>
          <span className="font-medium text-foreground">{futureEntries.length || "--"}</span>
        </div>
        {futureEntries.length === 0 ? (
          <p className="text-xs text-muted-foreground">Forward stack is empty.</p>
        ) : (
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            {futureEntries.map((entry) => {
              const meta = stepMetadata[entry.step];
              return (
                <li key={`${entry.step}-${entry.timestamp}`} className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary/60" aria-hidden="true" />
                  <span className="font-medium text-foreground">{meta.label}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <Separator />
      <div className="space-y-2 px-4 py-3 text-xs text-muted-foreground">
        <div className="font-semibold uppercase tracking-wide">Keyboard Shortcuts</div>
        <ul className="space-y-1">
          {keyboardShortcuts.map((shortcut) => (
            <li key={shortcut.combo} className="flex items-center justify-between gap-4">
              <span>{shortcut.description}</span>
              <span className="rounded border border-border/70 bg-background px-1.5 py-0.5 font-medium text-foreground">
                {shortcut.combo}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export default NavigationPane;
