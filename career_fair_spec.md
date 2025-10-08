# Career Fair Buddy - Technical & Product Specification

## Executive Summary
Career Fair Buddy is a mobile-first web application that helps students and job seekers prepare for, navigate, and follow up after career fairs. The app combines pre-event preparation checklists with real-time document scanning and intelligent information extraction to create a centralized career fair management system.

## Product Specification

### Core Value Proposition
Transform the chaotic career fair experience into an organized, actionable workflow by digitizing company materials and providing structured follow-up tools.

### Target Users
- College students attending career fairs
- Recent graduates at recruiting events
- Early-career professionals at industry conferences

### Key Features

#### 1. Pre-Event Preparation Module
**Purpose**: Ensure users are fully prepared before attending the career fair.

**Features**:
- Customizable checklist with default items:
  - Print X copies of resume
  - Choose and prepare business casual outfit
  - Eat a substantial breakfast
  - Practice elevator pitch (30-second, 60-second versions)
  - Prepare 3-5 company-specific questions
  - Charge phone fully
  - Bring portfolio/notepad
  - Review company list
- Ability to add custom checklist items
- Mark items as complete with timestamps
- Set reminders for time-sensitive tasks
- Link to career fair details (date, time, location, venue map)

#### 2. Document Scanning & Intelligence Module
**Purpose**: Quickly capture and extract information from company handouts during the event.

**Features**:
- Camera-based document scanning
- Automatic information extraction:
  - Company name
  - Booth number/location
  - Contact information (recruiter names, emails)
  - Open positions
  - Application deadlines
  - Key requirements
  - Company website/careers page
- Manual fallback for failed extractions
- Support for multiple document types (flyers, business cards, brochures)

#### 3. Company Diary/Management Module
**Purpose**: Organize and prioritize companies met during the fair.

**For each company entry**:
- Auto-extracted information from scanned documents
- User notes section:
  - Conversation summary
  - Impressions
  - Action items
  - Questions to follow up on
- Priority tagging (High/Medium/Low) with color coding
- Timestamp of interaction
- Photos of handouts/materials
- Follow-up status tracking

#### 4. Search & Organization Module
**Purpose**: Enable quick lookup and filtering of saved companies.

**Features**:
- Search by company name, position, or keywords
- Filter by priority level
- Sort by date added, company name, priority
- Tag-based organization (e.g., "first choice", "backup", "internship", "full-time")
- Export options (PDF summary, CSV)

#### 5. Post-Event Follow-up Module
**Purpose**: Facilitate timely follow-up with companies.

**Features**:
- Follow-up checklist generator per company:
  - Send thank-you email (template provided)
  - Submit application
  - Connect on LinkedIn
  - Schedule informational interview
- Deadline reminders based on extracted application dates
- Follow-up status tracking (pending, in progress, completed)
- Email template library with customization

## Technical Specification

### Architecture Overview
**Type**: Progressive Web App (PWA)  
**Deployment**: Static site with client-side processing (free tier hosting)

### Technology Stack

#### Frontend
- **Framework**: React 18+ with TypeScript
- **Routing**: React Router v6
- **State Management**: Zustand or Context API (lighter weight)
- **UI Components**: Tailwind CSS + shadcn/ui
- **Camera/Scanning**: 
  - HTML5 Media Capture API
  - Browser getUserMedia for camera access
  - Canvas API for image processing
- **Local Storage**:
  - IndexedDB for all data storage (no backend required)
  - LocalStorage for user preferences
- **PWA Features**: 
  - Service Workers for offline support
  - Web App Manifest for installability

#### Hosting (Free Options)
- **Static Hosting**: Vercel, Netlify, or GitHub Pages (all have free tiers)
- **No Backend**: Fully client-side application
- **No Database Costs**: IndexedDB stores all data locally in browser

#### Document Processing Pipeline

**Option A: Client-Side OCR (Free, No API Costs)**
- **OCR Engine**: Tesseract.js (runs entirely in browser)
- **Processing Flow**:
  1. User captures image with camera
  2. Image processed client-side with Canvas API
  3. Tesseract.js extracts text
  4. Regex patterns + keyword extraction for structured data
  5. Store results in IndexedDB
- **Pros**: 
  - Completely free
  - No API keys needed
  - Works offline
  - Data stays on device (privacy)
