import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';
import { useAuth } from './context/AuthContext.jsx';

import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Vehicles from './pages/Vehicles.jsx';
import Drivers from './pages/Drivers.jsx';
import Trips from './pages/Trips.jsx';
import Maintenance from './pages/Maintenance.jsx';
import FuelExpenses from './pages/FuelExpenses.jsx';
import Reports from './pages/Reports.jsx';

function Shell({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={loading ? null : isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route path="/" element={<Shell><Dashboard /></Shell>} />
      <Route path="/vehicles" element={<Shell><Vehicles /></Shell>} />
      <Route path="/drivers" element={<Shell><Drivers /></Shell>} />
      <Route path="/trips" element={<Shell><Trips /></Shell>} />
      <Route path="/maintenance" element={<Shell><Maintenance /></Shell>} />
      <Route path="/fuel-expenses" element={<Shell><FuelExpenses /></Shell>} />
      <Route path="/reports" element={<Shell><Reports /></Shell>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
