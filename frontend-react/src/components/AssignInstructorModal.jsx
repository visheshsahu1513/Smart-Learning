import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { assignInstructor } from '../redux/courseSlice';
import { apiFastAPI } from '../api/axios'; // We'll use this for our direct API call

const AssignInstructorModal = ({ isOpen, onClose, course }) => {
  // State now holds the *selected* ID from the dropdown
  const [selectedInstructorId, setSelectedInstructorId] = useState('');
  
  // State to hold the list of potential instructors fetched from the API
  const [instructorList, setInstructorList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth); // Get token for the API call
  const { status: assignmentStatus } = useSelector((state) => state.courses);

  // --- NEW: Fetch the list of instructors when the modal opens ---
  useEffect(() => {
    // Only fetch if the modal is open and we haven't already fetched the list
    if (isOpen && instructorList.length === 0) {
      setIsLoading(true);
      // Make a direct API call to the new /users endpoint
      apiFastAPI.get('/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        // Filter the full user list to only include potential instructors
        const potentialInstructors = response.data.filter(
          user => user.role === 'instructor' 
        );
        setInstructorList(potentialInstructors);
      })
      .catch(error => {
        console.error("Failed to fetch users", error);
        alert("Could not load the instructor list. Please check permissions.");
      })
      .finally(() => {
        setIsLoading(false);
      });
    }
  }, [isOpen, token, instructorList.length]);


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedInstructorId || !course) {
      alert('Please select an instructor from the list.');
      return;
    }
    dispatch(assignInstructor({ courseId: course.id, instructorId: parseInt(selectedInstructorId) }))
      .unwrap()
      .then(() => {
        setSelectedInstructorId('');
        onClose();
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2">Assign Instructor</h2>
        <p className="text-gray-600 mb-4">
          Assign a new instructor to the course: <span className="font-semibold">{course?.title}</span>
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="instructor-select" className="block text-gray-700 font-bold mb-2">
              Select Instructor
            </label>
            {/* --- THE UI CHANGE: From <input> to <select> --- */}
            <select
              id="instructor-select"
              value={selectedInstructorId}
              onChange={(e) => setSelectedInstructorId(e.target.value)}
              className="w-full px-3 py-2 border rounded bg-white"
              required
              disabled={isLoading}
            >
              <option value="" disabled>
                {isLoading ? 'Loading instructors...' : '-- Please choose an instructor --'}
              </option>
              {instructorList.map(instructor => (
                <option key={instructor.id} value={instructor.id}>
                  {instructor.email} (ID: {instructor.id})
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
              Cancel
            </button>
            <button type="submit" disabled={assignmentStatus === 'loading'} className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded disabled:bg-purple-300">
              {assignmentStatus === 'loading' ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignInstructorModal;