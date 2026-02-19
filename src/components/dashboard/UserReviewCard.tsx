'use client';

import { useState } from 'react';
import { Review, AIReviewResult } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Star,
    TrendingUp,
    Building2,
    MessageCircle,
    Bot,
    Check,
    Pencil,
    Trash2,
    Loader2,
    AlertTriangle,
    ShieldCheck,
    ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';
import { ErrorBanner } from '@/components/ui/error-banner';
import { useRouter } from 'next/navigation';

interface ReviewWithEmployerName extends Review {
    employer: { name: string };
}

interface UserReviewCardProps {
    review: ReviewWithEmployerName;
    getStatusBadge: (status: string) => React.ReactNode;
    formatDate: (date: string) => string;
}

export function UserReviewCard({ review, getStatusBadge, formatDate }: UserReviewCardProps) {
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(review.title);
    const [editText, setEditText] = useState(review.review_text);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const needsAction = review.status === 'revision_requested' || review.status === 'rejected';
    const aiResult = review.ai_review_result as AIReviewResult | undefined;

    const handleAcceptAISuggestions = () => {
        if (aiResult) {
            setEditTitle(aiResult.revised_title);
            setEditText(aiResult.revised_text);
            setEditing(true);
        }
    };

    const handleResubmit = async () => {
        if (!editTitle.trim() || !editText.trim()) {
            setError('Title and review text are required.');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch(`/api/reviews/${review.id}/revise`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editTitle.trim(),
                    review_text: editText.trim(),
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to resubmit');
            }

            setEditing(false);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to resubmit');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`/api/reviews/${review.id}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete');
            }
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        } finally {
            setDeleting(false);
            setDeleteDialogOpen(false);
        }
    };

    return (
        <div className={`border rounded-lg p-4 transition-colors ${needsAction ? 'border-orange-300 bg-orange-50/50' : 'hover:bg-slate-50'}`}>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <Link href={`/employers/${review.employer_id}`} className="font-semibold text-lg hover:text-teal-600">
                        {review.employer?.name || 'Unknown Hospital'}
                    </Link>
                    <p className="text-sm text-muted-foreground">{review.title}</p>
                </div>
                {getStatusBadge(review.status)}
            </div>

            <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${star <= review.rating_overall ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`}
                    />
                ))}
                <span className="text-sm text-muted-foreground ml-2">
                    {formatDate(review.created_at)}
                </span>
            </div>

            <p className="text-sm text-slate-700 line-clamp-2">{review.review_text}</p>

            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" /> {review.helpful_votes_up} found helpful
                </span>
                {review.department && (
                    <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" /> {review.department}
                    </span>
                )}
            </div>

            {/* Admin feedback section */}
            {needsAction && review.admin_comment && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                        <MessageCircle className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-semibold text-orange-800">Reviewer Feedback</span>
                    </div>
                    <p className="text-sm text-slate-700">{review.admin_comment}</p>
                </div>
            )}

            {/* AI suggestions section */}
            {needsAction && aiResult && aiResult.issues.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-800">AI Compliance Review</span>
                        {aiResult.risk_level === 'low' && <Badge className="bg-green-100 text-green-700 text-xs"><ShieldCheck className="w-3 h-3 mr-1" />Low Risk</Badge>}
                        {aiResult.risk_level === 'medium' && <Badge className="bg-yellow-100 text-yellow-700 text-xs"><AlertTriangle className="w-3 h-3 mr-1" />Medium Risk</Badge>}
                        {aiResult.risk_level === 'high' && <Badge className="bg-red-100 text-red-700 text-xs"><ShieldAlert className="w-3 h-3 mr-1" />High Risk</Badge>}
                    </div>
                    <p className="text-sm text-blue-800 mb-2">{aiResult.summary}</p>
                    {aiResult.issues.map((issue, i) => (
                        <div key={i} className="text-xs text-slate-600 mb-1">
                            <span className="font-medium capitalize">{issue.type}:</span> {issue.explanation}
                        </div>
                    ))}
                    {aiResult.revised_text && (
                        <div className="mt-2 p-2 bg-white rounded border text-sm">
                            <p className="font-medium text-xs text-blue-700 mb-1">Suggested revision:</p>
                            <p className="text-slate-700 text-xs">{aiResult.revised_text.slice(0, 200)}...</p>
                        </div>
                    )}
                </div>
            )}

            {/* Edit form */}
            {editing && (
                <div className="mt-4 space-y-3 p-4 bg-white rounded-lg border">
                    <div>
                        <label className="text-sm font-medium">Title</label>
                        <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Review</label>
                        <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="mt-1 min-h-[120px]"
                        />
                    </div>
                    <ErrorBanner message={error} />
                    <div className="flex gap-2">
                        <Button size="sm" onClick={handleResubmit} disabled={submitting}>
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />}
                            Resubmit for Review
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setEditing(false); setEditTitle(review.title); setEditText(review.review_text); }}>
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            {/* Action buttons for reviews needing attention */}
            {needsAction && !editing && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {review.status === 'revision_requested' && aiResult?.revised_text && (
                        <Button size="sm" variant="outline" onClick={handleAcceptAISuggestions} className="gap-1">
                            <Bot className="w-4 h-4" /> Accept AI Suggestions
                        </Button>
                    )}
                    {review.status === 'revision_requested' && (
                        <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="gap-1">
                            <Pencil className="w-4 h-4" /> Edit & Resubmit
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
                        onClick={() => setDeleteDialogOpen(true)}
                    >
                        <Trash2 className="w-4 h-4" /> Delete Review
                    </Button>
                </div>
            )}

            {!editing && <ErrorBanner message={error} className="mt-2" />}

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Review</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to permanently delete this review? This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleting}
                        >
                            {deleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
