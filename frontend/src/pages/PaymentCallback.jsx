import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../services/api'
import { toast } from 'react-toastify'

const PaymentCallback = () => {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('verifying')
  const [message, setMessage] = useState('Verifying your payment...')
  const navigate = useNavigate()

  useEffect(() => {
    verifyPayment()
  }, [])

  const verifyPayment = async () => {
    const reference = searchParams.get('reference')
    const type = searchParams.get('type') // 'wallet' or 'purchase'

    if (!reference) {
      setStatus('error')
      setMessage('Invalid payment reference')
      return
    }

    try {
      let response

      // Check if this is a wallet topup or a purchase
      if (type === 'wallet') {
        response = await api.post(`/wallet/verify-topup/${reference}`)

        if (response.data.message === 'Wallet topped up successfully') {
          setStatus('success')
          setMessage(`Wallet topped up successfully! New balance: GH₵${response.data.balance.toFixed(2)}`)
          toast.success('Wallet funded successfully!')

          setTimeout(() => {
            navigate('/wallet')
          }, 3000)
        } else {
          setStatus('failed')
          setMessage('Payment verification failed. Please contact support.')
          toast.error('Payment failed')
        }
      } else {
        // Regular purchase verification
        response = await api.get(`/payments/verify/${reference}`)

        if (response.data.status === 'success') {
          setStatus('success')
          setMessage('Payment successful! Your data will be delivered shortly.')
          toast.success('Payment verified successfully!')

          setTimeout(() => {
            navigate('/dashboard')
          }, 3000)
        } else {
          setStatus('failed')
          setMessage('Payment verification failed. Please contact support.')
          toast.error('Payment failed')
        }
      }
    } catch (error) {
      setStatus('error')
      setMessage(error.response?.data?.detail || 'Failed to verify payment')
      toast.error('Verification failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        {/* Currency display will use GH₵ when showing amounts */}
        {status === 'verifying' && (
          <div>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {(status === 'failed' || status === 'error') && (
          <div>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment {status === 'failed' ? 'Failed' : 'Error'}</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default PaymentCallback
