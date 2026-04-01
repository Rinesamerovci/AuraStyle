# Vercel Deployment Guide - AuraStyle

## ✅ Pre-Deployment Checklist

- ✅ Build passes: `npm run build` successful with 0 errors
- ✅ Supabase database: `outfit_recommendations` table created with RLS
- ✅ Frontend: Fixed to use Supabase CRUD instead of localStorage
- ✅ Environment variables: Configured in `.env.local`
- ✅ Documentation: SUPABASE_SETUP.md and REFLECTION.md created

---

## Step 1: Push Code to GitHub

```bash
# Stage all changes
git add -A

# Commit with clear message
git commit -m "Fix: Replace localStorage with Supabase CRUD implementation + Add RLS reflection"

# Push to main branch
git push origin main
```

---

## Step 2: Connect GitHub to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Select your **GitHub repository** (aurastyle)
4. Click **"Import"**

---

## Step 3: Configure Environment Variables

1. In Vercel dashboard, go to **Settings** → **Environment Variables**
2. Add the following variables (from your `.env.local`):

| Variable | Value | Example |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL | `https://kylhyidrqeyxtvudbnvw.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Key | `eyJhbGc...` |
| `GROQ_API_KEY` | Your Groq API Key | `gsk_...` |

**⚠️ Important:** Make sure variables starting with `NEXT_PUBLIC_` are visible on the client (they should be by default).

---

## Step 4: Deploy

Click **"Deploy"** button in Vercel dashboard.

Wait for the deployment to complete (typically 2-3 minutes).

---

## Step 5: Get Your Live URL

After deployment succeeds, you'll see:
```
✓ Successfully deployed to: https://aurastyle.vercel.app
```

**This is your live URL to submit to the professor!**

---

## Step 6: Test Your Live Site

1. Visit your Vercel URL
2. Go to `/auth` and login
3. Go to `/style` and create an outfit
4. Go to `/outfits` and verify it shows (from Supabase database)
5. Test editing and deleting

**✅ If all above work, RLS is working correctly!**

---

## Troubleshooting

### "Module not found" error
- Make sure ALL environment variables are set in Vercel Settings
- Rebuild the project in Vercel: Click **"Redeploy"**

### Database connection error
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Test: `npx curl https://[SUPABASE_URL]/rest/v1/outfit_recommendations` in your terminal

### RLS denied error
- Ensure user is authenticated (logged in)
- Check RLS policies in Supabase Dashboard
- Verify the session exists: Use browser DevTools → Application → Cookies

---

## What to Submit

Submit to professor:
1. **Live URL:** https://aurastyle.vercel.app
2. **GitHub Repository:** Link to your repo
3. **Proof:** Screenshot of Vercel deployment ✓

---

## Assignment Points Breakdown

| Component | Points | Status |
|-----------|--------|--------|
| Supabase Table | 25 | ✅ |
| CRUD Operations | 30 | ✅ |
| Row Level Security (RLS) | 25 | ✅ |
| Reflection Document | 20 | ✅ (REFLECTION.md) |
| **Bonus: Deployed to Vercel** | +10 | 🔄 (After deployment) |
| **TOTAL** | **110** | **100/100 possible** |

---

## Questions?

If deployment fails, check:
1. Build log in Vercel dashboard
2. Environment variables are set
3. GitHub repository is up to date with latest changes

Good luck! 🚀
