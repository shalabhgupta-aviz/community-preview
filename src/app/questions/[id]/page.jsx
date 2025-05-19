'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getQuestionDetails } from '../../../lib/questions';
import { getRecentQuestions } from '../../../lib/questions'; // Import the getRecentQuestions function
import { decodeHtml } from '../../../plugins/decodeHTMLentities';
import { useSearchParams, usePathname } from 'next/navigation';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Breadcrumb from '../../../components/Breadcrumb';
import ReplyCardWithImage from '../../../components/ReplyCardwithImage';
import { motion, AnimatePresence } from 'framer-motion';
import './page.css';
import { createReply, updateReply, deleteReply } from '../../../lib/replies'; // Import updateReply and deleteReply
import TimeFormating from '../../../components/TimeFormating';
import ReplyInputBox from '../../../components/ReplyInputBox';

export default function QuestionPage({ params }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const id = searchParams.get('id');
  const [question, setQuestion] = useState(null);
  const [replies, setReplies] = useState([]);
  const [recentTopics, setRecentTopics] = useState([]); // State for recent topics
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newReplyLoading, setNewReplyLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreReplies, setHasMoreReplies] = useState(true);
  const [draftReplies, setDraftReplies] = useState([]);
  const [activeTab, setActiveTab] = useState('published'); // State to manage active tab
  const [draftError, setDraftError] = useState(null); // State to manage draft error
  const [editingDraftId, setEditingDraftId] = useState(null); // State to track the draft being edited
  const [userMap, setUserMap] = useState({});
  
  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('persist:root'))?.auth;
  const fetchAllReplies = async (token) => {
    try {
      const res = await getQuestionDetails(id, 1, 5, token);
      const data = res.data;
      console.log(data);
      setReplies(data.replies.filter(r => r.status === 'publish'));
      setDraftReplies(data.replies.filter(r => r.status === 'draft'));
      setHasMoreReplies(data.pagination.current_page < data.pagination.total_pages);
    } catch (error) {
      console.error('Failed to fetch replies:', error);
      setError('Failed to fetch replies');
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1];
        await fetchAllReplies(token); // Fetch all replies    
        const res = await getQuestionDetails(id, 1, 5, token);
        const data = res.data;
        if (res.status === 200) {
          setQuestion(data.topic);
          setHasMoreReplies(data.pagination.current_page < data.pagination.total_pages);
        }
      } catch (error) {
        console.error('Failed to load question details:', error);
        setError('Failed to load question details');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    const slugs = new Set();
    replies.forEach(r => {
      const html = r.content.rendered;
      Array.from(html.matchAll(/@([a-z0-9_-]+)/gi)).forEach(m => slugs.add(m[1]));
    });
    if (slugs.size) {
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL_V1}/users?username=${[...slugs].join(',')}`
      )
        .then(r => r.json())
        .then(users => {
          const map = {};
          users.forEach(u => {
            map[u.value] = {
              label:   u.label,
              profile: u.profile,
              avatar:  u.avatar,
            };
          });
          setUserMap(map);
        });
    }
  }, [replies]);

  useEffect(() => {
    const fetchRecentTopics = async () => {
      try {
        const res = await getRecentQuestions(5); // Fetch recent topics, assuming 5 as the number of topics to fetch
        const data = res.data;
        if (res.status === 200) {
          const filteredData = data.filter(topic => topic.id !== id); // Filter out the current question
          console.log('filteredData', filteredData);
          setRecentTopics(filteredData);
        }
      } catch (error) {
        console.error('Failed to load recent topics:', error);
        setError('Failed to load recent topics');
      }
      console.log('recentTopics', recentTopics);
    };

    fetchRecentTopics();
  }, [id]);

  const loadMoreReplies = async () => {
    if (!hasMoreReplies) return;
    const nextPage = page + 1;
    setNewReplyLoading(true);
    try {
      const res = await getQuestionDetails(id, nextPage, 5);
      const data = res.data;
      if (res.status === 200) {
        setReplies(prev => [...prev, ...data.replies]);
        setPage(nextPage);
        setHasMoreReplies(nextPage < data.pagination.total_pages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setNewReplyLoading(false);
    }
  };

  const handleSubmitReply = async () => {
    // e.preventDefault();
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
    if (!token) {
      setError('Please log in');
      return;
    }

    setIsSubmitting(true);
    setNewReplyLoading(true);

    try {
      if (editingDraftId) {
        // ── UPDATE EXISTING DRAFT → PUBLISH ───────────────────────────────
        await updateReply(
          editingDraftId,
          replyContent,
          token,
          'publish'
        );
        setEditingDraftId(null);
      } else {
        // ── CREATE A BRAND-NEW PUBLISHED REPLY ────────────────────────────
        await createReply(id, replyContent, token, 'publish');
      }

      // ── NOW PURELY RELOAD EVERYTHING FROM WP ─────────────────────────
      await fetchAllReplies(token);
      setReplyContent('');

    } catch (err) {
      setError(err.message || 'Failed to submit');
    } finally {
      setIsSubmitting(false);
      setNewReplyLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (draftReplies.length >= 3) {
      return setDraftError('Max 3 drafts; delete one first.');
    }
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
    console.log('replyContent', replyContent);
    if (!token) return setError('Please log in');

    try {
      if (editingDraftId) {
        console.log('editingDraftId', editingDraftId);
        console.log('replyContent', replyContent);
        console.log('token', token);
        // ── EDIT EXISTING DRAFT ───────────────────────────────
        await updateReply(
          editingDraftId,
          replyContent,
          token,
          'draft'
        );
        setEditingDraftId(null);
      } else {
        // ── CREATE NEW DRAFT ───────────────────────────────────
        await createReply(id, replyContent, token, 'draft');
      }

      // ── RELOAD ALL REPLIES ────────────────────────────────
      await fetchAllReplies(token);
      setReplyContent('');
      setDraftError(null);

      // Change active tab to 'drafts' if currently in 'published'
      if (activeTab === 'published') {
        setActiveTab('drafts');
      }

    } catch (err) {
      setError(err.message || 'Failed to save draft');
    }
  };

  const startEditing = async (draft) => {
    // Logic to start editing a draft
    console.log('Editing draft:', draft);
    console.log('draft.content', draft.content.rendered);
    setReplyContent(draft.content.rendered); // Map draft content to the text editor
    setEditingDraftId(draft.id); // Set the draft being edited

    // Update the reply
    try {
      console.log('Draft updated:', draft.id);
    } catch (err) {
      setError('Failed to update draft');
      console.error(err);
    }
  };

  const deleteDraft = async draftId => {
    setDraftReplies(prev => prev.filter(d => d.id !== draftId));
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
    if (!token) return setError('Please log in');

    try {
      await deleteReply(draftId, token);
      await fetchAllReplies(token);
    } catch (err) {
      setError(err.message || 'Failed to delete');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <LoadingSpinner />
    </div>;
  }

  // if (error) {
  //   return null; // Hide notification for now
  // }

  if (!question) {
    return <div className="p-4">Question not found</div>;
  }

  const paths = pathname.split('/').filter(Boolean);

  return (
    <div className="max-w-[80%] mx-auto p-4 mt-8">
      <Breadcrumb paths={paths} question={question} />

      <h1 className="text-4xl font-bold mb-6">{decodeHtml(question.title)}</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        {question.content && (
          <div
            className="text-gray-600 mb-4"
            dangerouslySetInnerHTML={{ __html: decodeHtml(question.content) }}
          />
        )}
        <div className="text-sm text-gray-500 flex justify-between items-center">
          <span>
            <TimeFormating date={question.date} />
          </span>
          <span className="flex">
            <Link href={`/users/${replies[0]?.author.username}`} className="flex items-center gap-2">
              <img
                src={replies[0]?.author.avatar}
                alt={replies[0]?.author.name}
                className="w-6 h-6 rounded-full"
              />
              <span className="display-inline">
                {replies[0]?.author.name}
              </span>
            </Link>
          </span>
        </div>
      </div>

      <div className="flex space-x-6">
        <div className="w-[80%] space-y-4">
          <div className="flex space-x-4 mb-10">
            <motion.button
              onClick={() => setActiveTab('published')}
              className={`text-md bg-white px-4 py-2 rounded-[7px] ${activeTab === 'published' ? 'text-white bg-[#6E4BEB]' : 'text-gray-500'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                backgroundColor: activeTab === 'published' ? '#6E4BEB' : '#FFFFFF',
                x: 0,
              }}
              transition={{ duration: 0.3 }}
            >
              Published
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('drafts')}
              className={`text-md bg-white px-4 py-2 rounded-[7px] ${activeTab === 'drafts' ? 'text-white bg-[#6E4BEB]' : 'text-gray-500'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                backgroundColor: activeTab === 'drafts' ? '#6E4BEB' : '#FFFFFF',
                x: 0,
              }}
              transition={{ duration: 0.3 }}
            >
              Drafts
            </motion.button>
          </div>

          <AnimatePresence exitBeforeEnter>
            {activeTab === 'published' && (
              <motion.div
                key="published"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {replies.length === 0 ? (
                  <p className="text-gray-500">No replies yet</p>
                ) : (
                  <div className="reply-thread">
                    {replies.map((reply, index) => {
                      const youLiked = reply.liked_by.some(like => like.user_id === JSON.parse(currentUser).user.id);
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                          className={`transition-transform duration-500 ease-out ${newReplyLoading && index === 0 ? 'transform scale-0' : 'transform scale-100'
                            }`}
                        >
                          <ReplyCardWithImage
                            reply={{ ...reply, you_liked: youLiked }}
                            index={index}
                            totalReplies={replies.length}
                          />
                        </motion.div>
                      )
                    })}
                  </div>
                )}

                {newReplyLoading && (
                  <div className="flex justify-center my-4">
                    <LoadingSpinner />
                  </div>
                )}

                {!hasMoreReplies && !newReplyLoading && (
                  <p className="text-gray-500 text-center mt-4">No more replies</p>
                )}

                {hasMoreReplies && !newReplyLoading && (
                  <motion.button
                    onClick={loadMoreReplies}
                    className="bg-blue-500 text-white px-4 py-2 rounded-full mt-4 font-bold hover:bg-blue-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Load More Replies
                  </motion.button>
                )}
              </motion.div>
            )}

            {activeTab === 'drafts' && (
              <motion.div
                key="drafts"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {draftReplies.length === 0 ? (
                  <p className="text-gray-500">No draft replies</p>
                ) : (
                  <div className="draft-replies space-y-4">
                    {draftReplies.map(d => {
                      const daysSince = Math.floor((Date.now() - new Date(d.date)) / 86400000);
                      const daysLeft = 30 - daysSince;
                      return (
                        <motion.div
                          key={d.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.5 }}
                          className="draft-item p-4 bg-yellow-50 rounded-lg"
                        >
                          <ReplyCardWithImage reply={d} />
                          <div className="mt-2 flex items-center space-x-4">
                            <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs">Draft</span>
                            <span className="text-xs text-gray-600">Deletes in {daysLeft} days</span>
                            <button onClick={() => startEditing(d)} className="text-xs text-blue-600 hover:underline">Edit</button>
                            <button onClick={() => deleteDraft(d.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <ReplyInputBox
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            onSubmit={handleSubmitReply}
            onSaveDraft={handleSaveDraft}
            isSubmitting={isSubmitting}
            draftReplies={draftReplies}
            draftError={draftError}
            onDraftErrorClose={() => setDraftError(null)}
            onErrorClose={() => setError(null)}
            type="reply"
          />
        </div>

        <div className="w-[30%]">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Recent Questions</h3>
            <hr className="mb-5 border-t-5 border-[#6E4BEB] w-1/4 rounded-full" />
            {recentTopics.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent questions</p>
            ) : (
              <ul className="text-gray-500 text-sm space-y-2">
                {recentTopics.map((topic) => (
                  <motion.li
                    key={topic.id}
                    className="flex mt-2 mb-5 border-b border-gray-200 pb-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Link href={`/questions/${topic.slug}/?id=${topic.id}`} className='flex items-start justify-between flex-col'>
                      <span className="text-black hover:underline flex-1 font-bold">
                        {decodeHtml(topic.title)}
                      </span>
                      <span className="text-xs text-gray-500 font-medium mt-3">
                        {new Date(topic.date).toLocaleString()}
                      </span>
                      <div className="flex items-center mt-2">
                        <img src={topic.author.avatar} alt={topic.author.name} className="w-6 h-6 rounded-full mr-2" />
                        <span className="text-xs text-gray-500">{topic.author.name}</span>
                      </div>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}