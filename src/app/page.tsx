"use client";

import { useCareer } from "@/lib/career-context";
import LandingPage from "@/components/landing-page";
import ProfileStep from "@/components/profile-step";
import DreamRoleStep from "@/components/dream-role-step";
import AnalysisStep from "@/components/analysis-step";
import RoadmapStep from "@/components/roadmap-step";
import DashboardStep from "@/components/dashboard-step";

export default function Home() {
  const { state } = useCareer();

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
