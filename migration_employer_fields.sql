-- Migration: Add additional employer fields for filtering
-- Run this in your Supabase SQL editor

-- Add new columns to employers table
ALTER TABLE public.employers
ADD COLUMN IF NOT EXISTS magnet_status boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS union_hospital boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS new_grad_friendly boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS specialties text[] DEFAULT array[]::text[],
ADD COLUMN IF NOT EXISTS shift_types text[] DEFAULT array[]::text[],
ADD COLUMN IF NOT EXISTS avg_hourly_rate numeric(10, 2),
ADD COLUMN IF NOT EXISTS latitude numeric(10, 6),
ADD COLUMN IF NOT EXISTS longitude numeric(10, 6);

-- Update existing employers with sample data (matching mock data)
-- UCLA Medical Center
UPDATE public.employers SET
  magnet_status = true,
  union_hospital = true,
  new_grad_friendly = true,
  specialties = ARRAY['Trauma', 'Oncology', 'Neurology', 'Cardiology'],
  shift_types = ARRAY['day', 'night', 'rotating'],
  avg_hourly_rate = 65.00,
  latitude = 34.0661,
  longitude = -118.4464
WHERE name LIKE '%UCLA%';

-- Cedars-Sinai
UPDATE public.employers SET
  magnet_status = true,
  union_hospital = false,
  new_grad_friendly = false,
  specialties = ARRAY['Cardiology', 'Neurology', 'Oncology'],
  shift_types = ARRAY['day', 'night', 'rotating'],
  avg_hourly_rate = 72.00,
  latitude = 34.0762,
  longitude = -118.3802
WHERE name LIKE '%Cedars%';

-- Stanford Health
UPDATE public.employers SET
  magnet_status = true,
  union_hospital = false,
  new_grad_friendly = true,
  specialties = ARRAY['Research', 'Pediatrics', 'Transplant'],
  shift_types = ARRAY['day', 'night'],
  avg_hourly_rate = 78.00,
  latitude = 37.4346,
  longitude = -122.1750
WHERE name LIKE '%Stanford%';

-- Kaiser Permanente
UPDATE public.employers SET
  magnet_status = false,
  union_hospital = true,
  new_grad_friendly = true,
  specialties = ARRAY['Primary Care', 'Preventive Medicine'],
  shift_types = ARRAY['day', 'rotating'],
  avg_hourly_rate = 62.00,
  latitude = 37.8044,
  longitude = -122.2712
WHERE name LIKE '%Kaiser%';

-- UCSF Medical Center
UPDATE public.employers SET
  magnet_status = true,
  union_hospital = true,
  new_grad_friendly = true,
  specialties = ARRAY['Research', 'Transplant', 'Neurology', 'Oncology'],
  shift_types = ARRAY['day', 'night', 'rotating'],
  avg_hourly_rate = 75.00,
  latitude = 37.7630,
  longitude = -122.4580
WHERE name LIKE '%UCSF%';

-- Providence
UPDATE public.employers SET
  magnet_status = false,
  union_hospital = false,
  new_grad_friendly = true,
  specialties = ARRAY['Community Health', 'Emergency'],
  shift_types = ARRAY['day', 'night'],
  avg_hourly_rate = 58.00,
  latitude = 34.0922,
  longitude = -118.2952
WHERE name LIKE '%Providence%';

-- Sutter Health
UPDATE public.employers SET
  magnet_status = false,
  union_hospital = true,
  new_grad_friendly = false,
  specialties = ARRAY['General Medicine', 'Surgery'],
  shift_types = ARRAY['day', 'night', 'rotating'],
  avg_hourly_rate = 60.00,
  latitude = 38.5816,
  longitude = -121.4944
WHERE name LIKE '%Sutter%';
