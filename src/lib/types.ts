export interface User {
  id: string;
  email: string;
  display_name?: string;
  auth_provider: 'email' | 'google' | 'github';
  verification_status: 'unverified' | 'verified';
  is_moderator: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface Employer {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'urgent_care' | 'nursing_home';
  address: string;
  city: string;
  state: string;
  zip_code: string;
  website?: string;
  phone?: string;
  bed_count?: number;
  health_system?: string;
  teaching_status?: 'academic' | 'community' | 'specialty';
  rating_overall?: number;
  review_count?: number;
  badges?: string[];
  // New fields for filtering
  magnet_status?: boolean;
  union?: boolean;
  new_grad_friendly?: boolean;
  specialties?: string[];
  shift_types?: ('day' | 'night' | 'rotating')[];
  avg_hourly_rate?: number;
  latitude?: number;
  longitude?: number;
}

export interface Salary {
  id: string;
  employer_id: string;
  position: string;
  years_experience: number;
  hourly_rate: number;
  shift_differential?: number;
  sign_on_bonus?: number;
  department: string;
  submitted_at: string;
}

export interface Interview {
  id: string;
  employer_id: string;
  position: string;
  difficulty: number; // 1-5
  process_length_weeks: number;
  questions: string[];
  offer_received: boolean;
  notes: string;
  submitted_at: string;
  // Enhanced fields
  interview_type?: 'phone' | 'video' | 'in-person' | 'panel';
  interviewer_role?: string;
  tips?: string;
  would_interview_again?: boolean;
}

export interface Question {
  id: string;
  employer_id: string;
  user_id: string;
  question_text: string;
  created_at: string;
  answers: Answer[];
  upvotes: number;
  is_answered: boolean;
}

export interface Answer {
  id: string;
  question_id: string;
  user_id: string;
  answer_text: string;
  created_at: string;
  upvotes: number;
  is_accepted: boolean;
}

export interface SavedHospital {
  id: string;
  user_id: string;
  employer_id: string;
  saved_at: string;
  notes?: string;
  notify_new_reviews: boolean;
}

export interface SavedReview {
  id: string;
  user_id: string;
  review_id: string;
  saved_at: string;
  notes?: string;
}

export interface Review {
  id: string;
  user_id: string;
  employer_id: string;

  // Ratings
  rating_overall: number;
  rating_staffing: number;
  rating_safety: number;
  rating_culture: number;
  rating_management: number;
  rating_pay_benefits: number;
  rating_cattiness?: number;
  patient_load?: string;

  // Content
  title: string;
  review_text: string;
  work_timeframe: 'currently' | 'within_6_months' | '6_12_months' | 'over_1_year';
  department?: string;
  position_type?: string;

  // Status
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  verification_level: 'unverified' | 'verified';

  // Moderation
  admin_comment?: string;
  ai_review_result?: AIReviewResult;

  // Community
  helpful_votes_up: number;
  helpful_votes_down: number;

  created_at: string;
  updated_at?: string;
}

export interface AIReviewResult {
  risk_level: 'low' | 'medium' | 'high';
  recommendation: 'approve' | 'revise' | 'reject';
  issues: AIReviewIssue[];
  revised_title: string;
  revised_text: string;
  summary: string;
}

export interface AIReviewIssue {
  type: 'defamation' | 'hipaa' | 'liability' | 'professionalism' | 'other';
  severity: 'low' | 'medium' | 'high';
  excerpt: string;
  explanation: string;
}

// Blog post as stored in the database (snake_case)
export interface BlogPostRow {
  id: number;
  title: string;
  summary: string;
  category: string;
  date: string;
  read_time: string;
  image: string;
  content: string;
  tags?: string;
  status: 'draft' | 'published';
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Blog topic for AI generation
export interface BlogTopic {
  id: number;
  title: string;
  description: string | null;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Blog post request body for API routes
export interface BlogPostRequest {
  id?: number;
  title: string;
  summary: string;
  category: string;
  date?: string;
  readTime?: string;
  image?: string;
  content: string;
  tags?: string;
  status?: 'draft' | 'published';
}
