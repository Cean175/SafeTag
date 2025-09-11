import { useNavigate } from 'react-router-dom';
import '../css/UserPage.css';
import '../css/AddStudentPage.css';
import  { useState } from "react";


function AddStudentPage() {
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
  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    age: "",
    level: "",
    course: "",
    healthCondition: "",
    treatmentNeeds: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Get saved students
    const savedStudents = localStorage.getItem("students");
    const students = savedStudents ? JSON.parse(savedStudents) : [];

    // Add new student
    students.push(formData);

    // Save back to localStorage
    localStorage.setItem("students", JSON.stringify(students));

    // Redirect back to students page
    navigate("/students");
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
         <form className="student-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Student Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="studentId"
            placeholder="Student Id"
            value={formData.studentId}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            name="age"
            placeholder="Student Age"
            value={formData.age}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="level"
            placeholder="Student lvl/Course"
            value={formData.level}
            onChange={handleChange}
          />

          <select
            name="healthCondition"
            value={formData.healthCondition}
            onChange={handleChange}
          >
            <option value="">Health Conditions</option>
            <option value="Asthma">Asthma</option>
            <option value="Diabetes">Diabetes</option>
            <option value="Heart Condition">Heart Condition</option>
            <option value="None">None</option>
          </select>

          <textarea
            name="treatmentNeeds"
            placeholder="Treatment/Needs"
            value={formData.treatmentNeeds}
            onChange={handleChange}
          />

          <button type="submit" className="add-btn">ADD</button>
        </form>
      </main>
    </div>
  );
}

export default AddStudentPage;