import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'
            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        }

        // Log the error for debugging in Vercel runtime logs
        console.error('OAuth code exchange failed:', error.message)

        const errorUrl = new URL('/auth/auth-code-error', origin)
        errorUrl.searchParams.set('error', error.message)
        return NextResponse.redirect(errorUrl.toString())
    }

    // No code parameter provided
    console.error('OAuth callback called without code parameter')
    const errorUrl = new URL('/auth/auth-code-error', origin)
    errorUrl.searchParams.set('error', 'No authentication code received. Please try signing in again.')
    return NextResponse.redirect(errorUrl.toString())
}
