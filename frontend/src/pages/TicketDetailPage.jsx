import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { toast } from 'react-toastify';

const TicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  const fetchTicketDetails = async () => {
    try {
      const [ticketRes, messagesRes] = await Promise.all([
        api.get(`/support/tickets/${id}`),
        api.get(`/support/tickets/${id}/messages`)
      ]);
      setTicket(ticketRes.data);
      setMessages(messagesRes.data);
    } catch (error) {
      toast.error('Failed to load ticket details');
      navigate('/support');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await api.post(`/support/tickets/${id}/messages`, { message: newMessage });
      setNewMessage('');
      toast.success('Message sent!');
      fetchTicketDetails();
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return colors[status] || colors.open;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/support')}
        className="mb-4 text-blue-600 dark:text-blue-400 hover:underline"
      >
        ← Back to Tickets
      </button>

      {/* Ticket Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {ticket.subject}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ticket #{ticket.ticket_number}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
            {ticket.status.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Category</p>
            <p className="font-medium text-gray-900 dark:text-white capitalize">{ticket.category}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Priority</p>
            <p className="font-medium text-gray-900 dark:text-white capitalize">{ticket.priority}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Created</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {new Date(ticket.created_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Updated</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {new Date(ticket.updated_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Conversation</h2>

        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg ${
                msg.is_admin
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                  : 'bg-gray-50 dark:bg-gray-700'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {msg.is_admin ? 'Support Team' : 'You'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(msg.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{msg.message}</p>
            </motion.div>
          ))}
        </div>

        {/* Reply Form */}
        {ticket.status !== 'closed' && (
          <form onSubmit={handleSendMessage} className="border-t dark:border-gray-700 pt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Add a reply
            </label>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mb-3"
              placeholder="Type your message..."
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending...' : 'Send Reply'}
            </button>
          </form>
        )}

        {ticket.status === 'closed' && (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400 border-t dark:border-gray-700">
            This ticket is closed. Please create a new ticket if you need further assistance.
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetailPage;
