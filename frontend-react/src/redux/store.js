import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js'; 
import assessmentReducer from './assessmentSlice.js';
import courseReducer from './courseSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    assessments: assessmentReducer,
    courses: courseReducer,
  },
});