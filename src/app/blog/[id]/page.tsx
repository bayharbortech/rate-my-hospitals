import { categoryColors } from "@/lib/blog-data";
import { BLOG_AUTHOR, BLOG_AUTHOR_SUBTITLE } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock, ArrowLeft, Share2, ArrowRight, Tag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const TAG_COLORS = [
    'bg-teal-100 text-teal-700',
    'bg-indigo-100 text-indigo-700',
    'bg-pink-100 text-pink-700',
    'bg-amber-100 text-amber-700',
    'bg-emerald-100 text-emerald-700',
    'bg-violet-100 text-violet-700',
    'bg-rose-100 text-rose-700',
];

function getTagColor(tag: string): string {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

function parseTags(tags?: string | null): string[] {
    if (!tags) return [];
    return tags.split(',').map(t => t.trim()).filter(Boolean);
}

interface BlogPostPageProps {
    params: Promise<{
        id: string;
    }>;
}

export const dynamic = "force-dynamic";

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: post } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', parseInt(id))
        .single();

    if (!post) {
        notFound();
    }

    // Fetch related posts: same category first, then others
    const { data: sameCategoryPosts } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .eq('category', post.category)
        .neq('id', post.id)
        .order('created_at', { ascending: false })
        .limit(2);

    const sameCat = sameCategoryPosts || [];
    const remaining = 3 - sameCat.length;

    let otherPosts: typeof sameCat = [];
    if (remaining > 0) {
        const { data } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('status', 'published')
            .neq('category', post.category)
            .neq('id', post.id)
            .order('created_at', { ascending: false })
            .limit(remaining);
        otherPosts = data || [];
    }

    const relatedPosts = [...sameCat, ...otherPosts];

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <article className="container mx-auto px-4 max-w-4xl">
                <div className="mb-8">
                    <Link href="/blog">
                        <Button variant="ghost" className="gap-2 pl-0 hover:pl-0 hover:bg-transparent text-muted-foreground hover:text-primary">
                            <ArrowLeft className="w-4 h-4" /> Back to Blog
                        </Button>
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
                    <div className="relative h-[400px] w-full">
                        <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="flex flex-wrap gap-3 items-center mb-6">
                            <Badge variant="secondary" className={`${categoryColors[post.category]} px-3 py-1 text-sm`}>
                                {post.category}
                            </Badge>
                            {parseTags(post.tags).map(tag => (
                                <Badge key={tag} variant="secondary" className={`${getTagColor(tag)} px-2.5 py-0.5 text-xs gap-1`}>
                                    <Tag className="h-3 w-3" />{tag}
                                </Badge>
                            ))}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CalendarDays className="w-4 h-4" />
                                {post.date}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                {post.read_time}
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-slate-900">
                            {post.title}
                        </h1>

                        <div className="flex items-center justify-between border-y py-6 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold">
                                    NS
                                </div>
                                <div>
                                    <p className="font-medium text-sm">{BLOG_AUTHOR}</p>
                                    <p className="text-xs text-muted-foreground">{BLOG_AUTHOR_SUBTITLE}</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Share2 className="w-4 h-4" /> Share
                            </Button>
                        </div>

                        <div
                            className="prose prose-slate prose-lg max-w-none
                prose-headings:font-bold prose-headings:text-slate-900
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-2
                prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4
                prose-li:text-slate-700 prose-li:my-1
                prose-ul:my-4 prose-ol:my-4
                prose-strong:text-slate-900
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    </div>
                </div>

                {relatedPosts.length > 0 && (
                    <section className="mt-16">
                        <h2 className="text-2xl font-bold text-slate-900 mb-8">Continue Reading</h2>
                        <div className="grid gap-6 md:grid-cols-3">
                            {relatedPosts.map((relatedPost) => (
                                <Card key={relatedPost.id} className="flex flex-col hover:shadow-md transition-shadow duration-200 overflow-hidden">
                                    <div className="relative h-40 w-full">
                                        <Image
                                            src={relatedPost.image}
                                            alt={relatedPost.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant="secondary" className={`${categoryColors[relatedPost.category]} text-xs`}>
                                                {relatedPost.category}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-base line-clamp-2 hover:text-primary transition-colors">
                                            <Link href={`/blog/${relatedPost.id}`}>
                                                {relatedPost.title}
                                            </Link>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-grow pt-0">
                                        <CardDescription className="line-clamp-2 text-sm">
                                            {relatedPost.summary}
                                        </CardDescription>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
                                            <Clock className="w-3 h-3" />
                                            {relatedPost.read_time}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <div className="text-center mt-8">
                            <Link href="/blog">
                                <Button variant="outline" className="gap-2">
                                    View All Articles <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </section>
                )}
            </article>
        </div>
    );
}
