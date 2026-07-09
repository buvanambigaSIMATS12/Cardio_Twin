import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import React, { useEffect, useContext, useState } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import MobileLayout from './components/MobileLayout';
import Splash from './pages/Splash';
import Landing from './pages/auth/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Onboarding from './pages/auth/Onboarding';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import DailyCheck from './pages/DailyCheck';
import WeeklySummary from './pages/WeeklySummary';
import ECGUpload from './pages/ECGUpload';
import DigitalTwin from './pages/DigitalTwin';
import Simulator from './pages/Simulator';
import Chatbot from './pages/Chatbot';
import Profile from './pages/Profile';
import ForgotPassword from './pages/auth/ForgotPassword';
import PrivacySecurity from './pages/PrivacySecurity';
import HelpFAQ from './pages/HelpFAQ';
import AppSettings from './pages/AppSettings';
import MedicationTracker from './pages/MedicationTracker';
import AddMedication from './pages/AddMedication';
import VitalsTracker from './pages/VitalsTracker';
import SymptomLogger from './pages/SymptomLogger';
import ECGHistory from './pages/ECGHistory';
import ECGDetail from './pages/ECGDetail';
import ECGComparison from './pages/ECGComparison';
import PDFReport from './pages/PDFReport';
import RiskTimeline from './pages/RiskTimeline';
import TwinInsights from './pages/TwinInsights';
import Achievements from './pages/Achievements';
import Recommendations from './pages/Recommendations';
import ExercisePlanner from './pages/ExercisePlanner';
import SleepAnalyser from './pages/SleepAnalyser';
import MealPlanner from './pages/MealPlanner';
import EmergencyContacts from './pages/EmergencyContacts';
import Notifications from './pages/Notifications';
import DoctorDetail from './pages/DoctorDetail';
import ActivityHistory from './pages/ActivityHistory';
import EditProfile from './pages/EditProfile';
import SleepCheck from './pages/SleepCheck';
import { App as CapacitorApp } from '@capacitor/app';
import DesktopApp from './desktop/DesktopApp';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/landing" replace />;
  }
  return children;
};

function BackButtonHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const listener = CapacitorApp.addListener('backButton', () => {
      const path = location.pathname;
      if (path === '/' || path === '/dashboard' || path === '/splash' || path === '/login' || path === '/onboarding') {
        CapacitorApp.exitApp();
      } else {
        navigate(-1);
      }
    });

    return () => {
      listener.then(l => l.remove());
    };
  }, [navigate, location]);

  return null;
}

function MobileApp() {
  return (
    <AuthProvider>
      <Router>
        <BackButtonHandler />
        <Routes>
          <Route element={<MobileLayout />}>
            {/* Auth Routes */}
            <Route path="/splash" element={<Splash />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

            {/* App Routes (Protected) */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><ActivityHistory /></ProtectedRoute>} />
            <Route path="/daily-check" element={<ProtectedRoute><DailyCheck /></ProtectedRoute>} />
            <Route path="/weekly-summary" element={<ProtectedRoute><WeeklySummary /></ProtectedRoute>} />
            <Route path="/ecg" element={<ProtectedRoute><ECGUpload /></ProtectedRoute>} />
            <Route path="/ecg/history" element={<ProtectedRoute><ECGHistory /></ProtectedRoute>} />
            <Route path="/ecg/compare" element={<ProtectedRoute><ECGComparison /></ProtectedRoute>} />
            <Route path="/ecg/result/:scanId" element={<ProtectedRoute><ECGDetail /></ProtectedRoute>} />
            <Route path="/ecg/public/:scanId" element={<ECGDetail />} />
            <Route path="/twin" element={<ProtectedRoute><DigitalTwin /></ProtectedRoute>} />
            <Route path="/sim" element={<ProtectedRoute><Simulator /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
            <Route path="/app-settings" element={<ProtectedRoute><AppSettings /></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><HelpFAQ /></ProtectedRoute>} />
            <Route path="/privacy" element={<ProtectedRoute><PrivacySecurity /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><AppSettings /></ProtectedRoute>} />
            <Route path="/emergency-contacts" element={<ProtectedRoute><EmergencyContacts /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
            <Route path="/report" element={<ProtectedRoute><PDFReport /></ProtectedRoute>} />
            
            {/* Phase 2 Routes */}
            <Route path="/medications" element={<ProtectedRoute><MedicationTracker /></ProtectedRoute>} />
            <Route path="/medications/add" element={<ProtectedRoute><AddMedication /></ProtectedRoute>} />
            <Route path="/vitals-tracker" element={<ProtectedRoute><VitalsTracker /></ProtectedRoute>} />
            <Route path="/symptoms" element={<ProtectedRoute><SymptomLogger /></ProtectedRoute>} />

            {/* Phase 4 Routes */}
            <Route path="/twin/timeline" element={<ProtectedRoute><RiskTimeline /></ProtectedRoute>} />
            <Route path="/twin/insights" element={<ProtectedRoute><TwinInsights /></ProtectedRoute>} />
            <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />

            {/* Phase 5 Routes */}
            <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
            <Route path="/exercise-plan" element={<ProtectedRoute><ExercisePlanner /></ProtectedRoute>} />
            <Route path="/sleep" element={<ProtectedRoute><SleepAnalyser /></ProtectedRoute>} />
            <Route path="/meal-plan" element={<ProtectedRoute><MealPlanner /></ProtectedRoute>} />

            {/* Phase 6 Routes */}
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/doctor/:doctorId" element={<ProtectedRoute><DoctorDetail /></ProtectedRoute>} />

            {/* Catch-all redirect */}
            <Route path="/" element={<Navigate to="/splash" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

function App() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isDesktop) {
    return <DesktopApp />;
  }

  return <MobileApp />;
}

export default App;
