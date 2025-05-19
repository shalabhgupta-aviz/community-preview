// src/components/Headers.jsx
'use client';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import NotificationsBell from './NotificationBell';

export default function Header() {
  const { data: session, status } = useSession();
  const reduxUser = useSelector((s) => s.auth.user);
  const user = reduxUser || session?.user;
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const profileDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine token presence only on client
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
      setHasToken(!!token);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/login' });
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur shadow-md"
    >
      <nav className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image src="/aviz-logo.png" alt="Aviz Community" width={170} height={100} />
        </Link>

        {/* Center links */}
        <ul className="flex space-x-6 text-gray-700 font-medium">
          <li>
            <Link href="/" className="hover:text-indigo-600 transition">
              Home
            </Link>
          </li>
          <li>
            <Link href="/questions" className="hover:text-indigo-600 transition">
              Open Forum
            </Link>
          </li>
          <li>
            <Link href={`${process.env.NEXT_PUBLIC_AVIZ_LIVE_SITE}/resources/blogs/`} target="_blank" className="hover:text-indigo-600 transition">
              Resources
            </Link>
          </li>
          <li>
            <Link href={`${process.env.NEXT_PUBLIC_AVIZ_LIVE_SITE}/resources/events/bootcamps/`} target="_blank" className="hover:text-indigo-600 transition">
              Events
            </Link>
          </li>
        </ul>

        {/* Right controls */}
        <div className="flex items-center space-x-4">
          {hasToken && <NotificationsBell />}

          <AnimatePresence mode="wait">
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : hasToken ? (
              <motion.div
                key="logged-in"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center space-x-3 relative"
                ref={profileDropdownRef}
              >
                <button onClick={() => setShowProfileDropdown(!showProfileDropdown)} className="flex items-center space-x-2 mr-1">
                  {user?.avatar || user?.image ? (
                    <Image
                      src={user.avatar || user.image}
                      alt="Avatar"
                      width={32}
                      height={32}
                      className="rounded-full"
                      onError={(e) => { e.currentTarget.src = '/default-avatar.png'; }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-600">{user?.name?.[0]?.toUpperCase() || '?'}</span>
                    </div>
                  )}
                </button>
                {showProfileDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setShowProfileDropdown(false)}>
                      Profile
                    </Link>
                    <button onClick={() => { setShowProfileDropdown(false); handleLogout(); }} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                      Logout
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="logged-out" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex space-x-3">
                <Link href="/login" className="px-4 py-1 rounded-md border border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition">
                  Login
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </motion.header>
  );
}
