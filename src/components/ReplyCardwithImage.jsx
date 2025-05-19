import { decodeHtml } from '@/plugins/decodeHTMLentities';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TimeFormating from '@/components/TimeFormating';
import LinkifyMentions from './LinkifyMentions';
import { AiOutlineLike, AiFillLike } from 'react-icons/ai'; // Modern thumbs up icons
import { toggleLike } from '@/lib/replies'; // Import the toggleLike function

const ReplyCardWithImage = ({ reply, index, totalReplies, userMap }) => {
  const [isLiked, setIsLiked] = useState(reply.you_liked); // Use state to manage like status
  const [likeCount, setLikeCount] = useState(reply.likes_count || 0); // Use state to manage like count

  const currentUser = JSON.parse(JSON.parse(localStorage.getItem('persist:root'))?.auth);

  const handleLikeClick = async () => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1] || '';

    if (!token) {
      console.log('No token found');
      return;
    }

    console.log('handleLikeClick', reply.id, token);
    try {
      await toggleLike(reply.id, token); // Call toggleLike with reply id and token
      setIsLiked(!isLiked); // Toggle the like status
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1); // Update the like count
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };
  return (
    <motion.div 
      key={reply.id} 
      className="flex mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="reply-avatar-container mr-4">
        <img 
          src={reply.author?.avatar || "https://via.placeholder.com/40"} 
          alt={reply.author?.name || "User"} 
          className="w-10 h-10 rounded-full"
        />
        {index !== totalReplies - 1 && (
          <div className="thread-line h-full w-0.5 bg-gray-300 mx-auto mt-2"></div>
        )}
      </div>
      <div className="flex-1 bg-white p-4 rounded-lg shadow-sm relative">
        <div className="absolute top-2 right-2 flex items-center" onClick={handleLikeClick}>
          {isLiked ? <AiFillLike className="text-blue-500" /> : <AiOutlineLike className="text-gray-500" />}
          <span className="ml-1 text-sm text-gray-600">{likeCount}</span>
        </div>
        <div className="font-bold text-black mb-1 text-md">
          {reply.author?.name || "Anonymous User"}
        </div>
        <LinkifyMentions html={reply?.content?.rendered} userMap={userMap} />
        <div className="text-xs text-gray-500">
          <TimeFormating date={reply.date} />
        </div>
        {reply.image && (
          <div className="mt-3">
            <img 
              src={reply.image} 
              alt="Reply related" 
              className="w-full h-auto rounded-lg"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ReplyCardWithImage;
