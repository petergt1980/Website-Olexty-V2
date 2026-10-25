import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db } from '../lib/firebase';
import { useAuth } from '../features/auth/AuthContext';
import { User, Settings, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setDisplayName(data.displayName || user.displayName || '');
          setUsername(data.username || '');
          setAvatarUrl(data.avatarUrl || user.photoURL || '');
          setBio(data.bio || '');
        } else {
          setDisplayName(user.displayName || '');
          setAvatarUrl(user.photoURL || '');
        }
      } catch (err) {
        console.error('Gagal memuat profil:', err);
      }
    };

    fetchUserData();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // 1. Update Firebase Auth Profile
      await updateProfile(user, {
        displayName: displayName.trim(),
        photoURL: avatarUrl.trim() || null,
      });

      // 2. Update Firestore User Document
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        displayName: displayName.trim(),
        username: username.trim(),
        avatarUrl: avatarUrl.trim(),
        bio: bio.trim(),
        updatedAt: new Date(),
      });

      setSuccessMessage('Pengaturan akun berhasil disimpan!');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Terjadi kesalahan saat menyimpan pengaturan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center gap-3 border-b border-[#292C36] pb-4">
        <div className="p-2 bg-[#8B8CF8]/10 text-[#8B8CF8] rounded-xl">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#F4F5F8]">Pengaturan Akun</h1>
          <p className="text-xs text-[#9CA3B4]">Kelola informasi profil, nama panggilan, dan foto akun kamu.</p>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {errorMessage}
        </div>
      )}

      <form onSubmit={handleUpdateProfile} className="bg-[#181A22] border border-[#292C36] rounded-2xl p-6 space-y-5 shadow-lg">
        {/* Preview Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#8B8CF8]/20 border border-[#292C36] overflow-hidden flex items-center justify-center text-[#8B8CF8] font-bold text-lg">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
            ) : (
              displayName?.[0] || <User className="w-8 h-8" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#F4F5F8]">{displayName || 'Nama Pengguna'}</h4>
            <span className="text-[11px] text-[#9CA3B4]">@{username || 'username'}</span>
          </div>
        </div>

        {/* Input Nama Panggilan */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#9CA3B4] uppercase tracking-wider">Nama Panggilan (Display Name)</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Masukkan nama panggilan kamu"
            className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-4 py-2.5 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
            required
          />
        </div>

        {/* Input Username */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#9CA3B4] uppercase tracking-wider">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Masukkan username unik"
            className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-4 py-2.5 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
          />
        </div>

        {/* Input URL Foto Profil */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#9CA3B4] uppercase tracking-wider">Link Foto Profil (Avatar URL)</label>
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://contoh.com/foto.jpg"
            className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-4 py-2.5 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
          />
          <p className="text-[10px] text-[#9CA3B4]">Masukkan tautan gambar publik (Direct Image URL) untuk foto profilmu.</p>
        </div>

        {/* Input Bio */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#9CA3B4] uppercase tracking-wider">Bio / Status Singkat</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Ceritakan sedikit tentang dirimu atau game favoritmu..."
            className="w-full bg-[#14161D] border border-[#292C36] rounded-xl p-3 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8] resize-none"
          />
        </div>

        {/* Tombol Simpan */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#8B8CF8] hover:bg-[#7879E8] text-white py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md"
        >
          <Save className="w-4 h-4" /> {loading ? 'Menyimpan Perubahan...' : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
  );
};