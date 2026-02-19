import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, ArrowRight, Tag } from "lucide-react";
import Link from "next/link";

import { categoryColors } from "@/lib/blog-data";
import { BLOG_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";

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

export const dynamic = "force-dynamic";

export default async function BlogPage() {
    const supabase = await createClient();

    const { data: posts } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

    const blogPosts = posts || [];

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h1 className="text-4xl font-bold tracking-tight mb-4">{BLOG_NAME}</h1>
                    <p className="text-lg text-muted-foreground">
                        Insights, advice, and stories for the modern nurse. Stay informed on career trends, workplace safety, and personal well-being.
                    </p>
                </div>

                {blogPosts.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                        <p className="text-lg">No blog posts published yet. Check back soon!</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {blogPosts.map((post) => (
                            <Card key={post.id} className="flex flex-col hover:shadow-md transition-shadow duration-200 overflow-hidden">
                                <div className="relative h-48 w-full">
                                    <Image
                                        src={post.image}
                                        alt={post.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <CardHeader>
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        <Badge variant="secondary" className={categoryColors[post.category]}>
                                            {post.category}
                                        </Badge>
                                        {parseTags(post.tags).map(tag => (
                                            <Badge key={tag} variant="secondary" className={`${getTagColor(tag)} text-xs px-2 py-0 gap-1`}>
                                                <Tag className="h-2.5 w-2.5" />{tag}
                                            </Badge>
                                        ))}
                                    </div>
                                    <CardTitle className="line-clamp-2 hover:text-primary transition-colors cursor-pointer">
                                        {post.title}
                                    </CardTitle>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                        <div className="flex items-center gap-1">
                                            <CalendarDays className="w-3 h-3" />
                                            {post.date}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {post.read_time}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <CardDescription className="line-clamp-3 text-base">
                                        {post.summary}
                                    </CardDescription>
                                </CardContent>
                                <CardFooter>
                                    <Link href={`/blog/${post.id}`} className="text-sm font-medium text-primary flex items-center gap-1 hover:gap-2 transition-all">
                                        Read Article <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
