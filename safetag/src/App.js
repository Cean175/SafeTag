import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import LoginPage from './screens/LoginPage';
import Homepage from './screens/HomePage';
import EmergencyPage from './screens/EmergencyPage';
import UserPage from './screens/UserPage';
import AddStudentPage from './screens/AddStudentPage';
import StudentsPage from './screens/StudentsPage';
import Documentations from './screens/Documentations';
import Settings from './screens/Settings';
import ContactPage from './screens/ContactPage';
import Statistics from './screens/Statistics';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Login Page - redirect if already logged in */}
        <Route path="/" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route path="/home" element={
          <ProtectedRoute><Homepage /></ProtectedRoute>
        } />
        <Route path="/user" element={
          <ProtectedRoute><UserPage /></ProtectedRoute>
        } />
        <Route path="/contact" element={
          <ProtectedRoute><ContactPage /></ProtectedRoute>
        } />
        <Route path="/emergencies" element={
          <ProtectedRoute><EmergencyPage /></ProtectedRoute>
        } />
        <Route path="/addstudent" element={
          <ProtectedRoute><AddStudentPage /></ProtectedRoute>
        } />
        <Route path="/students" element={
          <ProtectedRoute><StudentsPage /></ProtectedRoute>
        } />
        <Route path="/documentations" element={
          <ProtectedRoute><Documentations /></ProtectedRoute>
        } />
        <Route path="/statistics" element={
          <ProtectedRoute><Statistics /></ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute><Settings /></ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
} 

export default App;
