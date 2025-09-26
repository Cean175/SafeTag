import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// You can use these interfaces to define the shape of your tables.
// This is the correct place to define the type for your 'documentations' table.
export interface Documentation {
  id?: number; // Optional because Supabase auto-generates it
  student_name: string;
  student_id: string;
  age: number | null;
  student_lvl: string;
  incident_date: string; // The type is a string because that's what you're sending to the database
  location: string;
  status: string;
  medical_condition: string;
  description: string;
  avatar_url: string | null;
  created_at?: string; // Optional, as it's typically handled by the database
}

// Keep your other interfaces here for completeness
export interface User {
  id: string
  student_id: string
  name: string
  department: string
  preferred_time: number | null
  created_at: string
}

export interface Match {
  id: number
  user1_id: string
  user2_id: string
  agreed_time: number
  created_at: string
}