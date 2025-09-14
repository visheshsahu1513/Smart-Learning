import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { logout } from '../redux/authSlice';
// --- NEW: Import the Footer component ---
import Footer from './Footer.jsx';

const Layout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { role, user } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const baseLinkClass = "px-3 py-2 rounded-md text-sm font-medium";
    const activeLinkClass = "bg-blue-600 text-white";
    const inactiveLinkClass = "text-gray-700 hover:bg-gray-200 hover:text-gray-900";

    const getNavLinkClass = ({ isActive }) => {
        return `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`;
    };
    const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : null;

    return (
        // --- NEW: Use flexbox to make the footer stick to the bottom ---
        <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
            <div> {/* This wrapper div contains the Navbar and main content */}
                {/* --- Navigation Bar --- */}
                <nav className="bg-white shadow-md sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            {/* Left side: Logo and main links */}
                            <div className="flex items-center">
                                <NavLink to="/" className="text-2xl font-bold text-blue-600">LMS</NavLink>
                                <div className="hidden md:block">
                                    <div className="ml-10 flex items-baseline space-x-4">
                                        <NavLink to="/" className={getNavLinkClass}>Home</NavLink>
                                        <NavLink to="/courses" className={getNavLinkClass}>Courses</NavLink>
                                        <NavLink to="/assessments" className={getNavLinkClass}>Assessments</NavLink>
                                        {role === 'student' && (
                                            <NavLink to="/my-grades" className={getNavLinkClass}>My Grades</NavLink>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right side: User info and logout button */}
                            <div className="hidden md:block">
                                <div className="ml-4 flex items-center md:ml-6">
                                    <span className="text-gray-600 mr-3">
                                        Welcome, <span className="font-semibold">{user?.email}</span> ({role})
                                    </span>


                                    <button
                                        onClick={handleLogout}
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium"
                                    >
                                        Logout
                                    </button>
                                    <Link to="/profile" title="View Profile" className="ml-2">
              {userInitial ? (
                // If we have a user, show a circle with their initial
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg hover:bg-blue-600 transition-colors">
                  {userInitial}
                </div>
              ) : (
                // Fallback icon if the user hasn't loaded yet
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                  <svg xmlns="https://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* --- Main Content Area --- */}
                <main>
                    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* --- NEW: Add the Footer component at the end --- */}
            <Footer />
        </div>
    );
};

export default Layout;