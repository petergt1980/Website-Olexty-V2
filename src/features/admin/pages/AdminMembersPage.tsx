import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc, setDoc, addDoc, deleteDoc, serverTimestamp, getDocs, writeBatch, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { UserProfile, EventItem } from '../../../types';
import { useAuth } from '../../auth/AuthContext';
import { ToastContainer, ToastMessage } from '../../../components/Toast';
import { 
  Shield, 
  Users, 
  UserCheck, 
  UserX, 
  Search, 
  Settings, 
  Calendar, 
  Coins, 
  Megaphone, 
  Activity,
  Save,
  Radio,
  Plus,
  Trash2,
  Crown,
  AlertTriangle,
  History,
  RotateCcw,
  Bell,
  Send,
  Webhook,
  CheckCircle2,
  XCircle,
  X
} from 'lucide-react';

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

interface AuditLogItem {
  id: string;
  adminName: string;
  action: string;
  targetUser?: string;
  details: string;
  timestamp: any;
}

interface WebhookLogItem {
  id: string;
  type: string;
  title: string;
  status: 'SUCCESS' | 'FAILED';
  details: string;
  timestamp: any;
}

// Custom Modal Suspend HUD
interface SuspendModalProps {
  isOpen: boolean;
  targetName: string;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

const SuspendModal: React.FC<SuspendModalProps> = ({ isOpen, targetName, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-space">
      <div className="clip-hud bg-[#14161f] border border-rose-500/50 max-w-md w-full p-6 space-y-5 shadow-2xl">
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

export const AdminMembersPage: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'members' | 'events' | 'babu_donors' | 'config' | 'logs' | 'webhooks'>('members');
  
  // Custom Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'reward' = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Data State
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLogItem[]>([]);
  const [search, setSearch] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Suspend Modal State
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [selectedUserForSuspend, setSelectedUserForSuspend] = useState<{ uid: string; name: string; isSuspended?: boolean } | null>(null);

  // Form Event State
  const [eventTitle, setEventTitle] = useState('');
  const [eventGame, setEventGame] = useState('Free Fire');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventType, setEventType] = useState<'Scrim' | 'Turnamen' | 'Mabar' | 'Latihan'>('Scrim');
  const [eventSlots, setEventSlots] = useState('12 Teams');
  const [eventLink, setEventLink] = useState('');

  // Form Babu & Donor State
  const [babuList, setBabuList] = useState<BabuItem[]>([]);
  const [newBabuName, setNewBabuName] = useState('');
  const [newBabuTask, setNewBabuTask] = useState('');

  const [topDonors, setTopDonors] = useState<TopDonorItem[]>([]);
  const [newDonorName, setNewDonorName] = useState('');
  const [newDonorAmount, setNewDonorAmount] = useState('');

  // Webhook URLs State
  const [webhookPostsUrl, setWebhookPostsUrl] = useState('');
  const [webhookEventsUrl, setWebhookEventsUrl] = useState('');
  const [webhookLogsUrl, setWebhookLogsUrl] = useState('');

  // Config & Emergency State
  const [announcementText, setAnnouncementText] = useState('');
  const [emergencyMessage, setEmergencyMessage] = useState('');
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [liveStreamUrl, setLiveStreamUrl] = useState('');
  const [gbWarLink, setGbWarLink] = useState('');
  const [rulesWar, setRulesWar] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [donateUrl, setDonateUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [resettingSeason, setResettingSeason] = useState(false);

  useEffect(() => {
    const unsubMembers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setMembers(snapshot.docs.map((d) => ({ ...(d.data() as UserProfile), uid: d.id })));
    });

    const unsubEvents = onSnapshot(collection(db, 'events'), (snapshot) => {
      setEvents(snapshot.docs.map((d) => ({ ...(d.data() as EventItem), id: d.id })));
    });

    const qLogs = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(50));
    const unsubLogs = onSnapshot(qLogs, (snapshot) => {
      setAuditLogs(snapshot.docs.map((d) => ({ ...(d.data() as AuditLogItem), id: d.id })));
    });

    const qWebhooks = query(collection(db, 'webhookLogs'), orderBy('timestamp', 'desc'), limit(50));
    const unsubWebhooks = onSnapshot(qWebhooks, (snapshot) => {
      setWebhookLogs(snapshot.docs.map((d) => ({ ...(d.data() as WebhookLogItem), id: d.id })));
    });

    const unsubConfig = onSnapshot(doc(db, 'settings', 'communityConfig'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAnnouncementText(data.announcementText || '');
        setEmergencyMessage(data.emergencyMessage || '');
        setIsEmergencyActive(!!data.isEmergencyActive);
        setWebhookPostsUrl(data.webhookPostsUrl || '');
        setWebhookEventsUrl(data.webhookEventsUrl || '');
        setWebhookLogsUrl(data.webhookLogsUrl || '');
        setLiveStreamUrl(data.liveStreamUrl || '');
        setGbWarLink(data.gbWarLink || '');
        setRulesWar(data.rulesWar || '');
        setLogoUrl(data.logoUrl || '');
        setDonateUrl(data.donateUrl || '');
        setBabuList(data.babuList || []);
        setTopDonors(data.topDonors || []);
      }
    });

