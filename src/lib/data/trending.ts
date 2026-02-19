import { createClient } from '@/lib/supabase/server';

export interface TrendingHospital {
  id: string;
  name: string;
  recentReviewCount: number;
  rating: number;
}

/**
 * Get trending hospitals based on recent review activity from Supabase.
 */
export async function getTrendingHospitals(
  limit: number = 3,
  daysWindow: number = 30
): Promise<TrendingHospital[]> {
  const supabase = await createClient();
  const windowStart = new Date(Date.now() - daysWindow * 24 * 60 * 60 * 1000);

  // Get recent approved reviews with employer data
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('employer_id')
    .gte('created_at', windowStart.toISOString())
    .eq('status', 'approved');

  if (error || !reviews || reviews.length === 0) {
    // Fallback: get employers with highest review counts
    const { data: employers } = await supabase
      .from('employers')
      .select('id, name, rating_overall, review_count')
      .order('review_count', { ascending: false, nullsFirst: false })
      .limit(limit);

    if (!employers) return [];

    return employers.map(e => ({
      id: e.id,
      name: e.name,
      recentReviewCount: e.review_count || 0,
      rating: e.rating_overall || 0,
    }));
  }

  // Count reviews per employer
  const counts = new Map<string, number>();
  reviews.forEach(r => {
    const current = counts.get(r.employer_id) || 0;
    counts.set(r.employer_id, current + 1);
  });

  // Get top employer IDs by count
  const topEmployerIds = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  if (topEmployerIds.length === 0) return [];

  // Fetch employer details
  const { data: employers } = await supabase
    .from('employers')
    .select('id, name, rating_overall')
    .in('id', topEmployerIds);

  if (!employers) return [];

  // Map to trending format with counts
  return topEmployerIds
    .map(id => {
      const employer = employers.find(e => e.id === id);
      if (!employer) return null;
      return {
        id: employer.id,
        name: employer.name,
        recentReviewCount: counts.get(id) || 0,
        rating: employer.rating_overall || 0,
      };
    })
    .filter((h): h is TrendingHospital => h !== null);
}
