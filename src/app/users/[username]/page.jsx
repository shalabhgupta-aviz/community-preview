'use client'
import React, { useState, useEffect } from 'react'
import { getUserByUsername } from '../../../lib/users'
import Link from 'next/link'
import { motion } from 'framer-motion'
import LoadingSpinner from '../../../components/LoadingSpinner'
import { FaCalendarAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'

export default function UserProfile({ params }) {
  const { username } = React.use(params)

  const [user, setUser]               = useState(null)
  const [topics, setTopics]           = useState([])
  const [replies, setReplies]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [topicPage, setTopicPage]     = useState(1)
  const [replyPage, setReplyPage]     = useState(1)
  const [topicTotalPages, setTopicTotalPages] = useState(1)
  const [replyTotalPages, setReplyTotalPages] = useState(1)
  const [activeTab, setActiveTab]     = useState('topics')

  // 1) initial load of page 1 /users
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const res = await getUserByUsername(username, 1, 1, 5);
        if (res.status === 200) {
          const u = res.data;  
        // Dynamically map user response
        const mappedUser = {
          avatar: u.profile.avatar,
          name: u.profile.name,
          description: u.profile.bio,
          url: u.profile.url,
          email: u.profile.email,
          joined_date: u.profile.registered,
          location: u.profile.location || 'Not specified',
        };

        setUser(mappedUser);
        setTopics(u.topics);
        setReplies(u.replies.map(reply => ({
          id: reply.id,
          topicTitle: reply.topic_title,
          topicId: reply.topic_id,
          date: reply.date,
          content: reply.content,
          link: reply.link,
          topicSlug: reply.topic_slug,
        })));
        setTopicTotalPages(u.topics_pagination.total_pages);
        setReplyTotalPages(u.replies_pagination.total_pages);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  // 2) load more topics
  useEffect(() => {
    const fetchMoreTopics = async () => {
      if (topicPage === 1) return;
      try {
        const res = await getUserByUsername(username, topicPage, 1);
        const data = res.data;
        if (res.status === 200) {
          setTopics(prev => [...prev, ...data.topics]);
          setTopicTotalPages(data.topics_pagination.total_pages);
        }
      } catch (error) {
        console.error('Failed to load more topics:', error);
        setError('Failed to load more topics');
      }
    };

    fetchMoreTopics();
  }, [topicPage, username]);

  // 3) load more replies
  useEffect(() => {
    const fetchMoreReplies = async () => {
      if (replyPage === 1) return;
      try {
        const res = await getUserByUsername(username, 1, replyPage);
        const data = res.data;
        if (res.status === 200) {
          setReplies(prev => [...prev, ...data.replies.map(reply => ({
            id: reply.id,
            topicTitle: reply.topic_title,
            topicId: reply.topic_id,
            date: reply.date,
            content: reply.content,
          link: reply.link,
          topicSlug: reply.topic_slug,
        }))]);
          setReplyTotalPages(data.replies_pagination.total_pages);
        }
      } catch (error) {
        console.error('Failed to load more replies:', error);
        setError('Failed to load more replies');
      }
    };

    fetchMoreReplies();
  }, [replyPage, username]);

  if (loading) return <LoadingSpinner />
  if (error)   return <p className="text-red-500">{error}</p>
  if (!user)   return <p>User not found</p>

  return (
    <div className="p-4 max-w-3xl mx-auto mt-8 mb-8">
      {/* Profile Header */}
      <motion.div 
        className="flex items-center gap-6 mb-8 p-6 bg-white rounded-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
      >
        <motion.img
          src={user.avatar}
          alt={user.name}
          className="w-28 h-28 rounded-full border-4 border-blue-500"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        />
        <div className="flex flex-col gap-3 ml-5">
          <motion.h1 
            className="text-3xl font-bold text-gray-800"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {user.name}
          </motion.h1>
          {user.description && (
            <p className="text-gray-600 italic">{user.description}</p>
          )}
          {user.url && (
            <a
              href={user.url}
              className="text-blue-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {user.url}
            </a>
          )}
          <div className="mt-3 flex space-x-4 items-center">
            <p className="text-sm text-gray-500 flex items-center">
              <FaEnvelope className="mr-2" /> {user.email}
            </p>
            <span className="text-gray-300">|</span>
            <p className="text-sm text-gray-500 flex items-center">
              <FaCalendarAlt className="mr-2" /> {new Date(user.joined_date).toLocaleDateString()}
            </p>
            <span className="text-gray-300">|</span>
            <p className="text-sm text-gray-500 flex items-center">
              <FaMapMarkerAlt className="mr-2" /> {user.location}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab('topics')}
          className={`py-2 px-4 ${
            activeTab === 'topics'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-500'
          }`}
        >
          Latest Topics
        </button>
        <button
          onClick={() => setActiveTab('replies')}
          className={`py-2 px-4 ${
            activeTab === 'replies'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-500'
          }`}
        >
          Latest Replies
        </button>
      </div>

      {/* Topics */}
      {activeTab === 'topics' && (
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {topics.length > 0 ? (
            <>
              {topics.map(topic => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link
                    href={`/questions/${topic.slug}?id=${topic.id}`}
                    className="block p-4 bg-white rounded-lg transition"
                  >
                    <h3 className="font-medium">{topic.title}</h3>
                    <span className="text-sm text-gray-500">
                      {new Date(topic.date).toLocaleDateString()}
                    </span>
                  </Link>
                </motion.div>
              ))}
              {topicPage < topicTotalPages && (
                <button
                  onClick={() => setTopicPage(prev => prev + 1)}
                  className="w-full p-2 text-blue-500 border border-blue-500 rounded hover:bg-blue-50"
                >
                  Load more topics
                </button>
              )}
            </>
          ) : (
            <p className="text-gray-500">No topics yet</p>
          )}
        </motion.div>
      )}

      {/* Replies */}
      {activeTab === 'replies' && (
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {replies.length > 0 ? (
            <>
              {replies.map(reply => (
                <motion.div
                  key={reply.id}
                  className="p-4 bg-white rounded-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link
                    href={`/questions/${reply.topicSlug}?id=${reply.topicId}`}
                    className="hover:underline"
                  >
                    <h4 className="font-bold mb-2">
                      Replied to: {reply.topicTitle}
                    </h4>
                  </Link>
                  <div className="text-sm text-gray-500">
                    {new Date(reply.date).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: reply.content }} />
                </motion.div>
              ))}
              {replyPage < replyTotalPages && (
                <button
                  onClick={() => setReplyPage(prev => prev + 1)}
                  className="w-full p-2 text-blue-500 border border-blue-500 rounded hover:bg-blue-50"
                >
                  Load more replies
                </button>
              )}
            </>
          ) : (
            <p className="text-gray-500">No replies yet</p>
          )}
        </motion.div>
      )}
    </div>
  )
}