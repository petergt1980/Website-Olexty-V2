import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../features/auth/AuthContext';
import { Post } from '../types';
import { ToastContainer, ToastMessage } from '../components/Toast';
import { Sparkles, Send, Trophy, Megaphone, Shield, Swords, ExternalLink, Users, Coins, Radio, Gift, Flame, Crown, Crosshair, ChevronLeft, ChevronRight } from 'lucide-react';

interface BabuItem {
  id: string;
  name: string;
  task: string;
}

interface TopDonorItem {
  id: string;
  name: string;
  amount: string;
}

export const CommunityFeedPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;

  // Custom Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'reward' = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Data Komunitas
  const [announcement, setAnnouncement] = useState('');
  const [babuList, setBabuList] = useState<BabuItem[]>([]);
  const [topDonors, setTopDonors] = useState<TopDonorItem[]>([]);
  const [rulesWar, setRulesWar] = useState('');
  const [gbWarLink, setGbWarLink] = useState('');
  const [donateUrl, setDonateUrl] = useState('');
  const [liveStreamUrl, setLiveStreamUrl] = useState('');
  const [webhookPostsUrl, setWebhookPostsUrl] = useState('');

  const [checkInClaimed, setCheckInClaimed] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribePosts = onSnapshot(q, (snapshot) => {
      const list: Post[] = snapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as Post),
        id: docSnap.id,
      }));
      setPosts(list);
    });

    const unsubscribeConfig = onSnapshot(doc(db, 'settings', 'communityConfig'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAnnouncement(data.announcementText || '');
        setBabuList(data.babuList || []);
        setTopDonors(data.topDonors || []);
        setRulesWar(data.rulesWar || '');
        setGbWarLink(data.gbWarLink || '');
        setDonateUrl(data.donateUrl || '');
        setLiveStreamUrl(data.liveStreamUrl || '');
        setWebhookPostsUrl(data.webhookPostsUrl || data.discordWebhookUrl || '');
      }
    });

    return () => {
      unsubscribePosts();
      unsubscribeConfig();
    };
  }, []);

  // Hitung indeks data untuk Pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const triggerDiscordWebhook = async (postContent: string) => {
    if (!webhookPostsUrl) return;
    try {
      await fetch(webhookPostsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [
            {
              title: '💬 POSTINGAN BARU DI BASE CAMP',
              description: postContent,
              color: 3447003,
              author: { name: profile?.displayName || 'Roster Member' },
              footer: { text: `Kategori: ${category} • OLEXTY Feed` },
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'posts'), {
        userId: user.uid,
        userName: profile?.displayName || 'Roster OLEXTY',
        userAvatar: profile?.avatarUrl || '',
        userBadge: (profile as any)?.badge || '',
        content: content.trim(),
        category,
        likes: [],
        commentsCount: 0,
        createdAt: serverTimestamp(),
      });
      triggerDiscordWebhook(content.trim());
      setContent('');
      setCurrentPage(1); // Kembali ke halaman pertama saat bikin postingan baru
      addToast('Pesan berhasil dipublikasikan di Base Camp!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Gagal mengirim pesan. Silakan coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDailyCheckIn = async () => {
    if (!user) return;
    try {
      const currentPoints = (profile as any)?.points || 0;
      await updateDoc(doc(db, 'users', user.uid), {
        points: currentPoints + 100,
        lastCheckIn: new Date(),
      });
      setCheckInClaimed(true);
      addToast('Mantap! Uang saku +100 PTS berhasil diklaim hari ini! 🏆', 'reward');
    } catch (err) {
      console.error(err);
      addToast('Gagal mengklaim uang saku harian.', 'error');
    }
  };

  const renderAvatarFrame = (avatarUrl?: string, name?: string, badge?: string) => {
    const isVIP = badge?.includes('VIP') || badge?.includes('Donatur');
    const isLeader = badge?.includes('Leader') || badge?.includes('Owner') || badge?.includes('Admin');

    return (
      <div className="relative shrink-0">
        {isVIP && (
          <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 animate-spin-slow opacity-80 blur-[2px]" />
        )}
        {isLeader && (
          <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-rose-600 via-red-500 to-rose-700 blur-[2px] opacity-80" />
        )}
        <div className="relative w-10 h-10 rounded-full bg-[#181a24] border-2 border-[#2a2e3d] flex items-center justify-center font-black text-rose-500 overflow-hidden text-xs">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            name?.[0] || 'O'
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 pb-16 font-space relative">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {announcement && (
        <div className="clip-hud bg-gradient-to-r from-rose-950/40 via-rose-900/20 to-transparent border-l-4 border-rose-600 p-4 sm:p-5 flex items-start gap-3 shadow-2xl">
          <Megaphone className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <span className="text-[10px] font-black tracking-widest uppercase text-rose-500">PENGUMUMAN PENTING BASE CAMP</span>
            <p className="text-xs sm:text-sm text-[#F4F5F8] leading-relaxed font-semibold">{announcement}</p>
          </div>
        </div>
      )}

      <div className="clip-hud relative bg-gradient-to-r from-[#14161f] via-[#1c1f2e] to-[#12131a] border border-white/10 p-6 sm:p-10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-600/15 border border-rose-500/30 text-rose-400 text-[10px] font-extrabold uppercase tracking-widest clip-hud-btn">
              <Crosshair className="w-3.5 h-3.5" /> MARKAS UTAMA CIRCLE NOT MARGA
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase font-['Oxanium']">
              BASE CAMP <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-amber-400 to-rose-600">OLEXTY</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#9CA3B4] font-medium leading-relaxed">
              Lobi resmi tempat ngumpul player, bahas taktik tempur scrim, klaim uang saku harian, dan pantau roster aktif.
            </p>
          </div>

          {user && (
            <button
              onClick={handleDailyCheckIn}
              disabled={checkInClaimed}
              className="clip-hud-btn bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black px-6 py-3.5 rounded-none text-xs font-black uppercase tracking-wider transition-all shadow-xl shadow-amber-500/20 active:scale-95 disabled:opacity-50 shrink-0"
            >
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4" />
                {checkInClaimed ? 'UANG SAKU DIKLAIM' : 'KLAIM UANG SAKU (+100 PTS)'}
              </div>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          {liveStreamUrl && (
            <div className="clip-hud bg-[#14161f] border border-rose-500/30 p-4 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-500 font-extrabold text-xs uppercase tracking-wider">
                  <Radio className="w-4 h-4 animate-pulse" /> ARENA LIVE STREAM WAR
                </div>
                <span className="text-[9px] bg-rose-600 text-white px-2 py-0.5 font-black uppercase">LIVE</span>
              </div>
              <div className="aspect-video rounded-lg overflow-hidden border border-[#272a36]">
                <iframe src={liveStreamUrl} title="Live Stream" className="w-full h-full" allowFullScreen />
              </div>
            </div>
          )}

          {user ? (
            <form onSubmit={handleCreatePost} className="clip-hud bg-[#14161f] border border-white/10 p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-wider">
                <Flame className="w-4 h-4 text-rose-500" /> Buka Suara di Base Camp
              </div>
              <textarea
                rows={3}
                placeholder="Tulis pesan, ajakan mabar, atau info scrim hari ini..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-[#0b0c10] border border-[#272a36] rounded-lg p-3.5 text-xs text-white focus:outline-none focus:border-rose-500 transition-colors resize-none"
                required
              />
              <div className="flex justify-between items-center pt-1">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-[#0b0c10] border border-[#272a36] text-xs text-[#9CA3B4] font-bold rounded-lg px-3 py-2 focus:outline-none focus:border-rose-500"
                >
                  <option value="General">General</option>
                  <option value="Showcase">Showcase Klip</option>
                  <option value="Tournament">Info Scrim</option>
                </select>
                <button
                  type="submit"
                  disabled={loading}
                  className="clip-hud-btn bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> {loading ? 'Mengirim...' : 'Kirim Pesan'}
                </button>
              </div>
            </form>
          ) : (
            <div className="clip-hud bg-[#14161f] border border-white/10 p-4 text-center text-xs text-[#9CA3B4]">
              Silakan <a href="/login" className="text-rose-500 font-bold underline">Masuk Akun</a> untuk ikut nimbrung di lobi diskusi.
            </div>
          )}

          {/* Stream Feed Postingan Per Halaman */}
          <div className="space-y-4">
            {currentPosts.map((post) => (
              <div key={post.id} className="clip-hud bg-[#14161f] border border-white/10 p-5 space-y-3 shadow-lg hover:border-white/20 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {renderAvatarFrame(post.userAvatar, post.userName, (post as any).userBadge)}
                    <div>
                      <h4 className="font-extrabold text-xs text-white flex items-center gap-2">
                        {post.userName}
                        {(post as any).userBadge && (
                          <span className="text-[9px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                            {(post as any).userBadge}
                          </span>
                        )}
                      </h4>
                      <span className="text-[10px] text-[#9CA3B4]">Anggota Roster</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-white/5 text-[#9CA3B4] border border-white/10 px-2.5 py-1 font-bold">
                    {post.category || 'General'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#F4F5F8] leading-relaxed whitespace-pre-wrap">{post.content}</p>
              </div>
            ))}

            {posts.length === 0 && (
              <div className="clip-hud text-center py-12 text-xs text-[#9CA3B4] bg-[#14161f] border border-white/10">
                Belum ada postingan di lobi. Jadilah yang pertama posting!
              </div>
            )}
          </div>

          {/* HUD PAGINATION CONTROLS [BACK] [1] [2] [3] [NEXT] */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="clip-hud-btn bg-[#14161f] border border-white/10 hover:border-rose-500 text-white p-2.5 text-xs disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => handlePageChange(number)}
                  className={`clip-hud-btn w-9 h-9 text-xs font-black transition-all ${
                    currentPage === number
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 border border-rose-500'
                      : 'bg-[#14161f] border border-white/10 text-[#9CA3B4] hover:text-white hover:border-white/20'
                  }`}
                >
                  {number}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="clip-hud-btn bg-[#14161f] border border-white/10 hover:border-rose-500 text-white p-2.5 text-xs disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* SIDEBAR BENTO GRID */}
        <div className="lg:col-span-5 space-y-6">
          <div className="clip-hud bg-gradient-to-br from-[#1c1a14] via-[#14161f] to-[#14161f] border border-amber-500/30 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
                <Crown className="w-4 h-4 text-amber-400" /> HALL OF FAME TOP DONATUR
              </div>
              <Trophy className="w-4 h-4 text-amber-500/50" />
            </div>

            <div className="space-y-2">
              {topDonors.map((d, index) => (
                <div key={d.id} className="bg-[#0b0c10] border border-amber-500/20 p-3 rounded-none flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 bg-amber-500/20 text-amber-400 font-black text-[10px] flex items-center justify-center border border-amber-500/40">
                      #{index + 1}
                    </span>
                    <span className="font-extrabold text-white">{d.name}</span>
                  </div>
                  <span className="text-amber-400 font-black tracking-wide">{d.amount}</span>
                </div>
              ))}
            </div>

            <a
              href={donateUrl || 'https://saweria.co/olexty'}
              target="_blank"
              rel="noreferrer"
              className="clip-hud-btn flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black p-3 text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-500/10"
            >
              <Coins className="w-4 h-4" /> Saweria / Support Kas Base Camp <ExternalLink className="w-3.5 h-3.5 ml-auto" />
            </a>
          </div>

          <div className="clip-hud bg-[#14161f] border border-white/10 p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-rose-500 font-black text-xs uppercase tracking-wider border-b border-white/10 pb-3">
              <Shield className="w-4 h-4" /> ATURAN TEMPUR SCRIM / WAR
            </div>
            {rulesWar && <p className="text-xs text-[#9CA3B4] leading-relaxed whitespace-pre-wrap font-medium">{rulesWar}</p>}

            {gbWarLink && (
              <a
                href={gbWarLink}
                target="_blank"
                rel="noreferrer"
                className="clip-hud-btn flex items-center justify-between bg-rose-600/15 border border-rose-500/40 hover:bg-rose-600/25 p-3 text-xs text-rose-400 font-extrabold transition-all group"
              >
                <span className="flex items-center gap-2">
                  <Swords className="w-4 h-4 text-rose-500" /> MASUK ROOM GB WAR
                </span>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            )}
          </div>

          <div className="clip-hud bg-[#14161f] border border-white/10 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-wider">
                <Users className="w-4 h-4 text-rose-500" /> LOBI ROSTER & PIKET CIRCLE
              </div>
              <span className="text-[10px] bg-rose-600/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 font-bold">
                {babuList.length} Personel
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {babuList.map((babu) => (
                <div key={babu.id} className="bg-[#0b0c10] border border-white/10 p-2.5 flex items-center justify-between text-xs">
                  <span className="font-extrabold text-white">{babu.name}</span>
                  <span className="text-[10px] text-rose-400 bg-rose-600/10 border border-rose-500/20 px-2 py-0.5 font-black uppercase">
                    {babu.task}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};