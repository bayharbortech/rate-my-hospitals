import { subDays, differenceInDays, isAfter } from 'date-fns';
import { mockEmployers, mockReviews } from './mock-data';
import { Employer } from './types';

export interface TrendingHospital {
  id: string;
  name: string;
  recentReviewCount: number;
  rating: number;
}

/**
 * Get trending hospitals based on recent review activity.
 *
 * Trending is calculated by:
 * 1. Count of reviews in the last N days (default: 30)
 * 2. Weighted by recency (more recent = higher weight)
 *
 * For production with Supabase, replace the mock data logic with:
 * ```
 * const { data } = await supabase
 *   .from('reviews')
 *   .select('employer_id, created_at')
 *   .gte('created_at', new Date(Date.now() - daysWindow * 24 * 60 * 60 * 1000).toISOString())
 *   .eq('status', 'approved');
 * ```
 */
export function getTrendingHospitals(limit: number = 3, daysWindow: number = 30): TrendingHospital[] {
  const now = new Date();
  const windowStart = subDays(now, daysWindow);

  const reviewScores = new Map<string, { count: number; weightedScore: number }>();

  mockReviews
    .filter(review => review.status === 'approved')
    .forEach(review => {
      const reviewDate = new Date(review.created_at);

      if (isAfter(reviewDate, windowStart)) {
        const employerId = review.employer_id;
        const current = reviewScores.get(employerId) || { count: 0, weightedScore: 0 };

        const daysAgo = differenceInDays(now, reviewDate);
        const recencyWeight = 1 - (daysAgo / daysWindow) * 0.5;

        reviewScores.set(employerId, {
          count: current.count + 1,
          weightedScore: current.weightedScore + recencyWeight,
        });
      }
    });

  // If no recent reviews, fall back to total review count
  if (reviewScores.size === 0) {
    mockReviews
      .filter(review => review.status === 'approved')
      .forEach(review => {
        const employerId = review.employer_id;
        const current = reviewScores.get(employerId) || { count: 0, weightedScore: 0 };
        reviewScores.set(employerId, {
          count: current.count + 1,
          weightedScore: current.weightedScore + 1,
        });
      });
  }

  // Sort by weighted score and get top N
  const sortedEmployerIds = Array.from(reviewScores.entries())
    .sort((a, b) => b[1].weightedScore - a[1].weightedScore)
    .slice(0, limit)
    .map(([id]) => id);

  // Map to trending hospitals with employer details
  return sortedEmployerIds
    .map(id => {
      const employer = mockEmployers.find(e => e.id === id);
      const scores = reviewScores.get(id);

      if (!employer || !scores) return null;

      return {
        id: employer.id,
        name: employer.name,
        recentReviewCount: scores.count,
        rating: employer.rating_overall || 0,
      };
    })
    .filter((h): h is TrendingHospital => h !== null);
}

/**
 * Get trending hospitals using Supabase (for production use)
 * Uncomment and use this when connected to a real database
 */
// export async function getTrendingHospitalsFromDB(
//   supabase: SupabaseClient,
//   limit: number = 3,
//   daysWindow: number = 30
// ): Promise<TrendingHospital[]> {
//   const windowStart = new Date(Date.now() - daysWindow * 24 * 60 * 60 * 1000);
//
//   const { data: reviewCounts } = await supabase
//     .from('reviews')
//     .select('employer_id, employers(id, name, rating_overall)')
//     .gte('created_at', windowStart.toISOString())
//     .eq('status', 'approved');
//
//   if (!reviewCounts) return [];
//
//   // Count reviews per employer
//   const counts = new Map<string, { employer: any; count: number }>();
//   reviewCounts.forEach(r => {
//     const current = counts.get(r.employer_id) || { employer: r.employers, count: 0 };
//     counts.set(r.employer_id, { ...current, count: current.count + 1 });
//   });
//
//   // Sort and return top N
//   return Array.from(counts.values())
//     .sort((a, b) => b.count - a.count)
//     .slice(0, limit)
//     .map(({ employer, count }) => ({
//       id: employer.id,
//       name: employer.name,
//       recentReviewCount: count,
//       rating: employer.rating_overall || 0,
//     }));
// }
