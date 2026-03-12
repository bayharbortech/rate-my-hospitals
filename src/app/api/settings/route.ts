import { formatISO } from 'date-fns';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET — read all app settings (admin only)
export async function GET() {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await admin.supabase
        .from('app_settings')
        .select('key, value');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Convert rows to a key-value object
    const settings: Record<string, unknown> = {};
    for (const row of data || []) {
        settings[row.key] = row.value;
    }

    return NextResponse.json(settings);
}

// PUT — update a single setting (admin only)
export async function PUT(request: NextRequest) {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let body: { key: string; value: unknown };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    if (!body.key) {
        return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    const { error } = await admin.supabase
        .from('app_settings')
        .upsert({
            key: body.key,
            value: body.value,
            updated_at: formatISO(new Date()),
        });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

// Standalone helper for server-side code to read a setting
export async function getAppSetting(key: string): Promise<unknown> {
    const supabase = await createClient();
    const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', key)
        .single();

    return data?.value ?? null;
}
