import { Review } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";

interface RatingBreakdownProps {
    reviews: Review[];
}

export function RatingBreakdown({ reviews }: RatingBreakdownProps) {
    const totalReviews = reviews.length;

    if (totalReviews === 0) {
        return null;
    }

    // Calculate distribution
    const distribution = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
    };

    // Calculate category averages
    const categories = {
        staffing: 0,
        safety: 0,
        culture: 0,
        management: 0,
        pay_benefits: 0,
    };

    reviews.forEach((review) => {
        const roundedRating = Math.round(review.rating_overall) as 1 | 2 | 3 | 4 | 5;
        if (roundedRating >= 1 && roundedRating <= 5) {
            distribution[roundedRating]++;
        }

        categories.staffing += review.rating_staffing;
        categories.safety += review.rating_safety;
        categories.culture += review.rating_culture;
        categories.management += review.rating_management;
        categories.pay_benefits += review.rating_pay_benefits;
    });

    const categoryLabels: Record<keyof typeof categories, string> = {
        staffing: "Staffing",
        safety: "Safety",
        culture: "Culture",
        management: "Management",
        pay_benefits: "Pay & Benefits",
    };

    return (
        <div className="grid gap-8 md:grid-cols-2 p-6 bg-white rounded-lg border shadow-sm mb-8">
            {/* Rating Distribution */}
            <div>
                <h3 className="font-semibold mb-4">Rating Distribution</h3>
                <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((star) => {
                        const count = distribution[star as keyof typeof distribution];
                        const percentage = (count / totalReviews) * 100;
                        return (
                            <div key={star} className="flex items-center gap-3 text-sm">
                                <div className="flex items-center w-12 gap-1 font-medium">
                                    {star} <Star className="w-3 h-3 fill-current text-yellow-500" />
                                </div>
                                <Progress value={percentage} className="h-2" />
                                <div className="w-12 text-right text-muted-foreground">
                                    {Math.round(percentage)}%
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Category Breakdown */}
            <div>
                <h3 className="font-semibold mb-4">Category Breakdown</h3>
                <div className="space-y-4">
                    {(Object.keys(categories) as Array<keyof typeof categories>).map((key) => {
                        const average = categories[key] / totalReviews;
                        return (
                            <div key={key} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-muted-foreground">{categoryLabels[key]}</span>
                                    <span className="font-bold">{average.toFixed(1)}</span>
                                </div>
                                <Progress value={(average / 5) * 100} className="h-2" />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
