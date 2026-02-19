import { Review, AIReviewResult } from '@/lib/types';
import { formatDate } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
    Check, X, RotateCcw, Bot, Loader2,
    ChevronDown, ChevronUp, Star,
} from 'lucide-react';
import { RiskBadge, RecommendationBadge } from './RiskBadge';
import { AIResultPanel } from './AIResultPanel';

export interface ReviewWithEmployer extends Review {
    employer: { name: string };
}

interface AgingInfo {
    label: string;
    color: string;
    bgColor: string;
}

export function getAgingInfo(createdAt: string): AgingInfo {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 24) {
        return { label: 'New', color: 'text-green-700', bgColor: 'bg-green-100' };
    } else if (diffDays <= 3) {
        return { label: `${diffDays}d ago`, color: 'text-yellow-700', bgColor: 'bg-yellow-100' };
    } else if (diffDays <= 7) {
        return { label: `${diffDays}d ago`, color: 'text-orange-700', bgColor: 'bg-orange-100' };
    } else {
        return { label: `${diffDays}d ago`, color: 'text-red-700', bgColor: 'bg-red-100' };
    }
}

interface ModerationReviewCardProps {
    review: ReviewWithEmployer;
    aiResult: AIReviewResult | null | undefined;
    isExpanded: boolean;
    isLoading: boolean;
    isAiLoading: boolean;
    actionComment: string;
    onToggleExpand: () => void;
    onModerate: (status: 'approved' | 'rejected' | 'revision_requested') => void;
    onAIReview: () => void;
    onCommentChange: (value: string) => void;
}

export function ModerationReviewCard({
    review,
    aiResult,
    isExpanded,
    isLoading,
    isAiLoading,
    actionComment,
    onToggleExpand,
    onModerate,
    onAIReview,
    onCommentChange,
}: ModerationReviewCardProps) {
    const aging = getAgingInfo(review.created_at);

    const riskBorder = aiResult
        ? aiResult.risk_level === 'high'
            ? 'border-l-4 border-l-red-400'
            : aiResult.risk_level === 'medium'
                ? 'border-l-4 border-l-yellow-400'
                : 'border-l-4 border-l-green-400'
        : '';

    return (
        <Card className={`${riskBorder} ${isExpanded ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader className="pb-2">
                <div
                    className="flex justify-between items-start cursor-pointer"
                    onClick={onToggleExpand}
                >
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <CardTitle className="text-lg truncate">{review.employer.name}</CardTitle>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${aging.bgColor} ${aging.color}`}>
                                {aging.label}
                            </span>
                            {aiResult && <RiskBadge level={aiResult.risk_level} />}
                            {aiResult && <RecommendationBadge recommendation={aiResult.recommendation} />}
                            {!aiResult && (
                                <Badge variant="outline" className="text-xs text-slate-400 border-slate-300">
                                    <Bot className="w-3 h-3 mr-1" />No AI Review
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">{review.title}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {!isExpanded && aiResult && aiResult.recommendation === 'approve' && (
                            <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={(e) => { e.stopPropagation(); onModerate('approved'); }}
                                disabled={isLoading}
                            >
                                <Check className="h-4 w-4 mr-1" /> Approve
                            </Button>
                        )}
                        {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {!isExpanded && (
                    <div className="space-y-2">
                        {aiResult?.summary && (
                            <p className="text-xs text-slate-600 italic">{aiResult.summary}</p>
                        )}
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div>Overall: {review.rating_overall}/5</div>
                            <div>Submitted: {formatDate(review.created_at, 'short')}</div>
                        </div>
                    </div>
                )}

                {isExpanded && (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm whitespace-pre-wrap">{review.review_text}</p>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                            {[
                                { label: 'Overall', value: review.rating_overall },
                                { label: 'Staffing', value: review.rating_staffing },
                                { label: 'Safety', value: review.rating_safety },
                                { label: 'Culture', value: review.rating_culture },
                                { label: 'Management', value: review.rating_management },
                                { label: 'Pay', value: review.rating_pay_benefits },
                            ].map(r => (
                                <div key={r.label} className="flex items-center justify-between bg-slate-50 rounded px-3 py-2">
                                    <span className="text-muted-foreground">{r.label}</span>
                                    <div className="flex items-center gap-1">
                                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                        <span className="font-medium">{r.value}/5</span>
                                    </div>
                                </div>
                            ))}
                            {review.rating_cattiness && (
                                <div className="flex items-center justify-between bg-slate-50 rounded px-3 py-2">
                                    <span className="text-muted-foreground">Cattiness</span>
                                    <span className="font-medium">{review.rating_cattiness}/5</span>
                                </div>
                            )}
                            {review.patient_load && (
                                <div className="flex items-center justify-between bg-slate-50 rounded px-3 py-2">
                                    <span className="text-muted-foreground">Patient Load</span>
                                    <span className="font-medium">{review.patient_load}</span>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div>Department: {review.department || 'Not specified'}</div>
                            <div>Position: {review.position_type || 'Not specified'}</div>
                            <div>Submitted: {formatDate(review.created_at, 'short')}</div>
                        </div>

                        <Separator />

                        <div>
                            {!aiResult && (
                                <Button
                                    variant="outline"
                                    onClick={onAIReview}
                                    disabled={isAiLoading}
                                    className="gap-2"
                                >
                                    {isAiLoading ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" /> Running AI Review...</>
                                    ) : (
                                        <><Bot className="h-4 w-4" /> Run AI Compliance Review</>
                                    )}
                                </Button>
                            )}
                            {aiResult && <AIResultPanel result={aiResult} />}
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Admin Comment (required for reject/revision)</label>
                            <Textarea
                                placeholder="Provide feedback to the reviewer..."
                                value={actionComment}
                                onChange={(e) => onCommentChange(e.target.value)}
                                className="min-h-[80px]"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                size="sm"
                                className={aiResult?.recommendation === 'approve'
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                                onClick={() => onModerate('approved')}
                                disabled={isLoading || aiResult?.recommendation !== 'approve'}
                                title={aiResult?.recommendation !== 'approve'
                                    ? 'AI must recommend Approve before this review can be approved'
                                    : undefined}
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                                Approve
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                onClick={() => onModerate('revision_requested')}
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RotateCcw className="h-4 w-4 mr-1" />}
                                Request Revision
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => onModerate('rejected')}
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <X className="h-4 w-4 mr-1" />}
                                Reject
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
