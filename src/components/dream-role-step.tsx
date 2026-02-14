"use client";

import { useCareer } from "@/lib/career-context";
import { ROLE_TEMPLATES } from "@/lib/career-engine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  TrendingUp,
  DollarSign,
  Briefcase,
  Star,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import type { DreamRole } from "@/lib/career-context";

const demandColors = {
  high: "bg-emerald-500/10 text-emerald-700 border-emerald-300",
  medium: "bg-amber-500/10 text-amber-700 border-amber-300",
  low: "bg-red-500/10 text-red-700 border-red-300",
};

export default function DreamRoleStep() {
  const { setCurrentStep, setDreamRole, state } = useCareer();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleContinue = () => {
    if (!selectedRole) return;
    const template = ROLE_TEMPLATES[selectedRole];
    if (!template) return;

    const dreamRole: DreamRole = {
      title: selectedRole,
      company: "Target Company",
      requiredSkills: template.requiredSkills.map((s) => ({
        name: s.name,
        level: s.level,
        category: "technical",
      })),
      description: template.description,
      salaryRange: template.salaryRange,
      demandLevel: template.demandLevel,
    };

    setDreamRole(dreamRole);
    setCurrentStep("analysis");
  };

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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            Profile
            <ArrowRight className="h-4 w-4 mx-1" />
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</div>
            Dream Role
            <ArrowRight className="h-4 w-4 mx-1" />
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold">3</div>
            Analysis
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <Button variant="ghost" size="sm" className="mb-6" onClick={() => setCurrentStep("profile")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Choose Your Dream Role</h1>
          <p className="mt-2 text-muted-foreground">
            {state.profile?.name ? `${state.profile.name}, select` : "Select"} the role you want to grow into. The agent will map your current skills against its requirements.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(ROLE_TEMPLATES).map(([roleName, template]) => {
            const isSelected = selectedRole === roleName;
            return (
              <Card
                key={roleName}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/20 shadow-lg"
                    : "border-border/50 hover:border-primary/30"
                }`}
                onClick={() => setSelectedRole(roleName)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{roleName}</CardTitle>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <Star className="h-3.5 w-3.5 fill-primary-foreground text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">{template.description}</p>

                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={demandColors[template.demandLevel]}>
                      <TrendingUp className="mr-1 h-3 w-3" />
                      {template.demandLevel} demand
                    </Badge>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <DollarSign className="h-3.5 w-3.5" />
                      {template.salaryRange}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {template.requiredSkills.slice(0, 6).map((skill) => (
                      <Badge key={skill.name} variant="secondary" className="text-xs">
                        {skill.name}
                      </Badge>
                    ))}
                    {template.requiredSkills.length > 6 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.requiredSkills.length - 6} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setCurrentStep("profile")}>
            Back
          </Button>
          <Button onClick={handleContinue} disabled={!selectedRole}>
            Analyze Skill Gaps
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
