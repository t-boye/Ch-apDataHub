import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import api from '../services/api'
import { toast } from 'react-toastify'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({})
  const [purchases, setPurchases] = useState([])
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPackageModal, setShowPackageModal] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)
  const { user } = useAuth()

  const [packageForm, setPackageForm] = useState({
    name: '',
    data_size: '',
    price: '',
    duration_days: 30,
    description: '',
    network: 'MTN',
    is_popular: false,
  })

  const [lastPurchaseCount, setLastPurchaseCount] = useState(0)
  const [selectedPackages, setSelectedPackages] = useState([])
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)

  useEffect(() => {
    fetchData()

    // Poll for new purchases every 10 seconds
    const interval = setInterval(async () => {
      try {
        const res = await api.get('/admin/purchases')
        const newPurchases = res.data

        // Check if there are new purchases
        if (newPurchases.length > lastPurchaseCount && lastPurchaseCount > 0) {
          const newCount = newPurchases.length - lastPurchaseCount
          const latestPurchase = newPurchases[0]

          // Show toast notification for new purchase
          toast.info(
            `🛒 New purchase! ${latestPurchase.package_name || 'Custom Request'} - GH₵${latestPurchase.amount}`,
            {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          )

          // Play notification sound (optional)
          try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDGH0fPTgjMGHm7A7+OZSA0PVKni8KJZFA1Dpd/xwW0gBDWO1PLPfy4HKn7K7+KWRg0RXLXq7qdZFAxEp+DyvmwhBDGH0fPTgjMGHm7A7+OZSAwPVKni8KJZFA1Dpd/xwW0gBDWO1PLPfy4HKn7K7+KWRg0RXLXq7qdZFAxEp+DyvmwhBDGH0fPTgjMGHm7A7+OZSAwPVKni8KJZFA1Dpd/xwW0gBDWO1PLPfy4HKn7K7+KWRg0RXLXq7qdZFAxEp+DyvmwhBDGH0fPTgjMGHm7A7+OZSAwPVKni8KJZFA1Dpd/xwW0gBDWO1PLPfy4HKn7K7+KWRg0RXLXq7qdZFAxEp+DyvmwhBDGH0fPTgjMGHm7A7+OZSAwPVKni8KJZFA1Dpd/xwW0gBDWO1PLPfy4HKn7K7+KWRg0RXLXq7qdZFAxEp+DyvmwhBDGH0fPTgjMGHm7A7+OZSAwPVKni8KJZFA1Dpd/xwW0gBDWO1PLPfy4HKn7K7+KWRg0RXLXq7qdZFAxEp+DyvmwhBDGH0fPTgjMGHm7A7+OZSAwPVKni8KJZFA1Dpd/xwW0gBDWO1PLPfy4HKn7K7+KWRg0RXLXq7qdZFAxEp+DyvmwhBDGH0fPTgjMGHm7A7+OZSAwPVKni8KJZFA1Dpd/xwW0gBDWO1PLPfy4HKn7K7+KWRg0RXLXq7qdZFAxEp+DyvmwhBDGH0fPTgjMGHm7A7+OZSAwPVKni8KJZ')
            audio.play().catch(() => {}) // Ignore if sound fails
          } catch (e) {
            // Ignore sound errors
          }
        }

        setLastPurchaseCount(newPurchases.length)
        setPurchases(newPurchases)
      } catch (error) {
        // Silently fail - don't show error for background polling
      }
    }, 10000) // Poll every 10 seconds

    return () => clearInterval(interval)
  }, [lastPurchaseCount])

  const fetchData = async () => {
    try {
      const [statsRes, purchasesRes, packagesRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/purchases'),
        api.get('/packages'),
      ])

      setStats(statsRes.data)
      setPurchases(purchasesRes.data)
      setPackages(packagesRes.data)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (purchaseId, newStatus) => {
    try {
      await api.put(`/admin/purchases/${purchaseId}`, { request_status: newStatus })
      toast.success('Status updated successfully')
      fetchData()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleCreatePackage = async (e) => {
    e.preventDefault()
    try {
      if (editingPackage) {
        await api.put(`/admin/packages/${editingPackage.id}`, packageForm)
        toast.success('Package updated successfully')
      } else {
        await api.post('/admin/packages', packageForm)
        toast.success('Package created successfully')
      }
      setShowPackageModal(false)
      setEditingPackage(null)
      setPackageForm({
        name: '',
        data_size: '',
        price: '',
        duration_days: 30,
        description: '',
        network: 'MTN',
        is_popular: false,
      })
      fetchData()
    } catch (error) {
      toast.error('Failed to save package')
    }
  }

  const handleEditPackage = (pkg) => {
    setEditingPackage(pkg)
    setPackageForm({
      name: pkg.name,
      data_size: pkg.data_size,
      price: pkg.price,
      duration_days: pkg.duration_days,
      description: pkg.description || '',
      network: pkg.network || 'MTN',
      is_popular: pkg.is_popular,
    })
    setShowPackageModal(true)
  }

  const handleDeletePackage = async (packageId) => {
    if (!confirm('Are you sure you want to delete this package?')) return

    try {
      await api.delete(`/admin/packages/${packageId}`)
      toast.success('Package deleted successfully')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete package')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedPackages.length === 0) {
      toast.error('Please select packages to delete')
      return
    }

    try {
      await api.post('/admin/packages/bulk/delete', {
        package_ids: selectedPackages
      })
      toast.success(`Successfully deleted ${selectedPackages.length} package(s)`)
      setSelectedPackages([])
      setShowBulkDeleteConfirm(false)
      fetchData()
    } catch (error) {
      toast.error('Failed to delete packages')
    }
  }

  const handleDeleteAllPackages = async () => {
    if (!confirm('⚠️ WARNING: This will delete ALL active packages! Are you absolutely sure?')) return
    if (!confirm('This action cannot be undone. Type DELETE to confirm.')) return

    try {
      await api.delete('/admin/packages/all/delete')
      toast.success('All packages deleted successfully')
      setSelectedPackages([])
      fetchData()
    } catch (error) {
      toast.error('Failed to delete all packages')
    }
  }

  const togglePackageSelection = (packageId) => {
    if (selectedPackages.includes(packageId)) {
      setSelectedPackages(selectedPackages.filter(id => id !== packageId))
    } else {
      setSelectedPackages([...selectedPackages, packageId])
    }
  }

  const toggleSelectAll = () => {
    if (selectedPackages.length === packages.length) {
      setSelectedPackages([])
    } else {
      setSelectedPackages(packages.map(pkg => pkg.id))
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      success: 'bg-green-100 text-green-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl md:rounded-2xl p-6 md:p-8 text-white shadow-xl"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                Admin Dashboard 👨‍💼
              </h1>
              <p className="text-indigo-100 text-sm sm:text-base lg:text-lg">
                Manage your CheapData platform and operations
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm sm:text-base">
              <span className="px-3 py-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                {user?.email}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {[
            { label: 'Total Revenue', value: `GH₵${stats.total_revenue?.toFixed(2) || 0}`, icon: '💰', gradient: 'from-green-500 to-green-600', bgGradient: 'from-green-50 to-green-100' },
            { label: 'Total Purchases', value: stats.total_purchases || 0, icon: '📦', gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100' },
            { label: 'Active Users', value: stats.total_users || 0, icon: '👥', gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100' },
            { label: 'Pending Requests', value: stats.pending_requests || 0, icon: '⏳', gradient: 'from-yellow-500 to-yellow-600', bgGradient: 'from-yellow-50 to-yellow-100' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br ${stat.bgGradient || 'from-gray-50 to-gray-100'} rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all p-4 md:p-6 border border-white/50`}
            >
              <div className="flex flex-col gap-3">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-xl md:text-2xl shadow-md`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className={`text-2xl md:text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              {['Overview', 'Purchases', 'Packages'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.toLowerCase()
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Platform Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed Requests</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.completed_requests || 0}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Packages</p>
                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stats.total_packages || 0}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'purchases' && (
              <div>
                <h3 className="text-lg font-semibold mb-4 dark:text-white">All Purchases</h3>
                {purchases.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">No purchases yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Reference</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">User</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Package</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Phone</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Payment</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {purchases.map((purchase) => (
                          <tr key={purchase.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-4 py-4 text-sm font-mono dark:text-gray-300">{purchase.reference.substring(0, 15)}...</td>
                            <td className="px-4 py-4 text-sm dark:text-gray-300">{purchase.user_email}</td>
                            <td className="px-4 py-4 text-sm dark:text-gray-300">{purchase.package_name}</td>
                            <td className="px-4 py-4 text-sm dark:text-gray-300">{purchase.recipient_phone}</td>
                            <td className="px-4 py-4 text-sm font-semibold dark:text-gray-200">GH₵{purchase.amount}</td>
                            <td className="px-4 py-4">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(purchase.payment_status)}`}>
                                {purchase.payment_status}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(purchase.request_status)}`}>
                                {purchase.request_status}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              {purchase.payment_status === 'success' && purchase.request_status !== 'completed' && (
                                <select
                                  value={purchase.request_status}
                                  onChange={(e) => handleUpdateStatus(purchase.id, e.target.value)}
                                  className="text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded px-2 py-1"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="processing">Processing</option>
                                  <option value="completed">Completed</option>
                                  <option value="failed">Failed</option>
                                </select>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'packages' && (
              <div>
                <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold dark:text-white">
                    Data Packages {selectedPackages.length > 0 && `(${selectedPackages.length} selected)`}
                  </h3>
                  <div className="flex gap-2">
                    {selectedPackages.length > 0 && (
                      <>
                        <button
                          onClick={() => setShowBulkDeleteConfirm(true)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          Delete Selected ({selectedPackages.length})
                        </button>
                        <button
                          onClick={() => setSelectedPackages([])}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                        >
                          Clear Selection
                        </button>
                      </>
                    )}
                    <button
                      onClick={toggleSelectAll}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                      {selectedPackages.length === packages.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <button
                      onClick={handleDeleteAllPackages}
                      className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm"
                    >
                      Delete All
                    </button>
                    <button
                      onClick={() => {
                        setEditingPackage(null)
                        setShowPackageModal(true)
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                    >
                      Add Package
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {packages.map((pkg) => (
                    <div key={pkg.id} className={`border rounded-lg p-4 dark:bg-gray-700 transition-all ${
                      selectedPackages.includes(pkg.id)
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-600'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-lg dark:text-white">{pkg.name}</h4>
                        {pkg.is_popular && (
                          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Popular</span>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">GH₵{pkg.price}</p>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">{pkg.data_size}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs mb-4">{pkg.description}</p>
                      <div className="flex gap-2">
                        <input
                          type="checkbox"
                          checked={selectedPackages.includes(pkg.id)}
                          onChange={() => togglePackageSelection(pkg.id)}
                          className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <button
                          onClick={() => handleEditPackage(pkg)}
                          className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-500"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="flex-1 px-3 py-2 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Package Modal */}
      {showPackageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full"
          >
            <h3 className="text-2xl font-bold mb-4 dark:text-white">{editingPackage ? 'Edit Package' : 'Create Package'}</h3>
            <form onSubmit={handleCreatePackage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={packageForm.name}
                  onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Size</label>
                <input
                  type="text"
                  value={packageForm.data_size}
                  onChange={(e) => setPackageForm({ ...packageForm, data_size: e.target.value })}
                  required
                  placeholder="e.g., 1GB, 5GB"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (GH₵)</label>
                <input
                  type="number"
                  value={packageForm.price}
                  onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                  required
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (days)</label>
                <input
                  type="number"
                  value={packageForm.duration_days}
                  onChange={(e) => setPackageForm({ ...packageForm, duration_days: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Network</label>
                <select
                  value={packageForm.network}
                  onChange={(e) => setPackageForm({ ...packageForm, network: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="MTN">MTN</option>
                  <option value="Telecel">Telecel</option>
                  <option value="AirtelTigo">AirtelTigo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={packageForm.description}
                  onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={packageForm.is_popular}
                  onChange={(e) => setPackageForm({ ...packageForm, is_popular: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Mark as popular</label>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPackageModal(false)
                    setEditingPackage(null)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {editingPackage ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold mb-2 dark:text-white">Confirm Bulk Delete</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete {selectedPackages.length} selected package(s)? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBulkDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete {selectedPackages.length}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
