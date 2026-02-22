'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, ArrowRight, Tag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { categoryColors } from "@/lib/blog-data";
import { BLOG_NAME } from "@/lib/constants";
import { ShareButton } from "@/components/ui/ShareButton";
import { useIsMobile } from "@/hooks/useIsMobile";

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

interface BlogPost {
    id: number;
    title: string;
    summary: string;
    content: string;
    image: string;
    category: string;
    date: string;
    read_time: string;
    tags?: string | null;
}

interface BlogPageClientProps {
    posts: BlogPost[];
}

const ALL_CATEGORIES = ['All', 'Staffing', 'Career', 'Wellness', 'Safety', 'Leadership', 'Education', 'Technology'];

export function BlogPageClient({ posts }: BlogPageClientProps) {
    const isMobile = useIsMobile();
    const [activeCategory, setActiveCategory] = useState('All');

    const filteredPosts = activeCategory === 'All'
        ? posts
        : posts.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background py-12">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-8">
                    <h1 className="text-4xl font-bold tracking-tight mb-4">{BLOG_NAME}</h1>
                    <p className="text-lg text-muted-foreground">
                        Insights, advice, and stories for the modern nurse. Stay informed on career trends, workplace safety, and personal well-being.
                    </p>
                </div>

                {/* Category filter chips */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 mb-4 -mx-4 px-4">
                    {ALL_CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 text-sm rounded-full border whitespace-nowrap transition-colors ${
                                activeCategory === cat
                                    ? 'bg-teal-600 text-white border-teal-600'
                                    : 'bg-background text-foreground border-border hover:border-teal-300'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {filteredPosts.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                        <p className="text-lg">No blog posts in this category yet.</p>
                    </div>
                ) : isMobile ? (
                    /* Mobile: horizontal compact cards */
                    <div className="space-y-3">
                        {filteredPosts.map((post) => (
                            <Link key={post.id} href={`/blog/${post.id}`} className="block">
                                <div className="flex gap-3 p-3 bg-card rounded-lg border hover:shadow-sm transition-shadow">
                                    <div className="relative h-20 w-20 shrink-0 rounded-lg overflow-hidden">
                                        <Image src={post.image} alt={post.title} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex gap-1.5 mb-1">
                                            <Badge variant="secondary" className={`${categoryColors[post.category]} text-[10px] px-1.5 py-0`}>
                                                {post.category}
                                            </Badge>
                                        </div>
                                        <h3 className="font-semibold text-sm line-clamp-2 leading-tight">{post.title}</h3>
                                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                                            <span className="flex items-center gap-0.5"><CalendarDays className="w-2.5 h-2.5" />{post.date}</span>
                                            <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{post.read_time}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    /* Desktop: vertical card grid */
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredPosts.map((post) => (
                            <Card key={post.id} className="flex flex-col hover:shadow-md transition-shadow duration-200 overflow-hidden">
                                <Link href={`/blog/${post.id}`}>
                                    <div className="relative h-48 w-full">
                                        <Image src={post.image} alt={post.title} fill className="object-cover" />
                                    </div>
                                </Link>
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
                                    <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
                                        <Link href={`/blog/${post.id}`}>{post.title}</Link>
                                    </CardTitle>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                        <div className="flex items-center gap-1">
                                            <CalendarDays className="w-3 h-3" />{post.date}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />{post.read_time}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <CardDescription className="line-clamp-3 text-base">{post.summary}</CardDescription>
                                </CardContent>
                                <CardFooter className="flex justify-between items-center">
                                    <Link href={`/blog/${post.id}`} className="text-sm font-medium text-primary flex items-center gap-1 hover:gap-2 transition-all">
                                        Read Article <ArrowRight className="w-4 h-4" />
                                    </Link>
                                    <ShareButton
                                        title={post.title}
                                        text={`${post.title} - RateMyHospital Blog`}
                                        url={`/blog/${post.id}`}
                                        compact
                                    />
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
