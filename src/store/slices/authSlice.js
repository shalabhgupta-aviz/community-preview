// store/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { removeToken } from '@/lib/auth';

const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) { state.loading = true; state.error = null },
    loginSuccess(state, action) {
      state.loading = false;
      state.token   = action.payload.token;
      state.user    = action.payload.user;
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error   = action.payload;
    },
    logout(state) {
      state.user  = null;
      state.token = null;
      removeToken();
    },
    // ← NEW:
    setUser(state, action) {
      state.user = action.payload;
    },
    normal(state) {
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;
    }
  }
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  setUser,
  normal
} = authSlice.actions;

export default authSlice.reducer;