import { Employer, Review, Salary, Interview, Question, SavedHospital } from './types';

// UUIDs for Employers
const EMP_1 = '11111111-1111-4111-a111-111111111111';
const EMP_2 = '22222222-2222-4222-a222-222222222222';
const EMP_3 = '33333333-3333-4333-a333-333333333333';
const EMP_4 = '44444444-4444-4444-a444-444444444444';
const EMP_5 = '55555555-5555-4555-a555-555555555555';

export const mockEmployers: Employer[] = [
    {
        id: EMP_1,
        name: 'Saint Mary Medical Center',
        type: 'hospital',
        address: '1050 Linden Ave',
        city: 'Long Beach',
        state: 'CA',
        zip_code: '90813',
        website: 'https://www.dignityhealth.org/socal/locations/stmarymedical',
        phone: '(562) 491-9000',
        bed_count: 389,
        health_system: 'Dignity Health',
        teaching_status: 'community',
        rating_overall: 3.8,
        review_count: 42,
        badges: ['Community Favorite'],
        magnet_status: false,
        union: true,
        new_grad_friendly: true,
        specialties: ['Med-Surg', 'ICU', 'ER', 'L&D'],
        shift_types: ['day', 'night', 'rotating'],
        avg_hourly_rate: 62,
        latitude: 33.7866,
        longitude: -118.1762
    },
    {
        id: EMP_2,
        name: 'Cedars-Sinai Medical Center',
        type: 'hospital',
        address: '8700 Beverly Blvd',
        city: 'Los Angeles',
        state: 'CA',
        zip_code: '90048',
        website: 'https://www.cedars-sinai.org',
        phone: '(310) 423-3277',
        bed_count: 886,
        health_system: 'Cedars-Sinai',
        teaching_status: 'academic',
        rating_overall: 4.5,
        review_count: 128,
        badges: ['Top Rated for Safety', 'Best Teaching Hospital'],
        magnet_status: true,
        union: false,
        new_grad_friendly: true,
        specialties: ['ICU', 'ER', 'NICU', 'Cardiac', 'Oncology', 'Neuro'],
        shift_types: ['day', 'night'],
        avg_hourly_rate: 72,
        latitude: 34.0751,
        longitude: -118.3803
    },
    {
        id: EMP_3,
        name: 'Hoag Hospital Newport Beach',
        type: 'hospital',
        address: '1 Hoag Dr',
        city: 'Newport Beach',
        state: 'CA',
        zip_code: '92663',
        website: 'https://www.hoag.org',
        phone: '(949) 764-4624',
        bed_count: 498,
        health_system: 'Hoag',
        teaching_status: 'community',
        rating_overall: 4.2,
        review_count: 85,
        magnet_status: true,
        union: false,
        new_grad_friendly: false,
        specialties: ['L&D', 'NICU', 'Oncology', 'Cardiac'],
        shift_types: ['day', 'night', 'rotating'],
        avg_hourly_rate: 68,
        latitude: 33.6241,
        longitude: -117.9290
    },
    {
        id: EMP_4,
        name: 'Kaiser Permanente Los Angeles',
        type: 'hospital',
        address: '4867 Sunset Blvd',
        city: 'Los Angeles',
        state: 'CA',
        zip_code: '90027',
        website: 'https://healthy.kaiserpermanente.org',
        phone: '(833) 574-2273',
        bed_count: 560,
        health_system: 'Kaiser Permanente',
        teaching_status: 'academic',
        rating_overall: 3.9,
        review_count: 210,
        badges: ['Highest Paying'],
        magnet_status: false,
        union: true,
        new_grad_friendly: true,
        specialties: ['Med-Surg', 'ICU', 'ER', 'L&D', 'Psych'],
        shift_types: ['day', 'night', 'rotating'],
        avg_hourly_rate: 85,
        latitude: 34.0983,
        longitude: -118.2937
    },
    {
        id: EMP_5,
        name: 'UCLA Santa Monica Medical Center',
        type: 'hospital',
        address: '1250 16th St',
        city: 'Santa Monica',
        state: 'CA',
        zip_code: '90404',
        website: 'https://www.uclahealth.org/hospitals/santa-monica',
        phone: '(424) 259-6000',
        bed_count: 281,
        health_system: 'UCLA Health',
        teaching_status: 'academic',
        rating_overall: 4.7,
        review_count: 65,
        magnet_status: true,
        union: true,
        new_grad_friendly: true,
        specialties: ['ICU', 'ER', 'Med-Surg', 'Ortho'],
        shift_types: ['day', 'night'],
        avg_hourly_rate: 75,
        latitude: 34.0259,
        longitude: -118.4965
    }
];

