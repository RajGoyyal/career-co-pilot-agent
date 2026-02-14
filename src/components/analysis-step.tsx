"use client";

import { useEffect, useState, useRef } from "react";
import { useCareer } from "@/lib/career-context";
import { analyzeSkillGaps, generateRoadmap, getLevelLabel, getPriorityColor } from "@/lib/career-engine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Target,
  Map,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Compass,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Sparkles,
} from "lucide-react";
import type { AgentStep } from "@/lib/career-context";

const stepConfigs = [
  {
    id: "analyze-profile",
    type: "analyze" as const,
    title: "Analyzing Your Profile",
    description: "Extracting structured skills from your resume and profile data...",
    icon: Brain,
  },
  {
    id: "map-requirements",
    type: "plan" as const,
    title: "Mapping Role Requirements",
    description: "Understanding the competencies needed for your dream role...",
    icon: Target,
  },
  {
    id: "identify-gaps",
    type: "execute" as const,
    title: "Identifying Skill Gaps",
    description: "Comparing your skills against role requirements to find gaps...",
    icon: BarChart3,
  },
  {
    id: "prioritize",
    type: "evaluate" as const,
    title: "Prioritizing Learning Path",
    description: "Ranking gaps by importance and creating an optimal learning sequence...",
    icon: TrendingUp,
  },
  {
    id: "generate-roadmap",
    type: "adapt" as const,
    title: "Generating 30-Day Roadmap",
    description: "Building your personalized Vibe-Check learning plan with projects and checkpoints...",
    icon: Map,
  },
];

export default function AnalysisStep() {
  const { state, setCurrentStep, setSkillGaps, setRoadmap, addAgentStep, updateAgentStep } = useCareer();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current || !state.profile || !state.dreamRole) return;
    hasStarted.current = true;

    const runAnalysis = async () => {
      for (let i = 0; i < stepConfigs.length; i++) {
        const config = stepConfigs[i];
        const step: AgentStep = {
          id: config.id,
          type: config.type,
          title: config.title,
          description: config.description,
          status: "running",
          timestamp: Date.now(),
        };

        addAgentStep(step);
        setCurrentStepIndex(i);

        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

        // Actually process at the right step
        if (i === 2 && state.profile && state.dreamRole) {
          const gaps = analyzeSkillGaps(state.profile.extractedSkills, state.dreamRole);
          setSkillGaps(gaps);
          updateAgentStep(config.id, {
            status: "completed",
            output: `Found ${gaps.length} skill areas. ${gaps.filter((g) => g.priority === "critical").length} critical gaps identified.`,
          });
        } else if (i === 4 && state.profile && state.dreamRole) {
          const gaps = analyzeSkillGaps(state.profile.extractedSkills, state.dreamRole);
          const roadmap = generateRoadmap(gaps, state.profile, state.dreamRole);
          setRoadmap(roadmap);
          updateAgentStep(config.id, {
            status: "completed",
            output: `Generated ${roadmap.days.length}-day roadmap with ${roadmap.totalHours.toFixed(0)} hours of learning content.`,
          });
        } else {
          updateAgentStep(config.id, { status: "completed", output: "Completed successfully." });
        }
      }

      setIsComplete(true);
    };

    runAnalysis();
  }, [state.profile, state.dreamRole, addAgentStep, updateAgentStep, setSkillGaps, setRoadmap]);

  const progress = ((currentStepIndex + (isComplete ? 1 : 0)) / stepConfigs.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Compass className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">Career Navigator</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Profile
            <ArrowRight className="h-4 w-4 mx-1" />
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Dream Role
            <ArrowRight className="h-4 w-4 mx-1" />
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</div>
            Analysis
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            Agent Reasoning Pipeline
          </div>
          <h1 className="text-3xl font-bold">Analyzing Your Career Path</h1>
          <p className="mt-2 text-muted-foreground">
            The AI agent is processing your profile against {state.dreamRole?.title || "your dream role"} requirements
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Agent Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Agent Steps */}
        <div className="space-y-4 mb-8">
          {stepConfigs.map((config, i) => {
            const isActive = i === currentStepIndex && !isComplete;
            const isDone = i < currentStepIndex || isComplete;
            const agentStep = state.agentSteps.find((s) => s.id === config.id);

            return (
              <Card
                key={config.id}
                className={`transition-all ${
                  isActive
                    ? "border-primary/50 shadow-lg ring-1 ring-primary/20"
                    : isDone
                    ? "border-emerald-200 bg-emerald-50/30"
                    : "border-border/30 opacity-50"
                }`}
              >
                <CardContent className="flex items-start gap-4 py-4">
                  <div
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isDone
                        ? "bg-emerald-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isActive ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : isDone ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <config.icon className="h-5 w-5" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{config.title}</h3>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          isActive
                            ? "border-primary/30 text-primary"
                            : isDone
                            ? "border-emerald-300 text-emerald-700"
                            : ""
                        }`}
                      >
                        {isActive ? "Running" : isDone ? "Complete" : "Pending"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{config.description}</p>
                    {agentStep?.output && isDone && (
                      <p className="mt-2 text-sm font-medium text-emerald-700">{agentStep.output}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Results Preview */}
        {isComplete && state.skillGaps.length > 0 && (
          <div className="animate-slide-up space-y-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Skill Gap Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-3 mb-6">
                  <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-center">
                    <AlertTriangle className="mx-auto h-6 w-6 text-red-500 mb-1" />
                    <div className="text-2xl font-bold text-red-700">
                      {state.skillGaps.filter((g) => g.priority === "critical").length}
                    </div>
                    <div className="text-xs text-red-600">Critical Gaps</div>
                  </div>
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-center">
                    <TrendingUp className="mx-auto h-6 w-6 text-amber-500 mb-1" />
                    <div className="text-2xl font-bold text-amber-700">
                      {state.skillGaps.filter((g) => g.priority === "important").length}
                    </div>
                    <div className="text-xs text-amber-600">Important Gaps</div>
                  </div>
                  <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-center">
                    <CheckCircle2 className="mx-auto h-6 w-6 text-green-500 mb-1" />
                    <div className="text-2xl font-bold text-green-700">
                      {state.skillGaps.filter((g) => g.gap === 0).length}
                    </div>
                    <div className="text-xs text-green-600">Skills Met</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {state.skillGaps.filter((g) => g.gap > 0).slice(0, 8).map((gap) => (
                    <div key={gap.skill} className="flex items-center gap-3">
                      <Badge variant="outline" className={`${getPriorityColor(gap.priority)} min-w-[90px] justify-center text-xs`}>
                        {gap.priority}
                      </Badge>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{gap.skill}</span>
                          <span className="text-xs text-muted-foreground">
                            {getLevelLabel(gap.currentLevel)} → {getLevelLabel(gap.requiredLevel)}
                          </span>
                        </div>
                        <div className="mt-1 h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
                            style={{ width: `${(gap.currentLevel / gap.requiredLevel) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button size="lg" className="h-12 min-w-[260px] text-base glow-primary" onClick={() => setCurrentStep("roadmap")}>
                View Your 30-Day Roadmap
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
