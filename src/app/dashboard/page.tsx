import { getEmployers } from '@/lib/data/employers';
import { getApprovedReviews } from '@/lib/data/reviews';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardPageClient } from './DashboardPageClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?next=/dashboard');
  }

  const supabase = await createClient();

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('display_name, email')
    .eq('id', user.id)
    .single();

  // Fetch user's own reviews (all statuses) with employer name
  const { data: userReviews } = await supabase
    .from('reviews')
    .select('*, employer:employers(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const [employers, reviews] = await Promise.all([
    getEmployers(),
    getApprovedReviews(),
  ]);

  return (
    <DashboardPageClient
      employers={employers}
      reviews={reviews}
      userReviews={userReviews || []}
      userProfile={{
        email: profile?.email || user.email || '',
        display_name: profile?.display_name || null,
      }}
    />
  );
}
