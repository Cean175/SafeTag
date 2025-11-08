import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/ContactPage.css';

function ContactPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Emergency object passed from EmergencyPage via: navigate('/contact', { state: { emergency } })
  const emergency = location.state?.emergency || null;
  const [student, setStudent] = useState(null);

  useEffect(() => {
    if (emergency && emergency.students) {
      setStudent(emergency.students);
    } else if (emergency) {
      // Fallback: some fields might be flat if student join failed
      setStudent({
        first_name: emergency.first_name || 'Unknown',
        middle_name: emergency.middle_name || '',
        last_name: emergency.last_name || '',
        student_id: emergency.student_id || 'N/A',
        avatar_url: emergency.avatar_url || null
      });
    }
  }, [emergency]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleDone = () => {
    navigate('/home');
  };

  const studentFullName = student ? `${student.first_name} ${student.middle_name || ''} ${student.last_name}`.replace(/\s+/g,' ').trim() : 'Not available';
  const studentAvatar = student?.avatar_url || 'https://via.placeholder.com/100x100.png?text=Student';
  const studentId = student?.student_id || 'Not available';

  const locationText = emergency?.location || 'No location provided';
  const reportedTime = emergency?.reported_at ? new Date(emergency.reported_at).toLocaleString() : 'N/A';
  const createdTime = emergency?.created_at ? new Date(emergency.created_at).toLocaleString() : 'N/A';
  const statusText = emergency ? (emergency.is_resolved ? 'Resolved' : 'Active') : 'Unknown';

  return (
    <div className="contact-page-container">
      <header className="header">
        <div className="header-content">
          <div className="branding">
            <h1 className="title">S.A.F.E</h1>
            <p className="subtitle">STUDENT ASSISTANCE FOR EMERGENCIES</p>
          </div>
          <nav className="nav-icons" aria-label="Primary navigation">
            <button className="nav-icon" aria-label="Home" onClick={() => handleNavigation('/home')}><i className="fas fa-home"></i></button>
            <button className="nav-icon" aria-label="User" onClick={() => handleNavigation('/user')}><i className="fas fa-user"></i></button>
            <button className="nav-icon" aria-label="Statistics" onClick={() => handleNavigation('/statistics')}><i className="fas fa-chart-bar"></i></button>
            <button className="nav-icon active" aria-label="Contact" onClick={() => handleNavigation('/contact')}><i className="fas fa-phone"></i></button>
            <button className="nav-icon" aria-label="Settings" onClick={() => handleNavigation('/settings')}><i className="fas fa-cog"></i></button>
          </nav>
        </div>
      </header>
      <main className="main-content">
        <section className="emergency-alert glass-panel">
          <div className="alert-header">
            <h2 className="alert-title"><i className="fas fa-triangle-exclamation"></i> Emergency Details</h2>
            {emergency && <span className={`pill ${statusText === 'Active' ? 'pill-active' : 'pill-resolved'}`}>{statusText}</span>}
          </div>
          {emergency ? (
            <div className="alert-grid">
              <div className="alert-item"><span className="item-label">Reported:</span><span className="item-value">{reportedTime}</span></div>
              <div className="alert-item"><span className="item-label">Created:</span><span className="item-value">{createdTime}</span></div>
              <div className="alert-item full-width"><span className="item-label">Location:</span><span className="item-value">{locationText}</span></div>
              <div className="alert-actions">
                <button className="secondary-btn" onClick={() => navigate('/emergency')}>Back</button>
                <button className="primary-btn" onClick={handleDone}>Done</button>
              </div>
            </div>
          ) : (
            <p className="alert-empty">No emergency data passed. Return to Emergencies list.</p>
          )}
        </section>
        <section className="student-card glass-panel" aria-labelledby="student-info-heading">
          <div className="card-header">
            <h3 id="student-info-heading">Student Information</h3>
          </div>
          <div className="card-body">
            {student ? (
              <div className="student-layout">
                <div className="avatar-wrapper">
                  <img src={studentAvatar} alt={studentFullName} className="avatar" />
                </div>
                <div className="details-list">
                  <div className="detail-row"><span className="detail-label">Name</span><span className="detail-value">{studentFullName}</span></div>
                  <div className="detail-row"><span className="detail-label">Student ID</span><span className="detail-value">{studentId}</span></div>
                  <div className="detail-row"><span className="detail-label">Status</span><span className="detail-value">{statusText}</span></div>
                  <div className="detail-row"><span className="detail-label">Location</span><span className="detail-value">{locationText}</span></div>
                  <div className="detail-row"><span className="detail-label">Reported</span><span className="detail-value">{reportedTime}</span></div>
                </div>
              </div>
            ) : (
              <p className="no-student">No student data available for this emergency.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default ContactPage;

