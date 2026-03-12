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
