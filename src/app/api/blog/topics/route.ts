import { formatISO } from 'date-fns';
import { requireAdmin } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { parseBody } from '@/lib/api-utils';
import { blogTopicCreateApiSchema, blogTopicUpdateApiSchema } from '@/lib/schemas';

export async function GET() {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await admin.supabase
        .from('blog_topics')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const parsed = await parseBody(request, blogTopicCreateApiSchema);
    if ('error' in parsed) return parsed.error;
    const body = parsed.data;

    const { data, error } = await admin.supabase
        .from('blog_topics')
        .insert({
            title: body.title.trim(),
            description: body.description?.trim() || null,
            created_by: admin.user.id,
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const parsed = await parseBody(request, blogTopicUpdateApiSchema);
    if ('error' in parsed) return parsed.error;
    const body = parsed.data;

    const updateData: Record<string, unknown> = {
        updated_at: formatISO(new Date()),
    };

    if (body.title !== undefined) {
        updateData.title = body.title.trim();
    }

    if (body.description !== undefined) {
        updateData.description = body.description.trim() || null;
    }

    const { data, error } = await admin.supabase
        .from('blog_topics')
        .update(updateData)
        .eq('id', body.id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Topic id is required' }, { status: 400 });
    }

    const { error } = await admin.supabase
        .from('blog_topics')
        .delete()
        .eq('id', parseInt(id));

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
