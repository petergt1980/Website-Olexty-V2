import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { Mail, Lock, User, AtSign, UserPlus, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setError('Username harus 3-20 karakter (hanya huruf, angka, dan underscore).');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, username, displayName);
      navigate('/community');
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftar. Email mungkin sudah terdaftar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#181A22] border border-[#292C36] rounded-2xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#F4F5F8] mb-2">Gabung OLEXTY</h1>
          <p className="text-sm text-[#9CA3B4]">Buat akun untuk berbagi karya dan berdiskusi.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#9CA3B4] mb-1.5">Username</label>
            <div className="relative">
              <AtSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3B4]" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="alex_dev"
                className="w-full bg-[#101116] border border-[#292C36] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9CA3B4] mb-1.5">Nama Tampilan</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3B4]" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Alex Rivers"
                className="w-full bg-[#101116] border border-[#292C36] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9CA3B4] mb-1.5">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3B4]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-[#101116] border border-[#292C36] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9CA3B4] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3B4]" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full bg-[#101116] border border-[#292C36] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8B8CF8] hover:bg-[#7A7BF6] text-white font-medium py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-2"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
          </button>
        </form>

        <p className="text-center text-xs text-[#9CA3B4] mt-6">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-[#8B8CF8] font-medium hover:underline">Masuk</Link>
        </p>
      </motion.div>
    </div>
  );
};