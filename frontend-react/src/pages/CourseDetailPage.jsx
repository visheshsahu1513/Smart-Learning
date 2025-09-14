import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchCourseMaterials, 
  fetchEnrolledStudents, 
  uploadCourseMaterial,
  clearSelectedCourse 
} from '../redux/courseSlice.js';

// --- Upload Material Form Component (for Instructors) ---
const UploadMaterialForm = ({ courseId }) => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !file) {
      alert('Title and file are required.');
      return;
    }
    dispatch(uploadCourseMaterial({ courseId, title, file }))
      .unwrap()
      .then(() => {
        setTitle('');
        setFile(null);
        e.target.reset(); // Reset the form fields
      });
  };

  return (
    <div className="mt-8 bg-gray-50 p-6 rounded-lg border">
      <h3 className="text-xl font-semibold mb-4">Upload New Material</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="material-title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            id="material-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="material-file" className="block text-sm font-medium text-gray-700">File</label>
          <input
            type="file"
            id="material-file"
            onChange={(e) => setFile(e.target.files[0])}
            className="mt-1 block w-full"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600">
          Upload
        </button>
      </form>
    </div>
  );
};


const CourseDetailPage = () => {
  const { courseId } = useParams();
  const dispatch = useDispatch();

  const { role, user } = useSelector((state) => state.auth);
  const { items: allCourses } = useSelector((state) => state.courses);
  const { materials, students, status } = useSelector((state) => state.courses.selectedCourse);

  const courseDetails = allCourses.find(c => c.id.toString() === courseId);
  const isOwner = user?.id === courseDetails?.owner_id;

  useEffect(() => {
    if (courseId) {
      // Fetch materials (for both students and instructors)
      dispatch(fetchCourseMaterials(courseId));
      // Fetch enrolled students (only if user is an instructor)
      if (role === 'instructor' || role === 'student') {
        // dispatch(fetchCourseMaterials(courseId));
        dispatch(fetchEnrolledStudents(courseId));
      }
    }
    // Cleanup when the component unmounts
    return () => {
      dispatch(clearSelectedCourse());
    };
  }, [courseId, dispatch, role]);

  if (!courseDetails) {
    return <div>Loading course details...</div>;
  }

  return (
    <div>
      {/* --- Course Header --- */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{courseDetails.title}</h1>
        <p className="mt-2 text-gray-600">{courseDetails.description}</p>
      </div>

      {/* --- Main Content Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Course Materials */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Course Materials</h2>
          {status === 'loading' && <p>Loading materials...</p>}
          {status === 'succeeded' && materials.length > 0 && (
            <ul className="space-y-3">
              {materials.map(material => (
                <li key={material.id} className="bg-white p-4 rounded-md shadow-sm flex justify-between items-center">
                  <span className="font-medium">{material.title}</span>
                  <a href={material.download_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    Download
                  </a>
                </li>
              ))}
            </ul>
          )}
          {status === 'succeeded' && materials.length === 0 && <p>No materials have been uploaded for this course yet.</p>}
          
          {/* Show upload form for the instructor who owns the course */}
          {role === 'instructor' && isOwner && <UploadMaterialForm courseId={courseId} />}
        </div>

        {/* Right Column: Enrolled Students (for instructors only) */}
        {(role === 'admin' || role === 'instructor') && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Enrolled Students</h2>
            {students.length > 0 ? (
              <ul className="space-y-2">
                {students.map(student => (
                  <li key={student.id} className="text-gray-700">{student.email}</li>
                ))}
              </ul>
            ) : (
              <p>No students are currently enrolled.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetailPage;