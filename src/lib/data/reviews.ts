import { createClient } from '@/lib/supabase/server';
import { Review } from '@/lib/types';

/**
 * Get all approved reviews
 */
export async function getApprovedReviews(): Promise<Review[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }

  return data as Review[];
}

/**
 * Get reviews for a specific employer
 */
export async function getReviewsByEmployerId(employerId: string): Promise<Review[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('employer_id', employerId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }

  return data as Review[];
}

/**
 * Get recent reviews (for homepage)
 */
export async function getRecentReviews(limit = 5): Promise<Review[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent reviews:', error);
    return [];
  }

  return data as Review[];
}

/**
 * Get featured review (highest rated with good content)
 */
export async function getFeaturedReview(): Promise<Review | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('status', 'approved')
    .gte('rating_overall', 4)
    .order('helpful_votes_up', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching featured review:', error);
    return null;
  }

  return data as Review;
}

/**
 * Get unique departments from reviews
 */
export async function getReviewDepartments(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('department')
    .eq('status', 'approved');

  if (error) {
    console.error('Error fetching departments:', error);
    return [];
  }

  const departments = [...new Set(data.map(d => d.department).filter(Boolean))] as string[];
  return departments.sort();
}
