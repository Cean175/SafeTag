import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/EmergencyPage.css';



function EmergencyPage() {
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
    <div className="emergency-page-container">
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

      <main className="emergency-title">
        <div className="Emergency-List">
          <h1>Emergencies</h1>
        </div>
      </main>
    </div>
  );
}

export default EmergencyPage;