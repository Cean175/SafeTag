import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/ContactPage.css';
import BrandLogos from '../components/BrandLogos';

function PolicyInstructions() {
  const navigate = useNavigate();

  const handleNavigation = (path) => navigate(path);

  return (
    <div className="settings-container">
      {/* Reuse header styling for consistency */}
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
            <div className="nav-icon" onClick={() => handleNavigation('/home')}><i className="fas fa-home" /></div>
            <div className="nav-icon" onClick={() => handleNavigation('/user')}><i className="fas fa-user" /></div>
            <div className="nav-icon" onClick={() => handleNavigation('/statistics')}><i className="fas fa-chart-bar" /></div>
            <div className="nav-icon" onClick={() => handleNavigation('/contact')}><i className="fas fa-phone" /></div>
            <div className="nav-icon" onClick={() => handleNavigation('/settings')}><i className="fas fa-cog" /></div>
          </div>
        </div>
      </header>
      <main className="main-content" style={{marginTop:'40px'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <section style={sectionStyle}>
            <h2 style={h2Style}>Website Policy</h2>
            <ul style={ulStyle}>
              <li><strong>Privacy:</strong> Only necessary student and documentation data are stored; processed under applicable privacy principles.</li>
              <li><strong>Access:</strong> Authorized users only. Demo password <code>safetag123</code> must be changed for production use.</li>
              <li><strong>Data Handling:</strong> Avatars reside in the <code>avatars</code> bucket. Avoid sensitive or inappropriate uploads.</li>
              <li><strong>Content:</strong> Prohibited: harmful, hateful, violent, or explicit content.</li>
              <li><strong>Security:</strong> Each <code>student_id</code> must be unique. Duplicate IDs are rejected.</li>
            </ul>
          </section>
          <section style={sectionStyle}>
            <h2 style={h2Style}>Usage Instructions</h2>
            <ul style={ulStyle}>
              <li><strong>Login:</strong> Authenticate with your credentials. Demo accounts use <code>safetag123</code>.</li>
              <li><strong>Students Page:</strong> Create and manage profiles. Supported image types: jpg, jpeg, png, gif, webp, svg, bmp, ico.</li>
              <li><strong>Documentations List:</strong> Filter by Status/Action & Medical Condition; sort by date, name, level, age, status, condition.</li>
              <li><strong>Emergency Module:</strong> Active emergencies display details; mark resolved via confirmation dialog.</li>
              <li><strong>Uploads:</strong> MIME type auto-detected by extension for proper storage handling.</li>
              <li><strong>Errors:</strong> Duplicate <code>student_id</code> errors require choosing a different unique identifier.</li>
            </ul>
          </section>
          <div style={{textAlign:'center',margin:'30px 0'}}>
            <button className="secondary-btn" onClick={() => navigate(-1)}>Back</button>
          </div>
        </div>
      </main>
    </div>
  );
}

const sectionStyle = {
  background:'rgba(255,255,255,0.9)',
  padding:'1.25rem 1.5rem',
  borderRadius:18,
  marginBottom:'1.5rem',
  boxShadow:'0 8px 24px rgba(0,0,0,0.1)',
  border:'1px solid rgba(255,255,255,0.65)'
};
const h2Style = {margin:'0 0 .75rem',color:'#2e7d32',fontSize:'1.35rem'};
const ulStyle = {margin:'0 0 0 .9rem',padding:0,listStyle:'disc'};

export default PolicyInstructions;