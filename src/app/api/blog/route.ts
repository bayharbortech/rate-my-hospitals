import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { BlogPostRequest } from '@/lib/types';
import { DEFAULT_BLOG_IMAGE, DEFAULT_READ_TIME, formatDate } from '@/lib/constants';

export async function GET() {
    const supabase = await createClient();

    const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let body: BlogPostRequest;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body.title || !body.summary || !body.category || !body.content) {
        return NextResponse.json({ error: 'Missing required fields: title, summary, category, content' }, { status: 400 });
    }

    const { data: post, error } = await admin.supabase
        .from('blog_posts')
        .insert({
            title: body.title,
            summary: body.summary,
            category: body.category,
            date: body.date || formatDate(new Date()),
            read_time: body.readTime || DEFAULT_READ_TIME,
            image: body.image || DEFAULT_BLOG_IMAGE,
            content: body.content,
            tags: body.tags || null,
            status: body.status || 'draft',
            created_by: admin.user.id,
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(post);
}

export async function PUT(request: NextRequest) {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let body: BlogPostRequest;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body.id) {
        return NextResponse.json({ error: 'Missing required field: id' }, { status: 400 });
    }

    const { data: post, error } = await admin.supabase
        .from('blog_posts')
        .update({
            title: body.title,
            summary: body.summary,
            category: body.category,
            date: body.date,
            read_time: body.readTime,
            image: body.image,
            content: body.content,
            tags: body.tags,
            status: body.status,
            updated_at: new Date().toISOString(),
        })
        .eq('id', body.id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(post);
}
