import { createClient } from '@/lib/supabase/server';
import { Interview } from '@/lib/types';

/**
 * Get all interviews
 */
export async function getInterviews(): Promise<Interview[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('interviews')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching interviews:', error);
    return [];
  }

  return data as Interview[];
}

/**
 * Get interviews for a specific employer
 */
export async function getInterviewsByEmployerId(employerId: string): Promise<Interview[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('interviews')
    .select('*')
    .eq('employer_id', employerId)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching interviews:', error);
    return [];
  }

  return data as Interview[];
}