- **Cons**: 
  - Lower accuracy (~70-80%)
  - Slower processing (2-5 seconds per image)
  - May struggle with complex layouts
  - Performance depends on device

**Option B: GPT-4o Vision (Paid, Better Accuracy)**
- **Model**: GPT-4o via OpenAI API (user provides their own API key)
- **Processing Flow**:
  1. User enters their OpenAI API key in settings (stored locally)
  2. User captures image
  3. Image sent to GPT-4o Vision API from client
  4. Structured JSON response parsed and stored
- **Prompt Template**:
  ```
  Extract the following information from this career fair handout:
  - Company name
  - Open positions (list all)
  - Contact information (recruiter names, emails, phone numbers)
  - Application deadline (if mentioned)
  - Key requirements or qualifications
  - Website URL or careers page URL
  - Booth number or location (if visible)
  
  Return ONLY valid JSON in this exact format:
  {
    "companyName": "string",
    "boothNumber": "string or null",
    "positions": ["array of strings"],
    "contactInfo": {
      "names": ["array"],
      "emails": ["array"],
      "phones": ["array"]
    },
    "deadline": "YYYY-MM-DD or null",
    "requirements": ["array of strings"],
    "websiteUrl": "string or null",
    "careersPageUrl": "string or null"
  }
  ```
- **Pros**: 
  - High accuracy (90-95%)
  - Handles complex layouts
  - Understands context
  - Fast processing (~1-2 seconds)
- **Cons**: 
  - Costs ~$0.01-0.03 per scan (user pays from their API key)
  - Requires internet connection
  - User must manage their own API key

**Recommended Implementation Strategy**:
1. Default to Tesseract.js (free, always available)
2. Allow users to optionally configure GPT-4o with their own API key
3. Toggle in settings: "Use AI-powered scanning (requires OpenAI API key)"
4. Provide clear UI indication of which method is being used
5. Show processing status and confidence score

### Data Models

All data stored in IndexedDB with the following schemas:

#### User Settings
```typescript
interface UserSettings {
  id: 'user-settings'; // Single record
  name: string;
  email?: string;
  openAIApiKey?: string; // Encrypted
  defaultScanMethod: 'ocr' | 'gpt4o';
  createdAt: Date;
  updatedAt: Date;
}
```

#### CareerFair
```typescript
interface CareerFair {
  id: string; // UUID
  name: string;
  date: Date;
  location: string;
  venueMapUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### PrepChecklist
```typescript
interface PrepChecklistItem {
  id: string; // UUID
  careerFairId: string;
  text: string;
  isCompleted: boolean;
  completedAt?: Date;
  isDefault: boolean;
  order: number;
  createdAt: Date;
}
```

#### Company
```typescript
interface Company {
  id: string; // UUID
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
  scannedImages: string[]; // Base64 encoded or IndexedDB blob references
  extractionMethod: 'ocr' | 'gpt4o' | 'manual';
  extractionConfidence?: number;
  rawExtractedText?: string; // For debugging/correction
  
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
```

### IndexedDB Schema

```typescript
// Database name: 'CareerFairBuddy'
// Version: 1

// Object Stores:
const stores = {
  settings: {
    keyPath: 'id',
    indexes: []
  },
  careerFairs: {
    keyPath: 'id',
    indexes: [
      { name: 'date', keyPath: 'date' },
      { name: 'createdAt', keyPath: 'createdAt' }
    ]
  },
  checklists: {
    keyPath: 'id',
    indexes: [
      { name: 'careerFairId', keyPath: 'careerFairId' },
      { name: 'order', keyPath: 'order' }
    ]
  },
  companies: {
    keyPath: 'id',
    indexes: [
      { name: 'careerFairId', keyPath: 'careerFairId' },
      { name: 'companyName', keyPath: 'companyName' },
      { name: 'priority', keyPath: 'priority' },
      { name: 'createdAt', keyPath: 'createdAt' }
    ]
  },
  images: {
    keyPath: 'id',
    indexes: [
      { name: 'companyId', keyPath: 'companyId' }
    ]
  }
};
```

### Core Features Implementation

#### Camera & Image Capture
```typescript
// Use HTML5 getUserMedia API
navigator.mediaDevices.getUserMedia({ 
  video: { 
    facingMode: 'environment', // Back camera
    width: { ideal: 1920 },
    height: { ideal: 1080 }
  } 
})

// Capture to canvas, compress, and process
// Max dimension: 1024px to reduce processing time
```

#### OCR Processing (Tesseract.js)
```typescript
import Tesseract from 'tesseract.js';

async function processImageWithOCR(imageData: string) {
  const result = await Tesseract.recognize(imageData, 'eng', {
    logger: (m) => console.log(m) // Progress updates
  });
  
  const extractedData = parseOCRText(result.data.text);
  return {
    ...extractedData,
    confidence: result.data.confidence,
    rawText: result.data.text
  };
}

function parseOCRText(text: string) {
  // Regex patterns for common data
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  const phoneRegex = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Extract and structure data
  // Use keyword matching for positions, deadlines, etc.
}
```

#### GPT-4o Processing
```typescript
async function processImageWithGPT4o(
  imageData: string, 
  apiKey: string
) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: EXTRACTION_PROMPT
            },
            {
              type: 'image_url',
              image_url: {
                url: imageData // Data URL or base64
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    })
  });
  
  const result = await response.json();
  return JSON.parse(result.choices[0].message.content);
}
```

#### Data Persistence
```typescript
// Wrapper around IndexedDB for easier usage
class DatabaseService {
  private db: IDBDatabase;
  
