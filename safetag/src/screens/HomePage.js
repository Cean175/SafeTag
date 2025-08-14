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
            <div className="nav-icon" onClick={() => handleNavigation('/stats')}>
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
    <p className= "about"> This site is an emergency alert platform designed for DLSL students, instantly receiving </p>
    <p className= "about"> and responding to distress signals triggered through their personal SAFE Tags.</p>
  </div>
  <div className="soc-media">
    <div className="social-icons">
      <i className="fab fa-facebook-square"></i>
      <i className="fab fa-twitter-square"></i>
      <i className="fab fa-instagram-square"></i>
      <i className="fab fa-linkedin"></i>
    </div>
  </div>
</main>

    </div>
  );
}

export default Homepage;