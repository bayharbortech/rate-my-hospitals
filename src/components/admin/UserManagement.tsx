'use client'

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldOff, User as UserIcon } from 'lucide-react';
import { ErrorBanner } from '@/components/ui/error-banner';
import { useRouter } from 'next/navigation';

interface UserManagementProps {
    users: User[];
}

export function UserManagement({ users: initialUsers }: UserManagementProps) {
    const [users, setUsers] = useState(initialUsers);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const toggleAdmin = async (userId: string) => {
        setLoadingId(userId);
        setErrorMessage(null);

        const { error } = await supabase.rpc('toggle_admin_status', {
            target_user_id: userId
        });

        if (error) {
            setErrorMessage('Failed to update user status: ' + error.message);
        } else {
            // Optimistic update
            setUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, is_admin: !u.is_admin } : u
            ));
            router.refresh();
        }
        setLoadingId(null);
    };

    return (
        <div className="space-y-4">
            <ErrorBanner message={errorMessage} />
            <Card>
                <CardHeader>
                    <CardTitle>Registered Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {users.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${user.is_admin ? 'bg-purple-100 text-purple-600' : 'bg-slate-200 text-slate-600'}`}>
                                        {user.is_admin ? <Shield className="h-5 w-5" /> : <UserIcon className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium">{user.email}</p>
                                        <div className="flex gap-2 mt-1">
                                            <Badge variant={user.is_admin ? "default" : "secondary"}>
                                                {user.is_admin ? 'Admin' : 'User'}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground self-center">
                                                ID: {user.id.substring(0, 8)}...
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant={user.is_admin ? "destructive" : "default"}
                                    size="sm"
                                    disabled={loadingId === user.id}
                                    onClick={() => toggleAdmin(user.id)}
                                >
                                    {loadingId === user.id ? 'Updating...' : (
                                        user.is_admin ? (
                                            <>
                                                <ShieldOff className="h-4 w-4 mr-2" />
                                                Revoke Admin
                                            </>
                                        ) : (
                                            <>
                                                <Shield className="h-4 w-4 mr-2" />
                                                Make Admin
                                            </>
                                        )
                                    )}
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
