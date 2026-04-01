# AuraStyle Database Testing & RLS Validation Guide

## Pre-Testing Checklist

✅ **Supabase Table Created**
- Table name: `outfits`
- Columns: id, user_id, prompt, response, occasion, language, saved_at
- ✅ User Foreign Keys & RLS Enabled

✅ **Code Updated**
- `app/lib/outfits-db.ts` - CRUD functions ✓
- `app/outfits/page.tsx` - Uses Supabase ✓
- `app/style/page.tsx` - Saves to Supabase ✓

---

## Test Scenario: Two Users Testing

### Step 1: Create Test User #1

```
Email: user1@test.com
Password: TestPass123
Name: Anna Stili
```

1. Go to `http://localhost:3000/auth`
2. Click **"Regjistrohu"** (Sign up)
3. Enter email, password, and name
4. Check email for confirmation link
5. Confirm email
6. You should be redirected to dashboard

**Get User 1 ID:**
- Go to Supabase Dashboard → **Authentication** → **Users**
- Copy the `user_id` for user1@test.com (format: `12345678-1234-1234-1234-123456789012`)
- **Save this ID**

---

### Step 2: Test User #1 - Create Outfit

1. Navigate to `/style` (Style Generator)
2. Create an outfit:
   - **Select Occasions:** Choose "Casual", "Minimale"
   - **Language:** Select "Shqip"
   - **Details:** `"Outfit i lehtë për natën e premtes"`
   - Click **"✦ Gjenero Outfitin"**
   - AI generates outfit
   - Click **"Ruaj këtë Outfit"** (Save this Outfit)

3. Verify saved outfit:
   - Navigate to `/outfits`
   - Should see the outfit in the list
   - It should show "Casual", "Minimale" badges
   - Date should be today

✅ **Test 1 Pass Criteria:** Outfit appears in User 1's collection

---

### Step 3: Verify in Supabase (User 1's Data)

1. Go to **Supabase Dashboard** → **Table Editor** → **outfits**
2. Look for the row you just created:
   - `user_id` should match User 1's ID
   - `prompt` should be: `"Outfit i lehtë për natën e premtes"`
   - `occasion` should be: `["Casual", "Minimale"]`
   - `language` should be: `"shqip"`
   - `saved_at` should be today's date

✅ **Test 2 Pass Criteria:** Data is in database with correct user_id

---

### Step 4: Logout User #1

1. Click username in top-right nav
2. Click **"Dil nga llogaria"** (Logout)
3. Should redirect to home page

---

### Step 5: Create Test User #2

```
Email: user2@test.com
Password: TestPass456
Name: Lena Mode
```

1. Go to `/auth`
2. Sign up with these credentials
3. Confirm email
4. Redirected to dashboard

**Get User 2 ID:**
- Go to Supabase Dashboard → **Authentication** → **Users**
- Copy the `user_id` for user2@test.com
- **Save this ID**

---

### Step 6: Test User #2 - Create Different Outfit

1. Navigate to `/style`
2. Create outfit:
   - **Occasions:** "Punë", "Formal"
   - **Language:** "English"
   - **Details:** `"Professional business outfit for important meeting"`
   - Generate and save

3. Go to `/outfits`
   - Should see User 2's outfit
   - Should **NOT** see User 1's outfit (this is RLS working!)

✅ **Test 3 Pass Criteria:** User 2 sees ONLY their outfit, not User 1's

---

### Step 7: Critical RLS Test - Switch Back to User #1

1. Logout User 2
2. Log back in as User 1 (user1@test.com)
3. Go to `/outfits`

**Verify:**
- User 1 sees ONLY their own outfit (the casual one)
- User 1 does NOT see User 2's professional outfit
- This confirms RLS is working correctly at the database level

✅ **Test 4 Pass Criteria:** RLS enforces row isolation between users

---

### Step 8: Verify RLS in Supabase

**Test Direct Database Query (simulating hacker attempt):**

1. Go to Supabase → **SQL Editor**
2. Try to run:
```sql
SELECT * FROM outfits;
```

3. **Expected Result:** 
   - If RLS is working: Returns ONLY current user's rows
   - If RLS is NOT working: Returns all rows from all users ⚠️

4. Run this query as User 1:
```sql
SELECT id, user_id, prompt FROM outfits WHERE user_id != current_user_id;
```

**Expected Result:**
- Returns 0 rows (RLS blocks unauthorized access)
- If returns rows: RLS is NOT configured correctly ⚠️

---

### Step 9: Test Delete Function

1. As User 1, go to `/outfits`
2. Click the **×** button on the outfit card
3. Confirm deletion

**Verify in Supabase:**
- Go to Table Editor → outfits
- User 1's outfit should be gone
- User 2's outfit should still exist

✅ **Test 5 Pass Criteria:** Delete respects RLS (only deletes own data)

---

## Expected Test Results Summary

| Test | Expected | Status |
|------|----------|--------|
| User 1 creates outfit | Shows in User 1's outfits | ✅ |
| Data saved to Supabase | Row appears with user_id | ✅ |
| User 2 creates outfit | Shows in User 2's outfits | ✅ |
| User 2 doesn't see User 1's | Outfits page empty of User 1 data | ✅ |
| User 1 doesn't see User 2's | Returns to own outfit | ✅ |
| Direct SQL query blocked | RLS prevents cross-user access | ✅ |
| Delete works | Only own outfit deleted | ✅ |

---

## Troubleshooting

### Problem: "Not authenticated" error
**Solution:** Make sure you're logged in. Check auth context.

### Problem: Outfits not showing after save
**Possible causes:**
1. RLS policies not set up correctly
2. User ID not matching in database
3. createOutfit function failing silently

**Debug:**
- Check browser console for errors
- Check Supabase logs
- Verify RLS policies exist in Table Editor

### Problem: Can see other users' outfits
**This is a CRITICAL RLS failure**
- Go to Supabase → Table Editor → outfits → RLS tab
- Verify all 4 policies are enabled
- Check policy SQL: should have `(SELECT auth.uid()) = user_id`

### Problem: "Relation does not exist"
**Solution:** Table might not be created. Run SQL setup in Step 1 of SUPABASE_SETUP.md

---

## Success Criteria

Your implementation is complete when:

✅ Table exists with 4+ columns (id, user_id, prompt, response)
✅ 3+ test rows in database
✅ User 1 sees only their data
✅ User 2 sees only their data
✅ Cross-user query returns 0 rows (RLS blocks it)
✅ Delete only removes own data
✅ No errors in console during testing

---

## Screenshot Requirements for Submission

Take these screenshots to prove it works:

1. **Supabase Table Structure**
   - Show table with all columns
   
2. **Test Data (2+ users)**
   - Supabase Table Editor showing 2+ rows with different user_ids
   
3. **RLS Policies Enabled**
   - Show RLS toggle is ON
   - Show the 4 policies listed
   
4. **User 1 Login with Their Collection**
   - Browser showing logged in as User 1
   - Outfits page shows their collection
   
5. **User 2 Login with Different Collection**
   - Logout and login as User 2
   - Show different outfits (proves isolation)
   
6. **RLS Query Test (Optional)**
   - Supabase SQL Editor showing SELECT query returning 0 rows for unauthorized user

---

## Key RLS Concepts Tested

1. **Data Isolation** - Each user sees only their rows
2. **Policy Enforcement** - Database level, not application level
3. **Foreign Key Constraint** - user_id links to auth.users
4. **Query Filtering** - Automatic WHERE user_id = current_user
5. **Security** - Direct SQL attempts still blocked by RLS

