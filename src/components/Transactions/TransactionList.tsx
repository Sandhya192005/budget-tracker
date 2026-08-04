import { useState } from 'react'
import { CreditCard as EditIcon, Trash2, Plus } from 'lucide-react'
import { TransactionWithCategory } from '../../context/DataContext'
import { format, parseISO } from 'date-fns'
import { TransactionModal } from './TransactionModal'

interface TransactionListProps {
  transactions: TransactionWithCategory[]
  onEdit: (transaction: TransactionWithCategory) => void
  onDelete: (id: string) => void
}

export function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  const [showModal, setShowModal] = useState(false)

  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const date = format(parseISO(transaction.date), 'yyyy-MM-dd')
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(transaction)
    return acc
  }, {} as Record<string, TransactionWithCategory[]>)

  return (
    <div className="bg-white rounded-xl shadow-md">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Recent Transactions</h3>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {Object.keys(groupedTransactions).length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No transactions yet. Add your first transaction to get started!</p>
          </div>
        ) : (
          Object.entries(groupedTransactions)
            .sort(([a], [b]) => parseISO(b).getTime() - parseISO(a).getTime())
            .map(([date, dayTransactions]) => (
              <div key={date} className="border-b border-gray-100 last:border-b-0">
                <div className="bg-gray-50 px-6 py-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
                  </h4>
                </div>
                {dayTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium"
                        style={{ backgroundColor: transaction.category?.color || '#6b7280' }}
                      >
                        {transaction.type === 'income' ? '+' : '-'}₹{Number(transaction.amount).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                        <p className="text-sm text-gray-600">{transaction.category?.name}</p>
                        {transaction.notes && (
                          <p className="text-sm text-gray-500 italic">{transaction.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '-'}₹
                          {Number(transaction.amount).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => onEdit(transaction)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(transaction.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
        )}
      </div>

      {showModal && <TransactionModal onClose={() => setShowModal(false)} />}
    </div>
  )
}