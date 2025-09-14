import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFastAPI } from '../api/axios';
import axios from 'axios';

// --- Async Thunks (for API calls to FastAPI) ---

export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiFastAPI.get('/courses/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

// export const fetchCourses = createAsyncThunk(
//   'courses/fetchCourses',
//   async (_, { rejectWithValue }) => {
//     try {
//       // --- THIS IS THE DIAGNOSTIC LINE ---
//       // This will print the exact baseURL being used to the browser's console.
//       console.log("Fetching courses using baseURL:", apiFastAPI.defaults.baseURL);

//       const response = await apiFastAPI.get('/courses');
//       return response.data;
//     } catch (error) {
//       // Log the full error object for more details
//       console.error("Error fetching courses:", error);
//       return rejectWithValue(error.response?.data?.detail || error.message);
//     }
//   }
// );
// export const fetchCourses = createAsyncThunk(
//   'courses/fetchCourses',
//   async (_, { rejectWithValue }) => {
//     try {
//       // --- DIAGNOSTIC LOG ---
//       console.log("DIAGNOSTIC [courseSlice.js]: Fetching courses using baseURL:", apiFastAPI.defaults.baseURL);
      
//       const response = await apiFastAPI.get('/courses');
//       return response.data;
//     } catch (error) {
//       console.error("DIAGNOSTIC [courseSlice.js]: Error fetching courses:", error);
//       return rejectWithValue(error.response?.data?.detail || error.message);
//     }
//   }
// );

export const createCourse = createAsyncThunk(
  'courses/createCourse',
  async (courseData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiFastAPI.post('/courses/', courseData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

export const enrollInCourse = createAsyncThunk(
  'courses/enrollInCourse',
  async (courseId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiFastAPI.post(`/courses/${courseId}/enroll`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { courseId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

export const fetchCourseMaterials = createAsyncThunk(
  'courses/fetchCourseMaterials',
  async (courseId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiFastAPI.get(`/courses/${courseId}/materials`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

export const fetchEnrolledStudents = createAsyncThunk(
  'courses/fetchEnrolledStudents',
  async (courseId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiFastAPI.get(`/courses/${courseId}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

export const uploadCourseMaterial = createAsyncThunk(
  'courses/uploadCourseMaterial',
  async ({ courseId, title, file }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const formData = new FormData();
      formData.append('title', title);
      formData.append('file', file);
      const response = await apiFastAPI.post(`/courses/${courseId}/materials`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

export const deleteCourse = createAsyncThunk(
  'courses/deleteCourse',
  async (courseId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      await apiFastAPI.delete(`/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return courseId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

export const updateCourse = createAsyncThunk(
  'courses/updateCourse',
  async ({ courseId, courseData }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiFastAPI.put(`/courses/${courseId}`, courseData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);

export const assignInstructor = createAsyncThunk(
  'courses/assignInstructor',
  async ({ courseId, instructorId }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      // The payload must match what the FastAPI endpoint expects
      const payload = { instructor_id: instructorId };
      const response = await apiFastAPI.patch(`/courses/${courseId}/assign-instructor`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // The backend returns the updated course, so we return it here
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || error.message);
    }
  }
);


// --- Course Slice Definition ---

const initialState = {
  items: [],
  status: 'idle',
  error: null,
  selectedCourse: {
    details: null,
    materials: [],
    students: [],
    status: 'idle',
  },
};

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearSelectedCourse: (state) => {
      state.selectedCourse = {
        details: null,
        materials: [],
        students: [],
        status: 'idle',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })
      
      .addCase(createCourse.pending, (state) => { state.status = 'loading'; })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items.unshift(action.payload);
      })
      .addCase(createCourse.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })
      
      .addCase(enrollInCourse.fulfilled, (state, action) => {
        console.log(action.payload.message);
      })
      .addCase(enrollInCourse.rejected, (state, action) => {
        alert(`Enrollment failed: ${action.payload}`);
      })
      
      .addCase(fetchCourseMaterials.pending, (state) => { state.selectedCourse.status = 'loading'; })
      .addCase(fetchCourseMaterials.fulfilled, (state, action) => {
        state.selectedCourse.status = 'succeeded';
        state.selectedCourse.materials = action.payload;
      })
      .addCase(fetchCourseMaterials.rejected, (state, action) => { state.selectedCourse.status = 'failed'; state.error = action.payload; })
      
      .addCase(fetchEnrolledStudents.fulfilled, (state, action) => {
        state.selectedCourse.students = action.payload;
      })
      
      .addCase(uploadCourseMaterial.pending, (state) => { state.selectedCourse.status = 'loading'; })
      .addCase(uploadCourseMaterial.fulfilled, (state, action) => {
        state.selectedCourse.status = 'succeeded';
        state.selectedCourse.materials.push(action.payload);
      })
      .addCase(uploadCourseMaterial.rejected, (state, action) => { state.selectedCourse.status = 'failed'; state.error = action.payload; })
      
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.items = state.items.filter(course => course.id !== action.payload);
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        alert(`Failed to delete course: ${action.payload}`);
      })
      
      .addCase(updateCourse.fulfilled, (state, action) => {
        const updatedCourse = action.payload;
        const index = state.items.findIndex(course => course.id === updatedCourse.id);
        if (index !== -1) {
          state.items[index] = updatedCourse;
        }
      })
      .addCase(assignInstructor.fulfilled, (state, action) => {
        const updatedCourse = action.payload;
        // Find the course in the state and update it with the new data
        const index = state.items.findIndex(course => course.id === updatedCourse.id);
        if (index !== -1) {
          state.items[index] = updatedCourse;
        }
        alert('Instructor assigned successfully!');
      })
      .addCase(assignInstructor.rejected, (state, action) => {
        alert(`Failed to assign instructor: ${action.payload}`);
      })
      .addCase(updateCourse.rejected, (state, action) => {
        alert(`Failed to update course: ${action.payload}`);
      });
  },
});

export const { clearSelectedCourse } = courseSlice.actions;
export default courseSlice.reducer;