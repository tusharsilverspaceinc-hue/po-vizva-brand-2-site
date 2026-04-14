create table if not exists public.bsr_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  record_name text,
  review_period text,
  payload jsonb not null
);

create table if not exists public.application_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  record_name text,
  primary_email text,
  payload jsonb not null
);

alter table public.bsr_submissions enable row level security;
alter table public.application_submissions enable row level security;

drop policy if exists "Allow public insert bsr submissions" on public.bsr_submissions;
create policy "Allow public insert bsr submissions"
on public.bsr_submissions
for insert
to anon, authenticated
with check (true);

drop policy if exists "Allow public insert application submissions" on public.application_submissions;
create policy "Allow public insert application submissions"
on public.application_submissions
for insert
to anon, authenticated
with check (true);

revoke all on public.bsr_submissions from anon, authenticated;
revoke all on public.application_submissions from anon, authenticated;

grant insert on public.bsr_submissions to anon, authenticated;
grant insert on public.application_submissions to anon, authenticated;
