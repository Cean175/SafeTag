import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function Homepage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="homepage-container">
      <header className="header">
        <div className="header-content">
          <div className="branding">
            <h1 className="title">S.A.F.E</h1>
            <p className="subtitle">STUDENT ASSISTANCE FOR EMERGENCIES</p>
          </div>

          <div className="nav-icons">
            <div className="nav-icon active" onClick={() => handleNavigation('/home')}>
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
            <div className="nav-icon" onClick={() => handleNavigation('/settings')}>
              <span>⚙️</span>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content homepage-content">
        <div className="info-box">
          <div className="h2-box">
            <h2>Secure. Authenticate. Fast. Every Tag Matters.</h2>
          </div>
          <div className="about">
            This site is an emergency alert platform designed for DLSL students, instantly receiving
          </div>
          <div className="about">
            and responding to distress signals triggered through their personal SAFE Tags.
          </div>

          {/* Social Links as Buttons */}
          <div className="social-buttons">
            <a
              href="https://web.facebook.com/dlsl.isseso" // example FB link
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn"
            >
              Facebook
            </a>
            <a
              href="mailto:isesso@dlsl.edu.ph"
              className="social-btn"
            >
              Email
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Homepage;
