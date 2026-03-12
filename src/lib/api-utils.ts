import { NextRequest, NextResponse } from 'next/server';
import { z, ZodSchema } from 'zod';

export async function parseBody<T>(
    request: NextRequest,
    schema: ZodSchema<T>
): Promise<{ data: T } | { error: NextResponse }> {
    let raw: unknown;
    try {
        raw = await request.json();
    } catch {
        return { error: NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) };
    }

    const result = schema.safeParse(raw);
    if (!result.success) {
        const messages = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`);
        return {
            error: NextResponse.json(
                { error: 'Validation failed', details: messages },
                { status: 400 },
            ),
        };
    }

    return { data: result.data };
}
