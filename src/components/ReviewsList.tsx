'use client';

import { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageSquare, Calendar, User, Edit3, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import ReviewSubmissionModal from './ReviewSubmissionModal';

interface Review {
  id: string;
  rating: number;
  review_text: string;
  helpful_votes: number;
  created_at: string;
  reviewer_id: string;
  profiles?: {
    full_name: string;
  };
  is_own_review?: boolean;
}

interface ReviewsListProps {
  promptId: number;
  promptTitle: string;
  canReview: boolean;
  currentUserId?: string;
  onReviewsChange?: (reviews: Review[]) => void;
}

export default function ReviewsList({ 
  promptId, 
  promptTitle, 
  canReview, 
  currentUserId,
  onReviewsChange 
}: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [helpfulLoading, setHelpfulLoading] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/smart-prompts/reviews?promptId=${promptId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        onReviewsChange?.(data.reviews || []);
      } else {
        console.error('Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [promptId]);

  const handleReviewSubmitted = () => {
    fetchReviews();
    setEditingReview(null);
  };

  const handleHelpfulVote = async (reviewId: string) => {
    if (!currentUserId) {
      toast.error('Please log in to vote on reviews');
      return;
    }

    setHelpfulLoading(reviewId);
    try {
      const response = await fetch(`/api/smart-prompts/reviews/helpful`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId }),
      });

      const result = await response.json();
      
      if (response.ok) {
        toast.success('Thank you for your feedback!');
        fetchReviews(); // Refresh to get updated helpful votes
      } else {
        toast.error(result.error || 'Failed to record helpful vote');
      }
    } catch (error) {
      console.error('Error voting on review:', error);
      toast.error('Error recording vote');
    } finally {
      setHelpfulLoading(null);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete your review? This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(reviewId);
    try {
      const response = await fetch('/api/smart-prompts/reviews', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId }),
      });

      const result = await response.json();
      
      if (response.ok) {
        toast.success('Review deleted successfully');
        fetchReviews();
      } else {
        toast.error(result.error || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Error deleting review');
    } finally {
      setDeleteLoading(null);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-neutral-300 dark:text-neutral-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const userReview = reviews.find(review => review.is_own_review);
  const otherReviews = reviews.filter(review => !review.is_own_review);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      {reviews.length > 0 && (
        <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold dark:text-white">
                  {(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)}
                </div>
                {renderStars(Math.round(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length), 'md')}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Write Review Button */}
      {canReview && !userReview && (
        <Button
          onClick={() => setShowReviewModal(true)}
          className="w-full flex items-center justify-center"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Write a Review
        </Button>
      )}

      {/* User's Review */}
      {userReview && (
        <div className="border-2 border-blue-200 dark:border-blue-700 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium dark:text-white">Your Review</span>
                {renderStars(userReview.rating)}
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {new Date(userReview.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditingReview(userReview);
                  setShowReviewModal(true);
                }}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteReview(userReview.id)}
                disabled={deleteLoading === userReview.id}
              >
                {deleteLoading === userReview.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          <p className="text-sm dark:text-neutral-300 mb-3">{userReview.review_text}</p>
          <div className="flex items-center text-xs text-neutral-600 dark:text-neutral-400">
            <ThumbsUp className="w-3 h-3 mr-1" />
            {userReview.helpful_votes} found this helpful
          </div>
        </div>
      )}

      {/* Other Reviews */}
      {otherReviews.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold dark:text-white">
            {userReview ? 'Other Reviews' : 'Reviews'}
          </h4>
          {otherReviews.map((review) => (
            <div key={review.id} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium dark:text-white">
                        {review.profiles?.full_name || 'Anonymous User'}
                      </span>
                      {renderStars(review.rating)}
                    </div>
                    <div className="flex items-center text-xs text-neutral-600 dark:text-neutral-400 gap-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm dark:text-neutral-300 mb-3">{review.review_text}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-neutral-600 dark:text-neutral-400">
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  {review.helpful_votes} found this helpful
                </div>
                
                {currentUserId && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleHelpfulVote(review.id)}
                    disabled={helpfulLoading === review.id}
                    className="text-xs"
                  >
                    {helpfulLoading === review.id ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <ThumbsUp className="w-3 h-3 mr-1" />
                    )}
                    Helpful
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Reviews State */}
      {reviews.length === 0 && (
        <div className="text-center py-8">
          <MessageSquare className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold dark:text-white mb-2">No Reviews Yet</h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Be the first to share your experience with this Smart Prompt.
          </p>
          {canReview && (
            <Button onClick={() => setShowReviewModal(true)}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Write the First Review
            </Button>
          )}
        </div>
      )}

      {/* Review Submission Modal */}
      <ReviewSubmissionModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setEditingReview(null);
        }}
        promptId={promptId}
        promptTitle={promptTitle}
        onReviewSubmitted={handleReviewSubmitted}
        existingReview={editingReview || undefined}
      />
    </div>
  );
}