'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { Bell, BellOff, Share2, Check, Link as LinkIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/useAuthStore';

interface EmployerActionsProps {
  employerId: string;
  employerName: string;
}

export function EmployerActions({ employerId, employerName }: EmployerActionsProps) {
  const [showCopied, setShowCopied] = useState(false);
  const { user, fetchUser } = useAuthStore();
  const router = useRouter();
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: isFollowing = false, isLoading: isCheckingFollow } = useQuery({
    queryKey: ['follow-status', employerId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from('saved_hospitals')
        .select('id')
        .eq('user_id', user.id)
        .eq('employer_id', employerId)
        .single();
      return !!data;
    },
    enabled: !!user,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      if (isFollowing) {
        await supabase
          .from('saved_hospitals')
          .delete()
          .eq('user_id', user.id)
          .eq('employer_id', employerId);
      } else {
        await supabase
          .from('saved_hospitals')
          .insert({
            user_id: user.id,
            employer_id: employerId,
            notify_new_reviews: true,
          });
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['follow-status', employerId, user?.id] });
      const previous = queryClient.getQueryData(['follow-status', employerId, user?.id]);
      queryClient.setQueryData(['follow-status', employerId, user?.id], !isFollowing);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['follow-status', employerId, user?.id], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-status', employerId, user?.id] });
    },
  });

  // Initialize auth
  useState(() => { fetchUser(); });

  const handleFollow = () => {
    if (!user) {
      router.push(`/login?redirect=/employers/${employerId}`);
      return;
    }
    followMutation.mutate();
  };

  const handleShare = async (method: 'native' | 'copy' | 'twitter' | 'facebook' | 'email') => {
    const url = window.location.href;
    const title = `${employerName} - Rate My Hospitals`;
    const text = `Check out reviews for ${employerName} on Rate My Hospitals`;

    switch (method) {
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({ title, text, url });
          } catch (error) {
            if ((error as Error).name !== 'AbortError') {
              copyToClipboard(url);
            }
          }
        } else {
          copyToClipboard(url);
        }
        break;
      case 'copy':
        copyToClipboard(url);
        break;
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          '_blank', 'width=550,height=420'
        );
        break;
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank', 'width=550,height=420'
        );
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`;
        break;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch {
      // Clipboard write not supported
    }
  };

  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="flex gap-2">
      <Button
        variant={isFollowing ? 'default' : 'outline'}
        className={`flex-1 ${isFollowing ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
        onClick={handleFollow}
        disabled={followMutation.isPending || isCheckingFollow}
      >
        {isFollowing ? (
          <><BellOff className="h-4 w-4 mr-2" /> Following</>
        ) : (
          <><Bell className="h-4 w-4 mr-2" /> Follow</>
        )}
      </Button>

      {hasNativeShare ? (
        <Button variant="outline" className="flex-1" onClick={() => handleShare('native')}>
          {showCopied ? (
            <><Check className="h-4 w-4 mr-2" /> Copied!</>
          ) : (
            <><Share2 className="h-4 w-4 mr-2" /> Share</>
          )}
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex-1">
              {showCopied ? (
                <><Check className="h-4 w-4 mr-2" /> Copied!</>
              ) : (
                <><Share2 className="h-4 w-4 mr-2" /> Share</>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => handleShare('copy')}>
              <LinkIcon className="h-4 w-4 mr-2" /> Copy link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare('twitter')}>
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share on X
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare('facebook')}>
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Share on Facebook
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare('email')}>
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Share via Email
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
