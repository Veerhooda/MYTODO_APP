import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import Sidebar from './components/Sidebar';
import CommandPalette from './components/CommandPalette';
import FocusMode from './components/FocusMode';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CalendarPage from './pages/CalendarPage';
import HabitsPage from './pages/HabitsPage';
import TasksPage from './pages/TasksPage';
import WeeklyPlanPage from './pages/WeeklyPlanPage';
import WeeklyReviewPage from './pages/WeeklyReviewPage';
import MonthlyReflectionPage from './pages/MonthlyReflectionPage';
import AnalyticsPage from './pages/AnalyticsPage';

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
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
      <Sidebar onCommandPalette={() => setCmdOpen(true)} />
      <main className="main-content">
        <div className="page-enter" key={window.location.pathname}>
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
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
