'use client';

import { useState, useCallback } from 'react';
import { BlogTopic } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ErrorBanner } from '@/components/ui/error-banner';
import { categoryColors } from '@/lib/blog-data';
import { BLOG_AUTHOR, BLOG_AUTHOR_SUBTITLE, DEFAULT_BLOG_IMAGE, estimateReadTime, formatDate } from '@/lib/constants';
import {
    Sparkles, Loader2, Check, RotateCcw, X, ArrowLeft, Tag,
} from 'lucide-react';

interface GeneratedPost {
    title: string;
    summary: string;
    category: string;
    tags: string[];
    content: string;
}

interface BlogPostGeneratorProps {
    topic: BlogTopic;
    onBack: () => void;
    onPublished: () => void;
}

export function BlogPostGenerator({ topic, onBack, onPublished }: BlogPostGeneratorProps) {
    const [generating, setGenerating] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [post, setPost] = useState<GeneratedPost | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [generated, setGenerated] = useState(false);

    const handleGenerate = useCallback(async () => {
        setGenerating(true);
        setErrorMessage(null);
        setPost(null);

        try {
            const res = await fetch('/api/blog/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topicTitle: topic.title,
                    topicDescription: topic.description,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Generation failed');
            }

            const result: GeneratedPost = await res.json();
            setPost(result);
            setGenerated(true);
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Blog generation failed');
        } finally {
            setGenerating(false);
        }
    }, [topic]);

    const handlePublish = async () => {
        if (!post) return;
        setPublishing(true);
        setErrorMessage(null);

        try {
            const res = await fetch('/api/blog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: post.title,
                    summary: post.summary,
                    category: post.category,
                    date: formatDate(new Date()),
                    readTime: estimateReadTime(post.content.replace(/<[^>]*>/g, '')),
                    image: DEFAULT_BLOG_IMAGE,
                    content: post.content,
                    tags: post.tags.join(','),
                    status: 'published',
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to publish');
            }

            onPublished();
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Failed to publish post');
        } finally {
            setPublishing(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4" /> Back to Blog Posts
                </Button>
                <h3 className="text-lg font-semibold mb-1">Generate Blog Post</h3>
                <div className="p-3 bg-slate-50 rounded-lg border">
                    <p className="text-sm font-medium">{topic.title}</p>
                    {topic.description && (
                        <p className="text-xs text-muted-foreground mt-1">{topic.description}</p>
                    )}
                </div>
            </div>

            <ErrorBanner message={errorMessage} />

            {/* Initial state -- show Generate button */}
            {!generated && !generating && (
                <div className="text-center py-8">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-teal-400" />
                    <p className="text-muted-foreground mb-4">
                        Click below to generate a blog post about this topic using AI.
                    </p>
                    <Button onClick={handleGenerate} className="gap-2">
                        <Sparkles className="h-4 w-4" /> Generate Blog Post
                    </Button>
                </div>
            )}

            {/* Generating spinner */}
            {generating && (
                <div className="text-center py-12">
                    <Loader2 className="h-10 w-10 mx-auto mb-4 text-teal-600 animate-spin" />
                    <p className="text-muted-foreground">Generating blog post...</p>
                    <p className="text-xs text-muted-foreground mt-1">This may take 15-30 seconds</p>
                </div>
            )}

            {/* Error with retry */}
            {errorMessage && !generating && !post && generated && (
                <div className="text-center py-4">
                    <div className="flex justify-center gap-2">
                        <Button onClick={handleGenerate} variant="outline" className="gap-2">
                            <RotateCcw className="h-4 w-4" /> Try Again
                        </Button>
                        <Button onClick={onBack} variant="ghost" className="gap-2">
                            <X className="h-4 w-4" /> Cancel
                        </Button>
                    </div>
                </div>
            )}

            {/* Preview of generated post */}
            {post && !generating && (
                <div className="space-y-4">
                    {/* Action buttons at the top */}
                    <div className="flex flex-wrap gap-2">
                        <Button
                            onClick={handlePublish}
                            disabled={publishing}
                            className="bg-green-600 hover:bg-green-700 gap-2"
                        >
                            {publishing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Check className="h-4 w-4" />
                            )}
                            Accept & Publish
                        </Button>
                        <Button
                            onClick={handleGenerate}
                            variant="outline"
                            disabled={publishing}
                            className="gap-2"
                        >
                            <RotateCcw className="h-4 w-4" /> Regenerate
                        </Button>
                        <Button
                            onClick={onBack}
                            variant="ghost"
                            disabled={publishing}
                            className="gap-2"
                        >
                            <X className="h-4 w-4" /> Cancel
                        </Button>
                    </div>

                    <Separator />

                    {/* Post preview */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
                        <div className="p-8 md:p-10">
                            {/* Tags & category */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                <Badge
                                    variant="secondary"
                                    className={`${categoryColors[post.category] || 'bg-gray-100 text-gray-700'} px-3 py-1 text-sm`}
                                >
                                    {post.category}
                                </Badge>
                                {post.tags.map(tag => (
                                    <Badge
                                        key={tag}
                                        variant="outline"
                                        className="px-2 py-0.5 text-xs gap-1"
                                    >
                                        <Tag className="h-3 w-3" />
                                        {tag}
                                    </Badge>
                                ))}
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl font-bold tracking-tight mb-4 text-slate-900">
                                {post.title}
                            </h1>

                            {/* Summary */}
                            <p className="text-lg text-muted-foreground mb-6 italic">
                                {post.summary}
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3 border-y py-4 mb-6">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold">
                                    NS
                                </div>
                                <div>
                                    <p className="font-medium text-sm">{BLOG_AUTHOR}</p>
                                    <p className="text-xs text-muted-foreground">{BLOG_AUTHOR_SUBTITLE}</p>
                                </div>
                            </div>

                            {/* Content */}
                            <div
                                className="prose prose-slate prose-lg max-w-none
                                    prose-headings:font-bold prose-headings:text-slate-900
                                    prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                                    prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                                    prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4
                                    prose-li:text-slate-700 prose-li:my-1
                                    prose-ul:my-4 prose-ol:my-4
                                    prose-strong:text-slate-900
                                    prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />
                        </div>
                    </div>

                    {/* Action buttons at the bottom too */}
                    <div className="flex flex-wrap gap-2">
                        <Button
                            onClick={handlePublish}
                            disabled={publishing}
                            className="bg-green-600 hover:bg-green-700 gap-2"
                        >
                            {publishing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Check className="h-4 w-4" />
                            )}
                            Accept & Publish
                        </Button>
                        <Button
                            onClick={handleGenerate}
                            variant="outline"
                            disabled={publishing}
                            className="gap-2"
                        >
                            <RotateCcw className="h-4 w-4" /> Regenerate
                        </Button>
                        <Button
                            onClick={onBack}
                            variant="ghost"
                            disabled={publishing}
                            className="gap-2"
                        >
                            <X className="h-4 w-4" /> Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
