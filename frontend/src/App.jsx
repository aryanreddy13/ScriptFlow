import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Scripts from './pages/Scripts';
import Scheduler from './pages/Scheduler';
import History from './pages/History';
import Logs from './pages/Logs';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import useAuth from './hooks/useAuth';

function AppLayout({ title, children, mobileOpen, setMobileOpen }) {
  return (
    <div className="min-h-screen flex bg-brandBg text-brandFg">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { currentUser } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={currentUser ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout title="Dashboard" mobileOpen={mobileNavOpen} setMobileOpen={setMobileNavOpen}>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/scripts"
          element={
            <ProtectedRoute>
              <AppLayout title="Scripts" mobileOpen={mobileNavOpen} setMobileOpen={setMobileNavOpen}>
                <Scripts />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/scheduler"
          element={
            <ProtectedRoute>
              <AppLayout title="Scheduler" mobileOpen={mobileNavOpen} setMobileOpen={setMobileNavOpen}>
                <Scheduler />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <AppLayout title="History" mobileOpen={mobileNavOpen} setMobileOpen={setMobileNavOpen}>
                <History />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/logs"
          element={
            <ProtectedRoute>
              <AppLayout title="Logs" mobileOpen={mobileNavOpen} setMobileOpen={setMobileNavOpen}>
                <Logs />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
