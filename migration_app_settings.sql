-- Migration: app_settings table for global admin preferences
-- Run this in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.app_settings (
    key text PRIMARY KEY,
    value jsonb NOT NULL DEFAULT 'false'::jsonb,
    updated_at timestamptz DEFAULT now()
);

-- Seed default settings (disabled by default)
INSERT INTO public.app_settings (key, value)
VALUES ('auto_ai_review_on_resubmit', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.app_settings (key, value)
VALUES ('auto_return_non_approved', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- RLS: public read, admin-only write
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read app settings"
    ON public.app_settings FOR SELECT
    USING (true);

CREATE POLICY "Admins can update app settings"
    ON public.app_settings FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "Admins can insert app settings"
    ON public.app_settings FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
    );
