import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../features/auth/AuthContext';
import { Bell, Heart, MessageSquare, UserPlus, Trash2, CheckCheck, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'message' | 'system';
  title: string;
  content: string;
  isRead: boolean;
  createdAt: any;
  link?: string;
}

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedNotifs: NotificationItem[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as NotificationItem[];
        setNotifications(fetchedNotifs);
        setLoading(false);
      },
      (error) => {
        console.error('Gagal memuat notifikasi:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const notifRef = doc(db, 'notifications', id);
      await updateDoc(notifRef, { isRead: true });
    } catch (err) {
      console.error('Gagal memperbarui status notifikasi:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    try {
      const unreadNotifs = notifications.filter((n) => !n.isRead);
      if (unreadNotifs.length === 0) return;

      const batch = writeBatch(db);
      unreadNotifs.forEach((n) => {
        const notifRef = doc(db, 'notifications', n.id);
        batch.update(notifRef, { isRead: true });
      });
      await batch.commit();
    } catch (err) {
      console.error('Gagal menandai semua dibaca:', err);
    }
  };

  const handleDeleteNotif = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (err) {
      console.error('Gagal menghapus notifikasi:', err);
    }
  };

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-rose-400" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-sky-400" />;
      case 'message':
        return <UserPlus className="w-4 h-4 text-[#8B8CF8]" />;
      default:
        return <Info className="w-4 h-4 text-amber-400" />;
    }
  };

  if (!user) {
    return (
      <div className="bg-[#181A22] border border-[#292C36] rounded-2xl p-8 text-center text-sm text-[#9CA3B4]">
        Silakan masuk terlebih dahulu untuk melihat notifikasi kamu.
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F5F8] flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#8B8CF8]" /> Notifikasi
          </h1>
          <p className="text-sm text-[#9CA3B4] mt-1">
            Pantau semua aktivitas, tanggapan, dan pesan terbaru kamu.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-[#8B8CF8]/15 text-[#8B8CF8] hover:bg-[#8B8CF8]/25 transition-colors flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4" /> Tandai Semua Dibaca ({unreadCount})
          </button>
        )}
      </div>

      <div className="bg-[#181A22] border border-[#292C36] rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-sm text-[#9CA3B4]">Memuat notifikasi...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-[#9CA3B4]">
            <Bell className="w-12 h-12 text-[#8B8CF8]/30 mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#F4F5F8]">Belum Ada Notifikasi</p>
            <p className="text-xs mt-1">Semua aktivitas terbaru kamu akan muncul di halaman ini.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#292C36]/60">
            {notifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                className={`p-4 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                  notif.isRead ? 'hover:bg-[#101116]/40' : 'bg-[#8B8CF8]/10 hover:bg-[#8B8CF8]/15'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-xl bg-[#101116] border border-[#292C36] shrink-0 mt-0.5">
                    {getNotifIcon(notif.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[#F4F5F8]">{notif.title}</p>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#8B8CF8]" />
                      )}
                    </div>
                    <p className="text-xs text-[#9CA3B4] mt-1 leading-relaxed">{notif.content}</p>
                    <span className="text-[10px] text-[#9CA3B4]/70 mt-2 block">
                      {notif.createdAt?.toDate ? notif.createdAt.toDate().toLocaleString() : 'Baru saja'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => handleDeleteNotif(notif.id, e)}
                  title="Hapus Notifikasi"
                  className="p-1.5 rounded-lg text-[#9CA3B4] hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};