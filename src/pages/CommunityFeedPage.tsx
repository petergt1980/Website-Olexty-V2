import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../features/auth/AuthContext';
import { Post } from '../types';
import { Sparkles, Trophy, Megaphone, Shield, Swords, ExternalLink, Users, Heart, Coins, Radio, Gift } from 'lucide-react';

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

  // Data Komunitas
  const [announcement, setAnnouncement] = useState('');
  const [babuList, setBabuList] = useState<BabuItem[]>([]);
  const [topDonors, setTopDonors] = useState<TopDonorItem[]>([]);
  const [rulesWar, setRulesWar] = useState('');
  const [gbWarLink, setGbWarLink] = useState('');
  const [donateUrl, setDonateUrl] = useState('');
  const [liveStreamUrl, setLiveStreamUrl] = useState('');
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState('');

  // Daily Check-In State
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
        setDiscordWebhookUrl(data.discordWebhookUrl || '');
      }
    });

    return () => {
      unsubscribePosts();
      unsubscribeConfig();
    };
  }, []);

  // Kirim Webhook ke Discord
  const triggerDiscordWebhook = async (postContent: string) => {
    if (!discordWebhookUrl) return;
    try {
      await fetch(discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [
            {
              title: '💬 Postingan Baru di OLEXTY Community!',
              description: postContent,
              color: 9145608,
              author: { name: profile?.displayName || 'Member' },
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });
    } catch (err) {
      console.error('Gagal kirim webhook Discord:', err);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'posts'), {
        userId: user.uid,
        userName: profile?.displayName || 'Member OLEXTY',
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Daily Check-In Claim Poin
  const handleDailyCheckIn = async () => {
    if (!user) return;
    try {
      const currentPoints = (profile as any)?.points || 0;
      const newPoints = currentPoints + 100;
      await updateDoc(doc(db, 'users', user.uid), {
        points: newPoints,
        lastCheckIn: new Date(),
      });
      setCheckInClaimed(true);
      alert('Selamat! Kamu mendapatkan +100 Poin Check-In Harian! 🎉');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner Announcement */}
      {announcement && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
          <Megaphone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-bounce" />
          <p className="text-xs sm:text-sm text-[#F4F5F8]">{announcement}</p>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#181A22] via-[#202330] to-[#181A22] border border-[#292C36] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] font-bold text-[#8B8CF8] bg-[#8B8CF8]/10 px-2.5 py-1 rounded-full uppercase">Circle Not Marga</span>
            <h1 className="text-2xl font-black text-[#F4F5F8] mt-1">OLEXTY COMMUNITY HQ</h1>
          </div>

          {/* Daily Check-In Widget */}
          {user && (
            <button
              onClick={handleDailyCheckIn}
              disabled={checkInClaimed}
              className="flex items-center gap-2 bg-gradient-to-r from-[#8B8CF8] to-[#7879E8] hover:opacity-90 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg disabled:opacity-50"
            >
              <Gift className="w-4 h-4" />
              {checkInClaimed ? 'Poin Diklaim Hari Ini' : 'Klaim Daily Check-In (+100 PTS)'}
            </button>
          )}
        </div>
      </div>

      {/* Grid Utama */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Feed Diskusi */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Stream Widget Embed */}
          {liveStreamUrl && (
            <div className="bg-[#181A22] border border-[#292C36] rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase">
                <Radio className="w-4 h-4 animate-pulse" /> Live Stream Mabar / War
              </div>
              <div className="aspect-video rounded-xl overflow-hidden border border-[#292C36]">
                <iframe src={liveStreamUrl} title="Live Stream" className="w-full h-full" allowFullScreen />
              </div>
            </div>
          )}

          {/* Form Buat Postingan */}
          {user && (
            <form onSubmit={handleCreatePost} className="bg-[#181A22] border border-[#292C36] rounded-2xl p-5 space-y-3">
              <textarea
                rows={3}
                placeholder="Bagikan sesuatu dengan komunitas..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-[#14161D] border border-[#292C36] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#8B8CF8]"
                required
              />
              <div className="flex justify-between items-center">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-[#14161D] border border-[#292C36] text-xs text-white rounded-xl p-2">
                  <option value="General">General</option>
                  <option value="Showcase">Showcase</option>
                  <option value="Tournament">Tournament</option>
                </select>
                <button type="submit" disabled={loading} className="bg-[#8B8CF8] text-white px-4 py-2 rounded-xl text-xs font-bold">
                  {loading ? 'Mengirim...' : 'Kirim Postingan'}
                </button>
              </div>
            </form>
          )}

          {/* List Feed */}
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-[#181A22] border border-[#292C36] rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">{post.userName}</span>
                    {/* Display Badge Gelar Pengguna */}
                    {(post as any).userBadge && (
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-bold">
                        {(post as any).userBadge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] bg-[#8B8CF8]/10 text-[#8B8CF8] px-2 py-0.5 rounded font-bold">{post.category}</span>
                </div>
                <p className="text-xs text-white leading-relaxed">{post.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Top Donatur Leaderboard */}
          <div className="bg-[#181A22] border border-[#292C36] rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase border-b border-[#292C36] pb-2">
              <Coins className="w-4 h-4" /> Leaderboard Top Donatur
            </div>
            <div className="space-y-2">
              {topDonors.map((d, index) => (
                <div key={d.id} className="flex justify-between items-center text-xs bg-[#14161D] p-2 rounded-xl">
                  <span className="font-bold text-white">#{index + 1} {d.name}</span>
                  <span className="text-amber-400 font-bold">{d.amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rules War Widget */}
          <div className="bg-[#181A22] border border-[#292C36] rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase border-b border-[#292C36] pb-2">
              <Shield className="w-4 h-4" /> Rules & Aturan War
            </div>
            {rulesWar ? (
              <p className="text-xs text-[#9CA3B4] leading-relaxed whitespace-pre-wrap">{rulesWar}</p>
            ) : (
              <p className="text-xs text-[#9CA3B4] italic">Belum ada aturan war khusus.</p>
            )}
          </div>

          {/* Link GB War Widget */}
          <div className="bg-[#181A22] border border-[#292C36] rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase border-b border-[#292C36] pb-2">
              <Swords className="w-4 h-4" /> Akses GB War
            </div>
            {gbWarLink ? (
              <a
                href={gbWarLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between bg-[#14161D] border border-[#292C36] hover:border-[#8B8CF8] p-3 rounded-xl text-xs text-[#8B8CF8] font-bold transition-all group"
              >
                <span>🔗 Masuk Room GB War</span>
                <ExternalLink className="w-4 h-4 text-[#9CA3B4] group-hover:text-[#8B8CF8]" />
              </a>
            ) : (
              <p className="text-xs text-[#9CA3B4] italic">Link GB War belum tersedia.</p>
            )}
          </div>

          {/* Support / Donasi Link */}
          <div className="bg-[#181A22] border border-[#292C36] rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-[#8B8CF8] font-bold text-xs uppercase">
              <Heart className="w-4 h-4 text-rose-400" /> Support Komunitas
            </div>
            <a href={donateUrl || 'https://saweria.co/olexty'} target="_blank" rel="noreferrer" className="block text-center bg-amber-500 text-black font-extrabold p-2.5 rounded-xl text-xs">
              Saweria / Donasi
            </a>
          </div>

          {/* List Babu */}
          <div className="bg-[#181A22] border border-[#292C36] rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-[#8B8CF8] font-bold text-xs uppercase border-b border-[#292C36] pb-2">
              <Users className="w-4 h-4" /> List Babu / Tugas
            </div>
            <div className="space-y-2">
              {babuList.map((babu) => (
                <div key={babu.id} className="flex justify-between text-xs bg-[#14161D] p-2 rounded-xl text-white">
                  <span>{babu.name}</span>
                  <span className="text-[#8B8CF8]">{babu.task}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};