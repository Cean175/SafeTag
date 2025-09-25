import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://smoyoszfxvzlrapabhsc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtb3lvc3pmeHZ6bHJhcGFiaHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MTMxNjMsImV4cCI6MjA3Mjk4OTE2M30.1A-hrThccZPjoqezsUw4HItbwKQSbN4kPqynae5d6Eg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Renamed 'test' to 'uploadFile' for clarity and correct usage
export async function uploadFile(file, options = {}) {
  if (!file) return null;
  const bucket = options.bucket || 'avatars';
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
  const path = `${fileName}`;

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    console.error('Upload error', error);
    throw error;
  }

  // If bucket is public, you can construct the public URL
  // Otherwise use createSignedUrl
  const { publicUrl, error: urlError } = supabase.storage.from(bucket).getPublicUrl(path);
  if (urlError) {
    console.warn('Could not get public URL', urlError);
    // fallback to signed url
    const { data: signed, error: signedErr } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24); // 24h
    if (signedErr) throw signedErr;
    return signed.signedUrl;
  }

  return publicUrl;
}

// -------------------- Documentations API --------------------
export async function createDocumentation(payload) {
  // payload: { student_name, student_id, age, student_lvl, incident_date, incident_time, location, status, medical_condition, description, avatar_url }
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
  // payload: { student_id, name, age, level, course, health_condition, treatment_needs, profile_picture }
  const { data, error } = await supabase.from('students').insert([payload]).select();
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