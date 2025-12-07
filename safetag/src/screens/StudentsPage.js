import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/StudentsPage.css';
import '../css/StudentsPageSearch.css';
import '../css/AddStudentPage.css';
import { fetchStudents } from '../lib/supabaseClient';
import BrandLogos from '../components/BrandLogos';

function StudentsPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  // const [filteredStudents, setFilteredStudents] = useState([]); // Removed state
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editPassword, setEditPassword] = useState('');
  const [editError, setEditError] = useState('');
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSex, setFilterSex] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterHealthCondition, setFilterHealthCondition] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    (async () => {
      try {
        const studentsData = await fetchStudents();
        setStudents(studentsData || []);
        // setFilteredStudents(studentsData || []); // Removed
        if (studentsData && studentsData.length > 0) {
          const first = studentsData[0];
          setSelectedStudentId(first.student_id || first.id);
        }
      } catch (err) {
        console.error('Failed to fetch students', err);
        const savedStudents = localStorage.getItem('students');
        if (savedStudents) {
          const studentsData = JSON.parse(savedStudents);
          setStudents(studentsData);
          // setFilteredStudents(studentsData); // Removed
          if (studentsData.length > 0) {
            const first = studentsData[0];
            setSelectedStudentId(first.student_id || first.id);
          }
        }
      }
    })();
  }, []);

  // Filter and sort logic
  const filteredStudents = React.useMemo(() => {
    let result = [...students];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(student => 
        (student.name || '').toLowerCase().includes(query) ||
        (student.student_id || student.id || student.studentId || '').toString().toLowerCase().includes(query) ||
        (student.course || '').toLowerCase().includes(query) ||
        (student.level || student.yearLevel || '').toLowerCase().includes(query)
      );
    }

    // Apply sex filter
    if (filterSex) {
      result = result.filter(student => 
        (student.sex || '').toLowerCase() === filterSex.toLowerCase()
      );
    }

    // Apply level filter
    if (filterLevel) {
      result = result.filter(student => 
        (student.level || student.yearLevel || '') === filterLevel
      );
    }

    // Apply health condition filter
    if (filterHealthCondition) {
      if (filterHealthCondition === 'none') {
        result = result.filter(student => 
          !student.health_condition || student.health_condition.toLowerCase() === 'none'
        );
      } else {
        result = result.filter(student => 
          (student.health_condition || '').toLowerCase().includes(filterHealthCondition.toLowerCase())
        );
      }
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue, bValue;

      switch(sortBy) {
        case 'name':
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
          break;
        case 'age':
          aValue = parseInt(a.age) || 0;
          bValue = parseInt(b.age) || 0;
          break;
        case 'id':
          aValue = (a.student_id || a.id || a.studentId || '').toString();
          bValue = (b.student_id || b.id || b.studentId || '').toString();
          break;
        case 'level':
          aValue = (a.level || a.yearLevel || '').toLowerCase();
          bValue = (b.level || b.yearLevel || '').toLowerCase();
          break;
        case 'course':
          aValue = (a.course || '').toLowerCase();
          bValue = (b.course || '').toLowerCase();
          break;
        default:
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return result;
  }, [searchQuery, filterSex, filterLevel, filterHealthCondition, sortBy, sortOrder, students]);

  // Selection logic
  useEffect(() => {
    if (filteredStudents.length > 0) {
      // If no selection or current selection not in filtered list, select first
      // Note: checking if selectedStudentId is in filteredStudents might be expensive for large lists, 
      // but for typical page sizes it's fine.
      const exists = filteredStudents.some(s => (s.student_id || s.id) === selectedStudentId);
      if (!selectedStudentId || !exists) {
        // Prefer student_id if available, else id
        const first = filteredStudents[0];
        setSelectedStudentId(first.student_id || first.id);
      }
    } else {
      setSelectedStudentId(null);
    }
  }, [filteredStudents, selectedStudentId]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Selection handled via dropdown; click handler removed to avoid unused warnings

  const handleAddStudent = () => {
    navigate('/addstudent');
  };

  const handleEditStudent = () => {
    setShowPasswordModal(true);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilterSex('');
    setFilterLevel('');
    setFilterHealthCondition('');
    setSortBy('name');
    setSortOrder('asc');
  };

  const selectedStudent = selectedStudentId 
    ? filteredStudents.find(s => (s.student_id || s.id) === selectedStudentId) 
    : null;

  return (
    <div className="students-page-container">
      <header className="header">
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

      <main className="main-content students-page-content">
        <div className="students-layout">
                <div className="student-profile-section">
                {selectedStudent ? (
                  <>
                    {showPasswordModal && (
                      <div className="modal-overlay">
                        <div className="modal-content">
                          <h3>Enter your password to edit</h3>
                          <input
                            type="password"
                            value={editPassword}
                            onChange={e => setEditPassword(e.target.value)}
                            placeholder="Password"
                            className="modal-input"
                          />
                          {editError && <div className="modal-error">{editError}</div>}
                          <div className="modal-actions">
                            <button
                              className="modal-confirm-btn"
                              onClick={() => {
                                const storedPassword = localStorage.getItem('password');
                                const validPassword = 'safetag123';
                                const isValid = (editPassword === storedPassword) || (editPassword === validPassword);
                                if (isValid) {
                                  setShowPasswordModal(false);
                                  setEditPassword('');
                                  setEditError('');
                                  if (selectedStudent) {
                                    const actualIndex = students.findIndex(s => s.id === selectedStudent.id);
                                    navigate(`/editstudent/${actualIndex}`);
                                  }
                                } else {
                                  setEditError('Incorrect password.');
                                }
                              }}
                            >Confirm</button>
                            <button
                              className="modal-cancel-btn"
                              onClick={() => {
                                setShowPasswordModal(false);
                                setEditPassword('');
                                setEditError('');
                              }}
                            >Cancel</button>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="profile-card">
                      <div className="profile-header-badge">DEMOGRAPHIC PROFILE</div>
                      <div className="profile-avatar-section">
                        <div className="avatar-edit-container">
                          {(selectedStudent.avatar_url || selectedStudent.profilePicture || selectedStudent.profile_picture) ? (
                            <img
                              src={selectedStudent.avatar_url || selectedStudent.profilePicture || selectedStudent.profile_picture}
                              alt={selectedStudent.name}
                              className="profile-avatar"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="profile-avatar default-avatar improved-avatar" style={{display: (selectedStudent.avatar_url || selectedStudent.profilePicture || selectedStudent.profile_picture) ? 'none' : 'flex'}}>
                            <i className="fas fa-user avatar-icon"></i>
                          </div>
                        </div>
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
                            {selectedStudent.treatment_needs || 'None'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="edit-profile-btn-container improved-edit-btn">
                      <button className="edit-profile-btn" onClick={handleEditStudent}>
                        <i className="fas fa-edit"></i> Edit Profile
                      </button>
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
                {/* Search Bar */}
                <div className="search-container">
                  <div className="search-box">
                    <i className="fas fa-search search-icon"></i>
                    <input
                      type="text"
                      placeholder="Search by name, ID, course, or level..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input"
                    />
                    {searchQuery && (
                      <button 
                        className="clear-search-btn"
                        onClick={() => setSearchQuery('')}
                        aria-label="Clear search"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                </div>

                {/* Filters Section */}
                <div className="filters-container">
                  <div className="filters-header">
                    <h3 className="filters-title">
                      <i className="fas fa-filter"></i> Filters
                    </h3>
                    <button 
                      className="clear-filters-btn"
                      onClick={clearAllFilters}
                    >
                      <i className="fas fa-redo"></i> Clear All
                    </button>
                  </div>

                  <div className="filters-grid">
                    {/* Sex Filter */}
                    <div className="filter-group">
                      <label className="filter-label">
                        <i className="fas fa-venus-mars"></i> Sex
                      </label>
                      <select
                        value={filterSex}
                        onChange={(e) => setFilterSex(e.target.value)}
                        className="filter-select"
                      >
                        <option value="">All</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>

                    {/* Level Filter */}
                    <div className="filter-group">
                      <label className="filter-label">
                        <i className="fas fa-graduation-cap"></i> Level
                      </label>
                      <select
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value)}
                        className="filter-select"
                      >
                        <option value="">All Levels</option>
                        <option value="Nursery">Nursery</option>
                        <option value="Kindergarten">Kindergarten</option>
                        <option value="Grade 1">Grade 1</option>
                        <option value="Grade 2">Grade 2</option>
                        <option value="Grade 3">Grade 3</option>
                        <option value="Grade 4">Grade 4</option>
                        <option value="Grade 5">Grade 5</option>
                        <option value="Grade 6">Grade 6</option>
                        <option value="Grade 7">Grade 7</option>
                        <option value="Grade 8">Grade 8</option>
                        <option value="Grade 9">Grade 9</option>
                        <option value="Grade 10">Grade 10</option>
                        <option value="Grade 11">Grade 11</option>
                        <option value="Grade 12">Grade 12</option>
                        <option value="1st Year College">1st Year College</option>
                        <option value="2nd Year College">2nd Year College</option>
                        <option value="3rd Year College">3rd Year College</option>
                        <option value="4th Year College">4th Year College</option>
                      </select>
                    </div>

                    {/* Health Condition Filter */}
                    <div className="filter-group">
                      <label className="filter-label">
                        <i className="fas fa-heartbeat"></i> Health Condition
                      </label>
                      <select
                        value={filterHealthCondition}
                        onChange={(e) => setFilterHealthCondition(e.target.value)}
                        className="filter-select"
                      >
                        <option value="">All Conditions</option>
                        <option value="none">None</option>
                        <option value="Asthma">Asthma</option>
                        <option value="Diabetes">Diabetes</option>
                        <option value="Heart">Heart Condition</option>
                        <option value="Lung">Lung Condition</option>
                        <option value="Pneumonia">Pneumonia</option>
                        <option value="Stroke">Stroke</option>
                        <option value="Epilepsy">Epilepsy</option>
                        <option value="Gout">Gout</option>
                        <option value="Skin">Skin Condition</option>
                        <option value="Tubercolosis">Tubercolosis</option>
                        <option value="Migraine">Migraine</option>
                        <option value="Hypertension">Hypertension</option>
                      </select>
                    </div>

                    {/* Sort By */}
                    <div className="filter-group">
                      <label className="filter-label">
                        <i className="fas fa-sort"></i> Sort By
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="filter-select"
                      >
                        <option value="name">Name</option>
                        <option value="age">Age</option>
                        <option value="id">Student ID</option>
                        <option value="level">Level</option>
                        <option value="course">Course</option>
                      </select>
                    </div>

                    {/* Sort Order */}
                    <div className="filter-group">
                      <label className="filter-label">
                        <i className="fas fa-sort-amount-down"></i> Order
                      </label>
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="filter-select"
                      >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                      </select>
                    </div>
                  </div>

                  <div className="results-count">
                    Showing {filteredStudents.length} of {students.length} student(s)
                  </div>
                </div>

                {/* Students Grid */}
                <div className="students-grid">
                  {filteredStudents.length === 0 ? (
                    <div className="no-results">
                      <i className="fas fa-search no-results-icon"></i>
                      <p>No students match your search criteria</p>
                      <button 
                        className="reset-filters-btn"
                        onClick={clearAllFilters}
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    filteredStudents.map((student, index) => (
                      <div
                        key={student.id || index}
                        className={`student-card ${(selectedStudentId === (student.student_id || student.id)) ? 'selected' : ''}`}
                        onClick={() => setSelectedStudentId(student.student_id || student.id)}
                      >
                        <div className="student-card-avatar">
                          {(student.avatar_url || student.profilePicture || student.profile_picture) ? (
                            <img
                              src={student.avatar_url || student.profilePicture || student.profile_picture}
                              alt={student.name}
                              className="card-avatar-img"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="card-avatar-placeholder" style={{display: (student.avatar_url || student.profilePicture || student.profile_picture) ? 'none' : 'flex'}}>
                            <i className="fas fa-user"></i>
                          </div>
                        </div>
                        <div className="student-card-info">
                          <h4 className="student-card-name">{student.name || 'N/A'}</h4>
                          <p className="student-card-id">ID: {student.student_id || student.id || student.studentId || 'N/A'}</p>
                          <p className="student-card-details">
                            {student.level || student.yearLevel || 'N/A'}
                            {student.course && ` - ${student.course}`}
                          </p>
                          <div className="student-card-tags">
                            <span className="tag tag-age">
                              <i className="fas fa-birthday-cake"></i> {student.age || 'N/A'}
                            </span>
                            <span className="tag tag-sex">
                              <i className={`fas fa-${student.sex === 'Male' ? 'mars' : student.sex === 'Female' ? 'venus' : 'genderless'}`}></i> {student.sex || 'N/A'}
                            </span>
                            {student.health_condition && student.health_condition.toLowerCase() !== 'none' && (
                              <span className="tag tag-health">
                                <i className="fas fa-heartbeat"></i> {student.health_condition}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default StudentsPage;