// Note: Review IDs, Salary IDs, Interview IDs also need to be UUIDs.
// User IDs in mockReviews are just keys for the seed script map, so they can stay as 'u1' etc.

export const mockReviews: Review[] = [
    {
        id: '10101010-1010-4010-a010-101010101010',
        user_id: 'u1',
        employer_id: EMP_2,
        rating_overall: 5,
        rating_staffing: 5,
        rating_safety: 5,
        rating_culture: 5,
        rating_management: 4,
        rating_pay_benefits: 5,
        title: 'Best place I have ever worked',
        review_text: 'The ratios are always respected, and we have break nurses. Management actually listens to us. The pay is top tier for the area.',
        work_timeframe: 'currently',
        department: 'ICU',
        position_type: 'Staff Nurse',
        status: 'approved',
        verification_level: 'unverified',
        helpful_votes_up: 24,
        helpful_votes_down: 1,
        created_at: '2023-10-15T10:00:00Z'
    },
    {
        id: '20202020-2020-4020-a020-202020202020',
        user_id: 'u2',
        employer_id: EMP_1,
        rating_overall: 2,
        rating_staffing: 1,
        rating_safety: 2,
        rating_culture: 3,
        rating_management: 1,
        rating_pay_benefits: 3,
        title: 'Unsafe ratios and mandatory overtime',
        review_text: 'They are constantly short staffed. I am regularly tripling in the ICU. Management is non-existent until they need to blame someone.',
        work_timeframe: 'within_6_months',
        department: 'ICU',
        position_type: 'Travel Nurse',
        status: 'approved',
        verification_level: 'unverified',
        helpful_votes_up: 45,
        helpful_votes_down: 2,
        created_at: '2023-11-02T14:30:00Z'
    },
    {
        id: '30303030-3030-4030-a030-303030303030',
        user_id: 'u3',
        employer_id: EMP_3,
        rating_overall: 4,
        rating_staffing: 4,
        rating_safety: 5,
        rating_culture: 4,
        rating_management: 3,
        rating_pay_benefits: 4,
        title: 'Great culture, beautiful facility',
        review_text: 'The facility is gorgeous and the equipment is new. The doctors are generally respectful. Pay is good but cost of living in Newport is high.',
        work_timeframe: 'currently',
        department: 'L&D',
        position_type: 'Staff Nurse',
        status: 'approved',
        verification_level: 'unverified',
        helpful_votes_up: 12,
        helpful_votes_down: 0,
        created_at: '2023-09-20T09:15:00Z'
    },
    {
        id: '40404040-4040-4040-a040-404040404040',
        user_id: 'u4',
        employer_id: EMP_4,
        rating_overall: 3,
        rating_staffing: 3,
        rating_safety: 4,
        rating_culture: 3,
        rating_management: 2,
        rating_pay_benefits: 5,
        title: 'Golden handcuffs',
        review_text: 'The pay and benefits are unbeatable, free healthcare for life if you stay long enough. But the bureaucracy is suffocating and it feels like a factory.',
        work_timeframe: 'over_1_year',
        department: 'Med-Surg',
        position_type: 'Charge Nurse',
        status: 'approved',
        verification_level: 'unverified',
        helpful_votes_up: 56,
        helpful_votes_down: 5,
        created_at: '2023-08-10T11:45:00Z'
    },
    {
        id: '50505050-5050-4050-a050-505050505050',
        user_id: 'u5',
        employer_id: EMP_2,
        rating_overall: 4,
        rating_staffing: 4,
        rating_safety: 5,
        rating_culture: 4,
        rating_management: 4,
        rating_pay_benefits: 4,
        title: 'Solid teaching hospital',
        review_text: 'Great learning environment. You see everything here. Can be intense but you grow a lot as a nurse.',
        work_timeframe: 'currently',
        department: 'ER',
        position_type: 'Staff Nurse',
        status: 'approved',
        verification_level: 'unverified',
        helpful_votes_up: 8,
        helpful_votes_down: 1,
        created_at: '2023-12-01T16:20:00Z'
    }
];

