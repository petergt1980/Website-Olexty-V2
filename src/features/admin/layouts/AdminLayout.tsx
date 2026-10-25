import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { isAdminOrModerator } from '../../../lib/permissions';

export const AdminLayout: React.FC = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-xs text-[#9CA3B4]">
        Memuat hak akses admin...
      </div>
    );
  }

  if (!user || !profile || !isAdminOrModerator(profile)) {
    return <Navigate to="/community" replace />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Outlet />
    </div>
  );
};