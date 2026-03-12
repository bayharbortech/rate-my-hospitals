-- Migration: Review Moderation System
-- Run this in the Supabase SQL Editor

-- 1. Add admin_comment column for feedback to users
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS admin_comment text;

-- 2. Add ai_review_result column for storing AI analysis
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS ai_review_result jsonb;

-- 3. Add updated_at column for tracking revisions
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 4. Update the status check constraint to allow 'revision_requested'
-- First drop the existing constraint (the enum or check), then recreate it
-- Since status uses the review_status enum, we need to add the new value
ALTER TYPE review_status ADD VALUE IF NOT EXISTS 'revision_requested';

-- 5. Allow users to update their own reviews when revision is requested
CREATE POLICY "Users can update own reviews for revision"
ON public.reviews FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. Allow users to delete their own reviews
CREATE POLICY "Users can delete own reviews"
ON public.reviews FOR DELETE
USING (auth.uid() = user_id);
