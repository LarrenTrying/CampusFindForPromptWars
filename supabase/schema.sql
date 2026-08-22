-- ==============================================================================
-- CAMPUSFIND: Supabase PostgreSQL Schema with pgvector
-- Run this in your Supabase SQL Editor (https://app.supabase.com -> SQL Editor)
-- ==============================================================================

-- 1. Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create the reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('lost', 'found')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  image_url TEXT,
  location TEXT NOT NULL,
  date_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  contact_name TEXT NOT NULL,
  contact_info TEXT NOT NULL,
  reporter_campus_id TEXT DEFAULT '90421',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'matched', 'resolved')),
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding VECTOR(768),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure reporter_campus_id column exists if table was already created
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS reporter_campus_id TEXT;

-- 3. Create HNSW index for ultra-fast cosine similarity search
CREATE INDEX IF NOT EXISTS reports_embedding_hnsw_idx 
ON public.reports 
USING hnsw (embedding vector_cosine_ops);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Clean recreate policies to prevent duplicate errors
DROP POLICY IF EXISTS "Allow public read access" ON public.reports;
CREATE POLICY "Allow public read access"
  ON public.reports FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public insert access" ON public.reports;
CREATE POLICY "Allow public insert access"
  ON public.reports FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access" ON public.reports;
CREATE POLICY "Allow public update access"
  ON public.reports FOR UPDATE
  USING (true);

-- 5. RPC Function: match_opposite_reports
-- Finds nearest-neighbor reports of the opposite type (lost <-> found)
DROP FUNCTION IF EXISTS match_opposite_reports(vector, text, float, int);

CREATE OR REPLACE FUNCTION match_opposite_reports (
  query_embedding VECTOR(768),
  target_type TEXT,
  match_threshold FLOAT DEFAULT 0.05,
  match_count INT DEFAULT 8
)
RETURNS TABLE (
  id UUID,
  type TEXT,
  title TEXT,
  description TEXT,
  category TEXT,
  image_url TEXT,
  location TEXT,
  date_time TIMESTAMPTZ,
  contact_name TEXT,
  contact_info TEXT,
  reporter_campus_id TEXT,
  status TEXT,
  attributes JSONB,
  similarity FLOAT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
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
    r.reporter_campus_id,
    r.status,
    r.attributes,
    (1 - (r.embedding <=> query_embedding))::FLOAT AS similarity,
    r.created_at
  FROM public.reports r
  WHERE r.type = target_type
    AND r.status = 'active'
    AND r.embedding IS NOT NULL
    AND (1 - (r.embedding <=> query_embedding)) >= match_threshold
  ORDER BY r.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 6. RPC Function: search_reports
-- General semantic search across reports with optional type filtering
DROP FUNCTION IF EXISTS search_reports(vector, text, text, float, int);

CREATE OR REPLACE FUNCTION search_reports (
  query_embedding VECTOR(768),
  filter_type TEXT DEFAULT NULL,
  filter_category TEXT DEFAULT NULL,
  match_threshold FLOAT DEFAULT 0.05,
  match_count INT DEFAULT 12
)
RETURNS TABLE (
  id UUID,
  type TEXT,
  title TEXT,
  description TEXT,
  category TEXT,
  image_url TEXT,
  location TEXT,
  date_time TIMESTAMPTZ,
  contact_name TEXT,
  contact_info TEXT,
  reporter_campus_id TEXT,
  status TEXT,
  attributes JSONB,
  similarity FLOAT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
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
    r.reporter_campus_id,
    r.status,
    r.attributes,
    (1 - (r.embedding <=> query_embedding))::FLOAT AS similarity,
    r.created_at
  FROM public.reports r
  WHERE (filter_type IS NULL OR filter_type = 'all' OR r.type = filter_type)
    AND (filter_category IS NULL OR filter_category = 'All' OR r.category = filter_category)
    AND r.embedding IS NOT NULL
    AND (1 - (r.embedding <=> query_embedding)) >= match_threshold
  ORDER BY r.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 7. Storage Bucket for item photos (optional)
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-images', 'report-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow public image uploads" ON storage.objects;
CREATE POLICY "Allow public image uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'report-images');

DROP POLICY IF EXISTS "Allow public image downloads" ON storage.objects;
CREATE POLICY "Allow public image downloads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'report-images');
