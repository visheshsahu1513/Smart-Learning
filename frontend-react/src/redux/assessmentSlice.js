import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiSpringBoot } from '../api/axios';

// --- Async Thunks (for API calls to Spring Boot) ---

// Fetches the main list of all assessments
export const fetchAssessments = createAsyncThunk(
  'assessments/fetchAssessments',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiSpringBoot.get('/api/assessments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Creates a new assessment (for instructors)
export const createAssessment = createAsyncThunk(
  'assessments/createAssessment',
  async ({ title, description, file }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const formData = new FormData();
      const assessmentJson = JSON.stringify({ title, description });
      const assessmentBlob = new Blob([assessmentJson], { type: 'application/json' });
      formData.append('assessment', assessmentBlob);
      formData.append('file', file);
      const response = await apiSpringBoot.post('/api/assessments', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetches all submissions for a single assessment (for instructor's grading view)
export const fetchSubmissionsForAssessment = createAsyncThunk(
  'assessments/fetchSubmissionsForAssessment',
  async (assessmentId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiSpringBoot.get(`/api/assessments/${assessmentId}/submissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { assessmentId, submissions: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Submits an answer file for an assessment (for students)
export const submitAnswer = createAsyncThunk(
  'assessments/submitAnswer',
  async ({ assessmentId, file }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiSpringBoot.post(`/api/assessments/${assessmentId}/submit`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Assigns a grade to a specific submission (for instructors)
export const gradeSubmission = createAsyncThunk(
  'assessments/gradeSubmission',
  async ({ submissionId, grade }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiSpringBoot.post(`/api/assessments/submissions/${submissionId}/grade`, { grade }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetches all submissions made by the current student (for "My Grades" page)
export const fetchMyGrades = createAsyncThunk(
  'assessments/fetchMyGrades',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiSpringBoot.get('/api/assessments/my-grades', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


// --- Assessment Slice Definition ---

const initialState = {
  items: [], // For the main list of all assessments
  status: 'idle', // Status for the main list
  error: null, // General error for the slice
  selectedAssessment: {
    submissions: [],
    status: 'idle', // Status for fetching/acting on a single assessment's submissions
  },
  mySubmissions: {
    items: [],
    status: 'idle', // Status for the "My Grades" page
    error: null,
  },
};

const assessmentSlice = createSlice({
  name: 'assessments',
  initialState,
  reducers: {
    // Resets the state for the detail page when the user navigates away
    clearSelectedAssessment: (state) => {
        state.selectedAssessment = {
            submissions: [],
            status: 'idle',
        };
    }
  },
  extraReducers: (builder) => {
    builder
      // Cases for fetching the main list of assessments
      .addCase(fetchAssessments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAssessments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchAssessments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Cases for creating a new assessment
      .addCase(createAssessment.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createAssessment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items.unshift(action.payload);
      })
      .addCase(createAssessment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Cases for fetching submissions for a single assessment
      .addCase(fetchSubmissionsForAssessment.pending, (state) => {
        state.selectedAssessment.status = 'loading';
      })
      .addCase(fetchSubmissionsForAssessment.fulfilled, (state, action) => {
        state.selectedAssessment.status = 'succeeded';
        state.selectedAssessment.submissions = action.payload.submissions;
      })
      .addCase(fetchSubmissionsForAssessment.rejected, (state, action) => {
        state.selectedAssessment.status = 'failed';
        state.error = action.payload;
      })
      // Cases for a student submitting an answer
      .addCase(submitAnswer.pending, (state) => {
        state.selectedAssessment.status = 'loading';
      })
      .addCase(submitAnswer.fulfilled, (state, action) => {
  state.selectedAssessment.status = 'succeeded';
  // This creates a new array, which guarantees React will see the change.
  state.selectedAssessment.submissions = [...state.selectedAssessment.submissions, action.payload];
})
      .addCase(submitAnswer.rejected, (state, action) => {
        state.selectedAssessment.status = 'failed';
        state.error = action.payload;
      })
      // Cases for an instructor grading a submission
      .addCase(gradeSubmission.pending, (state) => {
        state.selectedAssessment.status = 'loading';
      })
      .addCase(gradeSubmission.fulfilled, (state, action) => {
        state.selectedAssessment.status = 'succeeded';
        const updatedSubmission = action.payload;
        const index = state.selectedAssessment.submissions.findIndex(s => s.id === updatedSubmission.id);
        if (index !== -1) {
          state.selectedAssessment.submissions[index] = updatedSubmission;
        }
      })
      .addCase(gradeSubmission.rejected, (state, action) => {
        state.selectedAssessment.status = 'failed';
        state.error = action.payload;
      })
      // Cases for fetching the student's own grades
      .addCase(fetchMyGrades.pending, (state) => {
        state.mySubmissions.status = 'loading';
      })
      .addCase(fetchMyGrades.fulfilled, (state, action) => {
        state.mySubmissions.status = 'succeeded';
        state.mySubmissions.items = action.payload;
      })
      .addCase(fetchMyGrades.rejected, (state, action) => {
        state.mySubmissions.status = 'failed';
        state.mySubmissions.error = action.payload;
      });
  },
});

export const { clearSelectedAssessment } = assessmentSlice.actions;
export default assessmentSlice.reducer;