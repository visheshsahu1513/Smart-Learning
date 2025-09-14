import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateCourse } from '../redux/courseSlice.js';

const EditCourseModal = ({ isOpen, onClose, course }) => {
  // Pre-fill the form with the course data when the modal opens
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.courses);

  // This effect runs whenever the 'course' prop changes (i.e., when a new course is selected for editing)
  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setDescription(course.description || '');
    }
  }, [course]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) {
      alert('Title is required.');
      return;
    }
    dispatch(updateCourse({ courseId: course.id, courseData: { title, description } }))
      .unwrap()
      .then(() => {
        onClose(); // Close the modal on successful update
      });
  };

  // Don't render the modal if it's not open or if there's no course data
  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Edit Course</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="edit-course-title" className="block text-gray-700 font-bold mb-2">Title</label>
            <input
              type="text"
              id="edit-course-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="edit-course-description" className="block text-gray-700 font-bold mb-2">Description</label>
            <textarea
              id="edit-course-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              rows="4"
            ></textarea>
          </div>
          {error && status === 'failed' && <p className="text-red-500 mb-4">{error}</p>}
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
              Cancel
            </button>
            <button type="submit" disabled={status === 'loading'} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:bg-blue-300">
              {status === 'loading' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourseModal;