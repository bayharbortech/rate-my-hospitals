'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BlogTopic } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
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
import { ErrorBanner } from '@/components/ui/error-banner';
import {
    Plus, Pencil, Trash2, Sparkles, Loader2, Check, X, ListChecks,
} from 'lucide-react';

interface BlogTopicManagerProps {
    onGenerate: (topic: BlogTopic) => void;
}

export function BlogTopicManager({ onGenerate }: BlogTopicManagerProps) {
    const queryClient = useQueryClient();
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formTitle, setFormTitle] = useState('');
    const [formDescription, setFormDescription] = useState('');

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

    const { data: topics = [], isLoading, error: fetchError } = useQuery<BlogTopic[]>({
        queryKey: ['blog-topics'],
        queryFn: async () => {
            const res = await fetch('/api/blog/topics');
            if (!res.ok) throw new Error('Failed to load topics');
            return res.json();
        },
    });

    const saveMutation = useMutation({
        mutationFn: async ({ id, title, description }: { id?: number; title: string; description?: string }) => {
            const isEditing = id !== undefined;
            const res = await fetch('/api/blog/topics', {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...(isEditing && { id }),
                    title: title.trim(),
                    description: description?.trim() || undefined,
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save topic');
            }
        },
        onSuccess: () => {
            resetForm();
            queryClient.invalidateQueries({ queryKey: ['blog-topics'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/blog/topics?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete topic');
            return id;
        },
        onSuccess: (deletedId) => {
            if (selectedId === deletedId) setSelectedId(null);
            queryClient.invalidateQueries({ queryKey: ['blog-topics'] });
        },
    });

    const resetForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormTitle('');
        setFormDescription('');
    };

    const openAddForm = () => {
        resetForm();
        setShowForm(true);
    };

    const openEditForm = (topic: BlogTopic) => {
        setEditingId(topic.id);
        setFormTitle(topic.title);
        setFormDescription(topic.description || '');
        setShowForm(true);
    };

    const handleSave = () => {
        if (!formTitle.trim()) return;
        saveMutation.mutate({
            id: editingId ?? undefined,
            title: formTitle,
            description: formDescription,
        });
    };

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

    const selectedTopic = topics.find(t => t.id === selectedId);
    const errorMessage = fetchError?.message || saveMutation.error?.message || deleteMutation.error?.message || null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ListChecks className="h-5 w-5 text-teal-600" />
                    <h3 className="text-base font-semibold">Blog Topics</h3>
                    <span className="text-xs text-muted-foreground">({topics.length})</span>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={openAddForm} disabled={showForm}>
                        <Plus className="h-4 w-4 mr-1" /> Add Topic
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => selectedTopic && onGenerate(selectedTopic)}
                        disabled={!selectedTopic}
                        className="gap-1"
                    >
                        <Sparkles className="h-4 w-4" /> Generate Blog Post
                    </Button>
                </div>
            </div>

            <ErrorBanner message={errorMessage} />

            {showForm && (
                <Card className="border-teal-200 bg-teal-50/30">
                    <CardContent className="pt-4 space-y-3">
                        <div className="space-y-1">
                            <Input
                                placeholder="Topic title (e.g., Work/Life Balance as a Traveling Nurse)"
                                value={formTitle}
                                onChange={e => setFormTitle(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="space-y-1">
                            <Textarea
                                placeholder="Optional: describe this topic in more detail (one paragraph)..."
                                value={formDescription}
                                onChange={e => setFormDescription(e.target.value)}
                                className="min-h-[80px]"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={!formTitle.trim() || saveMutation.isPending}
                            >
                                {saveMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : (
                                    <Check className="h-4 w-4 mr-1" />
                                )}
                                {editingId ? 'Update' : 'Save'}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={resetForm} disabled={saveMutation.isPending}>
                                <X className="h-4 w-4 mr-1" /> Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {isLoading ? (
                <div className="text-center py-6 text-muted-foreground text-sm">Loading topics...</div>
            ) : topics.length === 0 && !showForm ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                    No topics yet. Add a topic to get started with AI blog generation.
                </div>
            ) : (
                <div className="space-y-2">
                    {topics.map(topic => (
                        <div
                            key={topic.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                selectedId === topic.id
                                    ? 'border-teal-400 bg-teal-50 ring-1 ring-teal-300'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                            onClick={() => setSelectedId(selectedId === topic.id ? null : topic.id)}
                        >
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{topic.title}</p>
                                {topic.description && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {topic.description}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-1 shrink-0">
                                <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit"
                                    onClick={e => { e.stopPropagation(); openEditForm(topic); }}>
                                    <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon"
                                    className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    title="Delete"
                                    onClick={e => { e.stopPropagation(); requestDelete(topic.id); }}
                                    disabled={deleteMutation.isPending}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Topic</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this topic and its description? This action cannot be undone.
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
