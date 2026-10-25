import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../features/auth/AuthContext';
import { Post } from '../types';
import { SocialLinksBanner } from '../components/SocialLinksBanner';
import { MessageSquare, Heart, Send, Search, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CommunityFeedPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'General' | 'Showcase' | 'Tutorial' | 'Discussion'>('General');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Post[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Post, 'id'>),
      }));
      setPosts(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'posts'), {
        userId: user.uid,
        userName: profile?.displayName || 'Anonim',
        userAvatar: profile?.avatarUrl || '',
        content: content.trim(),
        category,
        likes: [],
        commentCount: 0,
        createdAt: serverTimestamp(),
      });
      setContent('');
    } catch (err) {
      console.error('Gagal membuat postingan:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPosts = posts.filter((p) => {
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchesSearch = p.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      {/* Form Buat Diskusi Baru */}
      {user && (
        <div className="bg-[#181A22] border border-[#292C36] rounded-2xl p-5 space-y-4 shadow-xl shadow-black/20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8B8CF8]" />
            <h3 className="font-bold text-sm text-[#F4F5F8]">Buat Diskusi Komunitas</h3>
          </div>
          <form onSubmit={handleCreatePost} className="space-y-3">
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Apa yang ingin kamu bagikan dengan anggota komunitas hari ini?"
              className="w-full bg-[#14161D] border border-[#292C36] rounded-xl p-3.5 text-xs text-[#F4F5F8] placeholder-[#9CA3B4]/60 focus:outline-none focus:border-[#8B8CF8] focus:ring-1 focus:ring-[#8B8CF8] resize-none transition-all"
            />
            <div className="flex items-center justify-between">
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
              >
                <option value="General">📌 General</option>
                <option value="Showcase">🎮 Showcase</option>
                <option value="Tutorial">📚 Tutorial</option>
                <option value="Discussion">💬 Discussion</option>
              </select>

              <button
                type="submit"
                disabled={submitting || !content.trim()}
                className="bg-[#8B8CF8] hover:bg-[#7879E8] text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50 shadow-md shadow-[#8B8CF8]/20"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? 'Mengirim...' : 'Kirim Postingan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Feed Komunitas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#F4F5F8] tracking-tight">Feed Komunitas</h2>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#9CA3B4]" />
          <input
            type="text"
            placeholder="Cari kata kunci postingan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#181A22] border border-[#292C36] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F4F5F8] placeholder-[#9CA3B4]/60 focus:outline-none focus:border-[#8B8CF8] transition-all"
          />
        </div>

        {/* Filter Kategori Pill Tanpa Scrollbar Jelek */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs [::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {['Semua', 'General', 'Showcase', 'Tutorial', 'Discussion'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-[#8B8CF8] text-white font-bold shadow-md shadow-[#8B8CF8]/30 scale-[1.02]'
                  : 'bg-[#181A22] border border-[#292C36] text-[#9CA3B4] hover:text-[#F4F5F8] hover:border-[#8B8CF8]/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Banner Quick Links Sosmed */}
        <SocialLinksBanner />

        {/* Daftar Postingan Feed */}
        {loading ? (
          <div className="p-12 text-center text-xs text-[#9CA3B4]">Memuat postingan...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-[#181A22] border border-[#292C36] rounded-2xl p-12 text-center text-xs text-[#9CA3B4]">
            Belum ada postingan ditemukan di kategori ini.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-[#181A22] border border-[#292C36] rounded-2xl p-5 space-y-4 hover:border-[#8B8CF8]/40 transition-all shadow-md shadow-black/10"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#8B8CF8]/20 border border-[#8B8CF8]/40 flex items-center justify-center font-bold text-[#8B8CF8] text-xs overflow-hidden shrink-0">
                      {post.userAvatar ? (
                        <img src={post.userAvatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        post.userName?.[0] || 'U'
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#F4F5F8] block">{post.userName}</span>
                      <span className="text-[10px] text-[#9CA3B4]">Member OLEXTY</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-[#8B8CF8]/10 text-[#8B8CF8] border border-[#8B8CF8]/20 uppercase tracking-wider">
                    {post.category}
                  </span>
                </div>

                <p className="text-xs text-[#F4F5F8] leading-relaxed whitespace-pre-line">{post.content}</p>

                <div className="flex items-center gap-5 text-xs text-[#9CA3B4] pt-3 border-t border-[#292C36]">
                  <Link to={`/post/${post.id}`} className="flex items-center gap-1.5 hover:text-[#8B8CF8] transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-medium">{post.commentCount || 0} Komentar</span>
                  </Link>
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4" />
                    <span className="font-medium">{post.likes?.length || 0} Suka</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};