import { formatISO } from 'date-fns';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { runAIReview } from '@/lib/ai-review';
import { parseBody } from '@/lib/api-utils';
import { submitReviewApiSchema } from '@/lib/schemas';

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = await parseBody(request, submitReviewApiSchema);
    if ('error' in parsed) return parsed.error;
    const body = parsed.data;

    const reviewData: Record<string, unknown> = {
        user_id: user.id,
        employer_id: body.employer_id,
        rating_overall: body.rating_overall,
        rating_staffing: body.rating_staffing,
        rating_safety: body.rating_safety,
        rating_culture: body.rating_culture,
        rating_management: body.rating_management,
        rating_pay_benefits: body.rating_pay_benefits,
        title: body.title,
        review_text: body.review_text,
        work_timeframe: 'currently',
        department: body.department || null,
        position_type: body.position_type || null,
        status: 'pending',
    };

    if (body.patient_load) {
        reviewData.patient_load = body.patient_load;
    }
    if (body.rating_cattiness && body.rating_cattiness > 0) {
        reviewData.rating_cattiness = body.rating_cattiness;
    }

    const { data: review, error: insertError } = await supabase
        .from('reviews')
        .insert(reviewData)
        .select()
        .single();

    if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    if (body.salary && body.position_type) {
        const { error: salaryError } = await supabase.from('salaries').insert({
            employer_id: body.employer_id,
            position: body.position_type,
            years_experience: body.salary.years_experience,
            hourly_rate: body.salary.hourly_rate,
            department: body.department || '',
        });
        if (salaryError) console.error('Salary submission failed:', salaryError);
    }

    if (body.interview && body.position_type) {
        const { error: interviewError } = await supabase.from('interviews').insert({
            employer_id: body.employer_id,
            position: body.position_type,
            difficulty: body.interview.difficulty,
            offer_received: body.interview.offer_received,
            notes: body.interview.notes,
            questions: body.interview.questions,
        });
        if (interviewError) console.error('Interview submission failed:', interviewError);
    }

    let aiResult = null;
    try {
        aiResult = await runAIReview(review.id, supabase);
    } catch (err) {
        console.error('Auto AI review failed:', err);
    }

    if (aiResult && aiResult.recommendation !== 'approve') {
        try {
            const { data: setting } = await supabase
                .from('app_settings')
                .select('value')
                .eq('key', 'auto_return_non_approved')
                .single();

            if (setting?.value === true) {
                const autoComment = aiResult.summary
                    ? `Auto-returned by AI review: ${aiResult.summary}`
                    : 'Your review has been automatically flagged for revision. Please review the AI recommendations and resubmit.';

                await supabase
                    .from('reviews')
                    .update({
                        status: 'revision_requested',
                        admin_comment: autoComment,
                        updated_at: formatISO(new Date()),
                    })
                    .eq('id', review.id);
            }
        } catch (err) {
            console.error('Auto-return check failed:', err);
        }
    }

    return NextResponse.json({ success: true, reviewId: review.id });
}
