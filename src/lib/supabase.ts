import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not found. Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database types (generated from your schema)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          created_at: string;
          last_login: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          created_at?: string;
          last_login?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          created_at?: string;
          last_login?: string | null;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          openai_api_key_encrypted: string | null;
          ocr_method: 'tesseract' | 'gpt4o' | 'manual';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          openai_api_key_encrypted?: string | null;
          ocr_method?: 'tesseract' | 'gpt4o' | 'manual';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          openai_api_key_encrypted?: string | null;
          ocr_method?: 'tesseract' | 'gpt4o' | 'manual';
          created_at?: string;
          updated_at?: string;
        };
      };
      career_fairs: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          date: string;
          location: string | null;
          venue_map_url: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          date: string;
          location?: string | null;
          venue_map_url?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          date?: string;
          location?: string | null;
          venue_map_url?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      prep_checklist_items: {
        Row: {
          id: string;
          career_fair_id: string;
          item_text: string;
          is_completed: boolean;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          career_fair_id: string;
          item_text: string;
          is_completed?: boolean;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          career_fair_id?: string;
          item_text?: string;
          is_completed?: boolean;
          display_order?: number;
          created_at?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          career_fair_id: string;
          company_name: string;
          booth_number: string | null;
          positions: string[] | null;
          contact_name: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          website_url: string | null;
          application_deadline: string | null;
          requirements: string | null;
          notes: string | null;
          conversation_summary: string | null;
          impressions: string | null;
          action_items: string | null;
          priority: 'high' | 'medium' | 'low' | null;
          tags: string[] | null;
          voice_notes: any | null;
          scanned_images: string[] | null;
          extraction_method: 'tesseract' | 'gpt4o' | 'manual' | null;
          extraction_confidence: number | null;
          raw_ocr_text: string | null;
          thank_you_sent: boolean;
          application_submitted: boolean;
          linkedin_connected: boolean;
          interview_scheduled: boolean;
          follow_up_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          career_fair_id: string;
          company_name: string;
          booth_number?: string | null;
          positions?: string[] | null;
          contact_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          website_url?: string | null;
          application_deadline?: string | null;
          requirements?: string | null;
          notes?: string | null;
          conversation_summary?: string | null;
          impressions?: string | null;
          action_items?: string | null;
          priority?: 'high' | 'medium' | 'low' | null;
          tags?: string[] | null;
          voice_notes?: any | null;
          scanned_images?: string[] | null;
          extraction_method?: 'tesseract' | 'gpt4o' | 'manual' | null;
          extraction_confidence?: number | null;
          raw_ocr_text?: string | null;
          thank_you_sent?: boolean;
          application_submitted?: boolean;
          linkedin_connected?: boolean;
          interview_scheduled?: boolean;
          follow_up_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          career_fair_id?: string;
          company_name?: string;
          booth_number?: string | null;
          positions?: string[] | null;
          contact_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          website_url?: string | null;
          application_deadline?: string | null;
          requirements?: string | null;
          notes?: string | null;
          conversation_summary?: string | null;
          impressions?: string | null;
          action_items?: string | null;
          priority?: 'high' | 'medium' | 'low' | null;
          tags?: string[] | null;
          voice_notes?: any | null;
          scanned_images?: string[] | null;
          extraction_method?: 'tesseract' | 'gpt4o' | 'manual' | null;
          extraction_confidence?: number | null;
          raw_ocr_text?: string | null;
          thank_you_sent?: boolean;
          application_submitted?: boolean;
          linkedin_connected?: boolean;
          interview_scheduled?: boolean;
          follow_up_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
