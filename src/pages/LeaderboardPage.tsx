import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { Trophy, Medal, Award, Flame } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const [topMembers, setTopMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: UserProfile[] = snapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as UserProfile),
        uid: docSnap.id,
      }));
      setTopMembers(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getRankBadge = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-amber-400" />;
    if (index === 1) return <Medal className="w-5 h-5 text-slate-300" />;
    if (index === 2) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="font-bold text-xs text-[#9CA3B4]">#{index + 1}</span>;
  };

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F4F5F8] flex items-center gap-2">
          <Flame className="w-6 h-6 text-amber-400" /> Papan Keaktifan Komunitas
        </h1>
        <p className="text-sm text-[#9CA3B4] mt-1">
          Top 10 anggota teraktif dan berdedikasi tinggi di OLEXTY Community.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-[#9CA3B4]">Memuat papan skor...</div>
      ) : (
        <div className="bg-[#181A22] border border-[#292C36] rounded-2xl overflow-hidden">
          <div className="divide-y divide-[#292C36]">
            {topMembers.map((member, index) => (
              <div
                key={member.uid}
                className="p-4 flex items-center justify-between hover:bg-[#292C36]/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 flex items-center justify-center">
                    {getRankBadge(index)}
                  </div>

                  <div className="w-10 h-10 rounded-full bg-[#8B8CF8]/20 border border-[#292C36] flex items-center justify-center font-bold text-[#8B8CF8] text-sm overflow-hidden">
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      member.displayName?.[0] || 'U'
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-[#F4F5F8]">{member.displayName}</h3>
                    <p className="text-xs text-[#9CA3B4]">
                      {member.gameNick ? `Nick: ${member.gameNick}` : `@${member.username}`}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-[#8B8CF8]/10 text-[#8B8CF8] border border-[#8B8CF8]/20">
                    {member.role || 'Member'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};