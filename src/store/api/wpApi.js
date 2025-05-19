import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

export const wpApi = createApi({
  reducerPath: 'wpApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers, { getState }) => {
      // grab the WP JWT from Redux state
      const token = getState().auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Topics', 'Replies', 'User'],
  endpoints: (builder) => ({
    // Get all topics
    getTopics: builder.query({
      query: () => '/topic',
      providesTags: ['Topics'],
    }),

    // Get replies by topic/question ID
    getReplies: builder.query({
      query: (id) => `/reply?parent=${id}`,
      providesTags: (result, error, id) => [{ type: 'Replies', id }],
    }),

    // Get current user details
    getCurrentUser: builder.query({
      query: () => ({
        url: '/users/me?context=edit',
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`, // Use token from cookies
        },
      }),
      providesTags: ['User'],
    }),

    // Update user profile
    updateUser: builder.mutation({
      query: ({ id, data }) => {
        console.log('id', id);
        console.log('data', data);
        return {
          url: `/users/${id}?context=edit`,
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get('token')}`, // Use token from cookies
          },
          body: JSON.stringify(data),
        };
      },
      invalidatesTags: ['User'],
    }),
  }),
});

// Export auto-generated hooks
export const {
  useGetTopicsQuery,
  useGetRepliesQuery,
  useGetCurrentUserQuery,
  useUpdateUserMutation,
} = wpApi;
