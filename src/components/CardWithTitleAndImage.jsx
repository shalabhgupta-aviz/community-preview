'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { decodeHtml } from '@/plugins/decodeHTMLentities';
import TimeFormating from '@/components/TimeFormating';

export default function CardWithTitleAndImage({ 
  title, 
  description, 
  link, 
  author, 
  date, 
  status, // New prop to determine card status
  showEditButton = false, 
  showDeleteButton = false, 
  onEdit, 
  onDelete 
}) {
  const defaultAvatar = "/path/to/local/default/avatar.jpg"; // Use a local default image

  return (
    <motion.div
      className={`flex mt-2 mb-5 pb-2 p-4 rounded-lg flex-col w-full ${
        status === 'draft' ? 'bg-yellow-50' : 'bg-white'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-2">
        <Image
          src={author?.avatar || defaultAvatar}
          alt={author?.name || "User"}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full mr-2"
        />
        <span className="text-gray-700 font-bold">{author?.name || "Unknown Author"}</span>
      </div>
      <Link href={link} className="flex flex-col w-full">
        <div className="text-black font-bold mb-2" dangerouslySetInnerHTML={{ __html: decodeHtml(title) }} />
      </Link>
      {console.log(description)}
      <div className="text-gray-600 mb-4" dangerouslySetInnerHTML={{ __html: decodeHtml(description) }} />
      <div className="flex items-center justify-between w-full">
        <span className="text-xs text-gray-500 font-medium">
          <TimeFormating date={date} />
        </span>
        <div className="flex space-x-2">
          {showEditButton && (
            <button onClick={onEdit} className="text-blue-600 hover:underline">Edit</button>
          )}
          {showDeleteButton && (
            <button onClick={onDelete} className="text-red-600 hover:underline">Delete</button>
          )}
        </div>
      </div>
      {status === 'draft' && (
        <div className="flex items-center mt-2">
          <span className="bg-yellow-300 text-yellow-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">Draft</span>
          <span className="text-xs text-gray-500">Deletes in 30 days</span>
        </div>
      )}
    </motion.div>
  );
}
