import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://smoyoszfxvzlrapabhsc.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtb3lvc3pmeHZ6bHJhcGFiaHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MTMxNjMsImV4cCI6MjA3Mjk4OTE2M30.1A-hrThccZPjoqezsUw4HItbwKQSbN4kPqynae5d6Eg';

// Create a single supabase client instance
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);



// -------------------- Documentations API --------------------
export async function createDocumentation(payload) {
  const { data, error } = await supabase.from('documentations').insert([payload]).select();
  if (error) throw error;
  return data[0];
}

export async function fetchDocumentations() {
  const { data, error } = await supabase.from('documentations').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchDocumentationById(id) {
  const { data, error } = await supabase.from('documentations').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function updateDocumentation(id, updates) {
  const { data, error } = await supabase.from('documentations').update(updates).eq('id', id).select();
  if (error) throw error;
  return data[0];
}

export async function deleteDocumentation(id) {
  const { data, error } = await supabase.from('documentations').delete().eq('id', id).select();
  if (error) throw error;
  return data[0];
}

// -------------------- Students API --------------------
export async function createStudent(payload) {
  const { data, error } = await supabase.from('students').insert([payload]).select("*");
  if (error) throw error;
  return data[0];
}

export async function fetchStudents() {
  const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function fetchStudentById(id) {
  const { data, error } = await supabase.from('students').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function updateStudent(id, updates) {
  const { data, error } = await supabase.from('students').update(updates).eq('id', id).select();
  if (error) throw error;
  return data[0];
}

export async function deleteStudent(id) {
  const { data, error } = await supabase.from('students').delete().eq('id', id).select();
  if (error) throw error;
  return data[0];
}

export async function uploadFile(file, { bucket = 'avatars' } = {}) {
  if (!file) return null;
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2,9)}.${fileExt}`;

  // Upload
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from(bucket)
    .upload(fileName, file, { upsert: false, contentType: file.type || 'application/octet-stream' });

  if (uploadError) {
    console.error('Supabase storage upload error:', uploadError);
    throw uploadError;
  }

  // Get public URL
  const { data: publicData, error: publicError } = await supabase
    .storage
    .from(bucket)
    .getPublicUrl(fileName);

  if (publicError) {
    console.error('Supabase getPublicUrl error:', publicError);
    throw publicError;
  }

  // compatibility: publicData may contain publicUrl or publicURL
  const url = publicData?.publicUrl ?? publicData?.publicURL ?? null;
  return url;
}

// -------------------- Ongoing Emergencies API --------------------
export async function fetchOngoingEmergencies() {
  // First, fetch the emergencies
  const { data: emergencies, error: emergencyError } = await supabase
    .from('ongoing_emergencies')
    .select('*')
    .eq('is_resolved', false)
    .order('reported_at', { ascending: false });
  
  console.log('Fetch emergencies - data:', emergencies);
  console.log('Fetch emergencies - error:', emergencyError);
  
  if (emergencyError) {
    console.error('Supabase error:', emergencyError);
    throw emergencyError;
  }

  if (!emergencies || emergencies.length === 0) {
    return [];
  }

  // Then fetch the student details for each emergency
  const emergenciesWithStudents = await Promise.all(
    emergencies.map(async (emergency) => {
      if (emergency.student_id) {
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('first_name, middle_name, last_name, student_id, avatar_url')
          .eq('student_id', emergency.student_id)
          .single();
        
        if (!studentError && student) {
          return { ...emergency, students: student };
        }
      }
      return { ...emergency, students: null };
    })
  );

  console.log('Emergencies with students:', emergenciesWithStudents);
  return emergenciesWithStudents;
}

export async function markEmergencyAsResolved(id) {
  console.log('Attempting to resolve emergency with ID:', id);
  
  const { data, error } = await supabase
    .from('ongoing_emergencies')
    .update({ is_resolved: true })
    .eq('id', id)
    .select();
  
  console.log('Resolve emergency - Response data:', data);
  console.log('Resolve emergency - Error:', error);
  
  if (error) {
    console.error('Failed to resolve emergency:', error);
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw error;
  }
  
  if (!data || data.length === 0) {
    console.warn('No data returned after update. Emergency might not exist or RLS policy blocking.');
    throw new Error('Failed to update emergency. No data returned.');
  }
  
  console.log('Successfully resolved emergency:', data[0]);
  return data[0];
}

export async function fetchResolvedEmergencies() {
  // First, fetch the resolved emergencies
  const { data: emergencies, error: emergencyError } = await supabase
    .from('ongoing_emergencies')
    .select('*')
    .eq('is_resolved', true)
    .order('reported_at', { ascending: false });
  
  console.log('Fetch resolved emergencies - data:', emergencies);
  console.log('Fetch resolved emergencies - error:', emergencyError);
  
  if (emergencyError) {
    console.error('Supabase error:', emergencyError);
    throw emergencyError;
  }

  if (!emergencies || emergencies.length === 0) {
    return [];
  }

  // Then fetch the student details for each emergency
  const emergenciesWithStudents = await Promise.all(
    emergencies.map(async (emergency) => {
      if (emergency.student_id) {
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('first_name, middle_name, last_name, student_id, avatar_url')
          .eq('student_id', emergency.student_id)
          .single();
        
        if (!studentError && student) {
          return { ...emergency, students: student };
        }
      }
      return { ...emergency, students: null };
    })
  );

  console.log('Resolved emergencies with students:', emergenciesWithStudents);
  return emergenciesWithStudents;
}
