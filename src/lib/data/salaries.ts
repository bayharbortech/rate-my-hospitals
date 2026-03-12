import { createClient } from '@/lib/supabase/server';
import { Salary } from '@/lib/types';

/**
 * Get all salaries
 */
export async function getSalaries(): Promise<Salary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('salaries')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching salaries:', error);
    return [];
  }

  return data as Salary[];
}

/**
 * Get salaries for a specific employer
 */
export async function getSalariesByEmployerId(employerId: string): Promise<Salary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('salaries')
    .select('*')
    .eq('employer_id', employerId)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching salaries:', error);
    return [];
  }

  return data as Salary[];
}

/**
 * Get unique departments from salaries
 */
export async function getSalaryDepartments(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('salaries')
    .select('department');

  if (error) {
    console.error('Error fetching departments:', error);
    return [];
  }

  const departments = [...new Set(data.map(d => d.department).filter(Boolean))] as string[];
  return departments.sort();
}
