import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses } from '../redux/courseSlice.js';
import { fetchAssessments } from '../redux/assessmentSlice.js';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const dispatch = useDispatch();

  // Get user info for the welcome message
  const { user } = useSelector((state) => state.auth);
  
  // Get courses data
  const { items: courses, status: coursesStatus } = useSelector((state) => state.courses);
  
  // Get assessments data
  const { items: assessments, status: assessmentsStatus } = useSelector((state) => state.assessments);

  // Fetch data when the component mounts
  useEffect(() => {
    // Fetch only if the data hasn't been loaded yet
    if (coursesStatus === 'idle') {
      dispatch(fetchCourses());
    }
    if (assessmentsStatus === 'idle') {
      dispatch(fetchAssessments());
    }
  }, [coursesStatus, assessmentsStatus, dispatch]);

  return (
    <div>
      {/* --- Welcome Header --- */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.email}!</h1>
        <p className="mt-1 text-lg text-gray-600">Here's a quick overview of your learning environment.</p>
      </div>

      {/* --- Main Content Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Upcoming Courses */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Featured Courses</h2>
          <div className="space-y-4">
            {coursesStatus === 'loading' && <p>Loading courses...</p>}
            {courses.slice(0, 3).map(course => ( // Show the first 3 courses
              <div key={course.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg text-blue-600">{course.title}</h3>
                  <p className="text-sm text-gray-500">Instructor ID: {course.owner_id}</p>
                </div>
                <Link to={`/course/${course.id}`} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-200">
                  View Course
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Assessment Schedule */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Assessment Schedule</h2>
          <div className="space-y-4">
            {assessmentsStatus === 'loading' && <p>Loading assessments...</p>}
            {assessments.slice(0, 4).map(assessment => ( // Show the first 4 assessments
              <div key={assessment.id} className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-gray-700">{assessment.title}</h4>
                {/* Using creation date as a placeholder for the due date */}
                <p className="text-sm text-gray-500">Posted on: {new Date(assessment.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
            {assessments.length === 0 && assessmentsStatus === 'succeeded' && (
              <p className="text-gray-500">No assessments scheduled yet.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;