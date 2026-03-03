import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React, { useState, useEffect, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import Sidebar from './components/Sidebar';
import CommandPalette from './components/CommandPalette';
import FocusMode from './components/FocusMode';
import MobileHeader from './components/MobileHeader';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

// Code Splitting (Lazy Loading) - Drastically reduces Main Thread FCP penalty
const CalendarPage = React.lazy(() => import('./pages/CalendarPage'));
const HabitsPage = React.lazy(() => import('./pages/HabitsPage'));
const TasksPage = React.lazy(() => import('./pages/TasksPage'));
const WeeklyPlanPage = React.lazy(() => import('./pages/WeeklyPlanPage'));
const WeeklyReviewPage = React.lazy(() => import('./pages/WeeklyReviewPage'));
const MonthlyReflectionPage = React.lazy(() => import('./pages/MonthlyReflectionPage'));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage'));

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  useKeyboardShortcuts();

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!isAuthenticated) return <Navigate to="/login" />;

  if (focusMode) {
    return <FocusMode onExit={() => setFocusMode(false)} />;
  }

  return (
    <div className="app-layout">
      <MobileHeader 
        onMenuClick={() => setIsSidebarOpen(true)}
        onCommandClick={() => setCmdOpen(true)}
      />
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onCommandPalette={() => {
          setIsSidebarOpen(false);
          setCmdOpen(true);
        }} 
      />
      {isSidebarOpen && <div className="mobile-sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}
      <main className="main-content">
        <div className="page-enter" key={window.location.pathname}>
          <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>...</div>}>
            <Routes>
              <Route path="/" element={<DashboardPage onFocusMode={() => setFocusMode(true)} />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/habits" element={<HabitsPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/plan" element={<WeeklyPlanPage />} />
              <Route path="/review" element={<WeeklyReviewPage />} />
              <Route path="/monthly" element={<MonthlyReflectionPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Routes>
          </Suspense>
        </div>
      </main>
      <CommandPalette
        isOpen={cmdOpen}
        onClose={() => setCmdOpen(false)}
        onFocusMode={() => setFocusMode(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <>
      <div>
        <BrowserRouter>
          <AuthProvider>
            <ToastProvider>
              {/* Global Animated Neon Background */}
              <div className="ambient-blob" style={{ color: 'var(--accent)', top: '-10%', left: '0%', width: '40vw', height: '40vw', opacity: 0.15, animationDelay: '0s' }}></div>
              <div className="ambient-blob" style={{ color: 'var(--secondary)', bottom: '10%', right: '-5%', width: '50vw', height: '50vw', opacity: 0.12, animationDelay: '-5s', animationDirection: 'alternate-reverse' }}></div>
              <div className="ambient-blob" style={{ color: 'var(--danger)', top: '40%', left: '40%', width: '35vw', height: '35vw', opacity: 0.1, animationDelay: '-15s', animationDuration: '30s' }}></div>
              
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/*" element={<ProtectedLayout />} />
              </Routes>
            </ToastProvider>
          </AuthProvider>
        </BrowserRouter>
      </div>
    </>
  );
}
