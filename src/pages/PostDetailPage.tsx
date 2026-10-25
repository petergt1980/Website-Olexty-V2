import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Post } from '../types';
import { PostComments } from '../features/community/components/PostComments';
import { ArrowLeft } from 'lucide-react';

export const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      try {
        const docRef = doc(db, 'posts', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...(docSnap.data() as Omit<Post, 'id'>) });
        }
      } catch (err) {
        console.error('Gagal mengambil detail postingan:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-xs text-[#9CA3B4]">Memuat postingan...</div>;
  if (!post) return <div className="p-8 text-center text-xs text-[#9CA3B4]">Postingan tidak ditemukan.</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-4 py-4">
      <Link to="/community" className="inline-flex items-center gap-2 text-xs text-[#9CA3B4] hover:text-[#F4F5F8]">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </Link>

      <div className="bg-[#181A22] border border-[#292C36] rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#8B8CF8]/20 border border-[#292C36] flex items-center justify-center text-[#8B8CF8] font-bold text-xs">
            {post.userAvatar ? <img src={post.userAvatar} alt="" className="w-full h-full object-cover rounded-full" /> : post.userName?.[0]}
          </div>
          <div>
            <h3 className="font-semibold text-sm text-[#F4F5F8]">{post.userName}</h3>
            <span className="text-[11px] text-[#9CA3B4]">{post.category}</span>
          </div>
        </div>

        <p className="text-xs text-[#F4F5F8] leading-relaxed">{post.content}</p>
        {post.imageUrl && <img src={post.imageUrl} alt="" className="rounded-xl border border-[#292C36] max-h-96 w-full object-cover" />}

        <PostComments postId={post.id} likes={post.likes} />
      </div>
    </div>
  );
};