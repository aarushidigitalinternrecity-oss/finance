"use client"

import { useState, useEffect } from "react"
import { OnboardingFlow } from "@/components/onboarding-flow"
import { Dashboard } from "@/components/dashboard"
import { MonthlySummary } from "@/components/monthly-summary"
import { storage } from "@/lib/storage"

type ViewType = "dashboard" | "monthly-summary"

export default function Home() {
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null)
  const [currentView, setCurrentView] = useState<ViewType>("dashboard")

  useEffect(() => {
    const onboardingData = storage.getOnboardingData()
    setIsOnboarded(!!onboardingData)
  }, [])

  if (isOnboarded === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading FinanceAI...</p>
        </div>
      </div>
    )
  }

  if (!isOnboarded) {
    return <OnboardingFlow onComplete={() => setIsOnboarded(true)} />
  }

  if (currentView === "monthly-summary") {
    return <MonthlySummary onNavigateBack={() => setCurrentView("dashboard")} />
  }

  return <Dashboard onNavigateToMonthlySummary={() => setCurrentView("monthly-summary")} />
}
