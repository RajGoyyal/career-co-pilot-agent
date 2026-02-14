"use client";

import { useMemo } from "react";
import { useCareer } from "@/lib/career-context";
import { getLevelLabel, getPriorityColor } from "@/lib/career-engine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";

export default function DashboardStep() {
  const { state, setCurrentStep, toggleDayComplete, resetState } = useCareer();

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

  if (!state.roadmap) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>No data yet.</p>
        <Button onClick={() => setCurrentStep("landing")} className="ml-4">Start Over</Button>
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
                      30-Day Calendar
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
                      Congratulations! You have completed your 30-day learning roadmap. You are ready to confidently pursue {state.dreamRole?.title} roles.
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
    </div>
  );
}
