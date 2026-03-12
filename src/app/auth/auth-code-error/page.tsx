import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default async function AuthCodeErrorPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const { error } = await searchParams;

    return (
        <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <CardTitle>Sign-in Failed</CardTitle>
                    <CardDescription>
                        We couldn&apos;t complete the sign-in process. This can happen if the session expired or the authentication was cancelled.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </p>
                    )}
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Try the following:</p>
                        <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                            <li>Clear your browser cookies for this site and try again</li>
                            <li>If using Google sign-in, make sure you&apos;re signed into Google first</li>
                            <li>Try using email/password sign-in instead</li>
                        </ul>
                    </div>
                    <div className="flex gap-3">
                        <Button asChild className="flex-1">
                            <Link href="/login">Try Again</Link>
                        </Button>
                        <Button asChild variant="outline" className="flex-1">
                            <Link href="/">Go Home</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
