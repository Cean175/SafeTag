import { useNavigate } from 'react-router-dom';
import '../css/UserPage.css';
import '../css/AddStudentPage.css';
import { useState, useEffect } from "react";
import { createStudent, uploadFile } from '../lib/supabaseClient';

function AddStudentPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const [formData, setFormData] = useState({
    name: "",
    student_id: "",
    age: "",
    sex: "",
    level: "",
    course: "",
    healthCondition: "",
    otherHealthCondition: "",
    treatmentNeeds: "",
  });

  // Profile picture (file upload) state
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      const objectUrl = URL.createObjectURL(file);
      setProfilePreview(objectUrl);
    } else {
      setProfilePictureFile(null);
      setProfilePreview("");
    }
  };

  // Revoke object URL when preview changes or component unmounts
  useEffect(() => {
    return () => {
      if (profilePreview) URL.revokeObjectURL(profilePreview);
    };
  }, [profilePreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Upload profile picture if provided
      let uploadedUrl = null;
      if (profilePictureFile) {
        try {
          console.log('Attempting to upload file:', profilePictureFile.name);
          uploadedUrl = await uploadFile(profilePictureFile, { bucket: 'avatars' });
          console.log('Upload successful! URL:', uploadedUrl);
        } catch (uploadErr) {
          console.error('Image upload failed:', uploadErr);
          const errorMsg = uploadErr?.message || String(uploadErr);
          if (errorMsg.includes('row-level security') || errorMsg.includes('policy')) {
            alert('⚠️ Storage upload blocked by security policy.\n\nPlease configure storage policies in Supabase:\n1. Go to Storage > avatars > Policies\n2. Add INSERT and SELECT policies\n\nSee SETUP_STORAGE_STEP_BY_STEP.md for detailed instructions.');
          } else if (errorMsg.includes('404') || errorMsg.includes('not found')) {
            alert('⚠️ Storage bucket "avatars" not found.\n\nPlease create the bucket in Supabase:\n1. Go to Storage\n2. Create bucket named "avatars"\n3. Make it public\n\nSee SETUP_STORAGE_STEP_BY_STEP.md for instructions.');
          } else {
            alert(`⚠️ Image upload failed: ${errorMsg}\n\nContinuing without profile picture.\nCheck console for details.`);
          }
          // continue without profile picture URL
          uploadedUrl = null;
        }
      }

      // This payload object's keys now match your actual database columns.
      const payload = {
        student_id: formData.student_id, // send the form's ID to the 'student_id' text column
        name: formData.name,
        age: formData.age ? parseInt(formData.age, 10) : null,
        sex: formData.sex,
        level: formData.level,
        course: formData.course,
        avatar_url: uploadedUrl,
        health_condition: formData.healthCondition === "Other" ? formData.otherHealthCondition : formData.healthCondition || null,
        treatment_needs: formData.treatmentNeeds || null,
      };

      await createStudent(payload);
      alert("Student added successfully!");
      navigate('/user'); // Or whichever page lists the students
    } catch (err) {
      console.error('Failed to create student:', err);
      const msg = typeof err?.message === 'string' ? err.message : String(err);
      if (msg.toLowerCase().includes('row-level security')) {
        alert('Action blocked by Supabase Row Level Security. Please enable insert/select policies for the students table and storage bucket. See console and README for details.');
      } else {
        alert("Failed to add student. Please check the console for details.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-student-container">
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
      <main className="main-content add-student-content">
        <form className="student-form" onSubmit={handleSubmit} encType="multipart/form-data" aria-label="Add student form">
          {/* Student Name */}
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Student Name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          {/* Student ID */}
          <div className="form-group">
            <input
              type="text"
              name="student_id"
              placeholder="Student Id"
              value={formData.student_id}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          {/* Student Age */}
          <div className="form-group">
            <input
              type="number"
              name="age"
              placeholder="Student Age"
              value={formData.age}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          {/* Student Sex */}
          <div className="form-group">
            <select
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              required
              disabled={isLoading}
            >
              <option value="">Select Sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          {/* Student Level */}
          <div className="form-group">
            <input
              type="text"
              name="level"
              placeholder="Student Level (e.g., 1st Year)"
              value={formData.level}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          
          {/* Student Course */}
          <div className="form-group">
            <input
              type="text"
              name="course"
              placeholder="Student Course (e.g., BSIT)"
              value={formData.course}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          {/* Profile Picture Upload (optional) */}
          <div className="form-group">
            <input
              type="file"
              name="profilePicture"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isLoading}
            />
          </div>

          {/* Preview when file selected */}
          {profilePreview && (
            <div className="form-group">
              <img
                className="profile-picture-preview"
                src={profilePreview}
                alt="Profile preview"
              />
            </div>
          )}

          {/* Health Condition Dropdown */}
          <div className="form-group">
            <select
              name="healthCondition"
              value={formData.healthCondition}
              onChange={handleChange}
              disabled={isLoading}
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

          {/* "Other" Health Condition Text Input */}
          {formData.healthCondition === "Other" && (
            <div className="form-group">
              <input
                type="text"
                name="otherHealthCondition"
                placeholder="Specify health condition"
                value={formData.otherHealthCondition}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
          )}

          {/* Treatment Needs Textarea */}
          <div className="form-group">
            <textarea
              name="treatmentNeeds"
              placeholder="Treatment/Needs"
              value={formData.treatmentNeeds}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          
          <button type="submit" className="add-btn" disabled={isLoading}>
            {isLoading ? "Adding..." : "ADD"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default AddStudentPage;