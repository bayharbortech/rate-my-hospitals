import { Star, StarHalf } from 'lucide-react';

interface RatingStarsProps {
    rating: number;
    max?: number;
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
}

export function RatingStars({ rating, max = 5, size = 'md', showValue = false }: RatingStarsProps) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = max - fullStars - (hasHalfStar ? 1 : 0);

    const sizeClasses = {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5'
    };

    return (
        <div className="flex items-center gap-1">
            <div className="flex text-yellow-500">
                {[...Array(fullStars)].map((_, i) => (
                    <Star key={`full-${i}`} className={`${sizeClasses[size]} fill-current`} />
                ))}
                {hasHalfStar && (
                    <div className="relative">
                        <StarHalf className={`${sizeClasses[size]} fill-current`} />
                    </div>
                )}
                {[...Array(emptyStars)].map((_, i) => (
                    <Star key={`empty-${i}`} className={`${sizeClasses[size]} text-muted`} />
                ))}
            </div>
            {showValue && (
                <span className="ml-1 text-sm font-medium text-muted-foreground">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
}
