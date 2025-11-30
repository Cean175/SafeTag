import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/HomePage.css';
import AlertMonitor from './AlertMonitor'; // keep import, it’s fine
import BrandLogos from '../components/BrandLogos';

function Homepage() {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="homepage-container">
      {/* ✅ Make sure header stays on top */}
      <header className="header navbar">
        <div className="header-content">
          <div className="branding">
            <div className="title-row">
              <h1 className="title">S.A.F.E</h1>
              <BrandLogos />
            </div>
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

      {/* ✅ Add the AlertMonitor here so it runs but doesn’t cover anything */}
      <AlertMonitor />

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

          <div className="contact">
            <h4>| Contact Us |</h4>
          </div>
          <div className="social-buttons">
            <a
              href="https://web.facebook.com/dlsl.isseso"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn"
            >
              <i className="fab fa-facebook-f"></i>
            </a>
            <a
              href="mailto:isesso@dlsl.edu.ph"
              className="social-btn"
            >
              <i className="fas fa-envelope"></i>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Homepage;
