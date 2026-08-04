import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TransactionWithCategory } from '../../context/DataContext'
import { startOfMonth, endOfMonth, isWithinInterval, format, subMonths, parseISO } from 'date-fns'

interface SpendingChartProps {
  transactions: TransactionWithCategory[]
}

const COLORS = ['#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#6366f1']

export function SpendingChart({ transactions }: SpendingChartProps) {
  const currentMonth = new Date()
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)

  const currentMonthTransactions = transactions.filter(t =>
    isWithinInterval(parseISO(t.date), { start: monthStart, end: monthEnd })
  )

  // Category-wise spending (Pie Chart)
  const categorySpending = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      const categoryName = transaction.category?.name || 'Other'
      acc[categoryName] = (acc[categoryName] || 0) + transaction.amount
      return acc
    }, {} as Record<string, number>)

  const pieData = Object.entries(categorySpending).map(([name, value]) => ({
    name,
    value,
  }))

  // Monthly trends (Bar Chart)
  const monthlyData = []
  for (let i = 5; i >= 0; i--) {
    const month = subMonths(currentMonth, i)
    const start = startOfMonth(month)
    const end = endOfMonth(month)
    
    const monthTransactions = transactions.filter(t =>
      isWithinInterval(parseISO(t.date), { start, end })
    )

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    monthlyData.push({
      month: format(month, 'MMM'),
      income,
      expenses,
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Category-wise Spending */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Category-wise Spending</h3>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: { name?: string; percent?: number }) =>
                  `${name} (${((percent ?? 0) * 100).toFixed(1)}%)`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Amount']} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            No expense data available for this month
          </div>
        )}
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Monthly Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value: number) => [`₹${value.toFixed(2)}`, '']} />
            <Legend />
            <Bar dataKey="income" fill="#10b981" name="Income" />
            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}