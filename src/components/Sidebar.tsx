import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Video, Trophy, Calendar, Flame, Users, MessageSquare, Bell, Settings, Shield } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator';

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/community', label: 'Feed Komunitas', icon: Home },
    { path: '/clips', label: 'Clip Showcase', icon: Video },
    { path: '/roster', label: 'Tim Roster', icon: Trophy },
    { path: '/events', label: 'Jadwal Scrim', icon: Calendar },
    { path: '/leaderboard', label: 'Leaderboard', icon: Flame },
    { path: '/members', label: 'Anggota', icon: Users },
    { path: '/messages', label: 'Pesan', icon: MessageSquare },
    { path: '/notifications', label: 'Notifikasi', icon: Bell },
    { path: '/settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#181A22] border border-[#292C36] rounded-2xl p-4 space-y-2 h-fit hidden md:block">
      <div className="text-[11px] font-semibold text-[#9CA3B4] px-3 py-1 uppercase tracking-wider">
        Navigasi Utama
      </div>
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              isActive(item.path)
                ? 'bg-[#8B8CF8]/10 text-[#8B8CF8] font-semibold'
                : 'text-[#9CA3B4] hover:text-[#F4F5F8] hover:bg-[#292C36]/50'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}

      {isAdmin && (
        <div className="pt-3 border-t border-[#292C36]">
          <div className="text-[11px] font-semibold text-amber-400 px-3 py-1 uppercase tracking-wider">
            Area Admin
          </div>
          <Link
            to="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              isActive('/admin')
                ? 'bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20'
                : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10'
            }`}
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Admin Panel</span>
          </Link>
        </div>
      )}
    </aside>
  );
};