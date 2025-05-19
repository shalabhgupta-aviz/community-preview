'use client';
import Link from 'next/link';

export default function TopicCard({ title, content, author, date, id, replyCount }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-4">
      <Link href={`/topic/${id}`}>
        <h2 className="text-xl font-semibold mb-2 hover:text-blue-600">{title}</h2>
      </Link>
      
      <p className="text-gray-600 mb-4 line-clamp-3">{content}</p>
      
      <div className="flex justify-between text-sm text-gray-500">
        <div>
          <span>By {author}</span>
          <span className="mx-2">•</span>
          <span>{new Date(date).toLocaleDateString()}</span>
        </div>
        <span>{replyCount} {replyCount === 1 ? 'reply' : 'replies'}</span>
      </div>
    </div>
  );
}
