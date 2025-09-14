import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCourse } from '../redux/courseSlice';

const CreateCourseModal = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.courses);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) {
      alert('Title is required.');
      return;
    }
    dispatch(createCourse({ title, description }))
      .unwrap()
      .then(() => {
        setTitle('');
        setDescription('');
        onClose();
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Create New Course</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="course-title" className="block text-gray-700 font-bold mb-2">Title</label>
            <input
              type="text"
              id="course-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="course-description" className="block text-gray-700 font-bold mb-2">Description</label>
            <textarea
              id="course-description"
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
              {status === 'loading' ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseModal;