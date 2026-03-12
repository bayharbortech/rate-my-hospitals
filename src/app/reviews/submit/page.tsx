import { createClient } from '@/lib/supabase/server';
import { ReviewSubmitContent } from '@/components/reviews/ReviewSubmitContent';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SubmitReviewPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login?view=login&next=/reviews/submit');
    }

    const { data: employers } = await supabase.from('employers').select('*').order('name');

    return <ReviewSubmitContent employers={employers || []} userId={user.id} />;
}
