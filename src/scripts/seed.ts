import { createClient } from '@supabase/supabase-js';
import { mockEmployers, mockReviews, mockSalaries, mockInterviews } from '../lib/mock-data';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
    console.log('Starting seed process...');
    console.log('URL:', supabaseUrl?.substring(0, 20) + '...');

    // 1. Seed Employers
    console.log(`\nSeeding ${mockEmployers.length} Employers...`);
    for (const employer of mockEmployers) {
        const { error } = await supabase
            .from('employers')
            .upsert(employer, { onConflict: 'id' });

        if (error) {
            console.error(`Failed to seed employer ${employer.name}:`, error.message);
        } else {
            console.log(`Seeded employer: ${employer.name}`);
        }
    }

    // 2. Seed Users (for Reviews)
    console.log(`\nSeeding Users for ${mockReviews.length} reviews...`);
    const userMap = new Map<string, string>(); // mockId -> realUuid
    const mockUserIds = Array.from(new Set(mockReviews.map(r => r.user_id)));

    for (const mockId of mockUserIds) {
        const email = `user_${mockId}@example.com`;
        // Check if user exists
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        let userId = existingUsers.users.find(u => u.email === email)?.id;

        if (!userId) {
            console.log(`Creating user ${email}...`);
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email,
                password: 'password123',
                email_confirm: true,
            });
            if (createError) {
                console.error(`Error creating user ${mockId}:`, createError.message);
                continue;
            }
            if (newUser.user) {
                userId = newUser.user.id;
            }
        } else {
            console.log(`User ${email} already exists.`);
        }

        if (userId) {
            userMap.set(mockId, userId);
        }
    }

    // 3. Seed Reviews
    console.log(`\nSeeding ${mockReviews.length} Reviews...`);
    for (const review of mockReviews) {
        const realUserId = userMap.get(review.user_id);
        if (!realUserId) {
            console.warn(`Skipping review ${review.id} because user ${review.user_id} was not created.`);
            continue;
        }

        const reviewData = {
            ...review,
            user_id: realUserId,
            created_at: new Date(review.created_at).toISOString(),
        };

        const { error } = await supabase
            .from('reviews')
            .upsert(reviewData, { onConflict: 'id' });

        if (error) {
            console.error(`Failed to seed review ${review.id}:`, error.message);
        } else {
            console.log(`Seeded review ${review.id}`);
        }
    }

    // 4. Seed Salaries
    console.log(`\nSeeding ${mockSalaries.length} Salaries...`);
    for (const salary of mockSalaries) {
        const { error } = await supabase
            .from('salaries')
            .upsert(salary, { onConflict: 'id' });

        if (error) {
            console.error(`Failed to seed salary ${salary.id}:`, error.message);
        } else {
            console.log(`Seeded salary ${salary.id}`);
        }
    }

    // 5. Seed Interviews
    console.log(`\nSeeding ${mockInterviews.length} Interviews...`);
    for (const interview of mockInterviews) {
        const { error } = await supabase
            .from('interviews')
            .upsert(interview, { onConflict: 'id' });

        if (error) {
            console.error(`Failed to seed interview ${interview.id}:`, error.message);
        } else {
            console.log(`Seeded interview ${interview.id}`);
        }
    }

    console.log('\nSeed completed!');
}

seed().catch(err => {
    console.error('Unhandled error in seed script:', err);
    process.exit(1);
});
