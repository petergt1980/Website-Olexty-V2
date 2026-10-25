import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Video, Users, Calendar, Trophy, Shield, Bell, MessageCircle, Settings } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, profile } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-[#181A22] border-b border-[#292C36] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo / Brand dengan OLEXTY.jpg */}
        <Link to="/community" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-[#8B8CF8]/30 flex items-center justify-center bg-[#14161D]">
            <img 
              src="/OLEXTY.jpg" 
              alt="OLEXTY" 
              className="w-full h-full object-cover" 
              onError={(e) => {
                // Fallback jika gambar gagal dimuat
                e.currentTarget.style.display = 'none';
              }} 
            />
          </div>
          <div>
            <span className="font-bold text-sm text-[#F4F5F8] tracking-wide block">OLEXTY COMMUNITY</span>
            <span className="text-[10px] text-[#9CA3B4] block">CIRCLE NOT MARGA</span>
          </div>
        </Link>

        {/* Menu Navigasi Utama */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link
            to="/community"
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
              isActive('/community') ? 'bg-[#8B8CF8]/10 text-[#8B8CF8]' : 'text-[#9CA3B4] hover:text-[#F4F5F8]'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Komunitas
          </Link>
          <Link
            to="/clips"
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
              isActive('/clips') ? 'bg-[#8B8CF8]/10 text-[#8B8CF8]' : 'text-[#9CA3B4] hover:text-[#F4F5F8]'
            }`}
          >
            <Video className="w-4 h-4" /> Clips
          </Link>
          <Link
            to="/members"
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
              isActive('/members') ? 'bg-[#8B8CF8]/10 text-[#8B8CF8]' : 'text-[#9CA3B4] hover:text-[#F4F5F8]'
            }`}
          >
            <Users className="w-4 h-4" /> Anggota
          </Link>
          <Link
            to="/events"
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
              isActive('/events') ? 'bg-[#8B8CF8]/10 text-[#8B8CF8]' : 'text-[#9CA3B4] hover:text-[#F4F5F8]'
            }`}
          >
            <Calendar className="w-4 h-4" /> Events
          </Link>
          <Link
            to="/leaderboard"
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
              isActive('/leaderboard') ? 'bg-[#8B8CF8]/10 text-[#8B8CF8]' : 'text-[#9CA3B4] hover:text-[#F4F5F8]'
            }`}
          >
            <Trophy className="w-4 h-4" /> Leaderboard
          </Link>
        </nav>

        {/* User Actions & Settings */}
        <div className="flex items-center gap-3">
          {profile?.role === 'admin' && (
            <Link
              to="/admin"
              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" /> Admin Panel
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/messages"
                className={`p-2 rounded-xl bg-[#14161D] border border-[#292C36] ${
                  isActive('/messages') ? 'text-[#8B8CF8] border-[#8B8CF8]/30' : 'text-[#9CA3B4] hover:text-[#F4F5F8]'
                }`}
                title="Pesan"
              >
                <MessageCircle className="w-4 h-4" />
              </Link>
              <Link
                to="/notifications"
                className={`p-2 rounded-xl bg-[#14161D] border border-[#292C36] ${
                  isActive('/notifications') ? 'text-[#8B8CF8] border-[#8B8CF8]/30' : 'text-[#9CA3B4] hover:text-[#F4F5F8]'
                }`}
                title="Notifikasi"
              >
                <Bell className="w-4 h-4" />
              </Link>
              
              {/* Tombol Settings */}
              <Link
                to="/settings"
                className="bg-[#8B8CF8]/10 hover:bg-[#8B8CF8]/20 text-[#8B8CF8] border border-[#8B8CF8]/20 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" /> Settings
              </Link>

              <Link
                to={`/user/${user.uid}`}
                className="flex items-center gap-2 bg-[#14161D] border border-[#292C36] px-3 py-1.5 rounded-xl text-xs font-semibold text-[#F4F5F8] hover:border-[#8B8CF8]/50 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-[#8B8CF8]/20 flex items-center justify-center text-[#8B8CF8] font-bold text-[10px] overflow-hidden">
                  {profile?.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    profile?.displayName?.[0] || 'U'
                  )}
                </div>
                <span>{profile?.displayName || 'Akun'}</span>
              </Link>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-[#8B8CF8] hover:bg-[#7879E8] text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};