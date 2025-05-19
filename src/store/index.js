// src/store/index.js
import { configureStore, combineReducers } from '@reduxjs/toolkit'
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authReducer from './slices/authSlice'
import { wpApi } from './api/wpApi'    // ← your RTK Query api

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],               // only persist auth slice
}

const rootReducer = combineReducers({
  auth: authReducer,
  [wpApi.reducerPath]: wpApi.reducer, // ← add the api reducer here
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(wpApi.middleware),      // ← add the api middleware here
})

export const persistor = persistStore(store)