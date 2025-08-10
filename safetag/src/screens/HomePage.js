import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function Homepage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
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
            <div className="nav-icon"><span>🏠</span></div>
            <div className="nav-icon"><span>👤</span></div>
            <div className="nav-icon"><span>📊</span></div>
            <div className="nav-icon"><span>📞</span></div>
            <div className="nav-icon"><span>⚙️</span></div>
          </div>
        </div>
      </header>

      <main className="main-content homepage-content">
  <div className="info-box">
    <div className="h2-box">
      <h2>Secure. Authenticate. Fast. Every Tag Matters.</h2>
    </div>
    <p>This site is an emergency alert platform designed for DLSL students, instantly receiving </p>
    <p>and responding to distress signals triggered through their personal SAFE Tags.</p>
  </div>
  <i className="fab fa-facebook-square"></i>
</main>

    </div>
  );
}

export default Homepage;