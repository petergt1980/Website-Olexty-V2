import React from 'react';
import { UserProfile } from '../types';
import { Gamepad2, Copy, ShieldCheck } from 'lucide-react';

interface MemberCardProps {
  member: UserProfile;
}

export const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const handleCopyId = () => {
    if (member.gameId) {
      navigator.clipboard.writeText(member.gameId);
      alert(`Game ID ${member.gameId} berhasil disalin!`);
    }
  };

  return (
    <div className="bg-[#181A22] border border-[#292C36] rounded-2xl p-5 space-y-4 hover:border-[#8B8CF8]/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="relative w-14 h-14 rounded-full bg-[#8B8CF8]/20 border border-[#292C36] overflow-hidden flex items-center justify-center font-bold text-[#8B8CF8] text-lg">
          {member.avatarUrl ? (
            <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            member.displayName?.[0] || 'U'
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[#F4F5F8] text-sm truncate">{member.displayName}</h3>
            {member.role === 'admin' && <ShieldCheck className="w-4 h-4 text-amber-400" />}
          </div>
          <p className="text-xs text-[#9CA3B4]">@{member.username}</p>
          
          {member.gameRole && (
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#8B8CF8]/10 text-[#8B8CF8] border border-[#8B8CF8]/20">
              {member.gameRole}
            </span>
          )}
        </div>
      </div>

      {/* Info Game ID & Nickname */}
      <div className="bg-[#14161D] rounded-xl p-3 border border-[#292C36] space-y-2 text-xs">
        <div className="flex items-center justify-between text-[#9CA3B4]">
          <span className="flex items-center gap-1.5 text-[11px]">
            <Gamepad2 className="w-3.5 h-3.5 text-[#8B8CF8]" /> Nick Game:
          </span>
          <span className="font-semibold text-[#F4F5F8]">{member.gameNick || '-'}</span>
        </div>

        <div className="flex items-center justify-between text-[#9CA3B4]">
          <span className="text-[11px]">Game ID:</span>
          <button
            onClick={handleCopyId}
            className="flex items-center gap-1 font-mono text-[#8B8CF8] hover:underline"
          >
            {member.gameId || '-'}{' '}
            {member.gameId && <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </div>
  );
};