export const mockSalaries: Salary[] = [
    // Cedars-Sinai
    {
        id: '60606060-6060-4060-a060-606060606060',
        employer_id: EMP_2,
        position: 'Staff Nurse II',
        years_experience: 5,
        hourly_rate: 72.50,
        shift_differential: 6.00,
        department: 'ICU',
        submitted_at: '2023-11-15'
    },
    {
        id: '70707070-7070-4070-a070-707070707070',
        employer_id: EMP_2,
        position: 'New Grad RN',
        years_experience: 0,
        hourly_rate: 58.00,
        department: 'Med-Surg',
        submitted_at: '2023-10-20'
    },
    {
        id: '60606060-6060-4060-a060-606060606061',
        employer_id: EMP_2,
        position: 'Staff Nurse III',
        years_experience: 10,
        hourly_rate: 82.00,
        shift_differential: 7.50,
        department: 'ER',
        submitted_at: '2023-09-15'
    },
    // Kaiser
    {
        id: '80808080-8080-4080-a080-808080808080',
        employer_id: EMP_4,
        position: 'Staff Nurse',
        years_experience: 8,
        hourly_rate: 85.00,
        shift_differential: 8.50,
        department: 'ER',
        submitted_at: '2023-12-05'
    },
    {
        id: '90909090-9090-4090-a090-909090909090',
        employer_id: EMP_4,
        position: 'Charge Nurse',
        years_experience: 12,
        hourly_rate: 98.00,
        department: 'L&D',
        submitted_at: '2023-09-10'
    },
    {
        id: '80808080-8080-4080-a080-808080808081',
        employer_id: EMP_4,
        position: 'New Grad RN',
        years_experience: 0,
        hourly_rate: 68.00,
        department: 'Med-Surg',
        submitted_at: '2023-11-20'
    },
    {
        id: '80808080-8080-4080-a080-808080808082',
        employer_id: EMP_4,
        position: 'Staff Nurse',
        years_experience: 3,
        hourly_rate: 78.00,
        shift_differential: 8.00,
        department: 'ICU',
        submitted_at: '2023-10-15'
    },
    // UCLA
    {
        id: '50505050-5050-4050-a050-505050505051',
        employer_id: EMP_5,
        position: 'Staff Nurse II',
        years_experience: 4,
        hourly_rate: 70.00,
        shift_differential: 5.50,
        department: 'ICU',
        submitted_at: '2023-11-01'
    },
    {
        id: '50505050-5050-4050-a050-505050505052',
        employer_id: EMP_5,
        position: 'New Grad RN',
        years_experience: 0,
        hourly_rate: 55.00,
        department: 'Med-Surg',
        submitted_at: '2023-12-01'
    },
    {
        id: '50505050-5050-4050-a050-505050505053',
        employer_id: EMP_5,
        position: 'Charge Nurse',
        years_experience: 8,
        hourly_rate: 85.00,
        shift_differential: 6.00,
        department: 'ER',
        submitted_at: '2023-10-10'
    },
    // Hoag
    {
        id: '30303030-3030-4030-a030-303030303031',
        employer_id: EMP_3,
        position: 'Staff Nurse II',
        years_experience: 6,
        hourly_rate: 68.00,
        shift_differential: 5.00,
        department: 'L&D',
        submitted_at: '2023-11-05'
    },
    {
        id: '30303030-3030-4030-a030-303030303032',
        employer_id: EMP_3,
        position: 'Staff Nurse',
        years_experience: 2,
        hourly_rate: 62.00,
        department: 'NICU',
        submitted_at: '2023-09-20'
    },
    // Saint Mary
    {
        id: '10101010-1010-4010-a010-101010101011',
        employer_id: EMP_1,
        position: 'Staff Nurse',
        years_experience: 5,
        hourly_rate: 58.00,
        shift_differential: 4.50,
        department: 'ICU',
        submitted_at: '2023-10-25'
    },
    {
        id: '10101010-1010-4010-a010-101010101012',
        employer_id: EMP_1,
        position: 'New Grad RN',
        years_experience: 0,
        hourly_rate: 48.00,
        department: 'Med-Surg',
        submitted_at: '2023-11-10'
    },
    {
        id: '10101010-1010-4010-a010-101010101013',
        employer_id: EMP_1,
        position: 'Charge Nurse',
        years_experience: 10,
        hourly_rate: 72.00,
        department: 'ER',
        submitted_at: '2023-08-15'
    }
];

