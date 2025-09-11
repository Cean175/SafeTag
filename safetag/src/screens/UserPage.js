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
    navigate('/addstudent');
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