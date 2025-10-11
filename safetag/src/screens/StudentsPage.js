import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/StudentsPage.css';
import '../css/AddStudentPage.css';
import { fetchStudents } from '../lib/supabaseClient';

function StudentsPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(null);
  const [avatar, setAvatar] = useState(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const studentsData = await fetchStudents();
        setStudents(studentsData || []);
        if (studentsData && studentsData.length > 0) {
          setSelectedStudentIndex(0); // default to first student
        }
      } catch (err) {
        console.error('Failed to fetch students', err);
        const savedStudents = localStorage.getItem('students');
        if (savedStudents) {
          const studentsData = JSON.parse(savedStudents);
          setStudents(studentsData);
          if (studentsData.length > 0) {
            setSelectedStudentIndex(0);
          }
        }
      }
    })();
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleStudentClick = (index) => {
    setSelectedStudentIndex(index);
  };

  const handleAddStudent = () => {
    navigate('/addstudent');
  };

  const handleEditStudent = () => {
    if (selectedStudentIndex !== null) {
      navigate(`/editstudent/${selectedStudentIndex}`);
    }
  };

  const selectedStudent =
    selectedStudentIndex !== null ? students[selectedStudentIndex] : null;

  return (
    <div className="students-page-container">
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

      <main className="main-content students-page-content">
        <div className="students-layout">
                <div className="student-profile-section">
                {selectedStudent ? (
                  <>
                  <div className="profile-card">
                    <div className="profile-header-badge">DEMOGRAPHIC PROFILE</div>

                    <div className="profile-avatar-section">
                    {selectedStudent.profilePicture ? (
                      <img
                      src={selectedStudent.profilePicture}
                      alt={selectedStudent.name}
                      className="profile-avatar"
                      />
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
                      <div className="field-label">SEX</div>
                      <div className="field-value">{selectedStudent.sex || 'N/A'}</div>
                    </div>
                    <div className="profile-field">
                      <div className="field-label">ID</div>
                      <div className="field-value">
                      {selectedStudent.id || selectedStudent.studentId || 'N/A'}
                      </div>
                    </div>
                    <div className="profile-field">
                      <div className="field-label">STUDENT LVL/COURSE</div>
                      <div className="field-value">
                      {(selectedStudent.level || selectedStudent.yearLevel || '') +
                        (selectedStudent.course ? ' - ' + selectedStudent.course : '') ||
                        'N/A'}
                      </div>
                    </div>
                    </div>

                    <div className="health-section">
                    <div className="health-field">
                      <div className="health-label">Health condition</div>
                      <div className="health-value">
                      {selectedStudent.health_condition || 'None'}
                      </div>
                    </div>
                    </div>

                    <div className="treatment-section">
                    <div className="treatment-field">
                      <div className="treatment-label">Treatment/Needs</div>
                      <div className="treatment-value">
                      {selectedStudent.treatment_needs ||
                        'None'}
                      </div>
                    </div>
                    </div>
                  </div>
                  </>
                ) : (
                  <div className="no-selection">
                  <div className="student-tab">SELECT A STUDENT</div>
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

                {/* Student List Section */}
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
                <label htmlFor="student-select" className="sr-only">Select student</label>
                <select
                  id="student-select"
                  value={selectedStudentIndex ?? ''}
                  onChange={(e) => setSelectedStudentIndex(e.target.value === '' ? null : Number(e.target.value))}
                  className="student-dropdown"
                >
                  <option value="">-- Select a student --</option>
                  {students.map((student, index) => (
                    <option key={student.id || index} value={index}>
                      {student.name ? `${student.name} — ${student.student_id || student.id || index + 1}` : `Student ${index + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default StudentsPage;