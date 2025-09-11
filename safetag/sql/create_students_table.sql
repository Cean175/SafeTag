-- Supabase/Postgres schema for students table
-- Run this in Supabase SQL editor or via psql
-- Supabase/Postgres schema for students table
-- Run this in Supabase SQL editor or via psql

-- Ensure uuid generation function is available for uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.students (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id text NOT NULL,
  name text NOT NULL,
  age integer,
  level text,
  course text,
  health_condition text,
  treatment_needs text,
  profile_picture text,
  created_at timestamptz DEFAULT now()
);

-- Optional: create an index for faster lookups by student_id
CREATE INDEX IF NOT EXISTS idx_students_student_id ON public.students (student_id);
