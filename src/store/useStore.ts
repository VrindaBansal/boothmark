import { create } from 'zustand';
import { CareerFair, Company, PrepChecklistItem, UserSettings } from '@/types';
import { db } from '@/services/db';

interface AppState {
  // Settings
  settings: UserSettings | null;
  loadSettings: () => Promise<void>;
  saveSettings: (settings: UserSettings) => Promise<void>;

  // Career Fairs
  careerFairs: CareerFair[];
  currentFair: CareerFair | null;
  loadCareerFairs: () => Promise<void>;
  loadCareerFair: (id: string) => Promise<void>;
  saveCareerFair: (fair: CareerFair) => Promise<void>;
  deleteCareerFair: (id: string) => Promise<void>;

  // Checklist Items
  checklistItems: PrepChecklistItem[];
  loadChecklistItems: (fairId: string) => Promise<PrepChecklistItem[]>;
  saveChecklistItem: (item: PrepChecklistItem) => Promise<void>;
  toggleChecklistItem: (itemId: string) => Promise<void>;
  deleteChecklistItem: (id: string) => Promise<void>;

  // Companies
  companies: Company[];
  currentCompany: Company | null;
  loadCompanies: (fairId: string) => Promise<void>;
  loadCompany: (id: string) => Promise<void>;
  saveCompany: (company: Company) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  searchCompanies: (fairId: string, query: string) => Promise<void>;

  // UI State
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Settings
  settings: null,
  loadSettings: async () => {
    try {
      set({ isLoading: true, error: null });
      await db.init();
      const settings = await db.getSettings();
      set({ settings: settings || null, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  saveSettings: async (settings: UserSettings) => {
    try {
      set({ isLoading: true, error: null });
      await db.saveSettings(settings);
      set({ settings, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Career Fairs
  careerFairs: [],
  currentFair: null,
  loadCareerFairs: async () => {
    try {
      set({ isLoading: true, error: null });
      await db.init();
      const fairs = await db.getCareerFairs();
      set({ careerFairs: fairs, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  loadCareerFair: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await db.init();
      const fair = await db.getCareerFair(id);
      set({ currentFair: fair || null, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  saveCareerFair: async (fair: CareerFair) => {
    try {
      set({ isLoading: true, error: null });
      await db.saveCareerFair(fair);
      const fairs = await db.getCareerFairs();
      set({ careerFairs: fairs, currentFair: fair, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  deleteCareerFair: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await db.deleteCareerFair(id);
      const fairs = await db.getCareerFairs();
      set({ careerFairs: fairs, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Checklist Items
  checklistItems: [],
  loadChecklistItems: async (fairId: string) => {
    try {
      set({ isLoading: true, error: null });
      const items = await db.getChecklistItems(fairId);
      set({ checklistItems: items, isLoading: false });
      return items;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      return [];
    }
  },
  saveChecklistItem: async (item: PrepChecklistItem) => {
    try {
      set({ isLoading: true, error: null });
      await db.saveChecklistItem(item);
      const items = await db.getChecklistItems(item.careerFairId);
      set({ checklistItems: items, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  toggleChecklistItem: async (itemId: string) => {
    try {
      const items = get().checklistItems;
      const item = items.find(i => i.id === itemId);
      if (!item) return;

      const updatedItem = {
        ...item,
        isCompleted: !item.isCompleted,
        completedAt: !item.isCompleted ? new Date() : undefined
      };

      await db.saveChecklistItem(updatedItem);
      const updatedItems = await db.getChecklistItems(item.careerFairId);
      set({ checklistItems: updatedItems });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
  deleteChecklistItem: async (id: string) => {
    try {
      const items = get().checklistItems;
      const item = items.find(i => i.id === id);
      if (!item) return;

      await db.deleteChecklistItem(id);
      const updatedItems = await db.getChecklistItems(item.careerFairId);
      set({ checklistItems: updatedItems });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  // Companies
  companies: [],
  currentCompany: null,
  loadCompanies: async (fairId: string) => {
    try {
      set({ isLoading: true, error: null });
      const companies = await db.getCompaniesForFair(fairId);
      set({ companies, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  loadCompany: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const company = await db.getCompany(id);
      set({ currentCompany: company || null, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  saveCompany: async (company: Company) => {
    try {
      set({ isLoading: true, error: null });
      await db.saveCompany(company);
      const companies = await db.getCompaniesForFair(company.careerFairId);
      set({ companies, currentCompany: company, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  deleteCompany: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const company = get().currentCompany;
      await db.deleteCompany(id);
      if (company) {
        const companies = await db.getCompaniesForFair(company.careerFairId);
        set({ companies, isLoading: false });
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  searchCompanies: async (fairId: string, query: string) => {
    try {
      set({ isLoading: true, error: null });
      const companies = await db.searchCompanies(fairId, query);
      set({ companies, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // UI State
  isLoading: false,
  error: null,
  setError: (error: string | null) => set({ error }),
}));
