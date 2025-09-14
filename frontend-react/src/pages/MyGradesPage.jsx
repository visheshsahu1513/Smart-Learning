import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyGrades } from '../redux/assessmentSlice';

const MyGradesPage = () => {
  const dispatch = useDispatch();
  
  // --- NEW: We no longer need to select the 'allAssessments' list ---
  const { items: mySubmissions, status, error } = useSelector((state) => state.assessments.mySubmissions);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchMyGrades());
    }
  }, [status, dispatch]);

  // --- REMOVED: The getAssessmentTitle function is no longer needed ---

  let content;

  if (status === 'loading') {
    content = <p>Loading your grades...</p>;
  } else if (status === 'succeeded') {
    if (mySubmissions.length === 0) {
      content = <p className="text-center text-gray-500">You have not made any submissions yet.</p>;
    } else {
      content = (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* --- NEW: Changed column header from "Assessment Title" to "Assessment ID" --- */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assessment ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your Submission</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mySubmissions.map(sub => (
                <tr key={sub.id}>
                  {/* --- NEW: Display the assessmentId directly --- */}
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">#{sub.assessmentId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(sub.submittedAt).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a href={sub.answerFileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View File</a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-800">{sub.grade || 'Not Graded Yet'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  } else if (status === 'failed') {
    content = <p className="text-red-500">{error}</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Grades</h1>
      {content}
    </div>
  );
};

export default MyGradesPage;