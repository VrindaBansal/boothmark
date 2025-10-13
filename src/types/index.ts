export interface UserSettings {
  id: 'user-settings';
  name: string;
  email?: string;
  openAIApiKey?: string;
  defaultScanMethod: 'ocr' | 'gpt4o';
  createdAt: Date;
  updatedAt: Date;
}

export interface CareerFair {
  id: string;
  name: string;
  date: Date;
  location: string;
  venueMapUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrepChecklistItem {
  id: string;
  careerFairId: string;
  text: string;
  isCompleted: boolean;
  completedAt?: Date;
  isDefault: boolean;
  order: number;
  createdAt: Date;
}

export interface Company {
  id: string;
  careerFairId: string;

  // Extracted data
  companyName: string;
  boothNumber?: string;
  positions: string[];
  contactInfo: {
    names: string[];
    emails: string[];
    phones: string[];
  };
  applicationDeadline?: Date;
  requirements: string[];
  websiteUrl?: string;
  careersPageUrl?: string;

  // User input
  userNotes: string;
  conversationSummary?: string;
  impressions?: string;
  actionItems: string[];
  priority: 'high' | 'medium' | 'low';
  tags: string[];

  // Metadata
  scannedImages: string[];
  voiceNotes?: Array<{
    id: string;
    audioBlob: string; // base64 encoded audio
    duration: number; // in seconds
    transcript?: string;
    createdAt: Date;
  }>;
  extractionMethod: 'ocr' | 'gpt4o' | 'manual';
  extractionConfidence?: number;
  rawExtractedText?: string;

  // Follow-up tracking
  followUpStatus: {
    thankYouSent: boolean;
    thankYouSentDate?: Date;
    applicationSubmitted: boolean;
    applicationSubmittedDate?: Date;
    linkedInConnected: boolean;
    linkedInConnectedDate?: Date;
    interviewScheduled: boolean;
    interviewDate?: Date;
    customFollowUps?: Array<{
      id: string;
      text: string;
      completed: boolean;
      completedDate?: Date;
    }>;
  };

  createdAt: Date;
  updatedAt: Date;
}

export interface ImageRecord {
  id: string;
  companyId: string;
  blob: Blob;
  createdAt: Date;
}

export const DEFAULT_CHECKLIST_ITEMS = [
  'Print resume copies',
  'Choose and prepare business casual outfit',
  'Eat a substantial breakfast',
  'Practice 30-second elevator pitch',
  'Practice 60-second elevator pitch',
  'Prepare 3-5 company-specific questions',
  'Charge phone fully',
  'Bring portfolio/notepad',
  'Review company list',
  'Bring pen and paper'
];
