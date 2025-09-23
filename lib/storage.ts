interface Transaction {
  id: string
  amount: number
  category: string
  type: "needs" | "wants" | "notImportant"
  description: string
  date: string
  notes?: string
}

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

interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  category: string
  priority: "high" | "medium" | "low"
  targetDate: string
  createdAt: string
}

interface UserData {
  onboarding: OnboardingData | null
  transactions: Transaction[]
  savingsGoals: SavingsGoal[]
  lastUpdated: string
}

class FinanceStorage {
  private static instance: FinanceStorage
  private readonly STORAGE_KEY = "financeAI_data"
  private readonly BACKUP_KEY = "financeAI_backup"

  static getInstance(): FinanceStorage {
    if (!FinanceStorage.instance) {
      FinanceStorage.instance = new FinanceStorage()
    }
    return FinanceStorage.instance
  }

  // Get all user data
  getUserData(): UserData {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      if (data) {
        const parsed: UserData = JSON.parse(data)
        if (parsed.onboarding && parsed.onboarding.currency !== "INR") {
          parsed.onboarding.currency = "INR"
          this.saveUserData(parsed)
        }
        return parsed
      }
    } catch (error) {
      console.error("[v0] Error loading user data:", error)
      // Try to load from backup
      try {
        const backup = localStorage.getItem(this.BACKUP_KEY)
        if (backup) {
          const backupData = JSON.parse(backup)
          this.saveUserData(backupData) // Restore from backup
          return backupData
        }
      } catch (backupError) {
        console.error("[v0] Error loading backup data:", backupError)
      }
    }

    // Return default structure if no data found
    return {
      onboarding: null,
      transactions: [],
      savingsGoals: [],
      lastUpdated: new Date().toISOString(),
    }
  }

  // Save all user data with backup
  saveUserData(data: UserData): void {
    try {
      // Create backup of current data before saving new data
      const currentData = localStorage.getItem(this.STORAGE_KEY)
      if (currentData) {
        localStorage.setItem(this.BACKUP_KEY, currentData)
      }

      const dataWithTimestamp = {
        ...data,
        onboarding: data.onboarding ? { ...data.onboarding, currency: "INR" } : data.onboarding,
        lastUpdated: new Date().toISOString(),
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataWithTimestamp))
    } catch (error) {
      console.error("[v0] Error saving user data:", error)
    }
  }

  // Transaction management
  addTransaction(transaction: Omit<Transaction, "id">): Transaction {
    const userData = this.getUserData()
    const newTransaction: Transaction = {
      ...transaction,
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: transaction.date || new Date().toISOString(),
    }

    userData.transactions.unshift(newTransaction) // Add to beginning for chronological order
    this.saveUserData(userData)
    return newTransaction
  }

  getTransactions(): Transaction[] {
    return this.getUserData().transactions
  }

  getTransactionsByMonth(year: number, month: number): Transaction[] {
    const transactions = this.getTransactions()
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      return transactionDate.getFullYear() === year && transactionDate.getMonth() === month
    })
  }

  getCurrentMonthTransactions(): Transaction[] {
    const now = new Date()
    return this.getTransactionsByMonth(now.getFullYear(), now.getMonth())
  }

  deleteTransaction(id: string): void {
    const userData = this.getUserData()
    userData.transactions = userData.transactions.filter((t) => t.id !== id)
    this.saveUserData(userData)
  }

  updateTransaction(id: string, updates: Partial<Transaction>): void {
    const userData = this.getUserData()
    const index = userData.transactions.findIndex((t) => t.id === id)
    if (index !== -1) {
      userData.transactions[index] = { ...userData.transactions[index], ...updates }
      this.saveUserData(userData)
    }
  }

  // Monthly summaries
  getMonthlySpending(
    year: number,
    month: number,
  ): { needs: number; wants: number; notImportant: number; total: number } {
    const transactions = this.getTransactionsByMonth(year, month)
    const spending = {
      needs: 0,
      wants: 0,
      notImportant: 0,
      total: 0,
    }

    transactions.forEach((transaction) => {
      spending[transaction.type] += transaction.amount
      spending.total += transaction.amount
    })

    return spending
  }

  getCurrentMonthSpending(): { needs: number; wants: number; notImportant: number; total: number } {
    const now = new Date()
    return this.getMonthlySpending(now.getFullYear(), now.getMonth())
  }

  // Onboarding data
  saveOnboardingData(data: OnboardingData): void {
    const userData = this.getUserData()
    userData.onboarding = { ...data, currency: "INR" }
    this.saveUserData(userData)
  }

  getOnboardingData(): OnboardingData | null {
    const ob = this.getUserData().onboarding
    return ob ? { ...ob, currency: "INR" } : ob
  }

  // Savings goals
  addSavingsGoal(goal: Omit<SavingsGoal, "id" | "createdAt">): SavingsGoal {
    const userData = this.getUserData()
    const newGoal: SavingsGoal = {
      ...goal,
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    }

    userData.savingsGoals.push(newGoal)
    this.saveUserData(userData)
    return newGoal
  }

  getSavingsGoals(): SavingsGoal[] {
    return this.getUserData().savingsGoals
  }

  updateSavingsGoal(id: string, updates: Partial<SavingsGoal>): void {
    const userData = this.getUserData()
    const index = userData.savingsGoals.findIndex((g) => g.id === id)
    if (index !== -1) {
      userData.savingsGoals[index] = { ...userData.savingsGoals[index], ...updates }
      this.saveUserData(userData)
    }
  }

  deleteSavingsGoal(id: string): void {
    const userData = this.getUserData()
    userData.savingsGoals = userData.savingsGoals.filter((g) => g.id !== id)
    this.saveUserData(userData)
  }

  // Data export
  exportData(): string {
    const userData = this.getUserData()
    return JSON.stringify(userData, null, 2)
  }

  // Data import
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)
      // Validate data structure
      if (data && typeof data === "object") {
        this.saveUserData(data)
        return true
      }
      return false
    } catch (error) {
      console.error("[v0] Error importing data:", error)
      return false
    }
  }

  // Clear all data
  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.BACKUP_KEY)
  }
}

export const storage = FinanceStorage.getInstance()
export type { Transaction, OnboardingData, SavingsGoal, UserData }
