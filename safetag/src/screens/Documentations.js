import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Documentations.css';

function Documentations() {
  const navigate = useNavigate();

  // Default form values
  const initialFormState = {
    name: '',
    id: '',
    age: '',
    level: '',
    date: '',
    time: '',
    location: '',
    status: 'Action Done',
    medcondition: '',
    description: '',
  };

  // Form state
  const [form, setForm] = useState(initialFormState);

  // Error message state
  const [errorMessage, setErrorMessage] = useState('');

  // Avatar state
  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
  const [avatar, setAvatar] = useState(defaultAvatar);

  // Navigation
  const handleNavigation = (path) => {
    navigate(path);
  };

  // Input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit handler with validation
  const handleSubmit = () => {
    if (
      !form.name ||
      !form.id ||
      !form.age ||
      !form.level ||
      !form.date ||
      !form.time ||
      !form.location ||
      form.status === 'Action Done' ||
      !form.medcondition ||
      !form.description
    ) {
      setErrorMessage('⚠️ Please fill up all needed information.');
      return;
    }

    console.log("Form submitted:", form);
    alert("Documentation submitted!");
    setErrorMessage('');

    // 🔄 Reset form and avatar after submit
    setForm(initialFormState);
    setAvatar(defaultAvatar);
  };

  // Handle avatar upload
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result); // Preview uploaded image
      };
      reader.readAsDataURL(file);
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

      {/* Main content */}
      <main className="main-content user-page-content">
        <h2 className="doc-title">DOCUMENTATION</h2>
        <div className="doc-card">
          <h3 className="section-title">DEMOGRAPHIC PROFILE</h3>

          {/* Error Message */}
          {errorMessage && (
            <div className="error-message">{errorMessage}</div>
          )}

          {/* Avatar */}
          <div className="avatar-section">
            <label htmlFor="avatarUpload">
              <img
                src={avatar}
                alt="Student Avatar"
                className="avatar"
                style={{ cursor: "pointer" }}
              />
            </label>
            <input
              type="file"
              id="avatarUpload"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />
          </div>

          {/* Inputs */}
          <div className="input-row">
            <input type="text" name="name" placeholder="NAME" value={form.name} onChange={handleChange}/>
            <input type="text" name="id" placeholder="STUDENT ID" value={form.id} onChange={handleChange}/>
          </div>

          <div className="input-row">
            <input type="text" name="age" placeholder="AGE" value={form.age} onChange={handleChange}/>
            <input type="text" name="level" placeholder="STUDENT LVL" value={form.level} onChange={handleChange}/>
          </div>

          <input type="date" name="date" value={form.date} onChange={handleChange}/>
          <input type="time" name="time" value={form.time} onChange={handleChange}/>
          <input type="text" name="location" placeholder="Student location (Building, floor, room)" value={form.location} onChange={handleChange}/>

          {/* Dropdown */}
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="Action Done" disabled style={{ color: "gray" }}>
              Action Done
            </option>
            <option>Hospitalized</option>
            <option>Clinic</option>
            <option>Treatment only</option>
            <option>Others</option>
          </select>

          <input type="text" name="medcondition" placeholder="Medical Condition" value={form.medcondition} onChange={handleChange}/>
          <input type="text" name="description" placeholder="Description of the Incident" value={form.description} onChange={handleChange}/>

          {/* Confirm button */}
          <button className="confirm-btn" onClick={handleSubmit}>SAVE</button>
        </div>
      </main>
    </div>
  );
}

export default Documentations;
