import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext'; // Make sure this path is correct

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);

  // Show loading indicator while authentication status is being checked
  if (loading) {
    return <div>Loading...</div>; // You can replace this with a loading spinner or custom component
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && (!user || user.role !== 'admin')) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;