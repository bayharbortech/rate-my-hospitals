import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { blogPosts } from '@/lib/blog-data';

export async function POST() {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check how many already exist to avoid duplicates
    const { data: existing } = await admin.supabase
        .from('blog_posts')
        .select('title');

    const existingTitles = new Set((existing || []).map(p => p.title));

    const toInsert = blogPosts
        .filter(p => !existingTitles.has(p.title))
        .map(p => ({
            title: p.title,
            summary: p.summary,
            category: p.category,
            date: p.date,
            read_time: p.readTime,
            image: p.image,
            content: p.content,
            status: 'published' as const,
            created_by: admin.user.id,
        }));

    if (toInsert.length === 0) {
        return NextResponse.json({
            message: 'All static posts already exist in the database.',
            inserted: 0,
            skipped: blogPosts.length,
        });
    }

    const { data, error } = await admin.supabase
        .from('blog_posts')
        .insert(toInsert)
        .select();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        message: `Successfully imported ${data.length} blog posts.`,
        inserted: data.length,
        skipped: blogPosts.length - toInsert.length,
    });
}
