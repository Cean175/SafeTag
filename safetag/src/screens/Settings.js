import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

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
            <div className="nav-icon" onClick={() => handleNavigation('/stats')}>
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
      <main className="main-content settings-content">
        <h2 className="settings-title">⚙️ Settings</h2>
        <div className="settings-card">
          <p className="settings-description">Manage your account and preferences here.</p>

          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </main>
    </div>
  );
}

export default Settings;
