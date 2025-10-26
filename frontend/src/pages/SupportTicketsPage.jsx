import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../services/api'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const { user } = useAuth()

  // Create ticket form
  const [createForm, setCreateForm] = useState({
    subject: '',
    category: 'general',
    message: '',
    priority: 'normal'
  })

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const endpoint = user?.is_admin ? '/support/admin/tickets' : '/support/tickets'
      const res = await api.get(endpoint)
      setTickets(res.data)
    } catch (error) {
      toast.error('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  const createTicket = async (e) => {
    e.preventDefault()

    if (!createForm.subject || !createForm.message) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      await api.post('/support/tickets', createForm)
      toast.success('Ticket created successfully')
      setShowCreateModal(false)
      setCreateForm({ subject: '', category: 'general', message: '', priority: 'normal' })
      fetchTickets()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create ticket')
    }
  }

  const addMessage = async (e) => {
    e.preventDefault()

    if (!newMessage.trim()) {
      toast.error('Message cannot be empty')
      return
    }

    try {
      await api.post(`/support/tickets/${selectedTicket.id}/messages`, {
        message: newMessage
      })
      toast.success('Message sent')
      setNewMessage('')

      // Reload ticket details
      const res = await api.get(`/support/tickets/${selectedTicket.id}`)
      setSelectedTicket(res.data)
      fetchTickets()
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  const updateTicketStatus = async (ticketId, status) => {
    try {
      await api.put(`/support/admin/tickets/${ticketId}`, { status })
      toast.success('Status updated')
      fetchTickets()
      if (selectedTicket?.id === ticketId) {
        const res = await api.get(`/support/tickets/${ticketId}`)
        setSelectedTicket(res.data)
      }
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
    return colors[status] || colors.open
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }
    return colors[priority] || colors.normal
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold dark:text-white">Support Tickets</h1>
          {!user?.is_admin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
            >
              + Create Ticket
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-semibold dark:text-white mb-4">
              {user?.is_admin ? 'All Tickets' : 'My Tickets'}
            </h2>

            {loading ? (
              <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            ) : tickets.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No tickets yet</p>
            ) : (
              tickets.map((ticket) => (
                <motion.div
                  key={ticket.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`bg-white dark:bg-gray-800 rounded-lg p-4 cursor-pointer border-2 transition-all ${
                    selectedTicket?.id === ticket.id
                      ? 'border-indigo-600 shadow-lg'
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold dark:text-white">{ticket.subject}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {ticket.ticket_number}
                  </p>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className="px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                      {ticket.category}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Ticket Details */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold dark:text-white mb-2">
                      {selectedTicket.subject}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ticket #{selectedTicket.ticket_number}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status}
                    </span>
                    {user?.is_admin && (
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)}
                        className="px-3 py-1 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {selectedTicket.messages?.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-lg ${
                        msg.is_admin_reply
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 ml-8'
                          : 'bg-gray-50 dark:bg-gray-700 mr-8'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold dark:text-white">
                          {msg.is_admin_reply ? 'Support Team' : 'You'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(msg.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{msg.message}</p>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                {selectedTicket.status !== 'closed' && (
                  <form onSubmit={addMessage} className="border-t dark:border-gray-700 pt-4">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows="3"
                      className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      className="mt-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-12 shadow-lg text-center">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  Select a ticket to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Create Support Ticket</h2>

            <form onSubmit={createTicket}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-white">Subject *</label>
                  <input
                    type="text"
                    value={createForm.subject}
                    onChange={(e) => setCreateForm({...createForm, subject: e.target.value})}
                    className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-white">Category</label>
                    <select
                      value={createForm.category}
                      onChange={(e) => setCreateForm({...createForm, category: e.target.value})}
                      className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                      <option value="general">General</option>
                      <option value="payment">Payment</option>
                      <option value="technical">Technical</option>
                      <option value="account">Account</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-white">Priority</label>
                    <select
                      value={createForm.priority}
                      onChange={(e) => setCreateForm({...createForm, priority: e.target.value})}
                      className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-white">Message *</label>
                  <textarea
                    value={createForm.message}
                    onChange={(e) => setCreateForm({...createForm, message: e.target.value})}
                    rows="4"
                    className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Create Ticket
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
