"use client";

import { useCallback, useMemo, useState } from "react";
import { useCareer } from "@/lib/career-context";
import { generateRoadmap, getLevelLabel, getPriorityColor } from "@/lib/career-engine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Target,
  Trophy,
  Compass,
  BarChart3,
  BookOpen,
  Flame,
  TrendingUp,
  RotateCcw,
  Map,
  FileJson,
  FileText,
} from "lucide-react";

const VARIANT_DURATIONS = [60, 90, 120, 180];

export default function DashboardStep() {
  const { state, setCurrentStep, toggleDayComplete, resetState } = useCareer();
  const [featureDialogOpen, setFeatureDialogOpen] = useState(false);

  const completedCount = state.completedDays.length;
  const totalDays = state.roadmap?.days.length || 30;
  const progressPercent = (completedCount / totalDays) * 100;

  const completedHours = useMemo(() => {
    if (!state.roadmap) return 0;
    return state.roadmap.days
      .filter((d) => state.completedDays.includes(d.day))
      .reduce((sum, d) => sum + d.estimatedHours, 0);
  }, [state.roadmap, state.completedDays]);

  const currentStreak = useMemo(() => {
    const sorted = [...state.completedDays].sort((a, b) => b - a);
    let streak = 0;
    for (let i = 0; i < sorted.length; i++) {
      if (i === 0 || sorted[i] === sorted[i - 1] - 1) {
        streak++;
      } else break;
    }
    return streak;
  }, [state.completedDays]);

  const skillProgress = useMemo(() => {
    if (!state.roadmap || !state.skillGaps.length) return [];
    const skillDays: Record<string, { total: number; completed: number }> = {};
    for (const day of state.roadmap.days) {
      if (!skillDays[day.skillFocus]) skillDays[day.skillFocus] = { total: 0, completed: 0 };
      skillDays[day.skillFocus].total++;
      if (state.completedDays.includes(day.day)) skillDays[day.skillFocus].completed++;
    }
    return Object.entries(skillDays).map(([skill, data]) => ({
      skill,
      progress: data.total > 0 ? (data.completed / data.total) * 100 : 0,
      completed: data.completed,
      total: data.total,
      gap: state.skillGaps.find((g) => g.skill === skill),
    }));
  }, [state.roadmap, state.completedDays, state.skillGaps]);

  const nextMilestone = useMemo(() => {
    if (!state.roadmap) return null;
    return state.roadmap.milestones.find((m) => !state.completedDays.includes(m.day));
  }, [state.roadmap, state.completedDays]);

  const variantSnapshots = useMemo(() => {
    if (!state.profile || !state.dreamRole || !state.skillGaps.length) return [];
    return VARIANT_DURATIONS.map((duration) => {
      const variant = generateRoadmap(state.skillGaps, state.profile!, state.dreamRole!, {
        durationDays: duration,
      });
      return {
        durationDays: variant.durationDays,
        totalHours: Math.round(variant.totalHours),
        milestones: variant.milestones,
      };
    });
  }, [state.profile, state.dreamRole, state.skillGaps]);

  const summaryData = useMemo(() => {
    if (!state.profile || !state.dreamRole) return null;

    const gapsNeedingWork = state.skillGaps.filter((gap) => gap.gap > 0);
    const topGaps = gapsNeedingWork.slice(0, 5);
    const criticalGaps = gapsNeedingWork.filter((gap) => gap.priority === "critical");
    const importantGaps = gapsNeedingWork.filter((gap) => gap.priority === "important");
    const niceToHaveGaps = gapsNeedingWork.filter((gap) => gap.priority === "nice-to-have");
    const metSkills = state.skillGaps.filter((gap) => gap.gap === 0);

    const readinessStage = progressPercent >= 75
      ? "Launch Ready"
      : progressPercent >= 50
      ? "Momentum Building"
      : progressPercent > 0
      ? "Foundations Underway"
      : "Kickoff";

    const readinessNarrative = (() => {
      if (progressPercent >= 75) {
        return "Portfolio is nearly complete. Shift emphasis to interview reps and outreach sequencing.";
      }
      if (progressPercent >= 50) {
        return "Translate new skills into end-to-end projects and storytelling artifacts.";
      }
      if (progressPercent > 0) {
        return "Keep momentum by pairing daily lessons with quick retros to lock in learning.";
      }
      return "Run the agent workflow to generate your personalized roadmap and unlock guided tasks.";
    })();

    const focusAreaCounts: Record<string, number> = {};
    state.roadmap?.days.forEach((day) => {
      focusAreaCounts[day.skillFocus] = (focusAreaCounts[day.skillFocus] || 0) + 1;
    });
    const focusAreas = Object.entries(focusAreaCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill, emphasisDays]) => ({
        skill,
        emphasisDays,
        priority: state.skillGaps.find((gap) => gap.skill === skill)?.priority ?? "support",
      }));

    const upcomingTasks = state.roadmap
      ? state.roadmap.days
          .filter((day) => !state.completedDays.includes(day.day))
          .slice(0, 5)
          .map((day) => ({
            day: day.day,
            title: day.title,
            skill: day.skillFocus,
            hours: day.estimatedHours,
            checkpoint: day.checkpoint,
          }))
      : [];

    const recommendedActions: string[] = [];
    if (!state.completedDays.length) {
      recommendedActions.push("Toggle into the roadmap module and mark a single day complete to activate progress analytics.");
    }
    if (criticalGaps.length) {
      recommendedActions.push(
        `Schedule focused sessions on ${criticalGaps.slice(0, 2).map((gap) => gap.skill).join(", ")}${
          criticalGaps.length > 2 ? ` (+${criticalGaps.length - 2} more)` : ""
        } to neutralize critical blockers.`
      );
    }
    if (progressPercent < 50 && state.roadmap) {
      recommendedActions.push("Spin up a portfolio artifact from this week's tasks to document tangible momentum.");
    }
    if (progressPercent >= 50 && progressPercent < 75) {
      recommendedActions.push("Begin mock interviews targeting behavioral and role-specific narratives.");
    }
    if (progressPercent >= 75) {
      recommendedActions.push("Launch an application sprint with 5-7 high-fit opportunities this week.");
    }

    const growthOpportunities = gapsNeedingWork
      .slice(0, 3)
      .map((gap) => ({
        skill: gap.skill,
        priority: gap.priority,
        targetLevel: getLevelLabel(gap.requiredLevel),
        supportHours: state.roadmap
          ? state.roadmap.days
              .filter((day) => day.skillFocus === gap.skill)
              .reduce((sum, day) => sum + day.estimatedHours, 0)
          : 0,
      }));

    return {
      generatedAt: new Date().toISOString(),
      profile: {
        name: state.profile.name,
        email: state.profile.email,
        experience: state.profile.experience,
        education: state.profile.education,
        githubUrl: state.profile.githubUrl,
        linkedinUrl: state.profile.linkedinUrl,
      },
      dreamRole: {
        title: state.dreamRole.title,
        company: state.dreamRole.company,
        demandLevel: state.dreamRole.demandLevel,
        salaryRange: state.dreamRole.salaryRange,
      },
      roadmapSummary: state.roadmap
        ? {
            durationDays: state.roadmap.durationDays,
            totalHours: Number(state.roadmap.totalHours.toFixed(1)),
            checkpointCount: state.roadmap.milestones.length,
            milestones: state.roadmap.milestones,
          }
        : null,
      multiDurationVariants: variantSnapshots.map((variant) => ({
        durationDays: variant.durationDays,
        totalHours: variant.totalHours,
        milestoneCount: variant.milestones.length,
      })),
      metrics: {
        criticalGapCount: criticalGaps.length,
        importantGapCount: importantGaps.length,
        niceToHaveGapCount: niceToHaveGaps.length,
        skillsMet: metSkills.length,
      },
      progress: {
        completedDays: completedCount,
        totalDays,
        completionPercent: Number(progressPercent.toFixed(1)),
        completedHours: Number(completedHours.toFixed(1)),
        streak: currentStreak,
        nextMilestone: nextMilestone
          ? { title: nextMilestone.title, day: nextMilestone.day }
          : null,
      },
      skillHighlights: topGaps.map((gap) => ({
        skill: gap.skill,
        priority: gap.priority,
        currentLevel: getLevelLabel(gap.currentLevel),
        targetLevel: getLevelLabel(gap.requiredLevel),
      })),
      readiness: {
        stage: readinessStage,
        narrative: readinessNarrative,
      },
      recommendedActions,
      upcomingTasks,
      focusAreas,
      growthOpportunities,
    };
  }, [
    state.profile,
    state.dreamRole,
    state.skillGaps,
    state.roadmap,
    variantSnapshots,
    completedCount,
    totalDays,
    progressPercent,
    completedHours,
    currentStreak,
    nextMilestone,
  ]);

  const handleDownloadJson = useCallback(() => {
    if (!summaryData) return;
    const data = JSON.stringify(summaryData, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "career-summary.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [summaryData]);

  const handleDownloadPdf = useCallback(async () => {
    if (!summaryData) return;
    const [{ jsPDF }, autoTableModule] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);

    const autoTable: any = (autoTableModule as any).default || autoTableModule;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;

    const formatText = (value: string | number | null | undefined) =>
      String(value ?? "").replace(/[–—]/g, "-").replace(/→/g, "->").replace(/[•·]/g, "-");

    // Header band
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 32, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("Career Navigator Executive Summary", margin, 17);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date(summaryData.generatedAt).toLocaleString()}`, margin, 24);
    doc.text(`Dream Role: ${formatText(summaryData.dreamRole?.title || "N/A")}`, margin, 29);

    doc.setTextColor(33, 37, 41);
    doc.setFontSize(11);
    let cursorY = 40;

    const ensureSpace = (space: number) => {
      if (cursorY + space <= pageHeight - margin) return;
      doc.addPage();
      cursorY = margin;
    };

    const sectionHeading = (title: string, subtitle?: string) => {
      ensureSpace(subtitle ? 16 : 12);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(37, 99, 235);
      doc.text(formatText(title), margin, cursorY);
      cursorY += 6;
      if (subtitle) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(formatText(subtitle), margin, cursorY);
        cursorY += 5;
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(33, 37, 41);
    };

    const metricCards = (
      metrics: { label: string; value: string; accent?: [number, number, number] }[],
      rows: number
    ) => {
      const cardsPerRow = Math.min(metrics.length, 3);
      const gap = 4;
      const cardWidth = (pageWidth - margin * 2 - gap * (cardsPerRow - 1)) / cardsPerRow;
      const cardHeight = 20;

      for (let row = 0; row < rows; row++) {
        const rowMetrics = metrics.slice(row * cardsPerRow, (row + 1) * cardsPerRow);
        if (!rowMetrics.length) continue;
        ensureSpace(cardHeight + 6);
        rowMetrics.forEach((metric, index) => {
          const x = margin + index * (cardWidth + gap);
          doc.setFillColor(248, 250, 252);
          doc.roundedRect(x, cursorY, cardWidth, cardHeight, 3, 3, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.setTextColor(15, 23, 42);
          doc.text(formatText(metric.value), x + 4, cursorY + 9);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          const color = metric.accent ?? [148, 163, 184];
          doc.setTextColor(color[0], color[1], color[2]);
          doc.text(formatText(metric.label), x + 4, cursorY + 16);
        });
        cursorY += cardHeight + 6;
        doc.setTextColor(33, 37, 41);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
      }
    };

    const bulletList = (items: string[]) => {
      if (!items.length) return;
      ensureSpace(items.length * 6 + 6);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);
      items.forEach((item) => {
        doc.setFillColor(59, 130, 246);
        doc.circle(margin + 1.5, cursorY - 2, 0.8, "F");
        doc.text(formatText(item), margin + 5, cursorY);
        cursorY += 5.5;
      });
      cursorY += 3;
      doc.setTextColor(33, 37, 41);
    };

    const timelineList = (
      items: {
        day: number;
        title: string;
        skill: string;
        hours: number;
        checkpoint: boolean;
      }[]
    ) => {
      if (!items.length) return;
      items.forEach((item) => {
        ensureSpace(14);
        const isCheckpoint = item.checkpoint;
        doc.setFillColor(isCheckpoint ? 254 : 241, isCheckpoint ? 226 : 245, isCheckpoint ? 226 : 249);
        doc.roundedRect(margin, cursorY - 5, pageWidth - margin * 2, 12, 2, 2, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(30, 64, 175);
        doc.text(
          formatText(`Day ${item.day}: ${item.title}`),
          margin + 4,
          cursorY + 0.5
        );
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        const meta = `Focus: ${item.skill}  ·  ${item.hours}h${item.checkpoint ? "  ·  Checkpoint" : ""}`;
        doc.text(formatText(meta), margin + 4, cursorY + 5.5);
        cursorY += 12;
        doc.setTextColor(33, 37, 41);
      });
      cursorY += 2;
    };

    // Sections
    sectionHeading("Profile Snapshot", "Core identity and target role context");
    metricCards(
      [
        {
          label: "Profile",
          value: summaryData.profile?.name || "N/A",
          accent: [37, 99, 235],
        },
        {
          label: "Dream Role",
          value: summaryData.dreamRole?.title || "Not Defined",
          accent: [30, 64, 175],
        },
        {
          label: "Demand",
          value: summaryData.dreamRole?.demandLevel || "Unknown",
          accent: [249, 115, 22],
        },
      ],
      1
    );

    const contactLines = [
      summaryData.profile?.email ? `Email: ${summaryData.profile.email}` : "",
      summaryData.profile?.githubUrl ? `GitHub: ${summaryData.profile.githubUrl}` : "",
      summaryData.profile?.linkedinUrl ? `LinkedIn: ${summaryData.profile.linkedinUrl}` : "",
    ].filter(Boolean);
    if (contactLines.length) {
      ensureSpace(contactLines.length * 5 + 6);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      contactLines.forEach((line) => {
        doc.text(formatText(line), margin, cursorY + 2);
        cursorY += 5;
      });
      cursorY += 4;
      doc.setFontSize(11);
      doc.setTextColor(33, 37, 41);
    }

    if (summaryData.roadmapSummary) {
      metricCards(
        [
          {
            label: "Roadmap Duration",
            value: `${summaryData.roadmapSummary.durationDays} days`,
            accent: [14, 165, 233],
          },
          {
            label: "Total Guided Hours",
            value: `${summaryData.roadmapSummary.totalHours}h`,
            accent: [56, 189, 248],
          },
          {
            label: "Milestones",
            value: `${summaryData.roadmapSummary.checkpointCount}`,
            accent: [59, 130, 246],
          },
        ],
        1
      );
    }

    sectionHeading("Progress Pulse", summaryData.readiness.narrative);
    metricCards(
      [
        {
          label: "Completion",
          value: `${summaryData.progress.completionPercent}%`,
          accent: [59, 130, 246],
        },
        {
          label: "Hours Logged",
          value: `${summaryData.progress.completedHours}h`,
          accent: [249, 115, 22],
        },
        {
          label: "Active Streak",
          value: `${summaryData.progress.streak} day${summaryData.progress.streak === 1 ? "" : "s"}`,
          accent: [16, 185, 129],
        },
      ],
      1
    );

    metricCards(
      [
        {
          label: "Critical Gaps",
          value: `${summaryData.metrics.criticalGapCount}`,
          accent: [220, 38, 38],
        },
        {
          label: "Important Gaps",
          value: `${summaryData.metrics.importantGapCount}`,
          accent: [234, 179, 8],
        },
        {
          label: "Skills Already Met",
          value: `${summaryData.metrics.skillsMet}`,
          accent: [16, 185, 129],
        },
      ],
      1
    );

    if (summaryData.progress.nextMilestone) {
      ensureSpace(18);
      doc.setFillColor(240, 249, 255);
      doc.roundedRect(margin, cursorY - 4, pageWidth - margin * 2, 16, 3, 3, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 64, 175);
      doc.text(
        formatText(
          `Next Milestone · Day ${summaryData.progress.nextMilestone.day}: ${summaryData.progress.nextMilestone.title}`
        ),
        margin + 4,
        cursorY + 3
      );
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text("Stay on pace to unlock the subsequent sprint planning prompt.", margin + 4, cursorY + 9);
      cursorY += 18;
      doc.setTextColor(33, 37, 41);
    }

    if (summaryData.recommendedActions.length) {
      sectionHeading("Recommended Actions", "Agent suggestions for the next 7-day cycle");
      bulletList(summaryData.recommendedActions);
    }

    if (summaryData.upcomingTasks.length) {
      sectionHeading("Upcoming Focus Window", "Next five roadmap checkpoints");
      timelineList(summaryData.upcomingTasks);
    }

    if (summaryData.skillHighlights.length) {
      sectionHeading("Priority Skill Gaps");
      autoTable(doc, {
        startY: cursorY,
        head: [["Skill", "Priority", "Current", "Target"]],
        body: summaryData.skillHighlights.map((highlight) => [
          formatText(highlight.skill),
          formatText(highlight.priority),
          formatText(highlight.currentLevel),
          formatText(highlight.targetLevel),
        ]),
        theme: "grid",
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontSize: 10,
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [55, 65, 81],
        },
        styles: {
          cellPadding: 2.5,
        },
      });
      const tableFinalY = ((doc as any).lastAutoTable?.finalY as number | undefined) ?? cursorY;
      cursorY = tableFinalY + 8;
    }

    if (summaryData.focusAreas.length) {
      sectionHeading("Key Focus Themes");
      summaryData.focusAreas.forEach((area) => {
        ensureSpace(16);
        doc.setFillColor(247, 254, 231);
        doc.roundedRect(margin, cursorY - 5, pageWidth - margin * 2, 14, 2, 2, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(77, 124, 15);
        doc.text(formatText(area.skill), margin + 4, cursorY + 1);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(87, 83, 78);
        const descriptor = `${area.emphasisDays} day${area.emphasisDays === 1 ? "" : "s"} of emphasis · ${area.priority.toUpperCase()} priority`;
        doc.text(formatText(descriptor), margin + 4, cursorY + 6);
        cursorY += 14;
        doc.setTextColor(33, 37, 41);
      });
      cursorY += 2;
    }

    if (summaryData.growthOpportunities.length) {
      sectionHeading("Growth Opportunities", "High-leverage skills with dedicated hours inside your plan");
      autoTable(doc, {
        startY: cursorY,
        head: [["Skill", "Priority", "Target Level", "Allocated Hours"]],
        body: summaryData.growthOpportunities.map((opportunity) => [
          formatText(opportunity.skill),
          formatText(opportunity.priority),
          formatText(opportunity.targetLevel),
          formatText(`${opportunity.supportHours.toFixed(1)}h`),
        ]),
        theme: "striped",
        headStyles: {
          fillColor: [16, 185, 129],
          textColor: 255,
          fontSize: 10,
        },
        styles: {
          cellPadding: 2.5,
          fontSize: 9,
        },
        bodyStyles: {
          textColor: [55, 65, 81],
        },
        alternateRowStyles: {
          fillColor: [240, 253, 244],
        },
      });
      const tableFinalY = ((doc as any).lastAutoTable?.finalY as number | undefined) ?? cursorY;
      cursorY = tableFinalY + 8;
    }

    if (summaryData.multiDurationVariants.length) {
      sectionHeading("Extended Roadmap Options", "Choose deeper runway timelines when you need more space to level up");
      autoTable(doc, {
        startY: cursorY,
        head: [["Duration", "Approx Hours", "Milestones"]],
        body: summaryData.multiDurationVariants.map((variant) => [
          formatText(`${variant.durationDays} days`),
          formatText(`${variant.totalHours}h`),
          formatText(`${variant.milestoneCount}`),
        ]),
        theme: "grid",
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontSize: 10,
        },
        bodyStyles: {
          textColor: [55, 65, 81],
          fontSize: 9,
        },
        styles: {
          cellPadding: 2.5,
        },
      });
      const tableFinalY = ((doc as any).lastAutoTable?.finalY as number | undefined) ?? cursorY;
      cursorY = tableFinalY + 8;
    }

    doc.save("career-summary.pdf");
  }, [summaryData]);

  if (!state.roadmap) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <p className="text-muted-foreground">No data yet. Set up your profile to unlock the dashboard.</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={() => setCurrentStep("landing")}>
              <Compass className="mr-2 h-4 w-4" /> Launch Career Navigator
            </Button>
            <Button variant="outline" onClick={() => setFeatureDialogOpen(true)}>
              Feature Spotlight
            </Button>
          </div>
        </div>
        <Dialog open={featureDialogOpen} onOpenChange={setFeatureDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Feature Spotlight</DialogTitle>
              <DialogDescription>
                Explore planned enhancements such as Adaptive Interview Simulator, Market Pulse Radar, Referral Marketplace, and Wellbeing Lens.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setFeatureDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Compass className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">Career Navigator</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setCurrentStep("roadmap")}>
              <Map className="mr-1.5 h-4 w-4" /> View Roadmap
            </Button>
            <Button variant="outline" size="sm" onClick={() => { resetState(); setCurrentStep("landing"); }}>
              <RotateCcw className="mr-1.5 h-4 w-4" /> Start Over
            </Button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome back{state.profile?.name ? `, ${state.profile.name}` : ""}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track your progress toward becoming a {state.dreamRole?.title}
          </p>
        </div>

        {/* Stats Row */}
        <div className="mb-8 grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{completedCount}/{totalDays}</div>
                <div className="text-xs text-muted-foreground">Days Done</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold">{completedHours.toFixed(0)}h</div>
                <div className="text-xs text-muted-foreground">Hours Logged</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{currentStreak}</div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{Math.round(progressPercent)}%</div>
                <div className="text-xs text-muted-foreground">Complete</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <Trophy className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{state.roadmap.milestones.filter((m) => state.completedDays.includes(m.day)).length}</div>
                <div className="text-xs text-muted-foreground">Milestones</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{completedCount} of {totalDays} days</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
            {nextMilestone && (
              <p className="mt-2 text-xs text-muted-foreground">
                Next milestone: <span className="font-medium text-primary">{nextMilestone.title}</span> (Day {nextMilestone.day})
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Day Tracker (main column) */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="checklist">
              <TabsList className="mb-4">
                <TabsTrigger value="checklist">Daily Checklist</TabsTrigger>
                <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              </TabsList>

              <TabsContent value="checklist">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Daily Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="max-h-[600px] overflow-y-auto space-y-2">
                    {state.roadmap.days.map((day) => {
                      const isCompleted = state.completedDays.includes(day.day);
                      return (
                        <div
                          key={day.day}
                          className={`flex items-start gap-3 rounded-lg border p-3 transition-all ${
                            isCompleted
                              ? "border-emerald-200 bg-emerald-50/50"
                              : day.checkpoint
                              ? "border-primary/20 bg-primary/5"
                              : "border-border/50"
                          }`}
                        >
                          <Checkbox
                            checked={isCompleted}
                            onCheckedChange={() => toggleDayComplete(day.day)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                                Day {day.day}: {day.title}
                              </span>
                              {day.checkpoint && (
                                <Badge className="bg-primary/10 text-primary text-[10px] px-1.5">Checkpoint</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground">{day.estimatedHours}h</span>
                              <Badge variant="outline" className="text-[10px]">{day.skillFocus}</Badge>
                            </div>
                          </div>
                          {isCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="calendar">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                      {state.roadmap.durationDays}-Day Calendar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                        <div key={d} className="text-center text-xs font-medium text-muted-foreground pb-2">{d}</div>
                      ))}
                      {state.roadmap.days.map((day) => {
                        const isCompleted = state.completedDays.includes(day.day);
                        return (
                          <button
                            key={day.day}
                            onClick={() => toggleDayComplete(day.day)}
                            className={`aspect-square rounded-lg border text-sm font-medium transition-all hover:scale-105 ${
                              isCompleted
                                ? "border-emerald-300 bg-emerald-500 text-white"
                                : day.checkpoint
                                ? "border-primary/30 bg-primary/10 text-primary"
                                : "border-border/50 bg-card text-foreground hover:border-primary/30"
                            }`}
                          >
                            {day.day}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded bg-emerald-500" /> Completed
                      </span>
                      <span className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded border border-primary/30 bg-primary/10" /> Checkpoint
                      </span>
                      <span className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded border border-border/50 bg-card" /> Pending
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skill Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Skill Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {skillProgress.slice(0, 8).map(({ skill, progress, completed, total, gap }) => (
                  <div key={skill}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{skill}</span>
                      <span className="text-xs text-muted-foreground">{completed}/{total}</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                    {gap && (
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="outline" className={`${getPriorityColor(gap.priority)} text-[10px]`}>
                          {gap.priority}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {getLevelLabel(gap.currentLevel)} → {getLevelLabel(gap.requiredLevel)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Agent Insights */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Agent Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {progressPercent === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Start checking off days to see personalized insights from your career agent.
                  </p>
                )}
                {progressPercent > 0 && progressPercent < 25 && (
                  <div className="space-y-2 text-sm">
                    <p>Great start! You are building momentum.</p>
                    <p className="text-muted-foreground">
                      Focus on the critical gaps first -- they will have the biggest impact on your readiness for the {state.dreamRole?.title} role.
                    </p>
                  </div>
                )}
                {progressPercent >= 25 && progressPercent < 50 && (
                  <div className="space-y-2 text-sm">
                    <p>Solid progress! You are past the first quarter.</p>
                    <p className="text-muted-foreground">
                      Consider starting a portfolio project that combines multiple skills. This will make your profile stand out.
                    </p>
                  </div>
                )}
                {progressPercent >= 50 && progressPercent < 75 && (
                  <div className="space-y-2 text-sm">
                    <p>Halfway there! Your skill profile is strengthening.</p>
                    <p className="text-muted-foreground">
                      Now is a good time to practice explaining your skills in interview-style conversations.
                    </p>
                  </div>
                )}
                {progressPercent >= 75 && progressPercent < 100 && (
                  <div className="space-y-2 text-sm">
                    <p>Almost there! You are in the home stretch.</p>
                    <p className="text-muted-foreground">
                      Polish your portfolio and start applying to {state.dreamRole?.title} positions. Your preparation is strong.
                    </p>
                  </div>
                )}
                {progressPercent >= 100 && (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                      <Trophy className="h-5 w-5" /> Roadmap Complete!
                    </div>
                    <p className="text-muted-foreground">
                      Congratulations! You have completed your learning roadmap. You are ready to confidently pursue {state.dreamRole?.title} roles.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                  onClick={handleDownloadPdf}
                  disabled={!summaryData}
                >
                  <FileText className="mr-2 h-4 w-4" /> Download Summary PDF
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                  onClick={handleDownloadJson}
                  disabled={!summaryData}
                >
                  <FileJson className="mr-2 h-4 w-4" /> Download Summary JSON
                </Button>
                <Button className="w-full justify-start" size="sm" onClick={() => setCurrentStep("landing")}>
                  <Compass className="mr-2 h-4 w-4" /> Launch Career Navigator
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => setFeatureDialogOpen(true)}
                >
                  <Compass className="mr-2 h-4 w-4" /> Feature Spotlight
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => setCurrentStep("roadmap")}>
                  <Map className="mr-2 h-4 w-4" /> View Full Roadmap
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => setCurrentStep("analysis")}>
                  <BarChart3 className="mr-2 h-4 w-4" /> View Gap Analysis
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => setCurrentStep("dream-role")}>
                  <Target className="mr-2 h-4 w-4" /> Change Dream Role
                </Button>
                <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive" size="sm" onClick={() => { resetState(); setCurrentStep("landing"); }}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Start Over
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={featureDialogOpen} onOpenChange={setFeatureDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Feature Spotlight</DialogTitle>
            <DialogDescription>
              Explore upcoming capabilities like the Adaptive Interview Simulator, Market Pulse Radar, Referral Marketplace, and Wellbeing Lens.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p>
              Visit the landing experience to deep dive into each feature card and see priority, benefits, and stakeholder insights.
            </p>
            <Button size="sm" onClick={() => { setFeatureDialogOpen(false); setCurrentStep("landing"); }}>
              Launch Feature Deck
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeatureDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
