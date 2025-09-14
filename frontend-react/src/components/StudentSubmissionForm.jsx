// // src/components/StudentSubmissionForm.jsx
// src/components/StudentSubmissionForm.jsx

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitAnswer } from '../redux/assessmentSlice';

// CHANGE #1: Accept the new 'onSubmissionSuccess' prop from the parent page.
const StudentSubmissionForm = ({ assessmentId, onSubmissionSuccess }) => {
  const [file, setFile] = useState(null);
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.assessments.selectedAssessment);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file to submit.');
      return;
    }
    
    // CHANGE #2: We wait for the dispatch to succeed, then call the function.
    dispatch(submitAnswer({ assessmentId, file }))
      .unwrap() // This makes the promise resolve on success and reject on failure.
      .then(() => {
        // This block ONLY runs if the backend returns a 200 OK.
        console.log("API call successful! Manually triggering UI update.");
        onSubmissionSuccess(); // This calls the function passed from the parent.
      })
      .catch((err) => {
        // This block runs if the API call fails.
        console.error("Submission API call failed:", err);
        alert(`Submission failed: ${err.message || 'Please try again.'}`);
      });
  };

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Submit Your Answer</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="answerFile" className="block text-gray-700 font-bold mb-2">
            Upload your file
          </label>
          <input
            type="file"
            id="answerFile"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full"
            required
          />
        </div>
        {error && status === 'failed' && <p className="text-red-500 mb-4">{error}</p>}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:bg-blue-300"
        >
          {status === 'loading' ? 'Submitting...' : 'Submit Answer'}
        </button>
      </form>
    </div>
  );
};

export default StudentSubmissionForm;
// import React, { useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { submitAnswer } from '../redux/assessmentSlice';

// const StudentSubmissionForm = ({ assessmentId }) => {
//   const [file, setFile] = useState(null);
//   const dispatch = useDispatch();
//   const { status, error } = useSelector((state) => state.assessments.selectedAssessment);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!file) {
//       alert('Please select a file to submit.');
//       return;
//     }
//     // Just dispatch the action. No .then() or .catch() needed here.
//     dispatch(submitAnswer({ assessmentId, file }));
//   };

//   return (
//     <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
//       <h3 className="text-xl font-semibold mb-4">Submit Your Answer</h3>
//       <form onSubmit={handleSubmit}>
//         <div className="mb-4">
//           <label htmlFor="answerFile" className="block text-gray-700 font-bold mb-2">
//             Upload your file
//           </label>
//           <input
//             type="file"
//             id="answerFile"
//             onChange={(e) => setFile(e.target.files[0])}
//             className="w-full"
//             required
//           />
//         </div>
//         {error && status === 'failed' && <p className="text-red-500 mb-4">{error}</p>}
//         <button
//           type="submit"
//           disabled={status === 'loading'}
//           className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:bg-blue-300"
//         >
//           {status === 'loading' ? 'Submitting...' : 'Submit Answer'}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default StudentSubmissionForm;