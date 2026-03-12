'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { CheckCircle, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { ErrorBanner } from '@/components/ui/error-banner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { resetPasswordSchema, ResetPasswordFormData } from '@/lib/schemas';

export default function ResetPasswordClient() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
    const supabase = createClient();
    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { password: '', confirmPassword: '' },
    });

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsValidSession(!!session);
        };
        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setIsValidSession(true);
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    const onSubmit = async (data: ResetPasswordFormData) => {
        setServerError(null);
        setLoading(true);

        const { error } = await supabase.auth.updateUser({
            password: data.password,
        });

        if (error) {
            setServerError(error.message);
        } else {
            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        }
        setLoading(false);
    };

    if (isValidSession === null) {
        return (
            <div className="container mx-auto flex h-screen w-screen flex-col items-center justify-center">
                <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isValidSession === false) {
        return (
            <div className="container mx-auto flex h-screen w-screen flex-col items-center justify-center">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                    <Card>
                        <CardHeader>
                            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <CardTitle className="text-center">Invalid or expired link</CardTitle>
                            <CardDescription className="text-center">
                                This password reset link is invalid or has expired. Please request a new one.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/forgot-password">
                                <Button className="w-full">Request new reset link</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto flex h-screen w-screen flex-col items-center justify-center">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                <Card>
                    <CardHeader>
                        <CardTitle>Reset your password</CardTitle>
                        <CardDescription>
                            Enter your new password below.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {success ? (
                            <div className="text-center py-4">
                                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="font-semibold text-lg mb-2">Password updated!</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Your password has been successfully reset. You&apos;ll be redirected to the login page shortly.
                                </p>
                                <Link href="/login">
                                    <Button variant="outline" className="w-full">
                                        Go to login now
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">New password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="password"
                                                placeholder="Enter new password"
                                                type={showPassword ? 'text' : 'password'}
                                                autoCapitalize="none"
                                                autoComplete="new-password"
                                                disabled={loading}
                                                className="pl-10 pr-10"
                                                {...register('password')}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Must be at least 8 characters
                                        </p>
                                        {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="confirmPassword">Confirm new password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="confirmPassword"
                                                placeholder="Confirm new password"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                autoCapitalize="none"
                                                autoComplete="new-password"
                                                disabled={loading}
                                                className="pl-10 pr-10"
                                                {...register('confirmPassword')}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>}
                                    </div>
                                    <ErrorBanner message={serverError} />
                                    <Button disabled={loading}>
                                        {loading && (
                                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Reset password
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
