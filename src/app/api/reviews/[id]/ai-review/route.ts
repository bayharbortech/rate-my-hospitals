import { requireAdmin } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { runAIReview } from '@/lib/ai-review';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    try {
        const result = await runAIReview(id, admin.supabase);
        return NextResponse.json(result);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error(`AI review failed for review ${id}:`, message);
        return NextResponse.json(
            { error: `AI review failed: ${message}` },
            { status: 500 }
        );
    }
}
