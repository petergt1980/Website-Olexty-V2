import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../features/auth/AuthContext';
import { Post } from '../types';
import { MessageSquare, Sparkles, Send, Image as ImageIcon, Flame, Trophy, Users } from 'lucide-react';

export const CommunityFeedPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Post[] = snapshot.docs.map((doc) => ({
        ...(doc.data() as Post),
        id: doc.id,
      }));
      setPosts(list);
    });
    return () => unsubscribe();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'posts'), {
        userId: user.uid,
        userName: profile?.displayName || 'Member OLEXTY',
        userAvatar: profile?.avatarUrl || '',
        content: content.trim(),
        category,
        likes: [],
        commentsCount: 0,
        createdAt: serverTimestamp(),
      });
      setContent('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* --- BANNER HEADER UTAMA (Gaya Esports / Gaming Community) --- */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#181A22] via-[#202330] to-[#181A22] border border-[#292C36] p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B8CF8]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B8CF8]/10 text-[#8B8CF8] text-[11px] font-bold tracking-wider uppercase border border-[#8B8CF8]/20">
              <Sparkles className="w-3.5 h-3.5" /> Circle Not Marga
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#F4F5F8] tracking-tight">
              OLEXTY COMMUNITY HQ
            </h1>
            <p className="text-xs sm:text-sm text-[#9CA3B4] max-w-xl">
              Pusat kumpul player, mabar, diskusi strategi game, dan pamerkan momen klip terbaik kalian di sini!
            </p>
          </div>

          {/* Quick Stats Widget */}
          <div className="flex items-center gap-3 bg-[#14161D]/80 backdrop-blur border border-[#292C36] p-3 rounded-xl">
            <div className="p-2.5 bg-[#8B8CF8]/10 text-[#8B8CF8] rounded-lg">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-[#9CA3B4] block uppercase font-bold">Status Arena</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Live & Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- FORM BUAT POSTINGAN --- */}
      {user ? (
        <form onSubmit={handleCreatePost} className="bg-[#181A22] border border-[#292C36] rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F4F5F8]">
            <Sparkles className="w-4 h-4 text-[#8B8CF8]" /> Buat Diskusi Komunitas
          </div>
          <textarea
            rows={3}
            placeholder="Apa yang ingin kamu bagikan dengan anggota komunitas hari ini?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-[#14161D] border border-[#292C36] rounded-xl p-3 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8] resize-none"
            required
          />
          <div className="flex items-center justify-between pt-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
            >
              <option value="General">General</option>
              <option value="Showcase">Showcase</option>
              <option value="Tournament">Tournament</option>
              <option value="Discussion">Discussion</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#8B8CF8] hover:bg-[#7879E8] text-white px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" /> {loading ? 'Mengirim...' : 'Kirim Postingan'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-[#181A22] border border-[#292C36] rounded-2xl p-4 text-center text-xs text-[#9CA3B4]">
          Silakan <a href="/login" className="text-[#8B8CF8] font-bold underline">Masuk</a> terlebih dahulu untuk ikut membuat postingan dan berdiskusi.
        </div>
      )}

      {/* --- FEED LIST --- */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-[#181A22] border border-[#292C36] rounded-2xl p-5 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#8B8CF8]/20 border border-[#292C36] flex items-center justify-center text-[#8B8CF8] font-bold text-xs overflow-hidden">
                  {post.userAvatar ? (
                    <img src={post.userAvatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    post.userName?.[0] || 'U'
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#F4F5F8]">{post.userName}</h4>
                  <span className="text-[10px] text-[#9CA3B4]">Anggota OLEXTY</span>
                </div>
              </div>
              <span className="text-[10px] bg-[#8B8CF8]/10 text-[#8B8CF8] border border-[#8B8CF8]/20 px-2.5 py-1 rounded-lg font-bold">
                {post.category || 'General'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#F4F5F8] leading-relaxed whitespace-pre-wrap">{post.content}</p>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-12 text-xs text-[#9CA3B4] bg-[#181A22] border border-[#292C36] rounded-2xl">
            Belum ada diskusi atau postingan di feed saat ini.
          </div>
        )}
      </div>
    </div>
  );
};