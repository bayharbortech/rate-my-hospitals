-- Migration: Add patient_load and rating_cattiness columns to reviews table
-- Run this in the Supabase SQL Editor

-- Patient load range (e.g., '1-4', '5-8', '9-12', '13-16', '17-20', '20+')
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS patient_load text;

-- Cattiness rating (1-5 scale, like other ratings)
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS rating_cattiness integer
CHECK (rating_cattiness >= 1 AND rating_cattiness <= 5);
