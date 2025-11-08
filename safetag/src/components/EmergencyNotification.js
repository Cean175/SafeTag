import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import './EmergencyNotification.css';

function EmergencyNotification() {
  const [emergencies, setEmergencies] = useState([]);
  const [hasPlayed, setHasPlayed] = useState(false);
  const previousCountRef = useRef(0);
  const audioContextRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isEmergencyPage = location.pathname === '/emergency';
  const isLoginPage = location.pathname === '/login' || location.pathname === '/';
  const isContactPage = location.pathname === '/contact';

  // Fetch ongoing emergencies
  useEffect(() => {
    console.log('EmergencyNotification mounted. Current page:', location.pathname, 'isLoginPage:', isLoginPage);
    
    const fetchEmergencies = async () => {
      console.log('🔍 Fetching emergencies from database...');
      try {
        // First, get the ongoing emergencies
        const { data: emergenciesData, error: emergenciesError } = await supabase
          .from('ongoing_emergencies')
          .select('*')
          .eq('is_resolved', false)
          .order('reported_at', { ascending: false });

        if (emergenciesError) {
          console.error('❌ Error fetching emergencies:', emergenciesError);
          return;
        }
        
        console.log('📦 Emergencies from database:', emergenciesData);
        
        // If we have emergencies, fetch the related student data
        let enrichedData = emergenciesData;
        if (emergenciesData && emergenciesData.length > 0) {
          const studentIds = emergenciesData.map(e => e.student_id).filter(Boolean);
          
          if (studentIds.length > 0) {
            const { data: studentsData, error: studentsError } = await supabase
              .from('students')
              .select('id, first_name, middle_name, last_name, student_id, avatar_url')
              .in('student_id', studentIds);
            
            if (!studentsError && studentsData) {
              // Map students to emergencies
              enrichedData = emergenciesData.map(emergency => {
                const student = studentsData.find(s => s.student_id === emergency.student_id);
                return {
                  ...emergency,
                  students: student || null
                };
              });
            }
          }
        }
        
        console.log('📦 Enriched data with students:', enrichedData);
        
        const data = enrichedData;
        
        const newCount = data ? data.length : 0;
        const previousCount = previousCountRef.current;
        
        console.log('📊 Emergency fetch:', { 
          newCount, 
          previousCount, 
          hasPlayed,
          shouldPlaySound: !hasPlayed || newCount > previousCount
        });
        
        if (data && data.length > 0) {
          setEmergencies(data);
          
          // Play sound when new emergencies are detected or on first load
          if (!hasPlayed || newCount > previousCount) {
            console.log('🔊 Playing alert sound!');
            playLoudAlertSound();
            setHasPlayed(true);
          }
          
          previousCountRef.current = newCount;
        } else {
          console.log('ℹ️ No emergencies found');
          setEmergencies([]);
          setHasPlayed(false);
          previousCountRef.current = 0;
        }
      } catch (error) {
        console.error('❌ Exception fetching emergencies:', error);
      }
    };

    if (!isLoginPage && !isContactPage) {
      console.log('✅ Not login/contact page, starting emergency monitoring...');
      fetchEmergencies();
      
      // Poll for new emergencies every 10 seconds
      const interval = setInterval(fetchEmergencies, 10000);
      
      return () => {
        console.log('🛑 Cleaning up emergency monitoring');
        clearInterval(interval);
      };
    } else {
      console.log('⏸️ Login or Contact page detected, skipping emergency monitoring');
    }
  }, [isLoginPage, isContactPage]);

  // Generate loud siren-like alert sound using Web Audio API
  const playLoudAlertSound = () => {
    console.log('🎵 playLoudAlertSound called');
    try {
      // Create audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      console.log('🎵 AudioContext created, state:', audioContext.state);

      // Create oscillators for siren effect
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Connect nodes
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Configure oscillators for alarm sound
      oscillator1.type = 'sine';
      oscillator2.type = 'square';
      
      // Set initial frequencies
      oscillator1.frequency.setValueAtTime(900, audioContext.currentTime);
      oscillator2.frequency.setValueAtTime(450, audioContext.currentTime);

      // Create fast siren effect (alternating frequencies rapidly)
      const now = audioContext.currentTime;
      for (let i = 0; i < 20; i++) {
        const startTime = now + i * 0.1; // Much faster tempo: 0.05s (50ms) intervals
        oscillator1.frequency.setValueAtTime(i % 2 === 0 ? 900 : 1100, startTime);
        oscillator2.frequency.setValueAtTime(i % 2 === 0 ? 450 : 550, startTime);
      }

      // Set volume (loud)
      gainNode.gain.setValueAtTime(0.8, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);

      // Start and stop oscillators
      oscillator1.start(audioContext.currentTime);
      oscillator2.start(audioContext.currentTime);
      oscillator1.stop(audioContext.currentTime + 2);
      oscillator2.stop(audioContext.currentTime + 2);
      
      console.log('✅ Sound playing for 1.2 seconds with fast tempo');

      // Clean up
      setTimeout(() => {
        audioContext.close();
        console.log('🔇 AudioContext closed');
      }, 1500);

    } catch (error) {
      console.error('❌ Audio play failed:', error);
      // Fallback to simple beep if Web Audio API fails
      playFallbackBeep();
    }
  };

  // Fallback beep sound
  const playFallbackBeep = () => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.frequency.value = 880;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.5;
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.3);
  };

  const handleViewEmergency = () => {
    navigate('/emergency');
  };

  const handleViewLocation = (emergency) => {
    navigate('/contact', { state: { emergency } });
  };

  // Don't render on login page, contact page, or if no emergencies
  if (isLoginPage || isContactPage || emergencies.length === 0) {
    return null;
  }

  return (
    <>
      {/* Compact notification for non-emergency pages */}
      {!isEmergencyPage && (
        <div className="emergency-notification-compact">
          <div className="notification-content">
            <div className="notification-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="notification-text">
              <span className="notification-count">{emergencies.length}</span>
              <span className="notification-label">
                Active {emergencies.length === 1 ? 'Emergency' : 'Emergencies'}
              </span>
            </div>
            <button className="notification-btn" onClick={handleViewEmergency}>
              View Details
            </button>
          </div>
        </div>
      )}

      {/* Expanded notification for emergency page */}
      {isEmergencyPage && (
        <div className="emergency-notification-expanded">
          <div className="expanded-header">
            <div className="header-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="header-text">
              <h3>Active Emergencies ({emergencies.length})</h3>
              <p>Urgent attention required</p>
            </div>
          </div>
          
          <div className="emergencies-list">
            {emergencies.slice(0, 3).map((emergency) => {
              const studentName = emergency.students
                ? `${emergency.students.first_name} ${emergency.students.middle_name || ''} ${emergency.students.last_name}`.trim()
                : 'Unknown Student';
              
              const reportedTime = emergency.reported_at
                ? new Date(emergency.reported_at).toLocaleString()
                : 'Unknown time';

              return (
                <div key={emergency.id} className="emergency-item">
                  <div className="emergency-info">
                    <div className="info-row">
                      <span className="info-label">Student:</span>
                      <span className="info-value">{studentName}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Location:</span>
                      <span className="info-value">{emergency.location || 'Unknown'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Reported:</span>
                      <span className="info-value">{reportedTime}</span>
                    </div>
                  </div>
                  <button 
                    className="view-location-btn"
                    onClick={() => handleViewLocation(emergency)}
                  >
                    <i className="fas fa-map-marker-alt"></i>
                    View Location
                  </button>
                </div>
              );
            })}
          </div>

          {emergencies.length > 3 && (
            <div className="more-emergencies">
              +{emergencies.length - 3} more {emergencies.length - 3 === 1 ? 'emergency' : 'emergencies'}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default EmergencyNotification;
