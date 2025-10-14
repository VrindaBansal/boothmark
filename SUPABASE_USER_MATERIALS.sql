-- ============================================
-- User Materials Table - Run this in Supabase SQL Editor
-- ============================================
-- This adds storage for resume, elevator pitch, and recruiter questions

-- User Materials Table
CREATE TABLE IF NOT EXISTS user_materials (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_text TEXT,
  resume_parsed JSONB,
  resume_file_name TEXT,
  resume_file_data TEXT, -- Base64 encoded PDF
  resume_uploaded_at TIMESTAMPTZ,
  elevator_pitch TEXT,
  recruiter_questions JSONB DEFAULT '[]'::jsonb,
  target_roles TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_materials ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own materials"
  ON user_materials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own materials"
  ON user_materials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own materials"
  ON user_materials FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own materials"
  ON user_materials FOR DELETE
  USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_materials_user_id ON user_materials(user_id);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ User materials table created successfully!';
END $$;
