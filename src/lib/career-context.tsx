"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export interface Skill {
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  category: "technical" | "soft" | "domain";
}

export interface ProfileData {
  name: string;
  email: string;
  resumeText: string;
  githubUrl: string;
  linkedinUrl: string;
  extractedSkills: Skill[];
  experience: string;
  education: string;
}

export interface DreamRole {
  title: string;
  company: string;
  requiredSkills: Skill[];
  description: string;
  salaryRange: string;
  demandLevel: "high" | "medium" | "low";
}

export interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  category: "technical" | "soft" | "domain";
  priority: "critical" | "important" | "nice-to-have";
}

export interface RoadmapDay {
  day: number;
  week: number;
  title: string;
  description: string;
  tasks: string[];
  resources: string[];
  skillFocus: string;
  estimatedHours: number;
  completed: boolean;
  checkpoint: boolean;
}

export interface Roadmap {
  days: RoadmapDay[];
  totalHours: number;
  weeklyGoals: string[];
  milestones: { day: number; title: string; description: string }[];
}

export interface AgentStep {
  id: string;
  type: "analyze" | "plan" | "execute" | "evaluate" | "adapt";
  title: string;
  description: string;
  status: "pending" | "running" | "completed" | "failed";
  output?: string;
  timestamp: number;
}

export interface CareerState {
  currentStep: "landing" | "profile" | "dream-role" | "analysis" | "roadmap" | "dashboard";
  profile: ProfileData | null;
  dreamRole: DreamRole | null;
  skillGaps: SkillGap[];
  roadmap: Roadmap | null;
  agentSteps: AgentStep[];
  completedDays: number[];
  isProcessing: boolean;
}

const initialState: CareerState = {
  currentStep: "landing",
  profile: null,
  dreamRole: null,
  skillGaps: [],
  roadmap: null,
  agentSteps: [],
  completedDays: [],
  isProcessing: false,
};

interface CareerContextType {
  state: CareerState;
  setCurrentStep: (step: CareerState["currentStep"]) => void;
  setProfile: (profile: ProfileData) => void;
  setDreamRole: (role: DreamRole) => void;
  setSkillGaps: (gaps: SkillGap[]) => void;
  setRoadmap: (roadmap: Roadmap) => void;
  addAgentStep: (step: AgentStep) => void;
  updateAgentStep: (id: string, updates: Partial<AgentStep>) => void;
  toggleDayComplete: (day: number) => void;
  setIsProcessing: (val: boolean) => void;
  resetState: () => void;
}

const CareerContext = createContext<CareerContextType | null>(null);

export function CareerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CareerState>(initialState);

  const setCurrentStep = useCallback((step: CareerState["currentStep"]) => {
    setState((s) => ({ ...s, currentStep: step }));
  }, []);

  const setProfile = useCallback((profile: ProfileData) => {
    setState((s) => ({ ...s, profile }));
  }, []);

  const setDreamRole = useCallback((dreamRole: DreamRole) => {
    setState((s) => ({ ...s, dreamRole }));
  }, []);

  const setSkillGaps = useCallback((skillGaps: SkillGap[]) => {
    setState((s) => ({ ...s, skillGaps }));
  }, []);

  const setRoadmap = useCallback((roadmap: Roadmap) => {
    setState((s) => ({ ...s, roadmap }));
  }, []);

  const addAgentStep = useCallback((step: AgentStep) => {
    setState((s) => ({ ...s, agentSteps: [...s.agentSteps, step] }));
  }, []);

  const updateAgentStep = useCallback((id: string, updates: Partial<AgentStep>) => {
    setState((s) => ({
      ...s,
      agentSteps: s.agentSteps.map((step) =>
        step.id === id ? { ...step, ...updates } : step
      ),
    }));
  }, []);

  const toggleDayComplete = useCallback((day: number) => {
    setState((s) => ({
      ...s,
      completedDays: s.completedDays.includes(day)
        ? s.completedDays.filter((d) => d !== day)
        : [...s.completedDays, day],
    }));
  }, []);

  const setIsProcessing = useCallback((isProcessing: boolean) => {
    setState((s) => ({ ...s, isProcessing }));
  }, []);

  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <CareerContext.Provider
      value={{
        state,
        setCurrentStep,
        setProfile,
        setDreamRole,
        setSkillGaps,
        setRoadmap,
        addAgentStep,
        updateAgentStep,
        toggleDayComplete,
        setIsProcessing,
        resetState,
      }}
    >
      {children}
    </CareerContext.Provider>
  );
}

export function useCareer() {
  const ctx = useContext(CareerContext);
  if (!ctx) throw new Error("useCareer must be used within CareerProvider");
  return ctx;
}
