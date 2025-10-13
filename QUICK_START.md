# Quick Start Guide

## 🚀 Get Your App Running in 30 Minutes

Follow these steps to deploy Career Fair Buddy with Supabase + Vercel.

---

## Part 1: Supabase Setup (15 min)

### 1. Create Supabase Account
- Go to https://supabase.com
- Click "Start your project"
- Sign up with GitHub (recommended) or email

### 2. Create New Project
- Click "New Project"
- Fill in:
  - **Name:** `career-fair-buddy`
  - **Database Password:** (create a strong one and save it!)
  - **Region:** (choose closest to you)
- Click "Create new project"
- ☕ Wait 2-3 minutes for initialization

### 3. Run Database Schema
- Click "SQL Editor" in left sidebar
- Click "New query"
- Open file: `/supabase/schema.sql` from this repo
- Copy ALL contents
- Paste into SQL Editor
- Click "Run" (or press Cmd/Ctrl + Enter)
- ✅ You should see: "Success. No rows returned"

### 4. Create Storage Buckets
- Click "Storage" in left sidebar
- Click "New bucket"
- Create:
  - **Name:** `company-images`
  - **Public:** Toggle ON
  - Click "Create bucket"
- Repeat for second bucket:
  - **Name:** `voice-notes`
  - **Public:** Toggle ON

### 5. Get Your Credentials
- Click "Project Settings" (gear icon)
- Click "API"
- Copy these two values:
  - **Project URL** (https://xxxxx.supabase.co)
  - **anon public key** (long string starting with eyJ...)
- 📋 Save them somewhere - you'll need them next!

---

## Part 2: Local Setup (5 min)

### 1. Clone/Download This Repo
```bash
# If using git
git clone https://github.com/yourusername/boothmark.git
cd boothmark

# Or download ZIP and extract
```

### 2. Create .env File
```bash
# Copy the example
cp .env.example .env

# Open .env in your text editor
# Replace with your actual values:
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key-here"
```

### 3. Install & Run
```bash
npm install
npm run dev
```

### 4. Test Locally
- Open http://localhost:5173
- Click "Get Started" or "Sign Up"
- Create an account
- ✅ If you see your name in the header → Success!

---

## Part 3: Deploy to Vercel (10 min)

### 1. Push to GitHub
```bash
# Initialize git (if needed)
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/yourusername/boothmark.git
git branch -M main
git push -u origin main
```

### 2. Deploy on Vercel
- Go to https://vercel.com
- Click "Sign Up" → Use GitHub
- Click "Add New..." → "Project"
- Find your repo → Click "Import"
- **Don't click Deploy yet!**

### 3. Add Environment Variables
In the "Environment Variables" section:
- Add `VITE_SUPABASE_URL` → (your Supabase URL)
- Add `VITE_SUPABASE_ANON_KEY` → (your anon key)

### 4. Deploy
- Click "Deploy"
- ☕ Wait 2-3 minutes
- ✅ You'll see "Congratulations!"

### 5. Update Supabase
- Go back to Supabase dashboard
- Click "Authentication" → "URL Configuration"
- Add your Vercel URL:
  - **Site URL:** `https://your-app.vercel.app`
  - **Redirect URLs:** Add `https://your-app.vercel.app/**`
- Click "Save"

---

## Part 4: Test Production (2 min)

- Open your Vercel URL
- Try signing up
- Create a career fair
- ✅ Everything works!

---

## 🎉 You're Done!

Your app is now live at: `https://your-app.vercel.app`

### What you have:
- ✅ User authentication
- ✅ PostgreSQL database
- ✅ File storage
- ✅ 100% free hosting
- ✅ Auto-deploy on git push

---

## Next Steps

1. **Customize Domain** (optional):
   - Buy domain → Add to Vercel → Update Supabase URLs

2. **Enable Google OAuth** (optional):
   - Supabase → Authentication → Providers → Google
   - Configure Google Cloud Console
   - Follow prompts

3. **Invite Users**:
   - Share your URL!
   - Users can sign up instantly

---

## Need Help?

See detailed guides:
- **SUPABASE_SETUP.md** - Detailed setup instructions with troubleshooting
- **IMPLEMENTATION_SUMMARY.md** - Technical details and code examples

---

## Troubleshooting

**Can't log in?**
- Check Supabase redirect URLs include your Vercel URL

**Database errors?**
- Re-run schema.sql in Supabase SQL Editor

**Upload not working?**
- Make sure storage buckets are created and public

**Still stuck?**
- Check Supabase logs: Dashboard → Logs
- Check Vercel logs: Your Project → Deployments → View Function Logs

---

**Total Time:** ~30 minutes
**Total Cost:** $0/month

**Happy deploying! 🚀**
