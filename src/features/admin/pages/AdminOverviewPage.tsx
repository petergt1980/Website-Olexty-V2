import React from 'react';
import { Users, FileText, AlertTriangle, Activity } from 'lucide-react';

export const AdminOverviewPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F4F5F8]">Ringkasan Sistem Admin</h1>
        <p className="text-sm text-[#9CA3B4] mt-1">
          Pantau statistik utama dan status platform OLEXTY Community secara ringkas.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#181A22] border border-[#292C36] p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-[#9CA3B4]">Total Anggota</p>
            <h3 className="text-xl font-bold text-[#F4F5F8] mt-1">1</h3>
          </div>
          <Users className="w-8 h-8 text-[#8B8CF8]" />
        </div>

        <div className="bg-[#181A22] border border-[#292C36] p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-[#9CA3B4]">Total Postingan</p>
            <h3 className="text-xl font-bold text-[#F4F5F8] mt-1">0</h3>
          </div>
          <FileText className="w-8 h-8 text-emerald-400" />
        </div>

        <div className="bg-[#181A22] border border-[#292C36] p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-[#9CA3B4]">Laporan Konten</p>
            <h3 className="text-xl font-bold text-[#F4F5F8] mt-1">0</h3>
          </div>
          <AlertTriangle className="w-8 h-8 text-amber-400" />
        </div>

        <div className="bg-[#181A22] border border-[#292C36] p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-[#9CA3B4]">Status Firebase</p>
            <h3 className="text-sm font-bold text-emerald-400 mt-1">Terhubung</h3>
          </div>
          <Activity className="w-8 h-8 text-blue-400" />
        </div>
      </div>
    </div>
  );
};