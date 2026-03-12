'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Settings } from 'lucide-react';

interface ModerationSettingsProps {
    onError: (message: string) => void;
}

export function ModerationSettings({ onError }: ModerationSettingsProps) {
    const [autoAiResubmit, setAutoAiResubmit] = useState(false);
    const [autoReturnNonApproved, setAutoReturnNonApproved] = useState(false);
    const [settingsLoading, setSettingsLoading] = useState(true);

    useEffect(() => {
        async function loadSettings() {
            try {
                const res = await fetch('/api/settings');
                if (res.ok) {
                    const data = await res.json();
                    setAutoAiResubmit(data.auto_ai_review_on_resubmit === true);
                    setAutoReturnNonApproved(data.auto_return_non_approved === true);
                }
            } catch {
                // silently fall back to off
            } finally {
                setSettingsLoading(false);
            }
        }
        loadSettings();
    }, []);

    const handleToggle = async (
        key: string,
        checked: boolean,
        setter: (val: boolean) => void
    ) => {
        setter(checked);
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value: checked }),
            });
            if (!res.ok) {
                setter(!checked);
                onError('Failed to save setting');
            }
        } catch {
            setter(!checked);
            onError('Failed to save setting');
        }
    };

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
                    onCheckedChange={(checked) => handleToggle('auto_ai_review_on_resubmit', checked, setAutoAiResubmit)}
                    disabled={settingsLoading}
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
                    onCheckedChange={(checked) => handleToggle('auto_return_non_approved', checked, setAutoReturnNonApproved)}
                    disabled={settingsLoading}
                />
            </div>
        </div>
    );
}
