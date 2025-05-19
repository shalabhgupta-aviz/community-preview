"use client"
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { allSearch } from '../lib/search';

export default function SearchBarwithCat() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedTerm, setSuggestedTerm] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);
  const [isMouseInside, setIsMouseInside] = useState(false);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);
  const timeoutRef = useRef(null);

  const categories = [
    { name: 'SONiC', link: '/topics/sonic-amp-netops?id=31927' },
    { name: 'AI Assistant', link: '/topics/ai-network-assistant-network-copilot?id=32110' },
    { name: 'Observability', link: '/topics/sonic-amp-netops?id=31927' }
  ];

  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (searchTerm.length < 3) {
        setSearchResults([]);
        setSuggestedTerm('');
        return;
      }

      setIsLoading(true);
      try {
        const results = await allSearch(searchTerm);
        if (results.status === 200) {
          const fetchedResults = results.data;

          // Filter search results based on the new algorithm
          const filteredResults = fetchedResults.filter(result => {
            if (result.type === 'topic') {
              return result.title.toLowerCase().includes(searchTerm.toLowerCase());
            } else if (result.type === 'reply') {
              return result.content.toLowerCase().includes(searchTerm.toLowerCase());
            }
            return false;
          });

          setSearchResults(filteredResults);

          // Filter only for suggestions
          const suggestionCandidates = filteredResults.filter(result => {
            const resultFirstWord = result.type === 'topic' ? result.title.split(' ')[0].toLowerCase() : result.topic_slug.split(' ')[0].toLowerCase();
            return resultFirstWord.startsWith(searchTerm.split(' ')[0].toLowerCase());
          });

          if (suggestionCandidates.length > 0) {
            const firstResult = suggestionCandidates[0];
            setSuggestedTerm(firstResult.type === 'topic' ? firstResult.title : firstResult.topic_slug);
          } else {
            setSuggestedTerm('');
          }
        }
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
      if (
        searchRef.current && !searchRef.current.contains(event.target) &&
        resultsRef.current && !resultsRef.current.contains(event.target)
      ) {
        clearSearchResults();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if ((searchResults.length > 0 || filteredResults.length > 0) && !isMouseInside && !searchTerm) {
      timeoutRef.current = setTimeout(() => {
        clearSearchResults();
      }, 7000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchResults, filteredResults, isMouseInside, searchTerm]);

  const clearSearchResults = () => {
    setSearchResults([]);
    setFilteredResults([]);
    setSearchTerm('');
    setSuggestedTerm('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab' && suggestedTerm) {
      e.preventDefault();
      setSearchTerm(suggestedTerm);
      setSuggestedTerm('');
      // Filter search results to only include those that match the suggested term
      const newFilteredResults = searchResults.filter(result => {
        const resultTitle = result.type === 'topic' ? result.title : result.topic_slug;
        return resultTitle.toLowerCase().startsWith(suggestedTerm.toLowerCase());
      });
      setFilteredResults(newFilteredResults);
    }
  };

  return (
    <div className="relative" ref={searchRef} onMouseEnter={() => setIsMouseInside(true)} onMouseLeave={() => setIsMouseInside(false)}>
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
          onKeyDown={handleKeyDown}
          placeholder="Search topics and replies..."
          className="flex-grow px-6 py-3 text-black focus:outline-none"
        />
        {suggestedTerm && (
          <span className="absolute left-0 px-6 py-3 text-gray-400 pointer-events-none left-[25px]">
            {searchTerm + suggestedTerm.slice(searchTerm.length)}
          </span>
        )}
        {isLoading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {(filteredResults.length > 0 || searchResults.length > 0) && (
          <motion.div 
            ref={resultsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute top-full left-0 right-0 mt-2 max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden z-50 ${searchResults.length > 3 ? 'h-100': 'h-50Z'} overflow-y-auto`}
            onMouseEnter={() => setIsMouseInside(true)} onMouseLeave={() => setIsMouseInside(false)}
          >
            {(filteredResults.length > 0 ? filteredResults : searchResults).map((result, index, arr) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: (arr.length - index - 1) * 0.05 }}
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