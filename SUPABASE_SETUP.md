# Supabase Table & RLS Setup Guide

## Step 1: Create the `outfit_recommendations` Table

1. Go to **Supabase Dashboard** → **SQL Editor** (or **Table Editor**)
2. Run this SQL query:

```sql
CREATE TABLE public.outfit_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  occasion TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'english',
  style_tips TEXT,
  rating INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT valid_language CHECK (language IN ('english', 'gheg', 'shqip'))
);

CREATE INDEX idx_outfit_recommendations_user_id ON public.outfit_recommendations(user_id);
CREATE INDEX idx_outfit_recommendations_saved_at ON public.outfit_recommendations(saved_at DESC);
```

**Columns Explanation:**
- `id` - Unique identifier (auto-generated UUID)
- `user_id` - Foreign key to Supabase auth users (ensures user owns the data)
- `prompt` - The user's original request
- `response` - AI-generated outfit suggestion
- `occasion` - Array of occasions (e.g., ['casual', 'work'])
- `language` - Language used (english, gheg, or shqip)
- `saved_at` - Timestamp when outfit was saved

---

## Step 2: Enable Row Level Security (RLS)

1. Go to **Supabase Dashboard** → **Table Editor**
2. Click on the `outfit_recommendations` table
3. Click the **RLS** button (top right)
4. Toggle **Enable RLS** to ON

---

## Step 3: Create RLS Policies

### Policy 1: Users can SELECT (view) only their own outfits

1. Click **New Policy** → **For SELECT**
2. Name: `Users can view own outfits`
3. Under "With checks" section, paste:

```sql
(SELECT auth.uid()) = user_id
```

4. Click **Review** → **Save policy**

---

### Policy 2: Users can INSERT (create) outfits only for themselves

1. Click **New Policy** → **For INSERT**
2. Name: `Users can create own outfits`
3. Under "With checks" section, paste:

```sql
(SELECT auth.uid()) = user_id
```

4. Click **Review** → **Save policy**

---

### Policy 3: Users can UPDATE (edit) only their own outfits

1. Click **New Policy** → **For UPDATE**
2. Name: `Users can update own outfits`
3. Under "With checks" section for BOTH "Using" and "With check", paste:

```sql
(SELECT auth.uid()) = user_id
```

4. Click **Review** → **Save policy**

---

### Policy 4: Users can DELETE only their own outfits

1. Click **New Policy** → **For DELETE**
2. Name: `Users can delete own outfits`
3. Under "With checks" section, paste:

```sql
(SELECT auth.uid()) = user_id
```

4. Click **Review** → **Save policy**

---

## Step 4: Add Test Data

1. Go to **Supabase Dashboard** → **Table Editor** → **outfit_recommendations**
2. Click **Insert Row** and manually add:

**User 1 Outfit:**
- user_id: `[YOUR_FIRST_USER_ID]` (get from Authentication tab)
- prompt: "Outfit për një ditë të vogël pune"
- response: "Përshkrim i outfit-it i gjeneruar nga AI"
- occasion: `['work']`
- language: `'albanian'`

**User 2 Outfit:**
- user_id: `[YOUR_SECOND_USER_ID]`
- prompt: "Casual weekend look"
- response: "AI-generated outfit description"
- occasion: `['casual', 'weekend']`
- language: `'english'`

> **Note:** Get the user IDs from **Supabase Dashboard** → **Authentication** → **Users**

---

## Step 5: Test RLS with Two Users

1. **Sign up User 1** in your app
   - Save their user ID from Supabase

2. **Create an outfit as User 1**
   - Go to Style Generator → Create outfit → Verify it shows in Outfits page

3. **Sign up User 2** in your app
   - Save their user ID from Supabase

4. **Test isolation:**
   - Log in as User 1 → Go to Outfits → Should see ONLY User 1's outfits
   - Log out, then log in as User 2 → Go to Outfits → Should see ONLY User 2's outfits
   - User 2 should NOT see User 1's outfits (RLS prevents this)

5. **Verify in Supabase:**
   - Go to **Authentication** → **Users**
   - Copy each user's ID
   - Go to **Table Editor** → **outfit_recommendations**
   - Verify 2+ test rows exist with different user_ids
   - Try to directly query: `SELECT * FROM outfit_recommendations WHERE user_id != current_user_id`
   - If RLS works, you'll get 0 results (RLS blocks unauthorized access)

---

## Why RLS is Critical

**Without RLS:**
- Any user could query: `SELECT * FROM outfit_recommendations` and see EVERYONE's data
- Attack: User changes their user_id in a request to see other users' data

**With RLS:**
- PostgreSQL enforces: Only your own user_id rows visible
- Database level protection - can't be bypassed by frontend
- Even direct API calls are protected

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Relation does not exist" error | Make sure table was created successfully in SQL Editor |
| Can't insert data | Check RLS policy: user_id must match `auth.uid()` |
| Seeing other users' data | Enable RLS - it's likely disabled |
| No policies showing | Click "Disable RLS" then "Enable RLS" again to refresh |
