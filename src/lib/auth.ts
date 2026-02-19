import { createClient } from '@/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Get the currently authenticated user, or null if not logged in.
 */
export async function getCurrentUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

/**
 * Check whether a user has admin privileges.
 * Accepts either a user ID string or a Supabase client instance (for reuse).
 */
export async function isUserAdmin(userId: string, supabase?: SupabaseClient): Promise<boolean> {
    const client = supabase ?? await createClient();
    const { data: profile } = await client
        .from('users')
        .select('is_admin')
        .eq('id', userId)
        .single();

    return profile?.is_admin ?? false;
}

/**
 * Verify the current request is from an authenticated admin user.
 * Returns the user if admin, or null if not.
 * Useful in API routes for quick admin checks.
 */
export async function requireAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const admin = await isUserAdmin(user.id, supabase);
    if (!admin) return null;

    return { user, supabase };
}
