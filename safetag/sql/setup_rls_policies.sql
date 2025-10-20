-- ============================================
-- Row Level Security (RLS) Policies Setup
-- ============================================
-- Run this in your Supabase SQL Editor to allow operations
-- on students table and storage bucket

-- ============================================
-- 1. STUDENTS TABLE RLS POLICIES
-- ============================================

-- Enable RLS on students table (if not already enabled)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert students (you can restrict this later)
CREATE POLICY "Allow public insert on students"
ON public.students
FOR INSERT
TO public
WITH CHECK (true);

-- Allow anyone to select/read students
CREATE POLICY "Allow public select on students"
ON public.students
FOR SELECT
TO public
USING (true);

-- Allow anyone to update students (you can restrict this later)
CREATE POLICY "Allow public update on students"
ON public.students
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Allow anyone to delete students (you can restrict this later)
CREATE POLICY "Allow public delete on students"
ON public.students
FOR DELETE
TO public
USING (true);

-- ============================================
-- 2. STORAGE BUCKET SETUP
-- ============================================
-- Note: Storage policies must be set in Supabase Dashboard > Storage
-- because they use a different system than database RLS.
-- 
-- To configure storage policies:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Create a bucket named "avatars" if it doesn't exist
-- 3. Set the bucket to "Public" or add these policies:
--
-- POLICY: Allow public uploads
--   - Operation: INSERT
--   - Policy name: "Allow public uploads"
--   - Target roles: public
--   - USING expression: true
--
-- POLICY: Allow public reads
--   - Operation: SELECT
--   - Policy name: "Allow public reads"
--   - Target roles: public
--   - USING expression: true
--
-- OR if you want to restrict to authenticated users:
--   - USING expression: auth.role() = 'authenticated'
--
-- ============================================
-- 3. VERIFICATION
-- ============================================
-- After running this script, verify with:
-- SELECT * FROM pg_policies WHERE tablename = 'students';
