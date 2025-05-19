"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { decodeHtml } from '../../plugins/decodeHTMLentities';
import { getQuestions } from '../../lib/questions';
import { motion } from 'framer-motion';
import LoadingSpinner from '../../components/LoadingSpinner';
import Image from 'next/image';
import SearchBarWithCat from '../../components/SearchBarwithCat';

const technologyPartners = [
  'https://dev.community.aviznetworks.com/wp-content/uploads/2025/04/broadcom.png',
  'https://dev.community.aviznetworks.com/wp-content/uploads/2025/04/broadcom.png',
  'https://dev.community.aviznetworks.com/wp-content/uploads/2025/04/broadcom.png',
  'https://dev.community.aviznetworks.com/wp-content/uploads/2025/04/broadcom.png',
  'https://dev.community.aviznetworks.com/wp-content/uploads/2025/04/broadcom.png',
  'https://dev.community.aviznetworks.com/wp-content/uploads/2025/04/broadcom.png',
  'https://dev.community.aviznetworks.com/wp-content/uploads/2025/04/broadcom.png',
  'https://dev.community.aviznetworks.com/wp-content/uploads/2025/04/broadcom.png',
  'https://dev.community.aviznetworks.com/wp-content/uploads/2025/04/broadcom.png',
];

const distriPartners = [
  'https://dev.community.aviznetworks.com/wp-content/uploads/2025/04/Carahsoft_Logo-1024x194.png',
  'https://dev.community.aviznetworks.com/wp-content/uploads/2025/04/Carahsoft_Logo-1024x194.png',
  'https://dev.community.aviznetworks.com/wp-content/uploads/2025/04/Carahsoft_Logo-1024x194.png',
  'https://dev.community.aviznetworks.com/wp-content/uploads/2025/04/Carahsoft_Logo-1024x194.png',
  'https://dev.community.aviznetworks.com/wp-content/uploads/2025/04/Carahsoft_Logo-1024x194.png',
  'https://dev.community.aviznetworks.com/wp-content/uploads/2025/04/Carahsoft_Logo-1024x194.png',
  'https://dev.community.aviznetworks.com/wp-content/uploads/2025/04/Carahsoft_Logo-1024x194.png',
  'https://dev.community.aviznetworks.com/wp-content/uploads/2025/04/Carahsoft_Logo-1024x194.png',
];

export default function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await getQuestions(page, 10);
        if (res.status === 200) {
          const qs = res.data;
          setQuestions(prev => page === 1 ? qs : [...prev, ...qs]);
          setHasMore(qs.length === 10); // If we get less than 10 items, we've reached the end
        } else {
          setError('Failed to load questions');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [page]);

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  if (loading && page === 1) return (
    <div className="flex justify-center items-center min-h-screen">
      <LoadingSpinner />
    </div>
  );
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="bg-[#191153] flex flex-col items-center">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-[url('https://dev.community.aviznetworks.com/wp-content/uploads/2025/03/06-Artboard-13.png')] bg-contain bg-no-repeat bg-top text-white pt-2 pb-16 h-[60vh]"
      >
        {/* Background dots or pattern */}
        <div className="absolute inset-0"></div>
        <div className="relative max-w-5xl mx-auto px-4 text-center pt-30">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-8xl font-extrabold mb-4"
          >
            Questions
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg mb-8"
          >
            Browse and search through community questions and discussions. Find answers, share knowledge, and engage with other members.
          </motion.p>

          {/* Search Bar with Categories */}
          <SearchBarWithCat />
        </div>
      </motion.section>

      <div className="flex gap-8 max-w-7xl mx-auto p-4 pt-10 mb-20 w-full max-w-[80%]">
        {/* Left Sidebar - 20% */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-[20%]"
        >
          {/* Technology Partners */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white rounded-lg shadow-sm p-6 mb-8"
          >
            <h2 className="text-xl font-semibold mb-4">Technology Partners</h2>
            <div className="flex flex-col gap-4">
              {technologyPartners.map((src, index) => (
                <motion.div 
                  key={`${src}-${index}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="p-4 bg-white rounded-lg flex items-center justify-center border border-gray-200"
                >
                  <Image
                    src={src}
                    alt="Partner logo"
                    width={120}
                    height={60}
                    className="object-contain" 
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Distributors */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Aviz VARs and Distributors</h2>
            <div className="flex flex-col gap-4">
              {distriPartners.map((src, index) => (
                <motion.div 
                  key={`${src}-${index}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  className="p-4 bg-white rounded-lg flex items-center justify-center border border-gray-200"
                >
                  <Image
                    src={src}
                    alt="Distributor logo"
                    width={120}
                    height={60}
                    className="object-contain"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Right Content - Questions List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 bg-white rounded-[10px] shadow-lg p-6"
        >
          {questions.length === 0 ? (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-500"
            >
              No questions yet
            </motion.p>
          ) : (
            <div className="space-y-4">
              {questions.map((q, index) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Link
                    href={{
                      pathname: `/questions/${q.title.rendered
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '')}`,
                      query: { id: q.id }
                    }}
                    className="block bg-white p-6 rounded-lg shadow-sm border hover:border-gray-300"
                  >
                    <h2 className="text-xl font-semibold mb-2">
                      {decodeHtml(q.title.rendered)}
                    </h2>
                    <p
                      className="text-gray-600 mb-4 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: decodeHtml(q.content.rendered) }}
                    />
                    <div className="text-sm text-gray-500">
                      <span>By {q.bbp_extra?.author?.name || 'Anonymous'}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(q.date).toLocaleDateString()}</span>
                      <span className="mx-2">•</span>
                      <span>{q.bbp_extra?.reply_count || 0} {q.bbp_extra?.reply_count === 1 ? 'reply' : 'replies'}</span>
                    </div>
                    {q.bbp_extra?.latest_replies?.items?.length > 0 && (
                      <div className="mt-2 text-gray-400 italic line-clamp-1">
                        Latest: 
                        <Link href={`/questions/${q.bbp_extra.latest_replies.items[0].topic_slug}`}>
                          <span dangerouslySetInnerHTML={{ __html: decodeHtml(q.bbp_extra.latest_replies.items[0].content) }} />
                        </Link>
                      </div>
                    )}
                  </Link>
                </motion.div>
              ))}

              {hasMore && !loading && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={loadMore}
                  className="w-full p-2 text-blue-500 border border-blue-500 rounded hover:bg-blue-50"
                >
                  Load more questions
                </motion.button>
              )}

              {loading && page > 1 && (
                <div className="flex justify-center p-4">
                  <LoadingSpinner />
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}