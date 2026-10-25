import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../features/auth/AuthContext';
import { UserProfile } from '../types';
import { Gamepad2, User, Save, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const userProfile = profile as UserProfile | null;
  
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [gameNick, setGameNick] = useState('');
  const [gameId, setGameId] = useState('');
  const [gameRole, setGameRole] = useState('Member');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setBio(userProfile.bio || '');
      setGameNick(userProfile.gameNick || '');
      setGameId(userProfile.gameId || '');
      setGameRole(userProfile.gameRole || 'Member');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setSuccess(false);

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: displayName.trim(),
        bio: bio.trim(),
        gameNick: gameNick.trim(),
        gameId: gameId.trim(),
        gameRole,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Gagal memperbarui profil:', err);
      alert('Gagal menyimpan perubahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F4F5F8]">Pengaturan Profil</h1>
        <p className="text-sm text-[#9CA3B4] mt-1">
          Perbarui informasi akun dan identitas gaming kamu di OLEXTY Community.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informasi Dasar */}
        <div className="bg-[#181A22] border border-[#292C36] rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-[#F4F5F8] flex items-center gap-2">
            <User className="w-4 h-4 text-[#8B8CF8]" /> Informasi Dasar
          </h2>

          <div className="space-y-1.5">
            <label className="text-xs text-[#9CA3B4]">Nama Tampilan</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
              placeholder="Masukkan nama tampilan..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#9CA3B4]">Bio / Deskripsi Profil</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
              placeholder="Tuliskan bio singkat..."
            />
          </div>
        </div>

        {/* Identitas Gaming */}
        <div className="bg-[#181A22] border border-[#292C36] rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-[#F4F5F8] flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-[#8B8CF8]" /> Identitas Gaming
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-[#9CA3B4]">Nick Game</label>
              <input
                type="text"
                value={gameNick}
                onChange={(e) => setGameNick(e.target.value)}
                className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
                placeholder="Contoh: OLEXTY | CyberFlux"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#9CA3B4]">Game ID</label>
              <input
                type="text"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
                placeholder="Contoh: 8492019482"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#9CA3B4]">Role In-Game</label>
            <select
              value={gameRole}
              onChange={(e) => setGameRole(e.target.value)}
              className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
            >
              <option value="Member">Member</option>
              <option value="IGL / Leader">IGL / Leader</option>
              <option value="Rusher">Rusher</option>
              <option value="Support">Support</option>
              <option value="Sniper">Sniper</option>
              <option value="Coach / Analyst">Coach / Analyst</option>
            </select>
          </div>
        </div>

        {/* Tombol Simpan */}
        <div className="flex items-center justify-between">
          {success ? (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
              <Check className="w-4 h-4" /> Perubahan berhasil disimpan!
            </span>
          ) : (
            <span />
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#8B8CF8] hover:bg-[#7879E8] text-[#F4F5F8] px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  );
};