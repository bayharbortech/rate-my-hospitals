import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;

// Password schemas
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Add employer schema
export const addEmployerSchema = z.object({
  name: z.string().min(1, 'Hospital name is required'),
  type: z.enum(['hospital', 'clinic', 'urgent_care', 'nursing_home']),
  address: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required').max(2, 'Use 2-letter state code'),
  zip_code: z.string().optional(),
});

export type AddEmployerFormData = z.infer<typeof addEmployerSchema>;

// Review submission schema
export const reviewSchema = z.object({
  employerId: z.string().min(1, 'Please select an employer'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be under 200 characters'),
  reviewText: z.string().min(50, 'Review must be at least 50 characters'),
  positionType: z.string().optional(),
  department: z.string().optional(),
  patientLoad: z.string().optional(),
  ratings: z.object({
    staffing: z.number().min(1, 'Please rate staffing'),
    safety: z.number().min(1, 'Please rate safety'),
    culture: z.number().min(1, 'Please rate culture'),
    management: z.number().min(1, 'Please rate management'),
    pay: z.number().min(1, 'Please rate pay & benefits'),
  }),
  cattiness: z.number().min(0).max(5),
  showSalary: z.boolean(),
  yearsExperience: z.string(),
  hourlyRate: z.string(),
  showInterview: z.boolean(),
  difficulty: z.number().min(1).max(5),
  offerReceived: z.boolean(),
  interviewNotes: z.string(),
  interviewQuestions: z.string(),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

// Blog post schema
export const blogPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  summary: z.string().min(1, 'Summary is required'),
  category: z.string().min(1, 'Category is required'),
  image: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  readTime: z.string().optional(),
});

export type BlogPostFormData = z.infer<typeof blogPostSchema>;

// Contact form schema
export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export type ContactFormData = z.infer<typeof contactSchema>;

// ============================================================
// Server-side API request validation schemas
// ============================================================

const ratingField = z.number().min(1).max(5);

export const submitReviewApiSchema = z.object({
    employer_id: z.string().min(1, 'Employer ID is required'),
    title: z.string().min(1, 'Title is required'),
    review_text: z.string().min(1, 'Review text is required'),
    rating_overall: ratingField,
    rating_staffing: ratingField,
    rating_safety: ratingField,
    rating_culture: ratingField,
    rating_management: ratingField,
    rating_pay_benefits: ratingField,
    rating_cattiness: z.number().min(0).max(5).optional(),
    patient_load: z.string().optional(),
    department: z.string().optional(),
    position_type: z.string().optional(),
    salary: z.object({
        years_experience: z.number().min(0),
        hourly_rate: z.number().min(0),
    }).optional(),
    interview: z.object({
        difficulty: z.number().min(1).max(5),
        offer_received: z.boolean(),
        notes: z.string(),
        questions: z.array(z.string()),
    }).optional(),
});

export type SubmitReviewApiData = z.infer<typeof submitReviewApiSchema>;

export const moderateReviewApiSchema = z.object({
    status: z.enum(['approved', 'rejected', 'revision_requested']),
    admin_comment: z.string().optional(),
}).refine(
    data => !(data.status === 'rejected' || data.status === 'revision_requested') || !!data.admin_comment,
    { message: 'A comment is required when rejecting or requesting revision', path: ['admin_comment'] },
);

export type ModerateReviewApiData = z.infer<typeof moderateReviewApiSchema>;

export const reviseReviewApiSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    review_text: z.string().min(1, 'Review text is required'),
});

export type ReviseReviewApiData = z.infer<typeof reviseReviewApiSchema>;

export const blogPostApiSchema = z.object({
    id: z.number().optional(),
    title: z.string().min(1, 'Title is required'),
    summary: z.string().min(1, 'Summary is required'),
    category: z.string().min(1, 'Category is required'),
    content: z.string().min(1, 'Content is required'),
    date: z.string().optional(),
    readTime: z.string().optional(),
    image: z.string().optional(),
    tags: z.string().optional(),
    status: z.enum(['draft', 'published']).optional(),
});

