import { z } from 'zod';

const clientEnvSchema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
});

const serverEnvSchema = z.object({
    ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY is required'),
});

type ClientEnv = z.infer<typeof clientEnvSchema>;

let _clientEnv: ClientEnv | null = null;

/**
 * Validated public environment variables.
 * Lazily validated on first access to avoid crashing during static builds.
 */
export function getClientEnv(): ClientEnv {
    if (_clientEnv) return _clientEnv;

    const result = clientEnvSchema.safeParse({
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });

    if (!result.success) {
        const formatted = result.error.issues
            .map(i => `  - ${i.path.join('.')}: ${i.message}`)
            .join('\n');
        throw new Error(
            `\n❌ Missing or invalid environment variables:\n${formatted}\n\n` +
            `Check your .env.local file or Vercel environment settings.\n` +
            `See: https://supabase.com/dashboard/project/_/settings/api\n`
        );
    }

    _clientEnv = result.data;
    return _clientEnv;
}

/**
 * Validated server-only environment variables (e.g., API keys).
 * Only call from server-side code (API routes, server components).
 */
export function getServerEnv() {
    const result = serverEnvSchema.safeParse({
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY?.trim(),
    });

    if (!result.success) {
        const formatted = result.error.issues
            .map(i => `  - ${i.path.join('.')}: ${i.message}`)
            .join('\n');
        throw new Error(`Missing server environment variables:\n${formatted}`);
    }

    return result.data;
}
