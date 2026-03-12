import { formatISO } from 'date-fns';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { runAIReview } from '@/lib/ai-review';

interface SubmitReviewRequest {
    employer_id: string;
    rating_overall: number;
    rating_staffing: number;
    rating_safety: number;
    rating_culture: number;
    rating_management: number;
    rating_pay_benefits: number;
    rating_cattiness?: number;
    patient_load?: string;
    title: string;
    review_text: string;
    department?: string;
    position_type?: string;
    // Optional salary
    salary?: {
        years_experience: number;
        hourly_rate: number;
    };
    // Optional interview
    interview?: {
        difficulty: number;
        offer_received: boolean;
        notes: string;
        questions: string[];
    };
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: SubmitReviewRequest;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body.employer_id || !body.title || !body.review_text) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert the review
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

    // Insert optional salary
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

    // Insert optional interview
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

    // Run AI compliance review before responding.
    // This adds a few seconds to the submission but ensures the AI result
    // is reliably attached before the admin sees it in the queue.
    let aiResult = null;
    try {
        aiResult = await runAIReview(review.id, supabase);
    } catch (err) {
        // AI review failure is non-fatal — the review is still submitted.
        // Admin can manually trigger AI review from the dashboard.
        console.error('Auto AI review failed:', err);
    }

    // If auto-return is enabled and AI did not recommend approval,
    // automatically send the review back to the user for revision.
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
