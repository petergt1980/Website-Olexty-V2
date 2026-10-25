import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { SocialLinks } from '../../../types';
import { Settings, Save, Check, Share2, MessageCircle, Video, Youtube, Megaphone } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [discordUrl, setDiscordUrl] = useState('');
  const [waChannelUrl, setWaChannelUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [announcementText, setAnnouncementText] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      const docSnap = await getDoc(doc(db, 'settings', 'communityConfig'));
      if (docSnap.exists()) {
        const data = docSnap.data() as SocialLinks;
        setDiscordUrl(data.discordUrl || '');
        setWaChannelUrl(data.waChannelUrl || '');
        setTiktokUrl(data.tiktokUrl || '');
        setYoutubeUrl(data.youtubeUrl || '');
        setAnnouncementText(data.announcementText || '');
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await setDoc(doc(db, 'settings', 'communityConfig'), {
        discordUrl: discordUrl.trim(),
        waChannelUrl: waChannelUrl.trim(),
        tiktokUrl: tiktokUrl.trim(),
        youtubeUrl: youtubeUrl.trim(),
        announcementText: announcementText.trim(),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Gagal menyimpan konfigurasi admin:', err);
      alert('Gagal menyimpan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F4F5F8] flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-400" /> Pengaturan Komunitas (Admin)
        </h1>
        <p className="text-sm text-[#9CA3B4] mt-1">
          Kelola link sosial media official dan banner pengumuman yang muncul di feed komunitas.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-[#181A22] border border-[#292C36] rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-[#F4F5F8] flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-[#8B8CF8]" /> Pengumuman Utama
          </h2>
          <textarea
            rows={2}
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
            placeholder="Contoh: Open Scrim FF Gratis Minggu Ini! Join Discord sekarang."
          />
        </div>

        <div className="bg-[#181A22] border border-[#292C36] rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-[#F4F5F8]">Link Tautan Sosial Media</h2>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-[#9CA3B4] flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-[#5865F2]" /> Link Discord Server
              </label>
              <input
                type="url"
                value={discordUrl}
                onChange={(e) => setDiscordUrl(e.target.value)}
                className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
                placeholder="https://discord.gg/..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[#9CA3B4] flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" /> Link Saluran WhatsApp
              </label>
              <input
                type="url"
                value={waChannelUrl}
                onChange={(e) => setWaChannelUrl(e.target.value)}
                className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
                placeholder="https://whatsapp.com/channel/..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[#9CA3B4] flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-pink-400" /> Link Akun TikTok
              </label>
              <input
                type="url"
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
                className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
                placeholder="https://tiktok.com/@..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[#9CA3B4] flex items-center gap-1.5">
                <Youtube className="w-3.5 h-3.5 text-red-400" /> Link Channel YouTube
              </label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
                placeholder="https://youtube.com/@..."
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {success ? (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
              <Check className="w-4 h-4" /> Berhasil memperbarui konfigurasi!
            </span>
          ) : (
            <span />
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-600 text-black px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Menyimpan...' : 'Simpan Pengaturan Admin'}
          </button>
        </div>
      </form>
    </div>
  );
};