'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/ui/icons';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, Shield } from 'lucide-react';

export function DangerZoneSection() {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    const handleDelete = async () => {
        if (confirmText !== 'DELETE') return;
        setLoading(true);
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <>
            {/* Privacy & Security */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Privacy & Security
                    </CardTitle>
                    <CardDescription>
                        Manage your privacy settings and data
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Your data</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                            All your reviews are posted anonymously. Your email address is never
                            shared with hospitals or other users.
                        </p>
                        <Button variant="outline" size="sm">
                            Download my data
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                        <Trash2 className="h-5 w-5" />
                        Danger Zone
                    </CardTitle>
                    <CardDescription>
                        Irreversible actions that affect your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-red-50 rounded-lg p-4">
                        <h4 className="font-medium text-red-800 mb-2">Delete account</h4>
                        <p className="text-sm text-red-700 mb-4">
                            Once you delete your account, there is no going back. All your data,
                            including reviews and saved hospitals, will be permanently removed.
                        </p>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    Delete my account
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your
                                        account and remove all your data from our servers, including:
                                        <ul className="list-disc list-inside mt-2 space-y-1">
                                            <li>All your reviews</li>
                                            <li>Saved hospitals and notes</li>
                                            <li>Questions and answers</li>
                                            <li>Account preferences</li>
                                        </ul>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="py-4">
                                    <Label htmlFor="deleteConfirm" className="text-sm font-medium">
                                        Type DELETE to confirm
                                    </Label>
                                    <Input
                                        id="deleteConfirm"
                                        className="mt-2"
                                        placeholder="DELETE"
                                        value={confirmText}
                                        onChange={(e) => setConfirmText(e.target.value)}
                                    />
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setConfirmText('')}>
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        disabled={confirmText !== 'DELETE' || loading}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                                        Delete account
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
