'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface HelpfulnessVotingProps {
    reviewId: string;
    initialUpvotes: number;
    initialDownvotes: number;
}

export function HelpfulnessVoting({ reviewId, initialUpvotes, initialDownvotes }: HelpfulnessVotingProps) {
    const [upvotes, setUpvotes] = useState(initialUpvotes);
    const [downvotes, setDownvotes] = useState(initialDownvotes);
    const [userVote, setUserVote] = useState<'helpful' | 'not_helpful' | null>(null);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        checkUserVote();
    }, []);

    const checkUserVote = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('review_votes')
            .select('vote_type')
            .eq('review_id', reviewId)
            .eq('user_id', user.id)
            .single();

        if (data) {
            setUserVote(data.vote_type as 'helpful' | 'not_helpful');
        }
    };

    const handleVote = async (type: 'helpful' | 'not_helpful') => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/login');
            setLoading(false);
            return;
        }

        // Optimistic update
        const previousVote = userVote;
        const previousUp = upvotes;
        const previousDown = downvotes;

        if (userVote === type) {
            // Remove vote
            setUserVote(null);
            if (type === 'helpful') setUpvotes(p => p - 1);
            else setDownvotes(p => p - 1);

            const { error } = await supabase
                .from('review_votes')
                .delete()
                .eq('review_id', reviewId)
                .eq('user_id', user.id);

            if (error) {
                // Revert
                setUserVote(previousVote);
                setUpvotes(previousUp);
                setDownvotes(previousDown);
            }
        } else {
            // Change or Add vote
            setUserVote(type);
            if (type === 'helpful') {
                setUpvotes(p => p + 1);
                if (previousVote === 'not_helpful') setDownvotes(p => p - 1);
            } else {
                setDownvotes(p => p + 1);
                if (previousVote === 'helpful') setUpvotes(p => p - 1);
            }

            const { error } = await supabase
                .from('review_votes')
                .upsert({
                    review_id: reviewId,
                    user_id: user.id,
                    vote_type: type
                });

            if (error) {
                // Revert
                setUserVote(previousVote);
                setUpvotes(previousUp);
                setDownvotes(previousDown);
            }
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="ghost"
                size="sm"
                className={`gap-1 ${userVote === 'helpful' ? 'text-green-600 bg-green-50' : 'text-slate-500'}`}
                onClick={() => handleVote('helpful')}
                disabled={loading}
            >
                <ThumbsUp className="w-4 h-4" />
                <span>{upvotes}</span>
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className={`gap-1 ${userVote === 'not_helpful' ? 'text-red-600 bg-red-50' : 'text-slate-500'}`}
                onClick={() => handleVote('not_helpful')}
                disabled={loading}
            >
                <ThumbsDown className="w-4 h-4" />
                <span>{downvotes}</span>
            </Button>
        </div>
    );
}
