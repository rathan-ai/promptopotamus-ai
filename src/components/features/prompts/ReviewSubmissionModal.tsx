'use client';

import { useState } from 'react';
import { Star, X, MessageSquare, ThumbsUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface ReviewSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptId: number;
  promptTitle: string;
  onReviewSubmitted: () => void;
  existingReview?: {
    id: string;
    rating: number;
    review_text: string;
  };
}

export default function ReviewSubmissionModal({
  isOpen,
  onClose,
  promptId,
  promptTitle,
  onReviewSubmitted,
  existingReview
}: ReviewSubmissionModalProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState(existingReview?.review_text || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (reviewText.trim().length < 10) {
      toast.error('Please write at least 10 characters for your review');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const method = existingReview ? 'PUT' : 'POST';
      const response = await fetch('/api/smart-prompts/reviews', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId,
          rating,
          reviewText: reviewText.trim(),
          ...(existingReview && { reviewId: existingReview.id })
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(existingReview ? 'Review updated successfully!' : 'Review submitted successfully!');
        onReviewSubmitted();
        onClose();
        // Reset form
        setRating(0);
        setReviewText('');
      } else {
        toast.error(result.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Error submitting review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div>
            <h2 className="text-xl font-semibold dark:text-white">
              {existingReview ? 'Update Review' : 'Write a Review'}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {promptTitle}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rating Section */}
          <div>
            <label className="block text-sm font-medium dark:text-white mb-3">
              Your Rating *
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 hover:scale-110 transition-transform"
                  disabled={isSubmitting}
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-slate-400 text-slate-400'
                        : 'text-neutral-300 dark:text-neutral-600'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            )}
          </div>

          {/* Review Text */}
          <div>
            <label htmlFor="reviewText" className="block text-sm font-medium dark:text-white mb-2">
              Your Review *
            </label>
            <textarea
              id="reviewText"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this Smart Prompt. How did it help you? What made it useful?"
              rows={5}
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 px-3 py-2 text-sm placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
              minLength={10}
              maxLength={1000}
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {reviewText.length}/1000 characters (minimum 10)
            </p>
          </div>

          {/* Guidelines */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-start">
              <MessageSquare className="w-5 h-5 text-slate-600 dark:text-slate-400 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Review Guidelines
                </h4>
                <ul className="text-xs text-slate-700 dark:text-blue-300 mt-1 space-y-1">
                  <li>• Focus on how the prompt helped you achieve your goals</li>
                  <li>• Mention specific use cases or scenarios where it worked well</li>
                  <li>• Be honest and constructive in your feedback</li>
                  <li>• Avoid personal information or off-topic content</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0 || reviewText.trim().length < 10}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {existingReview ? 'Updating...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  {existingReview ? 'Update Review' : 'Submit Review'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}