'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSavedStore } from '@/stores/useSavedStore';

interface SaveReviewButtonProps {
  reviewId: string;
  initialSaved?: boolean;
  variant?: 'default' | 'icon';
  onSaveChange?: (saved: boolean) => void;
}

export function SaveReviewButton({
  reviewId,
  variant = 'icon',
  onSaveChange,
}: SaveReviewButtonProps) {
  const { user, fetchUser } = useAuthStore();
  const { isReviewSaved, toggleReview } = useSavedStore();
  const isSaved = isReviewSaved(reviewId);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const handleToggleSave = () => {
    if (!user) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    toggleReview(reviewId);
    onSaveChange?.(!isSaved);
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
