"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Wallet, TrendingUp, Target, Brain, DollarSign, PieChartIcon } from "lucide-react"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionList } from "@/components/transaction-list"
import { AIInsightsComponent } from "@/components/ai-insights"
import { SavingsGoals } from "@/components/savings-goals"
import { ReportsExport } from "@/components/reports-export"

interface OnboardingData {
  monthlyIncome: string
  savingsGoal: string
  currency: string
  categories: {
    needs: string[]
    wants: string[]
    notImportant: string[]
  }
}

interface Transaction {
  id: string
  amount: number
  category: string
  type: "needs" | "wants" | "notImportant"
  description: string
  date: string
  notes?: string
}

export function Dashboard() {
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [currentSpending, setCurrentSpending] = useState({
    needs: 0,
    wants: 0,
    notImportant: 0,
  })

  useEffect(() => {
    const saved = localStorage.getItem("financeAI_onboarding")
    if (saved) {
      setOnboardingData(JSON.parse(saved))
    }

    // Load transactions from localStorage
    const savedTransactions = localStorage.getItem("financeAI_transactions")
    if (savedTransactions) {
      const parsedTransactions = JSON.parse(savedTransactions)
      setTransactions(parsedTransactions)
      calculateSpending(parsedTransactions)
    }
  }, [])

  const calculateSpending = (transactionList: Transaction[]) => {
    const spending = {
      needs: 0,
      wants: 0,
      notImportant: 0,
    }

    transactionList.forEach((transaction) => {
      spending[transaction.type] += transaction.amount
    })

    setCurrentSpending(spending)
  }

  const handleAddTransaction = (transactionData: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(),
    }

    const updatedTransactions = [newTransaction, ...transactions]
    setTransactions(updatedTransactions)
    calculateSpending(updatedTransactions)

    // Save to localStorage
    localStorage.setItem("financeAI_transactions", JSON.stringify(updatedTransactions))
  }

  const handleDeleteTransaction = (id: string) => {
    const updatedTransactions = transactions.filter((t) => t.id !== id)
    setTransactions(updatedTransactions)
    calculateSpending(updatedTransactions)

    // Save to localStorage
    localStorage.setItem("financeAI_transactions", JSON.stringify(updatedTransactions))
  }

  if (!onboardingData) {
    return <div>Loading...</div>
  }

  const totalSpent = currentSpending.needs + currentSpending.wants + currentSpending.notImportant
  const income = Number.parseFloat(onboardingData.monthlyIncome)
  const savingsGoal = Number.parseFloat(onboardingData.savingsGoal || "0")
  const actualSavings = income - totalSpent
  const spendingPercentage = (totalSpent / income) * 100

  const pieData = [
    { name: "Needs", value: currentSpending.needs, color: "#10b981" },
    { name: "Wants", value: currentSpending.wants, color: "#f59e0b" },
    { name: "Not Important", value: currentSpending.notImportant, color: "#ef4444" },
  ].filter((item) => item.value > 0)

  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      INR: "₹",
    }
    return symbols[currency] || "$"
  }

  const currencySymbol = getCurrencySymbol(onboardingData.currency)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <Wallet className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">FinanceAI</h1>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  Overview
                </p>
              </div>
            </div>
            <TransactionForm
              onAddTransaction={handleAddTransaction}
              categories={onboardingData.categories}
              currency={onboardingData.currency}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currencySymbol}
                {income.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currencySymbol}
                {totalSpent.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">{spendingPercentage.toFixed(1)}% of income</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actual Savings</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currencySymbol}
                {actualSavings.toLocaleString()}
              </div>
              {savingsGoal > 0 && (
                <p className="text-xs text-muted-foreground">
                  Goal: {currencySymbol}
                  {savingsGoal.toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Good Progress
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Click for detailed insights</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Spending Breakdown
              </CardTitle>
              <CardDescription>Current month's expense distribution</CardDescription>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [`${currencySymbol}${value}`, "Amount"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4 mt-4">
                    {pieData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <PieChartIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No spending data yet</p>
                    <p className="text-sm text-muted-foreground">Add transactions to see your breakdown</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Savings Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Savings Progress
              </CardTitle>
              <CardDescription>Track your monthly savings goal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {savingsGoal > 0 ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {currencySymbol}
                        {actualSavings} / {currencySymbol}
                        {savingsGoal}
                      </span>
                    </div>
                    <Progress value={(actualSavings / savingsGoal) * 100} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-lg font-semibold">{((actualSavings / savingsGoal) * 100).toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">Complete</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-lg font-semibold">
                        {currencySymbol}
                        {Math.max(0, savingsGoal - actualSavings)}
                      </div>
                      <div className="text-xs text-muted-foreground">Remaining</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No savings goal set</p>
                  <Button variant="outline" className="mt-2 bg-transparent">
                    Set Savings Goal
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <SavingsGoals currency={onboardingData.currency} monthlyIncome={income} totalSpent={totalSpent} />

        {/* AI Insights Component */}
        <AIInsightsComponent
          transactions={transactions}
          monthlyIncome={income}
          savingsGoal={savingsGoal}
          currency={onboardingData.currency}
          categories={onboardingData.categories}
        />

        <ReportsExport
          transactions={transactions}
          currency={onboardingData.currency}
          monthlyIncome={income}
          categories={onboardingData.categories}
        />

        {/* Quick Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Summary</CardTitle>
            <CardDescription>Basic insights about your spending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Brain className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Spending Analysis</p>
                  <p className="text-sm text-muted-foreground">
                    {totalSpent > 0 ? (
                      <>
                        You spent {((currentSpending.wants / totalSpent) * 100).toFixed(1)}% on Wants and{" "}
                        {((currentSpending.notImportant / totalSpent) * 100).toFixed(1)}% on Not Important items.
                        {currentSpending.notImportant > 0 && (
                          <span className="text-primary">
                            {" "}
                            You could save {currencySymbol}
                            {currentSpending.notImportant} by reducing unnecessary purchases.
                          </span>
                        )}
                      </>
                    ) : (
                      "Start adding transactions to see your spending analysis."
                    )}
                  </p>
                </div>
              </div>

              {actualSavings < savingsGoal && savingsGoal > 0 && totalSpent > 0 && (
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  <Target className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Savings Tip</p>
                    <p className="text-sm text-yellow-700">
                      To reach your savings goal, try reducing Wants by {currencySymbol}
                      {Math.max(0, savingsGoal - actualSavings)} this month.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <TransactionList
          transactions={transactions}
          onDeleteTransaction={handleDeleteTransaction}
          currency={onboardingData.currency}
        />
      </main>
    </div>
  )
}
