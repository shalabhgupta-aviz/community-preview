// src/lib/questions.js

import { fetcher } from "./fetcher";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const V1 = process.env.NEXT_PUBLIC_API_URL_V1

// Get all questions under a topic with pagination
export async function getQuestionsOfTopic(id, page = 1, perPage = 5) {
  const response = await fetcher(`${API_BASE_URL}/topic?forum_id=${id}&per_page=${perPage}&page=${page}`);
  console.log('response', response);
  return response;
}

// Get single question detail by ID with 5 latest replies
export async function getQuestionDetails(questionId, page, perPage, token) {
  const url = `${V1}/topic/${questionId}?per_page=${perPage}&page=${page}`
  // only attach the header if we have a token
  const headers = {};
  console.log('token', url, {
    credentials: 'include',      // send cookies if you’re using WP‐cookie auth
    headers,
  });
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetcher(url, {
    credentials: 'include',      // send cookies if you’re using WP‐cookie auth
    headers,
  }
);
  console.log('response', response);
  return response;
}

export async function getQuestions(page, perPage) {
  const response = await fetcher(`${API_BASE_URL}/topic?per_page=${perPage}&page=${page}`);
  return response;
}


export async function getRecentQuestions(perPage) {
  const res = await fetcher(`${V1}/recent-topics?per_page=${perPage}`);
  return res;
}


export async function createQuestion(
  forumId,
  title,
  content,
  token,
  status
) {
  const url = `${V1}/topic`;
  const response = await fetcher(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      forum_id: forumId,
      title,
      content,
      status,
    }),
  });
  console.log('response',{
    forum_id: forumId,
    title,
    content,
    status,
  } );
  return response;
}



export async function updateQuestion(
  questionId,
  fields = {}, 
  token
) {
  const url = `${V1}/topic/${questionId}`;
  const res = await fetcher(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(fields),
  });

  return res;
}


export async function deleteQuestion(topicId, token) {
  const url = `${V1}/topic/${topicId}`;
  const res = await fetcher(url, {
  method: 'DELETE',
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return res;
}