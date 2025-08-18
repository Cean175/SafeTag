import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Documentations.css';

function Documentations() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    id: '',
    age: '',
    level: '',
    date: '',
    time: '',
    location: '',
    status: 'Hospitalized'
  });

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    console.log("Form submitted:", form);
    alert("Documentation submitted!");
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
        <p className="doc-note">Click button if accomplished</p>

        <div className="doc-card">
          <h3 className="section-title">DEMOGRAPHIC PROFILE</h3>

          {/* Avatar */}
          <div className="avatar-section">
            <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Student Avatar" className="avatar"/>
          </div>

          {/* Inputs */}
          <div className="input-row">
            <input type="text" name="name" placeholder="NAME" value={form.name} onChange={handleChange}/>
            <input type="text" name="id" placeholder="ID" value={form.id} onChange={handleChange}/>
          </div>

          <div className="input-row">
            <input type="text" name="age" placeholder="AGE" value={form.age} onChange={handleChange}/>
            <input type="text" name="level" placeholder="STUDENT LVL/COURSE" value={form.level} onChange={handleChange}/>
          </div>

          <input type="date" name="date" value={form.date} onChange={handleChange}/>
          <input type="time" name="time" value={form.time} onChange={handleChange}/>
          <input type="text" name="location" placeholder="Student location (Building, floor, room)" value={form.location} onChange={handleChange}/>

          {/* Dropdown */}
          <select name="status" value={form.status} onChange={handleChange}>
            <option>Hospitalized</option>
            <option>Clinic</option>
            <option>Treatment only</option>
            <option>Others</option>
          </select>

          {/* Confirm button */}
          <button className="confirm-btn" onClick={handleSubmit}>CONFIRM</button>
        </div>
      </main>
    </div>
  );
}

export default Documentations;
