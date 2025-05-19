// src/app/login/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  normal
} from '../../store/slices/authSlice';
import {
  loginUser,
  register as registerUser,
  setToken,
} from '../../lib/auth';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function LoginPage() {
  const dispatch = useDispatch();
  const router   = useRouter();
  const { loading, error } = useSelector(s => s.auth);
  const token    = useSelector(s => s.auth.token);
  const user     = useSelector(s => s.auth.user);
  const { data: session, status } = useSession();

  const [isRegister, setIsRegister] = useState(false);
  const [email,    setEmail]    = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // 1️⃣ Already have a JWT + user in Redux? go straight to profile
  useEffect(() => {
    if (token && user) {
      router.replace('/profile');
    }
  }, [token, user, router]);

  // 2️⃣ NextAuth just finished social login?
  useEffect(() => {
    if (session?.wpJwt && session.user) {
      // populate Redux & our cookie
      dispatch(loginSuccess({
        token: session.wpJwt,
        user:  {
          id:       session.user.id,
          name:     session.user.name,
          email:    session.user.email,
          username: session.user.slug,
          avatar:   session.user.avatar_urls?.['96'] ?? session.user.avatar,
        }
      }));
      setToken(session.wpJwt);
      router.replace('/profile');
    }
  }, [session, dispatch, router]);

  const handleSubmit = async e => {
    e.preventDefault();
    console.log('handleSubmit', isRegister, username, email, password);
    dispatch(loginStart());

    try {
      let data;
      if (isRegister) {
        // create WP user via your REST register endpoint
        data = await registerUser(username, email, password);
      } else {
        data = await loginUser(email, password);
      }
      if (data.token) {
        dispatch(loginSuccess({
          user:  data.user.data,
          token: data.token
        }));
        setToken(data.token);
        router.replace('/profile');
      }
    } catch (err) {
      dispatch(loginFailure(err.message));
      setTimeout(() => {
        dispatch(normal());
      }, 3000);
    }
  };

  // while NextAuth is bootstrapping or our own JWT call in progress
  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg"
      >
        <h1 className="text-2xl font-semibold mb-6 text-center">
          {isRegister ? 'Create your account' : 'Sign in to your account'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-red-600 text-sm"
                dangerouslySetInnerHTML={{ __html: error }}
              />
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            {isRegister ? 'Agree & Join' : 'Sign in'}
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-2 text-center">
          By clicking sign up Agree & Join or Continue, you agree to the LinkedIn{' '}
          <a href="#" className="text-blue-600 underline">User Agreement</a>,{' '}
          <a href="#" className="text-blue-600 underline">Privacy Policy</a>, and{' '}
          <a href="#" className="text-blue-600 underline">Cookie Policy</a>.
        </p>

        <div className="relative my-4 text-center">
          <span className="px-2 bg-white text-gray-400">or</span>
          <div className="absolute inset-x-0 top-1/2 border-t border-gray-200" />
        </div>

        <div className="space-y-3">
          <button
            onClick={() => signIn('google',   { callbackUrl: '/profile' })}
            className="w-full flex items-center justify-center gap-3 py-2 border rounded-md hover:bg-gray-50"
          >
            <img src="/google.svg" alt="Google" className="h-5 w-5" />
            Continue with Google
          </button>
          {/* <button
            onClick={() => {
              window.location.href = "/api/linkedin/auth";
            }}
            className="w-full flex items-center justify-center gap-3 py-2 border rounded-md hover:bg-gray-50"
          >
            <img src="/linkedin.svg" alt="LinkedIn" className="h-5 w-5" />
            Continue with LinkedIn
          </button> */}
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          {isRegister
            ? 'Already have an account?'
            : 'New to our community?'}{' '}
          <button
            onClick={() => setIsRegister(x => !x)}
            className="text-blue-600 underline"
          >
            {isRegister ? 'Sign in' : 'Create one'}
          </button>
        </p>
      </motion.div>
    </motion.div>
  );
}