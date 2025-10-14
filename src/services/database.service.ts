import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type CareerFair = Database['public']['Tables']['career_fairs']['Row'];
type CareerFairInsert = Database['public']['Tables']['career_fairs']['Insert'];
type CareerFairUpdate = Database['public']['Tables']['career_fairs']['Update'];

type Company = Database['public']['Tables']['companies']['Row'];
type CompanyInsert = Database['public']['Tables']['companies']['Insert'];
type CompanyUpdate = Database['public']['Tables']['companies']['Update'];

type ChecklistItem = Database['public']['Tables']['prep_checklist_items']['Row'];
type ChecklistItemInsert = Database['public']['Tables']['prep_checklist_items']['Insert'];
type ChecklistItemUpdate = Database['public']['Tables']['prep_checklist_items']['Update'];

// Career Fairs
export const careerFairService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('career_fairs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data as CareerFair[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('career_fairs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as CareerFair;
  },

  async create(careerFair: CareerFairInsert) {
    const { data, error } = await supabase
      .from('career_fairs')
      .insert(careerFair)
      .select()
      .single();

    if (error) throw error;
    return data as CareerFair;
  },

  async update(id: string, updates: CareerFairUpdate) {
    const { data, error } = await supabase
      .from('career_fairs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as CareerFair;
  },

  async delete(id: string) {
    const { error } = await supabase.from('career_fairs').delete().eq('id', id);

    if (error) throw error;
  },
};

// Companies
export const companyService = {
  async getAll(careerFairId: string) {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('career_fair_id', careerFairId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Company[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Company;
  },

  async create(company: CompanyInsert) {
    const { data, error } = await supabase
      .from('companies')
      .insert(company)
      .select()
      .single();

    if (error) throw error;
    return data as Company;
  },

  async update(id: string, updates: CompanyUpdate) {
    const { data, error } = await supabase
      .from('companies')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Company;
  },

  async delete(id: string) {
    const { error } = await supabase.from('companies').delete().eq('id', id);

    if (error) throw error;
  },

  async search(careerFairId: string, query: string) {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('career_fair_id', careerFairId)
      .or(
        `company_name.ilike.%${query}%,positions.cs.{${query}},notes.ilike.%${query}%,tags.cs.{${query}}`
      )
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Company[];
  },

  async filterByPriority(careerFairId: string, priority: 'high' | 'medium' | 'low') {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('career_fair_id', careerFairId)
      .eq('priority', priority)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Company[];
  },
};

// Checklist Items
export const checklistService = {
  async getAll(careerFairId: string) {
    const { data, error } = await supabase
      .from('prep_checklist_items')
      .select('*')
      .eq('career_fair_id', careerFairId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data as ChecklistItem[];
  },

  async getByCareerFairId(careerFairId: string) {
    return this.getAll(careerFairId);
  },

  async create(item: ChecklistItemInsert) {
    const { data, error } = await supabase
      .from('prep_checklist_items')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data as ChecklistItem;
  },

  async update(id: string, updates: ChecklistItemUpdate) {
    const { data, error } = await supabase
      .from('prep_checklist_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ChecklistItem;
  },

  async delete(id: string) {
    const { error } = await supabase.from('prep_checklist_items').delete().eq('id', id);

    if (error) throw error;
  },

  async toggleComplete(id: string, isCompleted: boolean) {
    const { data, error } = await supabase
      .from('prep_checklist_items')
      .update({ is_completed: isCompleted })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ChecklistItem;
  },
};

// User Settings
export const userSettingsService = {
  async get(userId: string) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If settings don't exist, create default settings
      if (error.code === 'PGRST116') {
        return this.create(userId);
      }
      throw error;
    }
    return data;
  },

  async create(userId: string) {
    const { data, error } = await supabase
      .from('user_settings')
      .insert({
        user_id: userId,
        ocr_method: 'tesseract',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    userId: string,
    updates: {
      openai_api_key_encrypted?: string | null;
      ocr_method?: 'tesseract' | 'gpt4o' | 'manual';
    }
  ) {
    const { data, error } = await supabase
      .from('user_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
