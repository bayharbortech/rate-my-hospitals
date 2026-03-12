import { formatISO } from 'date-fns';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { parseBody } from '@/lib/api-utils';
import { settingUpdateApiSchema } from '@/lib/schemas';

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

    const settings: Record<string, unknown> = {};
    for (const row of data || []) {
        settings[row.key] = row.value;
    }

    return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const parsed = await parseBody(request, settingUpdateApiSchema);
    if ('error' in parsed) return parsed.error;
    const body = parsed.data;

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

export async function getAppSetting(key: string): Promise<unknown> {
    const supabase = await createClient();
    const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', key)
        .single();

    return data?.value ?? null;
}
