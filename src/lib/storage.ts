// Local storage utilities for budget tracker
export interface User {
  id: string
  email: string
  fullName: string
  currency: string
  createdAt: string
}

export interface Category {
  id: string
  userId: string
  name: string
  icon: string
  color: string
  type: 'income' | 'expense'
  createdAt: string
}

export interface Transaction {
  id: string
  userId: string
  categoryId: string
  type: 'income' | 'expense'
  amount: number
  description: string
  notes: string | null
  date: string
  createdAt: string
  updatedAt: string
}

export interface Budget {
  id: string
  userId: string
  categoryId: string
  amount: number
  month: string
  createdAt: string
  updatedAt: string
}

// Storage keys
const STORAGE_KEYS = {
  USERS: 'budget_tracker_users',
  CURRENT_USER: 'budget_tracker_current_user',
  TRANSACTIONS: 'budget_tracker_transactions',
  CATEGORIES: 'budget_tracker_categories',
  BUDGETS: 'budget_tracker_budgets',
}

// Utility functions
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const getCurrentTimestamp = (): string => {
  return new Date().toISOString()
}

// User management
export const getUsers = (): User[] => {
  const users = localStorage.getItem(STORAGE_KEYS.USERS)
  return users ? JSON.parse(users) : []
}

export const saveUsers = (users: User[]): void => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
}

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
  return user ? JSON.parse(user) : null
}

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
  }
}

const generateSalt = (): string => {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

const hashPassword = async (password: string, salt: string): Promise<string> => {
  const data = new TextEncoder().encode(salt + password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export const createUser = async (email: string, password: string, fullName: string): Promise<User> => {
  const users = getUsers()
  const existingUser = users.find(u => u.email === email)

  if (existingUser) {
    throw new Error('User already exists')
  }

  const newUser: User = {
    id: generateId(),
    email,
    fullName,
    currency: 'INR',
    createdAt: getCurrentTimestamp(),
  }

  users.push(newUser)
  saveUsers(users)

  const salt = generateSalt()
  const hash = await hashPassword(password, salt)
  const passwordsJson = localStorage.getItem('budget_tracker_passwords')
  const passwords = passwordsJson ? JSON.parse(passwordsJson) : {}
  passwords[email] = `${salt}:${hash}`
  localStorage.setItem('budget_tracker_passwords', JSON.stringify(passwords))

  return newUser
}

export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  const users = getUsers()
  const passwordsJson = localStorage.getItem('budget_tracker_passwords')
  const passwords = passwordsJson ? JSON.parse(passwordsJson) : {}

  const user = users.find(u => u.email === email)
  const stored: string | undefined = passwords[email]
  if (user && stored) {
    const [salt, hash] = stored.split(':')
    const candidateHash = await hashPassword(password, salt)
    if (candidateHash === hash) {
      return user
    }
  }

  return null
}

// Categories management
export const getCategories = (userId: string): Category[] => {
  const categories = localStorage.getItem(STORAGE_KEYS.CATEGORIES)
  const allCategories: Category[] = categories ? JSON.parse(categories) : []
  return allCategories.filter(cat => cat.userId === userId)
}

export const saveCategory = (category: Category): void => {
  const categories = localStorage.getItem(STORAGE_KEYS.CATEGORIES)
  const allCategories: Category[] = categories ? JSON.parse(categories) : []
  
  const existingIndex = allCategories.findIndex(cat => cat.id === category.id)
  if (existingIndex >= 0) {
    allCategories[existingIndex] = category
  } else {
    allCategories.push(category)
  }
  
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(allCategories))
}

export const createDefaultCategories = (userId: string): Category[] => {
  const defaultCategories = [
    { name: 'Food & Dining', icon: 'UtensilsCrossed', color: '#ef4444', type: 'expense' as const },
    { name: 'Travel', icon: 'Plane', color: '#3b82f6', type: 'expense' as const },
    { name: 'Bills & Utilities', icon: 'FileText', color: '#f59e0b', type: 'expense' as const },
    { name: 'Rent', icon: 'Home', color: '#8b5cf6', type: 'expense' as const },
    { name: 'Shopping', icon: 'ShoppingBag', color: '#ec4899', type: 'expense' as const },
    { name: 'Entertainment', icon: 'Film', color: '#06b6d4', type: 'expense' as const },
    { name: 'Healthcare', icon: 'Heart', color: '#ef4444', type: 'expense' as const },
    { name: 'Education', icon: 'GraduationCap', color: '#10b981', type: 'expense' as const },
    { name: 'Salary', icon: 'Banknote', color: '#10b981', type: 'income' as const },
    { name: 'Freelance', icon: 'Laptop', color: '#3b82f6', type: 'income' as const },
    { name: 'Investment', icon: 'TrendingUp', color: '#f59e0b', type: 'income' as const },
    { name: 'Other Income', icon: 'PlusCircle', color: '#6366f1', type: 'income' as const },
  ]

  const categories: Category[] = defaultCategories.map(cat => ({
    id: generateId(),
    userId,
    name: cat.name,
    icon: cat.icon,
    color: cat.color,
    type: cat.type,
    createdAt: getCurrentTimestamp(),
  }))

  categories.forEach(saveCategory)
  return categories
}

// Transactions management
export const getTransactions = (userId: string): Transaction[] => {
  const transactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
  const allTransactions: Transaction[] = transactions ? JSON.parse(transactions) : []
  return allTransactions.filter(t => t.userId === userId)
}

export const saveTransaction = (transaction: Transaction): void => {
  const transactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
  const allTransactions: Transaction[] = transactions ? JSON.parse(transactions) : []
  
  const existingIndex = allTransactions.findIndex(t => t.id === transaction.id)
  if (existingIndex >= 0) {
    allTransactions[existingIndex] = transaction
  } else {
    allTransactions.push(transaction)
  }
  
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(allTransactions))
}

