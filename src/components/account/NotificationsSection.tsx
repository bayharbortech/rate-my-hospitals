'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Icons } from '@/components/ui/icons';
import { Bell, CheckCircle } from 'lucide-react';

export function NotificationsSection() {
    const [emailNewReviews, setEmailNewReviews] = useState(true);
    const [emailWeeklyDigest, setEmailWeeklyDigest] = useState(true);
    const [emailProductUpdates, setEmailProductUpdates] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        setLoading(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Email Preferences
                </CardTitle>
                <CardDescription>
                    Choose what emails you want to receive
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>New reviews on followed hospitals</Label>
                        <p className="text-sm text-muted-foreground">
                            Get notified when new reviews are posted for hospitals you follow
                        </p>
                    </div>
                    <Switch checked={emailNewReviews} onCheckedChange={setEmailNewReviews} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Weekly digest</Label>
                        <p className="text-sm text-muted-foreground">
                            A weekly summary of new reviews and trending hospitals
                        </p>
                    </div>
                    <Switch checked={emailWeeklyDigest} onCheckedChange={setEmailWeeklyDigest} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Product updates</Label>
                        <p className="text-sm text-muted-foreground">
                            News about new features and improvements
                        </p>
                    </div>
                    <Switch checked={emailProductUpdates} onCheckedChange={setEmailProductUpdates} />
                </div>
                {success && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        Preferences saved!
                    </div>
                )}
                <Button onClick={handleSave} disabled={loading}>
                    {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                    Save Preferences
                </Button>
            </CardContent>
        </Card>
    );
}
