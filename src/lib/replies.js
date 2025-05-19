// src/lib/api/replies.js

import { fetcher } from "./fetcher";

// ← use the same V1 base you use for createReply
const V1 = process.env.NEXT_PUBLIC_API_URL_V1;

// ✅ Get replies of a specific question
// src/lib/replies.js

export async function getRepliesForQuestion(questionId, page, perPage) {
  const res = await fetcher(`${V1}/reply?topic_id=${questionId}&per_page=${perPage}&page=${page}`);
  if (res.error) throw new Error(res.error || 'Failed to fetch replies');
  return res;
}

// ✅ Get replies directly from a topic
export async function getReplyOfTopic(topicId) {
  const response = await fetcher(`${V1}/reply?parent=${topicId}`);
  if (response.error) throw new Error(response.error || 'Failed to fetch replies for topic');
  return response;
}

// ✅ Create a new bbPress reply
export async function createReply(topicId, content, token, status = 'publish') {
  const res = await fetcher(`${V1}/reply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      content,        // the body of the reply
      parent: topicId, // topic ID the reply belongs to
      status,
    }),
  });
  console.log('res', res);

  if (res.error) {
    throw new Error(res.error || 'Failed to create reply');
  }
  return res;
}

// ✅ Update a reply (either edit a draft or flip to publish)
export async function updateReply(replyId, content, token, status = 'publish') {
  const response = await fetcher(
    `${V1}/reply/${replyId}`,     // ← point at the v1 namespace
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content,
        status,                   // ← let the API know if it stays a draft or goes live
      }),
    }
  );
  if (response.error) throw new Error(response.error || 'Failed to update reply');
  return response;
}

// ✅ Delete a reply (draft or published)
export async function deleteReply(replyId, token) {
  const response = await fetcher(
    `${V1}/reply/${replyId}`,    // ← again, use V1
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (response.error) {
    throw new Error(response.error || 'Failed to delete reply');
  }
  return response;
}

// ✅ Get recent replies
export async function getRecentReplies() {
  const replies = await fetcher(
    `${V1}/community/v1/recent-replies`
  );
  if (replies.error) throw new Error(replies.error || 'Failed to fetch recent replies');
  return replies;
} 



export async function toggleLike(replyId, token) {
  const res = await fetch(`${V1}/reply/${replyId}/like`, {
    method: 'POST',
    credentials: 'include',            // send cookies or JWT header
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return res;
}