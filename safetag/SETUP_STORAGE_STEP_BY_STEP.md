# Step-by-Step: Fix Storage Upload Issue

## Problem
Photos are not uploading to Supabase Storage because of Row-Level Security (RLS) blocking the upload.

## Solution: Configure Supabase Storage (5 minutes)

### Step 1: Create/Check Storage Bucket
1. Open your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `smoyoszfxvzlrapabhsc`
3. Click **Storage** in the left sidebar
4. Check if `avatars` bucket exists:
   - ✅ If it exists, continue to Step 2
   - ❌ If not, click **New bucket**:
     - Name: `avatars`
     - Public bucket: ✅ **Check this box** (makes files publicly accessible)
     - Click **Create bucket**

### Step 2: Configure Storage Policies
1. In Storage section, click on the `avatars` bucket
2. Click the **Policies** tab at the top
3. You should see "No policies" - this is why uploads fail

### Step 3: Add Upload Policy
1. Click **New Policy** button
2. Choose **"For full customization"** (not template)
3. Fill in the policy:
   - **Policy name**: `Allow public uploads`
   - **Allowed operation**: Select **INSERT** (check this box)
   - **Target roles**: Select **public**
   - **Policy definition**: 
     ```sql
     true
     ```
     (This allows anyone to upload. For production, use `auth.role() = 'authenticated'`)
4. Click **Review**
5. Click **Save policy**

### Step 4: Add Read Policy
1. Click **New Policy** again
2. Choose **"For full customization"**
3. Fill in the policy:
   - **Policy name**: `Allow public reads`
   - **Allowed operation**: Select **SELECT** (check this box)
   - **Target roles**: Select **public**
   - **Policy definition**: 
     ```sql
     true
     ```
4. Click **Review**
5. Click **Save policy**

### Step 5: Add Update Policy (Optional)
1. Click **New Policy** again
2. Choose **"For full customization"**
3. Fill in the policy:
   - **Policy name**: `Allow public updates`
   - **Allowed operation**: Select **UPDATE** (check this box)
   - **Target roles**: Select **public**
   - **Policy definition**: 
     ```sql
     true
     ```
4. Click **Review**
5. Click **Save policy**

### Step 6: Verify Policies
You should now see 3 policies listed:
- ✅ Allow public uploads (INSERT)
- ✅ Allow public reads (SELECT)
- ✅ Allow public updates (UPDATE)

### Step 7: Test Upload
1. Go back to your app
2. Try adding a student with a profile picture
3. The upload should now work!
4. Check the `avatars` bucket in Supabase - you should see the uploaded image

## Alternative: Quick Fix (Less Secure)
If you just want to test quickly:
1. Go to Storage > avatars bucket
2. Click on the bucket name
3. In the bucket settings, make sure **Public bucket** is enabled
4. Add a single policy with all operations:
   - Policy name: `Allow all operations`
   - Allowed operations: **INSERT, SELECT, UPDATE, DELETE** (all checked)
   - Target roles: **public**
   - Policy definition: `true`

## Troubleshooting

### Still getting 400 error?
- Make sure the bucket is set to **Public**
- Check that policies are saved and active
- Try refreshing the Supabase dashboard

### Still getting RLS error?
- Verify you're in the correct project
- Make sure you saved all 3 policies
- Check console logs for specific error messages

### Photo uploads but doesn't show?
- Check that the `avatar_url` column in your database has the correct URL
- Verify the URL format: `https://smoyoszfxvzlrapabhsc.supabase.co/storage/v1/object/public/avatars/...`

## Security Note
⚠️ The policies above allow **public** access (anyone can upload/read).

For production, use authenticated-only policies:
```sql
auth.role() = 'authenticated'
```

Or user-specific policies:
```sql
auth.uid() = user_id
```
