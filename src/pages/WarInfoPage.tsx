import React from 'react';
import { Shield, Link as LinkIcon, Swords, ExternalLink } from 'lucide-react';

export const WarInfoPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Header Banner */}
      <div className="bg-[#181A22] border border-[#292C36] rounded-2xl p-6 space-y-2 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#8B8CF8]/10 text-[#8B8CF8] rounded-xl">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#F4F5F8]">Rules War & GB War OLEXTY</h1>
            <p className="text-xs text-[#9CA3B4]">Panduan aturan pertempuran dan tautan koordinasi resmi guild.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rules War Section */}
        <div className="bg-[#181A22] border border-[#292C36] rounded-2xl p-6 space-y-4 shadow-md">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Shield className="w-5 h-5" /> Aturan & Rules War
          </div>
          <ul className="space-y-3 text-xs text-[#9CA3B4] list-disc list-inside leading-relaxed">
            <li><strong className="text-[#F4F5F8]">Absensi & Kehadiran:</strong> Wajib hadir tepat waktu sesuai jadwal war yang ditentukan oleh pimpinan/admin.</li>
            <li><strong className="text-[#F4F5F8]">Koordinasi Tim:</strong> Wajib aktif di voice chat atau grup koordinasi saat match berlangsung.</li>
            <li><strong className="text-[#F4F5F8]">Dilarang Toxic:</strong> Menjaga sportivitas, dilarang menyalahkan rekan satu tim secara berlebihan.</li>
            <li><strong className="text-[#F4F5F8]">Konfirmasi Absen:</strong> Jika berhalangan hadir, wajib melapor kepada admin selambat-lambatnya H-1 sebelum war dimulai.</li>
          </ul>
        </div>

        {/* Link GB War Section */}
        <div className="bg-[#181A22] border border-[#292C36] rounded-2xl p-6 space-y-4 shadow-md">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <LinkIcon className="w-5 h-5" /> Link & Akses GB War
          </div>
          <p className="text-xs text-[#9CA3B4]">Gunakan tautan resmi di bawah ini untuk koordinasi dan akses ruangan GB:</p>
          
          <div className="space-y-3 pt-2">
            <a 
              href="https://chat.whatsapp.com/olexty_gb_official" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-between bg-[#14161D] border border-[#292C36] hover:border-[#8B8CF8] p-3.5 rounded-xl text-xs text-[#8B8CF8] font-semibold transition-colors group"
            >
              <span>🔗 Grup WhatsApp Koordinasi GB War</span>
              <ExternalLink className="w-4 h-4 text-[#9CA3B4] group-hover:text-[#8B8CF8]" />
            </a>

            <a 
              href="https://discord.gg/olexty" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-between bg-[#14161D] border border-[#292C36] hover:border-[#8B8CF8] p-3.5 rounded-xl text-xs text-[#8B8CF8] font-semibold transition-colors group"
            >
              <span>🎮 Discord Channel War & Strategy</span>
              <ExternalLink className="w-4 h-4 text-[#9CA3B4] group-hover:text-[#8B8CF8]" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};