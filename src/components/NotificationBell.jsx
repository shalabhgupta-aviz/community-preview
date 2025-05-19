'use client'

import { useState, useEffect, useRef } from 'react'
import useSWR from 'swr'
import { FaRegBell } from 'react-icons/fa'
import LoadingSpinner from './LoadingSpinner'
import AlertBox from './AlertBox'
import { getNotifications, markOneAsRead, markAllAsRead } from '@/lib/notifications'
import TimeFormating from './TimeFormating'
import { motion, AnimatePresence } from 'framer-motion'

export default function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const prevCount = useRef(0)
  const containerRef = useRef(null)

  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1] || ''

  // SWR fetch
  const { data, error, mutate, isValidating } = useSWR(
    ['notifications', token],
    () => getNotifications(token),
    { refreshInterval: 10000 }
  )

  // 3) Coerce into array so .filter/.map never crashes
  const notifications = Array.isArray(data) ? data : []

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    if (notifications.length > prevCount.current) setOpen(true)
    prevCount.current = notifications.length
  }, [notifications.length])

  // Close notification box when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [containerRef])

  // 1) Loading state
  if (isValidating && !data && !error) {
    return (
      <div className="p-2">
        <LoadingSpinner />
      </div>
    )
  }

  // 2) Error state
  if (error) {
    return (
      <div className="p-2">
        <AlertBox
          type="error"
          message="Could not load notifications"
          onClose={() => mutate()}
        />
      </div>
    )
  }

  const markAsRead = async (id) => {
    mutate(
      notifications.map(n => n.id === id ? { ...n, read: true } : n),
      false
    )
    await markOneAsRead(id, token)
    mutate()
  }

  const markAllRead = async () => {
    mutate(notifications.map(n => ({ ...n, read: true })), false)
    await markAllAsRead(token)
    mutate()
    setOpen(false) // Close the notification box after marking all as read
  }

  return (
    <div className="relative" ref={containerRef}>
      <button onClick={() => setOpen(o => !o)} className="p-2">
        <FaRegBell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <motion.span
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute right-0 mt-2 w-80 max-h-72 overflow-auto bg-white shadow-lg rounded-lg z-50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <span className="font-medium">Notifications</span>
              {notifications.length > 0 && (
                <button 
                  onClick={markAllRead}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <ul>
              {notifications.length > 0
                ? notifications.map(n => (
                    <motion.li
                      key={n.id}
                      className={`flex items-start px-4 py-2 hover:bg-gray-100 ${
                        n.read ? 'bg-gray-300' : 'bg-white'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <input
                        type="checkbox"
                        checked={!!n.read}
                        onChange={() => markAsRead(n.id)}
                        className="mt-1 mr-2"
                      />
                      <div className="flex-1">
                        <div
                          className="cursor-pointer font-sm"
                          onClick={async () => {
                            mutate(
                              notifications.map(x => x.id === n.id ? { ...x, read: true } : x),
                              false
                            )
                            await markOneAsRead(n.id, token)
                            window.location.assign(`/questions/${n.topic_slug}?id=${n.topic_id}`)
                          }}
                        >
                          {n.message}
                        </div>
                        <div className="text-xs text-gray-500">
                          <TimeFormating date={n.date} />
                        </div>
                      </div>
                    </motion.li>
                  ))
                : (
                  <li className="px-4 py-2 text-gray-500">
                    No new notifications
                  </li>
                )
              }
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}