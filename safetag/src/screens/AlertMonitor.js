import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../css/AlertMonitor.css';

function AlertMonitor() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

 
  useEffect(() => {
    audioRef.current = new Audio();
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


  const playAlertSound = useCallback(() => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().catch(err => {
        console.error('Failed to play alert sound:', err);
      });
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const stopAlertSound = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isPlaying]);

  // Fetch student details for an emergency
  const fetchStudentDetails = async (studentId) => {
    if (!studentId) return null;

    const { data, error } = await supabase
      .from('students')
      .select('first_name, middle_name, last_name, student_id, avatar_url')
      .eq('student_id', studentId)
      .single();

    if (error) {
      console.error('Error fetching student:', error);
      return null;
    }
    return data;
  };

  // Subscribe to real-time emergency alerts
  useEffect(() => {
    const fetchRecentAlerts = async () => {
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const { data, error } = await supabase
        .from('ongoing_emergencies')
        .select('*')
        .eq('is_resolved', false)
        .gte('reported_at', twentyFourHoursAgo.toISOString())
        .order('reported_at', { ascending: false });

      if (error) {
        console.error('Error fetching alerts:', error);
      } else if (data && data.length > 0) {
        const alertsWithStudents = await Promise.all(
          data.map(async (emergency) => {
            const student = await fetchStudentDetails(emergency.student_id);
            return { ...emergency, students: student };
          })
        );
        setAlerts(alertsWithStudents);
        playAlertSound();
      }
    };

    fetchRecentAlerts();

    // Real-time subscription for new emergencies
    const channel = supabase
      .channel('emergency-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ongoing_emergencies',
        },
        async (payload) => {
          console.log('🚨 New emergency alert received:', payload);
          const newAlert = payload.new;
          const student = await fetchStudentDetails(newAlert.student_id);
          const alertWithStudent = { ...newAlert, students: student };

          setAlerts((prev) => [alertWithStudent, ...prev]);
          playAlertSound();

          // Browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            const studentName = student
              ? `${student.first_name} ${student.last_name}`
              : 'Unknown Student';

            new Notification('🚨 EMERGENCY ALERT', {
              body: `Emergency from ${studentName} at ${newAlert.location || 'Unknown location'}`,
              icon: '/emergency-icon.png',
              tag: 'emergency-alert',
            });
          }
        }
      )
      .subscribe();

    // Ask for notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      supabase.removeChannel(channel);
      stopAlertSound();
    };
  }, [playAlertSound, stopAlertSound]); // ✅ Added dependencies here

  // Handle acknowledgment
  const handleAcknowledge = async (alertId) => {
    stopAlertSound();

    const { error } = await supabase
      .from('ongoing_emergencies')
      .update({ is_resolved: true })
      .eq('id', alertId);

    if (error) {
      console.error('Error acknowledging alert:', error);
      alert('Failed to acknowledge alert');
    } else {
      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
    }
  };

  // Handle respond
  const handleRespond = async (alert) => {
    stopAlertSound();
    navigate('/contact', { state: { emergency: alert } });
  };

  // Dismiss all alerts
  const handleDismissAll = () => {
    stopAlertSound();
    setAlerts([]);
  };

  if (alerts.length === 0) return null;

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
                <div className="alert-time">{formatDateTime(alert.reported_at)}</div>
              </div>

              <div className="alert-content">
                <div className="alert-student-info">
                  {alert.students?.avatar_url && (
                    <img
                      src={alert.students.avatar_url}
                      alt={`${alert.students.first_name} ${alert.students.last_name}`}
                      className="alert-avatar"
                    />
                  )}
                  <div className="alert-details">
                    <h3>
                      {alert.students
                        ? `${alert.students.first_name} ${alert.students.middle_name || ''} ${alert.students.last_name}`.trim()
                        : 'Unknown Student'}
                    </h3>
                    <p className="student-id">
                      ID: {alert.students?.student_id || alert.student_id || 'N/A'}
                    </p>
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
