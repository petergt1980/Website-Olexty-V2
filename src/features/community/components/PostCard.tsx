import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Eye, Pin, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Post } from '../../../types/database';

interface PostCardProps {
  post: Post;
  onReact?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onReact }) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface border border-border rounded-xl p-5 hover:border-accent/50 transition-colors"
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <Link to={`/u/${post.author?.username}`}>
            <img
              src={post.author?.avatar_url || 'https://via.placeholder.com/40'}
              alt={post.author?.display_name || 'User'}
              className="w-10 h-10 rounded-full object-cover border border-border"
            />
          </Link>
          <div>
            <Link
              to={`/u/${post.author?.username}`}
              className="font-medium text-text-primary hover:text-accent text-sm transition-colors"
            >
              {post.author?.display_name || 'Anonymous'}
            </Link>
            <p className="text-xs text-text-secondary">
              @{post.author?.username} · {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        {post.category && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent font-medium">
            {post.category.name}
          </span>
        )}
      </div>

      <Link to={`/community/${post.slug}`}>
        <h3 className="text-lg font-semibold text-text-primary hover:text-accent transition-colors mb-2 flex items-center gap-2">
          {post.is_pinned && <Pin className="w-4 h-4 text-accent fill-accent" />}
          {post.title}
        </h3>
        <p className="text-text-secondary text-sm line-clamp-2 mb-4 leading-relaxed">
          {post.content}
        </p>
      </Link>

      <div className="flex items-center justify-between text-xs text-text-secondary pt-3 border-t border-border/50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onReact?.(post.id)}
            className="flex items-center gap-1.5 hover:text-accent transition-colors"
          >
            <Heart className="w-4 h-4" />
            <span>{post.reactions_count || 0}</span>
          </button>
          <Link to={`/community/${post.slug}`} className="flex items-center gap-1.5 hover:text-accent transition-colors">
            <MessageSquare className="w-4 h-4" />
            <span>{post.comments_count || 0}</span>
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          <span>{post.views_count} views</span>
        </div>
      </div>
    </motion.article>
  );
};