export const mockInterviews: Interview[] = [
    {
        id: 'a0a0a0a0-a0a0-40a0-aa0a-a0a0a0a0a0a0',
        employer_id: EMP_2,
        position: 'ICU Nurse',
        difficulty: 4,
        process_length_weeks: 3,
        questions: [
            'Describe a time you advocated for a patient.',
            'How do you handle conflict with a physician?',
            'Clinical scenario: Sepsis protocol.'
        ],
        offer_received: true,
        notes: 'Very thorough process. Panel interview with 3 managers and a peer interview.',
        submitted_at: '2023-11-01',
        interview_type: 'panel',
        interviewer_role: 'Nurse Manager, Clinical Educator, Staff RN',
        tips: 'Prepare clinical scenarios and STAR format answers. They really value teamwork examples.',
        would_interview_again: true
    },
    {
        id: 'b0b0b0b0-b0b0-40b0-ab0b-b0b0b0b0b0b0',
        employer_id: EMP_4,
        position: 'Clinic Nurse',
        difficulty: 3,
        process_length_weeks: 4,
        questions: [
            'Why do you want to work for Kaiser?',
            'Tell me about your experience with electronic charting.'
        ],
        offer_received: false,
        notes: 'Long wait times between steps. HR was slow to respond.',
        submitted_at: '2023-10-15',
        interview_type: 'video',
        interviewer_role: 'HR Representative',
        tips: 'Be patient with the process. Follow up regularly.',
        would_interview_again: true
    },
    {
        id: 'c0c0c0c0-c0c0-40c0-ac0c-c0c0c0c0c0c0',
        employer_id: EMP_5,
        position: 'ER Nurse',
        difficulty: 5,
        process_length_weeks: 2,
        questions: [
            'Walk me through your assessment of an acute MI patient.',
            'How do you prioritize multiple critical patients?',
            'Tell me about a time you made a medication error.'
        ],
        offer_received: true,
        notes: 'Intense but fair. They want to see how you think under pressure.',
        submitted_at: '2023-10-20',
        interview_type: 'in-person',
        interviewer_role: 'ER Director, Charge Nurse',
        tips: 'Know your ACLS protocols cold. They will quiz you on cardiac rhythms.',
        would_interview_again: true
    },
    {
        id: 'd0d0d0d0-d0d0-40d0-ad0d-d0d0d0d0d0d0',
        employer_id: EMP_3,
        position: 'L&D Nurse',
        difficulty: 3,
        process_length_weeks: 2,
        questions: [
            'Why L&D nursing specifically?',
            'How do you handle high-stress delivery situations?',
            'Describe your experience with fetal monitoring.'
        ],
        offer_received: true,
        notes: 'Friendly interview. They seemed genuinely interested in finding the right fit.',
        submitted_at: '2023-09-15',
        interview_type: 'in-person',
        interviewer_role: 'L&D Manager',
        tips: 'Show passion for maternal-fetal care. They value bedside manner.',
        would_interview_again: true
    },
    {
        id: 'e0e0e0e0-e0e0-40e0-ae0e-e0e0e0e0e0e0',
        employer_id: EMP_1,
        position: 'Med-Surg New Grad',
        difficulty: 2,
        process_length_weeks: 3,
        questions: [
            'Why did you choose nursing?',
            'How do you handle difficult patients?',
            'What are your career goals?'
        ],
        offer_received: true,
        notes: 'Very welcoming for new grads. They have a solid residency program.',
        submitted_at: '2023-11-10',
        interview_type: 'video',
        interviewer_role: 'Unit Manager, Nurse Educator',
        tips: 'Emphasize eagerness to learn. They want coachable new grads.',
        would_interview_again: true
    }
];

