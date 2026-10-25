import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { checkIsModeratorOrAdmin } from '../../../lib/permissions';
import { LayoutDashboard, Users, Flag, ShieldAlert, FileText, ArrowLeft } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    async function verifyAdminAccess() {
      if (!user) {
        setIsAuthorized(false);
        return;
      }
      const hasAccess = await checkIsModeratorOrAdmin(user.uid);
      setIsAuthorized(hasAccess);
    }

    if (!authLoading) {
      verifyAdminAccess();
    }
  }, [user, authLoading]);

  if (authLoading || isAuthorized === null) {
    return (
      <div className="min-h-screen bg-background text-text-secondary flex items-center justify-center text-sm">
        Memverifikasi wewenang akses administratif...
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="bg-surface border border-red-500/20 rounded-2xl p-8 max-w-md text-center">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">Akses Ditolak</h2>
          <p className="text-sm text-text-secondary mb-6">
            Halaman ini khusus untuk Pengelola dan Administrator OLEXTY Community.
          </p>
          <button
            onClick={() => navigate('/community')}
            className="bg-surface border border-border hover:bg-border/30 text-text-primary px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            Kembali ke Komunitas
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Ringkasan', path: '/admin', icon: LayoutDashboard },
    { label: 'Anggota & Peran', path: '/admin/members', icon: Users },
    { label: 'Laporan & Moderasi', path: '/admin/reports', icon: Flag },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Admin */}
      <aside className="w-64 bg-surface border-r border-border p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-extrabold text-lg text-text-primary tracking-wider">OLEXTY</h1>
              <span className="text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 bg-accent/20 text-accent rounded-full">
                Admin Suite
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-accent text-white'
                      : 'text-text-secondary hover:text-text-primary hover:bg-background/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <Link
          to="/community"
          className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary transition-colors pt-4 border-t border-border"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Situs Utama
        </Link>
      </aside>

      {/* Area Konten Utama */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};