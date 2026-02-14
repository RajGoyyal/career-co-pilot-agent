"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CareerStep, useCareer } from "@/lib/career-context";
import LandingPage from "@/components/landing-page";
import ProfileStep from "@/components/profile-step";
import DreamRoleStep from "@/components/dream-role-step";
import AnalysisStep from "@/components/analysis-step";
import RoadmapStep from "@/components/roadmap-step";
import DashboardStep from "@/components/dashboard-step";

const STEP_PARAM = "step";
const NAVIGABLE_STEPS: CareerStep[] = [
  "landing",
  "profile",
  "dream-role",
  "analysis",
  "roadmap",
  "dashboard",
];

const isCareerStep = (value: string | null): value is CareerStep =>
  Boolean(value && NAVIGABLE_STEPS.includes(value as CareerStep));

export default function Home() {
  const { state, setCurrentStep } = useCareer();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const previousParamRef = useRef<string | null>(null);

  const stepParam = useMemo(() => params.get(STEP_PARAM), [params]);

  useEffect(() => {
    const hasParamChanged = stepParam !== previousParamRef.current;

    if (hasParamChanged) {
      if (isCareerStep(stepParam) && stepParam !== state.currentStep) {
        setCurrentStep(stepParam, { pushHistory: false, via: "deeplink" });
      }
      previousParamRef.current = stepParam;
    }
  }, [setCurrentStep, state.currentStep, stepParam]);

  useEffect(() => {
    const search = new URLSearchParams(params);
    const currentSerialized = params.toString();
    const shouldDisplayParam = state.currentStep !== "landing";

    if (shouldDisplayParam) {
      if (search.get(STEP_PARAM) !== state.currentStep) {
        search.set(STEP_PARAM, state.currentStep);
      }
    } else {
      if (search.has(STEP_PARAM)) {
        search.delete(STEP_PARAM);
      }
    }

    const targetSerialized = search.toString();
    const target = targetSerialized ? `${pathname}?${targetSerialized}` : pathname;
    const current = currentSerialized ? `${pathname}?${currentSerialized}` : pathname;

    if (target !== current) {
      router.replace(target, { scroll: false });
    }
  }, [params, pathname, router, state.currentStep]);

  switch (state.currentStep) {
    case "landing":
      return <LandingPage />;
    case "profile":
      return <ProfileStep />;
    case "dream-role":
      return <DreamRoleStep />;
    case "analysis":
      return <AnalysisStep />;
    case "roadmap":
      return <RoadmapStep />;
    case "dashboard":
      return <DashboardStep />;
    default:
      return <LandingPage />;
  }
}
