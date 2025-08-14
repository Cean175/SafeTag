import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/StudentsPage.css';

function StudentsPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);


  useEffect(() => {
    const savedStudents = localStorage.getItem('students');
    if (savedStudents) {
      const studentsData = JSON.parse(savedStudents);
      setStudents(studentsData);
      
      if (studentsData.length > 0) {
        setSelectedStudent({ ...studentsData[0], index: 0 });
      }
    }
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleStudentClick = (student, index) => {
    const studentWithIndex = { ...student, index };
    setSelectedStudent(studentWithIndex);
  };

  const handleAddStudent = () => {
    navigate('/addstudent');
  };

  const handleEditStudent = () => {
    if (selectedStudent) {
      navigate(`/editstudent/${selectedStudent.index}`);
    }
  };

  return (
    <div className="students-page-container">
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

      <main className="main-content students-page-content">
        <div className="students-layout">
         
          <div className="student-profile-section">
            {selectedStudent ? (
              <>
              
                <div className="student-tab">
                  STUDENT {selectedStudent.index + 1}
                </div>

               
                <div className="profile-card">
                  <div className="profile-header-badge">
                    DEMOGRAPHIC PROFILE
                  </div>

                  <div className="profile-avatar-section">
                    {selectedStudent.profilePicture ? (
                      <img src={selectedStudent.profilePicture} alt={selectedStudent.name} className="profile-avatar" />
                    ) : (
                      <div className="profile-avatar default-avatar">
                        <div className="avatar-icon">👤</div>
                      </div>
                    )}
                  </div>

                  <div className="profile-details-grid">
                    <div className="profile-field">
                      <div className="field-label">NAME</div>
                      <div className="field-value">{selectedStudent.name || 'N/A'}</div>
                    </div>
                    <div className="profile-field">
                      <div className="field-label">AGE</div>
                      <div className="field-value">{selectedStudent.age || 'N/A'}</div>
                    </div>
                    <div className="profile-field">
                      <div className="field-label">ID</div>
                      <div className="field-value">{selectedStudent.id || selectedStudent.studentId || 'N/A'}</div>
                    </div>
                    <div className="profile-field">
                      <div className="field-label">STUDENT LVL/COURSE</div>
                      <div className="field-value">{(selectedStudent.level || selectedStudent.yearLevel || '') + (selectedStudent.course ? ' - ' + selectedStudent.course : '') || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="health-section">
                    <div className="health-field">
                      <div className="health-label">Health condition</div>
                      <div className="health-value">{selectedStudent.healthCondition || 'None'}</div>
                    </div>
                  </div>

                  <div className="treatment-section">
                    <div className="treatment-field">
                      <div className="treatment-value">{selectedStudent.treatmentNeeds || selectedStudent.treatment || 'Treatment/needs'}</div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="no-selection">
                <div className="student-tab">
                  SELECT A STUDENT
                </div>
                <div className="profile-card empty-card">
                  <div className="empty-message">
                    <p>No student selected</p>
                    <button className="add-student-btn" onClick={handleAddStudent}>
                      Add New Student
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

     
          <div className="students-list-section">
            {students.length === 0 ? (
              <div className="no-students-message">
                <div className="empty-list-card">
                  <p>No students added yet</p>
                  <button className="add-first-student-btn" onClick={handleAddStudent}>
                    Add Your First Student
                  </button>
                </div>
              </div>
            ) : (
              <div className="students-list">
                {students.map((student, index) => (
                  <div 
                    key={student.id || index} 
                    className={`student-list-item ${selectedStudent && selectedStudent.index === index ? 'selected' : ''}`}
                    onClick={() => handleStudentClick(student, index)}
                  >
                    Student {index + 1}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default StudentsPage;