# Supabase + Vercel Setup Guide

This guide will help you deploy Career Fair Buddy with Supabase (backend) and Vercel (frontend).

## ⚠️ Important: Database Schema Required

**Before using the app, you MUST run the database schema in Supabase!**

The 404 errors you're seeing are because the database tables don't exist yet. Follow **Step 3** under "Part 1: Set Up Supabase" to create the tables using the `supabase-schema.sql` file in the root directory.

## Prerequisites

- A GitHub account (for Vercel deployment)
- A Supabase account (free tier available at https://supabase.com)
- Git installed locally

---

## Part 1: Set Up Supabase (15-20 minutes)

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up / Log in
3. Click "New Project"
4. Fill in:
   - **Project Name**: `career-fair-buddy` (or your choice)
   - **Database Password**: Create a strong password and **save it securely**
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free (perfect for starting)
5. Click "Create new project"
6. Wait 2-3 minutes for project initialization

### Step 2: Set Up Authentication

1. In your Supabase project dashboard, go to **Authentication** → **Providers**
2. **Email Auth** is enabled by default ✅
3. **(Optional) Enable Google OAuth**:
   - Toggle "Google" to ON
   - You'll need to configure Google Cloud Console OAuth:
     - Go to https://console.cloud.google.com
     - Create a new project or select existing
     - Enable Google+ API
     - Create OAuth 2.0 credentials
     - Add authorized redirect URIs from Supabase
   - For now, you can skip this and use email auth only

### Step 3: Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Open the file `/supabase/schema.sql` from this repository
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click "Run" (or press Cmd/Ctrl + Enter)
7. You should see: ✅ **Success. No rows returned**

### Step 4: Create Storage Buckets

1. Go to **Storage** in Supabase dashboard
2. Click "New bucket"
3. Create first bucket:
   - **Name**: `company-images`
   - **Public bucket**: Toggle ON
   - Click "Create bucket"
4. Create second bucket:
   - **Name**: `voice-notes`
   - **Public bucket**: Toggle ON
   - Click "Create bucket"

### Step 5: Set Storage Policies

For each bucket (`company-images` and `voice-notes`):

1. Click on the bucket name
2. Click "Policies" tab
3. Click "New Policy"
4. Create three policies:

**Policy 1: Upload (INSERT)**
```sql
-- Name: Allow authenticated users to upload
-- Operation: INSERT
-- Policy:
(auth.role() = 'authenticated')
```

**Policy 2: View (SELECT)**
```sql
-- Name: Allow public to view
-- Operation: SELECT
-- Policy:
true
```

**Policy 3: Delete**
```sql
-- Name: Allow users to delete their own files
-- Operation: DELETE
-- Policy:
(auth.role() = 'authenticated')
```

### Step 6: Get Your Supabase Credentials

1. Go to **Project Settings** → **API**
2. Find and copy:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")
3. **Save these values** - you'll need them in the next step

---

## Part 2: Configure Your Local Environment (5 minutes)

### Step 1: Create .env File

1. In your project root, create a file named `.env`
2. Copy the contents from `.env.example`
3. Replace with your actual Supabase credentials:

```bash
# Supabase Configuration
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key-here"

# Optional: OpenAI API Key for GPT-4o Vision (users can add their own in settings)
# VITE_OPENAI_API_KEY=sk-...

NODE_ENV="development"
```

### Step 2: Test Locally

1. Install dependencies (if you haven't already):
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open http://localhost:5173
4. Try signing up with a new account
5. If successful, you should:
   - See the signup modal
   - Be able to create an account
   - Be redirected to the app with your name in the header

---

## Part 3: Deploy to Vercel (10 minutes)

### Step 1: Push to GitHub

1. Initialize git (if not already):
```bash
git init
git add .
git commit -m "Initial commit with Supabase integration"
```

2. Create a new repository on GitHub
3. Push your code:
```bash
git remote add origin https://github.com/yourusername/career-fair-buddy.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Sign up / Log in with GitHub
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. Configure project:
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)

6. **Add Environment Variables**:
   Click "Environment Variables" and add:
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: Your Supabase project URL
   - Click "Add"

   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: Your Supabase anon public key
   - Click "Add"

7. Click "Deploy"
8. Wait 2-3 minutes for deployment

### Step 3: Update Supabase Site URL

1. Go back to Supabase dashboard
2. Go to **Authentication** → **URL Configuration**
3. Add your Vercel URL to:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: Add `https://your-app.vercel.app/**`
4. Save changes

---

## Part 4: Test Your Deployment (5 minutes)

1. Open your Vercel URL: `https://your-app.vercel.app`
2. Try signing up with a new account
3. Test login/logout
4. Try creating a career fair
5. Everything should work! 🎉

---

## Troubleshooting

### Issue: "Invalid API Key" or "Supabase credentials not found"

**Solution**: Make sure you added the environment variables in Vercel:
1. Go to Vercel dashboard → Your project → Settings → Environment Variables
2. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly
3. Redeploy: Deployments → ... → Redeploy

### Issue: "Auth session missing" or can't log in

**Solution**: Check Supabase redirect URLs:
1. Supabase dashboard → Authentication → URL Configuration
2. Make sure your Vercel URL is in the redirect URLs
3. Try adding both:
   - `https://your-app.vercel.app`
   - `https://your-app.vercel.app/**`

### Issue: Google OAuth not working

**Solution**:
1. Make sure you enabled Google provider in Supabase
2. Configure Google Cloud Console with correct redirect URIs
3. Add Google Client ID and Secret in Supabase Auth settings

### Issue: Can't upload images

**Solution**:
1. Check storage buckets exist: `company-images` and `voice-notes`
2. Make sure buckets are public
3. Verify storage policies are set correctly (see Step 5 above)

### Issue: Database errors

**Solution**:
1. Go to Supabase SQL Editor
2. Re-run the entire schema.sql file
3. Check for any error messages
4. Make sure Row Level Security (RLS) policies are in place

---

## Cost Breakdown

### Free Tier Limits (Supabase):
- ✅ 500 MB database storage
- ✅ 1 GB file storage
- ✅ 50,000 monthly active users
- ✅ 2 GB bandwidth
- ✅ Social OAuth providers

**This is more than enough for:**
- Personal use
- 100-1,000 students
- Hundreds of career fairs
- Thousands of companies

### Free Tier Limits (Vercel):
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Custom domain support
- ✅ Auto-scaling

### When You'll Need to Upgrade:

**Supabase Pro ($25/month)** when you hit:
- 8+ GB database
- 100+ GB file storage
- 100,000+ monthly active users

**Vercel Pro ($20/month)** when you need:
- Team collaboration
- Advanced analytics
- Higher bandwidth limits

---

## Next Steps

### Optional Enhancements:

1. **Custom Domain**:
   - Buy domain (Namecheap, Google Domains, etc.)
   - Add to Vercel: Settings → Domains
   - Update Supabase redirect URLs

2. **Email Templates**:
   - Supabase dashboard → Authentication → Email Templates
   - Customize signup confirmation, password reset emails

3. **Database Backups**:
   - Supabase Pro feature (automatic daily backups)
   - Or manually export via SQL Editor

4. **Monitoring**:
   - Supabase → Reports (view usage stats)
   - Vercel → Analytics (view deployment stats)

---

## Support

**Supabase Issues**: https://github.com/supabase/supabase/discussions
**Vercel Issues**: https://vercel.com/help

**Project Issues**: https://github.com/yourusername/career-fair-buddy/issues

---

## Summary Checklist

- [ ] Created Supabase project
- [ ] Ran database schema
- [ ] Created storage buckets
- [ ] Set storage policies
- [ ] Copied Supabase credentials
- [ ] Created .env file locally
- [ ] Tested locally
- [ ] Pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Added environment variables in Vercel
- [ ] Updated Supabase redirect URLs
- [ ] Tested production deployment

**Estimated Total Time**: 30-40 minutes

**Total Cost**: $0/month (free tier) 🎉
