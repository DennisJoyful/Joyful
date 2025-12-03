
-- recruiters table (Werber ohne E-Mail, anhand TikTok-Handle)
create table if not exists public.recruiters (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references public.profiles(id),
  display_name text not null,
  tiktok_handle text not null,
  public_code text unique, -- für öffentliche Punkte-Ansicht
  created_at timestamptz default now()
);
create index if not exists recruiters_manager_idx on public.recruiters(manager_id);
create unique index if not exists recruiters_handle_unique on public.recruiters(tiktok_handle);

-- referral_codes erweitern um recruiter_id
do $$ begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema='public' and table_name='referral_codes' and column_name='recruiter_id'
  ) then
    alter table public.referral_codes add column recruiter_id uuid null references public.recruiters(id);
  end if;
end $$;

-- points_ledger um recruiter_id erweitern (Werber ohne auth.user)
do $$ begin
  alter table public.points_ledger alter column werber_id drop not null;
exception when others then null; end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema='public' and table_name='points_ledger' and column_name='recruiter_id'
  ) then
    alter table public.points_ledger add column recruiter_id uuid null references public.recruiters(id);
  end if;
end $$;

-- optional: Check Constraint, dass einer von beiden gesetzt ist (werber_id oder recruiter_id) bei neuen Buchungen
do $$ begin
  alter table public.points_ledger
    add constraint points_ledger_who_check
    check (werber_id is not null or recruiter_id is not null);
exception when duplicate_object then null; end $$;

-- RLS Policies korrigieren (keine WITH CHECK bei SELECT)
alter table public.leads enable row level security;
alter table public.points_ledger enable row level security;
alter table public.referral_codes enable row level security;

drop policy if exists leads_admin_all on public.leads;
drop policy if exists leads_manager_select on public.leads;
drop policy if exists leads_manager_ins on public.leads;
drop policy if exists leads_manager_upd on public.leads;

create policy leads_admin_all on public.leads for all
using ( public.is_admin(auth.uid()) )
with check ( public.is_admin(auth.uid()) );

create policy leads_manager_select on public.leads for select
using ( public.is_manager(auth.uid()) and manager_id = auth.uid() );

create policy leads_manager_ins on public.leads for insert
with check ( public.is_manager(auth.uid()) and manager_id = auth.uid() );

create policy leads_manager_upd on public.leads for update
using ( public.is_manager(auth.uid()) and manager_id = auth.uid() )
with check ( public.is_manager(auth.uid()) and manager_id = auth.uid() );

-- referral_codes policies
drop policy if exists referral_admin_all on public.referral_codes;
drop policy if exists referral_manager_select on public.referral_codes;
drop policy if exists referral_manager_upd on public.referral_codes;
drop policy if exists referral_werber_sel on public.referral_codes;

create policy referral_admin_all on public.referral_codes for all
using ( public.is_admin(auth.uid()) )
with check ( public.is_admin(auth.uid()) );

create policy referral_manager_select on public.referral_codes for select
using ( public.is_manager(auth.uid()) and manager_id = auth.uid() );

create policy referral_manager_upd on public.referral_codes for update
using ( public.is_manager(auth.uid()) and manager_id = auth.uid() )
with check ( public.is_manager(auth.uid()) and manager_id = auth.uid() );

-- points_ledger policies (öffentliche Werber-Ansicht läuft über Service-Key in API, daher hier nur Admin/Werber-auth)
drop policy if exists points_admin_all on public.points_ledger;
drop policy if exists points_werber_sel on public.points_ledger;

create policy points_admin_all on public.points_ledger for all
using ( public.is_admin(auth.uid()) )
with check ( public.is_admin(auth.uid()) );

create policy points_werber_sel on public.points_ledger for select
using ( public.is_werber(auth.uid()) and werber_id = auth.uid() );
