import React, { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ToastContainer, ToastMessage } from '../components/Toast';
import { 
  Trophy, 
  Target, 
  Gift, 
  Sparkles, 
  Swords, 
  RotateCw, 
  CheckCircle2, 
  Zap, 
  Award, 
  Play,
  HelpCircle,
  Shuffle,
  Crown,
  CheckSquare
} from 'lucide-react';

const playHUDSound = (type: 'click' | 'win' | 'shot') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'shot') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'win') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch (err) {}
};

const ffQuizData = [
  {
    question: "Senjata Assault Rifle (AR) mana yang memiliki status Armor Penetration tertinggi secara alami?",
    options: ["M4A1", "Groza", "M82B", "SVD"],
    answer: 3
  },
  {
    question: "Map manakah di Free Fire yang memiliki lokasi landmark bernama 'Clock Tower'?",
    options: ["Bermuda", "Kalahari", "Purgatory", "Alpine"],
    answer: 0
  },
  {
    question: "Apa fungsi utama dari item 'Gloo Wall' dalam pertempuran?",
    options: ["Restorasi HP", "Pelindung Tembakan Pertahanan Instant", "Menambah Armor", "Meningkatkan Speed"],
    answer: 1
  },
  {
    question: "Karakter FF manakah yang memiliki skill aktif 'Drop the Beat' yang membuat lingkaran aura healing & movement speed?",
    options: ["Chrono", "Alok", "K", "Skyler"],
    answer: 1
  },
  {
    question: "Senjata SMG mana yang terkenal memiliki Rate of Fire (kecepatan tembak) paling ekstrem?",
    options: ["MP40", "UMP", "Thompson", "P90"],
    answer: 0
  }
];

