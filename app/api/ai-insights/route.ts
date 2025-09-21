import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

export const maxDuration = 30

interface Transaction {
  id: string
  amount: number
  category: string
  type: "needs" | "wants" | "notImportant"
  description: string
  date: string
  notes?: string
}

interface InsightRequest {
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

export async function POST(req: NextRequest) {
  try {
    const data: InsightRequest = await req.json()

    const { transactions, monthlyIncome, savingsGoal, currency, categories } = data

    // Calculate spending by category
    const spending = {
      needs: 0,
      wants: 0,
      notImportant: 0,
    }

    transactions.forEach((transaction) => {
      spending[transaction.type] += transaction.amount
    })

    const totalSpent = spending.needs + spending.wants + spending.notImportant
    const actualSavings = monthlyIncome - totalSpent
    const spendingPercentage = (totalSpent / monthlyIncome) * 100

    // Get currency symbol
    const getCurrencySymbol = (currency: string) => {
      const symbols: { [key: string]: string } = {
        USD: "$",
        EUR: "€",
        GBP: "£",
        INR: "₹",
      }
      return symbols[currency] || "$"
    }

    const currencySymbol = getCurrencySymbol(currency)

    // Create context for AI analysis
    const analysisContext = `
    Personal Finance Analysis Context:
    - Monthly Income: ${currencySymbol}${monthlyIncome}
    - Savings Goal: ${currencySymbol}${savingsGoal}
    - Total Spent: ${currencySymbol}${totalSpent} (${spendingPercentage.toFixed(1)}% of income)
    - Actual Savings: ${currencySymbol}${actualSavings}
    
    Spending Breakdown:
    - Needs: ${currencySymbol}${spending.needs} (${((spending.needs / totalSpent) * 100).toFixed(1)}%)
    - Wants: ${currencySymbol}${spending.wants} (${((spending.wants / totalSpent) * 100).toFixed(1)}%)
    - Not Important: ${currencySymbol}${spending.notImportant} (${((spending.notImportant / totalSpent) * 100).toFixed(1)}%)
    
    Recent Transactions (last 10):
    ${transactions
      .slice(0, 10)
      .map((t) => `- ${t.description}: ${currencySymbol}${t.amount} (${t.type} - ${t.category})`)
      .join("\n")}
    
    User Categories:
    - Needs: ${categories.needs.join(", ")}
    - Wants: ${categories.wants.join(", ")}
    - Not Important: ${categories.notImportant.join(", ")}
    `

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `You are a personal finance advisor AI. Analyze the following financial data and provide actionable insights.

${analysisContext}

Please provide:
1. A brief overall assessment (2-3 sentences)
2. 3-4 specific actionable recommendations
3. Spending pattern observations
4. Savings optimization tips

Format your response as JSON with the following structure:
{
  "overallAssessment": "Brief assessment text",
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "Detailed recommendation",
      "impact": "potential savings amount or benefit",
      "priority": "high|medium|low"
    }
  ],
  "spendingPatterns": [
    "Pattern observation 1",
    "Pattern observation 2"
  ],
  "savingsTips": [
    "Savings tip 1",
    "Savings tip 2"
  ]
}

Keep recommendations practical and specific to their spending habits. Use the currency symbol ${currencySymbol} in monetary amounts.`,
      maxOutputTokens: 2000,
      temperature: 0.7,
    })

    // Parse the AI response
    let insights
    try {
      insights = JSON.parse(text)
    } catch (parseError) {
      // Fallback if JSON parsing fails
      insights = {
        overallAssessment: text.substring(0, 200) + "...",
        recommendations: [
          {
            title: "Review Your Spending",
            description: "Analyze your recent transactions to identify areas for improvement.",
            impact: "Potential savings of 10-20%",
            priority: "medium",
          },
        ],
        spendingPatterns: ["Unable to parse detailed patterns"],
        savingsTips: ["Track your expenses regularly", "Set specific savings goals"],
      }
    }

    return NextResponse.json({ insights })
  } catch (error) {
    console.error("AI Insights Error:", error)
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}
