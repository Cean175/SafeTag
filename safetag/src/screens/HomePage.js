import React from 'react';
import '../App.css';

function Homepage() {
  return (
    <div className="homepage-container">
      <header className="header">
        <div className="header-content">
          <div className="branding">
            <h1 className="title">Welcome to S.A.F.E</h1>
            <p className="subtitle">Student Assistance for Emergencies</p>
          </div>
        </div>
      </header>

      <main className="main-content">
        <h2>Hello, you're now logged in!</h2>
        <p>This is the homepage. Here you will see updates, notifications, or emergency services.</p>

        <div className="nav-buttons">
          <button className="nav-btn">Profile</button>
          <button className="nav-btn">Reports</button>
          <button className="nav-btn">Emergency Contacts</button>
          <button className="nav-btn">Settings</button>
        </div>
      </main>
    </div>
  );
}

export default Homepage;
