# 🚀 Vercel Deployment Guide

## Overview

This app uses:
- **Frontend**: React + Vite (deployed to Vercel)
- **Backend**: Supabase (PostgreSQL + Authentication)
- **AI**: OpenAI GPT-4o & GPT-4o-mini

---

## Prerequisites

✅ Supabase account (free tier)
✅ OpenAI API key
✅ GitHub account
✅ Vercel account (free tier)

---

## Step 1: Set Up Supabase Database

### 1.1 Create Supabase Project
1. Go to https://supabase.com
2. Click "New Project"
3. Fill in project details
4. Wait ~2 minutes for setup

### 1.2 Run Database Schema
1. In Supabase, go to **SQL Editor**
2. Click "New Query"
3. Open `SUPABASE_SQL_SETUP.sql` from this repo
4. Copy the **entire file** and paste it
5. Click **Run** (Cmd/Ctrl + Enter)
6. Verify: "✅ Success. No rows returned"

### 1.3 Get Supabase Credentials
1. Go to **Project Settings** → **API**
2. Copy these values (you'll need them later):
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key

---

## Step 2: Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Name it "Boothmark Production"
4. Copy the key (starts with `sk-...`)
5. **Save it securely** - you won't see it again!

---

## Step 3: Deploy to Vercel

### 3.1 Push to GitHub (if not already)

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 3.2 Import to Vercel

1. Go to https://vercel.com
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect **Vite**

### 3.3 Configure Environment Variables

Click "Environment Variables" and add these **3 variables**:

| Name | Value | Example |
|------|-------|---------|
| `VITE_SUPABASE_URL` | Your Supabase Project URL | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon public key | `eyJhbGc...` |
| `VITE_OPENAI_API_KEY` | Your OpenAI API key | `sk-proj-...` |

**Important**:
- ✅ Add to **all 3 environments** (Production, Preview, Development)
- ✅ No quotes around values
- ✅ Exact variable names (including `VITE_` prefix)

### 3.4 Deploy!

1. Click **"Deploy"**
2. Wait ~2-3 minutes
3. You'll get a URL like: `https://your-app.vercel.app`

---

## Step 4: Configure Supabase Redirect URLs

After deployment, update Supabase:

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your Vercel URL:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: `https://your-app.vercel.app/**`
3. Click **"Save"**

---

## Step 5: Test Your Deployment

Visit `https://your-app.vercel.app` and test:

1. ✅ Sign up with a new account
2. ✅ Log in / Log out
3. ✅ Create a career fair
4. ✅ Scan a document (upload image or PDF)
5. ✅ Verify AI summary generates
6. ✅ Check scanned image displays
7. ✅ Add notes and follow-ups

---

## Troubleshooting

### ❌ Build fails with "Module not found"

**Solution**: Install missing dependencies locally first

```bash
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

### ❌ "Invalid API credentials" or blank screen

**Solution**: Check environment variables

1. Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Verify all 3 variables are set correctly
3. Go to **Deployments** tab
4. Click "..." → **"Redeploy"**

### ❌ Database errors (404, "relation does not exist")

**Solution**: Run the SQL schema

1. Go to Supabase **SQL Editor**
2. Run the entire `SUPABASE_SQL_SETUP.sql` file
3. Check for any error messages in the output

### ❌ Can't log in / sign up

**Solution**: Check Supabase redirect URLs

1. Supabase → **Authentication** → **URL Configuration**
2. Make sure your Vercel URL is in **Redirect URLs**
3. Format: `https://your-app.vercel.app/**` (with `/**` at the end)

### ❌ AI summary not generating

**Solutions**:
1. Check `VITE_OPENAI_API_KEY` is set in Vercel
2. Verify OpenAI key has credits: https://platform.openai.com/usage
3. Open browser console (F12) and check for errors

### ❌ Images not displaying

**Solution**: Images are base64-encoded and stored in database

1. Check Supabase → **Table Editor** → `companies` table
2. Look at `scanned_images` column - should have data
3. Check browser console for errors

---

## Custom Domain (Optional)

### Add Custom Domain

1. Buy a domain (Namecheap, Google Domains, etc.)
2. Vercel Dashboard → Your Project → **Settings** → **Domains**
3. Click **"Add Domain"**
4. Enter your domain (e.g., `boothmark.com`)
5. Follow Vercel's DNS configuration instructions

### Update Supabase

After adding custom domain:
1. Supabase → **Authentication** → **URL Configuration**
2. Update **Site URL** to your custom domain
3. Add to **Redirect URLs**: `https://yourdomain.com/**`

---

## Continuous Deployment

Vercel automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature X"
git push origin main
```

Vercel will:
- ✅ Automatically detect the push
- ✅ Build your app
- ✅ Run checks
- ✅ Deploy to production (~2 mins)

---

## Monitoring & Logs

### View Deployment Logs

1. Vercel Dashboard → Your Project → **Deployments**
2. Click on any deployment
3. View **"Build Logs"** or **"Function Logs"**

### Monitor Usage

- **Vercel**: Dashboard → Project → **Analytics**
- **Supabase**: Dashboard → **Reports**
- **OpenAI**: https://platform.openai.com/usage

---

## Cost Breakdown

### Free Forever ✨

**Vercel Free Tier**:
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Automatic HTTPS & CDN
- ✅ Custom domains

**Supabase Free Tier**:
- ✅ 500 MB database
- ✅ 1 GB file storage
- ✅ 50,000 monthly active users
- ✅ Unlimited API requests

### Pay-As-You-Go 💰

**OpenAI Pricing**:
- GPT-4o-mini: **$0.15** per 1M input tokens (~$0.01-0.02 per document)
- GPT-4o: **$2.50** per 1M input tokens (used for extraction)

**Estimated Monthly Cost**:
- 100 scans/month: ~$2-3
- 500 scans/month: ~$10-15
- 1000 scans/month: ~$20-30

### When You Need to Upgrade

You'll stay on free tier unless you exceed:
- **Vercel**: 100 GB bandwidth/month
- **Supabase**: 500 MB data OR 50,000 users

---

## Security Best Practices

✅ **Already Implemented**:
- Environment variables (API keys not in code)
- HTTPS only
- Security headers (X-Frame-Options, CSP, etc.)
- Row Level Security in Supabase
- API key rotation

⚠️ **Recommended**:
- Enable 2FA on Vercel account
- Enable 2FA on Supabase account
- Rotate OpenAI API key every 90 days
- Monitor usage dashboards monthly
- Set up billing alerts

---

## Rollback a Deployment

If something breaks:

1. Vercel Dashboard → **Deployments**
2. Find the last working deployment
3. Click "..." → **"Promote to Production"**
4. Done! Instant rollback.

---

## Force Redeploy

If you need to trigger a rebuild without code changes:

```bash
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_SUPABASE_URL` | ✅ Yes | Supabase project URL | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | ✅ Yes | Supabase public API key | `eyJhbGciOiJI...` |
| `VITE_OPENAI_API_KEY` | ✅ Yes | OpenAI API key for AI features | `sk-proj-...` |

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **OpenAI Docs**: https://platform.openai.com/docs
- **Vercel Support**: https://vercel.com/help
- **Supabase Support**: https://supabase.com/support

---

## Quick Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy (Vercel CLI)
vercel

# View logs (Vercel CLI)
vercel logs
```

---

## Success Checklist

Before going live, verify:

- [ ] Database schema created in Supabase
- [ ] All 3 environment variables set in Vercel
- [ ] Supabase redirect URLs include Vercel domain
- [ ] Sign up/login works
- [ ] Document scanning works
- [ ] AI summary generates
- [ ] Images save and display
- [ ] Mobile responsive (test on phone)
- [ ] PWA features work (add to home screen)

---

## What's Next?

After deployment, consider:

1. **Custom branding**: Update logo, colors, name
2. **Analytics**: Add Google Analytics or Plausible
3. **Error tracking**: Set up Sentry
4. **User feedback**: Add feedback form
5. **SEO**: Add meta tags, sitemap
6. **Social sharing**: Add Open Graph tags

---

**You're all set! 🎉**

Your app is now live at `https://your-app.vercel.app`
