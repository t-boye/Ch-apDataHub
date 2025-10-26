import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../services/api'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'

export default function WalletPage() {
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [topupAmount, setTopupAmount] = useState('')

  useEffect(() => {
    fetchWallet()
  }, [])

  const fetchWallet = async () => {
    try {
      const res = await api.get('/users/wallet/balance')
      setBalance(res.data.balance)

      const txRes = await api.get('/users/wallet/transactions')
      setTransactions(txRes.data)
    } catch (error) {
      toast.error('Failed to load wallet')
    } finally {
      setLoading(false)
    }
  }

  const handleTopup = async () => {
    const amount = parseFloat(topupAmount)
    if (!amount || amount < 5) {
      toast.error('Minimum top-up is GH₵5')
      return
    }

    try {
      const res = await api.post('/wallet/topup', { amount })
      window.location.href = res.data.authorization_url
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Topup failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">My Wallet</h1>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-8 mb-6 shadow-xl"
        >
          <p className="text-sm opacity-90">Available Balance</p>
          <h2 className="text-5xl font-bold mt-2">GH₵{balance.toFixed(2)}</h2>
        </motion.div>

        {/* Top-up Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-lg"
        >
          <h3 className="text-xl font-semibold mb-4 dark:text-white">Top Up Wallet</h3>
          <div className="flex gap-4">
            <input
              type="number"
              value={topupAmount}
              onChange={(e) => setTopupAmount(e.target.value)}
              placeholder="Amount (GH₵)"
              className="flex-1 px-4 py-3 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500"
              min="5"
            />
            <button
              onClick={handleTopup}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
            >
              Top Up
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Minimum: GH₵5</p>
        </motion.div>

        {/* Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-semibold mb-4 dark:text-white">Transaction History</h3>
          {loading ? (
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          ) : transactions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center border-b dark:border-gray-700 pb-3">
                  <div>
                    <p className="font-medium dark:text-white">{tx.description}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className={`font-bold text-lg ${
                    tx.transaction_type === 'credit' || tx.transaction_type === 'bonus'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {tx.transaction_type === 'credit' || tx.transaction_type === 'bonus' ? '+' : '-'}
                    GH₵{tx.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
