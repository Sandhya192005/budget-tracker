import { useState } from 'react'
import { DashboardStats } from './DashboardStats'
import { SpendingChart } from './SpendingChart'
import { BudgetOverview } from './BudgetOverview'
import { TransactionList } from '../Transactions/TransactionList'
import { TransactionModal } from '../Transactions/TransactionModal'
import { useData, TransactionWithCategory } from '../../context/DataContext'

export function Dashboard() {
  const { transactions, deleteTransaction } = useData()
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithCategory | null>(null)

  const handleEdit = (transaction: TransactionWithCategory) => {
    setEditingTransaction(transaction)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransaction(id)
    }
  }

  return (
    <div>
      <DashboardStats transactions={transactions} />
      <BudgetOverview transactions={transactions} />
      <SpendingChart transactions={transactions} />
      <TransactionList
        transactions={transactions}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {editingTransaction && (
        <TransactionModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </div>
  )
}
