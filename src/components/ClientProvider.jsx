'use client';

import { Provider } from 'react-redux';
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
          <ReduxSessionSync>{children}</ReduxSessionSync>
        </SessionProvider>
      </PersistGate>
    </Provider>
  );
}

function ReduxSessionSync({ children }) {
  const { data: session, status } = useSession();
  const [ready, setReady] = useState(false);
  const reduxToken = useSelector((s) => s.auth.token);


  useEffect(() => {
    if (status !== 'authenticated' && status !== 'unauthenticated') return;

    (async () => {

      const cookieToken = getToken();
      if (!reduxToken && cookieToken) {
        try {
          const freshUser = await getUserProfile(cookieToken);
          dispatch(loginSuccess({ token: cookieToken, user: freshUser }));
        } catch (_) {
          // cookie was stale or invalid
        }
      }

      let token;
      let user;

      if (session?.wpJwt) {
        token = session.wpJwt;
        setToken(token);
        user = await getUserProfile(token);
      } else {
        token = getToken();
        if (token) {
          user = await getUserProfile(token);
        }
      }

      if (user && token) {
        // loginSuccess sets both token & user in Redux
        store.dispatch(loginSuccess({ token, user }));
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
