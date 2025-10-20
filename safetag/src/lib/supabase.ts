// Re-export the singleton Supabase client created in supabaseClient.js
export { supabase } from './supabaseClient'

export interface Documentation {
  id?: number;
  student_name: string;
  student_id: string;
  age: number | null;
  student_lvl: string;
  incident_date: string; // The time is missing
  location: string;
  status: string;
  medical_condition: string;
  description: string;
  avatar_url: string | null;
  created_at?: string;
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