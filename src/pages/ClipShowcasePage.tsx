import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../features/auth/AuthContext';
import { ClipItem } from '../types';
import { Video, Upload, Gamepad2 } from 'lucide-react';

export const ClipShowcasePage: React.FC = () => {
  const { user, profile } = useAuth();
  const [clips, setClips] = useState<ClipItem[]>([]);
  const [title, setTitle] = useState('');
  const [game, setGame] = useState('Free Fire');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'clips'), (snapshot) => {
      const list: ClipItem[] = snapshot.docs.map((doc) => ({
        ...(doc.data() as ClipItem),
        id: doc.id,
      }));
      setClips(list);
    });
    return () => unsubscribe();
  }, []);

  const handleAddClip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !file || !user) return;

    setLoading(true);
    setUploadProgress('Mengunggah file ke server...');

    try {
      // 1. Upload file ke Firebase Storage
      const storageRef = ref(storage, `clips/${user.uid}_${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const videoUrl = await getDownloadURL(snapshot.ref);

      setUploadProgress('Menyimpan data klip...');

      // 2. Simpan data ke Firestore
      await addDoc(collection(db, 'clips'), {
        userId: user.uid,
        userName: profile?.displayName || 'Member OLEXTY',
        userAvatar: profile?.avatarUrl || '',
        title: title.trim(),
        videoUrl,
        game,
        likes: [],
        createdAt: serverTimestamp(),
      });

      setTitle('');
      setFile(null);
      setUploadProgress('');
    } catch (err) {
      console.error(err);
      alert('Gagal mengunggah klip. Periksa koneksi atau ukuran file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F5F8] flex items-center gap-2">
            <Video className="w-6 h-6 text-[#8B8CF8]" /> Clips & Highlights
          </h1>
          <p className="text-xs text-[#9CA3B4] mt-1">Upload momen clutch dan gameplay terbaikmu langsung dari galeri.</p>
        </div>
      </div>

      {user && (
        <form onSubmit={handleAddClip} className="bg-[#181A22] border border-[#292C36] rounded-2xl p-5 space-y-4 shadow-lg">
          <h3 className="text-xs font-bold text-[#F4F5F8] uppercase tracking-wider">Upload Klip dari Galeri</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Judul Klip (misal: Clutch 1vs4 Free Fire)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
              required
            />
            <select
              value={game}
              onChange={(e) => setGame(e.target.value)}
              className="bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
            >
              <option value="Free Fire">Free Fire</option>
              <option value="Mobile Legends">Mobile Legends</option>
              <option value="Growtopia">Growtopia</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          {/* Input File Galeri */}
          <div className="space-y-1">
            <label className="text-[10px] text-[#9CA3B4] uppercase font-bold">Pilih Video dari Perangkat / Galeri</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#8B8CF8]/20 file:text-[#8B8CF8] hover:file:bg-[#8B8CF8]/30 cursor-pointer"
              required
            />
          </div>

          {uploadProgress && (
            <p className="text-xs text-[#8B8CF8] font-semibold animate-pulse">{uploadProgress}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#8B8CF8] hover:bg-[#7879E8] text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 w-full"
          >
            <Upload className="w-4 h-4" /> {loading ? 'Mengunggah ke Server...' : 'Unggah Klip Sekarang'}
          </button>
        </form>
      )}

      {/* Grid Daftar Klip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {clips.map((clip) => (
          <div key={clip.id} className="bg-[#181A22] border border-[#292C36] rounded-2xl overflow-hidden space-y-3 p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#8B8CF8]/20 flex items-center justify-center text-[#8B8CF8] font-bold text-xs overflow-hidden">
                  {clip.userAvatar ? (
                    <img src={clip.userAvatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    clip.userName?.[0] || 'U'
                  )}
                </div>
                <span className="text-xs font-medium text-[#F4F5F8]">{clip.userName}</span>
              </div>
              <span className="text-[10px] bg-[#8B8CF8]/10 text-[#8B8CF8] px-2 py-0.5 rounded font-bold">
                {clip.game}
              </span>
            </div>

            <h4 className="font-bold text-sm text-[#F4F5F8]">{clip.title}</h4>

            <div className="aspect-video bg-[#14161D] rounded-xl overflow-hidden border border-[#292C36] flex items-center justify-center">
              <video src={clip.videoUrl} controls className="w-full h-full object-cover" />
            </div>
          </div>
        ))}
        {clips.length === 0 && (
          <div className="col-span-full text-center py-12 text-xs text-[#9CA3B4]">
            Belum ada klip yang diunggah. Jadilah yang pertama membagikannya!
          </div>
        )}
      </div>
    </div>
  );
};