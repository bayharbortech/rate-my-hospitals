-- Migration: blog_topics table for AI blog post generation
-- Run this in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.blog_topics (
    id serial PRIMARY KEY,
    title text NOT NULL,
    description text,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- RLS: admin-only read/write
ALTER TABLE public.blog_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read blog topics"
    ON public.blog_topics FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "Admins can insert blog topics"
    ON public.blog_topics FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "Admins can update blog topics"
    ON public.blog_topics FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "Admins can delete blog topics"
    ON public.blog_topics FOR DELETE
    USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
    );
