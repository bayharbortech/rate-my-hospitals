import { formatISO } from 'date-fns';
import { requireAdmin } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { parseBody } from '@/lib/api-utils';
import { moderateReviewApiSchema } from '@/lib/schemas';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const parsed = await parseBody(request, moderateReviewApiSchema);
    if ('error' in parsed) return parsed.error;
    const body = parsed.data;

    const updateData: Record<string, unknown> = {
        status: body.status,
        updated_at: formatISO(new Date()),
    };

    if (body.admin_comment) {
        updateData.admin_comment = body.admin_comment;
    }

    const { data, error } = await admin.supabase
        .from('reviews')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
