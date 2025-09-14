import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssessments } from '../redux/assessmentSlice';
import CreateAssessmentModal from '../components/CreateAssessmentModal';
// --- NEW: Import useNavigate for programmatic navigation ---
import { useNavigate } from 'react-router-dom';

const AssessmentsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // --- NEW: Get the navigate function ---
  const { items: assessments, status, error } = useSelector((state) => state.assessments);
  const { role } = useSelector((state) => state.auth);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchAssessments());
    }
  }, [status, dispatch]);

  let content;

  if (status === 'loading') {
    content = <p>Loading assessments...</p>;
  } else if (status === 'succeeded') {
    content = (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments.map((assessment) => (
          // --- NEW: Changed from <Link> to a <div> with an onClick handler ---
          <div 
            key={assessment.id} 
            onClick={() => navigate(`/assessment/${assessment.id}`)} // Navigate on click
            className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer" // Added cursor-pointer
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{assessment.title}</h3>
            <p className="text-gray-600 mb-4">{assessment.description}</p>
            <a 
              href={assessment.questionFileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              // This prevents the click on the download link from triggering the div's onClick
              onClick={(e) => e.stopPropagation()}
              className="text-blue-500 hover:text-blue-700 font-semibold"
            >
              Download Questions
            </a>
          </div>
        ))}
      </div>
    );
  } else if (status === 'failed') {
    content = <p className="text-red-500">{error}</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Assessments</h1>
        {role === 'instructor' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Create New Assessment
          </button>
        )}
      </div>
      {content}

      <CreateAssessmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default AssessmentsPage;