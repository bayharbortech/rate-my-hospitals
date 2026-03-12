'use client';

import { useState, useMemo } from 'react';
import { compareDesc, compareAsc } from 'date-fns';
import Link from 'next/link';
import { Employer, Review } from '@/lib/types';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import {
  MessageSquare,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Building2,
  Star,
  Calendar,
  Briefcase,
  X,
} from 'lucide-react';

interface ReviewsPageClientProps {
  reviews: Review[];
  employers: Employer[];
  departments: string[];
}

const REVIEWS_PER_PAGE = 6;

export function ReviewsPageClient({ reviews, employers, departments }: ReviewsPageClientProps) {
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Get employer map for quick lookups
  const employerMap = useMemo(() => {
    const map = new Map<string, Employer>();
    employers.forEach((emp) => map.set(emp.id, emp));
    return map;
  }, [employers]);

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    // Search filter (title, review text, department)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.review_text?.toLowerCase().includes(query) ||
          r.department?.toLowerCase().includes(query) ||
          employerMap.get(r.employer_id)?.name.toLowerCase().includes(query)
      );
    }

    // Hospital filter
    if (selectedHospital !== 'all') {
      result = result.filter((r) => r.employer_id === selectedHospital);
    }

    // Rating filter
    if (selectedRating !== 'all') {
      const minRating = parseInt(selectedRating);
      result = result.filter((r) => r.rating_overall >= minRating);
    }

    // Department filter
    if (selectedDepartment !== 'all') {
      result = result.filter((r) => r.department === selectedDepartment);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => compareDesc(new Date(a.created_at), new Date(b.created_at)));
        break;
      case 'oldest':
        result.sort((a, b) => compareAsc(new Date(a.created_at), new Date(b.created_at)));
        break;
      case 'highest':
        result.sort((a, b) => b.rating_overall - a.rating_overall);
        break;
      case 'lowest':
        result.sort((a, b) => a.rating_overall - b.rating_overall);
        break;
      case 'helpful':
        result.sort(
          (a, b) => (b.helpful_votes_up || 0) - (a.helpful_votes_up || 0)
        );
        break;
    }

    return result;
  }, [
    reviews,
    searchQuery,
    selectedHospital,
    selectedRating,
    selectedDepartment,
    sortBy,
    employerMap,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE
  );

  // Reset to page 1 when filters change
  const handleFilterChange = (
    setter: (value: string) => void,
    value: string
  ) => {
    setter(value);
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery ||
    selectedHospital !== 'all' ||
    selectedRating !== 'all' ||
    selectedDepartment !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedHospital('all');
    setSelectedRating('all');
    setSelectedDepartment('all');
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Reviews</h1>
        <p className="text-muted-foreground">
          Browse {filteredReviews.length} reviews from nurses across all
          hospitals
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews by keyword, hospital, or department..."
                value={searchQuery}
                onChange={(e) =>
                  handleFilterChange(setSearchQuery, e.target.value)
                }
                className="pl-10"
              />
            </div>

            {/* Filter row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Hospital filter */}
              <div className="space-y-1">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" /> Hospital
                </label>
                <Select
                  value={selectedHospital}
                  onValueChange={(v) =>
                    handleFilterChange(setSelectedHospital, v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All hospitals" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All hospitals</SelectItem>
                    {employers.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rating filter */}
              <div className="space-y-1">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Star className="h-3.5 w-3.5" /> Minimum Rating
                </label>
                <Select
                  value={selectedRating}
                  onValueChange={(v) =>
                    handleFilterChange(setSelectedRating, v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any rating</SelectItem>
                    <SelectItem value="5">5 stars only</SelectItem>
                    <SelectItem value="4">4+ stars</SelectItem>
                    <SelectItem value="3">3+ stars</SelectItem>
                    <SelectItem value="2">2+ stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Department filter */}
              <div className="space-y-1">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" /> Department
                </label>
                <Select
                  value={selectedDepartment}
                  onValueChange={(v) =>
                    handleFilterChange(setSelectedDepartment, v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div className="space-y-1">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Sort By
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="oldest">Oldest first</SelectItem>
                    <SelectItem value="highest">Highest rated</SelectItem>
                    <SelectItem value="lowest">Lowest rated</SelectItem>
                    <SelectItem value="helpful">Most helpful</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active filters indicator */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 pt-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Filters active
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-auto py-1 px-2 text-sm"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reviews Grid */}
      {paginatedReviews.length > 0 ? (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            {paginatedReviews.map((review) => {
              const employer = employerMap.get(review.employer_id);
              return (
                <div key={review.id} className="relative">
                  {/* Hospital link badge */}
                  {employer && (
                    <Link
                      href={`/employers/${employer.id}`}
                      className="absolute -top-2 left-4 z-10 bg-teal-600 text-white text-xs px-3 py-1 rounded-full hover:bg-teal-700 transition-colors flex items-center gap-1"
                    >
                      <Building2 className="h-3 w-3" />
                      {employer.name}
                    </Link>
                  )}
                  <div className="pt-3">
                    <ReviewCard review={review} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={
                        currentPage === page ? 'bg-teal-600 hover:bg-teal-700' : ''
                      }
                    >
                      {page}
                    </Button>
                  )
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      ) : (
        /* Empty state */
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters
                ? 'Try adjusting your filters to see more reviews.'
                : 'Be the first to share your experience!'}
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : (
              <Link href="/reviews/submit">
                <Button>Write a Review</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* CTA Section */}
      <Card className="mt-12 bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-100">
        <CardContent className="py-8 text-center">
          <h2 className="text-xl font-bold mb-2">Share Your Experience</h2>
          <p className="text-muted-foreground mb-4">
            Help fellow nurses make informed decisions by sharing your workplace
            review.
          </p>
          <Link href="/reviews/submit">
            <Button className="bg-teal-600 hover:bg-teal-700">
              Write a Review
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
