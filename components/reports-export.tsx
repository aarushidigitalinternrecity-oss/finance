"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { FileText, Download, Calendar, TrendingUp, PieChartIcon, BarChart3 } from "lucide-react"

interface Transaction {
  id: string
  amount: number
  category: string
  type: "needs" | "wants" | "notImportant"
  description: string
  date: string
  notes?: string
}

interface SavingsGoal {
  id: string
  title: string
  description?: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  category: "emergency" | "vacation" | "purchase" | "investment" | "other"
  priority: "high" | "medium" | "low"
  createdAt: string
}

interface ReportsExportProps {
  transactions: Transaction[]
  currency: string
  monthlyIncome: number
  categories: {
    needs: string[]
    wants: string[]
    notImportant: string[]
  }
}

export function ReportsExport({ transactions, currency, monthlyIncome, categories }: ReportsExportProps) {
  const [reportPeriod, setReportPeriod] = useState<"week" | "month" | "quarter" | "year">("month")
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])

  useEffect(() => {
    const savedGoals = localStorage.getItem("financeAI_savingsGoals")
    if (savedGoals) {
      setSavingsGoals(JSON.parse(savedGoals))
    }
  }, [])

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

  // Filter transactions based on selected period
  const getFilteredTransactions = () => {
    const now = new Date()
    const startDate = new Date()

    switch (reportPeriod) {
      case "week":
        startDate.setDate(now.getDate() - 7)
        break
      case "month":
        startDate.setMonth(now.getMonth() - 1)
        break
      case "quarter":
        startDate.setMonth(now.getMonth() - 3)
        break
      case "year":
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    return transactions.filter((transaction) => new Date(transaction.date) >= startDate)
  }

  const filteredTransactions = getFilteredTransactions()

  // Calculate spending by category
  const getSpendingByCategory = () => {
    const spending = {
      needs: 0,
      wants: 0,
      notImportant: 0,
    }

    filteredTransactions.forEach((transaction) => {
      spending[transaction.type] += transaction.amount
    })

    return spending
  }

  // Get spending trends over time
  const getSpendingTrends = () => {
    const trends: { [key: string]: { needs: number; wants: number; notImportant: number; date: string } } = {}

    filteredTransactions.forEach((transaction) => {
      const date = new Date(transaction.date)
      const key =
        reportPeriod === "week" || reportPeriod === "month"
          ? date.toISOString().split("T")[0] // Daily for week/month
          : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}` // Monthly for quarter/year

      if (!trends[key]) {
        trends[key] = { needs: 0, wants: 0, notImportant: 0, date: key }
      }

      trends[key][transaction.type] += transaction.amount
    })

    return Object.values(trends).sort((a, b) => a.date.localeCompare(b.date))
  }

  // Get top spending categories
  const getTopCategories = () => {
    const categorySpending: { [key: string]: number } = {}

    filteredTransactions.forEach((transaction) => {
      categorySpending[transaction.category] = (categorySpending[transaction.category] || 0) + transaction.amount
    })

    return Object.entries(categorySpending)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }))
  }

  const spendingByCategory = getSpendingByCategory()
  const totalSpent = spendingByCategory.needs + spendingByCategory.wants + spendingByCategory.notImportant
  const spendingTrends = getSpendingTrends()
  const topCategories = getTopCategories()

  // Export functions
  const exportToCSV = () => {
    const headers = ["Date", "Description", "Category", "Type", "Amount", "Notes"]
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map((transaction) =>
        [
          transaction.date,
          `"${transaction.description}"`,
          `"${transaction.category}"`,
          transaction.type,
          transaction.amount,
          `"${transaction.notes || ""}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `finance-report-${reportPeriod}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportToPDF = () => {
    // Create a comprehensive report
    const reportContent = `
      FINANCE REPORT - ${reportPeriod.toUpperCase()}
      Generated: ${new Date().toLocaleDateString()}
      
      SUMMARY
      -------
      Total Spent: ${currencySymbol}${totalSpent.toLocaleString()}
      Monthly Income: ${currencySymbol}${monthlyIncome.toLocaleString()}
      Savings: ${currencySymbol}${(monthlyIncome - totalSpent).toLocaleString()}
      
      SPENDING BREAKDOWN
      ------------------
      Needs: ${currencySymbol}${spendingByCategory.needs.toLocaleString()} (${((spendingByCategory.needs / totalSpent) * 100).toFixed(1)}%)
      Wants: ${currencySymbol}${spendingByCategory.wants.toLocaleString()} (${((spendingByCategory.wants / totalSpent) * 100).toFixed(1)}%)
      Not Important: ${currencySymbol}${spendingByCategory.notImportant.toLocaleString()} (${((spendingByCategory.notImportant / totalSpent) * 100).toFixed(1)}%)
      
      TOP CATEGORIES
      --------------
      ${topCategories.map((cat, i) => `${i + 1}. ${cat.category}: ${currencySymbol}${cat.amount.toLocaleString()}`).join("\n")}
      
      TRANSACTIONS (${filteredTransactions.length} total)
      ------------
      ${filteredTransactions
        .slice(0, 20)
        .map(
          (t) =>
            `${new Date(t.date).toLocaleDateString()} - ${t.description}: ${currencySymbol}${t.amount} (${t.category})`,
        )
        .join("\n")}
      ${filteredTransactions.length > 20 ? `\n... and ${filteredTransactions.length - 20} more transactions` : ""}
    `

    const blob = new Blob([reportContent], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `finance-report-${reportPeriod}-${new Date().toISOString().split("T")[0]}.txt`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const chartData = [
    { name: "Needs", value: spendingByCategory.needs, color: "#10b981" },
    { name: "Wants", value: spendingByCategory.wants, color: "#f59e0b" },
    { name: "Not Important", value: spendingByCategory.notImportant, color: "#ef4444" },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Reports & Export
            </CardTitle>
            <CardDescription>Generate detailed financial reports and export your data</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={reportPeriod} onValueChange={(value: any) => setReportPeriod(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No transactions found for the selected period</p>
            <p className="text-sm text-muted-foreground">Try selecting a different time period</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Total Spent</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {currencySymbol}
                    {totalSpent.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Transactions</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">{filteredTransactions.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Avg/Day</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {currencySymbol}
                    {(
                      totalSpent /
                      Math.max(
                        1,
                        reportPeriod === "week"
                          ? 7
                          : reportPeriod === "month"
                            ? 30
                            : reportPeriod === "quarter"
                              ? 90
                              : 365,
                      )
                    ).toFixed(0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <PieChartIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Top Category</span>
                  </div>
                  <div className="text-lg font-bold mt-1">{topCategories[0]?.category || "None"}</div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Spending by Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Spending by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => [`${currencySymbol}${value}`, "Amount"]} />
                        <Bar dataKey="value" fill="#ea580c" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Spending Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Spending Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={spendingTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => [`${currencySymbol}${value}`, "Amount"]} />
                        <Line type="monotone" dataKey="needs" stroke="#10b981" strokeWidth={2} />
                        <Line type="monotone" dataKey="wants" stroke="#f59e0b" strokeWidth={2} />
                        <Line type="monotone" dataKey="notImportant" stroke="#ef4444" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Spending Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topCategories.map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="secondary"
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                        >
                          {index + 1}
                        </Badge>
                        <span className="font-medium">{category.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {currencySymbol}
                          {category.amount.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {((category.amount / totalSpent) * 100).toFixed(1)}% of total
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Savings Goals Progress */}
            {savingsGoals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Savings Goals Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {savingsGoals.slice(0, 3).map((goal) => {
                      const progress = (goal.currentAmount / goal.targetAmount) * 100
                      return (
                        <div key={goal.id} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{goal.title}</span>
                            <span>
                              {currencySymbol}
                              {goal.currentAmount.toLocaleString()} / {currencySymbol}
                              {goal.targetAmount.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground">{progress.toFixed(1)}% complete</div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator />

            {/* Export Options */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={exportToCSV} variant="outline" className="flex-1 gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export to CSV
              </Button>
              <Button onClick={exportToPDF} variant="outline" className="flex-1 gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
