// Simple seed script - run with: node src/scripts/seed-simple.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Employer IDs
const EMP_1 = '11111111-1111-4111-a111-111111111111';
const EMP_2 = '22222222-2222-4222-a222-222222222222';
const EMP_3 = '33333333-3333-4333-a333-333333333333';
const EMP_4 = '44444444-4444-4444-a444-444444444444';
const EMP_5 = '55555555-5555-4555-a555-555555555555';

const employers = [
    {
        id: EMP_1, name: 'Saint Mary Medical Center', type: 'hospital',
        address: '1050 Linden Ave', city: 'Long Beach', state: 'CA', zip_code: '90813',
        website: 'https://www.dignityhealth.org/socal/locations/stmarymedical',
        phone: '(562) 491-9000', bed_count: 389, health_system: 'Dignity Health',
        teaching_status: 'community', rating_overall: 3.8, review_count: 42,
        badges: ['Community Favorite'], magnet_status: false, union_hospital: true,
        new_grad_friendly: true, specialties: ['Med-Surg', 'ICU', 'ER', 'L&D'],
        shift_types: ['day', 'night', 'rotating'], avg_hourly_rate: 62,
        latitude: 33.7866, longitude: -118.1762
    },
    {
        id: EMP_2, name: 'Cedars-Sinai Medical Center', type: 'hospital',
        address: '8700 Beverly Blvd', city: 'Los Angeles', state: 'CA', zip_code: '90048',
        website: 'https://www.cedars-sinai.org', phone: '(310) 423-3277',
        bed_count: 886, health_system: 'Cedars-Sinai', teaching_status: 'academic',
        rating_overall: 4.5, review_count: 128,
        badges: ['Top Rated for Safety', 'Best Teaching Hospital'],
        magnet_status: true, union_hospital: false, new_grad_friendly: true,
        specialties: ['ICU', 'ER', 'NICU', 'Cardiac', 'Oncology', 'Neuro'],
        shift_types: ['day', 'night'], avg_hourly_rate: 72,
        latitude: 34.0751, longitude: -118.3803
    },
    {
        id: EMP_3, name: 'Hoag Hospital Newport Beach', type: 'hospital',
        address: '1 Hoag Dr', city: 'Newport Beach', state: 'CA', zip_code: '92663',
        website: 'https://www.hoag.org', phone: '(949) 764-4624',
        bed_count: 498, health_system: 'Hoag', teaching_status: 'community',
        rating_overall: 4.2, review_count: 85,
        magnet_status: true, union_hospital: false, new_grad_friendly: false,
        specialties: ['L&D', 'NICU', 'Oncology', 'Cardiac'],
        shift_types: ['day', 'night', 'rotating'], avg_hourly_rate: 68,
        latitude: 33.6241, longitude: -117.9290
    },
    {
        id: EMP_4, name: 'Kaiser Permanente Los Angeles', type: 'hospital',
        address: '4867 Sunset Blvd', city: 'Los Angeles', state: 'CA', zip_code: '90027',
        website: 'https://healthy.kaiserpermanente.org', phone: '(833) 574-2273',
        bed_count: 560, health_system: 'Kaiser Permanente', teaching_status: 'academic',
        rating_overall: 3.9, review_count: 210, badges: ['Highest Paying'],
        magnet_status: false, union_hospital: true, new_grad_friendly: true,
        specialties: ['Med-Surg', 'ICU', 'ER', 'L&D', 'Psych'],
        shift_types: ['day', 'night', 'rotating'], avg_hourly_rate: 85,
        latitude: 34.0983, longitude: -118.2937
    },
    {
        id: EMP_5, name: 'UCLA Santa Monica Medical Center', type: 'hospital',
        address: '1250 16th St', city: 'Santa Monica', state: 'CA', zip_code: '90404',
        website: 'https://www.uclahealth.org/hospitals/santa-monica',
        phone: '(424) 259-6000', bed_count: 281, health_system: 'UCLA Health',
        teaching_status: 'academic', rating_overall: 4.7, review_count: 65,
        magnet_status: true, union_hospital: true, new_grad_friendly: true,
        specialties: ['ICU', 'ER', 'Med-Surg', 'Ortho'],
        shift_types: ['day', 'night'], avg_hourly_rate: 75,
        latitude: 34.0259, longitude: -118.4965
    }
];

