import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { toast } from 'react-toastify';

const ArticleViewPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    try {
      const response = await api.get(`/help/articles/${slug}`);
      setArticle(response.data);
    } catch (error) {
      toast.error('Article not found');
      navigate('/help');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'getting-started': '🚀',
      'payments': '💳',
      'account': '👤',
      'technical': '⚙️',
      'guides': '📚',
      'troubleshooting': '🔧'
    };
    return icons[category] || '📄';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/help')}
        className="mb-6 text-blue-600 dark:text-blue-400 hover:underline"
      >
        ← Back to Help Center
      </button>

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
          <div className="text-5xl mb-4">{getCategoryIcon(article.category)}</div>
          <h1 className="text-3xl font-bold mb-2">{article.title}</h1>
          <div className="flex items-center space-x-4 text-sm opacity-90">
            <span className="capitalize">{article.category.replace('-', ' ')}</span>
            <span>•</span>
            <span>{article.view_count} views</span>
            <span>•</span>
            <span>{new Date(article.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="prose dark:prose-invert max-w-none">
            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {article.content}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Was this article helpful?
            </h3>
            <div className="flex justify-center space-x-3">
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition">
                👍 Yes
              </button>
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">
                👎 No
              </button>
            </div>
          </div>
        </div>
      </motion.article>

      {/* Support CTA */}
      <div className="mt-8 bg-blue-50 dark:bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-700 dark:text-gray-300 mb-3">
          Still need help? Contact our support team
        </p>
        <a
          href="/support"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          Create Support Ticket
        </a>
      </div>
    </div>
  );
};

export default ArticleViewPage;
