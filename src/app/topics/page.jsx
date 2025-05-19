'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { decodeHtml } from '../../plugins/decodeHTMLentities';
import LoadingSpinner from '../../components/LoadingSpinner';
import { motion } from 'framer-motion';
import TimeFormating from '../../components/TimeFormating';

export default function TopicsPage() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await getTopics();
        console.log("res", res);
        if (res.status === 200) {
          const topicsData = res.data;
          setTopics(topicsData);
        } else {
          setError('Failed to load topics');
        }
      } catch (err) {
        setError('Failed to load topics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-[#191153] flex flex-col items-center">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-[url('https://dev.community.aviznetworks.com/wp-content/uploads/2025/03/06-Artboard-13.png')] bg-contain bg-no-repeat bg-top text-white pt-2 pb-16 h-[60vh]"
      >
        <div className="absolute inset-0"></div>
        <div className="relative max-w-5xl mx-auto px-4 text-center pt-30">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-8xl font-extrabold mb-4"
          >
            Topics
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg mb-8"
          >
            Explore various topics and engage with the community. Share your insights and learn from others.
          </motion.p>
        </div>
      </motion.section>

      <div className="flex gap-8 max-w-7xl mx-auto p-4 pt-10 mb-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full"
        >
          {topics.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-500 text-center"
            >
              No topics yet
            </motion.p>
          ) : (
            <div className="space-y-4">
              {topics.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Link
                    href={{
                      pathname: `/topics/${(topic.title.rendered)
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '')}`,
                      query: { id: topic.id },
                    }}
                    className="block bg-white p-6 rounded-lg shadow-sm border hover:border-gray-300"
                  >
                    <h2 className="text-xl font-semibold mb-2">
                      {decodeHtml(topic.title.rendered)}
                    </h2>
                    <p
                      className="text-gray-600 mb-4 line-clamp-2"
                      dangerouslySetInnerHTML={{
                        __html: decodeHtml(topic.content.rendered),
                      }}
                    />
                    <div className="text-sm text-gray-500">
                      <span><TimeFormating date={topic.date} /></span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
