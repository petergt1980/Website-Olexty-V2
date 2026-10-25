import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { MemberCard } from '../components/MemberCard';
import { Search, Users } from 'lucide-react';

export const MembersPage: React.FC = () => {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const list: UserProfile[] = snapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as UserProfile),
        uid: docSnap.id,
      }));
      setMembers(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.gameNick?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.gameId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      selectedRole === 'all'
        ? true
        : selectedRole === 'staff'
        ? m.role === 'admin' || m.role === 'moderator'
        : m.gameRole === selectedRole;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F5F8] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#8B8CF8]" /> Anggota Komunitas
          </h1>
          <p className="text-sm text-[#9CA3B4] mt-1">
            Daftar seluruh player, roster, dan staff OLEXTY Community.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#9CA3B4]" />
          <input
            type="text"
            placeholder="Cari nama, Nick Game, atau Game ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#181A22] border border-[#292C36] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
          />
        </div>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="bg-[#181A22] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
        >
          <option value="all">Semua Role</option>
          <option value="staff">Staff & Admin</option>
          <option value="IGL / Leader">IGL / Leader</option>
          <option value="Rusher">Rusher</option>
          <option value="Support">Support</option>
          <option value="Sniper">Sniper</option>
        </select>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#9CA3B4]">Memuat daftar anggota...</div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-[#181A22] border border-[#292C36] rounded-2xl p-12 text-center text-xs text-[#9CA3B4]">
          Anggota tidak ditemukan.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <MemberCard key={member.uid} member={member} />
          ))}
        </div>
      )}
    </div>
  );
};