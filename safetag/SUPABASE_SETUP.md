# Fixing Supabase Storage and Database Errors

## Current Errors and Solutions

### Error 1: Storage Upload 400 (Bad Request)
**Cause**: The storage bucket might not exist or has incorrect configuration.

**Solution**:
1. Go to your Supabase Dashboard
2. Navigate to **Storage** section
3. Create a bucket named `avatars` (if it doesn't exist)
4. Set the bucket as **Public** for easier access

### Error 2: Row-Level Security Policy Errors
**Cause**: RLS is enabled but no policies allow the operations.

**Solution for Students Table**:
1. Go to Supabase Dashboard > SQL Editor
2. Copy and paste the contents of `sql/setup_rls_policies.sql`
3. Click "Run" to execute the SQL

**Solution for Storage Bucket**:
1. Go to Supabase Dashboard > Storage
2. Click on the `avatars` bucket
3. Go to "Policies" tab
4. Add the following policies:

   **Policy 1: Allow public uploads**
   - Name: `Allow public uploads`
   - Allowed operation: `INSERT`
   - Target roles: `public`
   - Policy definition: `true`

   **Policy 2: Allow public reads**
   - Name: `Allow public reads`  
   - Allowed operation: `SELECT`
   - Target roles: `public`
   - Policy definition: `true`

   **Policy 3: Allow public updates** (optional, for file overwrites)
   - Name: `Allow public updates`
   - Allowed operation: `UPDATE`
   - Target roles: `public`
   - Policy definition: `true`

### Error 3: Column 'profile_picture_url' not found
**Status**: ✅ **FIXED** in code
- Changed payload to use `profile_picture` instead of `profile_picture_url`
- Updated StudentsPage to check for both column names

## Quick Setup Steps

1. **Create Storage Bucket**:
   ```
   Supabase Dashboard > Storage > New Bucket > Name: "avatars" > Public: Yes
   ```

2. **Run SQL Script**:
   ```
   Supabase Dashboard > SQL Editor > Paste sql/setup_rls_policies.sql > Run
   ```

3. **Add Storage Policies** (via Dashboard UI):
   - Navigate to Storage > avatars > Policies
   - Add INSERT, SELECT, and UPDATE policies as shown above

4. **Test**:
   - Try adding a student with a profile picture
   - Upload should now succeed

## Alternative: Disable RLS (Not Recommended for Production)

If you want to quickly test without setting up policies:

```sql
-- ONLY FOR TESTING - NOT FOR PRODUCTION
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
```

For storage, make the bucket "Public" in the dashboard.

## Security Note

The policies above allow public access. For production:
- Restrict policies to authenticated users: `auth.role() = 'authenticated'`
- Add user ownership checks: `auth.uid() = user_id`
- Validate file types and sizes in storage policies
