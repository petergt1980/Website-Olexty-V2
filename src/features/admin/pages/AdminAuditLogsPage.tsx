import React from 'react';
import { History } from 'lucide-react';

export const AdminAuditLogPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F4F5F8] flex items-center gap-2">
          <History className="w-6 h-6 text-[#8B8CF8]" /> Log Riwayat Aktivitas
        </h1>
        <p className="text-sm text-[#9CA3B4] mt-1">
          Catatan riwayat perubahan peran, tindakan moderasi, dan manajemen akun.
        </p>
      </div>

      <div className="bg-[#181A22] border border-[#292C36] rounded-2xl p-12 text-center text-xs text-[#9CA3B4]">
        Belum ada catatan aktivitas admin yang terekam.
      </div>
    </div>
  );
};