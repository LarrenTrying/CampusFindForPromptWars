-- Supabase PostgreSQL Schema with pgvector for Lost & Found System
-- Run this in your Supabase SQL Editor (https://app.supabase.com -> SQL Editor)

-- 1. Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- 2. Create the reports table
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('lost', 'found')),
  title text not null,
  description text not null,
  category text not null default 'Other',
  image_url text,
  location text not null,
  date_time timestamptz not null default now(),
  contact_name text not null,
  contact_info text not null,
  status text not null default 'active' check (status in ('active', 'matched', 'resolved')),
  attributes jsonb not null default '{}'::jsonb,
  -- 768 dimensions matches Google Gemini text-embedding-004
  embedding vector(768),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Create an HNSW index for ultra-fast cosine similarity search
create index if not exists reports_embedding_hnsw_idx 
on public.reports 
using hnsw (embedding vector_cosine_ops);

-- 4. Enable Row Level Security (RLS)
alter table public.reports enable row level security;

-- Allow public read access to active and resolved reports
create policy "Allow public read access"
  on public.reports for select
  using (true);

-- Allow public insert access
create policy "Allow public insert access"
  on public.reports for insert
  with check (true);

-- Allow public update access (for status updates, resolution, etc.)
create policy "Allow public update access"
  on public.reports for update
  using (true);

-- 5. RPC Function: match_opposite_reports
-- Finds nearest-neighbor reports of the opposite type (lost <-> found) using cosine similarity (<=>)
create or replace function match_opposite_reports (
  query_embedding vector(768),
  target_type text,
  match_threshold float default 0.25,
  match_count int default 8
)
returns table (
  id uuid,
  type text,
  title text,
  description text,
  category text,
  image_url text,
  location text,
  date_time timestamptz,
  contact_name text,
  contact_info text,
  status text,
  attributes jsonb,
  similarity float,
  created_at timestamptz
)
language plpgsql
as $$
begin
  return query
  select
    r.id,
    r.type,
    r.title,
    r.description,
    r.category,
    r.image_url,
    r.location,
    r.date_time,
    r.contact_name,
    r.contact_info,
    r.status,
    r.attributes,
    1 - (r.embedding <=> query_embedding) as similarity,
    r.created_at
  from public.reports r
  where r.type = target_type
    and r.status = 'active'
    and r.embedding is not null
    and (1 - (r.embedding <=> query_embedding)) >= match_threshold
  order by r.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- 6. RPC Function: search_reports
-- General semantic search across reports with optional type filtering
create or replace function search_reports (
  query_embedding vector(768),
  filter_type text default null,
  filter_category text default null,
  match_threshold float default 0.2,
  match_count int default 12
)
returns table (
  id uuid,
  type text,
  title text,
  description text,
  category text,
  image_url text,
  location text,
  date_time timestamptz,
  contact_name text,
  contact_info text,
  status text,
  attributes jsonb,
  similarity float,
  created_at timestamptz
)
language plpgsql
as $$
begin
  return query
  select
    r.id,
    r.type,
    r.title,
    r.description,
    r.category,
    r.image_url,
    r.location,
    r.date_time,
    r.contact_name,
    r.contact_info,
    r.status,
    r.attributes,
    1 - (r.embedding <=> query_embedding) as similarity,
    r.created_at
  from public.reports r
  where (filter_type is null or r.type = filter_type)
    and (filter_category is null or filter_category = 'All' or r.category = filter_category)
    and r.embedding is not null
    and (1 - (r.embedding <=> query_embedding)) >= match_threshold
  order by r.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- 7. Create Supabase Storage Bucket for item photos (optional, fallback to base64/url supported)
insert into storage.buckets (id, name, public)
values ('report-images', 'report-images', true)
on conflict (id) do nothing;

create policy "Allow public image uploads"
  on storage.objects for insert
  with check (bucket_id = 'report-images');

create policy "Allow public image downloads"
  on storage.objects for select
  using (bucket_id = 'report-images');
