"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { useCareer } from "@/lib/career-context";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Brain,
  Briefcase,
  CheckCircle2,
  Compass,
  FilePenLine,
  GitBranch,
  Globe2,
  Handshake,
  HeartPulse,
  Map,
  Radar,
  Sparkles,
  Target,
  Upload,
  UsersRound,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { analyzeResumeFile } from "@/lib/resume-parser";

type FeatureCard = {
  icon: LucideIcon;
  title: string;
  description: string;
  priority?: "Low" | "Medium" | "High";
  benefit?: string;
  effort?: "Low" | "Medium" | "High";
  featureType?: "User-facing" | "Infrastructure";
  stakeholders?: string;
};

const features: FeatureCard[] = [
  {
    icon: Brain,
    title: "Skill Extraction",
    description: "Analyzes your resume, GitHub, and LinkedIn to extract structured skills from unstructured profiles.",
  },
  {
    icon: Target,
    title: "Market Alignment",
    description: "Maps real-world job requirements to identify missing competencies for your dream role.",
  },
  {
    icon: GitBranch,
    title: "Gap Analysis",
    description: "Identifies concrete skill gaps -- both technical and non-technical -- with priority rankings.",
  },
  {
    icon: Map,
    title: "30-Day Roadmap",
    description: "Generates a personalized Vibe-Check learning plan with projects, resources, and checkpoints.",
  },
  {
    icon: Zap,
    title: "Agentic Planning",
    description: "Multi-step reasoning agent that plans, evaluates progress, and adapts recommendations.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Track your journey with interactive dashboards, milestones, and weekly goal reviews.",
  },
  {
    icon: Bot,
    title: "Adaptive Interview Simulator",
    description: "Run AI-driven mock interviews tuned to your roadmap progress and receive actionable feedback loops.",
  },
  {
    icon: FilePenLine,
    title: "Role-Based Templates",
    description: "Generate resumes, cover letters, and outreach emails auto-filled from your evolving skill graph.",
  },
  {
    icon: Radar,
    title: "Market Pulse",
    description: "Monitor live labour market signals with demand indicators and salary bands for your target roles.",
  },
  {
    icon: Handshake,
    title: "Referral Marketplace",
    description: "Connect with hiring partners via curated referrals once you complete key roadmap milestones.",
  },
  {
    icon: HeartPulse,
    title: "Wellbeing Lens",
    description: "Balance workload with wellbeing insights that recommend breaks, pacing, and recovery nudges.",
    priority: "Low",
    benefit: "Improves satisfaction and reduces burnout risk for sustained engagement.",
    effort: "Low",
    featureType: "User-facing",
    stakeholders: "UX Research, Wellbeing Advisor, Frontend Engineer",
  },
  {
    icon: Briefcase,
    title: "Case Interview Coach",
    description: "Simulate management consulting and strategy case interviews with structured scoring rubrics.",
    priority: "High",
    benefit: "Prepares non-technical talent for consulting assessments with instant feedback loops.",
    effort: "Medium",
    featureType: "User-facing",
    stakeholders: "Consulting Advisor, AI Research, Content Strategist",
  },
  {
    icon: Globe2,
    title: "Opportunity Radar",
    description: "Aggregates cross-industry openings and highlights best-fit IT and non-IT roles in real time.",
    priority: "Medium",
    benefit: "Expands visibility into hybrid career paths with personalized fit scores.",
    effort: "Medium",
    featureType: "Infrastructure",
    stakeholders: "Data Platform, Career Coach, Partnerships",
  },
  {
    icon: UsersRound,
    title: "Mentor Graph",
    description: "Matches you with practitioners for targeted skill deep-dives using a reputation-weighted graph.",
    priority: "Medium",
    benefit: "Connects learners to curated mentors for IT, consulting, and operations pathways.",
    effort: "High",
    featureType: "User-facing",
    stakeholders: "Community Ops, Backend Engineer, Trust & Safety",
  },
];

