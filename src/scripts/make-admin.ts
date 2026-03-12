import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function makeAdmin(email: string) {
    if (!email) {
        console.error('Please provide an email address.');
        console.log('Usage: npx tsx src/scripts/make-admin.ts <email>');
        process.exit(1);
    }

    console.log(`Promoting ${email} to Admin...`);

    // 1. Find the user in public.users
    const { data: user, error: findError } = await supabase
        .from('users')
        .select('id, is_admin')
        .eq('email', email)
        .single();

    if (findError) {
        console.error('User not found:', findError.message);
        return;
    }

    if (user.is_admin) {
        console.log('User is already an Admin.');
        return;
    }

    // 2. Update is_admin = true
    const { error: updateError } = await supabase
        .from('users')
        .update({ is_admin: true })
        .eq('id', user.id);

    if (updateError) {
        console.error('Failed to update user:', updateError.message);
    } else {
        console.log('Success! User is now an Admin.');
    }
}

// Get email from command line args
const emailArg = process.argv[2];
makeAdmin(emailArg).catch(console.error);
