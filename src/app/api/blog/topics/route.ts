import { requireAdmin } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// GET -- return all topics ordered by created_at desc
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

// POST -- create a new topic
export async function POST(request: NextRequest) {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let body: { title: string; description?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body.title?.trim()) {
        return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

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

// PUT -- update a topic's title and/or description
export async function PUT(request: NextRequest) {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let body: { id: number; title?: string; description?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body.id) {
        return NextResponse.json({ error: 'Topic id is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) {
        if (!body.title.trim()) {
            return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 });
        }
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

// DELETE -- delete a topic by id
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
