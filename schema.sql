-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Enums
create type employer_type as enum ('hospital', 'clinic', 'urgent_care', 'nursing_home');
create type teaching_status as enum ('academic', 'community', 'specialty');
create type work_timeframe as enum ('currently', 'within_6_months', '6_12_months', 'over_1_year');
create type review_status as enum ('pending', 'approved', 'rejected');
create type verification_status as enum ('unverified', 'verified');

-- Create Users Table (extends auth.users)
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  display_name text,
  auth_provider text check (auth_provider in ('email', 'google', 'github')),
  verification_status verification_status default 'unverified',
  is_moderator boolean default false,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS on users
alter table public.users enable row level security;

-- Create Employers Table
create table public.employers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  type employer_type not null,
  address text not null,
  city text not null,
  state text not null,
  zip_code text not null,
  website text,
  phone text,
  bed_count integer,
  health_system text,
  teaching_status teaching_status,
  rating_overall numeric(3, 2) default 0,
  review_count integer default 0,
  badges text[] default array[]::text[],
  created_at timestamptz default now()
);

-- Enable RLS on employers
alter table public.employers enable row level security;

-- Create Salaries Table
create table public.salaries (
  id uuid default uuid_generate_v4() primary key,
  employer_id uuid references public.employers(id) on delete cascade not null,
  position text not null,
  years_experience integer not null,
  hourly_rate numeric(10, 2) not null,
  shift_differential numeric(10, 2),
  sign_on_bonus numeric(10, 2),
  department text not null,
  submitted_at timestamptz default now()
);

-- Enable RLS on salaries
alter table public.salaries enable row level security;

-- Create Interviews Table
create table public.interviews (
  id uuid default uuid_generate_v4() primary key,
  employer_id uuid references public.employers(id) on delete cascade not null,
  position text not null,
  difficulty integer check (difficulty >= 1 and difficulty <= 5),
  process_length_weeks integer,
  questions text[] default array[]::text[],
  offer_received boolean default false,
  notes text,
  submitted_at timestamptz default now()
);

-- Enable RLS on interviews
alter table public.interviews enable row level security;

-- Create Reviews Table
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete set null,
  employer_id uuid references public.employers(id) on delete cascade not null,
  
  -- Ratings
  rating_overall integer check (rating_overall >= 1 and rating_overall <= 5),
  rating_staffing integer check (rating_staffing >= 1 and rating_staffing <= 5),
  rating_safety integer check (rating_safety >= 1 and rating_safety <= 5),
  rating_culture integer check (rating_culture >= 1 and rating_culture <= 5),
  rating_management integer check (rating_management >= 1 and rating_management <= 5),
  rating_pay_benefits integer check (rating_pay_benefits >= 1 and rating_pay_benefits <= 5),
  rating_cattiness integer check (rating_cattiness >= 1 and rating_cattiness <= 5),
  patient_load text,
  
  -- Content
  title text not null,
  review_text text not null,
  work_timeframe work_timeframe not null,
  department text,
  position_type text,
  
  -- Status
  status review_status default 'pending',
  verification_level verification_status default 'unverified',
  
  -- Moderation
  admin_comment text,
  ai_review_result jsonb,
  
  -- Community
  helpful_votes_up integer default 0,
  helpful_votes_down integer default 0,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on reviews
alter table public.reviews enable row level security;

-- Create a trigger to automatically create a public user when a new auth user is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, auth_provider)
  values (new.id, new.email, 'email'); -- Defaulting to email, logic can be improved to detect provider
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- POLICIES

-- Employers: Public Read
create policy "Employers are viewable by everyone" 
on public.employers for select 
using (true);

-- Reviews: Public Read (Approved), Authenticated Insert (Own), User Read (Own)
create policy "Approved reviews are viewable by everyone" 
on public.reviews for select 
using (status = 'approved');

create policy "Users can view their own reviews" 
on public.reviews for select 
using (auth.uid() = user_id);

create policy "Users can insert their own reviews" 
on public.reviews for insert 
with check (auth.uid() = user_id);

-- Salaries: Public Read, Authenticated Insert
create policy "Salaries are viewable by everyone" 
on public.salaries for select 
using (true);

create policy "Authenticated users can insert salaries" 
on public.salaries for insert 
to authenticated 
with check (true);

-- Interviews: Public Read, Authenticated Insert
create policy "Interviews are viewable by everyone" 
on public.interviews for select 
using (true);

create policy "Authenticated users can insert interviews" 
on public.interviews for insert 
to authenticated 
with check (true);

-- Users: Public Read, User Update (Own)
create policy "Public profiles are viewable by everyone" 
on public.users for select 
using (true);

create policy "Users can update own profile" 
on public.users for update 
using (auth.uid() = id);

-- Create Review Votes Table
create table public.review_votes (
  id uuid default uuid_generate_v4() primary key,
  review_id uuid references public.reviews(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  vote_type text check (vote_type in ('helpful', 'not_helpful')) not null,
  created_at timestamptz default now(),
  unique(review_id, user_id)
);

-- Enable RLS on review_votes
alter table public.review_votes enable row level security;

-- Function to update review vote counts
create or replace function public.update_review_vote_counts()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    if (NEW.vote_type = 'helpful') then
      update public.reviews set helpful_votes_up = helpful_votes_up + 1 where id = NEW.review_id;
    else
      update public.reviews set helpful_votes_down = helpful_votes_down + 1 where id = NEW.review_id;
    end if;
  elsif (TG_OP = 'DELETE') then
    if (OLD.vote_type = 'helpful') then
      update public.reviews set helpful_votes_up = helpful_votes_up - 1 where id = OLD.review_id;
    else
      update public.reviews set helpful_votes_down = helpful_votes_down - 1 where id = OLD.review_id;
    end if;
  elsif (TG_OP = 'UPDATE') then
    if (OLD.vote_type = 'helpful' and NEW.vote_type = 'not_helpful') then
      update public.reviews set helpful_votes_up = helpful_votes_up - 1, helpful_votes_down = helpful_votes_down + 1 where id = NEW.review_id;
    elsif (OLD.vote_type = 'not_helpful' and NEW.vote_type = 'helpful') then
      update public.reviews set helpful_votes_down = helpful_votes_down - 1, helpful_votes_up = helpful_votes_up + 1 where id = NEW.review_id;
    end if;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Trigger for review_votes
create trigger on_vote_change
  after insert or update or delete on public.review_votes
  for each row execute procedure public.update_review_vote_counts();

-- App settings table (global admin preferences)
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default 'false'::jsonb,
  updated_at timestamptz default now()
);

alter table public.app_settings enable row level security;

create policy "Anyone can read app settings"
  on public.app_settings for select using (true);

create policy "Admins can update app settings"
  on public.app_settings for update using (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );

create policy "Admins can insert app settings"
  on public.app_settings for insert with check (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );
