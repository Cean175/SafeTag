import React, { useState } from 'react';
import '../App.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('Login attempted with:', username, password);
  };

  return (
    <div className="login-container">
      
      <header className="header">
        <div className="header-content">
          <div className="branding">
            <h1 className="title">S.A.F.E</h1>
            <p className="subtitle">STUDENT ASSISTANCE FOR EMERGENCIES</p>
          </div>
          
         
          <div className="nav-icons">
            <div className="nav-icon">
              <span>🏠</span>
            </div>
            <div className="nav-icon">
              <span>👤</span>
            </div>
            <div className="nav-icon">
              <span>📊</span>
            </div>
            <div className="nav-icon">
              <span>📞</span>
            </div>
            <div className="nav-icon">
              <span>⚙️</span>
            </div>
          </div>
        </div>
      </header>

     
      <div className="main-content">
        <div className="login-form">
          <div className="form-content">
           
            <div className="input-group">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
              />
            </div>

          
            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
              />
            </div>

           
            <div className="button-container">
              <button
                onClick={handleLogin}
                className="login-button"
              >
                LOG IN
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;