  async init() {
    // Open database, create object stores
  }
  
  async saveCareerFair(fair: CareerFair) {
    // Save to careerFairs store
  }
  
  async getCareerFairs(): Promise<CareerFair[]> {
    // Retrieve all career fairs
  }
  
  async saveCompany(company: Company) {
    // Save to companies store
  }
  
  async getCompaniesForFair(fairId: string): Promise<Company[]> {
    // Query by index
  }
  
  async searchCompanies(query: string): Promise<Company[]> {
    // Full-text search across company names, positions, notes
  }
  
  async exportData(): Promise<Blob> {
    // Export all data as JSON for backup
  }
  
  async importData(data: Blob) {
    // Import from backup
  }
}
```

### Security Considerations

1. **API Key Storage**: 
   - Encrypt OpenAI API key before storing in IndexedDB
   - Use Web Crypto API for encryption
   - Never log or expose API key

2. **Data Privacy**:
   - All data stored locally on device
   - No server communication except OpenAI API (optional)
   - Clear data export/delete functionality

3. **Image Storage**:
   - Store compressed images in IndexedDB as blobs
   - Implement storage quota management
   - Auto-cleanup of old images

### Performance Optimization

1. **Image Processing**:
   - Compress images before processing (max 1024px)
   - Show progress indicators during OCR
   - Cancel processing if user navigates away

2. **IndexedDB**:
   - Use indexes for common queries
   - Implement pagination for large lists
   - Cache frequently accessed data in memory

3. **UI Responsiveness**:
   - Use Web Workers for OCR processing
   - Virtual scrolling for company lists
   - Lazy load images
   - Debounce search input

4. **Offline Support**:
   - Service worker caches all static assets
   - Queue GPT-4o requests when offline
   - Sync when connection restored

### Mobile Optimization

- Responsive design (mobile-first)
- Touch-optimized UI (44px minimum tap targets)
- Native camera integration
- Pull-to-refresh
- Swipe gestures for navigation
- Add to home screen prompt
- Splash screen
- Status bar theming

## Development Phases

### Phase 1: Core MVP
- Basic UI/UX with Tailwind + shadcn/ui
- Career fair creation and management
- Prep checklist (hardcoded defaults + custom items)
- Manual company entry form
- Basic company list with priority tags
- IndexedDB setup and data persistence

### Phase 2: Camera & OCR
- Camera integration with media capture
- Image preview and capture
- Tesseract.js integration
- Basic text extraction with regex parsing
- Manual correction UI
- Image storage in IndexedDB

### Phase 3: Smart Extraction
- GPT-4o Vision integration
- API key management in settings
- Extraction method toggle
- Confidence scoring
- Side-by-side comparison of OCR vs GPT-4o
- Error handling and retry logic

### Phase 4: Search & Organization
- Full-text search across companies
- Filter by priority, tags, dates
- Sort options
- Tag management
- Bulk operations

### Phase 5: Follow-up System
- Follow-up checklist per company
- Status tracking
- Deadline reminders (Web Notifications API)
- Email template library
- Template customization

### Phase 6: Export & PWA
- Export to PDF (jsPDF)
- Export to CSV
- Data backup/restore
- Service worker for offline support
- Install prompts
- Push notifications

### Phase 7: Polish & Enhancement
- Analytics dashboard (companies scanned, follow-ups completed)
- Dark mode
- Accessibility improvements (ARIA labels, keyboard navigation)
- Onboarding flow
- Help documentation

## User Flows

### First-Time User Flow
1. Land on homepage
2. See brief explanation + demo GIF
3. Click "Create Your First Career Fair"
4. Enter fair details (name, date, location)
5. View pre-populated prep checklist
6. Customize checklist
7. Mark items as complete
8. Navigate to "Companies" tab
9. See "Scan Your First Flyer" prompt
10. Grant camera permissions
11. Scan sample flyer
12. See extracted data
13. Add notes and set priority
14. View company in diary

### During-Event Flow
1. Open app at career fair
2. Navigate to active fair
3. Tap "Scan Flyer" button
4. Point camera at handout
5. Capture image
6. Wait for processing (2-5 seconds)
7. Review extracted information
8. Correct any errors
9. Add conversation notes
10. Set priority level
11. Add tags
12. Save company
13. Repeat for each booth visited

### Post-Event Flow
1. Open app after career fair
2. Review all companies
3. Filter by high priority
4. For each company:
   - Review notes
   - Check application deadline
   - Mark follow-up items as complete
   - Use email template
5. Export summary PDF
6. Track follow-up progress over time

## Success Metrics

### User Engagement
- Average companies scanned per career fair
- Checklist completion rate
- User retention (return visits)
- Time spent in app

### Feature Adoption
- % users using scan feature vs manual entry
- % users adding notes
- % users setting priorities
- % users using follow-up tracking

### Extraction Quality
- OCR success rate (user doesn't need to correct)
- GPT-4o adoption rate
- Average confidence scores
- User correction frequency

### Follow-up Effectiveness
- % users tracking follow-ups
- Average follow-up completion time
- Follow-up completion rate

## Future Enhancements

### AI-Powered Insights
- Company match scoring based on user profile
- Suggested questions based on company and role
- Automated thank-you email generation
- Interview preparation tips

### Social Features
- Share company notes with friends (encrypted)
- Anonymous company reviews/ratings
- Collaborative prep lists
- Group career fair planning

### Advanced Scanning
- Business card mode (optimized for small cards)
- Multi-page document scanning
- Handwriting recognition
- Audio note recording and transcription

### Integration Ecosystem
- LinkedIn auto-connect
- Google Calendar integration
- Email client integration
- Resume tailor recommendations

### Premium Features (Future Monetization)
- Unlimited GPT-4o scans (app pays for API)
- Advanced analytics and insights
- Cloud sync across devices
- Team/university licenses
- Career counselor dashboard

## Technical Challenges & Solutions

### Challenge: IndexedDB Complexity
**Solution**: Create abstraction layer (DatabaseService class) with simple async/await API

### Challenge: OCR Accuracy
**Solution**: 
- Pre-process images (contrast enhancement, noise reduction)
- Use multiple OCR passes with different configs
- Provide manual correction UI
- Save raw text for debugging

### Challenge: Storage Limits
**Solution**:
- Compress images aggressively
- Implement automatic cleanup of old fairs
- Request persistent storage permission
- Warn user when approaching quota

### Challenge: Offline-First Architecture
**Solution**:
- Service worker caches all static assets
- Queue network requests when offline
- Sync on reconnection
- Clear visual indicators of online/offline status

### Challenge: Cross-Browser Compatibility
**Solution**:
- Use feature detection, not browser detection
- Polyfills for IndexedDB, getUserMedia
- Progressive enhancement approach
- Graceful degradation for unsupported features

## Conclusion

Career Fair Buddy solves a real pain point by digitizing and organizing the career fair experience. The free-to-host architecture using static site deployment and client-side data storage ensures zero infrastructure costs while maintaining full functionality. The dual OCR/GPT-4o approach gives users flexibility to choose between free (but less accurate) and paid (but highly accurate) extraction methods. The PWA architecture ensures the app works seamlessly across all devices, online and offline, making it the perfect companion for navigating career fairs.