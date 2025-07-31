import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, userData, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return <Loading text="Memuat..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && userData?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (userData?.isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Akun Diblokir</h2>
          <p className="text-gray-600">Akun Anda telah diblokir oleh administrator.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;