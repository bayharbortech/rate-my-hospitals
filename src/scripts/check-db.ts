import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    console.error('Missing environment variables');
    process.exit(1);
}

async function check() {
    console.log('Checking database connection...');
    console.log('URL:', supabaseUrl?.substring(0, 20) + '...');

    // 1. Check with Service Role (Bypasses RLS)
    const adminClient = createClient(supabaseUrl!, supabaseServiceKey!);

    // Try to insert one row to verify write access
    const { error: insertError } = await adminClient.from('employers').upsert({
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Test Hospital',
        type: 'hospital',
        address: '123 Test St',
        city: 'Test City',
        state: 'CA',
        zip_code: '90000'
    });
    if (insertError) {
        console.error('Insert Test Error:', insertError);
    } else {
        console.log('Insert Test Success');
    }

    const { data: adminData, error: adminError } = await adminClient
        .from('employers')
        .select('count');

    if (adminError) {
        console.error('Service Role Query Error:', adminError);
    } else {
        console.log('Service Role (Admin) found employers:', adminData.length > 0 ? 'YES' : 'NO');
        // @ts-ignore
        console.log('Count:', adminData[0]?.count || 'N/A (if count not returned directly)');

        // Get actual count
        const { count } = await adminClient.from('employers').select('*', { count: 'exact', head: true });
        console.log('Total Employers (Admin Count):', count);
    }

    // 2. Check with Anon Key (Respects RLS)
    const anonClient = createClient(supabaseUrl!, supabaseAnonKey!);
    const { data: anonData, error: anonError, count: anonCount } = await anonClient
        .from('employers')
        .select('*', { count: 'exact', head: true });

    if (anonError) {
        console.error('Anon Client Query Error:', anonError);
    } else {
        console.log('Anon Client (Public) found employers:', anonCount);
    }

    if (anonCount === 0 && (await adminClient.from('employers').select('*', { count: 'exact', head: true })).count! > 0) {
        console.error('CRITICAL: Data exists but is not visible to public. RLS Policy issue!');
    } else if ((await adminClient.from('employers').select('*', { count: 'exact', head: true })).count === 0) {
        console.error('CRITICAL: Database is empty. Seed script did not run or failed.');
    } else {
        console.log('Database seems healthy.');
    }
}

check().catch(console.error);
