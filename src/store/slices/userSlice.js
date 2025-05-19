import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profile: null,
  latestTopics: [],
  latestReplies: [], 
  loading: false,
  error: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserProfile(state, action) {
      state.profile = action.payload;
    },
    setLatestTopics(state, action) {
      state.latestTopics = action.payload;
    },
    setLatestReplies(state, action) {
      state.latestReplies = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    clearUserData(state) {
      state.profile = null;
      state.latestTopics = [];
      state.latestReplies = [];
      state.loading = false;
      state.error = null;
    }
  }
});

export const { 
  setUserProfile,
  setLatestTopics, 
  setLatestReplies,
  setLoading,
  setError,
  clearUserData
} = userSlice.actions;

export default userSlice.reducer;