export const deleteTransaction = (transactionId: string): void => {
  const transactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
  const allTransactions: Transaction[] = transactions ? JSON.parse(transactions) : []

  const filteredTransactions = allTransactions.filter(t => t.id !== transactionId)
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(filteredTransactions))
}

export const clearTransactions = (userId: string): void => {
  const transactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
  const allTransactions: Transaction[] = transactions ? JSON.parse(transactions) : []
  const remaining = allTransactions.filter(t => t.userId !== userId)
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(remaining))
}

// Budgets management
export const getBudgets = (userId: string): Budget[] => {
  const budgets = localStorage.getItem(STORAGE_KEYS.BUDGETS)
  const allBudgets: Budget[] = budgets ? JSON.parse(budgets) : []
  return allBudgets.filter(b => b.userId === userId)
}

export const saveBudget = (budget: Budget): void => {
  const budgets = localStorage.getItem(STORAGE_KEYS.BUDGETS)
  const allBudgets: Budget[] = budgets ? JSON.parse(budgets) : []
  
  const existingIndex = allBudgets.findIndex(b => b.id === budget.id)
  if (existingIndex >= 0) {
    allBudgets[existingIndex] = budget
  } else {
    allBudgets.push(budget)
  }
  
  localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(allBudgets))
}

export const deleteBudget = (budgetId: string): void => {
  const budgets = localStorage.getItem(STORAGE_KEYS.BUDGETS)
  const allBudgets: Budget[] = budgets ? JSON.parse(budgets) : []
  const filtered = allBudgets.filter(b => b.id !== budgetId)
  localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(filtered))
}

export const clearBudgets = (userId: string): void => {
  const budgets = localStorage.getItem(STORAGE_KEYS.BUDGETS)
  const allBudgets: Budget[] = budgets ? JSON.parse(budgets) : []
  const remaining = allBudgets.filter(b => b.userId !== userId)
  localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(remaining))
}

export const resetCategories = (userId: string): void => {
  const categories = localStorage.getItem(STORAGE_KEYS.CATEGORIES)
  const allCategories: Category[] = categories ? JSON.parse(categories) : []
  const remaining = allCategories.filter(c => c.userId !== userId)
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(remaining))
}