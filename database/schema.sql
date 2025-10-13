-- Career Fair Buddy Database Schema
-- PostgreSQL Database Setup

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User settings table
CREATE TABLE user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    openai_api_key_encrypted TEXT,
    default_scan_method VARCHAR(20) DEFAULT 'ocr',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Career fairs table
CREATE TABLE career_fairs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    location VARCHAR(255) NOT NULL,
    venue_map_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Prep checklist items table
CREATE TABLE prep_checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    career_fair_id UUID NOT NULL REFERENCES career_fairs(id) ON DELETE CASCADE,
    text VARCHAR(500) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    is_default BOOLEAN DEFAULT FALSE,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    career_fair_id UUID NOT NULL REFERENCES career_fairs(id) ON DELETE CASCADE,

    -- Extracted data
    company_name VARCHAR(255) NOT NULL,
    booth_number VARCHAR(50),
    positions TEXT[], -- Array of positions
    contact_names TEXT[], -- Array of contact names
    contact_emails TEXT[], -- Array of emails
    contact_phones TEXT[], -- Array of phone numbers
    application_deadline DATE,
    requirements TEXT[], -- Array of requirements
    website_url TEXT,
    careers_page_url TEXT,

    -- User input
    user_notes TEXT,
    conversation_summary TEXT,
    impressions TEXT,
    action_items TEXT[], -- Array of action items
    priority VARCHAR(20) DEFAULT 'medium', -- high, medium, low
    tags TEXT[], -- Array of tags

    -- Metadata
    scanned_images TEXT[], -- Array of base64 images
    voice_notes JSONB, -- Array of voice note objects
    extraction_method VARCHAR(20) DEFAULT 'manual', -- ocr, gpt4o, manual
    extraction_confidence INTEGER, -- 0-100
    raw_extracted_text TEXT,

    -- Follow-up tracking
    thank_you_sent BOOLEAN DEFAULT FALSE,
    thank_you_sent_date TIMESTAMP WITH TIME ZONE,
    application_submitted BOOLEAN DEFAULT FALSE,
    application_submitted_date TIMESTAMP WITH TIME ZONE,
    linkedin_connected BOOLEAN DEFAULT FALSE,
    linkedin_connected_date TIMESTAMP WITH TIME ZONE,
    interview_scheduled BOOLEAN DEFAULT FALSE,
    interview_date TIMESTAMP WITH TIME ZONE,
    custom_follow_ups JSONB, -- Array of custom follow-up objects

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_career_fairs_user_id ON career_fairs(user_id);
CREATE INDEX idx_career_fairs_date ON career_fairs(date);
CREATE INDEX idx_checklist_career_fair_id ON prep_checklist_items(career_fair_id);
CREATE INDEX idx_companies_career_fair_id ON companies(career_fair_id);
CREATE INDEX idx_companies_priority ON companies(priority);
CREATE INDEX idx_companies_created_at ON companies(created_at);

-- Full-text search index for companies (using GIN on tsvector column approach)
-- Note: For production, consider using a generated column or materialized view

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_career_fairs_updated_at BEFORE UPDATE ON career_fairs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
