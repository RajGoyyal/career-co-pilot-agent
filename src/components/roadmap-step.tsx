"use client";

import { useState } from "react";
import { useCareer } from "@/lib/career-context";
import { getPriorityColor } from "@/lib/career-engine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  BookOpen,
  Compass,
  CheckCircle2,
  Target,
  Flag,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";

export default function RoadmapStep() {
  const { state, setCurrentStep } = useCareer();
  const [selectedWeek, setSelectedWeek] = useState("1");
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const { roadmap } = state;

  if (!roadmap) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>No roadmap generated yet.</p>
        <Button onClick={() => setCurrentStep("analysis")} className="ml-4">Go to Analysis</Button>
      </div>
    );
  }

  // roadmap is already destructured above

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Compass className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">Career Navigator</span>
          </div>
          <Button onClick={() => setCurrentStep("dashboard")} size="sm">
            Go to Dashboard <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <Button variant="ghost" size="sm" className="mb-6" onClick={() => setCurrentStep("analysis")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Analysis
        </Button>

        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            Personalized for {state.profile?.name || "You"} → {state.dreamRole?.title}
          </div>
          <h1 className="text-3xl font-bold">Your 30-Day Vibe-Check Roadmap</h1>
          <p className="mt-2 text-muted-foreground">
            {roadmap.totalHours.toFixed(0)} hours of curated learning across {roadmap.days.length} days
          </p>
        </div>

        {/* Overview Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">30</div>
                <div className="text-xs text-muted-foreground">Days</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <Clock className="h-8 w-8 text-accent" />
              <div>
                <div className="text-2xl font-bold">{roadmap.totalHours.toFixed(0)}</div>
                <div className="text-xs text-muted-foreground">Total Hours</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <Target className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{state.skillGaps.filter((g) => g.gap > 0).length}</div>
                <div className="text-xs text-muted-foreground">Skills to Build</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <Flag className="h-8 w-8 text-accent" />
              <div>
                <div className="text-2xl font-bold">{roadmap.milestones.length}</div>
                <div className="text-xs text-muted-foreground">Milestones</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Milestones */}
        <Card className="mb-8 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flag className="h-5 w-5 text-primary" />
              Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-4 top-0 h-full w-0.5 bg-gradient-to-b from-primary via-accent to-primary/30" />
              <div className="space-y-6">
                {roadmap.milestones.map((milestone) => (
                  <div key={milestone.day} className="relative flex items-start gap-4 pl-10">
                    <div className="absolute left-2 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {milestone.day}
                    </div>
                    <div>
                      <div className="font-semibold">{milestone.title}</div>
                      <div className="text-sm text-muted-foreground">{milestone.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Goals */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {roadmap.weeklyGoals.map((goal, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-border/50 p-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    W{i + 1}
                  </div>
                  <span className="text-sm">{goal}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Day-by-Day Breakdown */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-bold">Day-by-Day Breakdown</h2>
          <Tabs value={selectedWeek} onValueChange={setSelectedWeek}>
            <TabsList className="mb-4">
              <TabsTrigger value="1">Week 1</TabsTrigger>
              <TabsTrigger value="2">Week 2</TabsTrigger>
              <TabsTrigger value="3">Week 3</TabsTrigger>
              <TabsTrigger value="4">Week 4</TabsTrigger>
              <TabsTrigger value="5">Week 5</TabsTrigger>
            </TabsList>

            {["1", "2", "3", "4", "5"].map((week) => (
              <TabsContent key={week} value={week} className="space-y-3">
                {roadmap.days
                  .filter((d) => d.week === parseInt(week))
                  .map((day) => {
                    const isExpanded = expandedDay === day.day;
                    const gap = state.skillGaps.find((g) => g.skill === day.skillFocus);

                    return (
                      <Card
                        key={day.day}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          day.checkpoint ? "border-primary/30 bg-primary/5" : ""
                        }`}
                        onClick={() => setExpandedDay(isExpanded ? null : day.day)}
                      >
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                day.checkpoint
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}>
                                {day.day}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{day.title}</span>
                                  {day.checkpoint && (
                                    <Badge className="bg-primary/10 text-primary text-xs">Checkpoint</Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-0.5">
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> {day.estimatedHours}h
                                  </span>
                                  {gap && (
                                    <Badge variant="outline" className={`${getPriorityColor(gap.priority)} text-xs`}>
                                      {gap.priority}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>

                          {isExpanded && (
                            <div className="mt-4 space-y-4 pl-12 animate-slide-up">
                              <p className="text-sm text-muted-foreground">{day.description}</p>

                              <div>
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                                  <CheckCircle2 className="h-4 w-4 text-primary" /> Tasks
                                </h4>
                                <ul className="space-y-1.5">
                                  {day.tasks.map((task, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm">
                                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/50 shrink-0" />
                                      {task}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {day.resources.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                                    <BookOpen className="h-4 w-4 text-accent" /> Resources
                                  </h4>
                                  <ul className="space-y-1.5">
                                    {day.resources.map((resource, i) => {
                                      const urlMatch = resource.match(/https?:\/\/[^\s)]+/);
                                      return (
                                        <li key={i} className="flex items-start gap-2 text-sm">
                                          <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                          {urlMatch ? (
                                            <a
                                              href={urlMatch[0]}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-primary hover:underline"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              {resource.replace(urlMatch[0], "").replace(/:\s*$/, "").trim()}
                                            </a>
                                          ) : (
                                            resource
                                          )}
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => setCurrentStep("analysis")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Analysis
          </Button>
          <Button size="lg" className="h-12 min-w-[240px] glow-primary" onClick={() => setCurrentStep("dashboard")}>
            Start Tracking Progress
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
