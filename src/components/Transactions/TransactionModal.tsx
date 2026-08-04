import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, Save } from 'lucide-react'
import { useData, TransactionWithCategory } from '../../context/DataContext'
import { format, parseISO } from 'date-fns'

interface TransactionModalProps {
  onClose: () => void
  transaction?: TransactionWithCategory
}

interface TransactionFormData {
  type: 'income' | 'expense'
  categoryId: string
  amount: number
  description: string
  notes: string
  date: string
}

export function TransactionModal({ onClose, transaction }: TransactionModalProps) {
  const { addTransaction, updateTransaction, categories } = useData()
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<'income' | 'expense'>(
    transaction?.type || 'expense'
  )

  const { register, handleSubmit, formState: { errors }, watch } = useForm<TransactionFormData>({
    defaultValues: {
      type: transaction?.type || 'expense',
      categoryId: transaction?.categoryId || '',
      amount: transaction?.amount || 0,
      description: transaction?.description || '',
      notes: transaction?.notes || '',
      date: transaction?.date ? format(parseISO(transaction.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    }
  })

  const watchType = watch('type')
  
  useEffect(() => {
    setSelectedType(watchType)
  }, [watchType])

  const filteredCategories = categories.filter(cat => cat.type === selectedType)

  const onSubmit = async (data: TransactionFormData) => {
    setLoading(true)
    try {
      const parsedData = {
        ...data,
        amount: parseFloat(String(data.amount)) || 0,
        notes: data.notes || null,
      }
      if (transaction) {
        await updateTransaction(transaction.id, parsedData)
      } else {
        await addTransaction(parsedData)
      }
      onClose()
    } catch (error) {
      console.error('Error saving transaction:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="cursor-pointer">
                <input
                  {...register('type', { required: 'Type is required' })}
                  type="radio"
                  value="expense"
                  className="sr-only"
                />
                <div className={`p-3 text-center rounded-lg border-2 transition-colors ${
                  selectedType === 'expense'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
                  Expense
                </div>
              </label>
              <label className="cursor-pointer">
                <input
                  {...register('type', { required: 'Type is required' })}
                  type="radio"
                  value="income"
                  className="sr-only"
                />
                <div className={`p-3 text-center rounded-lg border-2 transition-colors ${
                  selectedType === 'income'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
                  Income
                </div>
              </label>
            </div>
            {errors.type && (
              <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              {...register('categoryId', { required: 'Category is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Select a category</option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
              <input
                {...register('amount', { 
                  required: 'Amount is required',
                  min: { value: 0.01, message: 'Amount must be greater than 0' }
                })}
                type="number"
                step="0.01"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              {...register('description', { required: 'Description is required' })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter transaction description"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              {...register('date', { required: 'Date is required' })}
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              {...register('notes')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              rows={3}
              placeholder="Add any additional notes..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}