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

export default function ProfilePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { data: session } = useSession();

  // Fetch current user via RTK Query
  const {
    data: user,
    isLoading: isUserLoading,
    error: queryError,
  } = useGetCurrentUserQuery();

  // Mutation hook for updating user profile
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  // Local loading state for logout
  const [logoutLoading, setLogoutLoading] = useState(false);

  // Local form error state (if needed later)
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

  // Show spinner until user data is loaded
  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  console.log('queryError', queryError);
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
    try {
      setFormError(null);

      // Validate inputs
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
      if (!session?.wpJwt || !session?.user?.id) {
        throw new Error('Missing authentication data');
      }

      // Build a minimal data object of changed fields
      const data = {};
      if (editedUser.name !== user.name) data.name = editedUser.name;
      if (editedUser.website !== user.url) data.url = editedUser.website;
      if (editedUser.bio !== user.description) data.description = editedUser.bio;

      // Call updateUser mutation and unwrap the response to handle errors
      const updatedResponse = await updateUser({ id: session?.user?.id, data }).unwrap();

      // Dispatch setUser to sync Redux with the updated user data
      dispatch(setUser(updatedResponse));

      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save profile:', err);
      setFormError(err.message || 'Failed to save profile. Please try again.');
      toast.error(err.message || 'Failed to save profile');
    }
  };

  const filteredReplies = user?.latest_replies?.items?.length > 0 ? user?.latest_replies?.items?.filter(reply =>
    reply.topic_title.toLowerCase().includes(repliesSearchTerm.toLowerCase())
  ) : [];

  const filteredTopics = user?.latest_topics?.items?.length > 0 ? user?.latest_topics?.items?.filter(topic =>
    topic.title.rendered.toLowerCase().includes(topicsSearchTerm.toLowerCase())
  ) : [];

  const latestActivity = [
    ...(user?.latest_topics?.items || []).map(item => item && ({
      ...item,
      type: 'topic',
      date: item.date
    })),
    ...(user?.latest_replies?.items || []).map(item => item && ({
      ...item,
      type: 'reply',
      date: item.date
    }))
  ].filter(Boolean).sort((a, b) => new Date(b?.date || 0) - new Date(a?.date || 0)).slice(0, 5);

  return (
    <ProtectedRoute>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto p-4"
      >
        <div className="flex justify-between items-center mb-6">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold"
          >
            My Profile
          </motion.h1>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleLogout}
            disabled={logoutLoading}
            className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition ${logoutLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {logoutLoading ? 'Logging out...' : 'Logout'}
          </motion.button>
        </div>

        <div className="flex gap-6">
          {/* Left Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-64 flex-shrink-0"
          >
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className={`w-full text-left px-4 py-2 rounded font-bold ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
                  onClick={() => setActiveTab('profile')}
                >
                  Profile
                </motion.button>
                <div className="px-4 py-2 font-bold">Activity Summary</div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className={`w-full text-left px-4 py-2 rounded ml-4 ${activeTab === 'topics' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
                  onClick={() => setActiveTab('topics')}
                >
                  My Topics
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className={`w-full text-left px-4 py-2 rounded ml-4 ${activeTab === 'replies' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
                  onClick={() => setActiveTab('replies')}
                >
                  My Replies
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className={`w-full text-left px-4 py-2 rounded font-bold ${activeTab === 'latest' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
                  onClick={() => setActiveTab('latest')}
                >
                  Latest Activity
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-grow"
          >
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <AnimatePresence mode="wait">
                {formError && (
                  <motion.div
                    key="error-card"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-600"
                  >
                    {formError}
                  </motion.div>
                )}

                {activeTab === 'profile' && (
                  <motion.div
                    key="profile-tab"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start space-x-6"
                  >
                    <div className="flex-shrink-0 relative">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <div
                        className={`relative ${isEditing ? 'cursor-pointer' : ''}`}
                        onMouseEnter={() => isEditing && setIsHoveringImage(true)}
                        onMouseLeave={() => isEditing && setIsHoveringImage(false)}
                        onClick={() => isEditing && fileInputRef.current?.click()}
                      >
                        {selectedImage || user?.avatar || user?.image ? (
                          <motion.img
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            src={selectedImage || user?.avatar || user?.image}
                            alt="Profile avatar"
                            className="rounded-full w-24 h-24 object-cover"
                            onError={(e) => {
                              e.target.src = '/default-avatar.png';
                              e.target.onerror = null;
                            }}
                          />
                        ) : (
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center"
                          >
                            <span className="text-2xl text-gray-500">{user?.name?.[0]?.toUpperCase()}</span>
                          </motion.div>
                        )}
                        {isEditing && isHoveringImage && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                            <FaCamera className="text-white text-2xl" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-grow space-y-4">
                      <AnimatePresence mode="wait">
                        {isEditing ? (
                          <motion.div
                            key="editing-form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                          >
                            <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700">Name *</label>
                              <input
                                type="text"
                                value={editedUser.name}
                                onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 mb-4 mt-2"
                                required
                              />
                            </div>
                            <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                              <input
                                type="email"
                                value={editedUser.email}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 mb-4 mt-2"
                                readOnly
                              />
                            </div>
                            <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                              <input
                                type="url"
                                value={editedUser.website}
                                onChange={(e) => setEditedUser({ ...editedUser, website: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 mb-4 mt-2"
                                placeholder="https://"
                              />
                            </div>
                            <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                              <textarea
                                value={editedUser.bio}
                                onChange={(e) => setEditedUser({ ...editedUser, bio: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 mb-4 mt-2"
                                rows={4}
                                maxLength={500}
                              />
                            </div>
                            <div className="flex space-x-4">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                onClick={handleSaveProfile}
                                disabled={isUpdating}
                                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mt-4 ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                {isUpdating ? 'Saving...' : 'Save Changes'}
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                onClick={() => {
                                  setIsEditing(false);
                                  setFormError(null);
                                  setEditedUser({
                                    name: user?.name || '',
                                    email: user?.email || '',
                                    website: user?.url || '',
                                    bio: user?.description || '',
                                    image: user?.image || ''
                                  });
                                  setSelectedImage(null);
                                }}
                                disabled={isUpdating}
                                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 mt-4"
                              >
                                Cancel
                              </motion.button>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="viewing-profile"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                          >
                            <div className="mt-4">
                              <div className="mt-4">
                                <Info label="Name" value={user?.name || 'Not set'} />
                              </div>
                              <div className="mt-4">
                                <Info label="Email" value={user?.email} />
                              </div>
                              <div className="mt-4">
                                <Info label="Username" value={user?.username || user?.slug || 'Not set'} />
                              </div>
                              <div className="mt-4">
                                <Info label="Member Since" value={user?.registered_date ? new Date(user.registered_date).toLocaleDateString() : 'Not available'} />
                              </div>
                              <div className="mt-4">
                                <Info label="Website" value={user?.url || 'Not set'} />
                              </div>
                              <div className="mt-4">
                                <Info label="Bio" value={user?.description || 'No bio provided'} />
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              onClick={() => setIsEditing(true)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mt-4"
                            >
                              Edit Profile
                            </motion.button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'topics' && (
                  <motion.div
                    key="topics-tab"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <input
                      type="text"
                      placeholder="Search my topics..."
                      value={topicsSearchTerm}
                      onChange={(e) => setTopicsSearchTerm(e.target.value)}
                      className="w-full p-2 border rounded-md mb-6"
                    />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">My Topics</h3>
                      <AnimatePresence mode="wait">
                        {filteredTopics.length === 0 ? (
                          <motion.p
                            key="no-topics"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-gray-500"
                          >
                            No topics found
                          </motion.p>
                        ) : (
                          filteredTopics.map((topic, index) => topic && (
                            <motion.div
                              key={`topic-${topic.id}`}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ delay: index * 0.1 }}
                              className='mt-5'
                            >
                              <Link
                                href={`/questions/${topic.slug || encodeURIComponent(decodeHtml(topic.title.rendered).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))}?id=${topic.id}`}
                                className="block p-3 bg-gray-50 rounded mb-2 hover:bg-gray-100"
                              >
                                <div className="font-bold text-md">{decodeHtml(topic.title.rendered)}</div>
                                <div className="text-sm text-gray-500 mt-2">{topic.date ? new Date(topic.date).toLocaleDateString() : 'Date not available'}</div>
                              </Link>
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'replies' && (
                  <motion.div
                    key="replies-tab"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <input
                      type="text"
                      placeholder="Search my replies..."
                      value={repliesSearchTerm}
                      onChange={(e) => setRepliesSearchTerm(e.target.value)}
                      className="w-full p-2 border rounded-md mb-6"
                    />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">My Replies</h3>
                      <AnimatePresence mode="wait">
                        {filteredReplies.length === 0 ? (
                          <motion.p
                            key="no-replies"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-gray-500"
                          >
                            No replies found
                          </motion.p>
                        ) : (
                          filteredReplies.map((reply, index) => reply && (
                            <motion.div
                              key={`reply-${reply.id}`}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ delay: index * 0.1 }}
                              className='mt-5'
                            >
                              <Link
                                href={`/questions/${reply.topic_slug || encodeURIComponent(decodeHtml(reply.topic_title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))}?id=${reply.topic_id}`}
                                className="block p-3 bg-gray-50 rounded mb-2 hover:bg-gray-100"
                              >
                                <div className="font-bold text-md">{reply.topic_title}</div>
                                <div className="text-sm text-gray-500 mt-2 font-bold" dangerouslySetInnerHTML={{ __html: decodeHtml(reply.content) }} />
                                <div className="text-sm text-gray-500 font-bold">{reply.date ? new Date(reply.date).toLocaleDateString() : 'Date not available'}</div>
                              </Link>
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'latest' && (
                  <motion.div
                    key="latest-tab"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <h3 className="text-lg font-semibold mb-4">Latest Activity</h3>
                    <AnimatePresence mode="wait">
                      {latestActivity.length === 0 ? (
                        <motion.p
                          key="no-activity"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-gray-500"
                        >
                          No recent activity
                        </motion.p>
                      ) : (
                        latestActivity.map((item, index) => item && (
                          <motion.div
                            key={`activity-${item.id}-${item.type}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-3 bg-gray-50 rounded mb-2"
                          >
                            <div className="flex items-center justify-between">
                              <Link
                                href={item.type === 'topic' ? item.link : `/questions/${item.topic_slug || encodeURIComponent(decodeHtml(item.topic_title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))}?id=${item.topic_id}`}
                                className="font-medium text-blue-600 hover:underline"
                              >
                                {item.type === 'topic' ? decodeHtml(item.title.rendered) : item.topic_title}
                              </Link>
                              <span className="text-sm text-gray-500">{item.type === 'topic' ? 'New Topic' : 'Reply'}</span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {item.date ? new Date(item.date).toLocaleDateString() : 'Date not available'}
                            </div>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </motion.div>
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
