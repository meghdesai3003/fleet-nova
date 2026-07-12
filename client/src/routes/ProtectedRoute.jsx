import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy-200 border-t-navy-900" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-16 text-center">
        <p className="font-display text-lg font-semibold text-ink-900">Access restricted</p>
        <p className="text-sm text-ink-500">Your role ({user.role}) doesn't have permission to view this page.</p>
      </div>
    );
  }

  return children;
}
