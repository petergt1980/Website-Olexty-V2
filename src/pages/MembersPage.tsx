import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { Users, Search, Shield, UserCheck } from 'lucide-react';

export const MembersPage: React.FC = () => {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const list: UserProfile[] = snapshot.docs.map((doc) => ({
        ...(doc.data() as UserProfile),
        uid: doc.id,
      }));
      setMembers(list);
    });
    return () => unsubscribe();
  }, []);

  const filtered = members.filter(
    (m) =>
      m.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      m.username?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F5F8] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#8B8CF8]" /> Daftar Anggota OLEXTY
          </h1>
          <p className="text-xs text-[#9CA3B4] mt-1">Semua player dan staff yang terdaftar di komunitas.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-[#9CA3B4]" />
        <input
          type="text"
          placeholder="Cari nama atau username anggota..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#181A22] border border-[#292C36] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {filtered.map((m) => (
          <div key={m.uid} className="bg-[#181A22] border border-[#292C36] rounded-2xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#8B8CF8]/20 border border-[#292C36] overflow-hidden flex items-center justify-center text-[#8B8CF8] font-bold text-sm">
              {m.avatarUrl ? (
                <img src={m.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                m.displayName?.[0] || 'U'
              )}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-bold text-sm text-[#F4F5F8] truncate">{m.displayName || 'Tanpa Nama'}</h4>
              <p className="text-[11px] text-[#9CA3B4] truncate">@{m.username || 'member'}</p>
              <div className="mt-1 flex items-center gap-1">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    m.role === 'admin'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : m.role === 'moderator'
                      ? 'bg-[#8B8CF8]/10 text-[#8B8CF8] border border-[#8B8CF8]/20'
                      : 'bg-[#292C36] text-[#9CA3B4]'
                  }`}
                >
                  {m.role || 'member'}
                </span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-10 text-xs text-[#9CA3B4]">
            Tidak ada anggota yang ditemukan.
          </div>
        )}
      </div>
    </div>
  );
};