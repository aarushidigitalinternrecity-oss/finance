"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Target, Plus, Edit, Trash2, CheckCircle } from "lucide-react"

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

interface SavingsGoalsProps {
  currency: string
  monthlyIncome: number
  totalSpent: number
}

export function SavingsGoals({ currency, monthlyIncome, totalSpent }: SavingsGoalsProps) {
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    targetDate: "",
    category: "other" as SavingsGoal["category"],
    priority: "medium" as SavingsGoal["priority"],
  })

  useEffect(() => {
    const savedGoals = localStorage.getItem("financeAI_savingsGoals")
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals))
    }
  }, [])

  const saveGoals = (updatedGoals: SavingsGoal[]) => {
    setGoals(updatedGoals)
    localStorage.setItem("financeAI_savingsGoals", JSON.stringify(updatedGoals))
  }

  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      INR: "₹",
    }
    return symbols[currency] || "$"
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "emergency":
        return "bg-red-100 text-red-800"
      case "vacation":
        return "bg-blue-100 text-blue-800"
      case "purchase":
        return "bg-green-100 text-green-800"
      case "investment":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "emergency":
        return "Emergency Fund"
      case "vacation":
        return "Vacation"
      case "purchase":
        return "Purchase"
      case "investment":
        return "Investment"
      default:
        return "Other"
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

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      targetAmount: "",
      targetDate: "",
      category: "other",
      priority: "medium",
    })
    setEditingGoal(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.targetAmount || !formData.targetDate) {
      return
    }

    const goalData = {
      title: formData.title,
      description: formData.description || undefined,
      targetAmount: Number.parseFloat(formData.targetAmount),
      targetDate: formData.targetDate,
      category: formData.category,
      priority: formData.priority,
    }

    if (editingGoal) {
      // Update existing goal
      const updatedGoals = goals.map((goal) => (goal.id === editingGoal.id ? { ...goal, ...goalData } : goal))
      saveGoals(updatedGoals)
    } else {
      // Create new goal
      const newGoal: SavingsGoal = {
        ...goalData,
        id: Date.now().toString(),
        currentAmount: 0,
        createdAt: new Date().toISOString(),
      }
      saveGoals([...goals, newGoal])
    }

    resetForm()
    setShowAddDialog(false)
  }

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal)
    setFormData({
      title: goal.title,
      description: goal.description || "",
      targetAmount: goal.targetAmount.toString(),
      targetDate: goal.targetDate,
      category: goal.category,
      priority: goal.priority,
    })
    setShowAddDialog(true)
  }

  const handleDelete = (id: string) => {
    const updatedGoals = goals.filter((goal) => goal.id !== id)
    saveGoals(updatedGoals)
  }

  const handleAddMoney = (goalId: string, amount: number) => {
    const updatedGoals = goals.map((goal) =>
      goal.id === goalId ? { ...goal, currentAmount: Math.min(goal.currentAmount + amount, goal.targetAmount) } : goal,
    )
    saveGoals(updatedGoals)
  }

  const calculateDaysRemaining = (targetDate: string) => {
    const target = new Date(targetDate)
    const today = new Date()
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const calculateMonthlySavingsNeeded = (goal: SavingsGoal) => {
    const remaining = goal.targetAmount - goal.currentAmount
    const daysRemaining = calculateDaysRemaining(goal.targetDate)
    const monthsRemaining = Math.max(1, daysRemaining / 30)
    return remaining / monthsRemaining
  }

  const currencySymbol = getCurrencySymbol(currency)
  const availableForSavings = monthlyIncome - totalSpent

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Savings Goals
            </CardTitle>
            <CardDescription>Track your financial goals and progress</CardDescription>
          </div>
          <Dialog
            open={showAddDialog}
            onOpenChange={(open) => {
              setShowAddDialog(open)
              if (!open) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  {editingGoal ? "Edit Goal" : "Add New Goal"}
                </DialogTitle>
                <DialogDescription>
                  {editingGoal ? "Update your savings goal" : "Create a new savings goal to track your progress"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    placeholder="Emergency Fund, Vacation, New Car..."
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetAmount">Target Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {currencySymbol}
                      </span>
                      <Input
                        id="targetAmount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-8"
                        value={formData.targetAmount}
                        onChange={(e) => setFormData((prev) => ({ ...prev, targetAmount: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetDate">Target Date</Label>
                    <Input
                      id="targetDate"
                      type="date"
                      value={formData.targetDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, targetDate: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: SavingsGoal["category"]) =>
                        setFormData((prev) => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emergency">Emergency Fund</SelectItem>
                        <SelectItem value="vacation">Vacation</SelectItem>
                        <SelectItem value="purchase">Purchase</SelectItem>
                        <SelectItem value="investment">Investment</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: SavingsGoal["priority"]) =>
                        setFormData((prev) => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Additional details about this goal..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingGoal ? "Update Goal" : "Create Goal"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {goals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No savings goals yet</p>
            <p className="text-sm text-muted-foreground">Create your first goal to start tracking your progress</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold">{goals.length}</div>
                <div className="text-xs text-muted-foreground">Active Goals</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {currencySymbol}
                  {goals.reduce((sum, goal) => sum + goal.currentAmount, 0).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Total Saved</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {currencySymbol}
                  {availableForSavings.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Available This Month</div>
              </div>
            </div>

            {/* Goals List */}
            <div className="space-y-4">
              {goals
                .sort((a, b) => {
                  // Sort by priority first, then by target date
                  const priorityOrder = { high: 3, medium: 2, low: 1 }
                  if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                    return priorityOrder[b.priority] - priorityOrder[a.priority]
                  }
                  return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
                })
                .map((goal) => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100
                  const daysRemaining = calculateDaysRemaining(goal.targetDate)
                  const monthlySavingsNeeded = calculateMonthlySavingsNeeded(goal)
                  const isCompleted = goal.currentAmount >= goal.targetAmount

                  return (
                    <div key={goal.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{goal.title}</h3>
                            {isCompleted && <CheckCircle className="h-4 w-4 text-green-500" />}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className={`text-xs ${getCategoryColor(goal.category)}`}>
                              {getCategoryLabel(goal.category)}
                            </Badge>
                            <Badge variant="secondary" className={`text-xs ${getPriorityColor(goal.priority)}`}>
                              {goal.priority} priority
                            </Badge>
                          </div>
                          {goal.description && <p className="text-sm text-muted-foreground mb-2">{goal.description}</p>}
                        </div>

                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(goal)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(goal.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>
                            {currencySymbol}
                            {goal.currentAmount.toLocaleString()} / {currencySymbol}
                            {goal.targetAmount.toLocaleString()}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="text-xs text-muted-foreground">{progress.toFixed(1)}% complete</div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                        <div className="p-2 bg-muted rounded">
                          <div className="text-sm font-medium">
                            {currencySymbol}
                            {(goal.targetAmount - goal.currentAmount).toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">Remaining</div>
                        </div>
                        <div className="p-2 bg-muted rounded">
                          <div className="text-sm font-medium">
                            {daysRemaining > 0 ? `${daysRemaining} days` : "Overdue"}
                          </div>
                          <div className="text-xs text-muted-foreground">Time left</div>
                        </div>
                        <div className="p-2 bg-muted rounded">
                          <div className="text-sm font-medium">
                            {currencySymbol}
                            {monthlySavingsNeeded.toFixed(0)}
                          </div>
                          <div className="text-xs text-muted-foreground">Monthly needed</div>
                        </div>
                        <div className="p-2 bg-muted rounded">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs bg-transparent"
                            onClick={() => {
                              const amount = prompt(`Add money to "${goal.title}"`)
                              if (amount && !isNaN(Number(amount))) {
                                handleAddMoney(goal.id, Number(amount))
                              }
                            }}
                            disabled={isCompleted}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Money
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
