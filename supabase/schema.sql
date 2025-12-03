-- supabase/schema.sql
-- Basic schema for Joyful project (simplified, no RLS for now)
create table if not exists managers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text unique
);

create table if not exists werber (
  id uuid default gen_random_uuid() primary key,
  manager_id uuid references managers(id),
  name text not null,
  ref_code text unique not null,
  created_at timestamp with time zone default now()
);

create table if not exists leads (
  id uuid default gen_random_uuid() primary key,
  creator_handle text not null,
  status text check (status in ('keine reaktion','eingeladen','abgesagt','gejoint','aktiv','inaktiv','followup')) default 'keine reaktion',
  source text,
  contact_date date,
  follow_up_date date,
  live_status boolean default false,
  manager_id uuid references managers(id),
  werber_id uuid references werber(id),
  created_at timestamp with time zone default now()
);

create table if not exists recruits (
  id uuid default gen_random_uuid() primary key,
  lead_id uuid references leads(id),
  creator_id text,    -- TikTok Creator ID (stable)
  handle text,        -- TikTok handle (mutable)
  joined_date date not null
);

create table if not exists stream_monthly_stats (
  id uuid default gen_random_uuid() primary key,
  recruit_id uuid references recruits(id),
  month text not null,          -- YYYY-MM
  days_streamed int default 0,
  hours_streamed int default 0,
  diamonds int default 0,
  is_rookie boolean default false
);

create table if not exists points_ledger (
  id uuid default gen_random_uuid() primary key,
  werber_id uuid references werber(id),
  recruit_id uuid references recruits(id),
  date date not null,
  points int not null,
  reason text
);

-- indexes
create index if not exists leads_status_idx on leads (status);
create index if not exists leads_manager_idx on leads (manager_id);
create index if not exists points_werber_idx on points_ledger (werber_id, date);
create index if not exists stats_recruit_month_idx on stream_monthly_stats (recruit_id, month);
