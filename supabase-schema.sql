-- Career Fair Buddy Database Schema
-- Run this SQL in your Supabase SQL Editor to create the tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Career Fairs Table
CREATE TABLE IF NOT EXISTS career_fairs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT,
  venue_map_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  career_fair_id UUID NOT NULL REFERENCES career_fairs(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  booth_number TEXT,
  positions TEXT[] DEFAULT '{}',
  contact_info JSONB DEFAULT '{"names": [], "emails": [], "phones": []}'::jsonb,
  application_deadline DATE,
  requirements TEXT[] DEFAULT '{}',
  website_url TEXT,
  careers_page_url TEXT,
  notes TEXT,
  conversation_summary TEXT,
  action_items TEXT[] DEFAULT '{}',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  tags TEXT[] DEFAULT '{}',
  scanned_images TEXT[] DEFAULT '{}',
  extraction_method TEXT CHECK (extraction_method IN ('ocr', 'gpt4o', 'manual')),
  extraction_confidence INTEGER,
  raw_extracted_text TEXT,
  follow_up_status JSONB DEFAULT '{"thankYouSent": false, "applicationSubmitted": false, "linkedInConnected": false, "interviewScheduled": false}'::jsonb,
  voice_notes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prep Checklist Items Table
CREATE TABLE IF NOT EXISTS prep_checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  career_fair_id UUID NOT NULL REFERENCES career_fairs(id) ON DELETE CASCADE,
  item_text TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  openai_api_key_encrypted TEXT,
  ocr_method TEXT DEFAULT 'tesseract' CHECK (ocr_method IN ('tesseract', 'gpt4o', 'manual')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE career_fairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE prep_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Career Fairs Policies
CREATE POLICY "Users can view their own career fairs"
  ON career_fairs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own career fairs"
  ON career_fairs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own career fairs"
  ON career_fairs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own career fairs"
  ON career_fairs FOR DELETE
  USING (auth.uid() = user_id);

-- Companies Policies
CREATE POLICY "Users can view companies in their career fairs"
  ON companies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM career_fairs
      WHERE career_fairs.id = companies.career_fair_id
      AND career_fairs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create companies in their career fairs"
  ON companies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM career_fairs
      WHERE career_fairs.id = companies.career_fair_id
      AND career_fairs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update companies in their career fairs"
  ON companies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM career_fairs
      WHERE career_fairs.id = companies.career_fair_id
      AND career_fairs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete companies in their career fairs"
  ON companies FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM career_fairs
      WHERE career_fairs.id = companies.career_fair_id
      AND career_fairs.user_id = auth.uid()
    )
  );

-- Checklist Items Policies
CREATE POLICY "Users can view checklist items in their career fairs"
  ON prep_checklist_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM career_fairs
      WHERE career_fairs.id = prep_checklist_items.career_fair_id
      AND career_fairs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create checklist items in their career fairs"
  ON prep_checklist_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM career_fairs
      WHERE career_fairs.id = prep_checklist_items.career_fair_id
      AND career_fairs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update checklist items in their career fairs"
  ON prep_checklist_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM career_fairs
      WHERE career_fairs.id = prep_checklist_items.career_fair_id
      AND career_fairs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete checklist items in their career fairs"
  ON prep_checklist_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM career_fairs
      WHERE career_fairs.id = prep_checklist_items.career_fair_id
      AND career_fairs.user_id = auth.uid()
    )
  );

-- User Settings Policies
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes for better query performance
CREATE INDEX idx_career_fairs_user_id ON career_fairs(user_id);
CREATE INDEX idx_career_fairs_date ON career_fairs(date DESC);
CREATE INDEX idx_companies_career_fair_id ON companies(career_fair_id);
CREATE INDEX idx_companies_priority ON companies(priority);
CREATE INDEX idx_companies_created_at ON companies(created_at DESC);
CREATE INDEX idx_checklist_items_career_fair_id ON prep_checklist_items(career_fair_id);
CREATE INDEX idx_checklist_items_display_order ON prep_checklist_items(display_order);