const salaries = [
    { id: '60606060-6060-4060-a060-606060606060', employer_id: EMP_2, position: 'Staff Nurse II', years_experience: 5, hourly_rate: 72.50, shift_differential: 6.00, department: 'ICU' },
    { id: '70707070-7070-4070-a070-707070707070', employer_id: EMP_2, position: 'New Grad RN', years_experience: 0, hourly_rate: 58.00, department: 'Med-Surg' },
    { id: '60606060-6060-4060-a060-606060606061', employer_id: EMP_2, position: 'Staff Nurse III', years_experience: 10, hourly_rate: 82.00, shift_differential: 7.50, department: 'ER' },
    { id: '80808080-8080-4080-a080-808080808080', employer_id: EMP_4, position: 'Staff Nurse', years_experience: 8, hourly_rate: 85.00, shift_differential: 8.50, department: 'ER' },
    { id: '90909090-9090-4090-a090-909090909090', employer_id: EMP_4, position: 'Charge Nurse', years_experience: 12, hourly_rate: 98.00, department: 'L&D' },
    { id: '80808080-8080-4080-a080-808080808081', employer_id: EMP_4, position: 'New Grad RN', years_experience: 0, hourly_rate: 68.00, department: 'Med-Surg' },
    { id: '80808080-8080-4080-a080-808080808082', employer_id: EMP_4, position: 'Staff Nurse', years_experience: 3, hourly_rate: 78.00, shift_differential: 8.00, department: 'ICU' },
    { id: '50505050-5050-4050-a050-505050505051', employer_id: EMP_5, position: 'Staff Nurse II', years_experience: 4, hourly_rate: 70.00, shift_differential: 5.50, department: 'ICU' },
    { id: '50505050-5050-4050-a050-505050505052', employer_id: EMP_5, position: 'New Grad RN', years_experience: 0, hourly_rate: 55.00, department: 'Med-Surg' },
    { id: '50505050-5050-4050-a050-505050505053', employer_id: EMP_5, position: 'Charge Nurse', years_experience: 8, hourly_rate: 85.00, shift_differential: 6.00, department: 'ER' },
    { id: '30303030-3030-4030-a030-303030303031', employer_id: EMP_3, position: 'Staff Nurse II', years_experience: 6, hourly_rate: 68.00, shift_differential: 5.00, department: 'L&D' },
    { id: '30303030-3030-4030-a030-303030303032', employer_id: EMP_3, position: 'Staff Nurse', years_experience: 2, hourly_rate: 62.00, department: 'NICU' },
    { id: '10101010-1010-4010-a010-101010101011', employer_id: EMP_1, position: 'Staff Nurse', years_experience: 5, hourly_rate: 58.00, shift_differential: 4.50, department: 'ICU' },
    { id: '10101010-1010-4010-a010-101010101012', employer_id: EMP_1, position: 'New Grad RN', years_experience: 0, hourly_rate: 48.00, department: 'Med-Surg' },
    { id: '10101010-1010-4010-a010-101010101013', employer_id: EMP_1, position: 'Charge Nurse', years_experience: 10, hourly_rate: 72.00, department: 'ER' },
];

const interviews = [
    { id: 'a0a0a0a0-a0a0-40a0-aa0a-a0a0a0a0a0a0', employer_id: EMP_2, position: 'ICU Nurse', difficulty: 4, process_length_weeks: 3, questions: ['Describe a time you advocated for a patient.', 'How do you handle conflict with a physician?', 'Clinical scenario: Sepsis protocol.'], offer_received: true, notes: 'Very thorough process. Panel interview with 3 managers and a peer interview.' },
    { id: 'b0b0b0b0-b0b0-40b0-ab0b-b0b0b0b0b0b0', employer_id: EMP_4, position: 'Clinic Nurse', difficulty: 3, process_length_weeks: 4, questions: ['Why do you want to work for Kaiser?', 'Tell me about your experience with electronic charting.'], offer_received: false, notes: 'Long wait times between steps. HR was slow to respond.' },
    { id: 'c0c0c0c0-c0c0-40c0-ac0c-c0c0c0c0c0c0', employer_id: EMP_5, position: 'ER Nurse', difficulty: 5, process_length_weeks: 2, questions: ['Walk me through your assessment of an acute MI patient.', 'How do you prioritize multiple critical patients?', 'Tell me about a time you made a medication error.'], offer_received: true, notes: 'Intense but fair.' },
    { id: 'd0d0d0d0-d0d0-40d0-ad0d-d0d0d0d0d0d0', employer_id: EMP_3, position: 'L&D Nurse', difficulty: 3, process_length_weeks: 2, questions: ['Why L&D nursing specifically?', 'How do you handle high-stress delivery situations?'], offer_received: true, notes: 'Friendly interview.' },
    { id: 'e0e0e0e0-e0e0-40e0-ae0e-e0e0e0e0e0e0', employer_id: EMP_1, position: 'Med-Surg New Grad', difficulty: 2, process_length_weeks: 3, questions: ['Why did you choose nursing?', 'How do you handle difficult patients?'], offer_received: true, notes: 'Very welcoming for new grads.' },
];

