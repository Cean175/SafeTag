import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../App.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); // comment this out if not using routing

  // Temporary valid credentials
  const validUsername = 'testuser@example.com';
  const validPassword = 'test1234';

  const handleLogin = () => {
    if (username === validUsername && password === validPassword) {
      console.log('Login successful!');
      setErrorMessage('');
      navigate('/home'); // comment out this line if you're not using routing
    } else {
      setErrorMessage('Invalid username or password.');
    }
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
            <div className="nav-icon"><span>🏠</span></div>
            <div className="nav-icon"><span>👤</span></div>
            <div className="nav-icon"><span>📊</span></div>
            <div className="nav-icon"><span>📞</span></div>
            <div className="nav-icon"><span>⚙️</span></div>
          </div>
        </div>
      </header>

      <div className="main-content">
        <div className="login-form">
          <div className="form-content">

            {errorMessage && (
              <div className="error-message">
                {errorMessage}
              </div>
            )}

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
