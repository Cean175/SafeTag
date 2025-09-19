import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../css/DocumentationList.css';

function DocumentationsList() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);

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

  const handleCardClick = (doc) => {
    setSelectedDoc(doc);
  };

  const closeModal = () => {
    setSelectedDoc(null);
  };

  // Simple Navigation Bar
  const NavBar = () => (
    <nav style={{
      width: '100%',
      background: '#43a047',
      padding: '12px 24px',
      color: '#fff',
      fontWeight: 'bold',
      fontSize: '1.2em',
      letterSpacing: '1px',
      boxShadow: '0 2px 8px rgba(34,139,34,0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 1100
    }}>
      SafeTag Documentation List
    </nav>
  );

  if (loading) return (
    <div className="main-content user-page-content">
      <NavBar />
      <h2>Loading...</h2>
    </div>
  );
  if (error) return (
    <div className="main-content user-page-content">
      <NavBar />
      <h2>{error}</h2>
    </div>
  );

  return (
    <div className="main-content DL-page-content" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <h2 className="doc-title" style={{ marginTop: '24px' }}>ALL DOCUMENTATIONS</h2>
      <div
        className="doc-list"
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingRight: '8px',
          marginTop: '16px',
          marginBottom: '16px'
        }}
      >
        {docs.length === 0 ? (
          <div className="no-docs">
            <p>No documentations found.</p>
          </div>
        ) : (
          docs.map(doc => (
            <div
              key={doc.id}
              className="doc-card"
              style={{
                background: 'linear-gradient(135deg, #e8f5e9 0%, #a5d6a7 100%)',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(34, 139, 34, 0.08)',
                marginBottom: '20px',
                padding: '20px',
                transition: 'box-shadow 0.2s',
                borderLeft: '6px solid #43a047',
                cursor: 'pointer'
              }}
              onClick={() => handleCardClick(doc)}
            >
              <h3 style={{ color: '#388e3c', marginBottom: '8px' }}>{doc.title || 'No Title'}</h3>
              <p style={{ color: '#333', marginBottom: '8px' }}>
                <strong>Name:</strong> {doc.student_name}<br />
                <strong>ID:</strong> {doc.student_id}<br />
                <strong>Level:</strong> {doc.student_lvl || 'N/A'}<br />
                <strong>Age:</strong> {doc.age || 'N/A'}
              </p>
              <p style={{ color: '#333', marginBottom: '8px' }}>
                <strong>Date:</strong> {doc.incident_date || 'N/A'}<br />
                <strong>Time:</strong> {doc.incident_time || 'N/A'}<br />
                <strong>Location:</strong> {doc.location || 'N/A'}
              </p>
              <p style={{ color: '#333', marginBottom: '8px' }}>
                <strong>Status:</strong> {doc.status || 'N/A'}<br />
                <strong>Medical Condition:</strong> {doc.medical_condition || 'N/A'}
              </p>
              <p style={{ color: '#333', marginBottom: '12px' }}>
                <strong>Description:</strong> {doc.description || 'N/A'}
              </p>
              <div style={{ fontSize: '0.9em', color: '#757575' }}>
                Created: {doc.created_at ? new Date(doc.created_at).toLocaleString() : 'N/A'}
              </div>
            </div>
          ))
        )}
      </div>

    {/* Modal Dialog */}
{selectedDoc && (
  <div
    className="modal-overlay"
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}
  >
    <div
      className="modal-content"
      style={{
        background: "#fff",
        borderRadius: "16px",
        padding: "28px",
        maxWidth: "520px",
        width: "90%",
        boxShadow: "0 8px 30px rgba(34,139,34,0.2)",
        position: "relative",
        maxHeight: "80vh",
        overflowY: "auto",
      }}
    >
      {/* Close Button */}
      <button
        onClick={closeModal}
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          background: "none",
          border: "none",
          fontSize: "1.8em",
          cursor: "pointer",
          color: "#43a047",
          lineHeight: 1,
        }}
        aria-label="Close"
      >
        &times;
      </button>

      {/* Title */}
      <h2 style={{ color: "#2e7d32", marginBottom: "20px", fontSize: "1.4em" }}>
        {selectedDoc.title || "Student Documentation"}
      </h2>

      {/* Header: Avatar + Name */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "16px",
          gap: "12px",
        }}
      >
        {selectedDoc.avatar_url ? (
          <img
            src={selectedDoc.avatar_url}
            alt="avatar"
            style={{ width: "60px", height: "60px", borderRadius: "50%" }}
          />
        ) : (
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "#e0e0e0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2em",
              color: "#555",
            }}
          >
            ?
          </div>
        )}
        <div>
          <div style={{ fontWeight: "bold", fontSize: "1.1em" }}>
            {selectedDoc.student_name || "N/A"}
          </div>
          <div style={{ fontSize: "0.9em", color: "#555" }}>
            ID: {selectedDoc.student_id || "N/A"} | Level:{" "}
            {selectedDoc.student_lvl || "N/A"} | Age:{" "}
            {selectedDoc.age || "N/A"}
          </div>
        </div>
      </div>

      {/* Event Info */}
      <div style={{ marginBottom: "12px" }}>
        <strong>Date:</strong>{" "}
        {selectedDoc.incident_date || "N/A"} <br />
        <strong>Time:</strong>{" "}
        {selectedDoc.incident_time || "N/A"} <br />
        <strong>Location:</strong>{" "}
        {selectedDoc.location || "N/A"}
      </div>

      {/* Medical Info */}
      <div style={{ marginBottom: "12px" }}>
        <strong>Status:</strong> {selectedDoc.status || "N/A"} <br />
        <strong>Medical Condition:</strong>{" "}
        {selectedDoc.medical_condition || "N/A"}
      </div>

      {/* Description */}
      <div style={{ marginBottom: "12px" }}>
        <strong>Description:</strong> {selectedDoc.description || "N/A"}
      </div>

      {/* System Info */}
      <div style={{ fontSize: "0.85em", color: "#757575" }}>
        Created:{" "}
        {selectedDoc.created_at
          ? new Date(selectedDoc.created_at).toLocaleString()
          : "N/A"}
        <br />
        Updated:{" "}
        {selectedDoc.updated_at
          ? new Date(selectedDoc.updated_at).toLocaleString()
          : "N/A"}
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default DocumentationsList;
