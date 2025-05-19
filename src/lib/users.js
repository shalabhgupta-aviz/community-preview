import { fetcher } from "./fetcher";

// lib/users.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL; // e.g. https://dev.community.aviznetworks.com/wp-json/wp/v2
const V1= process.env.NEXT_PUBLIC_API_URL_V1; // e.g. https://dev.community.aviznetworks.com/wp-json/wp/v2/cn

export async function getUserByUsername(slug, topicPage, replyPage, perPage) {
    const res = await fetcher(`${V1}/user/slug/${slug}?topic_page=${topicPage}&reply_page=${replyPage}&per_page=${perPage}`)
    return res
}

export async function getTopicsByUser(userId, page = 1, perPage = 10) {
  const res = await fetcher(
    `${API_BASE_URL}/topic?author=${userId}&per_page=${perPage}&page=${page}`
  )
  return { items: await res.json(), totalPages: parseInt(res.headers.get('x-wp-totalpages')||'1') }
}

export async function getRepliesByUser(userId, page = 1, perPage = 10) {
  const res = await fetcher(
    `${API_BASE_URL}/reply?username=${userId}&per_page=${perPage}&page=${page}`
  )
  return { items: await res.json(), totalPages: parseInt(res.headers.get('x-wp-totalpages')||'1') }
}

export async function updateUserProfile(userData, token, userId) {
  
  // const token = document.cookie.split('; ')
  //   .find(row => row.startsWith('token='))
  //   ?.split('=')[1];

  console.log(token);
  console.log(userData);
  const res = await fetcher(`${API_BASE_URL}/users/${userId}?context=edit`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update profile');
  }

  const data = await res.json();
  console.log('res', data);

  return data;
}

export async function uploadUserAvatar(file, token, userId) {
  console.log('uploadUserAvatar', token);
  if (!token) throw new Error('Not authenticated');

  // 1) Upload the file to /media
  const form = new FormData();
  form.append('file', file);
  const mediaRes = await fetcher(`${API_BASE_URL}/media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  console.log('mediaRes', mediaRes);
  if (!mediaRes.ok) throw new Error('Media upload failed');
  const media = await mediaRes.json();

  // 2) Tell WP this is your new avatar by storing the attachment ID
  const userRes = await fetcher(`${API_BASE_URL}/users/${userId}?context=edit`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      meta: { custom_avatar: media.id },
    }),
  });
  if (!userRes.ok) {
    const err = await userRes.json();
    throw new Error(err.message || 'Failed to set avatar');
  }
  return userRes.json();
}


export async function searchUsers(query) {
  if (!query) return [];
  // hit your WP endpoint that can search by username
  const res = await fetch(
    `${V1}/users?username=${encodeURIComponent(query)}`
  );
  if (!res.ok) return [];
  const users = await res.json();
  return users.map(u => ({ id: u.username, display: u.username }));
}