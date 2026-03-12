'use client'

import { useState, useMemo } from 'react';
import { Review } from '@/lib/types';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star } from 'lucide-react';

interface ReviewsListProps {
    reviews: Review[];
    employerId: string;
}

type SortOption = 'newest' | 'highest_rated' | 'lowest_rated' | 'most_helpful';

export function ReviewsList({ reviews, employerId }: ReviewsListProps) {
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [filterRating, setFilterRating] = useState<number | null>(null);

    const filteredAndSortedReviews = useMemo(() => {
        let result = [...reviews];

        // Filter
        if (filterRating) {
            result = result.filter(r => r.rating_overall === filterRating);
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'highest_rated':
                    return b.rating_overall - a.rating_overall;
                case 'lowest_rated':
                    return a.rating_overall - b.rating_overall;
                case 'most_helpful':
                    return (b.helpful_votes_up || 0) - (a.helpful_votes_up || 0);
                default:
                    return 0;
            }
        });

        return result;
    }, [reviews, sortBy, filterRating]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
                    <div className="flex gap-1">
                        <Button
                            variant={filterRating === null ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setFilterRating(null)}
                        >
                            All
                        </Button>
                        {[5, 4, 3, 2, 1].map((star) => (
                            <Button
                                key={star}
                                variant={filterRating === star ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setFilterRating(filterRating === star ? null : star)}
                                className="gap-1"
                            >
                                {star} <Star className="w-3 h-3 fill-current" />
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Most Recent</SelectItem>
                            <SelectItem value="most_helpful">Most Helpful</SelectItem>
                            <SelectItem value="highest_rated">Highest Rated</SelectItem>
                            <SelectItem value="lowest_rated">Lowest Rated</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-6">
                {filteredAndSortedReviews.length > 0 ? (
                    filteredAndSortedReviews.map(review => (
                        <ReviewCard key={review.id} review={review} />
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                        <h3 className="text-lg font-medium mb-2">No reviews found</h3>
                        <p className="text-muted-foreground mb-6">Try adjusting your filters.</p>
                        <Button variant="outline" onClick={() => setFilterRating(null)}>
                            Clear Filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
