'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Send, Edit3, Trash2, Reply, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import UserIdentityBadge from '../profiles/UserIdentityBadge';
import { CompactUserProfile } from '../profiles/UserProfile';
import { PromptComment, promptComments } from '@/lib/prompt-comments';
import { useUser } from '@/lib/hooks/useUser';
import toast from 'react-hot-toast';

interface PromptCommentsProps {
  promptId: string;
  canComment?: boolean;
  className?: string;
}

interface CommentItemProps {
  comment: PromptComment;
  onReply: (parentId: string) => void;
  onEdit: (comment: PromptComment) => void;
  onDelete: (commentId: string) => void;
  currentUserId?: string;
  level?: number;
}

function CommentItem({ 
  comment, 
  onReply, 
  onEdit, 
  onDelete, 
  currentUserId, 
  level = 0 
}: CommentItemProps) {
  const [showActions, setShowActions] = useState(false);
  const isAuthor = currentUserId === comment.user_id;
  const userTier = comment.profiles?.role === 'premium' ? 'premium' : 
                  comment.profiles?.role === 'pro' ? 'pro' : 'free';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className={`${level > 0 ? 'ml-8 border-l-2 border-neutral-200 dark:border-neutral-700 pl-4' : ''}`}>
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-slate-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {comment.profiles?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-neutral-900 dark:text-white">
                  {comment.profiles?.name || 'Unknown User'}
                </span>
                <UserIdentityBadge user={{ tier: userTier }} size="sm" showTierName={false} />
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                <span>{formatDate(comment.created_at)}</span>
                {comment.is_edited && <span>• edited</span>}
              </div>
            </div>
          </div>
          
          {isAuthor && (
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 z-10 min-w-32">
                  <button
                    onClick={() => {
                      onEdit(comment);
                      setShowActions(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      onDelete(comment.id);
                      setShowActions(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 text-slate-600 dark:text-red-400 flex items-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <p className="text-neutral-700 dark:text-neutral-300 mb-3 whitespace-pre-wrap">
          {comment.comment_text}
        </p>
        
        {level < 2 && ( // Limit nesting to 2 levels
          <button
            onClick={() => onReply(comment.id)}
            className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:underline"
          >
            <Reply className="w-3 h-3" />
            Reply
          </button>
        )}
      </div>
      
      {/* Replies */}
      {comment.replies && comment.replies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          currentUserId={currentUserId}
          level={level + 1}
        />
      ))}
    </div>
  );
}

export default function PromptComments({ 
  promptId, 
  canComment = false, 
  className = '' 
}: PromptCommentsProps) {
  const { user } = useUser();
  const [comments, setComments] = useState<PromptComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<PromptComment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    loadComments();
    loadCommentCount();
  }, [promptId, user]);

  const loadComments = async () => {
    try {
      const commentsData = await promptComments.getPromptComments(
        promptId,
        user?.id
      );
      setComments(commentsData);
    } catch (error) {
      // Error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCommentCount = async () => {
    try {
      const count = await promptComments.getCommentCount(promptId);
      setCommentCount(count);
    } catch (error) {
      // Error('Error loading comment count:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast.error('Please sign in to comment');
      return;
    }

    if (!commentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setSubmitting(true);
    try {
      if (editingComment) {
        // Update existing comment
        const updatedComment = await promptComments.updateComment(
          editingComment.id,
          user.id,
          commentText
        );

        if (updatedComment) {
          // Update comment in the list
          setComments(prev => updateCommentInList(prev, updatedComment));
          toast.success('Comment updated');
          setEditingComment(null);
        } else {
          toast.error('Failed to update comment');
        }
      } else {
        // Add new comment
        const newComment = await promptComments.addComment(user.id, {
          prompt_id: promptId,
          comment_text: commentText,
          parent_comment_id: replyToId || undefined
        });

        if (newComment) {
          if (replyToId) {
            // Add as reply
            setComments(prev => addReplyToList(prev, replyToId, newComment));
          } else {
            // Add as top-level comment
            setComments(prev => [newComment, ...prev]);
          }
          setCommentCount(prev => prev + 1);
          toast.success('Comment added');
          setReplyToId(null);
        } else {
          toast.error('Failed to add comment');
        }
      }

      setCommentText('');
    } catch (error) {
      // Error('Error submitting comment:', error);
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (parentId: string) => {
    setReplyToId(parentId);
    setEditingComment(null);
    setCommentText('');
  };

  const handleEdit = (comment: PromptComment) => {
    setEditingComment(comment);
    setCommentText(comment.comment_text);
    setReplyToId(null);
  };

  const handleDelete = async (commentId: string) => {
    if (!user) return;

    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const success = await promptComments.deleteComment(commentId, user.id);
      
      if (success) {
        setComments(prev => removeCommentFromList(prev, commentId));
        setCommentCount(prev => Math.max(0, prev - 1));
        toast.success('Comment deleted');
      } else {
        toast.error('Failed to delete comment');
      }
    } catch (error) {
      // Error('Error deleting comment:', error);
      toast.error('Something went wrong');
    }
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setReplyToId(null);
    setCommentText('');
  };

  // Helper functions for updating comment list
  const updateCommentInList = (comments: PromptComment[], updatedComment: PromptComment): PromptComment[] => {
    return comments.map(comment => {
      if (comment.id === updatedComment.id) {
        return updatedComment;
      }
      if (comment.replies) {
        return {
          ...comment,
          replies: updateCommentInList(comment.replies, updatedComment)
        };
      }
      return comment;
    });
  };

  const addReplyToList = (comments: PromptComment[], parentId: string, reply: PromptComment): PromptComment[] => {
    return comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply]
        };
      }
      if (comment.replies) {
        return {
          ...comment,
          replies: addReplyToList(comment.replies, parentId, reply)
        };
      }
      return comment;
    });
  };

  const removeCommentFromList = (comments: PromptComment[], commentId: string): PromptComment[] => {
    return comments.filter(comment => {
      if (comment.id === commentId) {
        return false;
      }
      if (comment.replies) {
        comment.replies = removeCommentFromList(comment.replies, commentId);
      }
      return true;
    });
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-neutral-200 dark:bg-neutral-700 rounded-lg h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
          Comments ({commentCount})
        </h3>
      </div>

      {/* Comment Form */}
      {canComment && user && (
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 mb-6">
          {(replyToId || editingComment) && (
            <div className="flex items-center justify-between mb-3 text-sm text-slate-600 dark:text-slate-400">
              <span>
                {editingComment ? 'Editing comment' : 'Replying to comment'}
              </span>
              <button
                onClick={cancelEdit}
                className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                Cancel
              </button>
            </div>
          )}
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-slate-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user.user_metadata?.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={replyToId ? "Write a reply..." : "Share your thoughts about this prompt..."}
                className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-700 dark:text-white resize-none"
                rows={3}
                maxLength={1000}
              />
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {commentText.length}/1000
                </span>
                
                <Button
                  onClick={handleSubmitComment}
                  disabled={submitting || !commentText.trim()}
                  size="sm"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-1" />
                      {editingComment ? 'Update' : replyToId ? 'Reply' : 'Comment'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No comments yet.</p>
          {canComment && (
            <p className="text-sm">Be the first to share your thoughts!</p>
          )}
        </div>
      ) : (
        <div className="space-y-0">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}

      {!canComment && user && (
        <div className="text-center py-6 text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
          <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Purchase this prompt to join the conversation</p>
        </div>
      )}

      {!user && (
        <div className="text-center py-6 text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
          <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Sign in to read and write comments</p>
        </div>
      )}
    </div>
  );
}