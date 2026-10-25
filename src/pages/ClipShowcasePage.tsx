import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../features/auth/AuthContext';
import { ClipItem } from '../types';
import { Video, Plus, Gamepad2, User } from 'lucide-react';

export const ClipShowcasePage: React.FC = () => {
  const { user, profile } = useAuth();
  const [clips, setClips] = useState<ClipItem[]>([]);
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [game, setGame] = useState('Free Fire');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'clips'), (snapshot) => {
      const list: ClipItem[] = snapshot.docs.map((doc) => ({
        ...(doc.data() as ClipItem),
        id: doc.id,
      }));
      setClips(list);
    });
    return () => unsubscribe();
  }, []);

  const handleAddClip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim() || !user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'clips'), {
        userId: user.uid,
        userName: profile?.displayName || 'Member OLEXTY',
        userAvatar: profile?.avatarUrl || '',
        title: title.trim(),
        videoUrl: videoUrl.trim(),
        game,
        likes: [],
        createdAt: serverTimestamp(),
      });
      setTitle('');
      setVideoUrl('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F5F8] flex items-center gap-2">
            <Video className="w-6 h-6 text-[#8B8CF8]" /> Clips & Highlights
          </h1>
          <p className="text-xs text-[#9CA3B4] mt-1">Pamerkan momen clutch dan gameplay terbaikmu di sini.</p>
        </div>
      </div>

      {user && (
        <form onSubmit={handleAddClip} className="bg-[#181A22] border border-[#292C36] rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-[#F4F5F8] uppercase tracking-wider">Bagikan Klip Baru</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Judul Klip (misal: Clutch 1vs4 Free Fire)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
              required
            />
            <input
              type="url"
              placeholder="Link Video (YouTube / MP4 URL)"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
              required
            />
            <select
              value={game}
              onChange={(e) => setGame(e.target.value)}
              className="bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
            >
              <option value="Free Fire">Free Fire</option>
              <option value="Mobile Legends">Mobile Legends</option>
              <option value="Growtopia">Growtopia</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#8B8CF8] hover:bg-[#7879E8] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> {loading ? 'Mengunggah...' : 'Upload Klip'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {clips.map((clip) => (
          <div key={clip.id} className="bg-[#181A22] border border-[#292C36] rounded-2xl overflow-hidden space-y-3 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#8B8CF8]/20 flex items-center justify-center text-[#8B8CF8] font-bold text-xs">
                  {clip.userAvatar ? (
                    <img src={clip.userAvatar} alt="" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    clip.userName?.[0] || 'U'
                  )}
                </div>
                <span className="text-xs font-medium text-[#F4F5F8]">{clip.userName}</span>
              </div>
              <span className="text-[10px] bg-[#8B8CF8]/10 text-[#8B8CF8] px-2 py-0.5 rounded font-bold">
                {clip.game}
              </span>
            </div>

            <h4 className="font-bold text-sm text-[#F4F5F8]">{clip.title}</h4>

            <div className="aspect-video bg-[#14161D] rounded-xl overflow-hidden border border-[#292C36] flex items-center justify-center">
              {clip.videoUrl.includes('youtube') || clip.videoUrl.includes('youtu.be') ? (
                <iframe
                  src={clip.videoUrl.replace('watch?v=', 'embed/').split('&')[0]}
                  title={clip.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <video src={clip.videoUrl} controls className="w-full h-full object-cover" />
              )}
            </div>
          </div>
        ))}
        {clips.length === 0 && (
          <div className="col-span-full text-center py-10 text-xs text-[#9CA3B4]">
            Belum ada klip yang diunggah. Jadilah yang pertama membagikannya!
          </div>
        )}
      </div>
    </div>
  );
};