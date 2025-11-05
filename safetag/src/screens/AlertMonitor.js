import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../css/AlertMonitor.css';

function AlertMonitor() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const [lastAlertTime, setLastAlertTime] = useState(null);

  // Initialize audio element
  useEffect(() => {
    // Create audio element for alert sound
    audioRef.current = new Audio();
    // Using a emergency siren sound from a CDN
    audioRef.current.src = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
    audioRef.current.loop = true;
    audioRef.current.volume = 0.7;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Function to play alert sound
  const playAlertSound = () => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().catch(err => {
        console.error('Failed to play alert sound:', err);
      });
      setIsPlaying(true);
    }
  };

  // Function to stop alert sound
  const stopAlertSound = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  // Subscribe to real-time emergency alerts from database
  useEffect(() => {
    // Fetch initial emergency alerts (created in last 24 hours)
    const fetchRecentAlerts = async () => {
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const { data, error } = await supabase
        .from('emergencies')
        .select('*')
        .eq('status', 'active')
        .gte('created_at', twentyFourHoursAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching alerts:', error);
      } else if (data && data.length > 0) {
        setAlerts(data);
        playAlertSound();
      }
    };

    fetchRecentAlerts();

    // Set up real-time subscription for new emergencies
    const channel = supabase
      .channel('emergency-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'emergencies'
        },
        (payload) => {
          console.log('New emergency alert received:', payload);
          const newAlert = payload.new;
          
          setAlerts(prev => [newAlert, ...prev]);
          setLastAlertTime(new Date());
          playAlertSound();

          // Show browser notification if permitted
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🚨 EMERGENCY ALERT', {
              body: `Emergency from ${newAlert.student_name || 'Unknown Student'}`,
              icon: '/emergency-icon.png',
              tag: 'emergency-alert'
            });
          }
        }
      )
      .subscribe();

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      supabase.removeChannel(channel);
      stopAlertSound();
    };
  }, []);

  // Handle alert acknowledgment
  const handleAcknowledge = async (alertId) => {
    stopAlertSound();

    const { error } = await supabase
      .from('emergencies')
      .update({ 
        status: 'acknowledged',
        acknowledged_at: new Date().toISOString()
      })
      .eq('id', alertId);

    if (error) {
      console.error('Error acknowledging alert:', error);
      alert('Failed to acknowledge alert');
    } else {
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    }
  };

  // Handle responding to alert
  const handleRespond = async (alert) => {
    stopAlertSound();

    // Update status to responding
    const { error } = await supabase
      .from('emergencies')
      .update({ 
        status: 'responding',
        responded_at: new Date().toISOString()
      })
      .eq('id', alert.id);

    if (error) {
      console.error('Error updating alert status:', error);
    }

    // Navigate to contact page with emergency data
    navigate('/contact', {
      state: {
        emergencyData: {
          name: alert.student_name,
          age: alert.age,
          studentId: alert.student_id,
          course: alert.course,
          Healthcondition: alert.health_condition,
          avatarUrl: alert.avatar_url,
          emergencyContactName: alert.emergency_contact_name,
          phone: alert.emergency_contact_phone,
          location: alert.location
        }
      }
    });
  };

  // Dismiss all alerts
  const handleDismissAll = () => {
    stopAlertSound();
    setAlerts([]);
  };

  if (alerts.length === 0) {
    return null; // Don't show anything if no alerts
  }

  return (
    <div className="alert-monitor-overlay">
      <div className="alert-monitor-container">
        <div className="alert-header">
          <div className="alert-title">
            <i className="fas fa-exclamation-triangle alert-icon-pulse"></i>
            <h2>EMERGENCY ALERTS</h2>
          </div>
          <div className="alert-actions-header">
            <button 
              className="sound-toggle-btn"
              onClick={isPlaying ? stopAlertSound : playAlertSound}
            >
              <i className={`fas ${isPlaying ? 'fa-volume-up' : 'fa-volume-mute'}`}></i>
            </button>
            <button className="dismiss-all-btn" onClick={handleDismissAll}>
              Dismiss All
            </button>
          </div>
        </div>

        <div className="alerts-list">
          {alerts.map((alert) => (
            <div key={alert.id} className="alert-card">
              <div className="alert-card-header">
                <div className="alert-status-badge">ACTIVE EMERGENCY</div>
                <div className="alert-time">
                  {new Date(alert.created_at).toLocaleTimeString()}
                </div>
              </div>

              <div className="alert-content">
                <div className="alert-student-info">
                  {alert.avatar_url && (
                    <img 
                      src={alert.avatar_url} 
                      alt={alert.student_name}
                      className="alert-avatar"
                    />
                  )}
                  <div className="alert-details">
                    <h3>{alert.student_name || 'Unknown Student'}</h3>
                    <p className="student-id">ID: {alert.student_id || 'N/A'}</p>
                    <p className="student-info">
                      {alert.age && `Age: ${alert.age}`}
                      {alert.course && ` | ${alert.course}`}
                    </p>
                    {alert.health_condition && (
                      <p className="health-warning">
                        <i className="fas fa-heartbeat"></i>
                        Health Condition: {alert.health_condition}
                      </p>
                    )}
                    {alert.location && (
                      <p className="location-info">
                        <i className="fas fa-map-marker-alt"></i>
                        Location: {alert.location}
                      </p>
                    )}
                  </div>
                </div>

                <div className="alert-actions">
                  <button 
                    className="respond-btn"
                    onClick={() => handleRespond(alert)}
                  >
                    <i className="fas fa-ambulance"></i>
                    RESPOND
                  </button>
                  <button 
                    className="acknowledge-btn"
                    onClick={() => handleAcknowledge(alert.id)}
                  >
                    <i className="fas fa-check"></i>
                    Acknowledge
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AlertMonitor;