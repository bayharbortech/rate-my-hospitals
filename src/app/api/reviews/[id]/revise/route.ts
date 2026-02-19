import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { runAIReview } from '@/lib/ai-review';

interface ReviseRequest {
    title: string;
    review_text: string;
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify the review belongs to this user and is in revision_requested status
    const { data: review, error: fetchError } = await supabase
        .from('reviews')
        .select('id, user_id, status')
        .eq('id', id)
        .single();

    if (fetchError || !review) {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (review.user_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (review.status !== 'revision_requested') {
        return NextResponse.json(
            { error: 'Review can only be revised when revision is requested' },
            { status: 400 }
        );
    }

    let body: ReviseRequest;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body.title || !body.review_text) {
        return NextResponse.json(
            { error: 'Title and review text are required' },
            { status: 400 }
        );
    }

    const { data, error } = await supabase
        .from('reviews')
        .update({
            title: body.title,
            review_text: body.review_text,
            status: 'pending',
            admin_comment: null,
            ai_review_result: null,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Check admin automation settings
    const { data: settings } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', ['auto_ai_review_on_resubmit', 'auto_return_non_approved']);

    const settingsMap: Record<string, unknown> = {};
    for (const row of settings || []) {
        settingsMap[row.key] = row.value;
    }

    // Run AI review on resubmission if enabled
    let aiResult = null;
    if (settingsMap.auto_ai_review_on_resubmit === true) {
        try {
            aiResult = await runAIReview(id, supabase);
        } catch (err) {
            console.error('Auto AI review on resubmit failed:', err);
        }
    }

    // Auto-return to user if AI did not recommend approval
    if (aiResult && aiResult.recommendation !== 'approve' && settingsMap.auto_return_non_approved === true) {
        try {
            const autoComment = aiResult.summary
                ? `Auto-returned by AI review: ${aiResult.summary}`
                : 'Your review has been automatically flagged for revision. Please review the AI recommendations and resubmit.';

            await supabase
                .from('reviews')
                .update({
                    status: 'revision_requested',
                    admin_comment: autoComment,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id);
        } catch (err) {
            console.error('Auto-return on resubmit failed:', err);
        }
    }

    return NextResponse.json(data);
}
