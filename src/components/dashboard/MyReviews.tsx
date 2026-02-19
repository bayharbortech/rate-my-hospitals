'use client'

import { Review, Employer } from '@/lib/types';
import { formatDate } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, CheckCircle, XCircle } from 'lucide-react';

interface MyReviewsProps {
    reviews: (Review & { employer: Employer })[];
}

export function MyReviews({ reviews }: MyReviewsProps) {
    if (reviews.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                <p>You haven't submitted any reviews yet.</p>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
            case 'rejected':
                return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
            default:
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
        }
    };

    return (
        <div className="space-y-4">
            {reviews.map(review => (
                <Card key={review.id}>
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-lg">{review.employer.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">{review.title}</p>
                            </div>
                            <div>
                                {getStatusBadge(review.status)}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-4 w-4 ${star <= review.rating_overall ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`}
                                />
                            ))}
                            <span className="text-sm text-muted-foreground ml-2">
                                {formatDate(review.created_at, 'short')}
                            </span>
                        </div>
                        <p className="text-sm text-slate-700">{review.review_text}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
