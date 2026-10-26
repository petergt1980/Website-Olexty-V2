import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { UserProfile, UserRole, EventItem, SocialLinks } from '../../../types';
import { Users, Settings, Calendar, TrendingUp, Plus, Trash2, Shield, Megaphone, Share2, MessageCircle, Video, Youtube, Check, Save, Ban, CheckCircle, Search } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'members' | 'events' | 'settings'>('stats');

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

  // State Config / Settings
  const [discordUrl, setDiscordUrl] = useState('');
  const [waChannelUrl, setWaChannelUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSuccess, setConfigSuccess] = useState(false);

  // Fetch Member & Events Realtime
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
        const data = docSnap.data() as SocialLinks;
        setDiscordUrl(data.discordUrl || '');
        setWaChannelUrl(data.waChannelUrl || '');
        setTiktokUrl(data.tiktokUrl || '');
        setYoutubeUrl(data.youtubeUrl || '');
        setAnnouncementText(data.announcementText || '');
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

  // Handlers Config
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await setDoc(doc(db, 'settings', 'communityConfig'), {
        discordUrl: discordUrl.trim(),
        waChannelUrl: waChannelUrl.trim(),
        tiktokUrl: tiktokUrl.trim(),
        youtubeUrl: youtubeUrl.trim(),
        announcementText: announcementText.trim(),
      });
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
            Pusat manajemen anggota, jadwal event, dan platform OLEXTY Community.
          </p>
        </div>
      </div>

      {/* Navigasi Tab */}
      <div className="flex items-center gap-2 border-b border-[#292C36] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'stats'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'text-[#9CA3B4] hover:text-[#F4F5F8] hover:bg-[#181A22]'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Ringkasan Stats
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'members'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'text-[#9CA3B4] hover:text-[#F4F5F8] hover:bg-[#181A22]'
          }`}
        >
          <Users className="w-4 h-4" /> Kelola Member ({members.length})
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'events'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'text-[#9CA3B4] hover:text-[#F4F5F8] hover:bg-[#181A22]'
          }`}
        >
          <Calendar className="w-4 h-4" /> Kelola Scrim & Event ({events.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'settings'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'text-[#9CA3B4] hover:text-[#F4F5F8] hover:bg-[#181A22]'
          }`}
        >
          <Settings className="w-4 h-4" /> Pengaturan Sosmed
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

      {/* Tab 2: Manajemen Member */}
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

          <div className="bg-[#181A22] border border-[#292C36] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#9CA3B4]">
                <thead className="bg-[#14161D] text-[#F4F5F8] border-b border-[#292C36] uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">Pengguna</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status Akun</th>
                    <th className="p-4 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#292C36]">
                  {filteredMembers.map((m) => (
                    <tr key={m.uid} className="hover:bg-[#292C36]/30 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#8B8CF8]/20 border border-[#292C36] flex items-center justify-center text-[#8B8CF8] font-bold">
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
                      <td className="p-4">
                        <select
                          value={m.role || 'member'}
                          onChange={(e) => handleRoleChange(m.uid, e.target.value as UserRole)}
                          className="bg-[#14161D] border border-[#292C36] rounded-lg px-2 py-1 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
                        >
                          <option value="member">Member</option>
                          <option value="Petinggi">Petinggi</option>
                          <option value="Founder">Founder</option>
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
                            m.isSuspended
                              ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
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
                placeholder="Judul Scrim (misal: Scrim Fast Fast FF)"
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
              <Plus className="w-4 h-4" />
              {creatingEvent ? 'Menambahkan...' : 'Tambah Jadwal Event'}
            </button>
          </form>

          {/* List Event */}
          <div className="space-y-3">
            {events.map((evt) => (
              <div key={evt.id} className="bg-[#181A22] border border-[#292C36] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#8B8CF8]/10 text-[#8B8CF8]">
                      {evt.type}
                    </span>
                    <h4 className="font-bold text-sm text-[#F4F5F8]">{evt.title}</h4>
                  </div>
                  <p className="text-xs text-[#9CA3B4] mt-1">
                    {evt.date} • {evt.time} WIB | Slot: {evt.slots}
                  </p>
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

      {/* Tab 4: Pengaturan Sosmed & Banner */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveConfig} className="bg-[#181A22] border border-[#292C36] rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-sm text-[#F4F5F8] flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-[#8B8CF8]" />  Announcement
          </h3>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-[#9CA3B4]">Text Announcement</label>
              <textarea
                rows={2}
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
                placeholder="Tulis pengumuman penting..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-[#9CA3B4] flex items-center gap-1">
                  <Share2 className="w-3.5 h-3.5 text-[#5865F2]" /> Link Discord
                </label>
                <input
                  type="url"
                  value={discordUrl}
                  onChange={(e) => setDiscordUrl(e.target.value)}
                  className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
                  placeholder="https://discord.gg/..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#9CA3B4] flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" /> Link Saluran WhatsApp
                </label>
                <input
                  type="url"
                  value={waChannelUrl}
                  onChange={(e) => setWaChannelUrl(e.target.value)}
                  className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
                  placeholder="https://whatsapp.com/channel/..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#9CA3B4] flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-pink-400" /> Link TikTok
                </label>
                <input
                  type="url"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
                  placeholder="https://tiktok.com/@..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#9CA3B4] flex items-center gap-1">
                  <Youtube className="w-3.5 h-3.5 text-red-400" /> Link YouTube
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
                  placeholder="https://youtube.com/@..."
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {configSuccess ? (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                <Check className="w-4 h-4" /> Pengaturan disimpan!
              </span>
            ) : (
              <span />
            )}

            <button
              type="submit"
              disabled={savingConfig}
              className="bg-amber-500 hover:bg-amber-600 text-black px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {savingConfig ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};