const steps = [
  { number: "01", title: "Upload Your Profile", description: "Paste your resume, share GitHub/LinkedIn links" },
  { number: "02", title: "Choose Dream Role", description: "Select your target role from market data" },
  { number: "03", title: "AI Analysis", description: "Agent extracts skills, maps gaps, reasons through plan" },
  { number: "04", title: "Get Your Roadmap", description: "Receive a personalized 30-day learning path" },
];

export default function LandingPage() {
  const { setCurrentStep, setProfile } = useCareer();
  const [selectedFeature, setSelectedFeature] = useState<FeatureCard | null>(null);
  const [featureDialogOpen, setFeatureDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [lastUploadedFile, setLastUploadedFile] = useState<string | null>(null);
  const marketPulseFeature = useMemo(() => features.find((f) => f.title === "Market Pulse") ?? null, []);
  const roleTemplatesFeature = useMemo(() => features.find((f) => f.title === "Role-Based Templates") ?? null, []);

  const handleFeatureOpen = (feature: FeatureCard) => {
    if (!feature.priority) return;
    setSelectedFeature(feature);
    setFeatureDialogOpen(true);
  };

  const handleResumeUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleResumeFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setResumeError(null);
    setLastUploadedFile(file.name);
    setIsAnalyzingResume(true);

    try {
      const { derived, text, skills } = await analyzeResumeFile(file);

      setProfile({
        name: derived.name ?? "Student",
        email: derived.email ?? "",
        resumeText: text,
        githubUrl: derived.github ?? "",
        linkedinUrl: derived.linkedin ?? "",
        extractedSkills: skills,
        experience: derived.experienceSummary ?? "",
        education: derived.educationSummary ?? "",
      });

      setCurrentStep("dream-role");
    } catch (error) {
      const message = error instanceof Error ? error.message : "We couldn't analyze that file. Please try another format.";
      setResumeError(message);
      setLastUploadedFile(null);
    } finally {
      setIsAnalyzingResume(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Compass className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">Career Navigator</span>
          </div>
          <Button onClick={() => setCurrentStep("profile")} size="sm">
            Get Started <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-24 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            AI-Powered Career Intelligence
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
            Your Personal{" "}
            <span className="gradient-text">Career Co-Pilot</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            An agentic AI system that actively manages your professional growth.
            It reasons, plans, and outputs actions -- not static advice.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="h-12 min-w-[200px] text-base glow-primary"
              onClick={() => setCurrentStep("profile")}
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 min-w-[200px] text-base"
              onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Learn More
            </Button>
          </div>

          <div className="mx-auto mt-12 w-full max-w-3xl">
            <div className="rounded-2xl border border-dashed border-primary/30 bg-background/80 p-6 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="text-left">
                  <h2 className="text-xl font-semibold">Upload your resume to auto-analyze</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Drop a PDF, Word, or JSON resume and we will instantly extract your skills and jump to the dream role planner.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">PDF</Badge>
                    <Badge variant="outline">DOCX</Badge>
                    <Badge variant="outline">JSON</Badge>
                  </div>
                </div>
                <div className="flex w-full flex-col items-stretch gap-2 lg:w-56">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.json,application/pdf,application/json,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleResumeFileChange}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={handleResumeUploadClick}
                    disabled={isAnalyzingResume}
                    className="border-primary/50"
                  >
                    {isAnalyzingResume ? (
                      <>
                        <span className="mr-2 inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Resume
                      </>
                    )}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Redirects automatically after analysis
                  </p>
                </div>
              </div>
              {lastUploadedFile && !resumeError && (
                <div className="mt-3 text-xs text-muted-foreground">
                  Processing {lastUploadedFile}...
                </div>
              )}
              {resumeError && (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                  {resumeError}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-8">
            {[
              { value: "40+", label: "Skills Tracked" },
              { value: "10+", label: "Dream Roles" },
              { value: "30", label: "Day Roadmap" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-border/50 bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">How It Works</h2>
            <p className="mt-3 text-muted-foreground">Four steps to your personalized career roadmap</p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.number} className="relative">
                {i < steps.length - 1 && (
                  <div className="absolute right-0 top-8 hidden h-0.5 w-full translate-x-1/2 bg-gradient-to-r from-primary/30 to-transparent md:block" />
                )}
                <div className="relative rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg">
                  <div className="mb-4 text-4xl font-bold text-primary/20">{step.number}</div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Agentic Career Intelligence</h2>
            <p className="mt-3 text-muted-foreground">
              Not a chatbot. A reasoning engine that adapts to your growth.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const isInteractive = Boolean(feature.priority);

              if (!isInteractive) {
                return (
                  <div
                    key={feature.title}
                    className="group rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                      <feature.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                  </div>
                );
              }

              return (
                <button
                  key={feature.title}
                  type="button"
                  onClick={() => handleFeatureOpen(feature)}
                  className="group rounded-xl border border-border/50 bg-card p-6 text-left transition-all hover:border-primary/30 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-haspopup="dialog"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <feature.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <Badge variant="outline" className="uppercase">
                      {feature.featureType}
                    </Badge>
                    <span className="text-muted-foreground">Tap to explore</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Agent Reasoning */}
      <section className="border-t border-border/50 bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold md:text-4xl">Multi-Step Agent Reasoning</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Unlike static career tools, our AI agent follows a structured reasoning pipeline.
                It analyzes, plans, executes, evaluates, and adapts -- continuously improving your roadmap
                based on your progress and changing market demands.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  "Extracts structured skills from unstructured data",
                  "Maps gaps against real job market requirements",
                  "Generates adaptive learning paths with checkpoints",
                  "Evaluates progress and adjusts recommendations",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-card p-6">
              <div className="space-y-3">
                {[
                  { step: "Analyze", desc: "Parse profile data & extract skills", color: "bg-blue-500" },
                  { step: "Plan", desc: "Map gaps & prioritize learning paths", color: "bg-purple-500" },
                  { step: "Execute", desc: "Generate roadmap with resources", color: "bg-emerald-500" },
                  { step: "Evaluate", desc: "Track progress against milestones", color: "bg-amber-500" },
                  { step: "Adapt", desc: "Adjust plan based on performance", color: "bg-rose-500" },
                ].map((item, i) => (
                  <div key={item.step} className="flex items-center gap-4 rounded-lg border border-border/50 bg-background p-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${item.color} text-white text-sm font-bold`}>
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{item.step}</div>
                      <div className="text-sm text-muted-foreground">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {marketPulseFeature && (
        <section className="border-t border-border/50 bg-muted/40 py-20">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:flex-row">
            <div className="lg:w-5/12">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                <Radar className="h-4 w-4" aria-hidden="true" /> Market Pulse Radar
              </div>
              <h2 className="mt-4 text-3xl font-bold md:text-4xl">Stay Ahead With Live Hiring Signals</h2>
              <p className="mt-3 text-muted-foreground">
                The Market Pulse Radar continuously scans job feeds, salary datasets, and industry chatter to keep your roadmap aligned with demand.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {["Demand Indicators", "Compensation Bands", "Skill Trend Alerts", "Regional Heatmaps"].map((item) => (
                  <div key={item} className="rounded-lg border border-border/60 bg-card p-4">
                    <h3 className="text-sm font-semibold">{item}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Refreshed twice daily with anomaly detection by the reasoning agent.
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-7/12">
              <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Top Emerging Roles</span>
                    <h3 className="mt-1 text-lg font-semibold">AI Product Manager</h3>
                  </div>
                  <Badge variant="outline" className="uppercase">High Demand</Badge>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {["LLM Ops", "Responsible AI", "Pricing Strategy"].map((skill) => (
                    <div key={skill} className="rounded-lg border border-border/50 bg-muted/30 p-3 text-sm">
                      {skill}
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-lg border border-border/50 bg-muted/20 p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Salary Range</span>
                    <span className="text-muted-foreground">USD 170k – 210k</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Based on a blended sample of venture-backed and enterprise postings across major hubs.
                  </p>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant="outline">Beta</Badge>
                  <span className="text-muted-foreground">Agent-powered insights syncing to your dashboard weekly goals.</span>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button size="sm" onClick={() => handleFeatureOpen(marketPulseFeature)}>
                    View Feature Roadmap
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setCurrentStep("dashboard")}>
                    Sync to Dashboard
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {roleTemplatesFeature && (
        <section className="border-t border-border/50 bg-card py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                <FilePenLine className="h-4 w-4" aria-hidden="true" /> Role-Based Templates
              </div>
              <Badge variant="outline" className="uppercase">Coming soon</Badge>
            </div>
            <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <h2 className="text-3xl font-bold md:text-4xl">Apply Faster With Smart Document Kits</h2>
                <p className="mt-4 text-muted-foreground">
                  Generate resumes, outreach emails, and follow-up notes that automatically reference your roadmap milestones, quantified achievements, and verified skills.
                </p>
                <div className="mt-6 space-y-4 text-sm">
                  {[
                    "ATS-friendly resume exports mapped to target role keywords",
                    "Personalized outreach email drafts grounded in your latest progress",
                    "Auto-inserted portfolio links and skill badges based on completion streaks",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button onClick={() => handleFeatureOpen(roleTemplatesFeature)}>
                    View Feature Roadmap
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentStep("profile")}>
                    Update Profile Inputs
                  </Button>
                </div>
              </div>
              <div className="rounded-2xl border border-border/50 bg-muted/30 p-6 shadow-lg">
                <div className="space-y-3 text-sm">
                  <div className="rounded-lg border border-border/60 bg-background p-4">
                    <div className="flex items-center justify-between text-xs uppercase text-muted-foreground">
                      <span>Template Preview</span>
                      <span>Product Manager Role</span>
                    </div>
                    <p className="mt-3 font-semibold">Summary Snippet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Leading cross-functional delivery of AI features with measurable impact; recently shipped the Market Pulse Radar beta and elevated adoption by 32% within 14 days.
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-background p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Skills & Proof Points</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {["LLM Strategy", "Stakeholder Ops", "Experimentation", "Resume Optimization"].map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-background p-4 text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground">Auto-tailored Email Draft</p>
                    <p className="mt-2">
                      Hi Hiring Team — I recently completed the Adaptive Interview Simulator sprints and launched the Market Pulse Radar beta. Attaching my tailored resume with quantified impacts aligned to your AI product roadmap.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Ready to Navigate Your Career?</h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Start with your profile and let the AI agent chart your personalized path to your dream role.
          </p>
          <Button
            size="lg"
            className="mt-8 h-12 min-w-[240px] text-base glow-primary"
            onClick={() => setCurrentStep("profile")}
          >
            Launch Career Navigator
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-muted-foreground">
          Career Navigator -- AI-Powered Career Co-Pilot
        </div>
      </footer>

      <Dialog
        open={featureDialogOpen}
        onOpenChange={(open) => {
          setFeatureDialogOpen(open);
          if (!open) setSelectedFeature(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedFeature?.title ?? "Feature"}</DialogTitle>
            <DialogDescription>
              {selectedFeature?.description ?? "Upcoming capability to level-up your career experience."}
            </DialogDescription>
          </DialogHeader>
          {selectedFeature && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="uppercase">
                  {selectedFeature.featureType}
                </Badge>
                <Badge variant="outline">Priority: {selectedFeature.priority}</Badge>
                <Badge variant="outline">Effort: {selectedFeature.effort}</Badge>
              </div>
              <div>
                <span className="font-semibold">Benefit:</span> {selectedFeature.benefit}
              </div>
              {selectedFeature.stakeholders && (
                <div>
                  <span className="font-semibold">Stakeholders:</span> {selectedFeature.stakeholders}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeatureDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
