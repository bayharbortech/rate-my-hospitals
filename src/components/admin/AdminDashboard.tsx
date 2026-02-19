'use client'

import { useState } from 'react';
import { AIReviewResult } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { ErrorBanner } from '@/components/ui/error-banner';
import { ModerationSettings } from './ModerationSettings';
import { ModerationReviewCard, ReviewWithEmployer } from './ModerationReviewCard';

interface AdminDashboardProps {
    reviews: ReviewWithEmployer[];
}

const DEFAULT_COMMENT = 'Please review for editorial revision';

export function AdminDashboard({ reviews: initialReviews }: AdminDashboardProps) {
    const [reviews, setReviews] = useState(initialReviews);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [actionComment, setActionComment] = useState(DEFAULT_COMMENT);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState<string | null>(null);
    const [aiResults, setAiResults] = useState<Record<string, AIReviewResult>>({});
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter();

    const handleModerate = async (
        reviewId: string,
        status: 'approved' | 'rejected' | 'revision_requested'
    ) => {
        if ((status === 'rejected' || status === 'revision_requested') && !actionComment.trim()) {
            setErrorMessage('Please provide a comment when rejecting or requesting revision.');
            return;
        }

        setActionLoading(reviewId);
        setErrorMessage(null);

        try {
            const res = await fetch(`/api/reviews/${reviewId}/moderate`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status,
                    admin_comment: actionComment.trim() || undefined,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to moderate review');
            }

            setReviews(prev => prev.filter(r => r.id !== reviewId));
            setExpandedId(null);
            setActionComment(DEFAULT_COMMENT);
            router.refresh();
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Failed to moderate review');
        } finally {
            setActionLoading(null);
        }
    };

    const handleAIReview = async (reviewId: string) => {
        setAiLoading(reviewId);
        setErrorMessage(null);

        try {
            const res = await fetch(`/api/reviews/${reviewId}/ai-review`, {
                method: 'POST',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'AI review failed');
            }

            const result: AIReviewResult = await res.json();
            setAiResults(prev => ({ ...prev, [reviewId]: result }));
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'AI review failed');
        } finally {
            setAiLoading(null);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedId(prev => prev === id ? null : id);
        setActionComment(DEFAULT_COMMENT);
    };

    return (
        <div className="space-y-4">
            <ModerationSettings onError={setErrorMessage} />

            {reviews.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    No pending reviews. All caught up!
                </div>
            ) : (
                <>
                    <ErrorBanner message={errorMessage} />

                    <p className="text-sm text-muted-foreground">
                        Sorted oldest first. Review queue ages from green (new) to red (overdue).
                    </p>

                    {reviews.map(review => {
                        const aiResult = aiResults[review.id] || review.ai_review_result as AIReviewResult | null;

                        return (
                            <ModerationReviewCard
                                key={review.id}
                                review={review}
                                aiResult={aiResult}
                                isExpanded={expandedId === review.id}
                                isLoading={actionLoading === review.id}
                                isAiLoading={aiLoading === review.id}
                                actionComment={actionComment}
                                onToggleExpand={() => toggleExpand(review.id)}
                                onModerate={(status) => handleModerate(review.id, status)}
                                onAIReview={() => handleAIReview(review.id)}
                                onCommentChange={setActionComment}
                            />
                        );
                    })}
                </>
            )}
        </div>
    );
}
