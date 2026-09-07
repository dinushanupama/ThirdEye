import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  // Wait for the auth context to finish checking local storage
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium">Loading session...</p>
      </div>
    );
  }

  // If no user is authenticated, redirect to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If the route is restricted to specific roles, verify the user's role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect unauthorized users to their own report history
    return <Navigate to="/my-reports" replace />;
  }

  // If authorized, render the child components (the actual page)
  return <Outlet />;
};

export default ProtectedRoute;