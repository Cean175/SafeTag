import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/ContactPage.css';

function ContactPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [emergencyData, setEmergencyData] = useState(null);

  useEffect(() => {
    
    if (location.state && location.state.emergencyData) {
      setEmergencyData(location.state.emergencyData);
    }
  }, [location]);

 


  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleDone = () => {
    
    navigate('/home');
  };

  const handleCall = () => {
    if (emergencyData && emergencyData.phone) {
      window.open(`tel:${emergencyData.phone}`);
    }
  };

  const handleMessage = () => {
    if (emergencyData && emergencyData.phone) {
      window.open(`sms:${emergencyData.phone}`);
    }
  };

  return (
    <div className="contact-page-container">
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
      
      <main className="main-content contact-content">
        <div className="emergency-alert">
          <h2 className="alert-title">EMERGENCY ALERT</h2>
          <p className="alert-subtitle">Click button if accomplished</p>
          <button className="done-button" onClick={handleDone}>
            DONE
          </button>
        </div>

        <div className="student-card">
          <div className="card-header">
            <h3>STUDENT 1</h3>
          </div>
          
          <div className="card-body">
            <div className="profile-section">
              <h4>DEMOGRAPHIC PROFILE</h4>
              <div className="profile-image">
                <div className="avatar">
                  <img src="/api/placeholder/80/80" alt="Student Avatar" />
                </div>
              </div>
              <div className="student-info">
                <div className="info-row">
                  <span className="label">NAME:</span>
                  <span className="value">{emergencyData?.name || 'John Doe'}</span>
                </div>
                <div className="info-row">
                  <span className="label">AGE:</span>
                  <span className="value">{emergencyData?.age || '20'}</span>
                </div>
                <div className="info-row">
                  <span className="label">STUDENT ID NUMBER:</span>
                  <span className="value">{emergencyData?.studentId || '2021-00123'}</span>
                </div>
                <div className="info-row">
                  <span className="label">YEAR & COURSE:</span>
                  <span className="value">{emergencyData?.course || '3rd Year BSIT'}</span>
                </div>
                 <div className="info-row">
                  <span className="label">Disease</span>
                  <span className="value">{emergencyData?.Healthcondition || 'Congestive heart failure'}</span>
                  </div>
              </div>
              
              <div className="emergency-contact">
                <h5>EMERGENCY CONTACT</h5>
                <div className="contact-info">
                  <div className="contact-row">
                    <span className="label">NAME:</span>
                    <span className="value">{emergencyData?.emergencyContactName || ''}</span>
                  </div>
                  <div className="contact-row">
                    <span className="label">PHONE:</span>
                    <span className="value">{emergencyData?.phone || ''}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="location-section">
          <h3>Location</h3>
          <div className="map-container">
            <img 
              src="/api/placeholder/400/200" 
              alt="Emergency Location Map" 
              className="location-map"
            />
            <div className="location-marker">
              <span>📍</span>
            </div>
            <button className="click-button">Click</button>
          </div>
        </div>

        <div className="action-buttons">
          <button className="call-button" onClick={handleCall}>
            📞 CALL
          </button>
          <button className="message-button" onClick={handleMessage}>
            💬 MESSAGE
          </button>
        </div>
      </main>
    </div>
  );
}

export default ContactPage;