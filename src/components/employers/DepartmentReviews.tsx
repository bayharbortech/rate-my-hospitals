'use client';

import { useState, useMemo } from 'react';
import { formatDate } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Star,
  Users,
  Shield,
  Heart,
  UserCog,
  DollarSign,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
  ThumbsUp
} from 'lucide-react';
import { Review } from '@/lib/types';

interface DepartmentReviewsProps {
  reviews: Review[];
  employerName: string;
}

interface DepartmentStats {
  name: string;
  count: number;
  overall: number;
  staffing: number;
  safety: number;
  culture: number;
  management: number;
  pay_benefits: number;
  reviews: Review[];
}

export function DepartmentReviews({ reviews, employerName }: DepartmentReviewsProps) {
  const [expandedDepartment, setExpandedDepartment] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'count' | 'rating'>('count');

  // Calculate stats by department
  const departmentStats = useMemo(() => {
    const deptMap = new Map<string, Review[]>();

    reviews.forEach(review => {
      const dept = review.department || 'General';
      if (!deptMap.has(dept)) {
        deptMap.set(dept, []);
      }
      deptMap.get(dept)!.push(review);
    });

    const stats: DepartmentStats[] = [];

    deptMap.forEach((deptReviews, name) => {
      const count = deptReviews.length;
      stats.push({
        name,
        count,
        overall: deptReviews.reduce((acc, r) => acc + r.rating_overall, 0) / count,
        staffing: deptReviews.reduce((acc, r) => acc + r.rating_staffing, 0) / count,
        safety: deptReviews.reduce((acc, r) => acc + r.rating_safety, 0) / count,
        culture: deptReviews.reduce((acc, r) => acc + r.rating_culture, 0) / count,
        management: deptReviews.reduce((acc, r) => acc + r.rating_management, 0) / count,
        pay_benefits: deptReviews.reduce((acc, r) => acc + r.rating_pay_benefits, 0) / count,
        reviews: deptReviews
      });
    });

    // Sort
    if (sortBy === 'count') {
      stats.sort((a, b) => b.count - a.count);
    } else {
      stats.sort((a, b) => b.overall - a.overall);
    }

    return stats;
  }, [reviews, sortBy]);

  // Calculate hospital-wide averages for comparison
  const hospitalAvg = useMemo(() => {
    if (reviews.length === 0) return { overall: 0, staffing: 0, safety: 0, culture: 0, management: 0, pay_benefits: 0 };
    const count = reviews.length;
    return {
      overall: reviews.reduce((acc, r) => acc + r.rating_overall, 0) / count,
      staffing: reviews.reduce((acc, r) => acc + r.rating_staffing, 0) / count,
      safety: reviews.reduce((acc, r) => acc + r.rating_safety, 0) / count,
      culture: reviews.reduce((acc, r) => acc + r.rating_culture, 0) / count,
      management: reviews.reduce((acc, r) => acc + r.rating_management, 0) / count,
      pay_benefits: reviews.reduce((acc, r) => acc + r.rating_pay_benefits, 0) / count
    };
  }, [reviews]);

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-teal-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 3.0) return 'text-amber-600';
    return 'text-red-600';
  };

  const getComparisonIcon = (deptRating: number, hospitalRating: number) => {
    const diff = deptRating - hospitalRating;
    if (diff > 0.2) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (diff < -0.2) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const RatingBar = ({ label, icon, rating, hospitalAvg }: { label: string; icon: React.ReactNode; rating: number; hospitalAvg: number }) => (
    <div className="flex items-center gap-3">
      <div className="w-28 flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${rating >= 4 ? 'bg-green-500' : rating >= 3 ? 'bg-amber-500' : 'bg-red-500'}`}
          style={{ width: `${(rating / 5) * 100}%` }}
        />
      </div>
      <div className="w-16 flex items-center gap-1 justify-end">
        <span className={`font-semibold ${getRatingColor(rating)}`}>{rating.toFixed(1)}</span>
        {getComparisonIcon(rating, hospitalAvg)}
      </div>
    </div>
  );

  const formatDateShort = (dateString: string) => formatDate(dateString, 'short');

  if (reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600" />
            Department Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No reviews by department yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-600" />
              Department Breakdown
            </CardTitle>
            <CardDescription>
              See how different units at {employerName} compare
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'count' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('count')}
            >
              Most Reviews
            </Button>
            <Button
              variant={sortBy === 'rating' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('rating')}
            >
              Highest Rated
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 pb-4 border-b">
          <span>Compared to hospital average:</span>
          <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-green-500" /> Above avg</span>
          <span className="flex items-center gap-1"><Minus className="w-3 h-3 text-slate-400" /> Similar</span>
          <span className="flex items-center gap-1"><TrendingDown className="w-3 h-3 text-red-500" /> Below avg</span>
        </div>

        {/* Department Cards */}
        <div className="space-y-4">
          {departmentStats.map(dept => {
            const isExpanded = expandedDepartment === dept.name;

            return (
              <div key={dept.name} className="border rounded-lg overflow-hidden">
                {/* Department Header */}
                <button
                  className="w-full text-left p-4 hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedDepartment(isExpanded ? null : dept.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <Building2 className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{dept.name}</p>
                        <p className="text-sm text-muted-foreground">{dept.count} review{dept.count !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className={`font-bold ${getRatingColor(dept.overall)}`}>{dept.overall.toFixed(1)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Overall</p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t bg-slate-50 p-4">
                    {/* Rating Breakdown */}
                    <div className="space-y-3 mb-6">
                      <RatingBar label="Staffing" icon={<Users className="w-4 h-4" />} rating={dept.staffing} hospitalAvg={hospitalAvg.staffing} />
                      <RatingBar label="Safety" icon={<Shield className="w-4 h-4" />} rating={dept.safety} hospitalAvg={hospitalAvg.safety} />
                      <RatingBar label="Culture" icon={<Heart className="w-4 h-4" />} rating={dept.culture} hospitalAvg={hospitalAvg.culture} />
                      <RatingBar label="Management" icon={<UserCog className="w-4 h-4" />} rating={dept.management} hospitalAvg={hospitalAvg.management} />
                      <RatingBar label="Pay/Benefits" icon={<DollarSign className="w-4 h-4" />} rating={dept.pay_benefits} hospitalAvg={hospitalAvg.pay_benefits} />
                    </div>

                    {/* Recent Reviews from this department */}
                    <div>
                      <h4 className="font-medium text-sm mb-3">Recent {dept.name} Reviews</h4>
                      <div className="space-y-3">
                        {dept.reviews.slice(0, 3).map(review => (
                          <div key={review.id} className="bg-white p-3 rounded-lg border">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3 w-3 ${star <= review.rating_overall ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">{formatDateShort(review.created_at)}</span>
                            </div>
                            <p className="font-medium text-sm mb-1">{review.title}</p>
                            <p className="text-sm text-slate-600 line-clamp-2">{review.review_text}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" /> {review.helpful_votes_up} helpful
                              </span>
                              {review.position_type && (
                                <Badge variant="outline" className="text-xs">{review.position_type}</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
