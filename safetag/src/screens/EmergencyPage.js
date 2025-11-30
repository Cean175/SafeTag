import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, fetchOngoingEmergencies, fetchResolvedEmergencies } from '../lib/supabaseClient';
import '../css/EmergencyPage.css';
import BrandLogos from '../components/BrandLogos';

function EmergencyPage() {
  const navigate = useNavigate();
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('ongoing'); // 'ongoing' or 'resolved'
  const alertedIdsRef = useRef(new Set()); // track which emergencies already triggered sound
  const [localReportTimes, setLocalReportTimes] = useState(() => {
    // Load saved local report times from localStorage on mount
    try {
      const saved = localStorage.getItem('emergencyLocalReportTimes');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error('Failed to load local report times:', e);
      return {};
    }
  });

  // Save local report times to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('emergencyLocalReportTimes', JSON.stringify(localReportTimes));
    } catch (e) {
      console.error('Failed to save local report times:', e);
    }
  }, [localReportTimes]);

  // Simple in-browser beep (avoids needing an mp3 file)
  const playAlertSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880; // A5 tone
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.7, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1.0);
      osc.start();
      osc.stop(ctx.currentTime + 1.0);
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  }, []);

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
      
      // Record local report times for new emergencies
      if (data && data.length > 0) {
        const now = new Date().toISOString();
        setLocalReportTimes(prev => {
          const updated = { ...prev };
          data.forEach(emergency => {
            if (!updated[emergency.id]) {
              updated[emergency.id] = now;
            }
          });
          return updated;
        });
      }
      
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

  // Real-time subscription to ongoing_emergencies table
  useEffect(() => {
    // Only subscribe while viewing emergencies; subscription affects both modes
    const channel = supabase.channel('public:ongoing_emergencies')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ongoing_emergencies' }, (payload) => {
        const { eventType, new: newRow, old: oldRow } = payload;

        setEmergencies((current) => {
          let updated = [...current];

          if (eventType === 'INSERT') {
            if (newRow && !newRow.is_resolved && viewMode === 'ongoing') {
              // Prepend new active emergency
              const exists = updated.some(e => e.id === newRow.id);
              if (!exists) {
                updated = [{ ...newRow }, ...updated];
                // Record local report time for new emergency
                if (!localReportTimes[newRow.id]) {
                  setLocalReportTimes(prev => ({
                    ...prev,
                    [newRow.id]: new Date().toISOString()
                  }));
                }
                // Sound only if not previously alerted
                if (!alertedIdsRef.current.has(newRow.id)) {
                  playAlertSound();
                  alertedIdsRef.current.add(newRow.id);
                }
              }
            } else if (newRow && newRow.is_resolved && viewMode === 'resolved') {
              const exists = updated.some(e => e.id === newRow.id);
              if (!exists) {
                updated = [{ ...newRow }, ...updated];
                // Record local report time if not already recorded
                if (!localReportTimes[newRow.id]) {
                  setLocalReportTimes(prev => ({
                    ...prev,
                    [newRow.id]: new Date().toISOString()
                  }));
                }
              }
            }
          }

          if (eventType === 'UPDATE') {
            if (!newRow) return current;
            const idx = updated.findIndex(e => e.id === newRow.id);
            if (idx !== -1) {
              if (viewMode === 'ongoing' && newRow.is_resolved) {
                // Remove if it just got resolved
                updated.splice(idx, 1);
              } else if (viewMode === 'ongoing' && !newRow.is_resolved) {
                // Update ongoing row
                updated[idx] = { ...updated[idx], ...newRow };
              } else if (viewMode === 'resolved' && newRow.is_resolved) {
                // Update or add to resolved list
                updated[idx] = { ...updated[idx], ...newRow };
              } else if (viewMode === 'resolved' && !newRow.is_resolved) {
                // If in resolved view and it reverted to active, remove
                updated.splice(idx, 1);
              }
            } else {
              // Row not found locally; add if it matches current filter
              if (viewMode === 'ongoing' && !newRow.is_resolved) {
                updated.unshift({ ...newRow });
                // Record local report time
                if (!localReportTimes[newRow.id]) {
                  setLocalReportTimes(prev => ({
                    ...prev,
                    [newRow.id]: new Date().toISOString()
                  }));
                }
                if (!alertedIdsRef.current.has(newRow.id)) {
                  playAlertSound();
                  alertedIdsRef.current.add(newRow.id);
                }
              }
              if (viewMode === 'resolved' && newRow.is_resolved) {
                updated.unshift({ ...newRow });
                if (!localReportTimes[newRow.id]) {
                  setLocalReportTimes(prev => ({
                    ...prev,
                    [newRow.id]: new Date().toISOString()
                  }));
                }
              }
            }
          }

            if (eventType === 'DELETE' && oldRow) {
              updated = updated.filter(e => e.id !== oldRow.id);
            }

          return updated;
        });
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime subscribed to ongoing_emergencies');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [viewMode, playAlertSound, localReportTimes]);

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
            <div className="title-row">
              <h1 className="title">S.A.F.E</h1>
              <BrandLogos />
            </div>
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
                </div>

                <div className="emergency-card-body">
                  {emergency.students && (
                    <div className="student-info">
                      {emergency.students.avatar_url && (
                        <img 
                          src={emergency.students.avatar_url} 
                          alt={emergency.students.student_name || 'Student'}
                          className="student-avatar"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="student-details">
                        <h3 className="student-name">
                          {emergency.student.student_name}
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
                    <span>
                      <strong>Reported (Local Device):</strong> {formatDateTime(localReportTimes[emergency.id] || emergency.reported_at)}
                    </span>
                  </div>
                </div>

                <div className="emergency-card-footer">
                  <button
                    className="view-location-btn"
                    onClick={() => navigate('/contact', { 
                      state: { 
                        emergency,
                        localReportedTime: localReportTimes[emergency.id] || emergency.reported_at
                      } 
                    })}
                  >
                    <i className="fas fa-map-marked-alt"></i> View Location
                  </button>
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