'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SaveReviewButtonProps {
  reviewId: string;
  initialSaved?: boolean;
  variant?: 'default' | 'icon';
  onSaveChange?: (saved: boolean) => void;
}

// Local storage key for saved reviews (demo mode)
const SAVED_REVIEWS_KEY = 'rate-my-hospitals-saved-reviews';

export function SaveReviewButton({
  reviewId,
  initialSaved = false,
  variant = 'icon',
  onSaveChange,
}: SaveReviewButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Check auth status
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);

      // Load saved state from localStorage (for demo)
      if (typeof window !== 'undefined') {
        const savedReviews = JSON.parse(localStorage.getItem(SAVED_REVIEWS_KEY) || '[]');
        setIsSaved(savedReviews.includes(reviewId));
      }
    };
    checkAuth();
  }, [supabase.auth, reviewId]);

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    setIsLoading(true);

    try {
      // For demo, use localStorage
      const savedReviews = JSON.parse(localStorage.getItem(SAVED_REVIEWS_KEY) || '[]');

      if (isSaved) {
        // Remove from saved
        const newSaved = savedReviews.filter((id: string) => id !== reviewId);
        localStorage.setItem(SAVED_REVIEWS_KEY, JSON.stringify(newSaved));
        setIsSaved(false);
        onSaveChange?.(false);
      } else {
        // Add to saved
        savedReviews.push(reviewId);
        localStorage.setItem(SAVED_REVIEWS_KEY, JSON.stringify(savedReviews));
        setIsSaved(true);
        onSaveChange?.(true);
      }

      // In production, this would be a Supabase call:
      // if (isSaved) {
      //   await supabase.from('saved_reviews').delete().eq('review_id', reviewId);
      // } else {
      //   await supabase.from('saved_reviews').insert({ review_id: reviewId });
      // }
    } catch {
      // Save failed — UI will revert optimistic update
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'icon') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 ${isSaved ? 'text-amber-500 hover:text-amber-600' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={handleToggleSave}
              disabled={isLoading}
            >
              {isSaved ? (
                <BookmarkCheck className="h-4 w-4 fill-current" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isSaved ? 'Remove from saved' : 'Save review'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      variant={isSaved ? 'secondary' : 'outline'}
      size="sm"
      className={`gap-2 ${isSaved ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : ''}`}
      onClick={handleToggleSave}
      disabled={isLoading}
    >
      {isSaved ? (
        <>
          <BookmarkCheck className="h-4 w-4" />
          Saved
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4" />
          Save
        </>
      )}
    </Button>
  );
}
