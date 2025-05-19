// src/lib/search.js

import { fetcher } from "./fetcher";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const V1_URL = process.env.NEXT_PUBLIC_API_URL_V1

/**
 * Search for topics matching a query
 * @param {string} query - The search string
 * @returns {Promise<Array>} - List of matching topics
 */
export async function searchTopics(query) {
  const response = await fetcher(`${API_BASE_URL}/search/topics?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Failed to search topics');
  return response.json();
}

export async function allSearch(query){
  const url = new URL(`${V1_URL}/search`);
  url.searchParams.set('q', encodeURIComponent(query));
  url.searchParams.set('per_page', '3');

  const res = await fetcher(url.toString());
  return res;
}

/**
 * Search for users matching a query
 * @param {string} query - The search string
 * @returns {Promise<Array>} - List of matching users
 */
export async function searchUsers(query) {
  const response = await fetcher(`${API_BASE_URL}/search/users?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Failed to search users');
  return response.json();
}
