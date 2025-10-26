import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../services/api'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'

export default function ReferralsPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReferrals()
  }, [])

  const fetchReferrals = async () => {
    try {
      const res = await api.get('/users/referrals')
      setStats(res.data)
    } catch (error) {
      toast.error('Failed to load referrals')
    } finally {
      setLoading(false)
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(stats.referral_code)
    toast.success('Referral code copied!')
  }

  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900"><Navbar /><p className="text-center py-20 dark:text-white">Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Referral Program</h1>

        {/* Referral Code Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl p-8 mb-6 shadow-xl"
        >
          <p className="text-sm opacity-90">Your Referral Code</p>
          <div className="flex items-center justify-between mt-3">
            <h2 className="text-4xl font-bold">{stats.referral_code}</h2>
            <button
              onClick={copyCode}
              className="px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              📋 Copy
            </button>
          </div>
          <p className="text-sm mt-4 opacity-90">
            Earn GH₵2 for each friend who signs up with your code!
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <p className="text-gray-600 dark:text-gray-400">Total Referrals</p>
            <p className="text-4xl font-bold dark:text-white">{stats.total_referrals}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <p className="text-gray-600 dark:text-gray-400">Total Earned</p>
            <p className="text-4xl font-bold text-green-600">
              GH₵{stats.total_bonus.toFixed(2)}
            </p>
          </motion.div>
        </div>

        {/* Referral List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-semibold mb-4 dark:text-white">Your Referrals</h3>
          {stats.referrals.length > 0 ? (
            <div className="space-y-3">
              {stats.referrals.map((ref, idx) => (
                <div key={idx} className="flex justify-between items-center border-b dark:border-gray-700 pb-3">
                  <div>
                    <p className="font-medium dark:text-white">{ref.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{ref.email}</p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(ref.joined_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No referrals yet. Share your code to get started!</p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
