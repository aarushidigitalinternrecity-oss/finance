"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, DollarSign, Target, Wallet } from "lucide-react"

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

interface OnboardingFlowProps {
  onComplete: () => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<OnboardingData>({
    monthlyIncome: "",
    savingsGoal: "",
    currency: "USD",
    categories: {
      needs: ["Rent", "Groceries", "Utilities"],
      wants: ["Dining Out", "Entertainment", "Shopping"],
      notImportant: ["Impulse Buys", "Luxury Items"],
    },
  })

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      // Save onboarding data to localStorage
      localStorage.setItem("financeAI_onboarding", JSON.stringify(data))
      onComplete()
    }
  }

  const addCategory = (type: keyof OnboardingData["categories"], category: string) => {
    if (category.trim()) {
      setData((prev) => ({
        ...prev,
        categories: {
          ...prev.categories,
          [type]: [...prev.categories[type], category.trim()],
        },
      }))
    }
  }

  const removeCategory = (type: keyof OnboardingData["categories"], index: number) => {
    setData((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [type]: prev.categories[type].filter((_, i) => i !== index),
      },
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <Wallet className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold font-[family-name:var(--font-space-grotesk)]">
            Welcome to FinanceAI
          </CardTitle>
          <CardDescription className="text-lg">Plan, Track & Save Better with AI-powered insights</CardDescription>
          <div className="flex justify-center mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-2 w-8 mx-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold font-[family-name:var(--font-space-grotesk)] flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Basic Setup
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="income">Monthly Income</Label>
                  <Input
                    id="income"
                    type="number"
                    placeholder="5000"
                    value={data.monthlyIncome}
                    onChange={(e) => setData((prev) => ({ ...prev, monthlyIncome: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={data.currency}
                    onValueChange={(value) => setData((prev) => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="savings">Monthly Savings Goal (Optional)</Label>
                <Input
                  id="savings"
                  type="number"
                  placeholder="1000"
                  value={data.savingsGoal}
                  onChange={(e) => setData((prev) => ({ ...prev, savingsGoal: e.target.value }))}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold font-[family-name:var(--font-space-grotesk)] flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Expense Categories
              </h3>

              <div className="space-y-6">
                <CategorySection
                  title="Needs"
                  description="Essential expenses (rent, food, bills)"
                  color="bg-green-100 text-green-800"
                  categories={data.categories.needs}
                  onAdd={(category) => addCategory("needs", category)}
                  onRemove={(index) => removeCategory("needs", index)}
                />

                <CategorySection
                  title="Wants"
                  description="Nice to have (gadgets, dining out)"
                  color="bg-yellow-100 text-yellow-800"
                  categories={data.categories.wants}
                  onAdd={(category) => addCategory("wants", category)}
                  onRemove={(index) => removeCategory("wants", index)}
                />

                <CategorySection
                  title="Not Important"
                  description="Impulse buys, luxury items"
                  color="bg-red-100 text-red-800"
                  categories={data.categories.notImportant}
                  onAdd={(category) => addCategory("notImportant", category)}
                  onRemove={(index) => removeCategory("notImportant", index)}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-center">
              <h3 className="text-xl font-semibold font-[family-name:var(--font-space-grotesk)]">You're All Set! 🎉</h3>
              <p className="text-muted-foreground">
                Your FinanceAI is ready to help you make smarter financial decisions. Let's start tracking your expenses
                and building better money habits!
              </p>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">What's Next:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• View your personalized dashboard</li>
                  <li>• Start adding transactions</li>
                  <li>• Get AI-powered insights</li>
                  <li>• Track your savings goals</li>
                </ul>
              </div>
            </div>
          )}

          <Button onClick={handleNext} className="w-full" disabled={step === 1 && !data.monthlyIncome}>
            {step === 3 ? "Get Started" : "Continue"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

interface CategorySectionProps {
  title: string
  description: string
  color: string
  categories: string[]
  onAdd: (category: string) => void
  onRemove: (index: number) => void
}

function CategorySection({ title, description, color, categories, onAdd, onRemove }: CategorySectionProps) {
  const [newCategory, setNewCategory] = useState("")

  const handleAdd = () => {
    onAdd(newCategory)
    setNewCategory("")
  }

  return (
    <div className="space-y-3">
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category, index) => (
          <Badge key={index} variant="secondary" className={`${color} cursor-pointer`} onClick={() => onRemove(index)}>
            {category} ×
          </Badge>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder={`Add ${title.toLowerCase()} category`}
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button onClick={handleAdd} variant="outline" size="sm">
          Add
        </Button>
      </div>
    </div>
  )
}
