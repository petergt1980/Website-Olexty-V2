import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth, UserProfile } from '../features/auth/AuthContext';
import { Send, MessageSquare, Search } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: any;
  conversationId: string;
}

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Mengambil daftar pengguna lain
  useEffect(() => {
    if (!user) return;
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const users: UserProfile[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data() as UserProfile;
          if (data.uid !== user.uid) {
            users.push(data);
          }
        });
        setUsersList(users);
      } catch (err) {
        console.error('Gagal mengambil daftar pengguna:', err);
      }
    };
    fetchUsers();
  }, [user]);

  // Mendengarkan pesan realtime dari Firestore
  useEffect(() => {
    if (!user || !selectedUser) return;

    const conversationId = [user.uid, selectedUser.uid].sort().join('_');
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages: Message[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Message[];
      setMessages(fetchedMessages);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [user, selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !selectedUser) return;

    const conversationId = [user.uid, selectedUser.uid].sort().join('_');
    const text = newMessage;
    setNewMessage('');

    try {
      await addDoc(collection(db, 'messages'), {
        conversationId,
        senderId: user.uid,
        receiverId: selectedUser.uid,
        content: text,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Gagal mengirim pesan:', err);
    }
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase())
  );

  if (!user) {
    return (
      <div className="bg-[#181A22] border border-[#292C36] rounded-2xl p-8 text-center text-sm text-[#9CA3B4]">
        Silakan masuk terlebih dahulu untuk menggunakan fitur percakapan privat.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] grid grid-cols-1 md:grid-cols-3 bg-[#181A22] border border-[#292C36] rounded-2xl overflow-hidden shadow-2xl">
      {/* Sidebar - Daftar Pengguna */}
      <div className="border-r border-[#292C36] flex flex-col h-full bg-[#14161D]">
        <div className="p-4 border-b border-[#292C36] space-y-3">
          <h2 className="font-bold text-[#F4F5F8] text-base flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#8B8CF8]" /> Pesan Privat
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3B4]" />
            <input
              type="text"
              placeholder="Cari pengguna..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#101116] border border-[#292C36] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#292C36]/50">
          {filteredUsers.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#9CA3B4]">Tidak ada pengguna ditemukan.</div>
          ) : (
            filteredUsers.map((u) => {
              const isSelected = selectedUser?.uid === u.uid;
              return (
                <button
                  key={u.uid}
                  onClick={() => setSelectedUser(u)}
                  className={`w-full p-3.5 flex items-center gap-3 text-left transition-colors ${
                    isSelected ? 'bg-[#8B8CF8]/15 border-l-4 border-[#8B8CF8]' : 'hover:bg-[#181A22]'
                  }`}
                >
                  <div className="relative w-10 h-10 shrink-0">
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt="" className="w-full h-full rounded-full object-cover border border-[#292C36]" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-[#8B8CF8]/20 border border-[#292C36] flex items-center justify-center text-[#8B8CF8] font-bold text-xs">
                        {u.displayName?.[0] || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="text-sm font-semibold text-[#F4F5F8] truncate">{u.displayName}</p>
                    <p className="text-xs text-[#9CA3B4] truncate">@{u.username}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Area Chat Utama */}
      <div className="md:col-span-2 flex flex-col h-full bg-[#181A22]">
        {selectedUser ? (
          <>
            {/* Header Obrolan */}
            <div className="p-4 border-b border-[#292C36] flex items-center gap-3 bg-[#14161D]">
              <div className="w-9 h-9 shrink-0">
                {selectedUser.avatarUrl ? (
                  <img src={selectedUser.avatarUrl} alt="" className="w-full h-full rounded-full object-cover border border-[#292C36]" />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#8B8CF8]/20 border border-[#292C36] flex items-center justify-center text-[#8B8CF8] font-bold text-xs">
                    {selectedUser.displayName?.[0] || 'U'}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-[#F4F5F8]">{selectedUser.displayName}</p>
                <p className="text-xs text-[#9CA3B4]">@{selectedUser.username}</p>
              </div>
            </div>

            {/* Isi Obrolan */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-[#9CA3B4]">
                  Belum ada pesan. Mulai percakapan sekarang!
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === user.uid;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-[#8B8CF8] text-white rounded-br-none'
                            : 'bg-[#101116] border border-[#292C36] text-[#F4F5F8] rounded-bl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Form Input Pesan */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-[#292C36] bg-[#14161D] flex items-center gap-2">
              <input
                type="text"
                placeholder={`Tulis pesan untuk ${selectedUser.displayName}...`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-[#101116] border border-[#292C36] rounded-xl px-4 py-2.5 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-[#8B8CF8] hover:bg-[#7A7BF6] text-white p-2.5 rounded-xl transition-colors disabled:opacity-50 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-[#9CA3B4]">
            <MessageSquare className="w-12 h-12 text-[#8B8CF8]/40 mb-3" />
            <p className="text-sm font-semibold text-[#F4F5F8]">Pilih Pengguna untuk Memulai Obrolan</p>
            <p className="text-xs mt-1">Pilih salah satu anggota dari daftar di sebelah kiri untuk berkirim pesan realtime.</p>
          </div>
        )}
      </div>
    </div>
  );
};