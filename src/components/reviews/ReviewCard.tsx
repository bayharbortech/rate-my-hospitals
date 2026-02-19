import { Review } from '@/lib/types';
import { formatDate } from '@/lib/constants';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RatingStars } from '@/components/reviews/RatingStars';
import { HelpfulnessVoting } from '@/components/reviews/HelpfulnessVoting';
import { SaveReviewButton } from '@/components/reviews/SaveReviewButton';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface ReviewCardProps {
    review: Review;
    showSaveButton?: boolean;
}

export function ReviewCard({ review, showSaveButton = true }: ReviewCardProps) {
    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <h4 className="font-bold text-lg">{review.title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{review.position_type}</span>
                            <span>•</span>
                            <span>{review.department}</span>
                            <span>•</span>
                            <span>{review.work_timeframe.replace(/_/g, ' ')}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {showSaveButton && <SaveReviewButton reviewId={review.id} />}
                        <div className="flex flex-col items-end gap-1">
                            <RatingStars rating={review.rating_overall} showValue />
                            <span className="text-xs text-muted-foreground">{formatDate(review.created_at, 'short')}</span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <p className="text-sm leading-relaxed">{review.review_text}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 text-sm mb-4">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Staffing</span>
                        <RatingStars rating={review.rating_staffing} size="sm" />
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Safety</span>
                        <RatingStars rating={review.rating_safety} size="sm" />
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Culture</span>
                        <RatingStars rating={review.rating_culture} size="sm" />
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Management</span>
                        <RatingStars rating={review.rating_management} size="sm" />
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Pay</span>
                        <RatingStars rating={review.rating_pay_benefits} size="sm" />
                    </div>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {review.verification_level === 'verified' ? (
                            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Verified Nurse
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="text-muted-foreground">
                                <AlertCircle className="h-3 w-3 mr-1" /> Unverified
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <HelpfulnessVoting
                            reviewId={review.id}
                            initialUpvotes={review.helpful_votes_up || 0}
                            initialDownvotes={review.helpful_votes_down || 0}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
