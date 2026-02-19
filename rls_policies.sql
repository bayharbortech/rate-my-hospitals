-- RLS POLICIES
-- Run this script to apply Row Level Security policies to an existing database.

-- 1. Employers: Public Read
drop policy if exists "Employers are viewable by everyone" on public.employers;
create policy "Employers are viewable by everyone" 
on public.employers for select 
using (true);

drop policy if exists "Authenticated users can create employers" on public.employers;
create policy "Authenticated users can create employers" 
on public.employers for insert 
to authenticated 
with check (true);

-- 2. Reviews: Public Read (Approved), Authenticated Insert (Own), User Read (Own)
drop policy if exists "Approved reviews are viewable by everyone" on public.reviews;
create policy "Approved reviews are viewable by everyone" 
on public.reviews for select 
using (status = 'approved');

drop policy if exists "Users can view their own reviews" on public.reviews;
create policy "Users can view their own reviews" 
on public.reviews for select 
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own reviews" on public.reviews;
create policy "Users can insert their own reviews" 
on public.reviews for insert 
with check (auth.uid() = user_id);

drop policy if exists "Admins can view all reviews" on public.reviews;
create policy "Admins can view all reviews" 
on public.reviews for select 
using (
  exists (select 1 from public.users where id = auth.uid() and is_admin = true)
);

drop policy if exists "Admins can update reviews" on public.reviews;
create policy "Admins can update reviews" 
on public.reviews for update 
using (
  exists (select 1 from public.users where id = auth.uid() and is_admin = true)
);

-- 3. Salaries: Public Read, Authenticated Insert
drop policy if exists "Salaries are viewable by everyone" on public.salaries;
create policy "Salaries are viewable by everyone" 
on public.salaries for select 
using (true);

drop policy if exists "Authenticated users can insert salaries" on public.salaries;
create policy "Authenticated users can insert salaries" 
on public.salaries for insert 
to authenticated 
with check (true);

-- 4. Interviews: Public Read, Authenticated Insert
drop policy if exists "Interviews are viewable by everyone" on public.interviews;
create policy "Interviews are viewable by everyone" 
on public.interviews for select 
using (true);

drop policy if exists "Authenticated users can insert interviews" on public.interviews;
create policy "Authenticated users can insert interviews" 
on public.interviews for insert 
to authenticated 
with check (true);

-- 5. Users: Public Read, User Update (Own)
drop policy if exists "Public profiles are viewable by everyone" on public.users;
create policy "Public profiles are viewable by everyone" 
on public.users for select 
using (true);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile" 
on public.users for update 
using (auth.uid() = id);
-- 6. User Creation Trigger (Idempotent)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, auth_provider)
  values (new.id, new.email, 'email');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. Admin Management Function
create or replace function public.toggle_admin_status(target_user_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  current_user_is_admin boolean;
begin
  -- Check if the executing user is an admin
  select is_admin into current_user_is_admin
  from public.users
  where id = auth.uid();

  if current_user_is_admin is not true then
    raise exception 'Access denied: Only admins can perform this action';
  end if;

  -- Toggle the status
  update public.users
  set is_admin = not is_admin
  where id = target_user_id;
end;
$$;

-- 8. Review Votes Policies
drop policy if exists "Review votes are viewable by everyone" on public.review_votes;
create policy "Review votes are viewable by everyone" 
on public.review_votes for select 
using (true);

drop policy if exists "Authenticated users can insert votes" on public.review_votes;
create policy "Authenticated users can insert votes" 
on public.review_votes for insert 
to authenticated 
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own votes" on public.review_votes;
create policy "Users can update their own votes" 
on public.review_votes for update 
using (auth.uid() = user_id);

drop policy if exists "Users can delete their own votes" on public.review_votes;
create policy "Users can delete their own votes" 
on public.review_votes for delete 
using (auth.uid() = user_id);
