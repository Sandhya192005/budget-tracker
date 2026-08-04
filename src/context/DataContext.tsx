import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import {
  Category,
  Transaction,
  Budget,
  getCategories,
  createDefaultCategories,
  saveCategory,
  getTransactions,
  saveTransaction,
  deleteTransaction as deleteTransactionFromStorage,
  generateId,
  getCurrentTimestamp,
  getBudgets,
  saveBudget,
  deleteBudget as deleteBudgetFromStorage,
} from '../lib/storage'
import { parseISO } from 'date-fns'

export interface TransactionWithCategory extends Transaction {
  category?: {
    name: string
    icon: string
    color: string
  }
}

interface DataContextValue {
  categories: Category[]
  transactions: TransactionWithCategory[]
  budgets: Budget[]
  loading: boolean
  addTransaction: (data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<{ data: Transaction | null; error: { message: string } | null }>
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<{ data: Transaction | null; error: { message: string } | null }>
  deleteTransaction: (id: string) => Promise<{ error: { message: string } | null }>
  addCategory: (data: Omit<Category, 'id' | 'userId' | 'createdAt'>) => Promise<{ data: Category | null; error: { message: string } | null }>
  setBudget: (categoryId: string, amount: number, month: string) => Promise<{ data: Budget | null; error: { message: string } | null }>
  deleteBudget: (budgetId: string) => Promise<{ error: { message: string } | null }>
  refresh: () => void
}

const DataContext = createContext<DataContextValue | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    if (!user) {
      setCategories([])
      setTransactions([])
      setBudgets([])
      setLoading(false)
      return
    }

    setLoading(true)

    let userCategories = getCategories(user.id)
    if (userCategories.length === 0) {
      userCategories = createDefaultCategories(user.id)
    }
    setCategories(userCategories)

    const userTransactions = getTransactions(user.id)
    const withCategories: TransactionWithCategory[] = userTransactions.map(t => {
      const cat = userCategories.find(c => c.id === t.categoryId)
      return {
        ...t,
        amount: Number(t.amount) || 0,
        category: cat ? { name: cat.name, icon: cat.icon, color: cat.color } : undefined,
      }
    })
    withCategories.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
    setTransactions(withCategories)

    const userBudgets = getBudgets(user.id).map(b => ({ ...b, amount: Number(b.amount) || 0 }))
    setBudgets(userBudgets)

    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addTransaction = async (data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return { data: null, error: { message: 'User not authenticated' } }
    try {
      const newTransaction: Transaction = {
        id: generateId(),
        userId: user.id,
        categoryId: data.categoryId,
        type: data.type,
        amount: data.amount,
        description: data.description,
        notes: data.notes,
        date: data.date,
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
      }
      saveTransaction(newTransaction)
      refresh()
      return { data: newTransaction, error: null }
    } catch (error) {
      return { data: null, error: { message: (error as Error).message } }
    }
  }

  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    if (!user) return { data: null, error: { message: 'User not authenticated' } }
    try {
      const existing = getTransactions(user.id).find(t => t.id === id)
      if (!existing) return { data: null, error: { message: 'Transaction not found' } }
      const updated: Transaction = { ...existing, ...data, updatedAt: getCurrentTimestamp() }
      saveTransaction(updated)
      refresh()
      return { data: updated, error: null }
    } catch (error) {
      return { data: null, error: { message: (error as Error).message } }
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      deleteTransactionFromStorage(id)
      refresh()
      return { error: null }
    } catch (error) {
      return { error: { message: (error as Error).message } }
    }
  }

  const addCategory = async (data: Omit<Category, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return { data: null, error: { message: 'User not authenticated' } }
    try {
      const newCategory: Category = {
        id: generateId(),
        userId: user.id,
        name: data.name,
        icon: data.icon,
        color: data.color,
        type: data.type,
        createdAt: getCurrentTimestamp(),
      }
      saveCategory(newCategory)
      refresh()
      return { data: newCategory, error: null }
    } catch (error) {
      return { data: null, error: { message: (error as Error).message } }
    }
  }

  const setBudget = async (categoryId: string, amount: number, month: string) => {
    if (!user) return { data: null, error: { message: 'User not authenticated' } }
    try {
      const existing = getBudgets(user.id).find(b => b.categoryId === categoryId && b.month === month)
      let budget: Budget
      if (existing) {
        budget = { ...existing, amount, updatedAt: getCurrentTimestamp() }
      } else {
        budget = {
          id: generateId(),
          userId: user.id,
          categoryId,
          amount,
          month,
          createdAt: getCurrentTimestamp(),
          updatedAt: getCurrentTimestamp(),
        }
      }
      saveBudget(budget)
      refresh()
      return { data: budget, error: null }
    } catch (error) {
      return { data: null, error: { message: (error as Error).message } }
    }
  }

  const deleteBudget = async (budgetId: string) => {
    try {
      deleteBudgetFromStorage(budgetId)
      refresh()
      return { error: null }
    } catch (error) {
      return { error: { message: (error as Error).message } }
    }
  }

  return (
    <DataContext.Provider value={{
      categories,
      transactions,
      budgets,
      loading,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCategory,
      setBudget,
      deleteBudget,
      refresh,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
