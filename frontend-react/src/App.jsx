import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setInitialAuth, fetchUserProfile } from './redux/authSlice'; // Import the new actions
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';

import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AssessmentsPage from './pages/AssessmentsPage.jsx';
import AssessmentDetailPage from './pages/AssessmentDetailPage.jsx';
import CoursesPage from './pages/CoursesPage.jsx';
import MyGradesPage from './pages/MyGradesPage.jsx';
import CourseDetailPage from './pages/CourseDetailPage.jsx';
import DashboardPage from './components/DashboardPage.jsx';

import ProfilePage from './pages/ProfilePage.jsx';

function App() {
  const dispatch = useDispatch();
  // Get the token from the Redux state to trigger the profile fetch
  const { token } = useSelector(state => state.auth);

  // --- STEP 1: This effect runs only ONCE when the app first loads ---
  useEffect(() => {
    // Check if we have auth data saved in local storage from a previous session
    const storedAuth = JSON.parse(localStorage.getItem('auth'));
    if (storedAuth && storedAuth.token) {
      // If so, put the token into our Redux store to start with.
      // This will trigger the second useEffect hook.
      dispatch(setInitialAuth(storedAuth));
    }
  }, [dispatch]);

  // --- STEP 2: This effect runs whenever the 'token' in our Redux store changes ---
  // (This happens on initial load from storage, or after a successful login)
  useEffect(() => {
    if (token) {
      // If we have a token, it's time to fetch the full user profile from the backend.
      // This action will get the user's details AND their enrolled_course_ids.
      dispatch(fetchUserProfile());
    }
  }, [token, dispatch]);

  return (
    <Router>
      <div className="font-sans bg-gray-50 min-h-screen">
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          {/* --- Protected Routes --- */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="course/:courseId" element={<CourseDetailPage />} />
            <Route path="assessments" element={<AssessmentsPage />} />
            <Route path="assessment/:assessmentId" element={<AssessmentDetailPage />} />
            <Route path="my-grades" element={<MyGradesPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          
          {/* --- Fallback Route --- */}
          <Route path="*" element={<h1 className="text-3xl font-bold text-center mt-10">404 Not Found</h1>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import LoginPage from './pages/LoginPage.jsx';
// import SignupPage from './pages/SignupPage.jsx';
// import Layout from './components/Layout.jsx';
// import ProtectedRoute from './components/ProtectedRoute.jsx';
// import AssessmentsPage from './pages/AssessmentsPage.jsx';
// import AssessmentDetailPage from './pages/AssessmentDetailPage.jsx';
// import CoursesPage from './pages/CoursesPage.jsx';
// import MyGradesPage from './pages/MyGradesPage.jsx';
// import CourseDetailPage from './pages/CourseDetailPage.jsx';

// import DashboardPage from './components/DashboardPage.jsx';

// function App() {
//   return (
//     <Router>
//       <div className="font-sans bg-gray-50 min-h-screen">
//         <Routes>
//           {/* --- Public Routes --- */}
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/signup" element={<SignupPage />} />
          
//           {/* --- Protected Routes --- */}
//           <Route 
//             path="/" 
//             element={
//               <ProtectedRoute>
//                 <Layout />
//               </ProtectedRoute>
//             }
//           >
//             {/* --- NEW: Use the real DashboardPage for the index route --- */}
//             <Route index element={<DashboardPage />} />
//             <Route path="courses" element={<CoursesPage />} />
//             <Route path="course/:courseId" element={<CourseDetailPage />} />
//             <Route path="assessments" element={<AssessmentsPage />} />
//             <Route path="assessment/:assessmentId" element={<AssessmentDetailPage />} />
//             <Route path="my-grades" element={<MyGradesPage />} />
//           </Route>
          
//           {/* --- Fallback Route --- */}
//           <Route path="*" element={<h1 className="text-3xl font-bold text-center mt-10">404 Not Found</h1>} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;