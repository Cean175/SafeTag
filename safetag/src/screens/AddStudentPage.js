import { useNavigate } from 'react-router-dom';
import '../css/UserPage.css';
import '../css/AddStudentPage.css';
import { useState } from "react";
// Assuming 'createStudent' and 'uploadFile' are properly exported from your supabaseClient file
import { createStudent, uploadFile } from '../lib/supabaseClient';

function AddStudentPage() {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    age: "",
    level: "",
    course: "", // Note: 'level' and 'course' are separate fields in the form but seem to be combined in the placeholder
    healthCondition: "", // This will hold the selected value or "Other"
    otherHealthCondition: "", // This will hold the text for "Other"
    treatmentNeeds: "",
    profileFile: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    setFormData({ ...formData, profileFile: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalHealthCondition = formData.healthCondition === "Other" ? formData.otherHealthCondition : formData.healthCondition;

      const payload = {
        student_id: formData.studentId,
        name: formData.name,
        age: formData.age ? parseInt(formData.age, 10) : null,
        student_lvl: formData.level,
        course: formData.course || null,
        health_condition: finalHealthCondition,
        treatment_needs: formData.treatmentNeeds || null,
      };

      if (formData.profileFile) {
        // Assuming your 'uploadFile' function handles the bucket and returns the public URL
        const publicUrl = await uploadFile(formData.profileFile, { bucket: 'avatars' });
        payload.profile_picture = publicUrl;
      }

      await createStudent(payload);
      alert("Student added successfully!");
      navigate('/students'); // Redirect to students list after success
    } catch (err) {
      console.error('Failed to create student:', err);
      alert("Failed to add student. Please check the console for details.");
      // The original code tried to use localStorage as a fallback.
      // This is generally not a good practice for a database-backed app,
      // as it creates data inconsistencies. It has been removed.
    }
  };

  return (
    <div className="user-page-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="branding">
            <h1 className="title">S.A.F.E</h1>
            <p className="subtitle">STUDENT ASSISTANCE FOR EMERGENCIES</p>
          </div>
          <nav className="nav-icons">
            <button className="nav-icon" onClick={() => handleNavigation('/home')}>
              <i className="fas fa-home"></i>
            </button>
            <button className="nav-icon active" onClick={() => handleNavigation('/user')}>
              <i className="fas fa-user"></i>
            </button>
            <button className="nav-icon" onClick={() => handleNavigation('/statistics')}>
              <i className="fas fa-chart-bar"></i>
            </button>
            <button className="nav-icon" onClick={() => handleNavigation('/contact')}>
              <i className="fas fa-phone"></i>
            </button>
            <button className="nav-icon" onClick={() => handleNavigation('/settings')}>
              <i className="fas fa-cog"></i>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content user-page-content">
        <form className="student-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Student Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="studentId"
              placeholder="Student Id"
              value={formData.studentId}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="number"
              name="age"
              placeholder="Student Age"
              value={formData.age}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="level"
              placeholder="Student Lvl & Course"
              value={formData.level}
              onChange={handleChange}
            />
          </div>

          {/* New form field for profile picture upload */}
          <div className="form-group">
            <label htmlFor="profileFile">Profile Picture</label>
            <input
              type="file"
              id="profileFile"
              name="profileFile"
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>

          {/* Health Condition Select */}
          <div className="form-group">
            <select
              name="healthCondition"
              value={formData.healthCondition}
              onChange={handleChange}
            >
              <option value="">Select Health Conditions</option>
              <option value="Asthma">Asthma</option>
              <option value="Diabetes">Diabetes</option>
              <option value="Heart Condition">Heart Condition</option>
              <option value="Lung Condition">Lung Condition</option>
              <option value="Pneumonia">Pneumonia</option>
              <option value="Stroke">Stroke</option>
              <option value="Epilepsy">Epilepsy</option>
              <option value="Gout">Gout</option>
              <option value="Skin Condition">Skin Condition</option>
              <option value="Tubercolosis">Tubercolosis</option>
              <option value="Migraine">Migraine</option>
              <option value="Hypertension">Hypertension</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Show input for specific condition if "Other" is selected */}
          {formData.healthCondition === "Other" && (
            <div className="form-group">
              <input
                type="text"
                name="otherHealthCondition"
                placeholder="Specify health condition"
                value={formData.otherHealthCondition}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <textarea
              name="treatmentNeeds"
              placeholder="Treatment/Needs"
              value={formData.treatmentNeeds}
              onChange={handleChange}
            />
          </div>
          
          <button type="submit" className="add-btn">ADD</button>
        </form>
      </main>
    </div>
  );
}

export default AddStudentPage;