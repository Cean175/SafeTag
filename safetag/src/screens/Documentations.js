import React, { useState } from 'react';
import { supabase, fetchStudents } from '../lib/supabaseClient';
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
  const [students, setStudents] = useState([]);
  const [selectedStudentUuid, setSelectedStudentUuid] = useState('');

  // Navigation
  const handleNavigation = (path) => {
    navigate(path);
  };

  // Go to documentation list
  const goToList = () => {
    navigate('/documentations-list');
  };

  // Input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit handler with validation
  const handleSubmit = async () => {
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

    let avatar_url = avatar;
    // If avatar is a data URL (newly uploaded), upload to Supabase Storage
    if (avatar && avatar.startsWith('data:')) {
      try {
        const fileName = `${form.id}_${Date.now()}.png`;
        const res = await fetch(avatar);
        const blob = await res.blob();
        const { data, error } = await supabase.storage.from('avatars').upload(fileName, blob, { upsert: true });
        if (error) throw error;
        const { publicURL } = supabase.storage.from('avatars').getPublicUrl(fileName);
        avatar_url = publicURL;
      } catch (err) {
        setErrorMessage('Failed to upload avatar.');
        return;
      }
    }

    // Insert into Supabase
    const { error } = await supabase.from('documentations').insert([
      {
        student_name: form.name,
        student_id: form.id,
        age: parseInt(form.age, 10),
        student_lvl: form.level,
        incident_date: form.date,
        incident_time: form.time,
        location: form.location,
        status: form.status,
        medical_condition: form.medcondition,
        description: form.description,
        avatar_url: avatar_url,
      },
    ]);
    if (error) {
      setErrorMessage('Failed to submit documentation.');
      return;
    }

    alert('Documentation submitted!');
    setErrorMessage('');
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

  // Load students for dropdown
  React.useEffect(() => {
    (async () => {
      try {
        const data = await fetchStudents();
        setStudents(data || []);
      } catch (err) {
        console.error('Failed to load students', err);
      }
    })();
  }, []);

  const handleStudentSelect = (e) => {
    const uuid = e.target.value;
    setSelectedStudentUuid(uuid);
    if (!uuid || uuid === '__other__') {
      // allow manual entry
      setForm({ ...form, name: '', id: '' });
      setAvatar(defaultAvatar);
      return;
    }
    const student = students.find((s) => s.id === uuid);
    if (student) {
      setForm({
        ...form,
        name: student.name || '',
        id: student.student_id || '',
        age: student.age ? String(student.age) : '',
        level: student.level || '',
      });
      setAvatar(student.profile_picture || defaultAvatar);
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

      {}
      <main className="main-content user-page-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="doc-title">DOCUMENTATION</h2>
          <button className="confirm-btn" onClick={goToList}>View All</button>
        </div>
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
            <select name="student_select" value={selectedStudentUuid} onChange={handleStudentSelect}>
              <option value="">Select a Student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name} — {s.student_id}</option>
              ))}
              <option value="__other__">Other / Manual entry</option>
            </select>

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
