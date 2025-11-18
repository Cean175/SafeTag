import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../css/SharedBase.css';
import '../css/DocumentationList.css';

function DocumentationsList() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [showDelete, setShowDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const navigate = useNavigate();

  // Set your required password here
  const REQUIRED_PASSWORD = 'deletepermit2025';

  const handleGoBack = () => {
    navigate(-1);
  };

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
    setEditMode(false);
    setEditData(doc);
    setShowDelete(false);
    setDeletePassword('');
    setDeleteError('');
  };

  const closeModal = () => {
    setSelectedDoc(null);
    setEditMode(false);
    setShowDelete(false);
    setDeletePassword('');
    setDeleteError('');
  };

  const handleEditClick = () => {
    setEditMode(true);
    setEditData(selectedDoc);
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    const { error } = await supabase
      .from('documentations')
      .update(editData)
      .eq('id', selectedDoc.id);
    if (error) {
      alert('Failed to update documentation.');
    } else {
      setDocs(docs.map(doc => doc.id === selectedDoc.id ? editData : doc));
      setSelectedDoc(editData);
      setEditMode(false);
    }
  };

  // Delete logic
  const handleDeleteClick = () => {
    setShowDelete(true);
    setDeletePassword('');
    setDeleteError('');
  };

  const handleDeleteConfirm = async () => {
    if (deletePassword !== REQUIRED_PASSWORD) {
      setDeleteError('Incorrect password.');
      return;
    }
    const { error } = await supabase
      .from('documentations')
      .delete()
      .eq('id', selectedDoc.id);
    if (error) {
      setDeleteError('Failed to delete documentation.');
    } else {
      setDocs(docs.filter(doc => doc.id !== selectedDoc.id));
      closeModal();
    }
  };

  // Simple Navigation Bar
  const NavBar = () => (
    <nav
      style={{
        width: '100%',
        background: 'linear-gradient(90deg, #43a047 70%, #66bb6a 100%)',
        padding: '16px 32px',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '1.3em',
        letterSpacing: '1px',
        boxShadow: '0 2px 12px rgba(34,139,34,0.12)',
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        borderRadius: '0 0 16px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      <button
        onClick={handleGoBack}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'white',
          fontSize: '1.2em',
          display: 'flex',
          alignItems: 'center',
          padding: '0',
          marginRight: '8px'
        }}
        aria-label="Go back"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <span>SafeTag Documentation</span>
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
    <div className="main-content DL-page-content" style={{ height: '100vh', display: 'flex', marginTop: '0', flexDirection: 'column' }}>
      <NavBar />
      <div
        className="doc-list"
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingRight: '8px',
          marginTop: '16px',
          marginBottom: '16px',
          
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
                background: '#f9f9f9',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(34, 139, 34, 0.08)',
                marginBottom: '20px',
                padding: '20px',
                transition: 'box-shadow 0.2s',
                borderLeft: '6px solid #43a047',
                cursor: 'pointer',
                position: 'relative',
                marginLeft: '10px',
                marginRight: '20px',
              }}
              onClick={() => handleCardClick(doc)}
            >
              {/* Student Info */}
              <div style={{ marginBottom: "10px", lineHeight: "1.5" }}>
                <div style={{ fontWeight: "600", color: "#2e7d32" }}>
                  {doc.student_name || "N/A"}
                </div>
                <div style={{ fontSize: "0.9em", color: "#444" }}>
                  ID: {doc.student_id || "N/A"} | Level: {doc.student_lvl || "N/A"} | Age:{" "}
                  {doc.age || "N/A"}
                </div>
              </div>
              {/* Incident Info */}
              <div style={{ marginBottom: "10px", fontSize: "0.9em", color: "#333" }}>
                <strong>Date:</strong> {doc.incident_date || "N/A"} <br />
                <strong>Time:</strong> {doc.incident_time || "N/A"} <br />
                <strong>Location:</strong> {doc.location || "N/A"}
              </div>
              {/* Status + Medical */}
              <div style={{ marginBottom: "10px", fontSize: "0.9em", color: "#333" }}>
                <strong>Status:</strong> {doc.status || "N/A"} <br />
                <strong>Medical Condition:</strong> {doc.medical_condition || "N/A"}
              </div>
              {/* Description */}
              <div style={{ marginBottom: "12px", fontSize: "0.9em", color: "#333" }}>
                <strong>Description:</strong> {doc.description || "N/A"}
              </div>
              {/* System Info */}
              <div style={{ fontSize: "0.8em", color: "#757575" }}>
                Created:{" "}
                {doc.created_at
                  ? new Date(doc.created_at).toLocaleString()
                  : "N/A"}
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
            {/* Header with action buttons */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              paddingBottom: "16px",
              borderBottom: "2px solid #f0f0f0"
            }}>
              <h2 style={{ 
                color: "#2e7d32", 
                margin: 0,
                fontSize: "1.4em",
                fontWeight: "600"
              }}>
                {editMode ? "Edit Documentation" : "Documentation Details"}
              </h2>
              
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {/* Action Buttons - Only show when not in edit mode or delete confirmation */}
                {!editMode && !showDelete && (
                  <>
                    <button
                      style={{
                        background: "#fff",
                        color: "#43a047",
                        border: "2px solid #43a047",
                        borderRadius: "8px",
                        padding: "8px 16px",
                        cursor: "pointer",
                        fontSize: "0.9em",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s ease",
                      }}
                      onClick={handleEditClick}
                      onMouseOver={(e) => {
                        e.target.style.background = "#43a047";
                        e.target.style.color = "#fff";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = "#fff";
                        e.target.style.color = "#43a047";
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      Edit
                    </button>
                    <button
                      style={{
                        background: "#fff",
                        color: "#e53935",
                        border: "2px solid #e53935",
                        borderRadius: "8px",
                        padding: "8px 16px",
                        cursor: "pointer",
                        fontSize: "0.9em",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s ease",
                      }}
                      onClick={handleDeleteClick}
                      onMouseOver={(e) => {
                        e.target.style.background = "#e53935";
                        e.target.style.color = "#fff";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = "#fff";
                        e.target.style.color = "#e53935";
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      Delete
                    </button>
                  </>
                )}
                
                {/* Close Button */}
                <button
                  onClick={closeModal}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "1.8em",
                    cursor: "pointer",
                    color: "#666",
                    lineHeight: 1,
                    padding: "0 4px",
                    transition: "color 0.2s ease",
                  }}
                  onMouseOver={(e) => e.target.style.color = "#e53935"}
                  onMouseOut={(e) => e.target.style.color = "#666"}
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Delete Confirmation */}
            {showDelete && (
              <div style={{ marginTop: "32px", marginBottom: "16px" }}>
                <h3 style={{ color: "#e53935" }}>Confirm Deletion</h3>
                <p>Enter password to delete this documentation:</p>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={e => setDeletePassword(e.target.value)}
                  style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", width: "100%" }}
                  placeholder="Password"
                />
                {deleteError && (
                  <div style={{ color: "#e53935", marginTop: "8px" }}>{deleteError}</div>
                )}
                <div style={{ marginTop: "16px" }}>
                  <button
                    style={{
                      background: "#e53935",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px 16px",
                      cursor: "pointer",
                      marginRight: "8px"
                    }}
                    onClick={handleDeleteConfirm}
                  >
                    Confirm Delete
                  </button>
                  <button
                    style={{
                      background: "#e0e0e0",
                      color: "#333",
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px 16px",
                      cursor: "pointer"
                    }}
                    onClick={() => setShowDelete(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Modal Content */}
            {editMode ? (
              <div>
                <form>
                  <label>
                    Student Name:
                    <input name="student_name" value={editData.student_name || ''} onChange={handleEditChange} />
                  </label>
                  <br />
                  <label>
                    Student ID:
                    <input name="student_id" value={editData.student_id || ''} onChange={handleEditChange} />
                  </label>
                  <br />
                  <label>
                    Level:
                    <input name="student_lvl" value={editData.student_lvl || ''} onChange={handleEditChange} />
                  </label>
                  <br />
                  <label>
                    Age:
                    <input name="age" value={editData.age || ''} onChange={handleEditChange} />
                  </label>
                  <br />
                  <label>
                    Date:
                    <input name="incident_date" value={editData.incident_date || ''} onChange={handleEditChange} />
                  </label>
                  <br />
                  <label>
                    Time:
                    <input name="incident_time" value={editData.incident_time || ''} onChange={handleEditChange} />
                  </label>
                  <br />
                  <label>
                    Location:
                    <input name="location" value={editData.location || ''} onChange={handleEditChange} />
                  </label>
                  <br />
                  <label>
                    Status:
                    <input name="status" value={editData.status || ''} onChange={handleEditChange} />
                  </label>
                  <br />
                  <label>
                    Medical Condition:
                    <input name="medical_condition" value={editData.medical_condition || ''} onChange={handleEditChange} />
                  </label>
                  <br />
                  <label>
                    Description:
                    <textarea name="description" value={editData.description || ''} onChange={handleEditChange} />
                  </label>
                  <br />
                  <button type="button" style={{ background: "#43a047", color: "#fff", border: "none", borderRadius: "6px", padding: "8px 16px", marginTop: "12px", cursor: "pointer" }} onClick={handleEditSave}>
                    Save
                  </button>
                  <button type="button" style={{ marginLeft: "8px", background: "#e0e0e0", color: "#333", border: "none", borderRadius: "6px", padding: "8px 16px", marginTop: "12px", cursor: "pointer" }} onClick={() => setEditMode(false)}>
                    Cancel
                  </button>
                </form>
              </div>
            ) : (
              !showDelete && (
                <>
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
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
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
                </>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentationsList;