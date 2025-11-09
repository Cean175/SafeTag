import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/ContactPage.css';

function ContactPage() {
  const navigate = useNavigate();
  const location = useLocation();


  const emergency = location.state?.emergency || null;
  const [student, setStudent] = useState(null);
  const [showDoneMsg, setShowDoneMsg] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState('');

  useEffect(() => {
    if (emergency && emergency.students) {
      setStudent(emergency.students);
    } else if (emergency) {
      setStudent({
        first_name: emergency.first_name || 'Unknown',
        middle_name: emergency.middle_name || '',
        last_name: emergency.last_name || '',
        student_id: emergency.student_id || 'N/A',
        avatar_url: emergency.avatar_url || null
      });
    }
    // Request notification permission on mount
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, [emergency]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleDone = () => {
    setResolveError('');
    setShowConfirmModal(true);
  };

  const confirmMarkDone = async () => {
    if (!emergency?.id) {
      navigate('/documentations');
      return;
    }
    try {
      setIsResolving(true);
      setResolveError('');
      const { error } = await supabase
        .from('ongoing_emergencies')
        .update({ is_resolved: true })
        .eq('id', emergency.id);
      if (error) throw error;

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Emergency Verified', {
          body: 'Emergency marked as done and verified.',
          icon: '/emergency-icon.png',
          tag: 'emergency-done'
        });
      }
      // Tell EmergencyNotification to stop the alert sound now that user verified
      window.dispatchEvent(new Event('emergency-sound-stop'));
      setShowDoneMsg(true);
      setTimeout(() => setShowDoneMsg(false), 1500);
      setShowConfirmModal(false);
      navigate('/documentations');
    } catch (err) {
      console.error('Failed to resolve emergency:', err);
      setResolveError('Failed to mark as done. Please try again.');
    } finally {
      setIsResolving(false);
    }
  };

  const studentFullName = student ? `${student.first_name} ${student.middle_name || ''} ${student.last_name}`.replace(/\s+/g,' ').trim() : 'Not available';
  const studentAvatar = student?.avatar_url || 'https://via.placeholder.com/100x100.png?text=Student';
  const studentId = student?.student_id || 'Not available';

  const locationText = emergency?.location || 'No location provided';
  const reportedTime = emergency?.reported_at ? new Date(emergency.reported_at).toLocaleString() : 'N/A';
  const createdTime = emergency?.created_at ? new Date(emergency.created_at).toLocaleString() : 'N/A';
  const statusText = emergency ? (emergency.is_resolved ? 'Resolved' : 'Active') : 'Unknown';

  return (
    <div className="user-page-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="branding">
            <h1 className="title">S.A.F.E</h1>
            <p className="subtitle">STUDENT ASSISTANCE FOR EMERGENCIES</p>
          </div>
          <div className="nav-icons">
            <div className="nav-icon" onClick={() => handleNavigation('/home')}>
              <i className="fas fa-home"></i>
            </div>
            <div className="nav-icon" onClick={() => handleNavigation('/user')}>
              <i className="fas fa-user"></i>
            </div>
            <div className="nav-icon" onClick={() => handleNavigation('/statistics')}>
              <i className="fas fa-chart-bar"></i>
            </div>
            <div className="nav-icon active" onClick={() => handleNavigation('/contact')}>
              <i className="fas fa-phone"></i>
            </div>
            <div className="nav-icon" onClick={() => handleNavigation('/settings')}>
              <i className="fas fa-cog"></i>
            </div>
          </div>
        </div>
      </header>
      <main className="main-content">
        {showDoneMsg && (
          <div style={{position:'fixed',top:90,right:30,zIndex:9999,background:'#27ae60',color:'#fff',padding:'1rem 2rem',borderRadius:'8px',boxShadow:'0 2px 8px rgba(0,0,0,0.15)'}}>
            Emergency marked as done and verified!
          </div>
        )}
        {showConfirmModal && (
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.35)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:10000}}>
            <div style={{background:'#fff',borderRadius:12,width:'min(500px,90vw)',padding:'20px 22px',boxShadow:'0 10px 30px rgba(0,0,0,0.2)'}}>
              <h3 style={{margin:'0 0 10px',color:'#c0392b'}}><i className="fas fa-exclamation-triangle"></i> Confirm Resolution</h3>
              <p style={{margin:'0 0 16px',color:'#333'}}>Are you sure you want to mark this emergency as <strong>Done</strong>? This will resolve it and stop alerts.</p>
              {resolveError && (
                <div style={{background:'#fdecea',color:'#c0392b',padding:'8px 12px',borderRadius:8,marginBottom:10}}>
                  {resolveError}
                </div>
              )}
              <div style={{display:'flex',gap:12,justifyContent:'flex-end'}}>
                <button className="secondary-btn" disabled={isResolving} onClick={() => setShowConfirmModal(false)}>Cancel</button>
                <button className="primary-btn" onClick={confirmMarkDone} disabled={isResolving}>
                  {isResolving ? 'Marking…' : 'Yes, Mark as Done'}
                </button>
              </div>
            </div>
          </div>
        )}
        <section className="emergency-alert">
          <h2 className="alert-title"><i className="fas fa-triangle-exclamation"></i> Emergency Details</h2>
          {emergency ? (
            <div className="alert-details">
              <p className="status-line"><strong>Status:</strong> <span className={statusText === 'Active' ? 'status-active' : 'status-resolved'}>{statusText}</span></p>
              <p><strong>Reported:</strong> {reportedTime}</p>
              <p><strong>Created:</strong> {createdTime}</p>
              <p><strong>Location:</strong> {locationText}</p>
              <div className="alert-actions">
                <button className="secondary-btn" onClick={() => navigate('/emergency')}>Back</button>
                <button className="primary-btn" onClick={handleDone}>Done</button>
              </div>
            </div>
          ) : (
            <p className="alert-subtitle">No emergency data passed. Navigate from the Emergencies page to view details here.</p>
          )}
        </section>
        <div className="content-wrapper">
          <section className="student-card">
            <div className="card-header"><h3>Student Information</h3></div>
            <div className="card-body">
              {student ? (
                <div className="profile-section">
                  <div className="profile-image">
                    <img src={studentAvatar} alt={studentFullName} className="avatar" />
                  </div>
                  <div className="student-info">
                    <div className="info-row"><span className="label">Name:</span><span className="value">{studentFullName}</span></div>
                    <div className="info-row"><span className="label">Student ID:</span><span className="value">{studentId}</span></div>
                    <div className="info-row"><span className="label">Status:</span><span className="value">{statusText}</span></div>
                    <div className="info-row"><span className="label">Location:</span><span className="value">{locationText}</span></div>
                    <div className="info-row"><span className="label">Reported:</span><span className="value">{reportedTime}</span></div>
                  </div>
                </div>
              ) : (
                <p className="no-student">No student data available for this emergency.</p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default ContactPage;

