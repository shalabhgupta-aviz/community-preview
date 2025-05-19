'use client';
import Link from 'next/link';

export default function ForumCard({ title, content, author, date, id }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-4">
      <Link href={`/topic/${id}`}>
        <h2 className="text-xl font-semibold mb-2 hover:text-blue-600">{title}</h2>
      </Link>
      
      <p className="text-gray-600 mb-4 line-clamp-3">{content}</p>
      
      <div className="flex justify-between text-sm text-gray-500">
        <span>By {author}</span>
        <span>{new Date(date).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
