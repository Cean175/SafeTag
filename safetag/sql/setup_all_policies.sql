-- ============================================
-- COPY AND PASTE THIS ENTIRE FILE INTO SUPABASE SQL EDITOR
-- ============================================

-- ============================================
-- 1. ENABLE RLS ON STUDENTS TABLE
-- ============================================
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. STUDENTS TABLE POLICIES
-- ============================================

-- Allow anyone to insert students
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

-- Allow anyone to update students
CREATE POLICY "Allow public update on students"
ON public.students
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Allow anyone to delete students
CREATE POLICY "Allow public delete on students"
ON public.students
FOR DELETE
TO public
USING (true);

-- ============================================
-- 3. CREATE STORAGE BUCKET (if it doesn't exist)
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. STORAGE BUCKET POLICIES
-- ============================================

-- Allow public uploads to avatars bucket
CREATE POLICY "Allow public uploads to avatars"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'avatars');

-- Allow public reads from avatars bucket
CREATE POLICY "Allow public reads from avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow public updates in avatars bucket
CREATE POLICY "Allow public updates in avatars"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- Allow public deletes from avatars bucket
CREATE POLICY "Allow public deletes from avatars"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'avatars');

-- ============================================
-- 5. VERIFY POLICIES (optional - check results)
-- ============================================
-- Run these separately to verify:
-- SELECT * FROM pg_policies WHERE tablename = 'students';
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%avatars%';