export const ArcadeHubPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'trivia' | 'randomizer' | 'bracket' | 'gacha' | 'aim' | 'bingo'>('trivia');

  // Custom Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'reward' = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Trivia State
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleSelectQuizAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    playHUDSound('click');
    setSelectedAnswer(index);
    if (index === ffQuizData[currentQuizIndex].answer) {
      setQuizScore((prev) => prev + 20);
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuizIndex < ffQuizData.length - 1) {
      setCurrentQuizIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setQuizCompleted(true);
      playHUDSound('win');
      if (user && quizScore > 0) {
        const currentPoints = (profile as any)?.points || 0;
        await updateDoc(doc(db, 'users', user.uid), { points: currentPoints + quizScore });
        addToast(`Selamat! Hadiah +${quizScore} PTS berhasil diklaim dari Trivia! 🏆`, 'reward');
      }
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setQuizCompleted(false);
  };

  // Team Randomizer State
  const [playerInput, setPlayerInput] = useState('OLX.Vin, OLX.Sam, OLX.Hapis, OLX.Ell, OLX.Azwa, OLX.Pes, OLX.Bilal, OLX.Rapek');
  const [numTeams, setNumTeams] = useState(2);
  const [randomTeams, setRandomTeams] = useState<string[][]>([]);

  const handleRandomizeTeams = () => {
    playHUDSound('click');
    const players = playerInput.split(',').map((p) => p.trim()).filter((p) => p.length > 0);
    if (players.length < numTeams) {
      addToast('Jumlah pemain tidak cukup untuk dibagi ke dalam tim!', 'error');
      return;
    }
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const teams: string[][] = Array.from({ length: numTeams }, () => []);
    
    shuffled.forEach((player, idx) => {
      teams[idx % numTeams].push(player);
    });
    setRandomTeams(teams);
    addToast('Squad berhasil diacak secara otomatis! 🔀', 'success');
  };

  // MVP Vote State
  const [mvpVotes, setMvpVotes] = useState<{ [key: string]: number }>({
    'OLX.Vin': 12,
    'OLX.Sam': 8,
    'OLX.Hapis': 15,
  });

  const handleVoteMVP = (name: string) => {
    playHUDSound('click');
    setMvpVotes((prev) => ({ ...prev, [name]: (prev[name] || 0) + 1 }));
    addToast(`Suaramu untuk MVP ${name} berhasil dikirim! 🏆`, 'success');
  };

  // Gacha State
  const [spinning, setSpinning] = useState(false);
  const [wheelAngle, setWheelAngle] = useState(0);
  const [gachaPrize, setGachaPrize] = useState<string | null>(null);

  const gachaItems = [
    { label: '+50 PTS', pts: 50, color: 'bg-[#14161f] text-white' },
    { label: '+100 PTS', pts: 100, color: 'bg-rose-950 text-rose-400' },
    { label: 'Zonk 💀', pts: 0, color: 'bg-[#0b0c10] text-gray-500' },
    { label: '+250 PTS', pts: 250, color: 'bg-amber-950 text-amber-400' },
    { label: 'Badge Lucky 🌟', pts: 150, color: 'bg-indigo-950 text-indigo-400' },
    { label: '+500 JACKPOT 🔥', pts: 500, color: 'bg-rose-600 text-white font-black' },
  ];

  const handleSpinGacha = async () => {
    if (!user || spinning) return;
    const currentPoints = (profile as any)?.points || 0;
    if (currentPoints < 50) {
      addToast('Poin PTS tidak cukup! Butuh 50 PTS untuk 1x Spin.', 'error');
      return;
    }

    playHUDSound('click');
    setSpinning(true);
    setGachaPrize(null);

    await updateDoc(doc(db, 'users', user.uid), { points: currentPoints - 50 });

    const randomIndex = Math.floor(Math.random() * gachaItems.length);
    const prize = gachaItems[randomIndex];
    const newAngle = wheelAngle + 1440 + randomIndex * (360 / gachaItems.length);

    setWheelAngle(newAngle);

    setTimeout(async () => {
      setSpinning(false);
      setGachaPrize(prize.label);
      playHUDSound('win');

      if (prize.pts > 0) {
        const latestPoints = ((profile as any)?.points || 0) - 50 + prize.pts;
        await updateDoc(doc(db, 'users', user.uid), { points: Math.max(0, latestPoints) });
        addToast(`Selamat! Kamu mendapakan: ${prize.label}`, 'reward');
      } else {
        addToast('Sayang sekali kamu dapet Zonk! Coba lagi bro.', 'info');
      }
    }, 3000);
  };

  // Aim Trainer State
  const [aimGameState, setAimGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [aimScore, setAimScore] = useState(0);
  const [aimHighScore, setAimHighScore] = useState(0);
  const [aimTimeLeft, setAimTimeLeft] = useState(15);
  const [targetPos, setTargetPos] = useState({ top: '50%', left: '50%' });

  const spawnTarget = () => {
    const top = Math.floor(Math.random() * 80 + 10) + '%';
    const left = Math.floor(Math.random() * 80 + 10) + '%';
    setTargetPos({ top, left });
  };

  const startAimGame = () => {
    playHUDSound('click');
    setAimScore(0);
    setAimTimeLeft(15);
    setAimGameState('playing');
    spawnTarget();
  };

  const handleHitTarget = () => {
    if (aimGameState !== 'playing') return;
    playHUDSound('shot');
    setAimScore((prev) => prev + 1);
    spawnTarget();
  };

  useEffect(() => {
    let timer: any;
    if (aimGameState === 'playing' && aimTimeLeft > 0) {
      timer = setInterval(() => setAimTimeLeft((prev) => prev - 1), 1000);
    } else if (aimTimeLeft === 0 && aimGameState === 'playing') {
      setAimGameState('ended');
      playHUDSound('win');
      if (aimScore > aimHighScore) setAimHighScore(aimScore);
      addToast(`Game Selesai! Skor Reflek Kamu: ${aimScore} Target`, 'success');
    }
    return () => clearInterval(timer);
  }, [aimGameState, aimTimeLeft, aimScore, aimHighScore]);

  // Bingo State
  const [bingoMissions, setBingoMissions] = useState([
    { id: 'b1', title: 'Main Scrim 1x', done: true },
    { id: 'b2', title: 'Dapat 5 Kill', done: false },
    { id: 'b3', title: 'Booyah Bareng Roster', done: true },
    { id: 'b4', title: 'Kirim Klip Gameplay', done: false },
    { id: 'b5', title: 'Check-In 3 Hari', done: false },
    { id: 'b6', title: 'Menang Aim Trainer', done: true },
  ]);

  const toggleBingo = (id: string) => {
    playHUDSound('click');
    setBingoMissions((prev) => prev.map((m) => m.id === id ? { ...m, done: !m.done } : m));
    addToast('Status misi Bingo diperbarui!', 'info');
  };

  return (
    <div className="space-y-6 pb-16 font-space relative">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="bg-[#14161f] border border-amber-500/30 p-2.5 text-center text-[10px] text-amber-400 font-bold uppercase tracking-wider clip-hud">
        ⚠️ FAN-MADE COMMUNITY HUB • UNSUPPORTED / NOT AFFILIATED WITH GARENA FREE FIRE OFFICIAL
      </div>

      <div className="clip-hud relative bg-gradient-to-r from-[#14161f] via-[#211a28] to-[#14161f] border border-rose-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-600/15 border border-rose-500/30 text-rose-400 text-[10px] font-black uppercase tracking-widest clip-hud-btn mb-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> MARKAS ARCADE & TOURNAMENT HUB
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase font-['Oxanium']">
              ARCADE HUB <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-400">OLEXTY</span>
            </h1>
            <p className="text-xs text-[#9CA3B4] mt-1">
              Uji trivia FF, bagi tim squad otomatis, pantau bracket scrim, dan kumpulkan poin PTS harian!
            </p>
          </div>

          <div className="clip-hud bg-[#0b0c10] border border-amber-500/40 p-3.5 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400">
            </div>
            <div>
              <span className="text-[9px] font-black text-[#9CA3B4] uppercase tracking-wider block">DOMPET PTS KAMU</span>
              <span className="text-lg font-black text-amber-400 font-['Oxanium']">
                {(profile as any)?.points || 0} <span className="text-xs">PTS</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => { playHUDSound('click'); setActiveTab('trivia'); }}
          className={`clip-hud-btn px-4 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'trivia' ? 'bg-rose-600 text-white shadow-lg' : 'bg-[#14161f] border border-white/10 text-[#9CA3B4]'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-amber-400" /> FF Trivia / Quiz
        </button>
        <button
          onClick={() => { playHUDSound('click'); setActiveTab('randomizer'); }}
          className={`clip-hud-btn px-4 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'randomizer' ? 'bg-rose-600 text-white shadow-lg' : 'bg-[#14161f] border border-white/10 text-[#9CA3B4]'
          }`}
        >
          <Shuffle className="w-4 h-4 text-rose-400" /> Team Randomizer
        </button>
        <button
          onClick={() => { playHUDSound('click'); setActiveTab('bracket'); }}
          className={`clip-hud-btn px-4 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'bracket' ? 'bg-rose-600 text-white shadow-lg' : 'bg-[#14161f] border border-white/10 text-[#9CA3B4]'
          }`}
        >
          <Swords className="w-4 h-4 text-amber-400" /> Bracket & MVP Vote
        </button>
        <button
          onClick={() => { playHUDSound('click'); setActiveTab('gacha'); }}
          className={`clip-hud-btn px-4 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'gacha' ? 'bg-rose-600 text-white shadow-lg' : 'bg-[#14161f] border border-white/10 text-[#9CA3B4]'
          }`}
        >
          <Gift className="w-4 h-4 text-emerald-400" /> Spin Gacha
        </button>
        <button
          onClick={() => { playHUDSound('click'); setActiveTab('aim'); }}
          className={`clip-hud-btn px-4 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'aim' ? 'bg-rose-600 text-white shadow-lg' : 'bg-[#14161f] border border-white/10 text-[#9CA3B4]'
          }`}
        >
          <Target className="w-4 h-4 text-rose-500" /> Aim Trainer
        </button>
        <button
          onClick={() => { playHUDSound('click'); setActiveTab('bingo'); }}
          className={`clip-hud-btn px-4 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'bingo' ? 'bg-rose-600 text-white shadow-lg' : 'bg-[#14161f] border border-white/10 text-[#9CA3B4]'
          }`}
        >
          <CheckSquare className="w-4 h-4 text-amber-400" /> Bingo Misi
        </button>
      </div>

      {activeTab === 'trivia' && (
        <div className="clip-hud bg-[#14161f] border border-white/10 p-6 space-y-6 shadow-xl">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" /> DAILY FF TRIVIA & KNOWLEDGE TEST
            </h3>
            <span className="text-xs font-bold text-amber-400 font-['Oxanium']">
              SOAL {currentQuizIndex + 1} / {ffQuizData.length}
            </span>
          </div>

          {!quizCompleted ? (
            <div className="space-y-5">
              <h4 className="text-base font-extrabold text-white leading-relaxed">
                {ffQuizData[currentQuizIndex].question}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ffQuizData[currentQuizIndex].options.map((opt, idx) => {
                  const isChosen = selectedAnswer === idx;
                  const isCorrect = idx === ffQuizData[currentQuizIndex].answer;
                  let btnStyle = 'bg-[#0b0c10] border-white/10 text-white hover:border-rose-500';

                  if (selectedAnswer !== null) {
                    if (isCorrect) btnStyle = 'bg-emerald-600/20 border-emerald-500 text-emerald-400 font-black';
                    else if (isChosen) btnStyle = 'bg-rose-600/20 border-rose-500 text-rose-400 font-black';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectQuizAnswer(idx)}
                      disabled={selectedAnswer !== null}
                      className={`clip-hud-btn border p-4 text-left text-xs transition-all ${btnStyle}`}
                    >
                      <span className="font-mono text-[10px] text-[#9CA3B4] mr-2">[{String.fromCharCode(65 + idx)}]</span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {selectedAnswer !== null && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNextQuestion}
                    className="clip-hud-btn bg-rose-600 hover:bg-rose-700 text-white px-6 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2"
                  >
                    {currentQuizIndex < ffQuizData.length - 1 ? 'Soal Berikutnya →' : 'Lihat Hasil Trivia 🏆'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <Trophy className="w-14 h-14 text-amber-400 mx-auto animate-bounce" />
              <h3 className="text-2xl font-black text-white uppercase font-['Oxanium']">TRIVIA SELESAI!</h3>
              <p className="text-sm text-[#9CA3B4]">
                Kamu menjawab benar dengan total skor: <span className="text-amber-400 font-black">{quizScore} PTS</span>
              </p>
              <button
                onClick={handleResetQuiz}
                className="clip-hud-btn bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 text-xs font-black uppercase tracking-wider inline-flex items-center gap-2"
              >
                <RotateCw className="w-4 h-4" /> Ulangi Trivia
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'randomizer' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 clip-hud bg-[#14161f] border border-white/10 p-5 space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-white/10 pb-3 flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-rose-400" /> GENERATOR SQUAD RANDOM
            </h3>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-[#9CA3B4]">Nama Member (Pisahkan Koma)</label>
              <textarea
                rows={4}
                value={playerInput}
                onChange={(e) => setPlayerInput(e.target.value)}
                className="w-full bg-[#0b0c10] border border-white/10 p-3 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-[#9CA3B4]">Jumlah Tim</label>
              <select
                value={numTeams}
                onChange={(e) => setNumTeams(Number(e.target.value))}
                className="w-full bg-[#0b0c10] border border-white/10 p-2.5 text-xs text-white"
              >
                <option value={2}>2 Squad (8 vs 8 / 4 vs 4)</option>
                <option value={3}>3 Squad</option>
                <option value={4}>4 Squad (Fast Scrim)</option>
              </select>
            </div>

            <button
              onClick={handleRandomizeTeams}
              className="clip-hud-btn w-full bg-rose-600 hover:bg-rose-700 text-white p-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20"
            >
              <Shuffle className="w-4 h-4" /> ACAK SQUAD SEKARANG
            </button>
          </div>

          <div className="md:col-span-7 space-y-4">
            {randomTeams.map((team, tIdx) => (
              <div key={tIdx} className="clip-hud bg-[#14161f] border border-rose-500/30 p-4 space-y-2">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="font-black text-xs text-amber-400 uppercase font-['Oxanium']">
                    SQUAD {String.fromCharCode(65 + tIdx)}
                  </span>
                  <span className="text-[10px] text-[#9CA3B4] font-bold">{team.length} Personel</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {team.map((member, mIdx) => (
                    <div key={mIdx} className="bg-[#0b0c10] border border-white/10 p-2 text-xs font-extrabold text-white flex items-center gap-2">
                      <span className="w-4 h-4 bg-rose-600/20 text-rose-400 font-black text-[9px] flex items-center justify-center">
                        {mIdx + 1}
                      </span>
                      {member}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'bracket' && (
        <div className="space-y-6">
          <div className="clip-hud bg-[#14161f] border border-white/10 p-6 space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-white/10 pb-3 flex items-center gap-2">
              <Swords className="w-4 h-4 text-amber-400" /> VISUAL BRACKET SCRIM (SEMI FINAL & FINAL)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="space-y-3">
                <span className="text-[10px] font-black text-[#9CA3B4] uppercase block text-center">SEMI FINAL 1</span>
                <div className="bg-[#0b0c10] border border-white/10 p-3 space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-white"><span>SQUAD A (OLEXTY CORE)</span> <span className="text-amber-400">2</span></div>
                  <div className="flex justify-between font-bold text-[#9CA3B4]"><span>SQUAD B (OLEXTY INTI)</span> <span>1</span></div>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-black text-rose-400 uppercase block text-center">GRAND FINAL</span>
                <div className="bg-rose-950/40 border border-rose-500/50 p-4 space-y-2 text-xs text-center clip-hud">
                  <Crown className="w-6 h-6 text-amber-400 mx-auto animate-pulse" />
                  <div className="font-black text-white uppercase">SQUAD A vs SQUAD C</div>
                  <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 font-bold uppercase">BERLANGSUNG</span>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-black text-[#9CA3B4] uppercase block text-center">SEMI FINAL 2</span>
                <div className="bg-[#0b0c10] border border-white/10 p-3 space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-white"><span>SQUAD C (VETERAN)</span> <span className="text-amber-400">2</span></div>
                  <div className="flex justify-between font-bold text-[#9CA3B4]"><span>SQUAD D (ACADEMY)</span> <span>0</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="clip-hud bg-[#14161f] border border-white/10 p-6 space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-white/10 pb-3 flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" /> VOTING MVP SCRIM HARI INI
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.entries(mvpVotes).map(([name, count]) => (
                <div key={name} className="bg-[#0b0c10] border border-white/10 p-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-white">{name}</span>
                    <span className="text-amber-400 font-black">{count} VOTES</span>
                  </div>
                  <button
                    onClick={() => handleVoteMVP(name)}
                    className="clip-hud-btn w-full bg-rose-600 hover:bg-rose-700 text-white p-2 text-[10px] font-black uppercase"
                  >
                    VOTE MVP
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'gacha' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-6 flex flex-col items-center justify-center p-6 bg-[#14161f] border border-white/10 clip-hud relative">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-rose-500 z-20 -mb-3 animate-bounce" />
            <div
              className="w-64 h-64 sm:w-80 sm:h-80 rounded-full border-4 border-amber-500/40 relative overflow-hidden transition-transform duration-[3000ms] cubic-bezier(0.15, 0.9, 0.2, 1) shadow-2xl"
              style={{ transform: `rotate(${wheelAngle}deg)` }}
            >
              {gachaItems.map((item, index) => {
                const angle = 360 / gachaItems.length;
                return (
                  <div
                    key={index}
                    className={`absolute w-1/2 h-1/2 top-0 right-0 origin-bottom-left flex items-center justify-center p-2 border border-white/10 ${item.color}`}
                    style={{ transform: `rotate(${index * angle}deg) skewY(-30deg)` }}
                  >
                    <span className="text-[10px] sm:text-xs font-black tracking-tighter transform skewY(30deg) rotate(45deg) translate-x-4">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <button
              onClick={handleSpinGacha}
              disabled={spinning}
              className="clip-hud-btn mt-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black px-8 py-3.5 text-xs font-black uppercase tracking-wider shadow-xl shadow-amber-500/20 disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <RotateCw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
                {spinning ? 'MEMUTAR GACHA...' : 'SPIN GACHA (50 PTS)'}
              </div>
            </button>
          </div>

          <div className="md:col-span-6 space-y-4">
            <div className="clip-hud bg-[#14161f] border border-white/10 p-5 space-y-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
                <Gift className="w-4 h-4 text-amber-400" /> HASIL PUTARAN GACHA
              </h3>
              {gachaPrize ? (
                <div className="p-4 bg-amber-500/15 border border-amber-500/40 text-center space-y-1">
                  <span className="text-[10px] text-amber-400 font-bold uppercase">SELAMAT! KAMU DAPAT:</span>
                  <div className="text-2xl font-black text-white font-['Oxanium']">{gachaPrize}</div>
                </div>
              ) : (
                <p className="text-xs text-[#9CA3B4] italic py-4 text-center">
                  Tekan **SPIN GACHA** untuk menguji keberuntunganmu!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'aim' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-[#14161f] border border-white/10 p-4 clip-hud">
            <div>
              <span className="text-[10px] text-[#9CA3B4] font-black uppercase">HIGH SCORE</span>
              <div className="text-xl font-black text-amber-400 font-['Oxanium']">{aimHighScore} TARGET</div>
            </div>
            <div>
              <span className="text-[10px] text-[#9CA3B4] font-black uppercase">SISA WAKTU</span>
              <div className="text-xl font-black text-rose-500 font-['Oxanium']">{aimTimeLeft} DETIK</div>
            </div>
            <div>
              <span className="text-[10px] text-[#9CA3B4] font-black uppercase">SKOR SAAT INI</span>
              <div className="text-xl font-black text-white font-['Oxanium']">{aimScore} TARGET</div>
            </div>
          </div>

          <div className="clip-hud bg-[#0b0c10] border-2 border-rose-500/30 h-96 relative overflow-hidden flex items-center justify-center cursor-crosshair">
            {aimGameState === 'idle' && (
              <div className="text-center space-y-3">
                <Target className="w-12 h-12 text-rose-500 mx-auto animate-pulse" />
                <h3 className="text-lg font-black text-white uppercase">ARENA AIM TRAINER</h3>
                <button
                  onClick={startAimGame}
                  className="clip-hud-btn bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 text-xs font-black uppercase tracking-wider inline-flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" /> MULAI AIM TEST
                </button>
              </div>
            )}

            {aimGameState === 'playing' && (
              <button
                onClick={handleHitTarget}
                style={{ top: targetPos.top, left: targetPos.left }}
                className="absolute w-10 h-10 rounded-full bg-rose-600 border-2 border-amber-400 transform -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-rose-600/50 flex items-center justify-center animate-ping-once transition-all duration-75"
              >
                <Target className="w-5 h-5 text-white" />
              </button>
            )}

            {aimGameState === 'ended' && (
              <div className="text-center space-y-3">
                <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
                <h3 className="text-lg font-black text-white uppercase">WAKTU HABIS!</h3>
                <p className="text-xs text-[#9CA3B4]">Skor: <span className="text-amber-400 font-bold">{aimScore} target</span></p>
                <button
                  onClick={startAimGame}
                  className="clip-hud-btn bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 text-xs font-black uppercase inline-flex items-center gap-2"
                >
                  <RotateCw className="w-4 h-4" /> MAIN LAGI
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'bingo' && (
        <div className="clip-hud bg-[#14161f] border border-white/10 p-6 space-y-4">
          <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-white/10 pb-3 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-amber-400" /> BINGO MISI CIRCLE KOMUNITAS
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {bingoMissions.map((m) => (
              <button
                key={m.id}
                onClick={() => toggleBingo(m.id)}
                className={`clip-hud-btn border p-4 text-center space-y-2 transition-all ${
                  m.done ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : 'bg-[#0b0c10] border-white/10 text-white'
                }`}
              >
                <CheckCircle2 className={`w-6 h-6 mx-auto ${m.done ? 'text-emerald-400' : 'text-[#9CA3B4]'}`} />
                <div className="font-extrabold text-xs">{m.title}</div>
                <span className="text-[9px] uppercase font-bold">{m.done ? 'TERCENTANG' : 'BELUM'}</span>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};