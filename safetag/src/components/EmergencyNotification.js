import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import './EmergencyNotification.css';

function EmergencyNotification() {
  const [emergencies, setEmergencies] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [emergencyCount, setEmergencyCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const previousCountRef = useRef(0);
  const audioRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isEmergencyPage = location.pathname === '/emergency';
  const isLoginPage = location.pathname === '/login' || location.pathname === '/';
  const isContactPage = location.pathname === '/contact';

  // Setup audio element
  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.7;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Emergency polling and alert logic
  useEffect(() => {
    const fetchEmergencies = async () => {
      try {
        const { data: emergenciesData, error: emergenciesError } = await supabase
          .from('ongoing_emergencies')
          .select('*')
          .eq('is_resolved', false)
          .order('reported_at', { ascending: false });

        if (emergenciesError) {
          console.error('❌ Error fetching emergencies:', emergenciesError);
          return;
        }

        setEmergencies(emergenciesData);
        const newCount = emergenciesData ? emergenciesData.length : 0;
        const previousCount = previousCountRef.current;

        if (newCount > 0 && (previousCount === 0 || newCount > previousCount)) {
          triggerAlert(newCount);
        } else if (newCount === 0 && previousCount > 0) {
          stopAlertSound();
          setShowAlert(false);
        }
        previousCountRef.current = newCount;
      } catch (error) {
        console.error('❌ Exception fetching emergencies:', error);
      }
    };

    if (!isLoginPage) {
      fetchEmergencies();
      const interval = setInterval(fetchEmergencies, 10000);
      return () => clearInterval(interval);
    }
  }, [isLoginPage, isContactPage]);

  // Stop sound on explicit global signal (from ContactPage after verification)
  useEffect(() => {
    const stopHandler = () => {
      stopAlertSound();
      setShowAlert(false);
    };
    window.addEventListener('emergency-sound-stop', stopHandler);
    return () => window.removeEventListener('emergency-sound-stop', stopHandler);
  }, []);

  // Play alert sound
  const playAlertSound = () => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().catch(err => console.error('Failed to play alert sound:', err));
      setIsPlaying(true);
    }
  };

  // Stop alert sound
  const stopAlertSound = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  // Trigger alert and notification
  const triggerAlert = (count = 1) => {
    setShowAlert(true);
    setEmergencyCount(count);
    playAlertSound();
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🚨 EMERGENCY ALERT', {
        body: `There ${count === 1 ? 'is 1 ongoing emergency' : `are ${count} ongoing emergencies`}!`,
        icon: '/emergency-icon.png',
        tag: 'emergency-alert'
      });
    }
  };

  // ...removed Web Audio API logic...

  const handleViewEmergency = () => {
    navigate('/emergency');
  };

  const handleViewLocation = (emergency) => {
    navigate('/contact', { state: { emergency } });
  };

  // Hide UI on login page and stop any sound
  if (isLoginPage) {
    stopAlertSound();
    return null;
  }
  // Hide UI on contact page BUT do not stop sound (until user confirms done)
  if (isContactPage) {
    return null;
  }
  // If there are no emergencies at all, stop sound and hide UI
  if (emergencies.length === 0) {
    stopAlertSound();
    return null;
  }

  return (
    <>
      {/* Compact notification for non-emergency pages */}
      {!isEmergencyPage && showAlert && (
        <div className="emergency-notification-compact">
          <div className="notification-content">
            <div className="notification-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="notification-text">
              <span className="notification-count">{emergencyCount}</span>
              <span className="notification-label">
                Active {emergencyCount === 1 ? 'Emergency' : 'Emergencies'}
              </span>
            </div>
            <button className="notification-btn" onClick={handleViewEmergency}>
              View Details
            </button>
          </div>
        </div>
      )}

      {/* Expanded notification for emergency page */}
      {isEmergencyPage && showAlert && (
        <div className="emergency-notification-expanded">
          <div className="expanded-header">
            <div className="header-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="header-text">
              <h3>Active Emergencies ({emergencyCount})</h3>
              <p>Urgent attention required</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EmergencyNotification;
