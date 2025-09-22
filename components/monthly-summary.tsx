"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, TrendingDown, Target, ArrowLeft, Home } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { storage, type Transaction, type SavingsGoal } from "@/lib/storage"
import { TransactionList } from "./transaction-list"

interface MonthlyData {
  year: number
  month: number
  transactions: Transaction[]
  spending: {
    needs: number
    wants: number
    notImportant: number
    total: number
  }
  savingsGoals: SavingsGoal[]
}

interface MonthlySummaryProps {
  onNavigateBack?: () => void
}

const COLORS = {
  needs: "hsl(var(--chart-1))",
  wants: "hsl(var(--chart-2))",
  notImportant: "hsl(var(--chart-3))",
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function MonthlySummary({ onNavigateBack }: MonthlySummaryProps) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null)
  const [availableMonths, setAvailableMonths] = useState<Array<{ year: number; month: number; label: string }>>([])

  useEffect(() => {
    loadMonthlyData()
    loadAvailableMonths()
  }, [selectedDate])

  const loadMonthlyData = () => {
    const transactions = storage.getTransactionsByMonth(selectedDate.year, selectedDate.month)
    const spending = storage.getMonthlySpending(selectedDate.year, selectedDate.month)
    const savingsGoals = storage.getSavingsGoals()

    setMonthlyData({
      year: selectedDate.year,
      month: selectedDate.month,
      transactions,
      spending,
      savingsGoals,
    })
  }

  const loadAvailableMonths = () => {
    const allTransactions = storage.getTransactions()
    const monthsSet = new Set<string>()

    allTransactions.forEach((transaction) => {
      const date = new Date(transaction.date)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      monthsSet.add(key)
    })

    const months = Array.from(monthsSet)
      .map((key) => {
        const [year, month] = key.split("-").map(Number)
        return {
          year,
          month,
          label: `${MONTHS[month]} ${year}`,
        }
      })
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        return b.month - a.month
      })

    setAvailableMonths(months)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate.year, selectedDate.month)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }

    setSelectedDate({
      year: newDate.getFullYear(),
      month: newDate.getMonth(),
    })
  }

  const handleMonthSelect = (value: string) => {
    const [year, month] = value.split("-").map(Number)
    setSelectedDate({ year, month })
  }

  if (!monthlyData) {
    return <div>Loading...</div>
  }

  const pieData = [
    { name: "Needs", value: monthlyData.spending.needs, color: COLORS.needs },
    { name: "Wants", value: monthlyData.spending.wants, color: COLORS.wants },
    { name: "Not Important", value: monthlyData.spending.notImportant, color: COLORS.notImportant },
  ].filter((item) => item.value > 0)

  const onboardingData = storage.getOnboardingData()
  const monthlyIncome = onboardingData ? Number.parseFloat(onboardingData.monthlyIncome) : 0
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyData.spending.total) / monthlyIncome) * 100 : 0
  const totalSavingsGoalAmount = monthlyData.savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const totalCurrentSavings = monthlyData.savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onNavigateBack} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Monthly Summary</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Header with Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-balance">Monthly Summary</h1>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Select value={`${selectedDate.year}-${selectedDate.month}`} onValueChange={handleMonthSelect}>
                <SelectTrigger className="w-48">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.map(({ year, month, label }) => (
                    <SelectItem key={`${year}-${month}`} value={`${year}-${month}`}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Current Month Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {MONTHS[selectedDate.month]} {selectedDate.year}
              </CardTitle>
              <CardDescription>{monthlyData.transactions.length} transactions recorded</CardDescription>
            </CardHeader>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Spending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {onboardingData?.currency || "$"}
                  {monthlyData.spending.total.toFixed(2)}
                </div>
                {monthlyIncome > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {((monthlyData.spending.total / monthlyIncome) * 100).toFixed(1)}% of income
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Savings Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  {savingsRate.toFixed(1)}%
                  {savingsRate >= 20 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {onboardingData?.currency || "$"}
                  {(monthlyIncome - monthlyData.spending.total).toFixed(2)} saved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Needs vs Wants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {monthlyData.spending.total > 0
                    ? ((monthlyData.spending.needs / monthlyData.spending.total) * 100).toFixed(0)
                    : 0}
                  % /{" "}
                  {monthlyData.spending.total > 0
                    ? ((monthlyData.spending.wants / monthlyData.spending.total) * 100).toFixed(0)
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground mt-1">Needs vs Wants ratio</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Savings Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  {totalSavingsGoalAmount > 0 ? ((totalCurrentSavings / totalSavingsGoalAmount) * 100).toFixed(0) : 0}%
                  <Target className="h-4 w-4 text-orange-500" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{monthlyData.savingsGoals.length} active goals</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spending Breakdown Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Spending Breakdown</CardTitle>
                <CardDescription>How you spent your money this month</CardDescription>
              </CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
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
                        <Tooltip
                          formatter={(value: number) => [
                            `${onboardingData?.currency || "$"}${value.toFixed(2)}`,
                            "Amount",
                          ]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No spending data for this month
                  </div>
                )}

                {/* Legend */}
                {pieData.length > 0 && (
                  <div className="flex justify-center gap-4 mt-4">
                    {pieData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm text-muted-foreground">
                          {entry.name}: {onboardingData?.currency || "$"}
                          {entry.value.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Breakdown Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Category Comparison</CardTitle>
                <CardDescription>Spending by category type</CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyData.spending.total > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pieData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          formatter={(value: number) => [
                            `${onboardingData?.currency || "$"}${value.toFixed(2)}`,
                            "Amount",
                          ]}
                        />
                        <Bar dataKey="value" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No spending data for this month
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Transactions List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Transactions for {MONTHS[selectedDate.month]} {selectedDate.year}
              </CardTitle>
              <CardDescription>All {monthlyData.transactions.length} transactions for this month</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionList
                transactions={monthlyData.transactions}
                onTransactionUpdate={loadMonthlyData}
                readOnly={false}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
