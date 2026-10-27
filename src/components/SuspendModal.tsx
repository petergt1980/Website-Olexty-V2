import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface SuspendModalProps {
  isOpen: boolean;
  targetName: string;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export const SuspendModal: React.FC<SuspendModalProps> = ({ isOpen, targetName, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-space">
      <div className="clip-hud bg-[#14161f] border border-rose-500/50 max-w-md w-full p-6 space-y-5 shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-rose-500 font-black text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 animate-pulse" /> KONFIRMASI BAN / SUSPEND
          </div>
          <button onClick={onClose} className="text-[#9CA3B4] hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-[#F4F5F8] leading-relaxed">
            Masukkan alasan penangguhan akun untuk <strong className="text-rose-400">{targetName}</strong>:
          </p>
          <textarea
            rows={3}
            placeholder="Contoh: Melanggar aturan chat / toxic di lobi..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-[#0b0c10] border border-white/10 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="clip-hud-btn bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-xs font-black uppercase tracking-wider transition-all"
          >
            Batal
          </button>
          <button
            onClick={() => {
              onSubmit(reason.trim() || 'Pelanggaran aturan komunitas');
              setReason('');
            }}
            className="clip-hud-btn bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 text-xs font-black uppercase tracking-wider shadow-lg shadow-rose-600/30 transition-all"
          >
            Konfirmasi Suspend
          </button>
        </div>
      </div>
    </div>
  );
};