    return () => {
      unsubMembers();
      unsubEvents();
      unsubLogs();
      unsubWebhooks();
      unsubConfig();
    };
  }, []);

  const logAudit = async (action: string, details: string, targetUser?: string) => {
    try {
      await addDoc(collection(db, 'auditLogs'), {
        adminName: profile?.displayName || 'Admin',
        action,
        targetUser: targetUser || '-',
        details,
        timestamp: serverTimestamp(),
      });
      if (webhookLogsUrl) {
        fetch(webhookLogsUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [
              {
                title: `🛡️ ADMIN AUDIT LOG: ${action}`,
                description: details,
                color: 16107530,
                footer: { text: `Admin: ${profile?.displayName || 'Admin'}` },
                timestamp: new Date().toISOString(),
              },
            ],
          }),
        }).catch(() => {});
      }
    } catch (err) {
      console.error('Audit Log Error:', err);
    }
  };

  const logWebhook = async (type: string, title: string, status: 'SUCCESS' | 'FAILED', details: string) => {
    try {
      await addDoc(collection(db, 'webhookLogs'), {
        type,
        title,
        status,
        details,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error('Webhook Log Error:', err);
    }
  };

  const triggerEventDiscordWebhook = async (title: string, game: string, type: string, date: string, time: string, slots: string, link?: string) => {
    if (!webhookEventsUrl) {
      await logWebhook('Event Scrim', title, 'FAILED', 'URL Webhook Event (#jadwal-scrim) belum dikonfigurasi');
      return;
    }
    try {
      const res = await fetch(webhookEventsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: '@everyone ⚔️ **EVENT / SCRIM BARU DITERBITKAN!**',
          embeds: [
            {
              title: `🏆 ${type.toUpperCase()}: ${title}`,
              description: `Panggilan untuk seluruh Roster **OLEXTY Community**! Bersiap dan daftarkan squad kalian sekarang!`,
              color: 14753096,
              fields: [
                { name: '🎮 Game', value: game || 'Free Fire', inline: true },
                { name: '👥 Kuota Slot', value: slots || 'TBA', inline: true },
                { name: '📅 Tanggal & Jam', value: `${date || 'TBA'} @ ${time || 'TBA'}`, inline: false },
                ...(link ? [{ name: '🔗 Link Pendaftaran / Room', value: link, inline: false }] : []),
              ],
              footer: { text: 'OLEXTY Scrim System • Circle Not Marga' },
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });

      if (res.ok) {
        await logWebhook('Event Scrim', title, 'SUCCESS', `Pesan dikirim ke channel #jadwal-scrim (${game} - ${type})`);
      } else {
        await logWebhook('Event Scrim', title, 'FAILED', `Discord API merespons status HTTP ${res.status}`);
      }
    } catch (err: any) {
      await logWebhook('Event Scrim', title, 'FAILED', err?.message || 'Gagal koneksi ke Discord API');
    }
  };

  const handleUpdateRole = async (uid: string, targetName: string, newRole: 'admin' | 'moderator' | 'member') => {
    setLoadingId(uid);
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
      await logAudit('Ubah Role', `Mengubah role ${targetName} menjadi ${newRole.toUpperCase()}`, targetName);
      addToast(`Role ${targetName} diubah ke ${newRole.toUpperCase()}`, 'success');
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleUpdateBadge = async (uid: string, targetName: string, newBadge: string) => {
    setLoadingId(uid);
    try {
      await updateDoc(doc(db, 'users', uid), { badge: newBadge });
      await logAudit('Ubah Badge', `Memberikan badge "${newBadge || 'Tanpa Badge'}" ke ${targetName}`, targetName);
      addToast(`Badge ${targetName} berhasil diperbarui!`, 'success');
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleOpenSuspendModal = (uid: string, targetName: string, currentSuspended?: boolean) => {
    if (currentSuspended) {
      executeSuspend(uid, targetName, true, '');
    } else {
      setSelectedUserForSuspend({ uid, name: targetName, isSuspended: currentSuspended });
      setSuspendModalOpen(true);
    }
  };

  const executeSuspend = async (uid: string, targetName: string, currentSuspended?: boolean, reason: string = '') => {
    setLoadingId(uid);
    try {
      await updateDoc(doc(db, 'users', uid), { 
        isSuspended: !currentSuspended,
        suspendReason: !currentSuspended ? reason : '',
      });
      await logAudit(
        !currentSuspended ? 'Suspend User' : 'Unsuspend User',
        !currentSuspended ? `Menangguhkan ${targetName}. Alasan: ${reason}` : `Membuka penangguhan ${targetName}`,
        targetName
      );
      addToast(!currentSuspended ? `Akun ${targetName} telah ditangguhkan.` : `Penangguhan akun ${targetName} dibuka.`, 'info');
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
      setSuspendModalOpen(false);
    }
  };

  const handleSeasonReset = async () => {
    if (!confirm('⚠️ PERINGATAN: Yakin ingin mereset seluruh poin Daily Check-In member untuk awal Season baru?')) return;
    setResettingSeason(true);
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const batch = writeBatch(db);
      snapshot.docs.forEach((d) => {
        batch.update(doc(db, 'users', d.id), { points: 0 });
      });
      await batch.commit();
      await logAudit('Reset Season', 'Mereset poin seluruh anggota untuk pembukaan season baru');
      addToast('Berhasil! Poin seluruh anggota telah di-reset ke 0 untuk Season Baru. 🏆', 'reward');
    } catch (err) {
      console.error(err);
    } finally {
      setResettingSeason(false);
    }
  };

  const handleToggleEmergency = async (active: boolean) => {
    try {
      await setDoc(doc(db, 'settings', 'communityConfig'), {
        emergencyMessage,
        isEmergencyActive: active,
      }, { merge: true });
      await logAudit('System Broadcast', active ? `Mengaktifkan Broadcast Emergency: "${emergencyMessage}"` : 'Nonaktifkan Broadcast Emergency');
      addToast(active ? '🚨 Pop-up Emergency Ditayangkan Ke Semua User!' : 'Broadcast Emergency Dinonaktifkan.', active ? 'error' : 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;
    try {
      await addDoc(collection(db, 'events'), {
        title: eventTitle.trim(),
        game: eventGame,
        date: eventDate,
        time: eventTime,
        type: eventType,
        slots: eventSlots,
        link: eventLink,
        createdAt: serverTimestamp(),
      });
      await logAudit('Buat Event', `Menerbitkan event ${eventType}: ${eventTitle.trim()}`);
      await triggerEventDiscordWebhook(eventTitle.trim(), eventGame, eventType, eventDate, eventTime, eventSlots, eventLink);
      setEventTitle('');
      setEventLink('');
      addToast('Event berhasil diterbitkan & Notifikasi Discord terkirim! ⚔️', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (!confirm('Yakin ingin menghapus event ini?')) return;
    try {
      await deleteDoc(doc(db, 'events', id));
      await logAudit('Hapus Event', `Menghapus event: ${title}`);
      addToast('Event telah dihapus.', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'communityConfig'), {
        announcementText,
        webhookPostsUrl,
        webhookEventsUrl,
        webhookLogsUrl,
        liveStreamUrl,
        gbWarLink,
        rulesWar,
        logoUrl,
        donateUrl,
      }, { merge: true });
      await logAudit('Update Config', 'Memperbarui konfigurasi utama & saluran Webhook Discord');
      addToast('Pengaturan website & saluran Webhook berhasil disimpan! ⚡', 'success');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filteredMembers = members.filter((m) =>
    m.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16 font-space relative">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* CUSTOM SUSPEND MODAL */}
      {selectedUserForSuspend && (
        <SuspendModal
          isOpen={suspendModalOpen}
          targetName={selectedUserForSuspend.name}
          onClose={() => setSuspendModalOpen(false)}
          onSubmit={(reason) => executeSuspend(selectedUserForSuspend.uid, selectedUserForSuspend.name, false, reason)}
        />
      )}

      <div className="clip-hud relative bg-gradient-to-r from-[#14161f] via-[#1c1f2e] to-[#14161f] border border-rose-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-600/15 border border-rose-500/30 text-rose-400 text-[10px] font-black uppercase tracking-widest clip-hud-btn mb-2">
              <Shield className="w-3.5 h-3.5" /> ADMINISTRATOR HQ
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase font-['Oxanium']">
              CONTROL CENTER <span className="text-rose-500">OLEXTY</span>
            </h1>
            <p className="text-xs text-[#9CA3B4] font-medium mt-1">
              Pusat komando audit log, webhook logs 3 channel, broadcast darurat, dan roster.
            </p>
          </div>

          <button
            onClick={handleSeasonReset}
            disabled={resettingSeason}
            className="clip-hud-btn bg-amber-500/20 hover:bg-amber-500 border border-amber-500/40 text-amber-400 hover:text-black px-4 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg"
          >
            <RotateCcw className="w-4 h-4" />
            {resettingSeason ? 'Mereset Poin...' : 'Reset Poin Season Baru'}
          </button>
        </div>
      </div>

      <div className="clip-hud bg-rose-950/30 border border-rose-500/40 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-400 font-black text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 animate-pulse" /> SYSTEM BROADCAST / POP-UP EMERGENCY REALTIME
          </div>
          <span className={`text-[9px] px-2.5 py-0.5 font-black uppercase border ${
            isEmergencyActive ? 'bg-rose-600 text-white border-rose-400 animate-pulse' : 'bg-white/5 text-[#9CA3B4] border-white/10'
          }`}>
            {isEmergencyActive ? '🔴 ACTIVE BROADCAST' : 'OFFLINE'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Contoh: WAR SCRIM UTAMA MULAI DALAM 15 MENIT! MASUK DISCORD SEKARANG!"
            value={emergencyMessage}
            onChange={(e) => setEmergencyMessage(e.target.value)}
            className="flex-1 bg-[#0b0c10] border border-white/10 p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
          />
          {isEmergencyActive ? (
            <button
              onClick={() => handleToggleEmergency(false)}
              className="clip-hud-btn bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-xs font-black uppercase shrink-0"
            >
              Matikan Broadcast
            </button>
          ) : (
            <button
              onClick={() => handleToggleEmergency(true)}
              className="clip-hud-btn bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 text-xs font-black uppercase shrink-0 flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
            >
              <Send className="w-3.5 h-3.5" /> Broadcast Layar
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('members')}
          className={`clip-hud-btn px-4 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'members' ? 'bg-rose-600 text-white shadow-lg' : 'bg-[#14161f] border border-white/10 text-[#9CA3B4]'
          }`}
        >
          <Users className="w-4 h-4" /> Kelola Member ({members.length})
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`clip-hud-btn px-4 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'events' ? 'bg-rose-600 text-white shadow-lg' : 'bg-[#14161f] border border-white/10 text-[#9CA3B4]'
          }`}
        >
          <Calendar className="w-4 h-4" /> Scrim & Event ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`clip-hud-btn px-4 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'logs' ? 'bg-rose-600 text-white shadow-lg' : 'bg-[#14161f] border border-white/10 text-[#9CA3B4]'
          }`}
        >
          <History className="w-4 h-4 text-amber-400" /> Audit Log ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('webhooks')}
          className={`clip-hud-btn px-4 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'webhooks' ? 'bg-rose-600 text-white shadow-lg' : 'bg-[#14161f] border border-white/10 text-[#9CA3B4]'
          }`}
        >
          <Webhook className="w-4 h-4 text-emerald-400" /> Webhook Logs ({webhookLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('babu_donors')}
          className={`clip-hud-btn px-4 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'babu_donors' ? 'bg-rose-600 text-white shadow-lg' : 'bg-[#14161f] border border-white/10 text-[#9CA3B4]'
          }`}
        >
          <Crown className="w-4 h-4 text-amber-400" /> Babu & Donatur
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`clip-hud-btn px-4 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
            activeTab === 'config' ? 'bg-rose-600 text-white shadow-lg' : 'bg-[#14161f] border border-white/10 text-[#9CA3B4]'
          }`}
        >
          <Settings className="w-4 h-4" /> Branding & Webhooks Config
        </button>
      </div>

      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#9CA3B4]" />
            <input
              type="text"
              placeholder="Cari member berdasarkan nama atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#14161f] border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="clip-hud bg-[#14161f] border border-white/10 overflow-x-auto shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0b0c10] border-b border-white/10 text-[10px] font-black uppercase tracking-wider text-[#9CA3B4]">
                <tr>
                  <th className="p-4">Pengguna Roster</th>
                  <th className="p-4">Gelar / Badge Spesial</th>
                  <th className="p-4">Role Akses</th>
                  <th className="p-4">Status & Catatan Suspend</th>
                  <th className="p-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-semibold">
                {filteredMembers.map((m) => (
                  <tr key={m.uid} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-black shrink-0 overflow-hidden">
                        {m.avatarUrl ? <img src={m.avatarUrl} alt="" className="w-full h-full object-cover" /> : m.displayName?.[0] || 'U'}
                      </div>
                      <div className="truncate">
                        <div className="font-extrabold text-white truncate">{m.displayName}</div>
                        <div className="text-[10px] text-[#9CA3B4] truncate">{m.email || '@member'}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <select
                        value={m.badge || ''}
                        onChange={(e) => handleUpdateBadge(m.uid, m.displayName || 'Member', e.target.value)}
                        disabled={loadingId === m.uid}
                        className="bg-[#0b0c10] border border-white/10 text-xs text-amber-400 font-bold px-3 py-1.5 focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="">(Tanpa Badge)</option>
                        <option value="👑 Owner">👑 Owner</option>
                        <option value="🛡️ Admin">🛡️ Admin</option>
                        <option value="🎮 Pro Player">🎮 Pro Player</option>
                        <option value="💎 VIP Donatur">💎 VIP Donatur</option>
                        <option value="⚡ Core Roster">⚡ Core Roster</option>
                        <option value="⚔️ Veteran">⚔️ Veteran</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <select
                        value={m.role || 'member'}
                        onChange={(e) => handleUpdateRole(m.uid, m.displayName || 'Member', e.target.value as any)}
                        disabled={loadingId === m.uid}
                        className="bg-[#0b0c10] border border-white/10 text-xs text-white font-bold px-3 py-1.5 focus:outline-none focus:border-rose-500 cursor-pointer"
                      >
                        <option value="member">Member</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-4">
                      {m.isSuspended ? (
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] font-black uppercase">
                            <UserX className="w-3 h-3" /> Ditangguhkan
                          </span>
                          {(m as any).suspendReason && (
                            <p className="text-[10px] text-rose-400/80 mt-1 italic max-w-xs truncate">
                              Alasan: {(m as any).suspendReason}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase">
                          <UserCheck className="w-3 h-3" /> Aktif
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenSuspendModal(m.uid, m.displayName || 'Member', m.isSuspended)}
                        disabled={loadingId === m.uid}
                        className={`clip-hud-btn px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all ${
                          m.isSuspended ? 'bg-emerald-600 text-white' : 'bg-rose-600/20 border border-rose-500/40 text-rose-400 hover:bg-rose-600 hover:text-white'
                        }`}
                      >
                        {m.isSuspended ? 'Aktifkan' : 'Ban / Suspend'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="clip-hud bg-[#14161f] border border-white/10 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" /> RIWAYAT AUDIT LOG AKTIVITAS ADMIN
            </h3>
            <span className="text-[10px] text-[#9CA3B4] font-mono">50 Aktivitas Terakhir</span>
          </div>

          <div className="space-y-2.5">
            {auditLogs.map((log) => (
              <div key={log.id} className="bg-[#0b0c10] border border-white/10 p-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-rose-400">{log.adminName}</span>
                    <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 font-bold uppercase">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-[#F4F5F8] mt-1 font-medium">{log.details}</p>
                </div>
                <span className="text-[10px] text-[#9CA3B4] shrink-0 font-mono">
                  {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString('id-ID') : 'Baru saja'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'webhooks' && (
        <div className="clip-hud bg-[#14161f] border border-white/10 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <Webhook className="w-4 h-4 text-emerald-400" /> DISCORD WEBHOOK LOGS & DELIVERY STATUS
            </h3>
            <span className="text-[10px] text-[#9CA3B4] font-mono">50 Webhook Terakhir</span>
          </div>

          <div className="space-y-2.5">
            {webhookLogs.map((wh) => (
              <div key={wh.id} className="bg-[#0b0c10] border border-white/10 p-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    {wh.status === 'SUCCESS' ? (
                      <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 font-black uppercase">
                        <CheckCircle2 className="w-3 h-3" /> SUCCESS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[9px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 font-black uppercase">
                        <XCircle className="w-3 h-3" /> FAILED
                      </span>
                    )}
                    <span className="font-extrabold text-white">{wh.title}</span>
                    <span className="text-[9px] bg-white/5 text-[#9CA3B4] px-2 py-0.5 font-bold uppercase">{wh.type}</span>
                  </div>
                  <p className="text-[11px] text-[#9CA3B4] mt-1 font-medium">{wh.details}</p>
                </div>
                <span className="text-[10px] text-[#9CA3B4] shrink-0 font-mono">
                  {wh.timestamp?.toDate ? wh.timestamp.toDate().toLocaleString('id-ID') : 'Baru saja'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form onSubmit={handleCreateEvent} className="lg:col-span-5 clip-hud bg-[#14161f] border border-white/10 p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-wider border-b border-white/10 pb-3">
              <Calendar className="w-4 h-4 text-rose-500" /> Buat Event / Scrim Baru
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-[#9CA3B4]">Judul Event / Scrim</label>
              <input
                type="text"
                placeholder="Contoh: Scrim Fast Tournament Season 1"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full bg-[#0b0c10] border border-white/10 p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[#9CA3B4]">Game</label>
                <input
                  type="text"
                  value={eventGame}
                  onChange={(e) => setEventGame(e.target.value)}
                  className="w-full bg-[#0b0c10] border border-white/10 p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[#9CA3B4]">Tipe Event</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as any)}
                  className="w-full bg-[#0b0c10] border border-white/10 p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="Scrim">Scrim</option>
                  <option value="Turnamen">Turnamen</option>
                  <option value="Mabar">Mabar</option>
                  <option value="Latihan">Latihan</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[#9CA3B4]">Tanggal</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-[#0b0c10] border border-white/10 p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[#9CA3B4]">Jam WIB</label>
                <input
                  type="text"
                  placeholder="20:00 WIB"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full bg-[#0b0c10] border border-white/10 p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-[#9CA3B4]">Jumlah Slot / Kuota</label>
              <input
                type="text"
                placeholder="12 Teams"
                value={eventSlots}
                onChange={(e) => setEventSlots(e.target.value)}
                className="w-full bg-[#0b0c10] border border-white/10 p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <button type="submit" className="clip-hud-btn w-full bg-rose-600 hover:bg-rose-700 text-white p-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20">
              <Plus className="w-4 h-4" /> Terbitkan Event & Auto Webhook
            </button>
          </form>

          <div className="lg:col-span-7 space-y-3">
            {events.map((ev) => (
              <div key={ev.id} className="clip-hud bg-[#14161f] border border-white/10 p-4 flex items-center justify-between shadow-md">
                <div>
                  <span className="text-[10px] bg-rose-600/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 font-bold uppercase">{ev.type}</span>
                  <h4 className="font-extrabold text-sm text-white mt-1">{ev.title}</h4>
                  <p className="text-[10px] text-[#9CA3B4] mt-0.5">{ev.date || 'TBA'} @ {ev.time || 'TBA'} | Game: {ev.game}</p>
                </div>
                <button
                  onClick={() => handleDeleteEvent(ev.id, ev.title)}
                  className="p-2 bg-rose-600/10 border border-rose-500/20 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'babu_donors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="clip-hud bg-[#14161f] border border-white/10 p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-wider border-b border-white/10 pb-3">
              <Users className="w-4 h-4 text-rose-500" /> Daftar Babu / Piket Roster
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nama Member"
                value={newBabuName}
                onChange={(e) => setNewBabuName(e.target.value)}
                className="w-1/2 bg-[#0b0c10] border border-white/10 p-2 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Tugas Piket"
                value={newBabuTask}
                onChange={(e) => setNewBabuTask(e.target.value)}
                className="w-1/2 bg-[#0b0c10] border border-white/10 p-2 text-xs text-white"
              />
              <button onClick={async () => {
                if (!newBabuName.trim() || !newBabuTask.trim()) return;
                const updated = [...babuList, { id: Date.now().toString(), name: newBabuName.trim(), task: newBabuTask.trim() }];
                setBabuList(updated);
                setNewBabuName('');
                setNewBabuTask('');
                await setDoc(doc(db, 'settings', 'communityConfig'), { babuList: updated }, { merge: true });
                await logAudit('Update Babu', `Menambahkan ${newBabuName.trim()} ke daftar piket`);
                addToast('Daftar piket diperbarui!', 'success');
              }} className="bg-rose-600 text-white px-3 text-xs font-bold shrink-0">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {babuList.map((b) => (
                <div key={b.id} className="bg-[#0b0c10] border border-white/10 p-2.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-extrabold text-white">{b.name}</span>
                    <span className="text-[10px] text-rose-400 ml-2">({b.task})</span>
                  </div>
                  <button onClick={async () => {
                    const updated = babuList.filter((x) => x.id !== b.id);
                    setBabuList(updated);
                    await setDoc(doc(db, 'settings', 'communityConfig'), { babuList: updated }, { merge: true });
                    addToast('Item piket dihapus.', 'info');
                  }} className="text-rose-500 hover:text-white">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="clip-hud bg-[#14161f] border border-amber-500/30 p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wider border-b border-amber-500/20 pb-3">
              <Crown className="w-4 h-4 text-amber-400" /> Leaderboard Top Donatur
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nama Donatur"
                value={newDonorName}
                onChange={(e) => setNewDonorName(e.target.value)}
                className="w-1/2 bg-[#0b0c10] border border-white/10 p-2 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Nominal"
                value={newDonorAmount}
                onChange={(e) => setNewDonorAmount(e.target.value)}
                className="w-1/2 bg-[#0b0c10] border border-white/10 p-2 text-xs text-white"
              />
              <button onClick={async () => {
                if (!newDonorName.trim() || !newDonorAmount.trim()) return;
                const updated = [...topDonors, { id: Date.now().toString(), name: newDonorName.trim(), amount: newDonorAmount.trim() }];
                setTopDonors(updated);
                setNewDonorName('');
                setNewDonorAmount('');
                await setDoc(doc(db, 'settings', 'communityConfig'), { topDonors: updated }, { merge: true });
                await logAudit('Update Donatur', `Menambahkan donatur ${newDonorName.trim()} (${newDonorAmount.trim()})`);
                addToast('Donatur baru ditambahkan!', 'success');
              }} className="bg-amber-500 text-black px-3 text-xs font-bold shrink-0">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {topDonors.map((d) => (
                <div key={d.id} className="bg-[#0b0c10] border border-white/10 p-2.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-extrabold text-white">{d.name}</span>
                    <span className="text-[10px] text-amber-400 font-bold ml-2">{d.amount}</span>
                  </div>
                  <button onClick={async () => {
                    const updated = topDonors.filter((x) => x.id !== d.id);
                    setTopDonors(updated);
                    await setDoc(doc(db, 'settings', 'communityConfig'), { topDonors: updated }, { merge: true });
                    addToast('Donatur dihapus.', 'info');
                  }} className="text-rose-500 hover:text-white">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <form onSubmit={handleSaveConfig} className="clip-hud bg-[#14161f] border border-white/10 p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4 text-rose-500" /> BRANDING & SALURAN DISCORD WEBHOOKS
            </h3>
            <button
              type="submit"
              disabled={saving}
              className="clip-hud-btn bg-amber-500 hover:bg-amber-600 text-black px-5 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-white/10 pb-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[#9CA3B4]">Webhook Feed Postingan (#lobby-feed)</label>
                <input
                  type="text"
                  value={webhookPostsUrl}
                  onChange={(e) => setWebhookPostsUrl(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full bg-[#0b0c10] border border-white/10 p-3 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[#9CA3B4]">Webhook Scrim & Event (#jadwal-scrim)</label>
                <input
                  type="text"
                  value={webhookEventsUrl}
                  onChange={(e) => setWebhookEventsUrl(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full bg-[#0b0c10] border border-white/10 p-3 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[#9CA3B4]">Webhook Audit Log Admin (#admin-logs)</label>
                <input
                  type="text"
                  value={webhookLogsUrl}
                  onChange={(e) => setWebhookLogsUrl(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full bg-[#0b0c10] border border-white/10 p-3 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[#9CA3B4]">Teks Pengumuman Banner</label>
                <input
                  type="text"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="w-full bg-[#0b0c10] border border-white/10 p-3 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[#9CA3B4]">Live Stream Embed URL</label>
                <input
                  type="text"
                  value={liveStreamUrl}
                  onChange={(e) => setLiveStreamUrl(e.target.value)}
                  className="w-full bg-[#0b0c10] border border-white/10 p-3 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[#9CA3B4]">Link Room GB War</label>
                <input
                  type="text"
                  value={gbWarLink}
                  onChange={(e) => setGbWarLink(e.target.value)}
                  className="w-full bg-[#0b0c10] border border-white/10 p-3 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[#9CA3B4]">Link Saweria / Donasi</label>
                <input
                  type="text"
                  value={donateUrl}
                  onChange={(e) => setDonateUrl(e.target.value)}
                  placeholder="https://saweria.co/olexty"
                  className="w-full bg-[#0b0c10] border border-white/10 p-3 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-black uppercase text-[#9CA3B4]">Aturan Tempur Scrim / War</label>
                <textarea
                  rows={4}
                  value={rulesWar}
                  onChange={(e) => setRulesWar(e.target.value)}
                  className="w-full bg-[#0b0c10] border border-white/10 p-3 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>
            </div>
          </div>
        </form>
      )}

    </div>
  );
};