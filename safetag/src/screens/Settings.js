import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Settings.css';

function Settings() {
  const navigate = useNavigate();

const handleLogout = () => {
  const confirmLogout = window.confirm("Are you sure you want to log out?");
  if (confirmLogout) {
    localStorage.removeItem('isLoggedIn'); // ✅ clear login session
    navigate('/');
  }
};

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="settings-container">
      {/* Header */}
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

      {/* Main Settings Content */}
      <main className="settings-content">
        <div className="settings-card">
          <p className="settings-description">Are you sure you want to log-out?</p>

          <button className="logout-btn" onClick={handleLogout}>
            Log-out
          </button>
        </div>
      </main>
    </div>
  );
}

export default Settings;
