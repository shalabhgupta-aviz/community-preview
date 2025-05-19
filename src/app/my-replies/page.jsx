'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ProtectedRoute from '../../components/ProtectedRoute';
import Link from 'next/link';
import { getRepliesByUser } from '../../lib/users';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../../components/LoadingSpinner';

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');

export default function MyRepliesPage() {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        if (!user?.id) return;
        console.log("user", user);
        const { items, totalPages: total } = await getRepliesByUser(user.username, page);
        console.log("items", items);
        setReplies(prev => page === 1 ? items : [...prev, ...items]);
        setTotalPages(total);
      } catch (err) {
        setError('Failed to load replies');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchReplies();
    }
  }, [user, page]);

  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (loading && page === 1) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  const filteredReplies = replies.filter(reply => {
    const searchLower = searchTerm.toLowerCase();
    return (
      reply.title.rendered.toLowerCase().includes(searchLower) ||
      reply.content.rendered.toLowerCase().includes(searchLower)
    );
  });

  return (
    <ProtectedRoute>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto p-4"
      >
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-bold mb-6"
        >
          My Replies
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <input
            type="text"
            placeholder="Search replies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div
              key="searching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center p-4"
            >
              <LoadingSpinner />
            </motion.div>
          ) : filteredReplies.length === 0 ? (
            <motion.p 
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-gray-500"
            >
              {searchTerm ? 'No replies match your search' : "You haven't made any replies yet"}
            </motion.p>
          ) : (
            <motion.div 
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {filteredReplies.map((reply, index) => (
                <motion.div
                  key={reply.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Link
                    href={{
                      pathname: `/questions/${reply.topic_id}`,
                      query: { replyId: reply.id }
                    }}
                    className="block bg-white p-6 rounded-lg shadow-sm border hover:border-gray-300"
                  >
                    <h3 className="font-bold text-lg mb-2 text-black">{reply.title.rendered}</h3>
                    <div className="text-gray-600 mb-4" dangerouslySetInnerHTML={{ __html: reply.content.rendered }} />
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div>
                        {timeAgo.format(new Date(reply.date))}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}

              {!searchTerm && page < totalPages && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => setPage(prev => prev + 1)}
                  className="w-full p-2 text-blue-500 border border-blue-500 rounded hover:bg-blue-50"
                >
                  Load more replies
                </motion.button>
              )}

              {loading && page > 1 && (
                <div className="flex justify-center p-4">
                  <LoadingSpinner />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </ProtectedRoute>
  );
}
