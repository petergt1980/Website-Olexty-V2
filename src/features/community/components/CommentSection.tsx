import React, { useState } from 'react';
import { Send, CornerDownRight } from 'lucide-react';
import type { Comment } from '../../../types/database';

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (content: string, parentId?: string | null) => Promise<void>;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ comments, onAddComment }) => {
  const [newComment, setNewComment] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitMain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;
    setIsSubmitting(true);
    await onAddComment(newComment);
    setNewComment('');
    setIsSubmitting(false);
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || isSubmitting) return;
    setIsSubmitting(true);
    await onAddComment(replyContent, parentId);
    setReplyContent('');
    setReplyToId(null);
    setIsSubmitting(false);
  };

  const renderCommentTree = (items: Comment[], isChild = false) => {
    return items.map((comment) => (
      <div key={comment.id} className={`${isChild ? 'ml-6 mt-3 pl-4 border-l-2 border-border' : 'mt-4'}`}>
        <div className="bg-surface/60 border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <img
                src={comment.author?.avatar_url || 'https://via.placeholder.com/32'}
                alt={comment.author?.display_name}
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="text-sm font-medium text-text-primary">
                {comment.author?.display_name}
              </span>
              <span className="text-xs text-text-secondary">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>
            <button
              onClick={() => setReplyToId(replyToId === comment.id ? null : comment.id)}
              className="text-xs text-accent hover:underline flex items-center gap-1"
            >
              <CornerDownRight className="w-3 h-3" /> Balas
            </button>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{comment.content}</p>

          {replyToId === comment.id && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Tulis balasan..."
                className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent"
              />
              <button
                onClick={() => handleSubmitReply(comment.id)}
                disabled={isSubmitting}
                className="bg-accent hover:bg-accent-hover text-white px-3 py-1.5 rounded-lg text-xs font-medium"
              >
                Kirim
              </button>
            </div>
          )}
        </div>

        {comment.replies && comment.replies.length > 0 && renderCommentTree(comment.replies, true)}
      </div>
    ));
  };

  return (
    <div className="mt-8">
      <h4 className="text-lg font-semibold text-text-primary mb-4">Komentar ({comments.length})</h4>

      <form onSubmit={handleSubmitMain} className="mb-6 flex gap-3">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Tulis komentar kamu..."
          className="flex-1 bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" /> Kirim
        </button>
      </form>

      <div className="space-y-3">{renderCommentTree(comments)}</div>
    </div>
  );
};