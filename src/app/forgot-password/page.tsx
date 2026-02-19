'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { ErrorBanner } from '@/components/ui/error-banner';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const supabase = createClient();

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
            setError(error.message);
        } else {
            setSuccess(true);
        }
        setLoading(false);
    };

    return (
        <div className="container mx-auto flex h-screen w-screen flex-col items-center justify-center">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                <Link
                    href="/login"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to login
                </Link>

                <Card>
                    <CardHeader>
                        <CardTitle>Forgot your password?</CardTitle>
                        <CardDescription>
                            Enter your email address and we&apos;ll send you a link to reset your password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {success ? (
                            <div className="text-center py-4">
                                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="font-semibold text-lg mb-2">Check your email</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    We&apos;ve sent a password reset link to <strong>{email}</strong>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Didn&apos;t receive the email? Check your spam folder or{' '}
                                    <button
                                        onClick={() => setSuccess(false)}
                                        className="text-primary hover:underline"
                                    >
                                        try again
                                    </button>
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleResetPassword}>
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                placeholder="name@example.com"
                                                type="email"
                                                autoCapitalize="none"
                                                autoComplete="email"
                                                autoCorrect="off"
                                                disabled={loading}
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <ErrorBanner message={error} />
                                    <Button disabled={loading || !email}>
                                        {loading && (
                                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Send reset link
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>

                <p className="text-center text-sm text-muted-foreground">
                    Remember your password?{' '}
                    <Link href="/login" className="text-primary hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
