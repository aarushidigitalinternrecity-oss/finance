"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Search, Filter, Calendar, Eye } from "lucide-react"
import { storage } from "@/lib/storage"
import { formatINR } from "@/lib/currency"

interface Transaction {
  id: string
  amount: number
  category: string
  type: "needs" | "wants" | "notImportant"
  description: string
  date: string
  notes?: string
}

interface TransactionListProps {
  transactions: Transaction[]
  onDeleteTransaction?: (id: string) => void
  onTransactionUpdate?: () => void
  currency?: string
  readOnly?: boolean
}

export function TransactionList({
  transactions,
  onDeleteTransaction,
  onTransactionUpdate,
  currency = "USD",
  readOnly = false,
}: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date")

  const handleDeleteTransaction = (id: string) => {
    storage.deleteTransaction(id)

    // Call the appropriate callback
    if (onDeleteTransaction) {
      onDeleteTransaction(id)
    }
    if (onTransactionUpdate) {
      onTransactionUpdate()
    }
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

  const filteredTransactions = transactions
    .filter((transaction) => {
      const matchesSearch =
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterType === "all" || transaction.type === filterType
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "amount":
          return b.amount - a.amount
        case "category":
          return a.category.localeCompare(b.category)
        case "date":
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
    })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {readOnly ? <Eye className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
          {readOnly ? "Transaction History" : "Recent Transactions"}
        </CardTitle>
        <CardDescription>
          {readOnly ? "View historical transactions" : "Track and manage your expenses"}
        </CardDescription>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="needs">Needs</SelectItem>
              <SelectItem value="wants">Wants</SelectItem>
              <SelectItem value="notImportant">Not Important</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
              <SelectItem value="category">Category</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {transactions.length === 0 ? "No transactions yet" : "No transactions match your filters"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {transactions.length === 0
                ? readOnly
                  ? "No transactions found for this period"
                  : "Add your first transaction to get started"
                : "Try adjusting your search or filters"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{transaction.description}</span>
                    <Badge variant="secondary" className={`text-xs ${getTypeColor(transaction.type)}`}>
                      {getTypeLabel(transaction.type)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{transaction.category}</span>
                    <span>•</span>
                    <span>{formatDate(transaction.date)}</span>
                  </div>
                  {transaction.notes && (
                    <p className="text-xs text-muted-foreground mt-1 italic">{transaction.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-semibold">{formatINR(transaction.amount)}</div>
                  </div>
                  {!readOnly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
