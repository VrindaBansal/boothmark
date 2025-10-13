import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { CareerFair, Company, PrepChecklistItem, UserSettings, ImageRecord } from '@/types';

interface CareerFairBuddyDB extends DBSchema {
  settings: {
    key: string;
    value: UserSettings;
  };
  careerFairs: {
    key: string;
    value: CareerFair;
    indexes: { 'date': Date; 'createdAt': Date };
  };
  checklists: {
    key: string;
    value: PrepChecklistItem;
    indexes: { 'careerFairId': string; 'order': number };
  };
  companies: {
    key: string;
    value: Company;
    indexes: {
      'careerFairId': string;
      'companyName': string;
      'priority': string;
      'createdAt': Date
    };
  };
  images: {
    key: string;
    value: ImageRecord;
    indexes: { 'companyId': string };
  };
}

class DatabaseService {
  private db: IDBPDatabase<CareerFairBuddyDB> | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    if (this.initPromise) {
      await this.initPromise;
      return;
    }

    this.initPromise = (async () => {
      this.db = await openDB<CareerFairBuddyDB>('CareerFairBuddy', 1, {
        upgrade(db) {
          // Settings store
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'id' });
          }

          // Career Fairs store
          if (!db.objectStoreNames.contains('careerFairs')) {
            const fairStore = db.createObjectStore('careerFairs', { keyPath: 'id' });
            fairStore.createIndex('date', 'date');
            fairStore.createIndex('createdAt', 'createdAt');
          }

          // Checklists store
          if (!db.objectStoreNames.contains('checklists')) {
            const checklistStore = db.createObjectStore('checklists', { keyPath: 'id' });
            checklistStore.createIndex('careerFairId', 'careerFairId');
            checklistStore.createIndex('order', 'order');
          }

          // Companies store
          if (!db.objectStoreNames.contains('companies')) {
            const companyStore = db.createObjectStore('companies', { keyPath: 'id' });
            companyStore.createIndex('careerFairId', 'careerFairId');
            companyStore.createIndex('companyName', 'companyName');
            companyStore.createIndex('priority', 'priority');
            companyStore.createIndex('createdAt', 'createdAt');
          }

          // Images store
          if (!db.objectStoreNames.contains('images')) {
            const imageStore = db.createObjectStore('images', { keyPath: 'id' });
            imageStore.createIndex('companyId', 'companyId');
          }
        },
      });
    })();

    await this.initPromise;
  }

  private ensureDb(): IDBPDatabase<CareerFairBuddyDB> {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db;
  }

  // Settings
  async getSettings(): Promise<UserSettings | undefined> {
    const db = this.ensureDb();
    return await db.get('settings', 'user-settings');
  }

  async saveSettings(settings: UserSettings): Promise<void> {
    const db = this.ensureDb();
    await db.put('settings', settings);
  }

  // Career Fairs
  async getCareerFairs(): Promise<CareerFair[]> {
    const db = this.ensureDb();
    return await db.getAllFromIndex('careerFairs', 'date');
  }

  async getCareerFair(id: string): Promise<CareerFair | undefined> {
    const db = this.ensureDb();
    return await db.get('careerFairs', id);
  }

  async saveCareerFair(fair: CareerFair): Promise<void> {
    const db = this.ensureDb();
    await db.put('careerFairs', fair);
  }

  async deleteCareerFair(id: string): Promise<void> {
    const db = this.ensureDb();

    // Delete associated checklists
    const checklists = await this.getChecklistItems(id);
    for (const item of checklists) {
      await db.delete('checklists', item.id);
    }

    // Delete associated companies and their images
    const companies = await this.getCompaniesForFair(id);
    for (const company of companies) {
      await this.deleteCompany(company.id);
    }

    // Delete the fair itself
    await db.delete('careerFairs', id);
  }

  // Checklist Items
  async getChecklistItems(careerFairId: string): Promise<PrepChecklistItem[]> {
    const db = this.ensureDb();
    return await db.getAllFromIndex('checklists', 'careerFairId', careerFairId);
  }

  async saveChecklistItem(item: PrepChecklistItem): Promise<void> {
    const db = this.ensureDb();
    await db.put('checklists', item);
  }

  async deleteChecklistItem(id: string): Promise<void> {
    const db = this.ensureDb();
    await db.delete('checklists', id);
  }

  // Companies
  async getCompaniesForFair(fairId: string): Promise<Company[]> {
    const db = this.ensureDb();
    return await db.getAllFromIndex('companies', 'careerFairId', fairId);
  }

  async getCompany(id: string): Promise<Company | undefined> {
    const db = this.ensureDb();
    return await db.get('companies', id);
  }

  async saveCompany(company: Company): Promise<void> {
    const db = this.ensureDb();
    await db.put('companies', company);
  }

  async deleteCompany(id: string): Promise<void> {
    const db = this.ensureDb();

    // Delete associated images
    const images = await db.getAllFromIndex('images', 'companyId', id);
    for (const image of images) {
      await db.delete('images', image.id);
    }

    await db.delete('companies', id);
  }

  async searchCompanies(fairId: string, query: string): Promise<Company[]> {
    const companies = await this.getCompaniesForFair(fairId);
    const lowerQuery = query.toLowerCase();

    return companies.filter(company =>
      company.companyName.toLowerCase().includes(lowerQuery) ||
      company.positions.some(p => p.toLowerCase().includes(lowerQuery)) ||
      company.userNotes.toLowerCase().includes(lowerQuery) ||
      company.tags.some(t => t.toLowerCase().includes(lowerQuery))
    );
  }

  // Images
  async saveImage(image: ImageRecord): Promise<void> {
    const db = this.ensureDb();
    await db.put('images', image);
  }

  async getImagesForCompany(companyId: string): Promise<ImageRecord[]> {
    const db = this.ensureDb();
    return await db.getAllFromIndex('images', 'companyId', companyId);
  }

  async deleteImage(id: string): Promise<void> {
    const db = this.ensureDb();
    await db.delete('images', id);
  }
}

export const db = new DatabaseService();
