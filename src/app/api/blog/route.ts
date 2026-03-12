import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { formatISO } from 'date-fns';
import { DEFAULT_BLOG_IMAGE, DEFAULT_READ_TIME, formatDate } from '@/lib/constants';
import { parseBody } from '@/lib/api-utils';
import { blogPostApiSchema, blogPostUpdateApiSchema } from '@/lib/schemas';

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

    const parsed = await parseBody(request, blogPostApiSchema);
    if ('error' in parsed) return parsed.error;
    const body = parsed.data;

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

    const parsed = await parseBody(request, blogPostUpdateApiSchema);
    if ('error' in parsed) return parsed.error;
    const body = parsed.data;

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
            updated_at: formatISO(new Date()),
        })
        .eq('id', body.id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(post);
}
