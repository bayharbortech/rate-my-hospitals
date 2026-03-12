'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { BlogPostRow, BlogTopic } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { categoryColors } from '@/lib/blog-data';
import { Plus, Pencil, Eye, Trash2, FileText, Download } from 'lucide-react';
import { ErrorBanner } from '@/components/ui/error-banner';
import { BlogPostEditor } from './BlogPostEditor';
import { BlogTopicManager } from './BlogTopicManager';
import { BlogPostGenerator } from './BlogPostGenerator';

export function BlogManagement() {
    const queryClient = useQueryClient();
    const [view, setView] = useState<'list' | 'create' | 'edit' | 'generate'>('list');
    const [editingPost, setEditingPost] = useState<BlogPostRow | null>(null);
    const [generateTopic, setGenerateTopic] = useState<BlogTopic | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const [seedMessage, setSeedMessage] = useState<string | null>(null);

    const { data: posts = [], isLoading, error: fetchError } = useQuery<BlogPostRow[]>({
        queryKey: ['blog-posts'],
        queryFn: async () => {
            const res = await fetch('/api/blog');
            if (!res.ok) throw new Error('Failed to fetch blog posts');
            return res.json();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const supabase = createClient();
            const { error } = await supabase.from('blog_posts').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
        },
    });

    const seedMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/blog/seed', { method: 'POST' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to import posts');
            return data;
        },
        onSuccess: (data) => {
            setSeedMessage(data.message);
            queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
        },
    });

    const requestDelete = (id: number) => {
        setPendingDeleteId(id);
        setDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        if (!pendingDeleteId) return;
        setDeleteDialogOpen(false);
        deleteMutation.mutate(pendingDeleteId);
        setPendingDeleteId(null);
    };

    const handleSaved = () => {
        queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
        setView('list');
        setEditingPost(null);
    };

    const errorMessage = fetchError?.message || deleteMutation.error?.message || seedMutation.error?.message || null;

    if (view === 'generate' && generateTopic) {
        return (
            <BlogPostGenerator
                topic={generateTopic}
                onBack={() => { setView('list'); setGenerateTopic(null); }}
                onPublished={() => {
                    setView('list');
                    setGenerateTopic(null);
                    queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
                }}
            />
        );
    }

    if (view === 'create') {
        return (
            <div>
                <Button variant="ghost" className="mb-4 gap-2" onClick={() => setView('list')}>
                    ← Back to Posts
                </Button>
                <h3 className="text-lg font-semibold mb-4">Create New Blog Post</h3>
                <BlogPostEditor onSaved={handleSaved} />
            </div>
        );
    }

    if (view === 'edit' && editingPost) {
        return (
            <div>
                <Button variant="ghost" className="mb-4 gap-2" onClick={() => { setView('list'); setEditingPost(null); }}>
                    ← Back to Posts
                </Button>
                <h3 className="text-lg font-semibold mb-4">Edit Blog Post</h3>
                <BlogPostEditor existingPost={editingPost} onSaved={handleSaved} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {posts.length} post{posts.length !== 1 ? 's' : ''} in database
                </p>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => seedMutation.mutate()}
                        disabled={seedMutation.isPending}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        {seedMutation.isPending ? 'Importing...' : 'Import Static Posts'}
                    </Button>
                    <Button size="sm" onClick={() => setView('create')}>
                        <Plus className="h-4 w-4 mr-2" /> New Blog Post
                    </Button>
                </div>
            </div>

            {seedMessage && (
                <p className="text-sm text-green-600">{seedMessage}</p>
            )}
            <ErrorBanner message={errorMessage} />

            <BlogTopicManager
                onGenerate={(topic) => {
                    setGenerateTopic(topic);
                    setView('generate');
                }}
            />

            <Separator />

            {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">Loading blog posts...</div>
            ) : posts.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No blog posts in database</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Import the existing static blog posts into the database, or create a new one.
                        </p>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
                                <Download className="h-4 w-4 mr-2" />
                                {seedMutation.isPending ? 'Importing...' : 'Import Static Posts'}
                            </Button>
                            <Button onClick={() => setView('create')}>
                                <Plus className="h-4 w-4 mr-2" /> Create New Post
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {posts.map(post => (
                        <Card key={post.id}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge
                                                variant="secondary"
                                                className={categoryColors[post.category] || 'bg-gray-100 text-gray-700'}
                                            >
                                                {post.category}
                                            </Badge>
                                            <Badge
                                                variant={post.status === 'published' ? 'default' : 'outline'}
                                            >
                                                {post.status}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-base truncate">{post.title}</CardTitle>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {post.date} · {post.read_time}
                                        </p>
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" title="View on blog"
                                            onClick={() => window.open(`/blog/${post.id}`, '_blank')}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit"
                                            onClick={() => { setEditingPost(post); setView('edit'); }}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon"
                                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                            title="Delete"
                                            onClick={() => requestDelete(post.id)}
                                            disabled={deleteMutation.isPending}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <p className="text-sm text-muted-foreground line-clamp-2">{post.summary}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this blog post? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
