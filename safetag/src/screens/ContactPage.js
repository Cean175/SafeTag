import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/ContactPage.css';

function ContactPage() {
  const navigate = useNavigate();
  const location = useLocation();


  const emergency = location.state?.emergency || null;
  const [student, setStudent] = useState(null);

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
  }, [emergency]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleDone = () => {
    navigate('/documentations');
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

