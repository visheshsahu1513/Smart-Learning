import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import  {apiFastAPI}  from '../api/axios';
import { auth as firebaseAuth } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// --- Async Thunks (for API calls) ---

/**
 * Thunk for user signup. (This is already correct)
 */
export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const firebase_uid = userCredential.user.uid;
      const response = await apiFastAPI.post('/auth/signup', { email, firebase_uid });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * --- THE FIX IS HERE ---
 * Thunk for user login, now using the correct Firebase-first flow.
 */
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // Step 1: Sign in with Firebase directly from the frontend.
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);

      // Step 2: Get the genuine Firebase ID Token from the successful sign-in.
      const idToken = await userCredential.user.getIdToken();

      if (!idToken) {
        return rejectWithValue('Login failed: Could not retrieve Firebase token.');
      }
      
      // We only need to return the token. The App.jsx will trigger the profile fetch.
      return { token: idToken };
    } catch (error) {
      // This will catch Firebase errors like "auth/wrong-password" or "auth/user-not-found".
      const errorMessage = error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * This dedicated thunk fetches the user's full profile using a token.
 * (This is already correct and does not need to be changed).
 */
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      if (!token) {
        return rejectWithValue('No token found for profile fetch');
      }
      const response = await apiFastAPI.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      // This will now correctly catch the "Invalid Firebase ID token" if the token expires.
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch user profile');
    }
  }
);


// --- Auth Slice Definition ---
// (The rest of the file is correct and does not need changes)

const initialState = {
  user: null,
  token: null,
  role: null,
  isAuthenticated: false,
  status: 'idle',
  error: null,
  enrolledCourseIds: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      Object.assign(state, initialState); // Reset to initial state
      localStorage.removeItem('auth');
    },
    addEnrolledCourse: (state, action) => {
      if (!state.enrolledCourseIds.includes(action.payload)) {
        state.enrolledCourseIds.push(action.payload);
      }
    },
    setInitialAuth: (state, action) => {
        state.token = action.payload.token;
        state.isAuthenticated = !!action.payload.token;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login Actions
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.token = action.payload.token;
        localStorage.setItem('auth', JSON.stringify({ token: action.payload.token }));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Signup Actions
      .addCase(signupUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Profile Fetch Actions
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { enrolled_course_ids, ...userData } = action.payload;
        state.user = userData;
        state.role = userData.role;
        state.enrolledCourseIds = enrolled_course_ids || [];
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        console.error("Profile fetch failed, logging out:", action.payload);
        Object.assign(state, initialState);
        localStorage.removeItem('auth');
      });
  },
});

export const { logout, addEnrolledCourse, setInitialAuth } = authSlice.actions;
export default authSlice.reducer;