import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LoginPage from './screens/LoginPage';
import Homepage from './screens/HomePage';
import EmergencyPage from './screens/EmergencyPage';
import UserPage from './screens/UserPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<Homepage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/emergencies" element={<EmergencyPage />} />
     
      </Routes>
    </Router>
  );
}

export default App;