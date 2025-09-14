import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { gradeSubmission } from '../redux/assessmentSlice';

const InstructorGradingView = ({ submissions }) => {
  const dispatch = useDispatch();
  const [grades, setGrades] = useState({}); // Local state to hold input values
  
  // Get the loading status from the Redux slice
  const { status } = useSelector((state) => state.assessments.selectedAssessment);
  // Local state to track which specific row's "Save" button was clicked
  const [gradingId, setGradingId] = useState(null);

  const handleGradeChange = (submissionId, value) => {
    setGrades(prev => ({ ...prev, [submissionId]: value }));
  };

  const handleGradeSubmit = (submissionId) => {
    const grade = grades[submissionId];
    if (!grade) {
      alert('Please enter a grade before saving.');
      return;
    }
    setGradingId(submissionId); // Set which submission is currently being graded
    dispatch(gradeSubmission({ submissionId, grade }))
      .finally(() => {
        setGradingId(null); // Reset the specific loading state after the API call is done
      });
  };

  if (!submissions || submissions.length === 0) {
    return <p className="mt-8 text-center text-gray-500">No submissions have been made for this assessment yet.</p>;
  }

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Student Submissions</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Answer File</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Grade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assign Grade</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {submissions.map(sub => (
              <tr key={sub.id}>
                <td className="px-6 py-4 whitespace-nowrap">{sub.studentEmail || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(sub.submittedAt).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <a href={sub.answerFileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Download</a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold">{sub.grade || 'Not Graded'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="text"
                      placeholder="e.g., A+"
                      onChange={(e) => handleGradeChange(sub.id, e.target.value)}
                      className="border rounded px-2 py-1 w-24"
                    />
                    <button 
                      onClick={() => handleGradeSubmit(sub.id)}
                      // Disable only the button for the row being graded
                      disabled={status === 'loading' && gradingId === sub.id}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm disabled:bg-gray-400"
                    >
                      {status === 'loading' && gradingId === sub.id ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstructorGradingView;