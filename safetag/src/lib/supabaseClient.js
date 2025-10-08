import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://smoyoszfxvzlrapabhsc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtb3lvc3pmeHZ6bHJhcGFiaHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MTMxNjMsImV4cCI6MjA3Mjk4OTE2M30.1A-hrThccZPjoqezsUw4HItbwKQSbN4kPqynae5d6Eg';

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

export async function uploadFile(file, { bucket = 'ava tars' } = {}) {
  if (!file) return null;
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2,9)}.${fileExt}`;

  // Upload
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from(bucket)
    .upload(fileName, file, { upsert: false });

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
