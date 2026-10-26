import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { UserProfile, UserRole, EventItem } from '../../../types';
import { Users, Settings, Calendar, TrendingUp, Plus, Trash2, Shield, Megaphone, Share2, MessageCircle, Video, Youtube, Check, Save, Ban, CheckCircle, Search, Image as ImageIcon, Swords, Link as LinkIcon, Award, Coins, Radio, Heart } from 'lucide-react';

interface BabuItem {
  id: string;
  name: string;
  task: string;
}

interface TopDonorItem {
  id: string;
  name: string;
  amount: string;
}

export const AdminMembersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'members' | 'events' | 'babu' | 'war' | 'settings'>('stats');

  // State Member
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [memberSearch, setMemberSearch] = useState('');

  // State Events
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventTitle, setEventTitle] = useState('');
  const [eventGame, setEventGame] = useState('Free Fire');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventType, setEventType] = useState<'Scrim' | 'Turnamen' | 'Mabar' | 'Latihan'>('Scrim');
  const [eventSlots, setEventSlots] = useState('12 Squad');
  const [eventLink, setEventLink] = useState('');
  const [creatingEvent, setCreatingEvent] = useState(false);

  // State List Babu
  const [babuList, setBabuList] = useState<BabuItem[]>([]);
  const [babuName, setBabuName] = useState('');
  const [babuTask, setBabuTask] = useState('');

  // State Top Donatur
  const [topDonors, setTopDonors] = useState<TopDonorItem[]>([]);
  const [donorName, setDonorName] = useState('');
  const [donorAmount, setDonorAmount] = useState('');

  // State Rules & GB War
  const [rulesWar, setRulesWar] = useState('');
  const [gbWarLink, setGbWarLink] = useState('');

  // State Config & Branding & Integrasi
  const [logoUrl, setLogoUrl] = useState('/OLEXTY.png');
  const [siteName, setSiteName] = useState('OLEXTY');
  const [siteSubName, setSiteSubName] = useState('COMMUNITY');
  const [siteTagline, setSiteTagline] = useState('Esports & Gaming Hub');
  const [discordUrl, setDiscordUrl] = useState('');
  const [waChannelUrl, setWaChannelUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState('');
  const [liveStreamUrl, setLiveStreamUrl] = useState('');
  const [donateUrl, setDonateUrl] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSuccess, setConfigSuccess] = useState(false);

  // Fetch Data Realtime
  useEffect(() => {
    const unsubMembers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const list: UserProfile[] = snapshot.docs.map((d) => ({
        ...(d.data() as UserProfile),
        uid: d.id,
      }));
      setMembers(list);
    });

    const unsubEvents = onSnapshot(collection(db, 'events'), (snapshot) => {
      const list: EventItem[] = snapshot.docs.map((d) => ({
        ...(d.data() as EventItem),
        id: d.id,
      }));
      setEvents(list);
    });

    const fetchConfig = async () => {
      const docSnap = await getDoc(doc(db, 'settings', 'communityConfig'));
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        setLogoUrl(data.logoUrl || '/OLEXTY.png');
        setSiteName(data.siteName || 'OLEXTY');
        setSiteSubName(data.siteSubName || 'COMMUNITY');
        setSiteTagline(data.siteTagline || 'Esports & Gaming Hub');
        setDiscordUrl(data.discordUrl || '');
        setWaChannelUrl(data.waChannelUrl || '');
        setTiktokUrl(data.tiktokUrl || '');
        setYoutubeUrl(data.youtubeUrl || '');
        setAnnouncementText(data.announcementText || '');
        setBabuList(data.babuList || []);
        setTopDonors(data.topDonors || []);
        setRulesWar(data.rulesWar || '');
        setGbWarLink(data.gbWarLink || '');
        setDiscordWebhookUrl(data.discordWebhookUrl || '');
        setLiveStreamUrl(data.liveStreamUrl || '');
        setDonateUrl(data.donateUrl || '');
      }
    };
    fetchConfig();

    return () => {
      unsubMembers();
      unsubEvents();
    };
  }, []);

  // Handlers Member
  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    await updateDoc(doc(db, 'users', uid), { role: newRole });
  };

  const handleBadgeChange = async (uid: string, badge: string) => {
    await updateDoc(doc(db, 'users', uid), { badge });
  };

  const handleToggleSuspend = async (uid: string, currentStatus?: boolean) => {
    await updateDoc(doc(db, 'users', uid), { isSuspended: !currentStatus });
  };

  // Handlers Event
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate || !eventTime) return;
    setCreatingEvent(true);
    try {
      await addDoc(collection(db, 'events'), {
        title: eventTitle.trim(),
        game: eventGame,
        date: eventDate,
        time: eventTime,
        type: eventType,
        slots: eventSlots,
        link: eventLink.trim(),
        createdAt: serverTimestamp(),
      });
      setEventTitle('');
      setEventLink('');
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingEvent(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (confirm('Hapus jadwal ini?')) {
      await deleteDoc(doc(db, 'events', id));
    }
  };

  // Handlers Babu
  const handleAddBabu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!babuName.trim()) return;
    const newItem: BabuItem = {
      id: Date.now().toString(),
      name: babuName.trim(),
      task: babuTask.trim() || 'Tugas Umum',
    };
    setBabuList([...babuList, newItem]);
    setBabuName('');
    setBabuTask('');
  };

  const handleRemoveBabu = (id: string) => {
    setBabuList(babuList.filter((item) => item.id !== id));
  };

  // Handlers Top Donatur
  const handleAddDonor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim()) return;
    const newItem: TopDonorItem = {
      id: Date.now().toString(),
      name: donorName.trim(),
      amount: donorAmount.trim() || 'Rp 10.000',
    };
    setTopDonors([...topDonors, newItem]);
    setDonorName('');
    setDonorAmount('');
  };

  const handleRemoveDonor = (id: string) => {
    setTopDonors(topDonors.filter((item) => item.id !== id));
  };

  // Handlers Save Config & Branding
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await setDoc(doc(db, 'settings', 'communityConfig'), {
        logoUrl: logoUrl.trim(),
        siteName: siteName.trim(),
        siteSubName: siteSubName.trim(),
        siteTagline: siteTagline.trim(),
        discordUrl: discordUrl.trim(),
        waChannelUrl: waChannelUrl.trim(),
        tiktokUrl: tiktokUrl.trim(),
        youtubeUrl: youtubeUrl.trim(),
        announcementText: announcementText.trim(),
        babuList,
        topDonors,
        rulesWar: rulesWar.trim(),
        gbWarLink: gbWarLink.trim(),
        discordWebhookUrl: discordWebhookUrl.trim(),
        liveStreamUrl: liveStreamUrl.trim(),
        donateUrl: donateUrl.trim(),
      }, { merge: true });
      setConfigSuccess(true);
      setTimeout(() => setConfigSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingConfig(false);
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.displayName?.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.email?.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.username?.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F5F8] flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-400" /> Control Center (Admin Panel)
          </h1>
          <p className="text-sm text-[#9CA3B4] mt-1">
            Pusat manajemen anggota, gelar/badge, event, donatur, babu, dan integrasi website.
          </p>
        </div>
      </div>

      {/* Navigasi Tab */}
      <div className="flex items-center gap-2 border-b border-[#292C36] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'stats' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-[#9CA3B4] hover:text-[#F4F5F8] hover:bg-[#181A22]'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Ringkasan Stats
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'members' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-[#9CA3B4] hover:text-[#F4F5F8] hover:bg-[#181A22]'
          }`}
        >
          <Users className="w-4 h-4" /> Kelola Member & Badge ({members.length})
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'events' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-[#9CA3B4] hover:text-[#F4F5F8] hover:bg-[#181A22]'
          }`}
        >
          <Calendar className="w-4 h-4" /> Kelola Scrim & Event ({events.length})
        </button>

        <button
          onClick={() => setActiveTab('babu')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'babu' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-[#9CA3B4] hover:text-[#F4F5F8] hover:bg-[#181A22]'
          }`}
        >
          <Coins className="w-4 h-4" /> Babu & Donatur
        </button>

        <button
          onClick={() => setActiveTab('war')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'war' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-[#9CA3B4] hover:text-[#F4F5F8] hover:bg-[#181A22]'
          }`}
        >
          <Swords className="w-4 h-4" /> Rules & GB War
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'settings' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-[#9CA3B4] hover:text-[#F4F5F8] hover:bg-[#181A22]'
          }`}
        >
          <Settings className="w-4 h-4" /> Branding, Stream & Webhook
        </button>
      </div>

      {/* Tab 1: Ringkasan Stats */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#181A22] border border-[#292C36] rounded-2xl p-5 space-y-2">
            <span className="text-xs text-[#9CA3B4] font-semibold">Total Anggota</span>
            <div className="text-3xl font-extrabold text-[#F4F5F8]">{members.length}</div>
            <p className="text-[11px] text-[#8B8CF8]">Player terdaftar di platform</p>
          </div>

          <div className="bg-[#181A22] border border-[#292C36] rounded-2xl p-5 space-y-2">
            <span className="text-xs text-[#9CA3B4] font-semibold">Total Event/Scrim</span>
            <div className="text-3xl font-extrabold text-[#F4F5F8]">{events.length}</div>
            <p className="text-[11px] text-emerald-400">Jadwal kompetitif aktif</p>
          </div>

          <div className="bg-[#181A22] border border-[#292C36] rounded-2xl p-5 space-y-2">
            <span className="text-xs text-[#9CA3B4] font-semibold">Status Platform</span>
            <div className="text-3xl font-extrabold text-emerald-400">ONLINE</div>
            <p className="text-[11px] text-[#9CA3B4]">Firebase Firestore Synced</p>
          </div>
        </div>
      )}

      {/* Tab 2: Manajemen Member & Badge Gelar */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#9CA3B4]" />
            <input
              type="text"
              placeholder="Cari nama, email, atau username member..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="w-full bg-[#181A22] border border-[#292C36] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
            />
          </div>

          <div className="bg-[#181A22] border border-[#292C36] rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#9CA3B4]">
                <thead className="bg-[#14161D] text-[#F4F5F8] border-b border-[#292C36] uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">Pengguna</th>
                    <th className="p-4">Gelar / Badge Spesial</th>
                    <th className="p-4">Role Akses</th>
                    <th className="p-4">Status Akun</th>
                    <th className="p-4 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#292C36]">
                  {filteredMembers.map((m) => (
                    <tr key={m.uid} className="hover:bg-[#292C36]/30 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#8B8CF8]/20 border border-[#292C36] flex items-center justify-center text-[#8B8CF8] font-bold shrink-0">
                          {m.avatarUrl ? (
                            <img src={m.avatarUrl} alt="" className="w-full h-full object-cover rounded-full" />
                          ) : (
                            m.displayName?.[0] || 'U'
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-[#F4F5F8]">{m.displayName}</div>
                          <div className="text-[11px] text-[#9CA3B4]">{m.email}</div>
                        </div>
                      </td>

                      {/* Select Badge Gelar */}
                      <td className="p-4">
                        <select
                          value={(m as any).badge || ''}
                          onChange={(e) => handleBadgeChange(m.uid, e.target.value)}
                          className="bg-[#14161D] border border-[#292C36] rounded-lg px-2.5 py-1.5 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
                        >
                          <option value="">(Tanpa Badge)</option>
                          <option value="👑 Owner">👑 Owner</option>
                          <option value="🛠️ Admin">🛠️ Admin</option>
                          <option value="🔥 VIP Donatur">🔥 VIP Donatur</option>
                          <option value="👑 Guild Leader">👑 Guild Leader</option>
                          <option value="⚔️ Top Fragger">⚔️ Top Fragger</option>
                          <option value="🎮 Pro Player">🎮 Pro Player</option>
                          <option value="🌟 Member Active">🌟 Member Active</option>
                        </select>
                      </td>

                      {/* Select Role */}
                      <td className="p-4">
                        <select
                          value={m.role || 'member'}
                          onChange={(e) => handleRoleChange(m.uid, e.target.value as UserRole)}
                          className="bg-[#14161D] border border-[#292C36] rounded-lg px-2.5 py-1.5 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
                        >
                          <option value="member">Member</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td className="p-4">
                        {m.isSuspended ? (
                          <span className="inline-flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md text-[11px] border border-red-500/20">
                            <Ban className="w-3 h-3" /> Ditangguhkan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md text-[11px] border border-emerald-500/20">
                            <CheckCircle className="w-3 h-3" /> Aktif
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleToggleSuspend(m.uid, m.isSuspended)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            m.isSuspended ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                          }`}
                        >
                          {m.isSuspended ? 'Aktifkan' : 'Tangguhkan'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Kelola Scrim & Event */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateEvent} className="bg-[#181A22] border border-[#292C36] rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-[#F4F5F8] flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#8B8CF8]" /> Tambah Jadwal Scrim / Turnamen
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Judul Scrim"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
                required
              />
              <select
                value={eventType}
                onChange={(e: any) => setEventType(e.target.value)}
                className="bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
              >
                <option value="Scrim">Scrim</option>
                <option value="Turnamen">Turnamen</option>
                <option value="Mabar">Mabar</option>
                <option value="Latihan">Latihan</option>
              </select>
              <input
                type="text"
                placeholder="Tanggal (misal: Senin, 27 Okt)"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
                required
              />
              <input
                type="text"
                placeholder="Jam (misal: 20.00)"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
                required
              />
              <input
                type="text"
                placeholder="Slots (misal: 12 Squad)"
                value={eventSlots}
                onChange={(e) => setEventSlots(e.target.value)}
                className="bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
              />
              <input
                type="url"
                placeholder="Link Pendaftaran / WA Group"
                value={eventLink}
                onChange={(e) => setEventLink(e.target.value)}
                className="bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
              />
            </div>
            <button
              type="submit"
              disabled={creatingEvent}
              className="bg-[#8B8CF8] hover:bg-[#7879E8] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> {creatingEvent ? 'Menambahkan...' : 'Tambah Jadwal Event'}
            </button>
          </form>

          <div className="space-y-3">
            {events.map((evt) => (
              <div key={evt.id} className="bg-[#181A22] border border-[#292C36] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#8B8CF8]/10 text-[#8B8CF8]">{evt.type}</span>
                    <h4 className="font-bold text-sm text-[#F4F5F8]">{evt.title}</h4>
                  </div>
                  <p className="text-xs text-[#9CA3B4] mt-1">{evt.date} - {evt.time} WIB | Slot: {evt.slots}</p>
                </div>
                <button
                  onClick={() => handleDeleteEvent(evt.id)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                  title="Hapus Event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Kelola Babu & Donatur */}
      {activeTab === 'babu' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Donatur */}
          <div className="bg-[#181A22] border border-[#292C36] rounded-2xl p-6 space-y-4 shadow-lg">
            <h3 className="font-bold text-sm text-[#F4F5F8] flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" /> Leaderboard Top Donatur
            </h3>

            <form onSubmit={handleAddDonor} className="space-y-2">
              <input
                type="text"
                placeholder="Nama Donatur (misal: SultanFF)"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
                required
              />
              <input
                type="text"
                placeholder="Jumlah Donasi (misal: Rp 50.000)"
                value={donorAmount}
                onChange={(e) => setDonorAmount(e.target.value)}
                className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
                required
              />
              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold p-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" /> Tambah Donatur
              </button>
            </form>

            <div className="space-y-2 pt-2">
              {topDonors.map((item, idx) => (
                <div key={item.id} className="bg-[#14161D] border border-[#292C36] p-2.5 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-amber-400">#{idx + 1}</span>
                    <span className="font-bold text-[#F4F5F8]">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-semibold">{item.amount}</span>
                    <button onClick={() => handleRemoveDonor(item.id)} className="text-rose-400 hover:text-rose-300">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {topDonors.length === 0 && <p className="text-xs text-[#9CA3B4] text-center py-2 italic">Belum ada donatur.</p>}
            </div>
          </div>

          {/* List Babu */}
          <div className="bg-[#181A22] border border-[#292C36] rounded-2xl p-6 space-y-4 shadow-lg">
            <h3 className="font-bold text-sm text-[#F4F5F8] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#8B8CF8]" /> Manajemen List Babu Circle
            </h3>

            <form onSubmit={handleAddBabu} className="space-y-2">
              <input
                type="text"
                placeholder="Nama Anggota"
                value={babuName}
                onChange={(e) => setBabuName(e.target.value)}
                className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
                required
              />
              <input
                type="text"
                placeholder="Tugas (contoh: Piket Base / Ladies / GB)"
                value={babuTask}
                onChange={(e) => setBabuTask(e.target.value)}
                className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
              />
              <button
                type="submit"
                className="w-full bg-[#8B8CF8] hover:bg-[#7879E8] text-white font-bold p-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" /> Tambah Babu
              </button>
            </form>

            <div className="space-y-2 pt-2">
              {babuList.map((item) => (
                <div key={item.id} className="bg-[#14161D] border border-[#292C36] p-2.5 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-bold text-[#F4F5F8]">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#8B8CF8] font-semibold">{item.task}</span>
                    <button onClick={() => handleRemoveBabu(item.id)} className="text-rose-400 hover:text-rose-300">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {babuList.length === 0 && <p className="text-xs text-[#9CA3B4] text-center py-2 italic">Belum ada data list babu.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Rules & GB War */}
      {activeTab === 'war' && (
        <div className="bg-[#181A22] border border-[#292C36] rounded-2xl p-6 space-y-6 shadow-lg">
          <h3 className="font-bold text-sm text-[#F4F5F8] flex items-center gap-2">
            <Swords className="w-4 h-4 text-amber-400" /> Atur Rules War & Link GB War
          </h3>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-[#9CA3B4]">Rules War (Aturan & Ketentuan)</label>
              <textarea
                rows={5}
                value={rulesWar}
                onChange={(e) => setRulesWar(e.target.value)}
                placeholder="Tulis aturan war di sini..."
                className="w-full bg-[#14161D] border border-[#292C36] rounded-xl p-3 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[#9CA3B4] flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5 text-emerald-400" /> Link GB War (WhatsApp / Discord / Web)
              </label>
              <input
                type="url"
                value={gbWarLink}
                onChange={(e) => setGbWarLink(e.target.value)}
                placeholder="https://chat.whatsapp.com/..."
                className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Pengaturan Branding, Live Stream, Webhook & Sosmed */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveConfig} className="bg-[#181A22] border border-[#292C36] rounded-2xl p-6 space-y-6 shadow-lg">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-[#F4F5F8] flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#8B8CF8]" /> Identitas Website & Logo Header
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-[#9CA3B4]">URL Gambar Logo Website</label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[#9CA3B4]">Nama Utama Web</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
                />
              </div>
            </div>
          </div>

          {/* Integrasi Stream, Donasi, & Discord Webhook */}
          <div className="border-t border-[#292C36] pt-4 space-y-4">
            <h3 className="font-bold text-sm text-[#F4F5F8] flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-400" /> Integrasi Stream, Saweria & Discord Bot Webhook
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-[#9CA3B4] flex items-center gap-1">
                  <Share2 className="w-3.5 h-3.5 text-[#5865F2]" /> Discord Webhook URL (Posting Otomatis ke Discord)
                </label>
                <input
                  type="url"
                  value={discordWebhookUrl}
                  onChange={(e) => setDiscordWebhookUrl(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-[#9CA3B4] flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 text-rose-400" /> YouTube Live Stream Embed URL
                  </label>
                  <input
                    type="url"
                    value={liveStreamUrl}
                    onChange={(e) => setLiveStreamUrl(e.target.value)}
                    placeholder="https://www.youtube.com/embed/LIVE_ID"
                    className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#9CA3B4] flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-amber-400" /> Link Donasi / Saweria
                  </label>
                  <input
                    type="url"
                    value={donateUrl}
                    onChange={(e) => setDonateUrl(e.target.value)}
                    placeholder="https://saweria.co/olexty"
                    className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pengumuman & Media Sosial */}
          <div className="border-t border-[#292C36] pt-4 space-y-4">
            <h3 className="font-bold text-sm text-[#F4F5F8] flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#8B8CF8]" /> Pengumuman & Sosmed
            </h3>
            <div className="space-y-3">
              <textarea
                rows={2}
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Tulis pengumuman resmi..."
                className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="url"
                  value={discordUrl}
                  onChange={(e) => setDiscordUrl(e.target.value)}
                  placeholder="Link Discord Server"
                  className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
                />
                <input
                  type="url"
                  value={waChannelUrl}
                  onChange={(e) => setWaChannelUrl(e.target.value)}
                  placeholder="Link Saluran WA"
                  className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {configSuccess ? (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                <Check className="w-4 h-4" /> Perubahan Berhasil Disimpan!
              </span>
            ) : <span />}
            <button
              type="submit"
              disabled={savingConfig}
              className="bg-amber-500 hover:bg-amber-600 text-black px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {savingConfig ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};