export type BlogPostApiData = z.infer<typeof blogPostApiSchema>;

export const blogPostUpdateApiSchema = blogPostApiSchema.extend({
    id: z.number({ error: 'Post ID is required' }),
});

export type BlogPostUpdateApiData = z.infer<typeof blogPostUpdateApiSchema>;

export const blogTopicCreateApiSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
});

export const blogTopicUpdateApiSchema = z.object({
    id: z.number({ error: 'Topic ID is required' }),
    title: z.string().min(1, 'Title cannot be empty').optional(),
    description: z.string().optional(),
});

export const blogGenerateApiSchema = z.object({
    topicTitle: z.string().min(1, 'Topic title is required'),
    topicDescription: z.string().optional(),
});

export const settingUpdateApiSchema = z.object({
    key: z.string().min(1, 'Key is required'),
    value: z.unknown(),
});

// AI-generated blog post response validation
export const generatedBlogPostSchema = z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    category: z.string().min(1),
    tags: z.array(z.string()).default([]),
    content: z.string().min(1),
});

// ============================================================
// Database row schemas (Supabase response validation)
// ============================================================

export const employerRowSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['hospital', 'clinic', 'urgent_care', 'nursing_home']),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zip_code: z.string(),
    website: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    bed_count: z.number().nullable().optional(),
    health_system: z.string().nullable().optional(),
    teaching_status: z.enum(['academic', 'community', 'specialty']).nullable().optional(),
    rating_overall: z.number().nullable().optional(),
    review_count: z.number().nullable().optional(),
    magnet_status: z.boolean().nullable().optional(),
    union: z.boolean().nullable().optional(),
    new_grad_friendly: z.boolean().nullable().optional(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
});

export const reviewRowSchema = z.object({
    id: z.string(),
    user_id: z.string(),
    employer_id: z.string(),
    rating_overall: z.number(),
    rating_staffing: z.number(),
    rating_safety: z.number(),
    rating_culture: z.number(),
    rating_management: z.number(),
    rating_pay_benefits: z.number(),
    rating_cattiness: z.number().nullable().optional(),
    patient_load: z.string().nullable().optional(),
    title: z.string(),
    review_text: z.string(),
    work_timeframe: z.enum(['currently', 'within_6_months', '6_12_months', 'over_1_year']),
    department: z.string().nullable().optional(),
    position_type: z.string().nullable().optional(),
    status: z.enum(['pending', 'approved', 'rejected', 'revision_requested']),
    verification_level: z.enum(['unverified', 'verified']).default('unverified'),
    admin_comment: z.string().nullable().optional(),
    ai_review_result: z.any().nullable().optional(),
    helpful_votes_up: z.number().default(0),
    helpful_votes_down: z.number().default(0),
    created_at: z.string(),
    updated_at: z.string().nullable().optional(),
});

export const blogPostRowSchema = z.object({
    id: z.number(),
    title: z.string(),
    summary: z.string(),
    category: z.string(),
    date: z.string(),
    read_time: z.string(),
    image: z.string(),
    content: z.string(),
    tags: z.string().nullable().optional(),
    status: z.enum(['draft', 'published']),
    created_by: z.string().nullable().optional(),
    created_at: z.string(),
    updated_at: z.string(),
});

export const blogTopicRowSchema = z.object({
    id: z.number(),
    title: z.string(),
    description: z.string().nullable(),
    created_by: z.string().nullable().optional(),
    created_at: z.string(),
    updated_at: z.string(),
});

export const userRowSchema = z.object({
    id: z.string(),
    email: z.string(),
    display_name: z.string().nullable().optional(),
    is_admin: z.boolean().default(false),
    is_moderator: z.boolean().default(false),
    created_at: z.string(),
});
