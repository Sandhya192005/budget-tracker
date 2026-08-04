import React, { useState } from 'react'
import { Target, Plus, Edit, Trash2, TrendingUp, AlertCircle, X } from 'lucide-react'
import { useData, TransactionWithCategory } from '../../context/DataContext'
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns'

interface BudgetOverviewProps {
  transactions: TransactionWithCategory[]
}

interface BudgetModalProps {
  onClose: () => void
  editingBudget: { categoryId: string; amount: number } | null
}

function BudgetModal({ onClose, editingBudget }: BudgetModalProps) {
  const { categories, setBudget } = useData()
  const [categoryId, setCategoryId] = useState(editingBudget?.categoryId || '')
  const [amount, setAmount] = useState(editingBudget?.amount.toString() || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentMonth = format(new Date(), 'yyyy-MM')
  const expenseCategories = categories.filter(c => c.type === 'expense')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryId || !amount) {
      setError('Please select a category and enter an amount')
      return
    }
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount')
      return
    }
    setLoading(true)
    setError(null)
    const { error } = await setBudget(categoryId, amountNum, currentMonth)
    if (error) {
      setError(error.message)
    } else {
      onClose()
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingBudget ? 'Edit Budget' : 'Set Budget'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={!!editingBudget}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Select a category</option>
              {expenseCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="0.00"
              />
            </div>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {loading ? 'Saving...' : 'Save Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function BudgetOverview({ transactions }: BudgetOverviewProps) {
  const { budgets, categories, deleteBudget } = useData()
  const [showModal, setShowModal] = useState(false)
  const [editingBudget, setEditingBudget] = useState<{ categoryId: string; amount: number } | null>(null)

  const currentMonth = new Date()
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const currentMonthKey = format(currentMonth, 'yyyy-MM')

  const currentMonthTransactions = transactions.filter(t =>
    isWithinInterval(parseISO(t.date), { start: monthStart, end: monthEnd }) &&
    t.type === 'expense'
  )

  const budgetsWithCategories = budgets
    .filter(b => b.month === currentMonthKey)
    .map(budget => {
      const category = categories.find(c => c.id === budget.categoryId)
      const spentAmount = currentMonthTransactions
        .filter(t => t.categoryId === budget.categoryId)
        .reduce((sum, t) => sum + t.amount, 0)
      return {
        ...budget,
        categoryName: category?.name || 'Unknown',
        color: category?.color || '#6b7280',
        spentAmount,
      }
    })

  const getProgressPercentage = (spent: number, budget: number) => {
    return Math.min((spent / budget) * 100, 100)
  }

  const getProgressColor = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const totalBudget = budgetsWithCategories.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = budgetsWithCategories.reduce((sum, b) => sum + b.spentAmount, 0)
  const totalRemaining = totalBudget - totalSpent

  const handleSetBudget = () => {
    setEditingBudget(null)
    setShowModal(true)
  }

  const handleEditBudget = (categoryId: string, amount: number) => {
    setEditingBudget({ categoryId, amount })
    setShowModal(true)
  }

  const handleDeleteBudget = async (budgetId: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      await deleteBudget(budgetId)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Target className="w-6 h-6 text-blue-600" />
          Budget Overview - {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={handleSetBudget}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Set Budget
        </button>
      </div>

      {budgetsWithCategories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Total Budget</p>
            <p className="text-2xl font-bold text-blue-700">
              ₹{totalBudget.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-600 font-medium">Total Spent</p>
            <p className="text-2xl font-bold text-red-700">
              ₹{totalSpent.toLocaleString('en-IN')}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${totalRemaining >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className={`text-sm font-medium ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Remaining
            </p>
            <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              ₹{Math.abs(totalRemaining).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {budgetsWithCategories.map((budget) => {
          const progressPercentage = getProgressPercentage(budget.spentAmount, budget.amount)
          const actualPercentage = (budget.spentAmount / budget.amount) * 100
          const remaining = budget.amount - budget.spentAmount
          const isOverBudget = budget.spentAmount > budget.amount

          return (
            <div key={budget.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: budget.color }} />
                  <h4 className="font-medium text-gray-900">{budget.categoryName}</h4>
                  {isOverBudget && <AlertCircle className="w-4 h-4 text-red-500" />}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditBudget(budget.categoryId, budget.amount)}
                    className="p-1 text-gray-400 hover:text-blue-600 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBudget(budget.id)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>₹{budget.spentAmount.toLocaleString('en-IN')} of ₹{budget.amount.toLocaleString('en-IN')}</span>
                <span className={isOverBudget ? 'text-red-600 font-medium' : 'text-gray-600'}>
                  {isOverBudget ? 'Over by ' : 'Remaining: '}₹{Math.abs(remaining).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(budget.spentAmount, budget.amount)}`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>{actualPercentage.toFixed(1)}% used</span>
                {isOverBudget && (
                  <span className="text-red-600 font-medium flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {((budget.spentAmount / budget.amount - 1) * 100).toFixed(1)}% over budget
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {budgetsWithCategories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No budgets set yet. Create your first budget to start tracking your spending!</p>
        </div>
      )}

      {showModal && (
        <BudgetModal
          onClose={() => { setShowModal(false); setEditingBudget(null) }}
          editingBudget={editingBudget}
        />
      )}
    </div>
  )
}
