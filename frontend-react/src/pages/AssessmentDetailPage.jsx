// src/pages/AssessmentDetailPage.jsx

import React, { useEffect, useState } from 'react'; // --- Import useState ---
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubmissionsForAssessment, clearSelectedAssessment } from '../redux/assessmentSlice';
import StudentSubmissionForm from '../components/StudentSubmissionForm';
import InstructorGradingView from '../components/InstructorGradingView';

const AssessmentDetailPage = () => {
  const { assessmentId } = useParams();
  const dispatch = useDispatch();

  // CHANGE #1: Add a local state variable. This will be our manual trigger.
  const [justSubmitted, setJustSubmitted] = useState(false);

  const { role, user } = useSelector((state) => state.auth);
  const { items: allAssessments } = useSelector((state) => state.assessments);
  const { submissions, status: submissionsStatus } = useSelector((state) => state.assessments.selectedAssessment);

  const assessmentDetails = allAssessments.find(a => a.id.toString() === assessmentId);

  useEffect(() => {
    if (assessmentId && (role === 'instructor' || role === 'admin')) {
      dispatch(fetchSubmissionsForAssessment(assessmentId));
    }
    
    return () => {
      dispatch(clearSelectedAssessment());
    };
  }, [assessmentId, dispatch, role]);

  // CHANGE #2: Create the handler function that the child form will call on success.
  const handleSubmissionSuccess = () => {
    // Calling this state setter GUARANTEES a re-render of this component.
    setJustSubmitted(true);
  };
  
  // CHANGE #3: Update the condition to also check our manual trigger.
  const hasUserSubmitted = submissions.some(sub => sub.studentFirebaseUid === user?.firebaseUid) || justSubmitted;

  if (!assessmentDetails) {
    return <div>Loading assessment details...</div>;
  }

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{assessmentDetails.title}</h1>
        <p className="text-gray-600 mb-4">{assessmentDetails.description}</p>
        <a 
          href={assessmentDetails.questionFileUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 font-bold"
        >
          Download Question Paper
        </a>
      </div>
      
      {(role === 'instructor' || role === 'admin') && (
        submissionsStatus === 'loading' 
          ? <p className="mt-8 text-center">Loading submissions...</p> 
          : <InstructorGradingView submissions={submissions} />
      )}

      {/* CHANGE #4: Pass the handler function down to the form as a prop. */}
      {role === 'student' && !hasUserSubmitted && (
        <StudentSubmissionForm 
          assessmentId={assessmentId} 
          onSubmissionSuccess={handleSubmissionSuccess} 
        />
      )}

      {role === 'student' && hasUserSubmitted && (
        <div className="mt-8 bg-green-100 text-green-800 p-4 rounded-lg shadow-md">
          <p className="font-semibold text-center">You have already submitted your answer for this assessment.</p>
        </div>
      )}
    </div>
  );
};

export default AssessmentDetailPage;
// import React, { useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchSubmissionsForAssessment, clearSelectedAssessment } from '../redux/assessmentSlice';
// import StudentSubmissionForm from '../components/StudentSubmissionForm';
// import InstructorGradingView from '../components/InstructorGradingView';

// const AssessmentDetailPage = () => {
//   const { assessmentId } = useParams();
//   const dispatch = useDispatch();

//   const { role, user } = useSelector((state) => state.auth);
//   const { items: allAssessments } = useSelector((state) => state.assessments);
//   const { submissions, status: submissionsStatus } = useSelector((state) => state.assessments.selectedAssessment);

//   const assessmentDetails = allAssessments.find(a => a.id.toString() === assessmentId);

//   useEffect(() => {
//     // Fetch submissions if the user is an instructor.
//     // This is now the only condition needed to see the submissions list.
//     if (assessmentId && (role === 'instructor' || role === 'admin')) {
//       dispatch(fetchSubmissionsForAssessment(assessmentId));
//     }
    
//     return () => {
//       dispatch(clearSelectedAssessment());
//     };
//   }, [assessmentId, dispatch, role]);

//   // --- REMOVED: The isCreator check is no longer needed for this simplified logic ---
//   // const isCreator = user?.firebaseUid === assessmentDetails?.creatorFirebaseUid;
  
//   const hasUserSubmitted = submissions.some(sub => sub.studentFirebaseUid === user?.firebaseUid);

//   if (!assessmentDetails) {
//     return <div>Loading assessment details...</div>;
//   }

//   return (
//     <div>
//       <div className="bg-white p-6 rounded-lg shadow-md">
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">{assessmentDetails.title}</h1>
//         <p className="text-gray-600 mb-4">{assessmentDetails.description}</p>
//         <a 
//           href={assessmentDetails.questionFileUrl} 
//           target="_blank" 
//           rel="noopener noreferrer"
//           className="text-blue-600 hover:text-blue-800 font-bold"
//         >
//           Download Question Paper
//         </a>
//       </div>
      
//       {/* --- NEW: Simplified condition. Only checks if the role is 'instructor'. --- */}
//       {(role === 'instructor' || role === 'admin') && (
//         submissionsStatus === 'loading' 
//           ? <p className="mt-8 text-center">Loading submissions...</p> 
//           : <InstructorGradingView submissions={submissions} />
//       )}

//       {/* Student views remain the same */}
//       {role === 'student' && !hasUserSubmitted && (
//         <StudentSubmissionForm assessmentId={assessmentId} />
//       )}

//       {role === 'student' && hasUserSubmitted && (
//         <div className="mt-8 bg-green-100 text-green-800 p-4 rounded-lg shadow-md">
//           <p className="font-semibold text-center">You have already submitted your answer for this assessment.</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AssessmentDetailPage;