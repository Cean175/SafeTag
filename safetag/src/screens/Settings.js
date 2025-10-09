import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Settings.css';

function Settings() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // You can also clear auth/session storage here if needed
    navigate('/');
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

          {/* Nav Icons */}
          <div className="nav-icons">
            <div className="nav-icon" onClick={() => handleNavigation('/home')}>
              <span>🏠</span>
            </div>
            <div className="nav-icon" onClick={() => handleNavigation('/user')}>
              <span>👤</span>
            </div>
            <div className="nav-icon" onClick={() => handleNavigation('/statistics')}>
              <span>📊</span>
            </div>
            <div className="nav-icon" onClick={() => handleNavigation('/contact')}>
              <span>📞</span>
            </div>
            <div className="nav-icon active" onClick={() => handleNavigation('/settings')}>
              <span>⚙️</span>
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