// Mock Q&A Data
export const mockQuestions: Question[] = [
    {
        id: 'q1q1q1q1-q1q1-41q1-aq1q-q1q1q1q1q1q1',
        employer_id: EMP_2,
        user_id: 'u1',
        question_text: 'What is the nurse-to-patient ratio in the ICU at Cedars? I heard it varies by shift.',
        created_at: '2023-11-20T10:00:00Z',
        upvotes: 15,
        is_answered: true,
        answers: [
            {
                id: 'a1a1a1a1-a1a1-41a1-aa1a-a1a1a1a1a1a1',
                question_id: 'q1q1q1q1-q1q1-41q1-aq1q-q1q1q1q1q1q1',
                user_id: 'u2',
                answer_text: 'Day shift is typically 1:2 for ICU patients. Night shift can sometimes be 1:3 if they are short staffed, but they try to avoid it. They have break nurses which helps a lot.',
                created_at: '2023-11-20T14:30:00Z',
                upvotes: 12,
                is_accepted: true
            },
            {
                id: 'a2a2a2a2-a2a2-42a2-aa2a-a2a2a2a2a2a2',
                question_id: 'q1q1q1q1-q1q1-41q1-aq1q-q1q1q1q1q1q1',
                user_id: 'u3',
                answer_text: 'I worked there for 2 years. Ratios are generally good but holidays can get rough. They do pay incentives for extra shifts.',
                created_at: '2023-11-21T09:15:00Z',
                upvotes: 5,
                is_accepted: false
            }
        ]
    },
    {
        id: 'q2q2q2q2-q2q2-42q2-aq2q-q2q2q2q2q2q2',
        employer_id: EMP_4,
        user_id: 'u3',
        question_text: 'How long does it take to get benefits at Kaiser? Do they offer tuition reimbursement?',
        created_at: '2023-11-18T16:00:00Z',
        upvotes: 22,
        is_answered: true,
        answers: [
            {
                id: 'a3a3a3a3-a3a3-43a3-aa3a-a3a3a3a3a3a3',
                question_id: 'q2q2q2q2-q2q2-42q2-aq2q-q2q2q2q2q2q2',
                user_id: 'u4',
                answer_text: 'Benefits kick in on day 1 for full-time employees. Tuition reimbursement is $3,000/year for BSN programs and $5,000/year for advanced degrees. You need to work there for 6 months first.',
                created_at: '2023-11-18T20:00:00Z',
                upvotes: 18,
                is_accepted: true
            }
        ]
    },
    {
        id: 'q3q3q3q3-q3q3-43q3-aq3q-q3q3q3q3q3q3',
        employer_id: EMP_5,
        user_id: 'u5',
        question_text: 'Is UCLA Santa Monica good for new grads? How is the residency program?',
        created_at: '2023-11-25T11:00:00Z',
        upvotes: 8,
        is_answered: true,
        answers: [
            {
                id: 'a4a4a4a4-a4a4-44a4-aa4a-a4a4a4a4a4a4',
                question_id: 'q3q3q3q3-q3q3-43q3-aq3q-q3q3q3q3q3q3',
                user_id: 'u1',
                answer_text: 'The residency is excellent - 12 weeks with a dedicated preceptor. Classes twice a week on various topics. Very supportive environment for new grads.',
                created_at: '2023-11-25T15:30:00Z',
                upvotes: 6,
                is_accepted: true
            }
        ]
    },
    {
        id: 'q4q4q4q4-q4q4-44q4-aq4q-q4q4q4q4q4q4',
        employer_id: EMP_3,
        user_id: 'u2',
        question_text: 'Does Hoag allow self-scheduling? What about PTO accrual rates?',
        created_at: '2023-11-22T08:00:00Z',
        upvotes: 5,
        is_answered: false,
        answers: []
    },
    {
        id: 'q5q5q5q5-q5q5-45q5-aq5q-q5q5q5q5q5q5',
        employer_id: EMP_2,
        user_id: 'u4',
        question_text: 'How is parking at Cedars-Sinai? Is it free for employees?',
        created_at: '2023-11-28T09:00:00Z',
        upvotes: 11,
        is_answered: true,
        answers: [
            {
                id: 'a5a5a5a5-a5a5-45a5-aa5a-a5a5a5a5a5a5',
                question_id: 'q5q5q5q5-q5q5-45q5-aq5q-q5q5q5q5q5q5',
                user_id: 'u5',
                answer_text: 'Parking is subsidized but not free. You pay about $50/month which gets deducted pre-tax. The structure is on campus so it is convenient. Night shift gets the best spots!',
                created_at: '2023-11-28T12:00:00Z',
                upvotes: 9,
                is_accepted: true
            }
        ]
    }
];

// Mock Saved Hospitals (for demo user)
export const mockSavedHospitals: SavedHospital[] = [
    {
        id: 'sh1',
        user_id: 'demo-user',
        employer_id: EMP_2,
        saved_at: '2023-11-15T10:00:00Z',
        notes: 'Top choice - great reviews for ICU',
        notify_new_reviews: true
    },
    {
        id: 'sh2',
        user_id: 'demo-user',
        employer_id: EMP_5,
        saved_at: '2023-11-18T14:00:00Z',
        notes: 'Close to home, good for work-life balance',
        notify_new_reviews: true
    },
    {
        id: 'sh3',
        user_id: 'demo-user',
        employer_id: EMP_4,
        saved_at: '2023-11-20T09:00:00Z',
        notes: 'Best pay but heard mixed things about culture',
        notify_new_reviews: false
    }
];
