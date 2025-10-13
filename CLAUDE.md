# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Career Fair Buddy (boothmark) is a mobile-first Progressive Web App (PWA) that helps students and job seekers prepare for, navigate, and follow up after career fairs. The app combines pre-event preparation checklists with real-time document scanning and intelligent information extraction to create a centralized career fair management system.

## Architecture

**Type**: Progressive Web App (PWA)
**Deployment**: Static site with client-side processing (intended for free tier hosting)
**Data Storage**: All data stored locally using IndexedDB and LocalStorage - no backend required

### Technology Stack (Planned)
- **Frontend**: React 18+ with TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **State**: Zustand or Context API
- **Routing**: React Router v6
- **Camera/Scanning**: HTML5 Media Capture API, getUserMedia, Canvas API
- **OCR**: Tesseract.js (client-side, free) or GPT-4o Vision (optional, user's API key)
- **PWA**: Service Workers + Web App Manifest for offline support
- **Storage**: IndexedDB for all data, LocalStorage for preferences

## Data Models

### IndexedDB Schema
Database name: `CareerFairBuddy`

**Object Stores**:
1. **settings** - User preferences and OpenAI API key (encrypted)
2. **careerFairs** - Career fair events (name, date, location, venue map)
3. **checklists** - Prep checklist items linked to career fairs
4. **companies** - Company information from scanned documents with user notes
5. **images** - Scanned document images (stored as blobs)

### Key TypeScript Interfaces

**Company** - Core data model containing:
- Extracted data: company name, booth number, positions, contact info, deadlines, requirements, URLs
- User input: notes, conversation summary, impressions, action items, priority, tags
- Metadata: scanned images, extraction method (ocr/gpt4o/manual), confidence score
- Follow-up tracking: thank-you sent, application submitted, LinkedIn connected, interview scheduled

See `career_fair_spec.md` lines 236-291 for complete interface definitions.

## Core Features

### 1. Pre-Event Preparation Module
Customizable checklist with default items (resume copies, outfit, elevator pitch practice, etc.)

### 2. Document Scanning & Intelligence Module
- Camera-based document scanning
- Two extraction methods:
  - **Tesseract.js**: Free, client-side OCR (~70-80% accuracy)
  - **GPT-4o Vision**: Optional, requires user's OpenAI API key (~90-95% accuracy)
- Auto-extracts: company name, booth number, positions, contacts, deadlines, requirements, URLs
- Manual fallback for failed extractions

### 3. Company Diary/Management Module
- Organize companies with priority tagging (High/Medium/Low)
- User notes, conversation summaries, action items
- Photos of handouts

### 4. Search & Organization Module
- Search by company name, position, keywords
- Filter by priority, tags
- Export to PDF/CSV

### 5. Post-Event Follow-up Module
- Follow-up checklists per company (thank-you email, application, LinkedIn, etc.)
- Deadline reminders
- Email template library

## Development Phases

The spec outlines 7 phases (see `career_fair_spec.md` lines 513-567):
1. Core MVP - UI, career fair management, manual company entry
2. Camera & OCR - Media capture, Tesseract.js integration
3. Smart Extraction - GPT-4o Vision integration
4. Search & Organization - Full-text search, filtering
5. Follow-up System - Checklists, reminders, email templates
6. Export & PWA - PDF/CSV export, service workers, offline support
7. Polish - Analytics, dark mode, accessibility, onboarding

## Key Implementation Considerations

### Image Processing
- Compress images to max 1024px before processing
- Use Web Workers for OCR to avoid blocking UI
- Show progress indicators during processing

### API Key Security
- Encrypt OpenAI API key using Web Crypto API before storing in IndexedDB
- Never log or expose the key

### Performance
- Use IndexedDB indexes for common queries (careerFairId, priority, createdAt)
- Implement pagination for large lists
- Virtual scrolling for company lists
- Lazy load images

### Offline-First
- Service worker caches all static assets
- Queue GPT-4o requests when offline, sync when connection restored
- Clear visual indicators of online/offline status

### Mobile Optimization
- Mobile-first responsive design
- 44px minimum tap targets
- Native camera integration
- Pull-to-refresh, swipe gestures
- Add to home screen prompt

## Current State

This is a greenfield project - only specification documents exist. No code has been written yet.

## Reference Documentation

Full technical and product specification in `career_fair_spec.md` including:
- Detailed user flows (first-time, during-event, post-event)
- Complete data model schemas
- OCR and GPT-4o processing implementation examples
- Security considerations
- Performance optimization strategies
- Future enhancement ideas
