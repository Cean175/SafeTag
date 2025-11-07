import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchOngoingEmergencies, fetchResolvedEmergencies, markEmergencyAsResolved } from '../lib/supabaseClient';
import '../css/EmergencyPage.css';

function EmergencyPage() {
  const navigate = useNavigate();
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);
  const [viewMode, setViewMode] = useState('ongoing'); // 'ongoing' or 'resolved'

  const loadEmergencies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`Loading ${viewMode} emergencies...`);
      const data = viewMode === 'ongoing' 
        ? await fetchOngoingEmergencies()
        : await fetchResolvedEmergencies();
      console.log('Emergencies loaded:', data);
      console.log('Number of emergencies:', data?.length);
      setEmergencies(data);
    } catch (err) {
      console.error('Error loading emergencies:', err);
      console.error('Error details:', err.message, err.details);
      setError(`Failed to load emergencies: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [viewMode]);

  useEffect(() => {
    loadEmergencies();
  }, [loadEmergencies]);

  const handleMarkAsResolved = async (emergencyId) => {
    console.log('handleMarkAsResolved called with ID:', emergencyId);
    
    if (!window.confirm('Mark this emergency as resolved?')) {
      console.log('User cancelled resolve action');
      return;
    }

    try {
      setResolvingId(emergencyId);
      console.log('Calling markEmergencyAsResolved...');
      
      const result = await markEmergencyAsResolved(emergencyId);
      
      console.log('Emergency resolved successfully:', result);
      console.log('Removing emergency from list...');
      
      // Remove from list
      setEmergencies(emergencies.filter(e => e.id !== emergencyId));
      
      // Show success message
      alert('Emergency marked as resolved successfully!');
      
    } catch (err) {
      console.error('Error resolving emergency:', err);
      console.error('Error type:', typeof err);
      console.error('Error message:', err.message);
      console.error('Full error object:', JSON.stringify(err, null, 2));
      
      // More detailed error message
      let errorMessage = 'Failed to mark emergency as resolved.\n\n';
      if (err.message) {
        errorMessage += `Error: ${err.message}\n`;
      }
      if (err.hint) {
        errorMessage += `Hint: ${err.hint}\n`;
      }
      if (err.code) {
        errorMessage += `Code: ${err.code}\n`;
      }
      errorMessage += '\nCheck the browser console for more details.';
      
      alert(errorMessage);
    } finally {
      setResolvingId(null);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="emergency-page-container">
      <header className="header">
        <div className="header-content">
          <div className="branding">
            <h1 className="title">S.A.F.E</h1>
            <p className="subtitle">STUDENT ASSISTANCE FOR EMERGENCIES</p>
          </div>

          <div className="nav-icons">
            <div className="nav-icon active" onClick={() => handleNavigation('/home')}>
              <i className="fas fa-home"></i>
            </div>
            <div className="nav-icon" onClick={() => handleNavigation('/user')}>
              <i className="fas fa-user"></i>
            </div>
            <div className="nav-icon" onClick={() => handleNavigation('/statistics')}>
              <i className="fas fa-chart-bar"></i>
            </div>
            <div className="nav-icon" onClick={() => handleNavigation('/contact')}>
              <i className="fas fa-phone"></i>
            </div>
            <div className="nav-icon" onClick={() => handleNavigation('/settings')}>
              <i className="fas fa-cog"></i>
            </div>
          </div>
        </div>
      </header>

      <main className="emergency-content">
        <div className="emergency-header">
          <h1 className="emergency-title">
            {viewMode === 'ongoing' ? 'Ongoing Emergencies' : 'Resolved Emergencies'}
          </h1>
          <div className="emergency-header-actions">
            <div className="view-toggle">
              <button 
                className={`toggle-btn ${viewMode === 'ongoing' ? 'active' : ''}`}
                onClick={() => setViewMode('ongoing')}
              >
                <i className="fas fa-exclamation-circle"></i> Ongoing
              </button>
              <button 
                className={`toggle-btn ${viewMode === 'resolved' ? 'active' : ''}`}
                onClick={() => setViewMode('resolved')}
              >
                <i className="fas fa-check-circle"></i> Resolved
              </button>
            </div>
            <button className="refresh-btn" onClick={loadEmergencies} disabled={loading}>
              <i className="fas fa-sync-alt"></i> Refresh
            </button>
          </div>
        </div>

        {loading && (
          <div className="loading-container">
            <i className="fas fa-spinner fa-spin"></i> Loading emergencies...
          </div>
        )}

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        {!loading && !error && emergencies.length === 0 && (
          <div className="no-emergencies">
            <i className="fas fa-check-circle"></i>
            <p>{viewMode === 'ongoing' ? 'No ongoing emergencies' : 'No resolved emergencies'}</p>
          </div>
        )}

        {!loading && !error && emergencies.length > 0 && (
          <div className="emergencies-list">
            {emergencies.map((emergency, index) => (
              <div key={emergency.id} className={`emergency-card ${viewMode === 'resolved' ? 'resolved' : ''}`}>
                <div className={`emergency-number ${viewMode === 'resolved' ? 'resolved' : ''}`}>#{index + 1}</div>
                
                <div className="emergency-card-header">
                  <div className="emergency-status">
                    <i className={viewMode === 'ongoing' ? 'fas fa-exclamation-triangle' : 'fas fa-check-circle'}></i>
                    <span className={`status-badge ${viewMode === 'resolved' ? 'resolved' : ''}`}>
                      {viewMode === 'ongoing' ? 'ACTIVE' : 'RESOLVED'}
                    </span>
                  </div>
                  <div className="emergency-time">
                    {formatDateTime(emergency.reported_at)}
                  </div>
                </div>

                <div className="emergency-card-body">
                  {emergency.students && (
                    <div className="student-info">
                      {emergency.students.avatar_url && (
                        <img 
                          src={emergency.students.avatar_url} 
                          alt={`${emergency.students.first_name} ${emergency.students.last_name}`}
                          className="student-avatar"
                        />
                      )}
                      <div className="student-details">
                        <h3 className="student-name">
                          {emergency.students.first_name} {emergency.students.middle_name} {emergency.students.last_name}
                        </h3>
                        <p className="student-id">ID: {emergency.students.student_id}</p>
                      </div>
                    </div>
                  )}

                  {emergency.location && (
                    <div className="emergency-info-row">
                      <i className="fas fa-map-marker-alt"></i>
                      <span><strong>Location:</strong> {emergency.location}</span>
                    </div>
                  )}

                  <div className="emergency-info-row">
                    <i className="far fa-clock"></i>
                    <span><strong>Reported:</strong> {formatDateTime(emergency.created_at)}</span>
                  </div>
                </div>

                <div className="emergency-card-footer">
                  <button
                    className="view-location-btn"
                    onClick={() => navigate('/contact', { state: { emergency } })}
                  >
                    <i className="fas fa-map-marked-alt"></i> View Location
                  </button>
                  {viewMode === 'ongoing' && (
                    <button
                      className="done-btn"
                      onClick={() => handleMarkAsResolved(emergency.id)}
                      disabled={resolvingId === emergency.id}
                    >
                      {resolvingId === emergency.id ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i> Resolving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check"></i> Mark as Done
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default EmergencyPage;