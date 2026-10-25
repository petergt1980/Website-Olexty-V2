import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F4F5F8] flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-amber-400" /> Moderasi Laporan Konten
        </h1>
        <p className="text-sm text-[#9CA3B4] mt-1">
          Tinjau postingan atau komentar yang ditandai oleh anggota komunitas.
        </p>
      </div>

      <div className="bg-[#181A22] border border-[#292C36] rounded-2xl p-12 text-center text-xs text-[#9CA3B4]">
        Belum ada laporan pelanggaran baru yang masuk.
      </div>
    </div>
  );
};