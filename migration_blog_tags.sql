-- Migration: add tags column to blog_posts
-- Run this in the Supabase SQL editor

ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS tags text;
