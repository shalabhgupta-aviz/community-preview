'use client';

import ProtectedRoute from '../../components/ProtectedRoute';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logout as logoutAction, setUser } from '../../store/slices/authSlice';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCamera } from 'react-icons/fa';
import { uploadUserAvatar } from '../../lib/users';
import { useGetCurrentUserQuery, useUpdateUserMutation } from '../../store/api/wpApi';
import { decodeHtml } from '../../plugins/decodeHTMLentities';
import { getToken } from '../../lib/auth';
import WelcomePopup from '../../components/popups/WelcomePopup';
import defaultCover from '../../../public/assets/default-cover.jpg';
import Image from 'next/image';
import LoadingSpinner from '@/components/LoadingSpinner';
import TimeFormating from '@/components/TimeFormating';
// Helper to format time since date

export default function ProfilePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { data: session } = useSession();
  const reduxToken = useSelector((s) => s.auth.token);
  const reduxUser = useSelector((s) => s.auth.user);
  const userData = session?.user;
  const isUserLoading = false;
  const queryError = null;

  const user = userData || reduxUser;

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [topicsSearchTerm, setTopicsSearchTerm] = useState('');
  const [repliesSearchTerm, setRepliesSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const [editedUser, setEditedUser] = useState({
    name: '',
    email: '',
    website: '',
    bio: '',
    image: '',
  });

  const [visibleTopics, setVisibleTopics] = useState(1);
  const [visibleReplies, setVisibleReplies] = useState(1);

  useEffect(() => {
    if (user) {
      setEditedUser({
        name: user.name || '',
        email: user.email || '',
        website: user.url || '',
        bio: user.description || '',
        image: user.image || '',
      });
    }
  }, [user]);

  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (queryError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="text-center text-red-600"
      >
        Error loading profile.
      </motion.div>
    );
  }

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await signOut({ callbackUrl: '/login' });
      dispatch(logoutAction());
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      toast.error('Failed to logout. Please try again.');
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImage(URL.createObjectURL(file));

    try {
      const token = session?.wpJwt || getToken();
      const userId = session?.user?.id;

      console.log('token', token);

      if (!token || !userId) {
        throw new Error('Missing authentication data');
      }

      const response = await uploadUserAvatar(file, token, userId);
      console.log('response', response);

      if (response?.meta?.custom_avatar) {
        toast.success('Profile image updated successfully');
        setEditedUser((prev) => ({ ...prev, image: URL.createObjectURL(file) }));
        dispatch(setUser({ ...user, image: URL.createObjectURL(file) }));
      }
    } catch (err) {
      console.error('Failed to upload image:', err);
      toast.error('Failed to upload image');
      setSelectedImage(null);
    }
  };

  const handleSaveProfile = async () => {
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
    try {
      setFormError(null);

      if (!editedUser.name.trim()) {
        throw new Error('Name is required');
      }

      if (!editedUser.email.trim()) {
        throw new Error('Email is required');
      }

      if (editedUser.website && !/^https?:\/\/.+/.test(editedUser.website)) {
        throw new Error('Website URL must start with http:// or https://');
      }
      console.log('session', session);
      if (!session?.wpJwt && !session?.user?.id && !reduxToken && !cookieToken && !user) {
        throw new Error('Missing authentication data');
      }

      const data = {};
      if (editedUser.name !== user.name) data.name = editedUser.name;
      if (editedUser.website !== user.url) data.url = editedUser.website;
      if (editedUser.bio !== user.description) data.description = editedUser.bio;

      const updatedResponse = await updateUser({ id: session?.user?.id || user.id, data }).unwrap();

      dispatch(setUser(updatedResponse));

      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save profile:', err);
      setFormError(err.message || 'Failed to save profile. Please try again.');
      toast.error(err.message || 'Failed to save profile');
    }
  };

  const mapTopicsAndReplies = () => {
    const topicsToShow = (user.latest_topics?.items || []).slice(0, visibleTopics);
    return topicsToShow.map((topic) => {
      const reply = (user.latest_replies?.items || []).find(r => r.topic_id === topic.id);
      return (
        <div key={topic.id} className="mb-4 p-4 border-b last:border-b-0">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold">{decodeHtml(topic.title.rendered)}</h3>
            <span className="text-sm text-gray-500">
            <TimeFormating date={topic.date}/>
            </span>
          </div>
          {reply && (
            <div className="mt-4 flex items-center space-x-3">
              <img
                src={user.image || '/default-avatar.png'}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">
                <TimeFormating date={reply.date}/>
                </p>
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  const mapReplies = () => {
    const repliesToShow = (user.latest_replies?.items || []).slice(0, visibleReplies);
    return repliesToShow.map((reply) => (
      <div key={reply.id} className="mb-4 p-4 border-b last:border-b-0">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold">{decodeHtml(reply.title)}</h3>
          <span className="text-sm text-gray-500">
          <TimeFormating date={reply.date}/>
          </span>
        </div>
        <div className="mt-4 flex items-center space-x-3">
          <img
            src={user.image || '/default-avatar.png'}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-sm text-gray-500">
            <TimeFormating date={reply.date}/>
            </p>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-32 w-full relative">
            <Image
              src={user.cover_image || defaultCover}
              alt="Cover"
              className="h-32 w-full object-cover"
              fill
            />
            
            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 translate-y-1/2">
              <img
                src={user.avatar || '/default-avatar.png'}
                alt={user.name}
                className="w-24 h-24 rounded-full border-4 border-white object-cover"
              />
            </div>
          </div>
          <div className="pt-12 pb-4 text-center">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-500">{user.location || ''}</p>
            <p className="text-gray-500">Member since {user.registered_date ? new Date(user.registered_date).toLocaleDateString() : ''}</p>
            <p className="text-gray-500">{user.bio || ''}</p>
            <p className="text-gray-500">{user.website || ''}</p>   
            <p className="text-gray-500">{user.email || ''}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 max-h-72 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">My Questions</h2>
          {mapTopicsAndReplies()}
          {user.latest_topics?.items.length > visibleTopics && (
            <div className="flex justify-center">
              <button
                onClick={() => setVisibleTopics(user.latest_topics.items.length - 5)}
                className="text-black hover:underline"
              >
                Load more
              </button>
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 max-h-72 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">My Replies</h2>
          {mapReplies()}
          {user.latest_replies?.items.length > visibleReplies && (
            <div className="flex justify-center">
              <button
                onClick={() => setVisibleReplies(user.latest_replies.items.length - 5)}
                className="text-black hover:underline"
              >
                Load more
              </button>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

function Info({ label, value }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <p className="mt-1">{value}</p>
    </motion.div>
  );
}
