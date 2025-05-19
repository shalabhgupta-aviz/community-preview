"use client"
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { allSearch } from '../lib/search';

export default function SearchBarwithCat() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);

  const categories = [
    { name: 'SONiC', link: '/topics/sonic-amp-netops?id=31927' },
    { name: 'AI Assistant', link: '/topics/ai-network-assistant-network-copilot?id=32110' },
    { name: 'Observability', link: '/topics/sonic-amp-netops?id=31927' }
  ];

  const suggestions = [
    'What is SONiC?',
    'What is NetOps?',
    'How networking people are integrating SONiC'
  ];

  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await allSearch(searchTerm);
        setSearchResults(results);
      } catch (error) {
        console.error('Error: Failed to search list', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
        setSearchTerm('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={searchRef}>
      {/* Category Links */}
      <div className="inline-flex mt-8">
        <div className='flex flex-row text-white font-bold mr-5'>
          Topics
        </div>
        {categories.map((cat, index) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            className='mb-2'
          >
            <Link
              href={cat.link}
              className="rounded-t-lg mr-5 ml-5 bg-[#6E4BEB] text-white font-medium transition hover:bg-white hover:text-[#6E4BEB] p-4"
            >
              {cat.name}
            </Link>
          </motion.div>
        ))}
      </div>
      {/* Search Bar */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="max-w-5xl border-5 border-[#6E4BEB] flex items-center bg-white rounded-full shadow-md overflow-hidden p-5"
      >
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search topics and replies..."
          className="flex-grow px-6 py-3 text-black focus:outline-none"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </motion.div>

      {/* Suggestions */}
      {/* {searchTerm.length < 2 && (
          <div className="absolute top-full left-0 right-0 mt-2 max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden z-50 flex flex-row">
            <div className='flex flex-row text-black font-bold mr-5'>
            Search Suggestions:
          </div>
          {suggestions.map((suggestion, index) => (
            <div key={index} className="p-4 border-b hover:bg-gray-50 cursor-pointer text-black">
              {suggestion}
            </div>
          ))}
        </div>
      )} */}

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden z-50 h-100 overflow-y-auto"
          >
            {searchResults.map((result, index) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Link
                  href={{
                    pathname: result.type === 'topic' 
                      ? `/questions/${result.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`
                      : `/questions/${result.topic_slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`,
                    query: { id: result.type === 'topic' ? result.id : result.topic_id }
                  }}
                  className="block p-4 border-b hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium px-2 py-1 rounded bg-[#6E4BEB] text-white">
                      {result.type === 'topic' ? 'Topic' : 'Reply'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(result.date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="text-900 text-black text-left font-semibold">
                    {result.type === 'topic' ? result.title : `Re: ${result.topic_slug}`}
                  </h3>
                  
                  {result.type === 'reply' && result.content && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2 text-left">{result.content}</p>
                  )}
                  {result.type === 'topic' && result.excerpt && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2 text-left">{result.excerpt}</p>
                  )}
                  
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <span>{result.type === 'topic' ? `Topic #${result.id}` : `Reply to Topic #${result.topic_id}`}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}