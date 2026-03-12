import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRLS() {
    console.log('Testing RLS Policy for Employers...');

    // 1. Sign in
    const email = 'user_u1@example.com';
    const password = 'password123';
    console.log(`Signing in as ${email}...`);

    const { data: { session }, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (loginError) {
        console.error('Login failed:', loginError.message);
        console.log('Make sure you have run the seed script to create this user.');
        return;
    }

    console.log('Login successful.');

    // 2. Try to insert a hospital
    console.log('Attempting to insert a new hospital...');
    const { data, error } = await supabase
        .from('employers')
        .insert({
            name: 'RLS Test Hospital',
            type: 'hospital',
            address: '123 Test Lane',
            city: 'Testville',
            state: 'CA',
            zip_code: '12345'
        })
        .select()
        .single();

    if (error) {
        console.error('INSERT FAILED:', error.message);
        console.error('Error Details:', error);
        if (error.code === '42501') {
            console.error('\nCONCLUSION: The RLS policy "Authenticated users can create employers" is MISSING or NOT APPLIED.');
        }
    } else {
        console.log('INSERT SUCCESS!');
        console.log('Created employer:', data.name);
        console.log('\nCONCLUSION: RLS policies are working correctly.');

        // Cleanup
        await supabase.from('employers').delete().eq('id', data.id);
    }
}

testRLS().catch(console.error);
