import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  // Get all the necessary data from the Redux store
  const { user, enrolledCourseIds } = useSelector((state) => state.auth);
  const { items: allCourses } = useSelector((state) => state.courses);

  // If the user data hasn't loaded yet, show a loading message
  if (!user) {
    return <div className="text-center mt-10">Loading profile...</div>;
  }

  // Find the full course objects for the enrolled courses
  const enrolledCourses = allCourses.filter(course => enrolledCourseIds.includes(course.id));

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

      {/* Main Profile Information Card */}
      <div className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 border-b pb-4 mb-4">Account Details</h2>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row">
            <strong className="w-full sm:w-1/3 text-gray-600">Email:</strong>
            <span className="w-full sm:w-2/3 text-gray-800">{user.email}</span>
          </div>
          <div className="flex flex-col sm:flex-row">
            <strong className="w-full sm:w-1/3 text-gray-600">Role:</strong>
            <span className="w-full sm:w-2/3 text-gray-800 capitalize">{user.role}</span>
          </div>
          <div className="flex flex-col sm:flex-row">
            <strong className="w-full sm:w-1/3 text-gray-600">User ID:</strong>
            <span className="w-full sm:w-2/3 text-gray-800 font-mono">{user.id}</span>
          </div>
          <div className="flex flex-col sm:flex-row">
            <strong className="w-full sm:w-1/3 text-gray-600">Firebase UID:</strong>
            <span className="w-full sm:w-2/3 text-gray-800 font-mono text-sm">{user.firebase_uid}</span>
          </div>
        </div>
      </div>

      {/* Enrolled Courses Section (only for students) */}
      {user.role === 'student' && (
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 border-b pb-4 mb-4">My Enrolled Courses</h2>
          {enrolledCourses.length > 0 ? (
            <ul className="space-y-3">
              {enrolledCourses.map(course => (
                <li key={course.id} className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition">
                  <Link to={`/course/${course.id}`} className="font-medium text-blue-600 hover:underline">
                    {course.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">You are not enrolled in any courses yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;