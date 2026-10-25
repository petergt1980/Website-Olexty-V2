import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SocialLinks } from '../types';
import { Shield, Home, Users, Video, MessageSquare, Bell, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const location = useLocation();
  const [config, setConfig] = useState<SocialLinks>({});

  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator';
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'communityConfig'), (docSnap) => {
      if (docSnap.exists()) {
        setConfig(docSnap.data() as SocialLinks);
      }
    });
    return () => unsubscribe();
  }, []);

  const logoSrc = config.logoUrl || '/OLEXTY.jpg';
  const siteName = config.siteName || 'OLEXTY';
  const siteSubName = config.siteSubName || 'COMMUNITY';
  const siteTagline = config.siteTagline || 'Esports & Gaming Hub';

  return (
    <header className="bg-[#181A22] border-b border-[#292C36] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo Header Dinamis */}
        <Link to="/community" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B8CF8] via-[#6366F1] to-[#4F46E5] p-0.5 shadow-lg shadow-[#8B8CF8]/25 group-hover:scale-105 transition-transform overflow-hidden">
            <div className="w-full h-full bg-[#181A22] rounded-[10px] overflow-hidden flex items-center justify-center">
              <img
                src={logoSrc}
                alt="Website Logo"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              />
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="font-extrabold text-base sm:text-lg tracking-wider text-[#F4F5F8] leading-none">
              {siteName} <span className="text-[#8B8CF8]">{siteSubName}</span>
            </span>
            <span className="text-[9px] font-bold text-[#9CA3B4] tracking-widest uppercase mt-0.5">
              {siteTagline}
            </span>
          </div>
        </Link>

        {/* Navigasi Utama */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/community"
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              isActive('/community')
                ? 'bg-[#8B8CF8]/10 text-[#8B8CF8]'
                : 'text-[#9CA3B4] hover:text-[#F4F5F8] hover:bg-[#292C36]/50'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Komunitas</span>
          </Link>

          <Link
            to="/clips"
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              isActive('/clips')
                ? 'bg-[#8B8CF8]/10 text-[#8B8CF8]'
                : 'text-[#9CA3B4] hover:text-[#F4F5F8] hover:bg-[#292C36]/50'
            }`}
          >
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">Clips</span>
          </Link>

          <Link
            to="/members"
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              isActive('/members')
                ? 'bg-[#8B8CF8]/10 text-[#8B8CF8]'
                : 'text-[#9CA3B4] hover:text-[#F4F5F8] hover:bg-[#292C36]/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Anggota</span>
          </Link>

          {user && (
            <>
              <Link
                to="/messages"
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  isActive('/messages')
                    ? 'bg-[#8B8CF8]/10 text-[#8B8CF8]'
                    : 'text-[#9CA3B4] hover:text-[#F4F5F8] hover:bg-[#292C36]/50'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Pesan</span>
              </Link>

              <Link
                to="/notifications"
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  isActive('/notifications')
                    ? 'bg-[#8B8CF8]/10 text-[#8B8CF8]'
                    : 'text-[#9CA3B4] hover:text-[#F4F5F8] hover:bg-[#292C36]/50'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Notifikasi</span>
              </Link>
            </>
          )}

          {user && isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                isActive('/admin') || isActive('/admin/settings')
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10'
              }`}
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline font-semibold">Admin Panel</span>
            </Link>
          )}
        </nav>

        {/* Profil / Tombol Masuk */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/settings"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-[#8B8CF8]/20 border border-[#292C36] overflow-hidden flex items-center justify-center text-[#8B8CF8] font-bold text-xs">
                  {profile?.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    profile?.displayName?.[0] || 'U'
                  )}
                </div>
                <span className="text-xs text-[#F4F5F8] font-medium hidden md:inline">
                  {profile?.displayName}
                </span>
              </Link>

              <button
                onClick={logout}
                title="Keluar"
                className="p-2 text-[#9CA3B4] hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs text-[#9CA3B4] hover:text-[#F4F5F8] transition-colors"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 bg-[#8B8CF8] hover:bg-[#7879E8] text-white rounded-xl text-xs font-medium transition-colors"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};