import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../services/api'
import { toast } from 'react-toastify'

const UserDashboard = () => {
  const [purchases, setPurchases] = useState([])
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, spent: 0 })
  const [walletBalance, setWalletBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, completed, failed
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchPurchases()
    fetchWalletBalance()
  }, [])

  const fetchPurchases = async () => {
    try {
      const response = await api.get('/users/purchases')
      setPurchases(response.data)

      // Calculate stats
      const total = response.data.length
      const pending = response.data.filter((p) => p.request_status === 'pending' || p.request_status === 'processing').length
      const completed = response.data.filter((p) => p.request_status === 'completed').length
      const spent = response.data
        .filter((p) => p.payment_status === 'success')
        .reduce((sum, p) => sum + p.amount, 0)

      setStats({ total, pending, completed, spent })
    } catch (error) {
      toast.error('Failed to load purchases')
    } finally {
      setLoading(false)
    }
  }

  const fetchWalletBalance = async () => {
    try {
      const response = await api.get('/users/wallet/balance')
      setWalletBalance(response.data.balance)
    } catch (error) {
      console.error('Failed to load wallet balance')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      success: 'bg-green-100 text-green-800 border-green-200',
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      processing: '🔄',
      completed: '✅',
      failed: '❌',
      success: '✅',
    }
    return icons[status] || '📄'
  }

  const filteredPurchases = purchases.filter(p => {
    if (filter === 'all') return true
    if (filter === 'pending') return p.request_status === 'pending' || p.request_status === 'processing'
    if (filter === 'completed') return p.request_status === 'completed'
    if (filter === 'failed') return p.request_status === 'failed'
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Gradient */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl md:rounded-2xl p-6 md:p-8 text-white shadow-xl"
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                Welcome back, {user?.full_name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-indigo-100 text-sm sm:text-base lg:text-lg">
                Here's an overview of your data purchases and activity
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="hidden md:flex items-center gap-2 px-6 lg:px-8 py-3 bg-white text-indigo-600 rounded-xl font-bold shadow-lg hover:shadow-2xl transition-all whitespace-nowrap"
            >
              🛒 Buy More Data
            </motion.button>
          </div>
        </motion.div>

        {/* Mobile Buy Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/')}
          className="md:hidden w-full mb-6 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg"
        >
          🛒 Buy More Data
        </motion.button>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {/* Wallet Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
            onClick={() => navigate('/wallet')}
            className="cursor-pointer col-span-2 lg:col-span-1 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-700 dark:to-purple-800 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
            <h3 className="text-sm font-medium text-purple-100 mb-1">Wallet Balance</h3>
            <p className="text-3xl font-bold">GH₵{walletBalance.toFixed(2)}</p>
            <p className="text-xs text-purple-200 mt-2">Click to add funds</p>
          </motion.div>

          {[
            {
              label: 'Total Orders',
              value: stats.total,
              icon: '📦',
              gradient: 'from-blue-500 to-blue-600',
              bgGradient: 'from-blue-50 to-blue-100',
              iconBg: 'bg-blue-500'
            },
            {
              label: 'In Progress',
              value: stats.pending,
              icon: '⏳',
              gradient: 'from-yellow-500 to-yellow-600',
              bgGradient: 'from-yellow-50 to-yellow-100',
              iconBg: 'bg-yellow-500'
            },
            {
              label: 'Completed',
              value: stats.completed,
              icon: '✅',
              gradient: 'from-green-500 to-green-600',
              bgGradient: 'from-green-50 to-green-100',
              iconBg: 'bg-green-500'
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br ${stat.bgGradient} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-white/50`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`${stat.iconBg} w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-md`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Purchase History Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Purchase History</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Track all your data purchases</p>
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: 'All', value: 'all', count: stats.total },
                  { label: 'Pending', value: 'pending', count: stats.pending },
                  { label: 'Completed', value: 'completed', count: stats.completed },
                  { label: 'Failed', value: 'failed', count: purchases.filter(p => p.request_status === 'failed').length },
                ].map((btn) => (
                  <button
                    key={btn.value}
                    onClick={() => setFilter(btn.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filter === btn.value
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {btn.label} ({btn.count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredPurchases.length === 0 ? (
            <div className="p-16 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600 dark:text-gray-400 text-xl font-medium mb-2">No {filter !== 'all' ? filter : ''} purchases yet</p>
              <p className="text-gray-400 dark:text-gray-500">Your purchase history will appear here</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/')}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold"
              >
                Browse Packages
              </motion.button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Desktop Table View */}
              <table className="hidden md:table w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Package
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredPurchases.map((purchase, idx) => (
                    <motion.tr
                      key={purchase.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-mono text-gray-900 dark:text-white font-medium">
                          {purchase.reference.substring(0, 16)}...
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          📱 {purchase.recipient_phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {purchase.is_custom_request ? (
                            <>
                              <span className="text-purple-600 dark:text-purple-400">🎯 Custom Request</span>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {purchase.custom_data_size} • {purchase.custom_network}
                              </div>
                            </>
                          ) : (
                            purchase.package_name
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                          GH₵{purchase.amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-full border ${getStatusColor(purchase.payment_status)}`}>
                          {getStatusIcon(purchase.payment_status)}
                          {purchase.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-full border ${getStatusColor(purchase.request_status)}`}>
                          {getStatusIcon(purchase.request_status)}
                          {purchase.request_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(purchase.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Card View */}
              <div className="md:hidden p-4 space-y-4">
                {filteredPurchases.map((purchase, idx) => (
                  <motion.div
                    key={purchase.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border-2 border-gray-100 dark:border-gray-600 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="text-xs font-mono text-gray-500 dark:text-gray-400 mb-1">
                          {purchase.reference.substring(0, 20)}...
                        </div>
                        <div className="font-bold text-gray-900 dark:text-white">
                          {purchase.is_custom_request ? (
                            <span className="text-purple-600 dark:text-purple-400">🎯 Custom: {purchase.custom_data_size}</span>
                          ) : (
                            purchase.package_name
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                          GH₵{purchase.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-gray-400">📱</span>
                        <span className="text-gray-700 dark:text-gray-300">{purchase.recipient_phone}</span>
                      </div>

                      <div className="flex gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-lg border ${getStatusColor(purchase.payment_status)}`}>
                          {getStatusIcon(purchase.payment_status)} {purchase.payment_status}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-lg border ${getStatusColor(purchase.request_status)}`}>
                          {getStatusIcon(purchase.request_status)} {purchase.request_status}
                        </span>
                      </div>

                      <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-600">
                        📅 {new Date(purchase.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default UserDashboard
