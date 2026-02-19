'use client';

import { useState, useEffect } from 'react';
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
    const [topics, setTopics] = useState<BlogTopic[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Add/edit form state
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formTitle, setFormTitle] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [saving, setSaving] = useState(false);

    // Delete state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchTopics = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/blog/topics');
            if (res.ok) {
                const data = await res.json();
                setTopics(data);
            } else {
                setErrorMessage('Failed to load topics.');
            }
        } catch {
            setErrorMessage('Failed to load topics.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTopics();
    }, []);

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

    const handleSave = async () => {
        if (!formTitle.trim()) return;
        setSaving(true);
        setErrorMessage(null);

        try {
            const isEditing = editingId !== null;
            const res = await fetch('/api/blog/topics', {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...(isEditing && { id: editingId }),
                    title: formTitle.trim(),
                    description: formDescription.trim() || undefined,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save topic');
            }

            resetForm();
            fetchTopics();
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Failed to save topic');
        } finally {
            setSaving(false);
        }
    };

    const requestDelete = (id: number) => {
        setPendingDeleteId(id);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!pendingDeleteId) return;
        setDeleteDialogOpen(false);
        setDeleting(true);
        setErrorMessage(null);

        try {
            const res = await fetch(`/api/blog/topics?id=${pendingDeleteId}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                throw new Error('Failed to delete topic');
            }
            if (selectedId === pendingDeleteId) setSelectedId(null);
            setTopics(prev => prev.filter(t => t.id !== pendingDeleteId));
        } catch {
            setErrorMessage('Failed to delete topic.');
        } finally {
            setDeleting(false);
            setPendingDeleteId(null);
        }
    };

    const selectedTopic = topics.find(t => t.id === selectedId);

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

            {/* Add / Edit form */}
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
                                disabled={!formTitle.trim() || saving}
                            >
                                {saving ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : (
                                    <Check className="h-4 w-4 mr-1" />
                                )}
                                {editingId ? 'Update' : 'Save'}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={resetForm} disabled={saving}>
                                <X className="h-4 w-4 mr-1" /> Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Topic list */}
            {loading ? (
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
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    title="Edit"
                                    onClick={e => { e.stopPropagation(); openEditForm(topic); }}
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    title="Delete"
                                    onClick={e => { e.stopPropagation(); requestDelete(topic.id); }}
                                    disabled={deleting}
                                >
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
