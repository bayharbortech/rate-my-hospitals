'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/ui/icons';
import { User as UserIcon, Mail, CheckCircle, AlertCircle } from 'lucide-react';

interface ProfileSectionProps {
    email: string;
    initialDisplayName: string;
}

export function ProfileSection({ email, initialDisplayName }: ProfileSectionProps) {
    const supabase = createClient();
    const [displayName, setDisplayName] = useState(initialDisplayName);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        const { error: updateError } = await supabase.auth.updateUser({
            data: { display_name: displayName }
        });

        if (updateError) {
            setError(updateError.message);
        } else {
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        }
        setLoading(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    Profile Information
                </CardTitle>
                <CardDescription>
                    Update your display name and profile details
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                disabled
                                className="pl-10 bg-slate-50"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Email cannot be changed. Contact support if you need to update it.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Display name</Label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="displayName"
                                type="text"
                                placeholder="Enter your display name"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="pl-10"
                                disabled={loading}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            This is how your name will appear to others (optional)
                        </p>
                    </div>
                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Profile updated successfully!
                        </div>
                    )}
                    <Button type="submit" disabled={loading}>
                        {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
