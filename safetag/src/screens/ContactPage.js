import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/ContactPage.css';

function ContactPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [emergencyData, setEmergencyData] = useState(null);

  useEffect(() => {
    // Only set emergencyData if it's available in the state
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
    if (emergencyData?.phone) {
      window.open(`tel:${emergencyData.phone}`);
    } else {
      alert("No phone number available to call.");
    }
  };

  const handleMessage = () => {
    if (emergencyData?.phone) {
      window.open(`sms:${emergencyData.phone}`);
    } else {
      alert("No phone number available to message.");
    }
  };

  // Default values for rendering if no data is passed
  const studentInfo = {
    name: emergencyData?.name || 'Not available',
    age: emergencyData?.age || 'Not available',
    studentId: emergencyData?.studentId || 'Not available',
    course: emergencyData?.course || 'Not available',
    healthCondition: emergencyData?.Healthcondition || 'Not available', // Note: Corrected typo 'Healthcondition' to 'healthCondition' for consistency
    avatarUrl: emergencyData?.avatarUrl || 'https://via.placeholder.com/80x80.png?text=Student', // Using a real placeholder URL
  };

  const contactInfo = {
    name: emergencyData?.emergencyContactName || 'Not available',
    phone: emergencyData?.phone || 'Not available',
  };

  return (
    <div className="contact-page-container">
      <header className="header">
        <div className="header-content">
          <div className="branding">
            <h1 className="title">S.A.F.E</h1>
            <p className="subtitle">STUDENT ASSISTANCE FOR EMERGENCIES</p>
          </div>
          <nav className="nav-icons" aria-label="Main navigation">
            <button className="nav-icon" aria-label="Home" onClick={() => handleNavigation('/home')}>
              <i className="fas fa-home"></i>
            </button>
            <button className="nav-icon" aria-label="User" onClick={() => handleNavigation('/user')}>
              <i className="fas fa-user"></i>
            </button>
            <button className="nav-icon" aria-label="Statistics" onClick={() => handleNavigation('/statistics')}>
              <i className="fas fa-chart-bar"></i>
            </button>
            <button className="nav-icon" aria-label="Contact" onClick={() => handleNavigation('/contact')}>
              <i className="fas fa-phone"></i>
            </button>
            <button className="nav-icon" aria-label="Settings" onClick={() => handleNavigation('/settings')}>
              <i className="fas fa-cog"></i>
            </button>
          </nav>
        </div>
      </header>
      
      <main className="contact-page main-content">
        <section className="emergency-alert">
          <h2 className="alert-title">🚨 Emergency Alert</h2>
          <p className="alert-subtitle">If you have accomplished the emergency response, click below:</p>
          <button className="done-button" onClick={handleDone}>
            DONE
          </button>
        </section>

        <section className="student-card">
          <div className="card-header">
            <h3>Student Information</h3>
          </div>
          <div className="card-body">
            <div className="profile-section">
              <div className="profile-image">
                <img src={studentInfo.avatarUrl} alt="Student profile avatar" className="avatar" />
              </div>
              <div className="student-info">
                <div className="info-row">
                  <span className="label">Name:</span>
                  <span className="value">{studentInfo.name}</span>
                </div>
                <div className="info-row">
                  <span className="label">Age:</span>
                  <span className="value">{studentInfo.age}</span>
                </div>
                <div className="info-row">
                  <span className="label">Student ID:</span>
                  <span className="value">{studentInfo.studentId}</span>
                </div>
                <div className="info-row">
                  <span className="label">Year & Course:</span>
                  <span className="value">{studentInfo.course}</span>
                </div>
                <div className="info-row">
                  <span className="label">Health Condition:</span>
                  <span className="value">{studentInfo.healthCondition}</span>
                </div>
              </div>
            </div>
            <div className="emergency-contact">
              <h4>Emergency Contact</h4>
              <div className="contact-info">
                <div className="contact-row">
                  <span className="label">Name:</span>
                  <span className="value">{contactInfo.name}</span>
                </div>
                <div className="contact-row">
                  <span className="label">Phone:</span>
                  <span className="value">{contactInfo.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="location-section">
          <h3>Location</h3>
          <div className="map-container">
            <img 
              src="https://via.placeholder.com/400x200.png?text=Location+Map" 
              alt="Emergency location map" 
              className="location-map"
            />
            <div className="location-marker">
              <span role="img" aria-label="Location marker">📍</span>
            </div>
            <button className="click-button">View Location</button>
          </div>
        </section>

        <section className="action-buttons">
          <button className="call-button" onClick={handleCall}>
            📞 Call
          </button>
          <button className="message-button" onClick={handleMessage}>
            💬 Message
          </button>
        </section>
      </main>
    </div>
  );
}

export default ContactPage;