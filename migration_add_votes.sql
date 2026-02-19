-- Migration: Add Review Votes and Vote Counting Trigger

-- 1. Create Review Votes Table
create table if not exists public.review_votes (
  id uuid default uuid_generate_v4() primary key,
  review_id uuid references public.reviews(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  vote_type text check (vote_type in ('helpful', 'not_helpful')) not null,
  created_at timestamptz default now(),
  unique(review_id, user_id)
);

-- 2. Enable RLS on review_votes
alter table public.review_votes enable row level security;

-- 3. Function to update review vote counts
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

-- 4. Trigger for review_votes
drop trigger if exists on_vote_change on public.review_votes;
create trigger on_vote_change
  after insert or update or delete on public.review_votes
  for each row execute procedure public.update_review_vote_counts();
