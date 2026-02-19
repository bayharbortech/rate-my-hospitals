'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Icons } from '@/components/ui/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ErrorBanner } from '@/components/ui/error-banner'

interface AuthFormProps {
    defaultView?: 'login' | 'signup'
    redirectTo?: string
}

export function AuthForm({ defaultView = 'login', redirectTo }: AuthFormProps) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
        } else {
            router.push(redirectTo || '/')
            router.refresh()
        }
        setLoading(false)
    }

    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${location.origin}/auth/callback`,
            },
        })

        if (error) {
            setError(error.message)
        } else {
            setError('Check your email for the confirmation link.')
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
            setError(error.message)
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
                            <form onSubmit={handleEmailLogin}>
                                <div className="grid gap-2">
                                    <div className="grid gap-1">
                                        <Label htmlFor="email">Email</Label>
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
                                        />
                                    </div>
                                    <div className="grid gap-1">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password">Password</Label>
                                            <Link
                                                href="/forgot-password"
                                                className="text-sm text-primary hover:underline"
                                            >
                                                Forgot password?
                                            </Link>
                                        </div>
                                        <Input
                                            id="password"
                                            placeholder="Password"
                                            type="password"
                                            autoCapitalize="none"
                                            autoComplete="current-password"
                                            disabled={loading}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
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
                            <form onSubmit={handleEmailSignUp}>
                                <div className="grid gap-2">
                                    <div className="grid gap-1">
                                        <Label htmlFor="email">Email</Label>
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
                                        />
                                    </div>
                                    <div className="grid gap-1">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            placeholder="Password"
                                            type="password"
                                            autoCapitalize="none"
                                            autoComplete="new-password"
                                            disabled={loading}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
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
                    <ErrorBanner message={error} />
                </div>
            </CardContent>
        </Card>
    )
}
