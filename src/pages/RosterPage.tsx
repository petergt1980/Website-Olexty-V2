import React from 'react';
import { Trophy, Crown, Gamepad2 } from 'lucide-react';

interface RosterPlayer {
  id: string;
  name: string;
  nickname: string;
  role: 'IGL / Leader' | 'Rusher' | 'Support' | 'Sniper' | 'Coach';
  avatar: string;
  status: 'Pemain Utama' | 'Cadangan' | 'Kapten';
}

const rosterList: RosterPlayer[] = [
  {
    id: '1',
    name: 'Davis Rastra',
    nickname: 'OLEXTY | CyberFlux',
    role: 'IGL / Leader',
    avatar: '',
    status: 'Kapten',
  },
  {
    id: '2',
    name: 'Player 2',
    nickname: 'OLEXTY | Apex',
    role: 'Rusher',
    avatar: '',
    status: 'Pemain Utama',
  },
  {
    id: '3',
    name: 'Player 3',
    nickname: 'OLEXTY | Spectre',
    role: 'Support',
    avatar: '',
    status: 'Pemain Utama',
  },
  {
    id: '4',
    name: 'Player 4',
    nickname: 'OLEXTY | Hawkeye',
    role: 'Sniper',
    avatar: '',
    status: 'Pemain Utama',
  },
];

export const RosterPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-4 space-y-6">
      <div className="bg-gradient-to-r from-[#181A22] via-[#212430] to-[#181A22] border border-[#292C36] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5" /> Official Roster
          </span>
          <h1 className="text-2xl font-extrabold text-[#F4F5F8] mt-2">OLEXTY INTI ESPORTS</h1>
          <p className="text-xs text-[#9CA3B4] mt-1">
            Squad utama kompetitif platform OLEXTY Community.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {rosterList.map((player) => (
          <div
            key={player.id}
            className="bg-[#181A22] border border-[#292C36] rounded-2xl p-5 text-center space-y-3 relative hover:border-[#8B8CF8]/50 transition-colors"
          >
            {player.status === 'Kapten' && (
              <span className="absolute top-3 right-3 text-amber-400" title="Kapten Tim">
                <Crown className="w-5 h-5" />
              </span>
            )}

            <div className="w-20 h-20 mx-auto rounded-full bg-[#8B8CF8]/20 border-2 border-[#8B8CF8] flex items-center justify-center text-[#8B8CF8] font-bold text-xl overflow-hidden">
              {player.avatar ? (
                <img src={player.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                player.nickname[0]
              )}
            </div>

            <div>
              <h3 className="font-bold text-sm text-[#F4F5F8]">{player.nickname}</h3>
              <p className="text-xs text-[#9CA3B4]">{player.name}</p>
            </div>

            <div className="pt-2 border-t border-[#292C36] flex items-center justify-between text-xs">
              <span className="text-[#9CA3B4] flex items-center gap-1 text-[11px]">
                <Gamepad2 className="w-3.5 h-3.5 text-[#8B8CF8]" /> Role:
              </span>
              <span className="font-semibold text-[#8B8CF8]">{player.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};