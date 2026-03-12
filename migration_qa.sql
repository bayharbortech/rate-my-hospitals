-- Migration: Add Questions and Answers tables for Q&A functionality
-- Run this in your Supabase SQL editor

-- Create Questions Table
create table if not exists public.questions (
  id uuid default uuid_generate_v4() primary key,
  employer_id uuid references public.employers(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete set null,
  question_text text not null,
  upvotes integer default 0,
  is_answered boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS on questions
alter table public.questions enable row level security;

-- Create Answers Table
create table if not exists public.answers (
  id uuid default uuid_generate_v4() primary key,
  question_id uuid references public.questions(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete set null,
  answer_text text not null,
  upvotes integer default 0,
  is_accepted boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS on answers
alter table public.answers enable row level security;

-- Create Question Votes Table (to track who voted)
create table if not exists public.question_votes (
  id uuid default uuid_generate_v4() primary key,
  question_id uuid references public.questions(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(question_id, user_id)
);

-- Enable RLS on question_votes
alter table public.question_votes enable row level security;

-- Create Answer Votes Table (to track who voted)
create table if not exists public.answer_votes (
  id uuid default uuid_generate_v4() primary key,
  answer_id uuid references public.answers(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(answer_id, user_id)
);

-- Enable RLS on answer_votes
alter table public.answer_votes enable row level security;

-- RLS POLICIES

-- Questions: Public Read, Authenticated Insert
drop policy if exists "Questions are viewable by everyone" on public.questions;
create policy "Questions are viewable by everyone"
on public.questions for select
using (true);

drop policy if exists "Authenticated users can insert questions" on public.questions;
create policy "Authenticated users can insert questions"
on public.questions for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own questions" on public.questions;
create policy "Users can update their own questions"
on public.questions for update
using (auth.uid() = user_id);

-- Answers: Public Read, Authenticated Insert
drop policy if exists "Answers are viewable by everyone" on public.answers;
create policy "Answers are viewable by everyone"
on public.answers for select
using (true);

drop policy if exists "Authenticated users can insert answers" on public.answers;
create policy "Authenticated users can insert answers"
on public.answers for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own answers" on public.answers;
create policy "Users can update their own answers"
on public.answers for update
using (auth.uid() = user_id);

-- Question asker can accept answers
drop policy if exists "Question asker can accept answers" on public.answers;
create policy "Question asker can accept answers"
on public.answers for update
using (
  exists (
    select 1 from public.questions
    where questions.id = answers.question_id
    and questions.user_id = auth.uid()
  )
);

-- Question Votes: Public Read, Authenticated Insert/Delete
drop policy if exists "Question votes are viewable by everyone" on public.question_votes;
create policy "Question votes are viewable by everyone"
on public.question_votes for select
using (true);

drop policy if exists "Authenticated users can insert question votes" on public.question_votes;
create policy "Authenticated users can insert question votes"
on public.question_votes for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own question votes" on public.question_votes;
create policy "Users can delete their own question votes"
on public.question_votes for delete
using (auth.uid() = user_id);

-- Answer Votes: Public Read, Authenticated Insert/Delete
drop policy if exists "Answer votes are viewable by everyone" on public.answer_votes;
create policy "Answer votes are viewable by everyone"
on public.answer_votes for select
using (true);

drop policy if exists "Authenticated users can insert answer votes" on public.answer_votes;
create policy "Authenticated users can insert answer votes"
on public.answer_votes for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own answer votes" on public.answer_votes;
create policy "Users can delete their own answer votes"
on public.answer_votes for delete
using (auth.uid() = user_id);

-- Function to update question vote count
create or replace function public.update_question_vote_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.questions set upvotes = upvotes + 1 where id = NEW.question_id;
  elsif (TG_OP = 'DELETE') then
    update public.questions set upvotes = upvotes - 1 where id = OLD.question_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Trigger for question votes
drop trigger if exists on_question_vote_change on public.question_votes;
create trigger on_question_vote_change
  after insert or delete on public.question_votes
  for each row execute procedure public.update_question_vote_count();

-- Function to update answer vote count
create or replace function public.update_answer_vote_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.answers set upvotes = upvotes + 1 where id = NEW.answer_id;
  elsif (TG_OP = 'DELETE') then
    update public.answers set upvotes = upvotes - 1 where id = OLD.answer_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Trigger for answer votes
drop trigger if exists on_answer_vote_change on public.answer_votes;
create trigger on_answer_vote_change
  after insert or delete on public.answer_votes
  for each row execute procedure public.update_answer_vote_count();

-- Function to update is_answered when an answer is added
create or replace function public.update_question_answered_status()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.questions set is_answered = true where id = NEW.question_id;
  elsif (TG_OP = 'DELETE') then
    -- Check if there are any remaining answers
    if not exists (select 1 from public.answers where question_id = OLD.question_id) then
      update public.questions set is_answered = false where id = OLD.question_id;
    end if;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Trigger to auto-update is_answered
drop trigger if exists on_answer_added on public.answers;
create trigger on_answer_added
  after insert or delete on public.answers
  for each row execute procedure public.update_question_answered_status();

-- Create indexes for performance
create index if not exists idx_questions_employer_id on public.questions(employer_id);
create index if not exists idx_questions_created_at on public.questions(created_at desc);
create index if not exists idx_answers_question_id on public.answers(question_id);
create index if not exists idx_answers_created_at on public.answers(created_at desc);

-- End of migration
