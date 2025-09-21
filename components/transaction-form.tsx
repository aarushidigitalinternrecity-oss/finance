"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, DollarSign } from "lucide-react"

interface Transaction {
  id: string
  amount: number
  category: string
  type: "needs" | "wants" | "notImportant"
  description: string
  date: string
  notes?: string
}

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, "id">) => void
  categories: {
    needs: string[]
    wants: string[]
    notImportant: string[]
  }
  currency: string
}

export function TransactionForm({ onAddTransaction, categories, currency }: TransactionFormProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    type: "" as "needs" | "wants" | "notImportant" | "",
    description: "",
    notes: "",
  })

  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      INR: "₹",
    }
    return symbols[currency] || "$"
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || !formData.category || !formData.type || !formData.description) {
      return
    }

    const transaction = {
      amount: Number.parseFloat(formData.amount),
      category: formData.category,
      type: formData.type,
      description: formData.description,
      date: new Date().toISOString(),
      notes: formData.notes || undefined,
    }

    onAddTransaction(transaction)
    setFormData({
      amount: "",
      category: "",
      type: "",
      description: "",
      notes: "",
    })
    setOpen(false)
  }

  const handleTypeChange = (type: "needs" | "wants" | "notImportant") => {
    setFormData((prev) => ({ ...prev, type, category: "" }))
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "needs":
        return "bg-green-100 text-green-800"
      case "wants":
        return "bg-yellow-100 text-yellow-800"
      case "notImportant":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "needs":
        return "Needs"
      case "wants":
        return "Wants"
      case "notImportant":
        return "Not Important"
      default:
        return ""
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Add New Transaction
          </DialogTitle>
          <DialogDescription>Record your expense and categorize it for better tracking.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {getCurrencySymbol(currency)}
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-8"
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Coffee, Groceries, etc."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Category Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["needs", "wants", "notImportant"] as const).map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={formData.type === type ? "default" : "outline"}
                  className={`h-auto p-3 ${formData.type === type ? "" : "hover:bg-muted"}`}
                  onClick={() => handleTypeChange(type)}
                >
                  <div className="text-center">
                    <div className={`inline-block px-2 py-1 rounded text-xs font-medium mb-1 ${getTypeColor(type)}`}>
                      {getTypeLabel(type)}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {formData.type && (
            <div className="space-y-2">
              <Label htmlFor="category">Specific Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories[formData.type].map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional details about this expense..."
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
