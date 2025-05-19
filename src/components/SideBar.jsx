import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/LoadingSpinner';
import { decodeHtml } from '@/plugins/decodeHTMLentities';

export default function SideBar({ loading, error, items, title, linkPrefix }) {
    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <LoadingSpinner />
        </div>
    );
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
        <div className="w-[25%] space-y-4 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold">{title}</h2>
            <ul className="space-y-2">
                {items.map((item) => (
                    <motion.li
                        key={item.id}
                        className="flex mt-2 mb-5 border-b border-gray-200 pb-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Link href={`/${linkPrefix}/${item.slug}/?id=${item.id}`} className='flex items-start justify-between flex-col'>
                            <span className="text-black hover:underline flex-1 font-bold">
                                {decodeHtml(item.title)}
                            </span>
                            <span className="text-xs text-gray-500 font-medium mt-3">
                                {new Date(item.date).toLocaleString()}
                            </span>
                            <div className="flex items-center mt-2">
                                <img src={item.author.avatar} alt={item.author.name} className="w-6 h-6 rounded-full mr-2" />
                                <span className="text-xs text-gray-500">{item.author.name}</span>
                            </div>
                        </Link>
                    </motion.li>
                ))}
            </ul>
        </div>
    );
}
