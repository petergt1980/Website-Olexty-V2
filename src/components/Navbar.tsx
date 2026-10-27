import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { 
  MessageSquare, 
  Film, 
  Users, 
  Calendar, 
  Trophy, 
  Shield, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  MessageCircle,
  Zap
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const Navbar: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [siteLogo, setSiteLogo] = useState('/OLEXTY.png');
  const [siteName, setSiteName] = useState('OLEXTY COMMUNITY');

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'communityConfig'));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.logoUrl) setSiteLogo(data.logoUrl);
          if (data.siteName) setSiteName(data.siteName);
        }
      } catch (err) {
        console.error('Gagal memuat branding navbar:', err);
      }
    };
    fetchBranding();
  }, []);

  const navItems = [
    { label: 'Komunitas', path: '/', icon: MessageSquare },
    { label: 'Clips', path: '/clips', icon: Film },
    { label: 'Anggota', path: '/members', icon: Users },
    { label: 'Events', path: '/events', icon: Calendar },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { label: 'Arcade', path: '/arcade', icon: Zap },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-3 z-50 max-w-7xl mx-auto px-4 sm:px-6 mb-6">
      {/* --- LIQUID GLASS CONTAINER --- */}
      <nav className="relative rounded-2xl backdrop-blur-xl bg-[#14161D]/65 border border-white/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.45)] transition-all duration-300 overflow-hidden">
        {/* Kilapan Glossy Refleksi Cair di Bagian Atas */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-to-b from-white/[0.07] to-transparent pointer-events-none rounded-2xl" />

        <div className="flex items-center justify-between h-16 px-4 sm:px-6">
          
          {/* LOGO & BRANDING */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/20 p-0.5 shadow-md bg-white/5 backdrop-blur-md group-hover:scale-105 transition-transform duration-300">
              <img 
                src={siteLogo} 
                alt="OLEXTY Logo" 
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => { (e.target as HTMLImageElement).src = '/OLEXTY.jpg'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#8B8CF8]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-black tracking-tight text-[#F4F5F8] group-hover:text-[#8B8CF8] transition-colors flex items-center gap-1.5">
                {siteName}
              </span>
              <span className="text-[9px] font-extrabold text-[#9CA3B4] tracking-widest uppercase block -mt-1">
                Circle Not Marga
              </span>
            </div>
          </Link>

          {/* DESKTOP NAV ITEMS */}
          <div className="hidden lg:flex items-center gap-1 bg-white/[0.03] border border-white/10 p-1.5 rounded-xl backdrop-blur-md">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-[#8B8CF8] to-[#6C6DE8] text-white shadow-lg shadow-[#8B8CF8]/25 border border-white/20 scale-[1.02]'
                      : 'text-[#9CA3B4] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[#9CA3B4]'}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* USER ACTIONS & MENU PRIVAT */}
          <div className="hidden sm:flex items-center gap-2.5">
            {user ? (
              <>
                {/* Admin Panel Button */}
                {profile?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 hover:border-amber-500/60 text-amber-400 px-3 py-1.5 rounded-xl text-xs font-bold transition-all backdrop-blur-md shadow-md hover:scale-105"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Admin Panel
                  </Link>
                )}

                {/* Private Messages Button */}
                <Link
                  to="/messages"
                  title="Pesan Privat"
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#9CA3B4] hover:text-white transition-all backdrop-blur-md relative"
                >
                  <MessageCircle className="w-4 h-4" />
                </Link>

                {/* Notifications Button */}
                <Link
                  to="/notifications"
                  title="Notifikasi"
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#9CA3B4] hover:text-white transition-all backdrop-blur-md relative"
                >
                  <Bell className="w-4 h-4" />
                </Link>

                {/* Profile Card / Avatar */}
                <Link
                  to="/settings"
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all backdrop-blur-md"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#8B8CF8]/30 border border-white/20 flex items-center justify-center text-white font-bold text-xs overflow-hidden">
                    {profile?.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      profile?.displayName?.[0] || 'U'
                    )}
                  </div>
                  <span className="text-xs font-bold text-[#F4F5F8] max-w-[100px] truncate">
                    {profile?.displayName || 'User'}
                  </span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  title="Keluar Akun"
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 transition-all backdrop-blur-md"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-gradient-to-r from-[#8B8CF8] to-[#6C6DE8] hover:opacity-90 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-[#8B8CF8]/25 border border-white/20"
              >
                Masuk Akun
              </Link>
            )}
          </div>

          {/* MOBILE MENU TOGGLE BUTTON */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* MOBILE MENU DRAWER */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-[#14161D]/90 backdrop-blur-2xl p-4 space-y-3">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      active
                        ? 'bg-[#8B8CF8] text-white shadow-md'
                        : 'text-[#9CA3B4] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {user && (
              <div className="pt-3 border-t border-white/10 space-y-2">
                {profile?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  >
                    <Shield className="w-4 h-4" /> Admin Panel
                  </Link>
                )}
                <Link
                  to="/messages"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#9CA3B4] hover:bg-white/5 hover:text-white"
                >
                  <MessageCircle className="w-4 h-4" /> Pesan Privat
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#9CA3B4] hover:bg-white/5 hover:text-white"
                >
                  <Settings className="w-4 h-4" /> Pengaturan Profil
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20"
                >
                  <LogOut className="w-4 h-4" /> Keluar Akun
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};