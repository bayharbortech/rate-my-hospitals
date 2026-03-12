import { formatISO } from 'date-fns';
import { requireAdmin } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

interface ModerateRequest {
    status: 'approved' | 'rejected' | 'revision_requested';
    admin_comment?: string;
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    let body: ModerateRequest;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body.status || !['approved', 'rejected', 'revision_requested'].includes(body.status)) {
        return NextResponse.json(
            { error: 'Invalid status. Must be approved, rejected, or revision_requested' },
            { status: 400 }
        );
    }

    if ((body.status === 'rejected' || body.status === 'revision_requested') && !body.admin_comment) {
        return NextResponse.json(
            { error: 'A comment is required when rejecting or requesting revision' },
            { status: 400 }
        );
    }

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
