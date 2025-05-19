'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getUser, logout } from '@/lib/auth';
import Header from '@/components/Headers';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { useGetCurrentUserQuery } from '@/store/api/wpApi';
import { loginSuccess } from '@/store/slices/authSlice';
import { logout as logoutAction } from '@/store/slices/authSlice';
import Footer from '@/components/Footer';

export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const token = useSelector(state => state.auth.token);
const { data: wpUser } = useGetCurrentUserQuery(undefined, {
  skip: !token
});

  useEffect(() => {
    if (session) {
      dispatch(loginSuccess({ user: session.user, token: session.token }));
    } else if (wpUser) {
      dispatch(loginSuccess({ user: wpUser, token }));
    } else {
      dispatch(logoutAction());    // ← this logout isn’t imported, so it’s undefined
    }
  }, [session, wpUser, token, dispatch]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow bg-gray-50">
        <div className='pt-15'>
          {children}
        </div>
      </main>

      <Footer/>
    </div>
  );
}
