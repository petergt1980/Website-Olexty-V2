import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../auth/AuthContext';
import { Heart, MessageSquare, Send } from 'lucide-react';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: any;
}

interface PostCommentsProps {
  postId: string;
  likes?: string[];
}

export const PostComments: React.FC<PostCommentsProps> = ({ postId, likes = [] }) => {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const isLiked = user ? likes.includes(user.uid) : false;

  // Realtime Listener untuk Komentar
  useEffect(() => {
    if (!showComments) return;

    const q = query(
      collection(db, 'posts', postId, 'comments'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Comment[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Comment, 'id'>),
      }));
      setComments(list);
    });

    return () => unsubscribe();
  }, [postId, showComments]);

  // Handle Toggle Like
  const handleToggleLike = async () => {
    if (!user) return alert('Silakan login terlebih dahulu!');
    const postRef = doc(db, 'posts', postId);

    await updateDoc(postRef, {
      likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
    });
  };

  // Handle Tambah Komentar
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    await addDoc(collection(db, 'posts', postId, 'comments'), {
      userId: user.uid,
      userName: profile?.displayName || 'Anonim',
      userAvatar: profile?.avatarUrl || '',
      content: newComment.trim(),
      createdAt: serverTimestamp(),
    });

    setNewComment('');
  };

  return (
    <div className="space-y-4 mt-3">
      {/* Tombol Action */}
      <div className="flex items-center gap-6 pt-3 border-t border-[#292C36] text-xs text-[#9CA3B4]">
        <button
          onClick={handleToggleLike}
          className={`flex items-center gap-2 transition-colors ${
            isLiked ? 'text-red-500 font-semibold' : 'hover:text-[#F4F5F8]'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-red-500' : ''}`} />
          <span>{likes.length} Suka</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 hover:text-[#F4F5F8] transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{showComments ? 'Sembunyikan' : 'Komentar'}</span>
        </button>
      </div>

      {/* Box Komentar Realtime */}
      {showComments && (
        <div className="space-y-3 pt-2">
          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
            {comments.length === 0 ? (
              <p className="text-[11px] text-[#9CA3B4] italic">Belum ada komentar.</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="bg-[#14161D] p-2.5 rounded-xl border border-[#292C36] text-xs space-y-1">
                  <div className="font-semibold text-[#F4F5F8]">{c.userName}</div>
                  <p className="text-[#9CA3B4]">{c.content}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              placeholder="Tulis komentar..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-[#14161D] border border-[#292C36] rounded-xl px-3 py-1.5 text-xs text-[#F4F5F8] focus:outline-none focus:border-[#8B8CF8]"
            />
            <button
              type="submit"
              className="bg-[#8B8CF8] hover:bg-[#7879E8] text-white p-2 rounded-xl transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};