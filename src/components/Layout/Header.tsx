import { useState } from 'react'
import { LogOut, Settings, X, Mail, Calendar } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { clearTransactions, clearBudgets, resetCategories } from '../../lib/storage'

function ProfileModal({ onClose }: { onClose: () => void }) {
  const { user, signOut } = useAuth()
  const { transactions, budgets } = useData()

  const totalTransactions = transactions.length
  const totalBudgets = budgets.length
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">
                {user?.fullName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{user?.fullName || 'User'}</h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Joined {new Date(user?.createdAt || new Date()).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-700">{totalTransactions}</p>
              <p className="text-xs text-blue-600">Transactions</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-700">{totalBudgets}</p>
              <p className="text-xs text-purple-600">Budgets</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-lg font-bold text-green-700">₹{totalIncome.toLocaleString('en-IN')}</p>
              <p className="text-xs text-green-600">Total Income</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <p className="text-lg font-bold text-red-700">₹{totalExpenses.toLocaleString('en-IN')}</p>
              <p className="text-xs text-red-600">Total Expenses</p>
            </div>
          </div>

          <button
            onClick={() => { signOut(); onClose() }}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth()
  const { categories, transactions, budgets, refresh } = useData()
  const [message, setMessage] = useState<string | null>(null)

  const handleClearTransactions = () => {
    if (!user) return
    if (window.confirm('Are you sure you want to delete all your transactions? This cannot be undone.')) {
      clearTransactions(user.id)
      refresh()
      setMessage('All transactions cleared.')
    }
  }

  const handleClearBudgets = () => {
    if (!user) return
    if (window.confirm('Are you sure you want to delete all your budgets? This cannot be undone.')) {
      clearBudgets(user.id)
      refresh()
      setMessage('All budgets cleared.')
    }
  }

  const handleResetCategories = () => {
    if (!user) return
    if (window.confirm('Reset categories to defaults? Your custom categories will be lost.')) {
      resetCategories(user.id)
      refresh()
      setMessage('Categories reset to defaults.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Account</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Email</span>
                <span className="text-gray-900 font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Currency</span>
                <span className="text-gray-900 font-medium">INR (₹)</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Data Management</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Transactions: <strong>{transactions.length}</strong></span>
                <button onClick={handleClearTransactions} className="text-red-600 hover:text-red-700 font-medium">
                  Clear All
                </button>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Budgets: <strong>{budgets.length}</strong></span>
                <button onClick={handleClearBudgets} className="text-red-600 hover:text-red-700 font-medium">
                  Clear All
                </button>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Categories: <strong>{categories.length}</strong></span>
                <button onClick={handleResetCategories} className="text-red-600 hover:text-red-700 font-medium">
                  Reset
                </button>
              </div>
            </div>
          </div>

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function Header() {
  const { user, signOut } = useAuth()
  const [showProfile, setShowProfile] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg w-10 h-10 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">₹</span>
              </div>
              <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Budget Tracker
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
              >
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-8 h-8 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user?.fullName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:inline">{user?.email}</span>
              </button>

              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              <button
                onClick={signOut}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  )
}
