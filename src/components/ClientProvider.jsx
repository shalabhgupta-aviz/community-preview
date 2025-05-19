'use client';

import { Provider, useDispatch } from 'react-redux';
// Import store and persistor as named exports
import { store, persistor } from '@/store';
import { PersistGate } from 'redux-persist/integration/react';
import { SessionProvider, useSession } from 'next-auth/react';
import { loginSuccess } from '@/store/slices/authSlice';
import { useSelector } from 'react-redux';
import { getUserProfile, setToken, getToken } from '@/lib/auth';
import React, { useEffect, useState } from 'react';
import loadingSpinner from '/public/animations/loaderSpinner.json';
import Lottie from 'lottie-react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ClientProvider({ children }) {
   // ➊ if redux is empty but we have a cookie, rehydrate from it

  
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SessionProvider>
          <ReduxSessionSync>
            {children}
          </ReduxSessionSync>
        </SessionProvider>
      </PersistGate>
    </Provider>
  );
}

function ReduxSessionSync({ children }) {
  const { data: session, status } = useSession();
  const [ready, setReady] = useState(false);
  const reduxToken = useSelector((s) => s.auth.token);
  const dispatch = useDispatch();
  useEffect(() => {
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
    (async () => {
      const tok = session?.wpJwt || cookieToken;
      if (tok) {
        setToken(tok);
        try {
          const profile = await getUserProfile(tok);
          console.log('profile', profile);
          console.log('Fetched user profile:', profile);
          dispatch(loginSuccess({
            token: tok,
            user: profile.data   // 👈 grab the inner `data` object
          }));
        } catch (_) {
          // token was stale or invalid
          console.log('token was stale or invalid');
        }
      }

      setReady(true);
    })().catch((err) => {
      console.error('Session sync failed:', err);
      toast.error('Could not restore session');
      setReady(true);
    });
  }, [session, status]);

  if (!ready || status === 'loading') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex justify-center items-center min-h-screen"
      >
        <Lottie animationData={loadingSpinner} loop style={{ width: 200, height: 200 }} />
      </motion.div>
    );
  }

  return <AnimatePresence>{React.Children.map(children, (child, index) => (
    <motion.div key={index}>
      {child}
    </motion.div>
  ))}</AnimatePresence>;
}
