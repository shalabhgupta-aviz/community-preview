// src/lib/api/auth.js
import Cookies from 'js-cookie';
import { fetcher } from '@/lib/fetcher';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const NEXT_PUBLIC_JWT_AUTH_URL = process.env.NEXT_PUBLIC_JWT_AUTH_URL;
const V1 = process.env.NEXT_PUBLIC_API_URL_V1;
export async function loginUser(username, password) {
  // 1) get the JWT
  const { data: jwtBody, status: jwtStatus, error: jwtError } =
    await fetcher(`${NEXT_PUBLIC_JWT_AUTH_URL}/jwt-auth/v1/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
  if (jwtStatus !== 200 || jwtError) {
    throw new Error(jwtBody?.message || jwtError || 'Login failed');
  }
  const token = jwtBody.token;
  setToken(token);

  // 2) fetch the full user object, unwrap it
  const { data: userData, status: userStatus, error: userError } =
    await fetcher(`${API_BASE_URL}/users/me?context=edit`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  if (userStatus !== 200 || userError) {
    throw new Error(userError || 'Could not fetch profile');
  }
  return { token, user: userData };
}




export function setToken(token) {
  Cookies.set('token', token, { expires: 7, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' });
}

export function getToken() {

  console.log('Cookies', Cookies.get('token'));
  return Cookies.get('token');
}

export function removeToken() {
  Cookies.remove('token');
}

export async function register(username, email, password) {
  const res = await fetcher(`${V1}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  if(res.status === 200) {
    const token = res.data.token; 
    console.log('token', token);
    setToken(token);
    const user = await getUserProfile(token);
    return { token, user:user.data };
  } else {
    throw new Error(res.error);
  }

}

export function logout() {
  if (typeof window !== 'undefined') {
    removeToken();

    // Clear all cookies (if needed)
    document.cookie.split(';').forEach(c => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });
  }
  return { success: true };
}

export async function getUserProfile(token) {
  try {
    const res = await fetcher(`${API_BASE_URL}/users/me?context=edit`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.error) {
      throw new Error(res.error);
    }
    return res;
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return { error: error.message };
  }
}

export async function updateUserProfile(userId, data, token) {
  const res = await fetcher(`${API_BASE_URL}/user/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  return res.json();
}


// src/lib/auth.js
export async function socialLogin(provider, idToken) {
  const res = await fetcher(
    `${process.env.NEXT_PUBLIC_API_URL}/community/v1/social-login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, id_token: idToken })
    }
  );
  if (!res.ok) throw new Error('Social login failed');
  return res.json(); // => { token: '…', user: { … } }
}
