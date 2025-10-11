import React, { useState, useEffect } from 'react';
import { supabase, fetchStudents } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../css/Documentations.css';

function Documentations() {
    const navigate = useNavigate();

    // --- CONSTANTS FOR YEAR VALIDATION ---
    const CURRENT_YEAR = new Date().getFullYear();
    const LAST_YEAR = CURRENT_YEAR - 1;
    // ------------------------------------------

    // Default form values
    const initialFormState = {
        name: '',
        id: '',
        age: '',
        sex: '',
        level: '',
        date: '',
        time: '',
        location: '',
        status: '',
        medcondition: '',
        otherMedCondition: '', // Added state for the "Other" condition
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

    // Go to documentation list with security
    const goToList = () => {
        // Use replace: true to prevent going back to this page from the list
        navigate('/documentations-list', { replace: true });
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
                setErrorMessage('');
            }
        }
        
        setForm({ ...form, [name]: value });
    };

    // Submit handler with validation
    const handleSubmit = async () => {
        if (form.date) {
            const dateYear = new Date(form.date).getFullYear();
            if (dateYear !== CURRENT_YEAR && dateYear !== LAST_YEAR) {
                setErrorMessage(`⚠️ Incident date must be in the year ${LAST_YEAR} or ${CURRENT_YEAR}.`);
                return;
            }
        }

        if (
            !form.name ||
            !form.id ||
            !form.age ||
            !form.level ||
            !form.date ||
            !form.time ||
            !form.location ||
            !form.status ||
            !form.medcondition ||
            (form.medcondition === 'Other' && !form.otherMedCondition) ||
            !form.description
        ) {
            setErrorMessage('⚠️ Please fill up all needed information.');
            return;
        }

        // Determine avatar_url: if the avatar is a URL (from selected student), use it; otherwise keep null
        let avatar_url = null;
        if (avatar && typeof avatar === 'string' && !avatar.startsWith('data:') && avatar !== defaultAvatar) {
            avatar_url = avatar;
        }

        const medicalConditionForDb = form.medcondition === 'Other'
            ? form.otherMedCondition
            : form.medcondition;

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
                medical_condition: medicalConditionForDb,
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

    // Avatar is read-only on this form (taken from selected student)

    // Load students for dropdown
    useEffect(() => {
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
                sex: student.sex || '',
                level: student.level || '',
            });
            // student.profile_picture may be an array or string
            const pic = Array.isArray(student.profile_picture) ? (student.profile_picture[0] || null) : student.profile_picture;
            setAvatar(pic || defaultAvatar);
        }
    };

    // Password state for "View All"
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [passwordError, setPasswordError] = useState('');

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
            sessionStorage.setItem('isAuthenticatedToList', 'true');
            goToList();
        } else {
            setPasswordError('Incorrect password.');
        }
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
                <h2 className="doc-title">DOCUMENTATION</h2>
                
                <div className="doc-layout-wrapper" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    <div className="doc-card" style={{ flex: '2', minWidth: '400px' }}>
                        <h3 className="section-title">DEMOGRAPHIC PROFILE</h3>

                        {errorMessage && (<div className="error-message">{errorMessage}</div>)}

                        <div className="avatar-section">
                            <img
                                src={avatar}
                                alt="Student Avatar"
                                className="avatar"
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
                            <select name="sex" value={form.sex} onChange={handleChange}>
                                <option value="">Select Sex</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            {form.sex === 'Other' && (
                                <input type="text" name="sex" placeholder="Specify sex" value={form.sex} onChange={handleChange} />
                            )}
                            <input type="text" name="level" placeholder="STUDENT LVL" value={form.level} onChange={handleChange}/>
                        </div>

                        <input type="date" name="date" value={form.date} onChange={handleChange}/>
                        <input type="time" name="time" value={form.time} onChange={handleChange}/>
                        <input type="text" name="location" placeholder="Student location (Building, floor, room)" value={form.location} onChange={handleChange}/>

                        <div className="input-row">
                            <select name="status" value={form.status} onChange={handleChange}>
                                <option value="" disabled>Select Action</option>
                                <option>Hospitalized</option>
                                <option>Clinic</option>
                                <option>Treatment only</option>
                                <option>Others</option>
                            </select>
                            <select name="medcondition" value={form.medcondition} onChange={handleChange}>
                                <option value="" disabled>Select Medical Condition</option>
                                <option>Asthma</option>
                                <option>Diabetes</option>
                                <option>Heart Condition</option>
                                <option>Lung Condition</option>
                                <option>Pneumonia</option>
                                <option>Stroke</option>
                                <option>Epilepsy</option>
                                <option>Gout</option>
                                <option>Skin Condition</option>
                                <option>Tubercolosis</option>
                                <option>Migraine</option>
                                <option>Hypertension</option>
                                <option>Other</option>
                            </select>
                        </div>
                        
                        {form.medcondition === "Other" && (
                             <input
                                type="text"
                                name="otherMedCondition"
                                placeholder="Specify health condition"
                                value={form.otherMedCondition}
                                onChange={handleChange}
                                required
                            />
                        )}
                        
                        <input type="text" name="description" placeholder="Description of the Incident" value={form.description} onChange={handleChange}/>

                        <div className="action-buttons-container">
                            <button className="confirm-btn" onClick={handleSubmit}>SAVE</button>
                            <button className="confirm-btn" onClick={handleViewAllClick}>View All</button>
                        </div>
                    </div>

                    {showPasswordPrompt && (
                        <div className="password-prompt-sidebar" style={{
                            flex: '1',
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
                                    }
                                }}
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
                </div>
            </main>
        </div>
    );
}

export default Documentations;