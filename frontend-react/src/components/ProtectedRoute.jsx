import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Get the authentication status from the Redux store
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const location = useLocation();

  // If the authentication status is still being determined (e.g., on first page load),
  // it's good practice to show a loading indicator to prevent a "flicker" to the login page.
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  // If the user is not authenticated, redirect them to the login page.
  // We pass the original location they were trying to access in the state.
  // This allows us to redirect them back to their intended page after a successful login.
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If the user is authenticated, render the child components (the actual page).
  return children;
};

export default ProtectedRoute;