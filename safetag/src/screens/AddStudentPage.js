import { useNavigate } from 'react-router-dom';
import '../css/UserPage.css';
import '../css/AddStudentPage.css';
import { useState, useEffect, useRef } from "react";
import { read, utils } from 'xlsx';
import { createStudent, uploadFile } from '../lib/supabaseClient';
import BrandLogos from '../components/BrandLogos';

function AddStudentPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const processExcelFile = async (file) => {
    if (!file) return;

    setIsImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        alert("No data found in the Excel file.");
        setIsImporting(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;
      let errors = [];

      for (const [index, originalRow] of jsonData.entries()) {
        const rowNumber = index + 2; // +1 for 0-index, +1 for header row
        
        // Normalize keys to lowercase for flexible matching
        const row = {};
        Object.keys(originalRow).forEach(key => {
          row[key.trim().toLowerCase()] = originalRow[key];
        });

        // Mapping: check various potential column names
        const studentIdRaw = String(row['student id'] || row['student_id'] || row['id'] || '');
        const name = row['name'] || row['fullname'] || row['full name'];
        const age = parseInt(row['age'], 10);
        const sex = row['sex'] || row['gender'];
        const level = row['level'] || row['grade'] || row['year_level'];
        const course = row['course'] || row['program'];
        const healthCondition = row['health condition'] || row['health_condition'] || row['health'];
        const treatmentNeeds = row['treatment needs'] || row['treatment_needs'] || row['treatment'];

        // Validate required fields
        const missingFields = [];
        if (!studentIdRaw) missingFields.push('Student ID');
        if (!name) missingFields.push('Name');
        if (!age) missingFields.push('Age');
        if (!sex) missingFields.push('Sex');
        if (!level) missingFields.push('Level');
        if (!course) missingFields.push('Course');
        if (!healthCondition) missingFields.push('Health Condition');
        if (!treatmentNeeds) missingFields.push('Treatment Needs');

        if (missingFields.length > 0) {
           const msg = `Row ${rowNumber} skipped: Missing ${missingFields.join(', ')}`;
           console.warn(msg, originalRow);
           if (errors.length < 5) errors.push(msg); // Limit reported errors
           errorCount++;
           continue;
        }

        const studentId = studentIdRaw.trim();
        
        if (studentId.length === 0) {
            const msg = `Row ${rowNumber} skipped: ID cannot be empty (found "${studentIdRaw}")`;
           console.warn(msg, originalRow);
           if (errors.length < 5) errors.push(msg);
           errorCount++;
           continue;
        }
        
        const payload = {
          student_id: studentId,
          name: name,
          age: age,
          sex: sex,
          level: level,
          course: course,
          health_condition: healthCondition,
          treatment_needs: treatmentNeeds,
        };

        try {
           await createStudent(payload);
           successCount++;
        } catch (err) {
           const msg = `Row ${rowNumber} failed to save: ${err.message || 'Unknown error'}`;
           console.error(msg, err);
           if (errors.length < 5) errors.push(msg);
           errorCount++;
        }
      }

      let message = `Import complete.\nSuccess: ${successCount}\nFailed: ${errorCount}`;
      if (errorCount > 0 && errors.length > 0) {
          message += "\n\nSample Errors:\n" + errors.join("\n");
          if (errorCount > errors.length) message += `\n...and ${errorCount - errors.length} more.`;
      }
      alert(message);
      
      // Refresh logic if needed, or stay on page to add more
      
    } catch (error) {
      console.error("Error processing Excel file:", error);
      alert("Error processing Excel file: " + error.message);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleExcelFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processExcelFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.type === "application/vnd.ms-excel" || file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
          processExcelFile(file);
      } else {
        alert("Please drop a valid Excel file (.xlsx or .xls)");
      }
    }
  };

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
    if (name === "student_id") {
      // Allow any alphanumeric ID
      setFormData({ ...formData, student_id: value });
    } else if (name === "age") {
      // Only allow positive digits, max 3 digits
      const cleaned = value.replace(/\D/g, "").slice(0, 3);
      setFormData({ ...formData, age: cleaned });
    } else {
      setFormData({ ...formData, [name]: value });
    }
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
    if (!formData.student_id || formData.student_id.trim() === '') {
      alert("Student ID is required.");
      return;
    }
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
      const code = err?.code;
      
      if (code === '23505' || msg.includes('duplicate key') || msg.includes('unique constraint')) {
        alert('❌ A student with this ID already exists. Please use a different Student ID.');
      } else if (msg.toLowerCase().includes('row-level security')) {
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
            <div className="title-row">
              <h1 className="title">S.A.F.E</h1>
              <BrandLogos />
            </div>
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
        
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleImportClick}
            style={{ 
                border: isDragging ? '2px dashed #4CAF50' : '2px dashed #ccc',
                borderRadius: '12px',
                padding: '30px',
                textAlign: 'center',
                backgroundColor: isDragging ? 'rgba(76, 175, 80, 0.1)' : '#f8f9fa',
                cursor: 'pointer',
                marginBottom: '20px',
                transition: 'all 0.2s ease',
                position: 'relative'
            }}
          >
              <input 
                  type="file" 
                  accept=".xlsx, .xls" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleExcelFileChange}
              />
              <div style={{ fontSize: '2.5rem', color: '#4CAF50', marginBottom: '15px' }}>
                <i className="fas fa-file-excel"></i>
              </div>
              <h3 style={{ margin: '0 0 5px', fontSize: '1.1rem', color: '#333' }}>
                {isImporting ? "Importing Data..." : "Drag & Drop Excel File"}
              </h3>
              <p style={{ margin: '0', fontSize: '0.9rem', color: '#666' }}>
                or <span style={{ color: '#4CAF50', textDecoration: 'underline' }}>browse to upload</span>
              </p>
               <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '15px', fontStyle: 'italic' }}>
                  Required columns: Student ID, Name, Age, Sex, Level, Course, Health Condition, Treatment Needs
              </div>
          </div>

          {/* Student Name */}
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Student Full Name"
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
              placeholder="Student ID "
              value={formData.student_id}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          {/* Student Age */}
          <div className="form-group">
            <input
              type="text"
              name="age"
              placeholder="Student Age"
              value={formData.age}
              onChange={handleChange}
              required
              disabled={isLoading}
              maxLength={2}
              pattern="\d+"
              title="Age must be a positive number"
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
            </select>
          </div>
          
          {/* Student Level */}
          <div className="form-group">
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              required
              disabled={isLoading}
            >
              <option value="" disabled>Select Student Level</option>
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