import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, arrayUnion, arrayRemove, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../features/auth/AuthContext';
import { ClipItem } from '../types';
import { Video, Plus, Heart, Gamepad2, ExternalLink, X, Send } from 'lucide-react';

export const ClipShowcasePage: React.FC = () => {
  const { user, profile } = useAuth();
  const [clips, setClips] = useState<ClipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [game, setGame] = useState('Free Fire');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'clips'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: ClipItem[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<ClipItem, 'id'>),
      }));
      setClips(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Helper konversi URL YouTube ke format Embed
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return null;
  };

  const handleCreateClip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !videoUrl.trim()) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'clips'), {
        userId: user.uid,
        userName: profile?.displayName || 'Anonim',
        userAvatar: profile?.avatarUrl || '',
        title: title.trim(),
        videoUrl: videoUrl.trim(),
        game,
        likes: [],
        createdAt: serverTimestamp(),
      });

      setTitle('');
      setVideoUrl('');
      setShowModal(false);
    } catch (err) {
      console.error('Gagal menambahkan clip:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLike = async (clipId: string, likes: string[] = []) => {
    if (!user) return alert('Silakan login terlebih dahulu!');
    const isLiked = likes.includes(user.uid);
    const clipRef = doc(db, 'clips', clipId);

    await updateDoc(clipRef, {
      likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F5F8] flex items-center gap-2">
            <Video className="w-6 h-6 text-[#8B8CF8]" /> Gameplay Clips & Highlights
          </h1>
          <p className="text-sm text-[#9CA3B4] mt-1">
            Momen epic, clutch, dan sorotan video terbaik dari anggota OLEXTY Community.
          </p>
        </div>

        {user && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#8B8CF8] hover:bg-[#7879E8] text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> Bagikan Clip
          </button>
        )}
      </div>

      {/* Grid Clip Showcase */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#9CA3B4]">Memuat clip...</div>
      ) : clips.length === 0 ? (
        <div className="bg-[#181A22] border border-[#292C36] rounded-2xl p-12 text-center text-xs text-[#9CA3B4]">
          Belum ada clip yang dibagikan. Jadilah yang pertama membagikan momen epic!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {clips.map((clip) => {
            const embedUrl = getEmbedUrl(clip.videoUrl);
            const isLiked = user ? clip.likes?.includes(user.uid) : false;

            return (
              <div
                key={clip.id}
                className="bg-[#181A22] border border-[#292C36] rounded-2xl overflow-hidden space-y-3 flex flex-col justify-between hover:border-[#8B8CF8]/50 transition-colors"
              >
                {/* Embedded Video / External Player */}
                <div className="aspect-video bg-black w-full relative">
                  {embedUrl ? (
                    <iframe
                      src={embedUrl}
                      title={clip.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center space-y-2">
                      <p className="text-xs text-[#9CA3B4]">Video External (TikTok / Short Link)</p>
                      <a
                        href={clip.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-[#292C36] hover:bg-[#323642] text-[#F4F5F8] px-3 py-1.5 rounded-xl text-xs font-medium inline-flex items-center gap-1.5"
                      >
                        Buka Video <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Meta Detail Clip */}
                <div className="p-4 pt-0 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#8B8CF8] bg-[#8B8CF8]/10 px-2 py-0.5 rounded-md border border-[#8B8CF8]/20">
                        <Gamepad2 className="w-3 h-3" /> {clip.game}
                      </span>
                      <h3 className="font-bold text-sm text-[#F4F5F8] mt-1 line-clamp-2">
                        {clip.title}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleToggleLike(clip.id, clip.likes)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs transition-colors ${
                        isLiked
                          ? 'bg-red-500/10 text-red-500 font-semibold border border-red-500/20'
                          : 'bg-[#14161D] text-[#9CA3B4] border border-[#292C36] hover:text-[#F4F5F8]'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{clip.likes?.length || 0}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#292C36] text-xs text-[#9CA3B4]">
                    <div className="w-6 h-6 rounded-full bg-[#8B8CF8]/20 flex items-center justify-center text-[#8B8CF8] font-bold text-[10px] overflow-hidden">
                      {clip.userAvatar ? (
                        <img src={clip.userAvatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        clip.userName?.[0]
                      )}
                    </div>
                    <span>{clip.userName}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah Clip */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181A22] border border-[#292C36] rounded-2xl max-w-md w-full p-6 space-y-4 relative">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#F4F5F8]">Bagikan Clip Highlight</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#9CA3B4] hover:text-[#F4F5F8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClip} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-[#9CA3B4]">Judul / Momen Highlight</label>
                <input
                  type="text"
                  placeholder="Contoh: 1v4 Clutch Squad Scrim!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#9CA3B4]">Link Video (YouTube / TikTok)</label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... atau link TikTok"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#9CA3B4]">Kategori Game</label>
                <select
                  value={game}
                  onChange={(e) => setGame(e.target.value)}
                  className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
                >
                  <option value="Free Fire">Free Fire</option>
                  <option value="Growtopia">Growtopia</option>
                  <option value="Valorant">Valorant</option>
                  <option value="Mobile Legends">Mobile Legends</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#9CA3B4] hover:text-[#F4F5F8]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#8B8CF8] hover:bg-[#7879E8] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Mengunggah...' : 'Bagikan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};