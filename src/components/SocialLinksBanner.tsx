import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SocialLinks } from '../types';
import { MessageCircle, Video, Youtube, Share2, Megaphone, ArrowUpRight } from 'lucide-react';

export const SocialLinksBanner: React.FC = () => {
  const [config, setConfig] = useState<SocialLinks>({});

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'communityConfig'), (docSnap) => {
      if (docSnap.exists()) {
        setConfig(docSnap.data() as SocialLinks);
      }
    });
    return () => unsubscribe();
  }, []);

  const hasLinks = config.discordUrl || config.waChannelUrl || config.tiktokUrl || config.youtubeUrl;

  return (
    <div className="space-y-4 my-5">
      {/* Pengumuman Header Banner */}
      {config.announcementText && (
        <div className="relative overflow-hidden bg-gradient-to-r from-[#8B8CF8]/20 via-[#6366F1]/10 to-transparent border border-[#8B8CF8]/30 backdrop-blur-md rounded-2xl p-4 shadow-lg shadow-[#8B8CF8]/5">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-[#8B8CF8]/20 rounded-xl border border-[#8B8CF8]/30 shrink-0">
              <Megaphone className="w-5 h-5 text-[#8B8CF8] animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#8B8CF8]">
                Announcement
              </span>
              <p className="text-xs text-[#F4F5F8] font-medium leading-relaxed">
                {config.announcementText}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid Quick Link Social Media */}
      {hasLinks && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {config.discordUrl && (
            <a
              href={config.discordUrl}
              target="_blank"
              rel="noreferrer"
              className="group relative overflow-hidden bg-[#181A22] border border-[#5865F2]/30 hover:border-[#5865F2] rounded-2xl p-3.5 transition-all duration-300 hover:shadow-lg hover:shadow-[#5865F2]/20 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#5865F2]/15 flex items-center justify-center border border-[#5865F2]/30 text-[#5865F2] group-hover:scale-110 transition-transform">
                  <Share2 className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#9CA3B4] group-hover:text-[#5865F2] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <div className="mt-3">
                <div className="text-[11px] font-bold text-[#F4F5F8] group-hover:text-[#5865F2] transition-colors">
                  Discord Server
                </div>
                <div className="text-[10px] text-[#9CA3B4]">Join Komunitas</div>
              </div>
            </a>
          )}

          {config.waChannelUrl && (
            <a
              href={config.waChannelUrl}
              target="_blank"
              rel="noreferrer"
              className="group relative overflow-hidden bg-[#181A22] border border-emerald-500/30 hover:border-emerald-400 rounded-2xl p-3.5 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center border border-emerald-500/30 text-emerald-400 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#9CA3B4] group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <div className="mt-3">
                <div className="text-[11px] font-bold text-[#F4F5F8] group-hover:text-emerald-400 transition-colors">
                  Saluran WA
                </div>
                <div className="text-[10px] text-[#9CA3B4]">Info Scrim & Update</div>
              </div>
            </a>
          )}

          {config.tiktokUrl && (
            <a
              href={config.tiktokUrl}
              target="_blank"
              rel="noreferrer"
              className="group relative overflow-hidden bg-[#181A22] border border-pink-500/30 hover:border-pink-400 rounded-2xl p-3.5 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-pink-500/15 flex items-center justify-center border border-pink-500/30 text-pink-400 group-hover:scale-110 transition-transform">
                  <Video className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#9CA3B4] group-hover:text-pink-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <div className="mt-3">
                <div className="text-[11px] font-bold text-[#F4F5F8] group-hover:text-pink-400 transition-colors">
                  TikTok Official
                </div>
                <div className="text-[10px] text-[#9CA3B4]">Short Clips & Highlights</div>
              </div>
            </a>
          )}

          {config.youtubeUrl && (
            <a
              href={config.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="group relative overflow-hidden bg-[#181A22] border border-red-500/30 hover:border-red-500 rounded-2xl p-3.5 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center border border-red-500/30 text-red-500 group-hover:scale-110 transition-transform">
                  <Youtube className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#9CA3B4] group-hover:text-red-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <div className="mt-3">
                <div className="text-[11px] font-bold text-[#F4F5F8] group-hover:text-red-500 transition-colors">
                  YouTube
                </div>
                <div className="text-[10px] text-[#9CA3B4]">Full Match & Stream</div>
              </div>
            </a>
          )}
        </div>
      )}
    </div>
  );
};