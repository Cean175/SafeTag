import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/UserPage.css';



function UserPage() {
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
        <div className="action-buttons">
          <button className="action-btn emergency-btn" onClick={handleEmergencies}>
            Emergencies
          </button>
          
          <button className="action-btn students-btn" onClick={handleStudents}>
            Students
          </button>
          
          <button className="action-btn add-student-btn" onClick={handleAddStudent}>
            Add new student
          </button>
          
          <button className="action-btn documentations-btn" onClick={handleDocumentations}>
            Documentations
          </button>
        </div>
      </main>
    </div>
  );
}

export default UserPage;