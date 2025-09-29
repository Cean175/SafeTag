import React, { useState } from 'react';
import { supabase, fetchStudents } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../css/Documentations.css';

function Documentations() {
    const navigate = useNavigate();

    // --- NEW CONSTANTS FOR YEAR VALIDATION ---
    const CURRENT_YEAR = new Date().getFullYear(); // This will be 2025
    const LAST_YEAR = CURRENT_YEAR - 1; // This will be 2024
    // ------------------------------------------

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

    // Input change with year validation
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'date' && value) {
            const dateYear = new Date(value).getFullYear();
            if (dateYear !== CURRENT_YEAR && dateYear !== LAST_YEAR) {
                setErrorMessage(`⚠️ Incident date must be in the year ${LAST_YEAR} or ${CURRENT_YEAR}.`);
                return;
            } else {
                setErrorMessage(''); // Clear error if validation passes
            }
        }
        
        setForm({ ...form, [name]: value });
    };

    // Submit handler with validation
    const handleSubmit = async () => {
        // --- NEW: YEAR VALIDATION BEFORE SUBMISSION ---
        if (form.date) {
            const dateYear = new Date(form.date).getFullYear();
            if (dateYear !== CURRENT_YEAR && dateYear !== LAST_YEAR) {
                setErrorMessage(`⚠️ Incident date must be in the year ${LAST_YEAR} or ${CURRENT_YEAR}.`);
                return;
            }
        }
        // ----------------------------------------------

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

    // Password state for "View All"
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Example password (replace with secure method in production)
    const VIEW_ALL_PASSWORD = 'safetag123';

    const handleViewAllClick = () => {
        setShowPasswordPrompt(true);
        setPasswordInput('');
        setPasswordError('');
    };

    const handlePasswordConfirm = () => {
        if (passwordInput === VIEW_ALL_PASSWORD) {
            setShowPasswordPrompt(false);
            setPasswordError('');
            goToList();
        } else {
            setPasswordError('Incorrect password.');
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

            <main className="main-content user-page-content">
                <h2 className="doc-title">DOCUMENTATION</h2>
                
                {/* NEW WRAPPER for horizontal layout */}
                <div className="doc-layout-wrapper" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

                    {/* Original Documentation Card (Left Side) */}
                    <div className="doc-card" style={{ flex: '2', minWidth: '400px' }}> {/* Add flex property to control size */}
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

                        <div className="input-row">
                            <select name="student_select" value={selectedStudentUuid} onChange={handleStudentSelect}>
                                <option value="">Select a Student</option>
                                {students.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name} — {s.student_id}</option>
                                ))}
                                <option value="__other__">Other / Manual entry</option>
                            </select>

                            {/* Show manual name input if "Other / Manual entry" is selected */}
                            {selectedStudentUuid === "__other__" && (
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Student Name"
                                    value={form.name}
                                    onChange={handleChange}
                                />
                            )}

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

                        {/* Action buttons at the bottom */}
                        <div className="action-buttons-container">
                            <button className="confirm-btn" onClick={handleSubmit}>SAVE</button>
                            <button className="confirm-btn" onClick={handleViewAllClick}>View All</button>
                        </div>
                    </div>
                    {/* End of Original Documentation Card */}
                    
                    {/* Password Prompt (Right Side) */}
                    {showPasswordPrompt && (
                        // Use inline styles to make this look like a card next to the form
                        <div className="password-prompt-sidebar" style={{
                            flex: '1', // Takes remaining space
                            padding: '20px',
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                            marginTop: '480px',
                            minWidth: '250px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '15px',
                        }}>
                            <h4>Enter Password to View All</h4>
                            <input
                                type="password"
                                value={passwordInput}
                                onChange={e => setPasswordInput(e.target.value)}
                                placeholder="Password"
                                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handlePasswordConfirm();
                                    }}
                                }
                            />
                            {passwordError && <div className="error-message" style={{ color: 'red', fontSize: '12px' }}>{passwordError}</div>}
                            <div className="modal-actions" style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "12px",
                            }}>
                                <button
                                    style={{
                                        padding: "8px 20px",
                                        background: "#007bff",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        fontWeight: "bold"
                                    }}
                                    onClick={handlePasswordConfirm}
                                >
                                    Confirm
                                </button>
                                <button
                                    style={{
                                        padding: "8px 20px",
                                        background: "#f5f5f5",
                                        color: "#333",
                                        border: "1px solid #ccc",
                                        borderRadius: "4px",
                                        cursor: "pointer"
                                    }}
                                    onClick={() => setShowPasswordPrompt(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                    {/* End of Password Prompt */}
                </div>
            </main>
        </div>
    );
}

export default Documentations;