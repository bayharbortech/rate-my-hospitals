import { createClient } from '@/lib/supabase/server';
import { Employer } from '@/lib/types';
import { mockEmployers } from '@/lib/mock-data';

// Type for raw database row (union is a reserved word, so DB uses union_hospital)
interface EmployerRow {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'urgent_care' | 'nursing_home';
  address: string;
  city: string;
  state: string;
  zip_code: string;
  website: string | null;
  phone: string | null;
  bed_count: number | null;
  health_system: string | null;
  teaching_status: 'academic' | 'community' | 'specialty' | null;
  rating_overall: number | null;
  review_count: number | null;
  badges: string[] | null;
  magnet_status: boolean | null;
  union_hospital: boolean | null;
  new_grad_friendly: boolean | null;
  specialties: string[] | null;
  shift_types: string[] | null;
  avg_hourly_rate: number | null;
  latitude: number | null;
  longitude: number | null;
}

// Transform database row to Employer type
function transformEmployer(row: EmployerRow): Employer {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    address: row.address,
    city: row.city,
    state: row.state,
    zip_code: row.zip_code,
    website: row.website ?? undefined,
    phone: row.phone ?? undefined,
    bed_count: row.bed_count ?? undefined,
    health_system: row.health_system ?? undefined,
    teaching_status: row.teaching_status ?? undefined,
    rating_overall: row.rating_overall ?? undefined,
    review_count: row.review_count ?? undefined,
    badges: row.badges ?? undefined,
    magnet_status: row.magnet_status ?? undefined,
    union: row.union_hospital ?? undefined,
    new_grad_friendly: row.new_grad_friendly ?? undefined,
    specialties: row.specialties ?? undefined,
    shift_types: row.shift_types as ('day' | 'night' | 'rotating')[] | undefined,
    avg_hourly_rate: row.avg_hourly_rate ?? undefined,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
  };
}

/**
 * Get all employers
 * Falls back to mock data if database is empty or returns no results
 */
export async function getEmployers(): Promise<Employer[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('employers')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching employers:', error);
    // Fall back to mock data on error
    return mockEmployers;
  }

  // If no data from database, use mock data
  if (!data || data.length === 0) {
    return mockEmployers;
  }

  const employers = (data as EmployerRow[]).map(transformEmployer);

  // If employers from DB don't have coordinates, merge with mock data coordinates
  const hasAnyCoordinates = employers.some(e => e.latitude && e.longitude);
  if (!hasAnyCoordinates) {
    // Try to match employers with mock data by name to get coordinates
    return employers.map(employer => {
      const mockMatch = mockEmployers.find(
        m => m.name.toLowerCase() === employer.name.toLowerCase()
      );
      if (mockMatch && mockMatch.latitude && mockMatch.longitude) {
        return {
          ...employer,
          latitude: mockMatch.latitude,
          longitude: mockMatch.longitude,
        };
      }
      return employer;
    });
  }

  return employers;
}

/**
 * Get employer by ID
 * Falls back to mock data if not found in database
 */
export async function getEmployerById(id: string): Promise<Employer | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('employers')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    // Try to find in mock data
    const mockEmployer = mockEmployers.find(e => e.id === id);
    if (mockEmployer) {
      return mockEmployer;
    }
    console.error('Error fetching employer:', error);
    return null;
  }

  const employer = transformEmployer(data as EmployerRow);

  // If employer doesn't have coordinates, try to get from mock data
  if (!employer.latitude || !employer.longitude) {
    const mockMatch = mockEmployers.find(
      m => m.name.toLowerCase() === employer.name.toLowerCase()
    );
    if (mockMatch && mockMatch.latitude && mockMatch.longitude) {
      return {
        ...employer,
        latitude: mockMatch.latitude,
        longitude: mockMatch.longitude,
      };
    }
  }

  return employer;
}

/**
 * Get employers by IDs
 */
export async function getEmployersByIds(ids: string[]): Promise<Employer[]> {
  if (ids.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('employers')
    .select('*')
    .in('id', ids);

  if (error) {
    console.error('Error fetching employers:', error);
    return [];
  }

  return (data as EmployerRow[]).map(transformEmployer);
}

/**
 * Get unique states from employers
 */
export async function getEmployerStates(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('employers')
    .select('state');

  if (error) {
    console.error('Error fetching states:', error);
    return [];
  }

  const states = [...new Set(data.map(d => d.state))].sort();
  return states;
}

/**
 * Get unique health systems from employers
 */
export async function getEmployerHealthSystems(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('employers')
    .select('health_system');

  if (error) {
    console.error('Error fetching health systems:', error);
    return [];
  }

  const systems = [...new Set(data.map(d => d.health_system).filter(Boolean))] as string[];
  return systems.sort();
}

/**
 * Search employers by name
 */
export async function searchEmployers(query: string, limit = 10): Promise<Employer[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('employers')
    .select('*')
    .ilike('name', `%${query}%`)
    .limit(limit);

  if (error) {
    console.error('Error searching employers:', error);
    return [];
  }

  return (data as EmployerRow[]).map(transformEmployer);
}

/**
 * Get featured employers (highest rated)
 */
export async function getFeaturedEmployers(limit = 3): Promise<Employer[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('employers')
    .select('*')
    .order('rating_overall', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured employers:', error);
    return [];
  }

  return (data as EmployerRow[]).map(transformEmployer);
}
