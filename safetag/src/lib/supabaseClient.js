import { createClient } from '@supabase/supabase-js';
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
const { publicURL, error: urlError } = supabase.storage.from(bucket).getPublicUrl(path);
if (urlError) {
console.warn('Could not get public URL', urlError);
// fallback to signed url
const { data: signed, error: signedErr } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24); // 24h
if (signedErr) throw signedErr;
return signed.signedUrl;
}


return publicURL;
}


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