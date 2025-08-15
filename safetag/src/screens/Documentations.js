import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Documentations.css';


function Documentations() {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleEmergencies = () => {
    navigate('/emergencies');
  };

  const handleStudents = () => {
    navigate('/students');
  };

  const handleAddStudent = () => {
    navigate('/add-student');
  };

  const handleDocumentations = () => {
    navigate('/documentations');
  };

  return (
    <div className="user-page-container">
      <header className="header">
        <div className="header-content">
          <div className="branding">
            <h1 className="title">S.A.F.E</h1>
            <p className="subtitle">STUDENT ASSISTANCE FOR EMERGENCIES</p>
          </div>

          <div className="nav-icons">
            <div className="nav-icon" onClick={() => handleNavigation('/home')}>
              <span>🏠</span>
            </div>
            <div className="nav-icon active" onClick={() => handleNavigation('/user')}>
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

          <main className="main-content user-page-content">
       <div className="documentation-content">
          <p className="about">
            This site is an emergency alert platform designed for DLSL students, instantly receiving
          </p>
        </div>
      </main>
    </div>


  );
}

export default Documentations;