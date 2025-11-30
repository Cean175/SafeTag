import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../css/SharedBase.css';
import '../css/DocumentationList.css';
import BrandLogos from '../components/BrandLogos';

function DocumentationsList() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // List interaction
  const [selectedId, setSelectedId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  // Edit / delete (kept minimal)
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [showDelete, setShowDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  // Filtering & sorting
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCondition, setFilterCondition] = useState('');
  const [sortBy, setSortBy] = useState('date'); // date | name | level | age | status | condition
  const [sortOrder, setSortOrder] = useState('desc'); // asc | desc
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

  const handleSelect = (doc) => {
    setSelectedId(doc.id);
    setExpandedId(prev => prev === doc.id ? null : doc.id);
    setEditMode(false);
    setEditData(doc);
    setShowDelete(false);
    setDeletePassword('');
    setDeleteError('');
  };

  const closeModal = () => {
    setExpandedId(null);
    setEditMode(false);
    setShowDelete(false);
    setDeletePassword('');
    setDeleteError('');
  };

  const handleEditClick = (doc) => {
    setEditMode(true);
    setEditData(doc);
    setExpandedId(doc.id);
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    const { error } = await supabase
      .from('documentations')
      .update(editData)
      .eq('id', editData.id);
    if (error) {
      alert('Failed to update documentation.');
    } else {
      setDocs(docs.map(doc => doc.id === editData.id ? editData : doc));
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
      .eq('id', editData.id);
    if (error) {
      setDeleteError('Failed to delete documentation.');
    } else {
      setDocs(docs.filter(doc => doc.id !== editData.id));
      closeModal();
    }
  };

  // Derived list: filter + search + sort
  const filteredSorted = useMemo(() => {
    let list = [...docs];

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(d => (
        (d.student_name || '').toLowerCase().includes(q) ||
        (d.student_id || '').toLowerCase().includes(q) ||
        (d.student_lvl || '').toLowerCase().includes(q) ||
        (d.medical_condition || '').toLowerCase().includes(q)
      ));
    }
    if (filterStatus) {
      list = list.filter(d => (d.status || '').toLowerCase() === filterStatus.toLowerCase());
    }
    if (filterCondition) {
      list = list.filter(d => (d.medical_condition || '').toLowerCase().includes(filterCondition.toLowerCase()));
    }

    list.sort((a,b) => {
      const dir = sortOrder === 'asc' ? 1 : -1;
      const val = (field) => {
        switch(field){
          case 'name': return (a.student_name||'').localeCompare(b.student_name||'') * dir;
          case 'date': return ((new Date(a.incident_date||a.created_at||0)) - (new Date(b.incident_date||b.created_at||0))) * dir;
          case 'level': return (a.student_lvl||'').localeCompare(b.student_lvl||'') * dir;
          case 'age': return ((parseInt(a.age)||0) - (parseInt(b.age)||0)) * dir;
          case 'status': return (a.status||'').localeCompare(b.status||'') * dir;
          case 'condition': return (a.medical_condition||'').localeCompare(b.medical_condition||'') * dir;
          default: return ((new Date(a.created_at||0)) - (new Date(b.created_at||0))) * dir;
        }
      };
      return val(sortBy);
    });
    return list;
  }, [docs, search, filterStatus, filterCondition, sortBy, sortOrder]);

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
      <span style={{display:'flex',alignItems:'center',gap:'12px'}}>
        <span>SafeTag Documentation</span>
        <BrandLogos />
      </span>
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
      {/* Controls */}
      <div style={{ padding: '12px 20px 0', display: 'flex', flexWrap: 'wrap', gap: '12px', background: 'transparent' }}>
        <input
          type="text"
          placeholder="Search name, ID, level, condition..."
          value={search}
          onChange={e=>setSearch(e.target.value)}
          style={{ flex:'1 1 240px', padding:'10px 14px', border:'2px solid #c8e6c9', borderRadius:'8px', fontSize:'0.95em' }}
        />
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{ padding:'10px', border:'2px solid #c8e6c9', borderRadius:'8px' }}>
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Resolved">Resolved</option>
          <option value="Others">Others</option>
        </select>
        <select value={filterCondition} onChange={e=>setFilterCondition(e.target.value)} style={{ padding:'10px', border:'2px solid #c8e6c9', borderRadius:'8px' }}>
          <option value="">All Conditions</option>
          <option value="None">None</option>
          <option value="Asthma">Asthma</option>
          <option value="Diabetes">Diabetes</option>
          <option value="Hypertension">Hypertension</option>
          <option value="Others">Others</option>
        </select>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ padding:'10px', border:'2px solid #c8e6c9', borderRadius:'8px' }}>
          <option value="date">Date</option>
          <option value="name">Name</option>
          <option value="level">Level</option>
          <option value="age">Age</option>
          <option value="status">Status</option>
          <option value="condition">Condition</option>
        </select>
        <select value={sortOrder} onChange={e=>setSortOrder(e.target.value)} style={{ padding:'10px', border:'2px solid #c8e6c9', borderRadius:'8px' }}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
        <button onClick={()=>{setSearch('');setFilterStatus('');setFilterCondition('');setSortBy('date');setSortOrder('desc');}} style={{ padding:'10px 16px', background:'#43a047', color:'#fff', border:'none', borderRadius:'8px', fontWeight:'600', cursor:'pointer' }}>Reset</button>
      </div>
      {/* List */}
      <div style={{ flex:1, overflowY:'auto', padding:'8px 20px 20px' }}>
        {filteredSorted.length === 0 ? (
          <div style={{ padding:'40px', textAlign:'center', color:'#2e7d32', fontWeight:'600' }}>No documentations match your filters.</div>
        ) : (
          <ul style={{ listStyle:'none', margin:0, padding:0 }}>
            {filteredSorted.map(doc => {
              const expanded = expandedId === doc.id;
              return (
                <li key={doc.id} style={{
                  background:'#ffffff',
                  marginBottom:'12px',
                  borderRadius:'10px',
                  border:'1px solid #e0f2e9',
                  boxShadow:'0 2px 6px rgba(34,139,34,0.06)',
                  transition:'background 0.15s, box-shadow 0.15s',
                  cursor:'pointer'
                }} onClick={()=>handleSelect(doc)}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px' }}>
                    <div style={{ fontWeight:600, color:'#2e7d32' }}>{doc.student_name || 'N/A'}</div>
                    <div style={{ fontSize:'0.75em', color:'#388e3c', fontWeight:600 }}>{expanded ? 'Hide' : 'Show'}</div>
                  </div>
                  <div style={{ padding:'0 16px 12px', fontSize:'0.8em', color:'#355e3b' }}>
                    ID: {doc.student_id || 'N/A'} | Level: {doc.student_lvl || 'N/A'} | Age: {doc.age || 'N/A'} | Status: {doc.status || 'N/A'} | Condition: {doc.medical_condition || 'N/A'}
                  </div>
                  {expanded && (
                    <div style={{ borderTop:'1px solid #e0f2e9', padding:'10px 16px 14px', fontSize:'0.85em', lineHeight:1.5 }}>
                      <div><strong>Date:</strong> {doc.incident_date || 'N/A'} <strong>Time:</strong> {doc.incident_time || 'N/A'} <strong>Location:</strong> {doc.location || 'N/A'}</div>
                      <div style={{ marginTop:'6px' }}><strong>Description:</strong> {doc.description || 'N/A'}</div>
                      <div style={{ marginTop:'8px', fontSize:'0.75em', color:'#607d8b' }}>Created: {doc.created_at ? new Date(doc.created_at).toLocaleString() : 'N/A'}</div>
                      <div style={{ marginTop:'4px', display:'flex', gap:'8px', flexWrap:'wrap' }}>
                        {!editMode && !showDelete && (
                          <>
                            <button onClick={(e)=>{e.stopPropagation();handleEditClick(doc);}} style={{ background:'#fff', border:'1px solid #43a047', color:'#2e7d32', padding:'6px 12px', borderRadius:'6px', fontSize:'0.75em', fontWeight:600, cursor:'pointer' }}>Edit</button>
                            <button onClick={(e)=>{e.stopPropagation();setShowDelete(true);setEditData(doc);}} style={{ background:'#fff', border:'1px solid #e53935', color:'#b71c1c', padding:'6px 12px', borderRadius:'6px', fontSize:'0.75em', fontWeight:600, cursor:'pointer' }}>Delete</button>
                          </>
                        )}
                      </div>
                      {editMode && editData.id === doc.id && (
                        <div style={{ marginTop:'10px' }}>
                          <form onSubmit={(e)=>{e.preventDefault();handleEditSave();}}>
                            <input style={inputStyle} name="student_name" value={editData.student_name||''} onChange={handleEditChange} placeholder="Student Name" />
                            <input style={inputStyle} name="student_id" value={editData.student_id||''} onChange={handleEditChange} placeholder="Student ID" />
                            <input style={inputStyle} name="student_lvl" value={editData.student_lvl||''} onChange={handleEditChange} placeholder="Level" />
                            <input style={inputStyle} name="age" value={editData.age||''} onChange={handleEditChange} placeholder="Age" />
                            <input style={inputStyle} name="incident_date" value={editData.incident_date||''} onChange={handleEditChange} placeholder="Date" />
                            <input style={inputStyle} name="incident_time" value={editData.incident_time||''} onChange={handleEditChange} placeholder="Time" />
                            <input style={inputStyle} name="location" value={editData.location||''} onChange={handleEditChange} placeholder="Location" />
                            <input style={inputStyle} name="status" value={editData.status||''} onChange={handleEditChange} placeholder="Status" />
                            <input style={inputStyle} name="medical_condition" value={editData.medical_condition||''} onChange={handleEditChange} placeholder="Medical Condition" />
                            <textarea style={{ ...inputStyle, minHeight:'70px' }} name="description" value={editData.description||''} onChange={handleEditChange} placeholder="Description" />
                            <div style={{ marginTop:'8px', display:'flex', gap:'8px' }}>
                              <button type="submit" style={primaryBtn}>Save</button>
                              <button type="button" style={secondaryBtn} onClick={()=>setEditMode(false)}>Cancel</button>
                            </div>
                          </form>
                        </div>
                      )}
                      {showDelete && editData.id === doc.id && (
                        <div style={{ marginTop:'10px' }}>
                          <h4 style={{ color:'#e53935', margin:'4px 0' }}>Confirm Deletion</h4>
                          <input type="password" value={deletePassword} onChange={e=>setDeletePassword(e.target.value)} placeholder="Password" style={inputStyle} />
                          {deleteError && <div style={{ color:'#e53935', fontSize:'0.7em', marginTop:'4px' }}>{deleteError}</div>}
                          <div style={{ marginTop:'6px', display:'flex', gap:'6px' }}>
                            <button onClick={handleDeleteConfirm} style={dangerBtn}>Delete</button>
                            <button onClick={()=>{setShowDelete(false);setDeletePassword('');setDeleteError('');}} style={secondaryBtn}>Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Modal Dialog */}
      {/* Modal removed in list redesign */}
      )}
    </div>
  );
}
// Shared inline input/button styles (minimal – no external mutation)
const inputStyle = {
  width:'100%',
  marginBottom:'6px',
  padding:'8px 10px',
  border:'1px solid #cfd8dc',
  borderRadius:'6px',
  fontSize:'0.75em'
};
const primaryBtn = { background:'#43a047', color:'#fff', border:'none', padding:'6px 12px', borderRadius:'6px', fontSize:'0.75em', fontWeight:600, cursor:'pointer' };
const secondaryBtn = { background:'#eceff1', color:'#37474f', border:'none', padding:'6px 12px', borderRadius:'6px', fontSize:'0.75em', fontWeight:600, cursor:'pointer' };
const dangerBtn = { background:'#e53935', color:'#fff', border:'none', padding:'6px 12px', borderRadius:'6px', fontSize:'0.75em', fontWeight:600, cursor:'pointer' };

export default DocumentationsList;
