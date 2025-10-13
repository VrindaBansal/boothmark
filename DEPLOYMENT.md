# Deployment Guide

## Important: Database Architecture

### Current Setup (IndexedDB - Client-Side Only)
The app currently uses **IndexedDB** for all data storage, which means:
- ✅ All data is stored locally in the user's browser
- ✅ No backend server required
- ✅ Can deploy to **GitHub Pages** for free
- ✅ Works completely offline
- ❌ Data doesn't sync across devices
- ❌ Users lose data if they clear browser storage

### Future Setup (PostgreSQL - Server-Side)
If you want to add PostgreSQL (for user accounts, cloud sync):
- ✅ Data syncs across devices
- ✅ Persistent, reliable storage
- ✅ Multi-user support with authentication
- ❌ Requires a backend server
- ❌ Cannot deploy to GitHub Pages alone
- ❌ Hosting costs (though many free options exist)

---

## Deployment Options

### Option 1: GitHub Pages (Current - No Database Required)

**Best for:** Simple deployment, free hosting, static PWA

The app works perfectly on GitHub Pages because it uses **IndexedDB** (browser storage), not PostgreSQL.

#### Steps:

1. **Update `vite.config.ts`** to set the base path:

```typescript
export default defineConfig({
  base: '/boothmark/', // Replace with your repo name
  // ... rest of config
});
```

2. **Build the app:**

```bash
npm run build
```

3. **Deploy to GitHub Pages:**

```bash
# Install gh-pages package
npm install -D gh-pages

# Add to package.json scripts:
"deploy": "npm run build && gh-pages -d dist"

# Deploy
npm run deploy
```

4. **Configure GitHub Pages:**
   - Go to your repo → Settings → Pages
   - Source: Deploy from `gh-pages` branch
   - Your site will be at: `https://yourusername.github.io/boothmark/`

**Pros:**
- ✅ Completely free
- ✅ Automatic HTTPS
- ✅ Works with PWA features
- ✅ No backend needed

**Cons:**
- ❌ No user accounts
- ❌ Data stays local to each device
- ❌ No cloud backup

---

### Option 2: GitHub Pages + Backend (PostgreSQL)

**Best for:** User accounts, cloud sync, multi-device support

For this, you need two separate deployments:

#### Frontend (Static PWA)
- Deploy to GitHub Pages (as above)

#### Backend (API Server + PostgreSQL)
You'll need to host the backend separately. Options:

##### Free Backend Hosting Options:

**1. Vercel (Recommended)**
- Free PostgreSQL database (Vercel Postgres)
- Serverless functions for API
- Automatic deployments

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**2. Railway.app**
- Free $5/month credits
- Easy PostgreSQL setup
- Deploy from GitHub

**3. Supabase (Easiest)**
- Free PostgreSQL database
- Built-in authentication
- Auto-generated REST API
- No backend code needed!

```bash
# Install Supabase
npm install @supabase/supabase-js

# Connect to your Supabase project
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
```

**4. Render**
- Free tier includes PostgreSQL
- Deploy from GitHub repo
- Auto-sleep after inactivity

##### Backend Architecture:

```
Frontend (GitHub Pages)
    ↓ API calls (HTTPS)
Backend (Vercel/Railway/Render)
    ↓ Database queries
PostgreSQL Database
```

---

### Option 3: All-in-One Hosting (Vercel/Netlify)

**Best for:** Everything in one place

Both support:
- Static site hosting
- Serverless functions
- PostgreSQL databases

```bash
# Vercel
vercel

# Netlify
netlify deploy
```

---

## Recommended Approach

### Phase 1: Start Simple (GitHub Pages)
1. Deploy to GitHub Pages now
2. Use IndexedDB for data storage
3. Get user feedback
4. No costs, works offline

### Phase 2: Add Backend (When Ready)
1. Keep frontend on GitHub Pages
2. Add backend on Supabase (easiest) or Vercel
3. Migrate data from IndexedDB to PostgreSQL
4. Add user authentication

---

## PostgreSQL Hosting Comparison

| Provider | Free Tier | Database Size | Ideal For |
|----------|-----------|---------------|-----------|
| **Supabase** | Yes | 500 MB | Easiest, built-in auth |
| **Vercel** | Yes | 256 MB | Already using Vercel |
| **Railway** | $5 credit/mo | Limited | Simple setup |
| **Render** | Yes | Sleeps after 15min | Low traffic |
| **Neon** | Yes | 3 GB | Serverless Postgres |

---

## Current Status

✅ **Local PostgreSQL is set up** at: `postgresql://postgres@localhost:5432/boothmark`

This is for **local development only**. When users visit your GitHub Pages site, they'll use **IndexedDB** (browser storage), not your local PostgreSQL.

---

## Next Steps

### If deploying to GitHub Pages (no DB):
1. Run `npm run build`
2. Deploy to GitHub Pages
3. Done! ✅

### If you want to add PostgreSQL:
1. Choose a backend provider (Supabase recommended)
2. Create backend API routes
3. Implement authentication
4. Connect frontend to backend
5. Deploy both separately

---

## Example: Supabase Setup (Easiest)

1. **Create Supabase project** at https://supabase.com
2. **Run SQL schema** in Supabase SQL editor (copy from `database/schema.sql`)
3. **Install Supabase client:**

```bash
npm install @supabase/supabase-js
```

4. **Update your code:**

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
)

// Instead of IndexedDB:
const { data, error } = await supabase
  .from('companies')
  .select('*')
  .eq('user_id', userId)
```

5. **Deploy frontend to GitHub Pages** (unchanged)

---

## Summary

**Answer to your question:**
> "If I deployed this on GitHub Pages, would the DB be Postgres or do I need to set one up somewhere?"

**Answer:** GitHub Pages can **only host static files** (HTML, CSS, JS). It **cannot run a PostgreSQL database**.

**Your options:**
1. **Deploy to GitHub Pages now** → Uses IndexedDB (browser storage) → No database server needed ✅
2. **Want PostgreSQL?** → Need a separate backend (Supabase, Vercel, Railway, etc.) → Frontend stays on GitHub Pages, backend hosted elsewhere

**Recommendation:** Start with Option 1 (GitHub Pages + IndexedDB). It's simpler, free, and works great. Add PostgreSQL later if you need user accounts or cloud sync.
