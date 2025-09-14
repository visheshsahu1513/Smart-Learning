import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses, enrollInCourse, deleteCourse } from '../redux/courseSlice.js';
import { addEnrolledCourse } from '../redux/authSlice.js';
import CreateCourseModal from '../components/CreateCourseModal.jsx';
import EditCourseModal from '../components/EditCourseModal.jsx';
import AssignInstructorModal from '../components/AssignInstructorModal.jsx'; // --- 1. Import the new modal ---
import { useNavigate } from 'react-router-dom';

const CoursesPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Get all necessary data from the Redux store
    const { items: courses, status, error } = useSelector((state) => state.courses);
    const { role, user, enrolledCourseIds } = useSelector((state) => state.auth);

    // State for controlling the modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false); // --- 2. Add state for the new modal ---
    const [selectedCourse, setSelectedCourse] = useState(null);

    // Fetch courses when the component mounts
    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchCourses());
        }
    }, [status, dispatch]);

    // Handler for student enrollment
    const handleEnroll = (e, courseId) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to enroll in this course?')) {
            dispatch(enrollInCourse(courseId))
                .unwrap()
                .then(() => {
                    dispatch(addEnrolledCourse(courseId));
                    alert('Successfully enrolled!');
                });
        }
    };

    // Handler for deleting a course
    const handleDelete = (e, courseId) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            dispatch(deleteCourse(courseId));
        }
    };

    // Handler for opening the edit modal
    const handleEdit = (e, course) => {
        e.stopPropagation();
        setSelectedCourse(course);
        setIsEditModalOpen(true);
    };

    // --- 3. Add a handler to open the new assign modal ---
    const handleOpenAssignModal = (e, course) => {
        e.stopPropagation();
        setSelectedCourse(course);
        setIsAssignModalOpen(true);
    };

    let content;

    if (status === 'loading') {
        content = <p className="text-center">Loading courses...</p>;
    } else if (status === 'succeeded') {
        content = (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => {
                    const isOwner = user?.id === course.owner_id;
                    const isAdmin = role === 'admin';
                    const canManage = isOwner || isAdmin;
                    const isEnrolled = enrolledCourseIds.includes(course.id);

                    return (
                        <div
                            key={course.id}
                            onClick={() => navigate(`/course/${course.id}`)}
                            className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between hover:shadow-lg transition-shadow cursor-pointer"
                        >
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">{course.title}</h3>
                                <p className="text-gray-600 mb-4 h-20 overflow-hidden">{course.description || 'No description available.'}</p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Instructor ID: {course.owner_id}
                                </p>
                            </div>

                            <div className="mt-4 space-y-2">
                                {/* View for Students */}
                                {role === 'student' && (
                                    isEnrolled ? (
                                        <button
                                            className="w-full bg-gray-400 text-white font-bold py-2 px-4 rounded cursor-not-allowed"
                                            disabled
                                        >
                                            Enrolled
                                        </button>
                                    ) : (
                                        <button
                                            onClick={(e) => handleEnroll(e, course.id)}
                                            className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600"
                                        >
                                            Enroll
                                        </button>
                                    )
                                )}

                                {/* View for Admins and Owning Instructors */}
                                {canManage && (
                                    <div className="flex space-x-2">
                                        {/* The Edit button is shown to Admins OR the owning Instructor */}
                                        <button 
                                            onClick={(e) => handleEdit(e, course)}
                                            className="w-full bg-yellow-500 text-white font-bold py-2 px-4 rounded hover:bg-yellow-600"
                                        >
                                            Edit
                                        </button>
                                        
                                        {/* The Delete and Assign buttons are ONLY shown to Admins */}
                                        {isAdmin && (
                                            <>
                                                <button 
                                                    onClick={(e) => handleDelete(e, course.id)}
                                                    className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600"
                                                >
                                                    Delete
                                                </button>
                                                {/* --- 4. Add the new Assign button --- */}
                                                <button 
                                                    onClick={(e) => handleOpenAssignModal(e, course)}
                                                    className="w-full bg-purple-500 text-white font-bold py-2 px-4 rounded hover:bg-purple-600"
                                                >
                                                    Assign
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* View for Instructors who do NOT own the course */}
                                {role === 'instructor' && !canManage && (
                                    <button className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 pointer-events-none">
                                        View Details
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    } else if (status === 'failed') {
        content = <p className="text-red-500">{error}</p>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
                {(role === 'instructor' || role === 'admin') && (
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                    >
                        Create New Course
                    </button>
                )}
            </div>
            {content}

            <CreateCourseModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
            <EditCourseModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                course={selectedCourse}
            />
            {/* --- 5. Render the new modal component --- */}
            <AssignInstructorModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                course={selectedCourse}
            />
        </div>
    );
};

export default CoursesPage;
// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchCourses, enrollInCourse, deleteCourse } from '../redux/courseSlice.js';
// import { addEnrolledCourse } from '../redux/authSlice.js';
// import CreateCourseModal from '../components/CreateCourseModal.jsx';
// import EditCourseModal from '../components/EditCourseModal.jsx';
// import { useNavigate } from 'react-router-dom';


// const CoursesPage = () => {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();

//     // Get all necessary data from the Redux store
//     const { items: courses, status, error } = useSelector((state) => state.courses);
//     const { role, user, enrolledCourseIds } = useSelector((state) => state.auth);

//     // State for controlling the modals
//     const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//     const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//     const [selectedCourse, setSelectedCourse] = useState(null);


//     // Fetch courses when the component mounts
//     useEffect(() => {
//         if (status === 'idle') {
//             dispatch(fetchCourses());
//         }
//     }, [status, dispatch]);

//     // Handler for student enrollment
//     const handleEnroll = (e, courseId) => {
//         e.stopPropagation();
//         if (window.confirm('Are you sure you want to enroll in this course?')) {
//             dispatch(enrollInCourse(courseId))
//                 .unwrap()
//                 .then(() => {
//                     dispatch(addEnrolledCourse(courseId));
//                     alert('Successfully enrolled!');
//                 });
//         }
//     };

//     // Handler for deleting a course
//     const handleDelete = (e, courseId) => {
//         e.stopPropagation();
//         if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
//             dispatch(deleteCourse(courseId));
//         }
//     };

//     // Handler for opening the edit modal
//     const handleEdit = (e, course) => {
//         e.stopPropagation();
//         setSelectedCourse(course);
//         setIsEditModalOpen(true);
//     };

//     let content;

//     if (status === 'loading') {
//         content = <p className="text-center">Loading courses...</p>;
//     } else if (status === 'succeeded') {
//         content = (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {courses.map((course) => {
//                     const isOwner = user?.id === course.owner_id;
//                     const isAdmin = role === 'admin';
//                     const canManage = isOwner || isAdmin;
//                     const isEnrolled = enrolledCourseIds.includes(course.id);

//                     return (
//                         <div
//                             key={course.id}
//                             onClick={() => navigate(`/course/${course.id}`)}
//                             className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between hover:shadow-lg transition-shadow cursor-pointer"
//                         >
//                             <div>
//                                 <h3 className="text-xl font-semibold text-gray-800 mb-2">{course.title}</h3>
//                                 <p className="text-gray-600 mb-4 h-20 overflow-hidden">{course.description || 'No description available.'}</p>
//                                 <p className="text-sm text-gray-500 mt-2">
//                                     Instructor ID: {course.owner_id}
//                                 </p>
//                             </div>

//                             <div className="mt-4 space-y-2">
//                                 {/* View for Students */}
//                                 {role === 'student' && (
//                                     isEnrolled ? (
//                                         <button
//                                             className="w-full bg-gray-400 text-white font-bold py-2 px-4 rounded cursor-not-allowed"
//                                             disabled
//                                         >
//                                             Enrolled
//                                         </button>
//                                     ) : (
//                                         <button
//                                             onClick={(e) => handleEnroll(e, course.id)}
//                                             className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600"
//                                         >
//                                             Enroll
//                                         </button>
//                                     )
//                                 )}

//                                 {/* --- MODIFICATION HERE --- */}
//                                 {/* View for Admins and Owning Instructors */}
//                                 {canManage && (
//                                     <div className="flex space-x-2">
//                                         {/* The Edit button is shown to Admins OR the owning Instructor */}
//                                         <button 
//                                             onClick={(e) => handleEdit(e, course)}
//                                             className="w-full bg-yellow-500 text-white font-bold py-2 px-4 rounded hover:bg-yellow-600"
//                                         >
//                                             Edit
//                                         </button>
                                        
//                                         {/* The Delete button is ONLY shown to Admins */}
//                                         {isAdmin && (
//                                             <button 
//                                                 onClick={(e) => handleDelete(e, course.id)}
//                                                 className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600"
//                                             >
//                                                 Delete
//                                             </button>
//                                         )}
//                                     </div>
//                                 )}
//                                 {/* --- END MODIFICATION --- */}

//                                 {/* View for Instructors who do NOT own the course */}
//                                 {role === 'instructor' && !canManage && (
//                                     <button className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 pointer-events-none">
//                                         View Details
//                                     </button>
//                                 )}
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>
//         );
//     } else if (status === 'failed') {
//         content = <p className="text-red-500">{error}</p>;
//     }

//     return (
//         <div>
//             <div className="flex justify-between items-center mb-6">
//                 <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
//                 {(role === 'instructor' || role === 'admin') && (
//                     <button
//                         onClick={() => setIsCreateModalOpen(true)}
//                         className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
//                     >
//                         Create New Course
//                     </button>
//                 )}
//             </div>
//             {content}

//             <CreateCourseModal
//                 isOpen={isCreateModalOpen}
//                 onClose={() => setIsCreateModalOpen(false)}
//             />
//             <EditCourseModal
//                 isOpen={isEditModalOpen}
//                 onClose={() => setIsEditModalOpen(false)}
//                 course={selectedCourse}
//             />
//         </div>
//     );
// };

// export default CoursesPage;