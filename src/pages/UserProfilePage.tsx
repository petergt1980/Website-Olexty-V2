import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';

export const UserProfilePage: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    const fetchUserProfile = async () => {
      try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserProfile({ ...docSnap.data(), uid: docSnap.id } as UserProfile);
        }
      } catch (err) {
        console.error('Gagal memuat profil pengguna:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [uid]);

  if (loading) return <div className="p-8 text-center text-xs text-[#9CA3B4]">Memuat profil...</div>;
  if (!userProfile) return <div className="p-8 text-center text-xs text-[#9CA3B4]">Pengguna tidak ditemukan.</div>;

  return (
    <div className="max-w-xl mx-auto py-4">
      <div className="bg-[#181A22] border border-[#292C36] rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#8B8CF8]/20 border border-[#292C36] flex items-center justify-center text-[#8B8CF8] font-bold text-xl overflow-hidden">
            {userProfile.avatarUrl ? (
              <img src={userProfile.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              userProfile.displayName?.[0] || 'U'
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#F4F5F8]">{userProfile.displayName}</h2>
            <p className="text-xs text-[#9CA3B4]">@{userProfile.username}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-lg text-[10px] font-semibold bg-[#8B8CF8]/10 text-[#8B8CF8] border border-[#8B8CF8]/20 uppercase">
              {userProfile.role || 'member'}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-[#292C36] text-xs">
          <p className="text-[#9CA3B4]">Bio:</p>
          <p className="text-[#F4F5F8] mt-1">{userProfile.bio || 'Belum ada bio.'}</p>
        </div>
      </div>
    </div>
  );
};