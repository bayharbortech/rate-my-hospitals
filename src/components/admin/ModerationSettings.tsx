'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Settings } from 'lucide-react';

interface ModerationSettingsProps {
    onError: (message: string) => void;
}

interface SettingsData {
    auto_ai_review_on_resubmit?: boolean;
    auto_return_non_approved?: boolean;
}

export function ModerationSettings({ onError }: ModerationSettingsProps) {
    const queryClient = useQueryClient();

    const { data: settings, isLoading } = useQuery<SettingsData>({
        queryKey: ['moderation-settings'],
        queryFn: async () => {
            const res = await fetch('/api/settings');
            if (!res.ok) return {};
            return res.json();
        },
    });

    const toggleMutation = useMutation({
        mutationFn: async ({ key, value }: { key: string; value: boolean }) => {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value }),
            });
            if (!res.ok) throw new Error('Failed to save setting');
            return { key, value };
        },
        onMutate: async ({ key, value }) => {
            await queryClient.cancelQueries({ queryKey: ['moderation-settings'] });
            const previous = queryClient.getQueryData<SettingsData>(['moderation-settings']);
            queryClient.setQueryData<SettingsData>(['moderation-settings'], old => ({
                ...old,
                [key]: value,
            }));
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(['moderation-settings'], context.previous);
            }
            onError('Failed to save setting');
        },
    });

    const autoAiResubmit = settings?.auto_ai_review_on_resubmit === true;
    const autoReturnNonApproved = settings?.auto_return_non_approved === true;

    return (
        <div className="space-y-3 p-4 bg-slate-50 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-700">Queue Automation</span>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor="auto-ai-toggle" className="text-sm font-medium cursor-pointer">
                        Auto AI review on resubmission
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        Run AI compliance review automatically when a user resubmits a revised review
                    </p>
                </div>
                <Switch
                    id="auto-ai-toggle"
                    checked={autoAiResubmit}
                    onCheckedChange={(checked) => toggleMutation.mutate({ key: 'auto_ai_review_on_resubmit', value: checked })}
                    disabled={isLoading}
                />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor="auto-return-toggle" className="text-sm font-medium cursor-pointer">
                        Auto-return non-approved reviews to user
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        Automatically send reviews back to the user for revision when AI does not recommend &quot;Approve&quot;
                    </p>
                </div>
                <Switch
                    id="auto-return-toggle"
                    checked={autoReturnNonApproved}
                    onCheckedChange={(checked) => toggleMutation.mutate({ key: 'auto_return_non_approved', value: checked })}
                    disabled={isLoading}
                />
            </div>
        </div>
    );
}
