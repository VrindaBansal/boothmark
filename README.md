# Career Fair Buddy (boothmark)

A mobile-first Progressive Web App (PWA) that helps students and job seekers prepare for, navigate, and follow up after career fairs.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 Features

### ✅ Fully Implemented

- **📋 Pre-Event Preparation**
  - Customizable checklist with default items
  - Track completion progress
  - Add custom preparation tasks

- **🏢 Career Fair Management**
  - Create and organize multiple career fairs
  - Track dates, locations, and notes
  - View upcoming and past events

- **📸 Document Scanning**
  - Camera integration for capturing flyers
  - Upload images from gallery
  - Two scanning methods:
    - **Tesseract.js OCR** (Free, offline, ~70-80% accuracy)
    - **GPT-4o Vision** (High accuracy ~90-95%, requires OpenAI API key)
  - Auto-extract: company name, booth number, positions, contacts, deadlines, URLs

- **🗂️ Company Management**
  - Manual company entry
  - OCR/AI-powered data extraction
  - Priority tagging (High/Medium/Low)
  - Store contact information, positions, requirements
  - Add notes and conversation summaries
  - View scanned document images

- **🔍 Search & Organization**
  - Full-text search across companies
  - Filter by priority level
  - Sort by date, name, priority
  - Export to CSV

- **✅ Follow-up Tracking**
  - Built-in checklist per company:
    - Send thank-you email
    - Submit application
    - Connect on LinkedIn
    - Schedule interview
  - Track completion dates

- **⚙️ Settings**
  - OpenAI API key management (optional)
  - Data export/import
  - Clear all data

- **📱 PWA Features**
  - Installable on mobile devices
  - Offline-capable
  - All data stored locally (IndexedDB)
  - No backend required

## 🚀 Getting Started

### Prerequisites

- Node.js 20.15+ (or compatible version)
- npm 10+

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/boothmark.git
cd boothmark
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service (Vercel, Netlify, GitHub Pages, etc.).

## 📱 Usage

### First-Time Setup

1. **Create a Career Fair**
   - Go to "Fairs" tab
   - Click "Add Fair"
   - Enter fair details (name, date, location)

2. **Prepare with Checklist**
   - Open your career fair
   - Click "Prep Checklist"
   - Check off items as you complete them
   - Add custom items as needed

3. **Add Companies**
   - **Option A: Scan a Flyer**
     - Click "Scan Document"
     - Choose scanning method (OCR or GPT-4o)
     - Capture or upload image
     - Review and save extracted data

   - **Option B: Manual Entry**
     - Click "Add Manually"
     - Fill in company details
     - Set priority and save

4. **Track Follow-ups**
   - Open any company
   - Use the follow-up checklist
   - Mark items as complete

### Using GPT-4o Vision (Optional)

1. Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Go to Settings
3. Enter your API key
4. When scanning, select "GPT-4o Vision" method

**Note:** Your API key is stored locally and only sent to OpenAI's servers. Expect ~$0.01-0.03 per scan.

## 🏗️ Tech Stack

- **Frontend Framework:** React 18 + TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS
- **UI Components:** Custom components (shadcn/ui inspired)
- **Routing:** React Router v6
- **State Management:** Zustand
- **Storage:** IndexedDB (via idb)
- **OCR:** Tesseract.js
- **AI Vision:** GPT-4o (optional)
- **PWA:** vite-plugin-pwa
- **Icons:** Lucide React

## 📂 Project Structure

```
boothmark/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   └── Layout.tsx       # App layout with navigation
│   ├── pages/               # Route pages
│   │   ├── HomePage.tsx
│   │   ├── CareerFairsPage.tsx
│   │   ├── CareerFairDetailPage.tsx
│   │   ├── ChecklistPage.tsx
│   │   ├── CompaniesPage.tsx
│   │   ├── CompanyDetailPage.tsx
│   │   ├── ScanPage.tsx
│   │   └── SettingsPage.tsx
│   ├── services/
│   │   ├── db.ts            # IndexedDB service
│   │   ├── ocr.ts           # Tesseract.js OCR
│   │   ├── gpt4o.ts         # GPT-4o Vision integration
│   │   └── export.ts        # CSV export
│   ├── store/
│   │   └── useStore.ts      # Zustand state management
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces
│   ├── lib/
│   │   └── utils.ts         # Utility functions
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## 🗄️ Data Storage

All data is stored locally using IndexedDB:

- **Database Name:** `CareerFairBuddy`
- **Object Stores:**
  - `settings` - User preferences and API key
  - `careerFairs` - Career fair events
  - `checklists` - Prep checklist items
  - `companies` - Company information
  - `images` - Scanned document images

**Privacy:** No data is sent to any external servers except when using GPT-4o Vision (which sends images to OpenAI using your API key).

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Drag and drop the dist/ folder to Netlify
```

### GitHub Pages

```bash
npm run build
# Push the dist/ folder to gh-pages branch
```

## 🔮 Future Enhancements

- PDF export functionality
- Email template library
- Cloud sync (optional)
- Dark mode
- Analytics dashboard
- Resume tailoring suggestions
- Collaborative career fair planning

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ for students navigating career fairs

## 🙏 Acknowledgments

- [Tesseract.js](https://tesseract.projectnaptha.com/) for OCR
- [OpenAI GPT-4o](https://openai.com/) for vision capabilities
- [shadcn/ui](https://ui.shadcn.com/) for component inspiration
- [Lucide](https://lucide.dev/) for beautiful icons

---

**Happy Job Hunting! 🎯**
