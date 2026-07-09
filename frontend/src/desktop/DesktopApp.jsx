import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './desktop.css';

import { AuthProvider, AuthContext } from '../context/AuthContext';
import Login from '../pages/auth/Login';

import DesktopLayout from './layouts/DesktopLayout';
import DashboardPage from './pages/DashboardPage';
import ECGPage from './pages/ECGPage';
import DigitalTwinPage from './pages/DigitalTwinPage';
import MedicationsPage from './pages/MedicationsPage';
import HistoryPage from './pages/HistoryPage';
import DoctorsPage from './pages/DoctorsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

// Reuses the same auth check as the mobile ProtectedRoute
const DesktopProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default function DesktopApp() {
  return (
    <div className="desktop-app">
      <AuthProvider>
        <Router>
          <Routes>
            {/* Login route (public) */}
            <Route path="/login" element={<Login />} />

            {/* All desktop routes render inside DesktopLayout (protected) */}
            <Route element={<DesktopLayout />}>
              <Route path="/" element={<DesktopProtectedRoute><DashboardPage /></DesktopProtectedRoute>} />
              <Route path="/ecg" element={<DesktopProtectedRoute><ECGPage /></DesktopProtectedRoute>} />
              <Route path="/twin" element={<DesktopProtectedRoute><DigitalTwinPage /></DesktopProtectedRoute>} />
              <Route path="/medications" element={<DesktopProtectedRoute><MedicationsPage /></DesktopProtectedRoute>} />
              <Route path="/history" element={<DesktopProtectedRoute><HistoryPage /></DesktopProtectedRoute>} />
              <Route path="/doctors" element={<DesktopProtectedRoute><DoctorsPage /></DesktopProtectedRoute>} />
              <Route path="/profile" element={<DesktopProtectedRoute><ProfilePage /></DesktopProtectedRoute>} />
              <Route path="/settings" element={<DesktopProtectedRoute><SettingsPage /></DesktopProtectedRoute>} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}
