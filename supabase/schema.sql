create extension if not exists "uuid-ossp";

create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'processing', 'ready', 'failed')),
  language text not null default 'auto' check (language in ('auto', 'en', 'hi', 'mr')),
  pages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.download_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  export_type text not null check (export_type in ('pdf', 'docx')),
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;
alter table public.download_history enable row level security;

drop policy if exists "Users can read own projects" on public.projects;
drop policy if exists "Users can insert own projects" on public.projects;
drop policy if exists "Users can update own projects" on public.projects;
drop policy if exists "Users can delete own projects" on public.projects;
drop policy if exists "Users can read own downloads" on public.download_history;
drop policy if exists "Users can insert own downloads" on public.download_history;
drop policy if exists "Authenticated users upload source files" on storage.objects;
drop policy if exists "Authenticated users update source files" on storage.objects;
drop policy if exists "Users read own source files" on storage.objects;
drop policy if exists "Public read source files" on storage.objects;

create policy "Users can read own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

create policy "Users can read own downloads"
  on public.download_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own downloads"
  on public.download_history for insert
  with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('paper-sources', 'paper-sources', true)
on conflict (id) do nothing;

create policy "Authenticated users upload source files"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'paper-sources' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Authenticated users update source files"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'paper-sources' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Public read source files"
  on storage.objects for select
  to public
  using (bucket_id = 'paper-sources');
