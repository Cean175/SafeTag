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
import DocumentationsList from './screens/DocumentationsList';
import AlertMonitor from './screens/AlertMonitor';
import EmergencyNotification from './components/EmergencyNotification';

function App() {
  return (
    <Router>
      <AlertMonitor />
      <EmergencyNotification />
      
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<Homepage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/emergency" element={<EmergencyPage />} />
        <Route path="/emergencies" element={<EmergencyPage />} />
        <Route path="/addstudent" element={<AddStudentPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/documentations" element={<Documentations />} />
        <Route path="/documentations-list" element={<DocumentationsList />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
} 

export default App;