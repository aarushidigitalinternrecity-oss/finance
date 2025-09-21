"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Brain, Lightbulb, TrendingUp, Target, AlertCircle, Sparkles } from "lucide-react"

interface Transaction {
  id: string
  amount: number
  category: string
  type: "needs" | "wants" | "notImportant"
  description: string
  date: string
  notes?: string
}

interface Recommendation {
  title: string
  description: string
  impact: string
  priority: "high" | "medium" | "low"
}

interface AIInsights {
  overallAssessment: string
  recommendations: Recommendation[]
  spendingPatterns: string[]
  savingsTips: string[]
}

interface AIInsightsProps {
  transactions: Transaction[]
  monthlyIncome: number
  savingsGoal: number
  currency: string
  categories: {
    needs: string[]
    wants: string[]
    notImportant: string[]
  }
}

export function AIInsightsComponent({
  transactions,
  monthlyIncome,
  savingsGoal,
  currency,
  categories,
}: AIInsightsProps) {
  const [insights, setInsights] = useState<AIInsights | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateInsights = async () => {
    if (transactions.length === 0) {
      setError("Add some transactions first to get AI insights")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ai-insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactions,
          monthlyIncome,
          savingsGoal,
          currency,
          categories,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate insights")
      }

      const data = await response.json()
      setInsights(data.insights)
    } catch (err) {
      setError("Failed to generate AI insights. Please try again.")
      console.error("Error generating insights:", err)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="h-4 w-4" />
      case "medium":
        return <TrendingUp className="h-4 w-4" />
      case "low":
        return <Target className="h-4 w-4" />
      default:
        return <Lightbulb className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI-Powered Insights
        </CardTitle>
        <CardDescription>Get personalized financial advice powered by Gemini 2.5 Flash</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!insights && !loading && !error && (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Get AI-powered insights about your spending habits and personalized recommendations
            </p>
            <Button onClick={generateInsights} className="gap-2">
              <Brain className="h-4 w-4" />
              Generate AI Insights
            </Button>
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Brain className="h-5 w-5 animate-pulse" />
              <span className="text-sm font-medium">Analyzing your financial data...</span>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={generateInsights} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {insights && (
          <div className="space-y-6">
            {/* Overall Assessment */}
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Overall Assessment
              </h3>
              <p className="text-sm text-muted-foreground">{insights.overallAssessment}</p>
            </div>

            {/* Recommendations */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                Recommendations
              </h3>
              <div className="grid gap-3">
                {insights.recommendations.map((rec, index) => (
                  <div key={index} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                      <Badge variant="secondary" className={`text-xs ${getPriorityColor(rec.priority)}`}>
                        <span className="flex items-center gap-1">
                          {getPriorityIcon(rec.priority)}
                          {rec.priority}
                        </span>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                    <p className="text-xs text-primary font-medium">{rec.impact}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Spending Patterns & Savings Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  Spending Patterns
                </h3>
                <div className="space-y-2">
                  {insights.spendingPatterns.map((pattern, index) => (
                    <div key={index} className="p-2 bg-blue-50 rounded text-sm text-blue-800">
                      {pattern}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" />
                  Savings Tips
                </h3>
                <div className="space-y-2">
                  {insights.savingsTips.map((tip, index) => (
                    <div key={index} className="p-2 bg-green-50 rounded text-sm text-green-800">
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Refresh Button */}
            <div className="pt-4 border-t">
              <Button onClick={generateInsights} variant="outline" className="w-full gap-2 bg-transparent">
                <Sparkles className="h-4 w-4" />
                Refresh Insights
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
