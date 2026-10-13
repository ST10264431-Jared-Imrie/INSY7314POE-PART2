import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute
 * Props:
 *  - allowedRoles: string[]  roles permitted to access this route
 *  - children: ReactNode
 *
 * Behaviour:
 *  - While auth is loading, show nothing (or a spinner).
 *  - Not authenticated  → redirect to /login
 *  - Wrong role         → redirect to their correct dashboard
 *  - Correct role       → render children
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return null; // or a full-page spinner
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the dashboard matching the user's actual role
    const dashboardPath =
      user.role === 'client'
        ? '/dashboard/client'
        : '/dashboard/freelancer';
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
