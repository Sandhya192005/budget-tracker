import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react'
import { TransactionWithCategory } from '../../context/DataContext'
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns'

interface DashboardStatsProps {
  transactions: TransactionWithCategory[]
}

export function DashboardStats({ transactions }: DashboardStatsProps) {
  const currentMonth = new Date()
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)

  const currentMonthTransactions = transactions.filter(t =>
    isWithinInterval(parseISO(t.date), { start: monthStart, end: monthEnd })
  )

  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses
  const savings = balance > 0 ? balance : 0

  const stats = [
    {
      title: 'Total Income',
      value: totalIncome,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Expenses',
      value: totalExpenses,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Current Balance',
      value: balance,
      icon: Wallet,
      color: balance >= 0 ? 'text-blue-600' : 'text-red-600',
      bgColor: balance >= 0 ? 'bg-blue-100' : 'bg-red-100'
    },
    {
      title: 'Savings',
      value: savings,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ]

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')} Overview
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  ₹{Math.abs(stat.value).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}