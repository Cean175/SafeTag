import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../css/Documentations.css';

function DocumentationsList() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDocs() {
      setLoading(true);
      const { data, error } = await supabase
        .from('documentations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) setError('Failed to fetch documentations.');
      else setDocs(data);
      setLoading(false);
    }
    fetchDocs();
  }, []);

  if (loading) return <div className="main-content user-page-content"><h2>Loading...</h2></div>;
  if (error) return <div className="main-content user-page-content"><h2>{error}</h2></div>;

  return (
    <div className="main-content user-page-content">
      <h2 className="doc-title">ALL DOCUMENTATIONS</h2>
      <div className="doc-list">
        {docs.length === 0 ? (
          <div>No documentations found.</div>
        ) : (
          docs.map(doc => (
            <div className="doc-card" key={doc.id}>
              <div className="avatar-section">
                <img src={doc.avatar_url || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} alt="avatar" className="avatar" />
              </div>
              <div><b>Name:</b> {doc.student_name}</div>
              <div><b>ID:</b> {doc.student_id}</div>
              <div><b>Age:</b> {doc.age}</div>
              <div><b>Level:</b> {doc.student_lvl}</div>
              <div><b>Date:</b> {doc.incident_date}</div>
              <div><b>Time:</b> {doc.incident_time}</div>
              <div><b>Location:</b> {doc.location}</div>
              <div><b>Status:</b> {doc.status}</div>
              <div><b>Medical Condition:</b> {doc.medical_condition}</div>
              <div><b>Description:</b> {doc.description}</div>
              <div><b>Created At:</b> {doc.created_at}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DocumentationsList;
