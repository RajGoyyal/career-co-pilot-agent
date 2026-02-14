"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type CareerStep =
  | "landing"
  | "profile"
  | "dream-role"
  | "analysis"
  | "roadmap"
  | "dashboard";

export interface NavigationEntry {
  step: CareerStep;
  timestamp: number;
  via: "user" | "history" | "deeplink";
}

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
  currentStep: CareerStep;
  profile: ProfileData | null;
  dreamRole: DreamRole | null;
  skillGaps: SkillGap[];
  roadmap: Roadmap | null;
  agentSteps: AgentStep[];
  completedDays: number[];
  isProcessing: boolean;
  history: NavigationEntry[];
  future: NavigationEntry[];
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
  history: [],
  future: [],
};

interface CareerContextType {
  state: CareerState;
  setCurrentStep: (step: CareerStep, options?: NavigationOptions) => void;
  setProfile: (profile: ProfileData) => void;
  setDreamRole: (role: DreamRole) => void;
  setSkillGaps: (gaps: SkillGap[]) => void;
  setRoadmap: (roadmap: Roadmap) => void;
  addAgentStep: (step: AgentStep) => void;
  updateAgentStep: (id: string, updates: Partial<AgentStep>) => void;
  toggleDayComplete: (day: number) => void;
  setIsProcessing: (val: boolean) => void;
  resetState: () => void;
  goBack: () => void;
  goForward: () => void;
  jumpToHistory: (index: number) => void;
}

interface NavigationOptions {
  pushHistory?: boolean;
  resetHistory?: boolean;
  via?: NavigationEntry["via"];
}

const MAX_HISTORY_ENTRIES = 50;

const trimHistory = (entries: NavigationEntry[]) =>
  entries.length > MAX_HISTORY_ENTRIES
    ? entries.slice(entries.length - MAX_HISTORY_ENTRIES)
    : entries;

const trimFuture = (entries: NavigationEntry[]) =>
  entries.length > MAX_HISTORY_ENTRIES
    ? entries.slice(0, MAX_HISTORY_ENTRIES)
    : entries;

const CareerContext = createContext<CareerContextType | null>(null);

export function CareerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CareerState>(initialState);

  const setCurrentStep = useCallback(
    (step: CareerStep, options: NavigationOptions = {}) => {
      setState((s) => {
        const { pushHistory = true, resetHistory = false, via = "user" } = options;

        if (s.currentStep === step && !resetHistory) {
          return s;
        }

        let history = resetHistory ? [] : [...s.history];
        let future = resetHistory ? [] : [...s.future];

        if (pushHistory && s.currentStep !== step) {
          history = trimHistory([
            ...history,
            {
              step: s.currentStep,
              timestamp: Date.now(),
              via,
            },
          ]);
          future = [];
        }

        return {
          ...s,
          currentStep: step,
          history,
          future,
        };
      });
    },
    []
  );

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

  const goBack = useCallback(() => {
    setState((s) => {
      if (s.history.length === 0) return s;

      const newHistory = s.history.slice(0, -1);
      const target = s.history[s.history.length - 1];
      const futureEntry: NavigationEntry = {
        step: s.currentStep,
        timestamp: Date.now(),
        via: "history",
      };

      return {
        ...s,
        currentStep: target.step,
        history: newHistory,
        future: trimFuture([futureEntry, ...s.future]),
      };
    });
  }, []);

  const goForward = useCallback(() => {
    setState((s) => {
      if (s.future.length === 0) return s;

      const [next, ...rest] = s.future;
      const historyEntry: NavigationEntry = {
        step: s.currentStep,
        timestamp: Date.now(),
        via: "history",
      };

      return {
        ...s,
        currentStep: next.step,
        history: trimHistory([...s.history, historyEntry]),
        future: rest,
      };
    });
  }, []);

  const jumpToHistory = useCallback((index: number) => {
    setState((s) => {
      if (index < 0 || index >= s.history.length) return s;

      const target = s.history[index];
      const preservedHistory = s.history.slice(0, index);
      const tail = s.history.slice(index + 1);
      const futureEntries = trimFuture([
        ...tail,
        {
          step: s.currentStep,
          timestamp: Date.now(),
          via: "history",
        },
      ]);

      return {
        ...s,
        currentStep: target.step,
        history: preservedHistory,
        future: futureEntries,
      };
    });
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
        goBack,
        goForward,
        jumpToHistory,
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
