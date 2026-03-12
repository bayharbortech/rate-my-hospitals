'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Icons } from '@/components/ui/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ErrorBanner } from '@/components/ui/error-banner'
import { loginSchema, signupSchema, LoginFormData, SignupFormData } from '@/lib/schemas'

interface AuthFormProps {
    defaultView?: 'login' | 'signup'
    redirectTo?: string
}

export function AuthForm({ defaultView = 'login', redirectTo }: AuthFormProps) {
    const [loading, setLoading] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const loginForm = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    })

    const signupForm = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: { email: '', password: '' },
    })

    const handleEmailLogin = async (data: LoginFormData) => {
        setLoading(true)
        setServerError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        })

        if (error) {
            setServerError(error.message)
        } else {
            router.push(redirectTo || '/')
            router.refresh()
        }
        setLoading(false)
    }

    const handleEmailSignUp = async (data: SignupFormData) => {
        setLoading(true)
        setServerError(null)

        const { error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                emailRedirectTo: `${location.origin}/auth/callback`,
            },
        })

        if (error) {
            setServerError(error.message)
        } else {
            setServerError('Check your email for the confirmation link.')
        }
        setLoading(false)
    }

    const handleSocialLogin = async (provider: 'google' | 'github') => {
        setLoading(true)
        const callbackUrl = new URL('/auth/callback', location.origin)
        if (redirectTo) {
            callbackUrl.searchParams.set('next', redirectTo)
        }
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: callbackUrl.toString(),
            },
        })

        if (error) {
            setServerError(error.message)
            setLoading(false)
        }
    }

    return (
        <Card className="w-[400px]">
            <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>Sign in to your account to continue</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" onClick={() => handleSocialLogin('google')} disabled={loading}>
                            <Icons.google className="mr-2 h-4 w-4" />
                            Google
                        </Button>
                        <Button variant="outline" onClick={() => handleSocialLogin('github')} disabled={loading}>
                            <Icons.github className="mr-2 h-4 w-4" />
                            Github
                        </Button>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>
                    <Tabs defaultValue={defaultView} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                        </TabsList>
                        <TabsContent value="login">
                            <form onSubmit={loginForm.handleSubmit(handleEmailLogin)}>
                                <div className="grid gap-2">
                                    <div className="grid gap-1">
                                        <Label htmlFor="login-email">Email</Label>
                                        <Input
                                            id="login-email"
                                            placeholder="name@example.com"
                                            type="email"
                                            autoCapitalize="none"
                                            autoComplete="email"
                                            autoCorrect="off"
                                            disabled={loading}
                                            {...loginForm.register('email')}
                                        />
                                        {loginForm.formState.errors.email && (
                                            <p className="text-sm text-red-600">{loginForm.formState.errors.email.message}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-1">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="login-password">Password</Label>
                                            <Link
                                                href="/forgot-password"
                                                className="text-sm text-primary hover:underline"
                                            >
                                                Forgot password?
                                            </Link>
                                        </div>
                                        <Input
                                            id="login-password"
                                            placeholder="Password"
                                            type="password"
                                            autoCapitalize="none"
                                            autoComplete="current-password"
                                            disabled={loading}
                                            {...loginForm.register('password')}
                                        />
                                        {loginForm.formState.errors.password && (
                                            <p className="text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
                                        )}
                                    </div>
                                    <Button disabled={loading}>
                                        {loading && (
                                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Sign In with Email
                                    </Button>
                                </div>
                            </form>
                        </TabsContent>
                        <TabsContent value="signup">
                            <form onSubmit={signupForm.handleSubmit(handleEmailSignUp)}>
                                <div className="grid gap-2">
                                    <div className="grid gap-1">
                                        <Label htmlFor="signup-email">Email</Label>
                                        <Input
                                            id="signup-email"
                                            placeholder="name@example.com"
                                            type="email"
                                            autoCapitalize="none"
                                            autoComplete="email"
                                            autoCorrect="off"
                                            disabled={loading}
                                            {...signupForm.register('email')}
                                        />
                                        {signupForm.formState.errors.email && (
                                            <p className="text-sm text-red-600">{signupForm.formState.errors.email.message}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-1">
                                        <Label htmlFor="signup-password">Password</Label>
                                        <Input
                                            id="signup-password"
                                            placeholder="Password (min 8 characters)"
                                            type="password"
                                            autoCapitalize="none"
                                            autoComplete="new-password"
                                            disabled={loading}
                                            {...signupForm.register('password')}
                                        />
                                        {signupForm.formState.errors.password && (
                                            <p className="text-sm text-red-600">{signupForm.formState.errors.password.message}</p>
                                        )}
                                    </div>
                                    <Button disabled={loading}>
                                        {loading && (
                                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Sign Up with Email
                                    </Button>
                                </div>
                            </form>
                        </TabsContent>
                    </Tabs>
                    <ErrorBanner message={serverError} />
                </div>
            </CardContent>
        </Card>
    )
}
