"use client"

import { useState } from "react"
import { OnboardingFlow } from "@/components/onboarding-flow"
import { Dashboard } from "@/components/dashboard"

export default function Home() {
  const [isOnboarded, setIsOnboarded] = useState(false)

  if (!isOnboarded) {
    return <OnboardingFlow onComplete={() => setIsOnboarded(true)} />
  }

  return <Dashboard />
}
