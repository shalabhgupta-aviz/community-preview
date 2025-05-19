import { useState } from 'react';
import { motion } from 'framer-motion';

export default function LoadMoreButton({ onClick, isLoading, hasMore }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="flex justify-center mt-4">
      <motion.button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`px-6 py-2 rounded-full font-semibold transition-colors duration-300 ${
          hovered ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
        } ${isLoading || !hasMore ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={isLoading || !hasMore}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isLoading ? 'Loading...' : hasMore ? 'Load More' : 'No More Items'}
      </motion.button>
    </div>
  );
}
