import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

interface ProtectedRoutesProps {
  requireAdmin?: boolean;
}

export const ProtectedRoutes: React.FC<ProtectedRoutesProps> = ({ requireAdmin = false }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-xs text-[#9CA3B4]">
        Memuat sesi autentikasi...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && profile?.role !== 'admin' && profile?.role !== 'moderator') {
    return <Navigate to="/community" replace />;
  }

  return <Outlet />;
};