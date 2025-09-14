import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createAssessment } from '../redux/assessmentSlice';

const CreateAssessmentModal = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.assessments);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !file) {
      alert('Title and file are required.');
      return;
    }
    dispatch(createAssessment({ title, description, file }))
      .unwrap()
      .then(() => {
        // On success, reset the form and close the modal
        setTitle('');
        setDescription('');
        setFile(null);
        onClose();
      });
  };

  // If the modal is not open, render nothing
  if (!isOpen) return null;

  return (
    // This is the modal overlay
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      {/* This is the modal content */}
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Create New Assessment</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 font-bold mb-2">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 font-bold mb-2">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              rows="3"
            ></textarea>
          </div>
          <div className="mb-6">
            <label htmlFor="file" className="block text-gray-700 font-bold mb-2">Question Paper (PDF, Image, etc.)</label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              className="w-full"
              required
            />
          </div>
          {error && status === 'failed' && <p className="text-red-500 mb-4">{error}</p>}
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
              Cancel
            </button>
            <button type="submit" disabled={status === 'loading'} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:bg-blue-300">
              {status === 'loading' ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssessmentModal;