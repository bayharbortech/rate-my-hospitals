import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (
            !user &&
            !request.nextUrl.pathname.startsWith('/login') &&
            !request.nextUrl.pathname.startsWith('/auth')
        ) {
            // no user, potentially respond by redirecting the user to the login page
            // const url = request.nextUrl.clone()
            // url.pathname = '/login'
            // return NextResponse.redirect(url)
        }
    } catch (error) {
        // If session refresh fails (e.g. expired OAuth refresh token),
        // allow the request to continue rather than crashing the middleware.
        // The page handler will handle the unauthenticated state.
        console.error('Middleware session refresh failed:', error)
    }

    // Prevent Vercel edge from caching authenticated responses.
    // Without this, OAuth users can get served stale cached pages
    // from whichever deployment they first logged in on.
    supabaseResponse.headers.set('x-middleware-cache', 'no-cache')
    supabaseResponse.headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate')

    return supabaseResponse
}
