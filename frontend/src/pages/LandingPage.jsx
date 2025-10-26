import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import api from '../services/api'
import { toast } from 'react-toastify'

const LandingPage = () => {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCustomRequestModal, setShowCustomRequestModal] = useState(false)
  const [displayLimit, setDisplayLimit] = useState(12) // Show 12 packages initially
  const [showCryptoModal, setShowCryptoModal] = useState(false)
  const [cryptoPaymentConfirmed, setCryptoPaymentConfirmed] = useState(false)
  const { isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Always fetch packages on landing page
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const response = await api.get('/packages')
      // Ensure response.data is an array
      if (Array.isArray(response.data)) {
        setPackages(response.data)
      } else {
        console.error('API returned non-array data:', response.data)
        setPackages([])
        toast.error('Invalid data format received from API')
      }
    } catch (error) {
      console.error('Failed to fetch packages:', error)
      setPackages([]) // Ensure packages is always an array

      // Better error messages
      if (error.code === 'ERR_NETWORK') {
        toast.error('Unable to connect to server. Please check your internet connection.')
      } else if (error.response) {
        toast.error(`Server error: ${error.response.status}. Please try again later.`)
      } else {
        toast.error('Failed to load packages. Please refresh the page.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleBuyNow = (pkg) => {
    if (!isAuthenticated) {
      toast.info('Please login to purchase data')
      navigate('/login')
      return
    }
    setSelectedPackage(pkg)
    setShowModal(true)
  }

  const handlePurchase = async () => {
    if (!phoneNumber) {
      toast.error('Please enter a phone number')
      return
    }

    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'paystack'

    if (paymentMethod === 'crypto') {
      setShowModal(false)
      setShowCryptoModal(true)
      return
    }

    try {
      const response = await api.post('/payments/initialize', {
        package_id: selectedPackage.id,
        recipient_phone: phoneNumber,
        payment_method: 'paystack'
      })

      // Redirect to Paystack payment page
      if (response.data.authorization_url) {
        window.location.href = response.data.authorization_url
      } else {
        toast.error('Payment URL not received from server')
      }
    } catch (error) {
      console.error('Payment initialization error:', error)
      toast.error(error.response?.data?.detail || 'Failed to initialize payment')
    }
  }

  const handleCryptoPayment = async () => {
    if (!cryptoPaymentConfirmed) {
      toast.error('Please confirm that you have made the payment')
      return
    }

    try {
      const response = await api.post('/payments/initialize', {
        package_id: selectedPackage.id,
        recipient_phone: phoneNumber,
        payment_method: 'crypto'
      })

      toast.success('Crypto payment request submitted! Admin will verify and process your order.')
      setShowCryptoModal(false)
      setCryptoPaymentConfirmed(false)
      setPhoneNumber('')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit crypto payment')
    }
  }

  const networks = ['All', 'MTN', 'Telecel', 'AirtelTigo']

  // Filter by network and search query
  const filteredPackages = Array.isArray(packages)
    ? packages
        .filter(pkg => selectedNetwork === 'All' || pkg.network === selectedNetwork)
        .filter(pkg => {
          if (!searchQuery) return true
          const query = searchQuery.toLowerCase()
          return (
            pkg.name?.toLowerCase().includes(query) ||
            pkg.data_size?.toLowerCase().includes(query) ||
            pkg.description?.toLowerCase().includes(query) ||
            pkg.price?.toString().includes(query)
          )
        })
    : []

  const getNetworkColor = (network) => {
    const colors = {
      'MTN': 'from-yellow-400 to-yellow-600',
      'Telecel': 'from-red-500 to-red-600',
      'AirtelTigo': 'from-blue-500 to-blue-600'
    }
    return colors[network] || 'from-gray-500 to-gray-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-6"
        >
          {/* Logo with pulse animation */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl blur-2xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-6 shadow-2xl">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Loading text */}
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-center"
          >
            <h2 className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              CheapData
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Ghana's #1 Data Hub</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Loading packages...</p>
          </motion.div>

          {/* Animated dots */}
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -10, 0],
                  backgroundColor: ['#6366f1', '#a855f7', '#6366f1']
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                className="w-3 h-3 rounded-full bg-indigo-600"
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-48 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="h-full w-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
            />
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left Side - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Fast Data Bundles
              </span>
              <br />
              <span className="text-gray-800 dark:text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
                For All Networks
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Get instant data for <span className="font-bold text-indigo-600 dark:text-indigo-400">MTN</span>, <span className="font-bold text-red-600 dark:text-red-400">Telecel</span> & <span className="font-bold text-blue-600 dark:text-blue-400">AirtelTigo</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {isAuthenticated ? (
                <Link to={isAdmin ? '/admin/dashboard' : '/dashboard'}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all"
                  >
                    Go to Dashboard →
                  </motion.button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all"
                    >
                      Get Started Now →
                    </motion.button>
                  </Link>
                  <Link to="/login">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 text-lg font-bold rounded-2xl border-2 border-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all"
                    >
                      Sign In
                    </motion.button>
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12">
              <div className="text-center lg:text-left">
                <div className="text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400">3</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Networks</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Support</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl md:text-4xl font-bold text-pink-600 dark:text-pink-400">⚡</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Instant</div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Modern Hero Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative">
              {/* Decorative Background Elements */}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full blur-3xl opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

              {/* Modern Card Design */}
              <div className="relative z-10 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
                {/* Network Icons Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* MTN Card */}
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl p-6 shadow-lg"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                        <span className="text-yellow-600 font-black text-lg">M</span>
                      </div>
                      <span className="text-white font-bold text-lg">MTN</span>
                    </div>
                    <p className="text-yellow-50 text-xs">Fast & Reliable</p>
                  </motion.div>

                  {/* Telecel Card */}
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 shadow-lg"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-black text-lg">T</span>
                      </div>
                      <span className="text-white font-bold text-lg">Telecel</span>
                    </div>
                    <p className="text-red-50 text-xs">Best Coverage</p>
                  </motion.div>

                  {/* AirtelTigo Card */}
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg col-span-2"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-black text-lg">A</span>
                      </div>
                      <span className="text-white font-bold text-lg">AirtelTigo</span>
                    </div>
                    <p className="text-blue-50 text-xs">Affordable Plans</p>
                  </motion.div>
                </div>

                {/* Feature Badges */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-green-700 dark:text-green-400">Instant Delivery</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-purple-700 dark:text-purple-400">100% Secure</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Separator */}
        <div className="relative py-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-6 py-2 bg-gradient-to-r from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-sm font-semibold text-gray-500 dark:text-gray-400">
              Browse Available Packages
            </span>
          </div>
        </div>

        {/* Search for Packages Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3">
              Search for Packages
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Find the perfect data bundle for your needs
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, data size, price, or network..."
                className="w-full px-6 py-5 pl-14 rounded-2xl border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:outline-none text-lg dark:bg-gray-800 dark:text-white shadow-lg transition-all"
              />
              <svg className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Filters and Actions Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 mb-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Network Filter Pills */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 self-center mr-2">Filter by:</span>
              {networks.map((network) => (
                <motion.button
                  key={network}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedNetwork(network)}
                  className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${
                    selectedNetwork === network
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {network}
                </motion.button>
              ))}
            </div>

            {/* Custom Request Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (!isAuthenticated) {
                  toast.info('Please login to make a custom request')
                  navigate('/login')
                  return
                }
                setShowCustomRequestModal(true)
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Custom Request
            </motion.button>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            {selectedNetwork === 'All' ? 'All Packages' : `${selectedNetwork} Packages`}
          </h2>
          <div className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
              {filteredPackages.length} {filteredPackages.length === 1 ? 'package' : 'packages'}
            </span>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPackages.slice(0, displayLimit).map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all ${
                  pkg.is_popular ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                {pkg.is_popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-semibold">
                      Popular
                    </span>
                  </div>
                )}

                {/* Network Badge */}
                <div className={`mb-4 inline-block px-3 py-1 rounded-lg bg-gradient-to-r ${getNetworkColor(pkg.network)} text-white text-sm font-semibold`}>
                  {pkg.network}
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{pkg.name}</h3>
                  <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    GH₵{pkg.price}
                  </div>
                  <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">{pkg.data_size}</p>
                </div>

                <div className="mb-4">
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{pkg.description}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Valid for {pkg.duration_days} days</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleBuyNow(pkg)}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    pkg.is_popular
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Buy Now
                </motion.button>
              </motion.div>
            ))}

            {filteredPackages.length === 0 && (
              <div className="text-center py-12 col-span-full">
                <p className="text-gray-500 dark:text-gray-400 text-lg">No packages available for {selectedNetwork}</p>
              </div>
            )}
          </div>

          {/* Show More Button */}
          {filteredPackages.length > displayLimit && (
            <div className="flex justify-center mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDisplayLimit(displayLimit + 12)}
                className="px-8 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors"
              >
                Show More ({filteredPackages.length - displayLimit} remaining)
              </motion.button>
            </div>
          )}

          {/* Show Less Button */}
          {displayLimit > 12 && filteredPackages.length > 12 && (
            <div className="flex justify-center mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDisplayLimit(12)}
                className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Show Less
              </motion.button>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              title: 'Instant Delivery',
              description: 'Get your data within minutes',
              icon: '⚡',
            },
            {
              title: 'Secure Payment',
              description: 'Paystack & Crypto supported',
              icon: '🔒',
            },
            {
              title: 'All Networks',
              description: 'MTN, Telecel, AirtelTigo',
              icon: '📡',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Purchase Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full"
          >
            <h3 className="text-2xl font-bold mb-4">Complete Your Purchase</h3>

            {/* Network Badge */}
            <div className={`mb-4 inline-block px-4 py-2 rounded-lg bg-gradient-to-r ${getNetworkColor(selectedPackage?.network)} text-white font-semibold`}>
              {selectedPackage?.network}
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-2">{selectedPackage?.name} - {selectedPackage?.data_size}</p>
              <p className="text-3xl font-bold text-indigo-600">GH₵{selectedPackage?.price}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paystack"
                    defaultChecked
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <span className="font-medium text-gray-900">Paystack (Instant)</span>
                    <p className="text-sm text-gray-500">Card, Mobile Money - Instant delivery</p>
                  </div>
                </label>
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="crypto"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <span className="font-medium text-gray-900">Cryptocurrency</span>
                    <p className="text-sm text-gray-500">Bitcoin, USDT - Processing takes time</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+233 XX XXX XXXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  setPhoneNumber('')
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow"
              >
                Proceed to Pay
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Custom Request Modal */}
      {showCustomRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-2xl font-bold mb-4">Custom Data Request</h3>
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? Tell us what you need and we'll get back to you with a price!
            </p>

            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              const customNetwork = formData.get('network')
              const customDataSize = formData.get('dataSize')
              const customPhone = formData.get('phone')
              const customDescription = formData.get('description')

              if (!customNetwork || !customDataSize || !customPhone) {
                toast.error('Please fill in all required fields')
                return
              }

              // Submit custom request
              api.post('/payments/initialize', {
                is_custom_request: true,
                custom_network: customNetwork,
                custom_data_size: customDataSize,
                custom_description: customDescription,
                recipient_phone: customPhone,
                payment_method: 'manual'
              })
              .then(() => {
                toast.success('Custom request submitted! Admin will contact you with pricing.')
                setShowCustomRequestModal(false)
                navigate('/dashboard')
              })
              .catch(error => {
                toast.error(error.response?.data?.detail || 'Failed to submit request')
              })
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Network <span className="text-red-500">*</span>
                </label>
                <select
                  name="network"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select Network</option>
                  <option value="MTN">MTN</option>
                  <option value="Telecel">Telecel</option>
                  <option value="AirtelTigo">AirtelTigo</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Size <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="dataSize"
                  required
                  placeholder="e.g., 10GB, 50GB, 100GB"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+233 XX XXX XXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Details (Optional)
                </label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Any specific requirements or preferences..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCustomRequestModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-shadow"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Crypto Payment Modal */}
      {showCryptoModal && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-2xl font-bold mb-4">₿ Cryptocurrency Payment</h3>

            {/* Order Summary */}
            <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Order Summary</h4>
              <p className="text-sm text-gray-600">Package: {selectedPackage.name} ({selectedPackage.data_size})</p>
              <p className="text-sm text-gray-600">Phone: {phoneNumber}</p>
              <p className="text-2xl font-bold text-indigo-600 mt-2">GH₵{selectedPackage.price}</p>
            </div>

            {/* Payment Instructions */}
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Important Instructions</h4>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                <li>Send the exact amount to the wallet address below</li>
                <li>Include your phone number in the transaction memo (if possible)</li>
                <li>Processing takes 1-24 hours after payment confirmation</li>
                <li>Payments are non-refundable once confirmed</li>
              </ul>
            </div>

            {/* Wallet Addresses */}
            <div className="mb-6 space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">Bitcoin (BTC)</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('bc1q..example..btc..address')
                      toast.success('BTC address copied!')
                    }}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-sm font-mono bg-white p-2 rounded border break-all">
                  bc1q..example..btc..address
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">USDT (TRC20)</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('TR7...example...usdt...address')
                      toast.success('USDT address copied!')
                    }}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-sm font-mono bg-white p-2 rounded border break-all">
                  TR7...example...usdt...address
                </p>
              </div>
            </div>

            {/* Confirmation Checkbox */}
            <div className="mb-6">
              <label className="flex items-start p-4 bg-red-50 border border-red-200 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={cryptoPaymentConfirmed}
                  onChange={(e) => setCryptoPaymentConfirmed(e.target.checked)}
                  className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <div className="ml-3">
                  <span className="font-medium text-red-900">I confirm that I have sent the payment</span>
                  <p className="text-sm text-red-700 mt-1">
                    I understand that this payment is non-refundable and will be processed after admin verification.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCryptoModal(false)
                  setCryptoPaymentConfirmed(false)
                  setShowModal(true)
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                Back
              </button>
              <button
                onClick={handleCryptoPayment}
                disabled={!cryptoPaymentConfirmed}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg transition-shadow font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Payment
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Brand Section */}
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg p-2 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  CheapData
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-4">Ghana's most trusted platform for affordable mobile data</p>
              <div className="flex gap-3 justify-center md:justify-start">
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-br hover:from-indigo-600 hover:to-purple-600 rounded-lg flex items-center justify-center transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-br hover:from-indigo-600 hover:to-purple-600 rounded-lg flex items-center justify-center transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-br hover:from-indigo-600 hover:to-purple-600 rounded-lg flex items-center justify-center transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Networks */}
            <div className="text-center">
              <h3 className="font-bold text-lg mb-4 text-white">Supported Networks</h3>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-full">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                  <span className="text-yellow-300 font-semibold">MTN Ghana</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 rounded-full">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span className="text-red-300 font-semibold">Telecel</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-full">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  <span className="text-blue-300 font-semibold">AirtelTigo</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="text-center md:text-right">
              <h3 className="font-bold text-lg mb-4 text-white">Quick Links</h3>
              <div className="space-y-2">
                <Link to="/faq" className="block text-gray-400 hover:text-indigo-400 transition-colors">FAQs</Link>
                <Link to="/help" className="block text-gray-400 hover:text-indigo-400 transition-colors">Help Center</Link>
                <Link to="/support" className="block text-gray-400 hover:text-indigo-400 transition-colors">Support</Link>
                <Link to="/login" className="block text-gray-400 hover:text-indigo-400 transition-colors">Login</Link>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">© 2025 CheapData Ghana. All rights reserved.</p>
              <div className="flex gap-6 text-sm text-gray-400">
                <a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-indigo-400 transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
