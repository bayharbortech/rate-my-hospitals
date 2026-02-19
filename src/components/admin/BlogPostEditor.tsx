'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { categoryColors } from '@/lib/blog-data';
import { BlogPostRow } from '@/lib/types';
import { BLOG_CATEGORIES, DEFAULT_BLOG_IMAGE, DEFAULT_READ_TIME, BLOG_AUTHOR, BLOG_AUTHOR_SUBTITLE, formatDate, estimateReadTime } from '@/lib/constants';
import { CalendarDays, Clock, Eye, Pencil, Save, Send, ArrowLeft } from 'lucide-react';
import { ErrorBanner } from '@/components/ui/error-banner';
import Image from 'next/image';

interface BlogPostEditorProps {
    existingPost?: BlogPostRow;
    onSaved?: () => void;
}

export function BlogPostEditor({ existingPost, onSaved }: BlogPostEditorProps) {
    const [title, setTitle] = useState(existingPost?.title || '');
    const [summary, setSummary] = useState(existingPost?.summary || '');
    const [category, setCategory] = useState(existingPost?.category || '');
    const [image, setImage] = useState(existingPost?.image || DEFAULT_BLOG_IMAGE);
    const [content, setContent] = useState(existingPost?.content || '');
    const [readTime, setReadTime] = useState(existingPost?.read_time || DEFAULT_READ_TIME);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('edit');

    const today = formatDate(new Date());

    const handleContentChange = (value: string) => {
        setContent(value);
        setReadTime(estimateReadTime(value));
    };

    const handleSave = async (status: 'draft' | 'published') => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (!title || !summary || !category || !content) {
            setError('Please fill in all required fields (title, summary, category, content).');
            setLoading(false);
            return;
        }

        try {
            const method = existingPost ? 'PUT' : 'POST';
            const body = {
                ...(existingPost && { id: existingPost.id }),
                title,
                summary,
                category,
                date: existingPost?.date || today,
                readTime,
                image,
                content,
                status,
            };

            const res = await fetch('/api/blog', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save post');
            }

            setSuccess(status === 'published' ? 'Blog post published!' : 'Draft saved successfully.');
            onSaved?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="edit" className="gap-2">
                            <Pencil className="h-4 w-4" /> Edit
                        </TabsTrigger>
                        <TabsTrigger value="preview" className="gap-2">
                            <Eye className="h-4 w-4" /> Preview
                        </TabsTrigger>
                    </TabsList>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSave('draft')}
                            disabled={loading}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {loading ? 'Saving...' : 'Save Draft'}
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => handleSave('published')}
                            disabled={loading}
                        >
                            <Send className="h-4 w-4 mr-2" />
                            {loading ? 'Publishing...' : 'Publish'}
                        </Button>
                    </div>
                </div>

                <ErrorBanner message={error} />
                {success && <p className="text-sm text-green-600">{success}</p>}

                <TabsContent value="edit" className="space-y-6 mt-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="blog-title">Title *</Label>
                        <Input
                            id="blog-title"
                            placeholder="Enter a compelling blog post title..."
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Summary */}
                    <div className="space-y-2">
                        <Label htmlFor="blog-summary">Summary *</Label>
                        <Textarea
                            id="blog-summary"
                            placeholder="A brief summary that appears on the blog listing page..."
                            className="min-h-[80px]"
                            value={summary}
                            onChange={e => setSummary(e.target.value)}
                        />
                    </div>

                    {/* Category + Image + Read Time */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Category *</Label>
                            <Select onValueChange={setCategory} value={category}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {BLOG_CATEGORIES.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="blog-image">Image URL</Label>
                            <Input
                                id="blog-image"
                                placeholder="/images/blog/my-image.jpg"
                                value={image}
                                onChange={e => setImage(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="blog-readtime">Read Time</Label>
                            <Input
                                id="blog-readtime"
                                placeholder="5 min read"
                                value={readTime}
                                onChange={e => setReadTime(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                        <Label htmlFor="blog-content">Content (HTML) *</Label>
                        <p className="text-xs text-muted-foreground">
                            Use HTML tags for formatting: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;, etc.
                        </p>
                        <Textarea
                            id="blog-content"
                            placeholder="<h2>Introduction</h2>&#10;<p>Write your blog post content here...</p>"
                            className="min-h-[400px] font-mono text-sm"
                            value={content}
                            onChange={e => handleContentChange(e.target.value)}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="preview" className="mt-4">
                    {/* Preview renders the post exactly as it would appear on the blog detail page */}
                    <div className="bg-slate-50 rounded-xl p-4">
                        <div className="mb-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-muted-foreground"
                                onClick={() => setActiveTab('edit')}
                            >
                                <ArrowLeft className="w-4 h-4" /> Back to Editor
                            </Button>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm overflow-hidden border max-w-4xl mx-auto">
                            {image && (
                                <div className="relative h-[300px] w-full bg-slate-200">
                                    <Image
                                        src={image}
                                        alt={title || 'Blog post image'}
                                        fill
                                        className="object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            <div className="p-8 md:p-12">
                                <div className="flex flex-wrap gap-4 items-center mb-6">
                                    {category && (
                                        <Badge
                                            variant="secondary"
                                            className={`${categoryColors[category] || 'bg-gray-100 text-gray-700'} px-3 py-1 text-sm`}
                                        >
                                            {category}
                                        </Badge>
                                    )}
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <CalendarDays className="w-4 h-4" />
                                        {today}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        {readTime}
                                    </div>
                                </div>

                                <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-slate-900">
                                    {title || 'Untitled Post'}
                                </h1>

                                {summary && (
                                    <p className="text-lg text-muted-foreground mb-8 italic">
                                        {summary}
                                    </p>
                                )}

                                <div className="flex items-center gap-3 border-y py-6 mb-8">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold">
                                        NS
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{BLOG_AUTHOR}</p>
                                        <p className="text-xs text-muted-foreground">{BLOG_AUTHOR_SUBTITLE}</p>
                                    </div>
                                </div>

                                <div
                                    className="prose prose-slate prose-lg max-w-none
                                        prose-headings:font-bold prose-headings:text-slate-900
                                        prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                                        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                                        prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4
                                        prose-li:text-slate-700 prose-li:my-1
                                        prose-ul:my-4 prose-ol:my-4
                                        prose-strong:text-slate-900
                                        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
                                    dangerouslySetInnerHTML={{ __html: content || '<p class="text-muted-foreground">Start writing content to see the preview...</p>' }}
                                />
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
