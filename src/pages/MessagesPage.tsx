import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../features/auth/AuthContext';
import { UserProfile } from '../types';
import { Send, MessageSquare, Search, User } from 'lucide-react';

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: any;
}

export const MessagesPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');

  // 1. Load Daftar Pengguna
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const list: UserProfile[] = snapshot.docs
        .map((docSnap) => ({
          ...(docSnap.data() as UserProfile),
          uid: docSnap.id,
        }))
        .filter((u) => u.uid !== user?.uid);
      setUsers(list);
    });
    return () => unsubscribe();
  }, [user]);

  // 2. Load Pesan Realtime Antar Pengguna (Sort Manual di Client-Side)
  useEffect(() => {
    if (!user || !selectedUser) return;

    // Filter pesan tanpa orderBy biar nggak butuh Composite Index di Firestore
    const q = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rawMessages: ChatMessage[] = snapshot.docs
        .map((docSnap) => ({
          ...(docSnap.data() as ChatMessage),
          id: docSnap.id,
        }))
        .filter(
          (m) =>
            (m.senderId === user.uid && m.receiverId === selectedUser.uid) ||
            (m.senderId === selectedUser.uid && m.receiverId === user.uid)
        );

      // Urutkan pesan berdasarkan tanggal kirim secara manual
      rawMessages.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return timeA - timeB;
      });

      setMessages(rawMessages);
    });

    return () => unsubscribe();
  }, [user, selectedUser]);

  // 3. Kirim Pesan
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user || !selectedUser) return;

    const messageText = text.trim();
    setText('');

    try {
      await addDoc(collection(db, 'messages'), {
        senderId: user.uid,
        senderName: profile?.displayName || 'Member',
        receiverId: selectedUser.uid,
        participants: [user.uid, selectedUser.uid],
        text: messageText,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Gagal mengirim pesan:', err);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <div className="bg-[#181A22] border border-[#292C36] rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[550px] shadow-xl">
        {/* Panel Kiri: Daftar Pengguna */}
        <div className="border-r border-[#292C36] p-4 space-y-4 flex flex-col">
          <div className="flex items-center gap-2 text-[#F4F5F8] font-bold text-sm">
            <MessageSquare className="w-4 h-4 text-[#8B8CF8]" /> Pesan Privat
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#9CA3B4]" />
            <input
              type="text"
              placeholder="Cari pengguna..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#14161D] border border-[#292C36] rounded-xl pl-8 pr-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
            />
          </div>

          <div className="space-y-1 overflow-y-auto flex-1 max-h-[420px] pr-1">
            {filteredUsers.map((u) => (
              <button
                key={u.uid}
                onClick={() => setSelectedUser(u)}
                className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${
                  selectedUser?.uid === u.uid
                    ? 'bg-[#8B8CF8]/10 border border-[#8B8CF8]/30'
                    : 'hover:bg-[#14161D]'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-[#8B8CF8]/20 border border-[#292C36] flex items-center justify-center text-[#8B8CF8] font-bold text-xs overflow-hidden shrink-0">
                  {u.avatarUrl ? (
                    <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    u.displayName?.[0] || 'U'
                  )}
                </div>
                <div className="truncate">
                  <div className="font-bold text-xs text-[#F4F5F8] truncate">{u.displayName}</div>
                  <div className="text-[10px] text-[#9CA3B4] truncate">@{u.username || 'member'}</div>
                </div>
              </button>
            ))}
            {filteredUsers.length === 0 && (
              <p className="text-center text-xs text-[#9CA3B4] py-8">Pengguna tidak ditemukan.</p>
            )}
          </div>
        </div>

        {/* Panel Kanan: Jendela Percakapan */}
        <div className="md:col-span-2 flex flex-col justify-between p-4 bg-[#14161D]/50">
          {selectedUser ? (
            <>
              {/* Header Percakapan */}
              <div className="flex items-center gap-3 border-b border-[#292C36] pb-3">
                <div className="w-8 h-8 rounded-full bg-[#8B8CF8]/20 border border-[#292C36] flex items-center justify-center text-[#8B8CF8] font-bold text-xs overflow-hidden">
                  {selectedUser.avatarUrl ? (
                    <img src={selectedUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    selectedUser.displayName?.[0] || 'U'
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-xs text-[#F4F5F8]">{selectedUser.displayName}</h3>
                  <span className="text-[10px] text-[#9CA3B4]">@{selectedUser.username || 'member'}</span>
                </div>
              </div>

              {/* Area Isi Pesan */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3 max-h-[380px] pr-1">
                {messages.map((msg) => {
                  const isMe = msg.senderId === user?.uid;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-[#8B8CF8] text-white rounded-br-none'
                            : 'bg-[#181A22] border border-[#292C36] text-[#F4F5F8] rounded-bl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                {messages.length === 0 && (
                  <div className="text-center text-xs text-[#9CA3B4] py-16">
                    Belum ada pesan. Mulai percakapan sekarang!
                  </div>
                )}
              </div>

              {/* Input Kirim Pesan */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2 border-t border-[#292C36]">
                <input
                  type="text"
                  placeholder={`Tulis pesan untuk ${selectedUser.displayName}...`}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex-1 bg-[#181A22] border border-[#292C36] rounded-xl px-4 py-2.5 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-[#8B8CF8] hover:bg-[#7879E8] text-white rounded-xl transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-[#9CA3B4] space-y-2">
              <User className="w-10 h-10 text-[#292C36]" />
              <p className="text-xs">Pilih salah satu anggota dari daftar di sebelah kiri untuk mulai mengobrol.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};