async function seed() {
    console.log('Starting seed process...');
    console.log('URL:', supabaseUrl.substring(0, 30) + '...');

    // 1. Seed Employers
    console.log(`\nSeeding ${employers.length} employers...`);
    const { error: empError } = await supabase.from('employers').upsert(employers, { onConflict: 'id' });
    if (empError) {
        console.error('Error seeding employers:', empError.message);
    } else {
        console.log('✅ Employers seeded successfully!');
    }

    // 2. Seed Salaries
    console.log(`\nSeeding ${salaries.length} salaries...`);
    const { error: salError } = await supabase.from('salaries').upsert(salaries, { onConflict: 'id' });
    if (salError) {
        console.error('Error seeding salaries:', salError.message);
    } else {
        console.log('✅ Salaries seeded successfully!');
    }

    // 3. Seed Interviews
    console.log(`\nSeeding ${interviews.length} interviews...`);
    const { error: intError } = await supabase.from('interviews').upsert(interviews, { onConflict: 'id' });
    if (intError) {
        console.error('Error seeding interviews:', intError.message);
    } else {
        console.log('✅ Interviews seeded successfully!');
    }

    // 4. Create test users and seed reviews
    console.log('\nCreating test users for reviews...');
    const userMap = new Map();
    const mockUserIds = ['u1', 'u2', 'u3', 'u4', 'u5'];

    for (const mockId of mockUserIds) {
        const email = `user_${mockId}@example.com`;
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        let userId = existingUsers.users.find(u => u.email === email)?.id;

        if (!userId) {
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email,
                password: 'password123',
                email_confirm: true,
            });
            if (createError) {
                console.error(`Error creating user ${mockId}:`, createError.message);
                continue;
            }
            userId = newUser.user?.id;
            console.log(`  Created user: ${email}`);
        } else {
            console.log(`  User ${email} already exists`);
        }

        if (userId) userMap.set(mockId, userId);
    }

    const reviews = [
        { id: '10101010-1010-4010-a010-101010101010', user_id: userMap.get('u1'), employer_id: EMP_2, rating_overall: 5, rating_staffing: 5, rating_safety: 5, rating_culture: 5, rating_management: 4, rating_pay_benefits: 5, title: 'Best place I have ever worked', review_text: 'The ratios are always respected, and we have break nurses. Management actually listens to us.', work_timeframe: 'currently', department: 'ICU', position_type: 'Staff Nurse', status: 'approved', created_at: '2023-10-15T10:00:00Z' },
        { id: '20202020-2020-4020-a020-202020202020', user_id: userMap.get('u2'), employer_id: EMP_1, rating_overall: 2, rating_staffing: 1, rating_safety: 2, rating_culture: 3, rating_management: 1, rating_pay_benefits: 3, title: 'Unsafe ratios and mandatory overtime', review_text: 'They are constantly short staffed. I am regularly tripling in the ICU.', work_timeframe: 'within_6_months', department: 'ICU', position_type: 'Travel Nurse', status: 'approved', created_at: '2023-11-02T14:30:00Z' },
        { id: '30303030-3030-4030-a030-303030303030', user_id: userMap.get('u3'), employer_id: EMP_3, rating_overall: 4, rating_staffing: 4, rating_safety: 5, rating_culture: 4, rating_management: 3, rating_pay_benefits: 4, title: 'Great culture, beautiful facility', review_text: 'The facility is gorgeous and the equipment is new. The doctors are generally respectful.', work_timeframe: 'currently', department: 'L&D', position_type: 'Staff Nurse', status: 'approved', created_at: '2023-09-20T09:15:00Z' },
        { id: '40404040-4040-4040-a040-404040404040', user_id: userMap.get('u4'), employer_id: EMP_4, rating_overall: 3, rating_staffing: 3, rating_safety: 4, rating_culture: 3, rating_management: 2, rating_pay_benefits: 5, title: 'Golden handcuffs', review_text: 'The pay and benefits are unbeatable. But the bureaucracy is suffocating.', work_timeframe: 'over_1_year', department: 'Med-Surg', position_type: 'Charge Nurse', status: 'approved', created_at: '2023-08-10T11:45:00Z' },
        { id: '50505050-5050-4050-a050-505050505050', user_id: userMap.get('u5'), employer_id: EMP_2, rating_overall: 4, rating_staffing: 4, rating_safety: 5, rating_culture: 4, rating_management: 4, rating_pay_benefits: 4, title: 'Solid teaching hospital', review_text: 'Great learning environment. You see everything here.', work_timeframe: 'currently', department: 'ER', position_type: 'Staff Nurse', status: 'approved', created_at: '2023-12-01T16:20:00Z' },
    ].filter(r => r.user_id); // skip reviews where user creation failed

    console.log(`\nSeeding ${reviews.length} reviews...`);
    const { error: revError } = await supabase.from('reviews').upsert(reviews, { onConflict: 'id' });
    if (revError) {
        console.error('Error seeding reviews:', revError.message);
    } else {
        console.log('✅ Reviews seeded successfully!');
    }

    console.log('\n🎉 Seed completed!');
}

seed().catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
});
