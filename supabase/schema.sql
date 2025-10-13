-- Supabase Database Schema for Career Fair Buddy
-- Run this in your Supabase SQL Editor after creating your project

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
-- Note: Supabase already has auth.users, this is for additional profile data
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User Settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  openai_api_key_encrypted TEXT,
  ocr_method VARCHAR(20) DEFAULT 'tesseract' CHECK (ocr_method IN ('tesseract', 'gpt4o', 'manual')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS for user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Career Fairs table
CREATE TABLE IF NOT EXISTS public.career_fairs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  location VARCHAR(255),
  venue_map_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for career_fairs
ALTER TABLE public.career_fairs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own career fairs"
  ON public.career_fairs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own career fairs"
  ON public.career_fairs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own career fairs"
  ON public.career_fairs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own career fairs"
  ON public.career_fairs FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_career_fairs_user_id ON public.career_fairs(user_id);
CREATE INDEX IF NOT EXISTS idx_career_fairs_date ON public.career_fairs(date);

-- Prep Checklist Items table
CREATE TABLE IF NOT EXISTS public.prep_checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  career_fair_id UUID NOT NULL REFERENCES public.career_fairs(id) ON DELETE CASCADE,
  item_text TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for prep_checklist_items
ALTER TABLE public.prep_checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view checklist items for their career fairs"
  ON public.prep_checklist_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.career_fairs
      WHERE career_fairs.id = prep_checklist_items.career_fair_id
      AND career_fairs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create checklist items for their career fairs"
  ON public.prep_checklist_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.career_fairs
      WHERE career_fairs.id = prep_checklist_items.career_fair_id
      AND career_fairs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update checklist items for their career fairs"
  ON public.prep_checklist_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.career_fairs
      WHERE career_fairs.id = prep_checklist_items.career_fair_id
      AND career_fairs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete checklist items for their career fairs"
  ON public.prep_checklist_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.career_fairs
      WHERE career_fairs.id = prep_checklist_items.career_fair_id
      AND career_fairs.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_prep_checklist_items_career_fair_id ON public.prep_checklist_items(career_fair_id);
CREATE INDEX IF NOT EXISTS idx_prep_checklist_items_display_order ON public.prep_checklist_items(display_order);

-- Companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  career_fair_id UUID NOT NULL REFERENCES public.career_fairs(id) ON DELETE CASCADE,

  -- Basic Information
  company_name VARCHAR(255) NOT NULL,
  booth_number VARCHAR(50),
  positions TEXT[],

  -- Contact Information
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  website_url TEXT,

  -- Application Details
  application_deadline DATE,
  requirements TEXT,

  -- User Notes
  notes TEXT,
  conversation_summary TEXT,
  impressions TEXT,
  action_items TEXT,
  priority VARCHAR(20) CHECK (priority IN ('high', 'medium', 'low')),
  tags TEXT[],

  -- Media
  voice_notes JSONB,
  scanned_images TEXT[],

  -- OCR/Extraction Data
  extraction_method VARCHAR(20) CHECK (extraction_method IN ('tesseract', 'gpt4o', 'manual')),
  extraction_confidence DECIMAL(3, 2),
  raw_ocr_text TEXT,

  -- Follow-up Tracking
  thank_you_sent BOOLEAN DEFAULT FALSE,
  application_submitted BOOLEAN DEFAULT FALSE,
  linkedin_connected BOOLEAN DEFAULT FALSE,
  interview_scheduled BOOLEAN DEFAULT FALSE,
  follow_up_notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view companies for their career fairs"
  ON public.companies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.career_fairs
      WHERE career_fairs.id = companies.career_fair_id
      AND career_fairs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create companies for their career fairs"
  ON public.companies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.career_fairs
      WHERE career_fairs.id = companies.career_fair_id
      AND career_fairs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update companies for their career fairs"
  ON public.companies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.career_fairs
      WHERE career_fairs.id = companies.career_fair_id
      AND career_fairs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete companies for their career fairs"
  ON public.companies FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.career_fairs
      WHERE career_fairs.id = companies.career_fair_id
      AND career_fairs.user_id = auth.uid()
    )
  );

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_companies_career_fair_id ON public.companies(career_fair_id);
CREATE INDEX IF NOT EXISTS idx_companies_priority ON public.companies(priority);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON public.companies(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_career_fairs_updated_at
  BEFORE UPDATE ON public.career_fairs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create Storage Buckets (run these in the Supabase Dashboard → Storage)
-- You'll need to create these manually in the Supabase Dashboard:
-- 1. Bucket: company-images (public)
-- 2. Bucket: voice-notes (public)

-- Storage RLS Policies (to be added in Supabase Dashboard → Storage → Policies)
-- For company-images bucket:
-- - Allow authenticated users to upload: auth.role() = 'authenticated'
-- - Allow authenticated users to view their own files
-- - Allow authenticated users to delete their own files

-- For voice-notes bucket:
-- - Allow authenticated users to upload: auth.role() = 'authenticated'
-- - Allow authenticated users to view their own files
-- - Allow authenticated users to delete their own files
