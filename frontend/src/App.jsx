import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HiAcademicCap } from 'react-icons/hi';
import { HiCalendarDays, HiCalendar, HiClipboardDocumentList, HiArrowRightOnRectangle, HiFire, HiMoon, HiSun } from 'react-icons/hi2';
import { HiArrowPath } from 'react-icons/hi2';
import { useAuth } from './hooks/useAuth.js';
import { AuthProvider } from './context/AuthProvider.jsx';
import { api } from './utils/api.js';
import { getStreak } from './utils/streak.js';
import AuthPage from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ExamsPage from './pages/ExamsPage.jsx';
import UpcomingPage from './pages/UpcomingPage.jsx';

const STREAK_REFRESH_EVENT = 'studypal:streak';

function Nav() {
  const { user, logout } = useAuth();
  const [streak, setStreak] = useState(() => getStreak());
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const onRefresh = () => setStreak(getStreak());
    window.addEventListener(STREAK_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(STREAK_REFRESH_EVENT, onRefresh);
  }, []);

  const initials = user?.name
    ? user.name.trim().split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <nav className="nav">
      <div className="nav-brand">
        <HiAcademicCap className="nav-logo-icon" style={{ fontSize: 28 }} />
        StudyPal
      </div>

      <div className="nav-center">
        <div className="tab-nav">
          <NavLink to="/today" className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
            <HiCalendarDays style={{ fontSize: 20 }} />
            Today
          </NavLink>
          <NavLink to="/upcoming" className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
            <HiCalendar style={{ fontSize: 20 }} />
            Upcoming
          </NavLink>
          <NavLink to="/exams" className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
            <HiClipboardDocumentList style={{ fontSize: 20 }} />
            My Exams
          </NavLink>
        </div>
      </div>

      <div className="nav-right">
        {streak.streak > 0 && (
          <span
            className={`streak-pill ${streak.lastCompletedDate === new Date().toISOString().split('T')[0] ? 'active' : ''}`}
            title={streak.lastCompletedDate === new Date().toISOString().split('T')[0] ? 'Streak active today!' : 'Complete a session to keep your streak!'}
          >
            <HiFire style={{ fontSize: 16 }} />
            {streak.streak}
          </span>
        )}
        <button type="button" className="btn-icon" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          {theme === 'dark' ? <HiMoon style={{ fontSize: 20 }} /> : <HiSun style={{ fontSize: 20 }} />}
        </button>
        <div className="nav-avatar" title={user?.name}>{initials}</div>
        <button type="button" className="btn-icon" onClick={logout} aria-label="Sign out">
          <HiArrowRightOnRectangle style={{ fontSize: 20 }} />
        </button>
      </div>
    </nav>
  );
}

function HealthPill() {
  const [health, setHealth] = useState(null);
  useEffect(() => {
    api.health().then((d) => setHealth(d)).catch(() => setHealth(false));
  }, []);
  return (
    <div className="health-pill">
      <span className={`health-dot ${health && health.status === 'ok' ? '' : 'offline'}`} aria-hidden />
      {health && health.status === 'ok' ? (
        <span>API · DB {health.database}</span>
      ) : (
        <span>{health === false ? 'Offline' : '…'}</span>
      )}
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="loading-screen">
        <div className="loading-screen-content">
          <HiArrowPath style={{ fontSize: 40 }} className="spin" />
          <p className="loading-screen-text">Loading StudyPal…</p>
        </div>
      </div>
    );

  if (!user) return <AuthPage />;

  return (
    <div className="layout">
      <Nav />
      <main className="main">
        <Routes>
          <Route path="/" element={<Navigate to="/today" replace />} />
          <Route path="/today" element={<DashboardPage />} />
          <Route path="/upcoming" element={<UpcomingPage />} />
          <Route path="/exams" element={<ExamsPage />} />
          <Route path="*" element={<Navigate to="/today" replace />} />
        </Routes>
      </main>
      <HealthPill />
    </div>
  );
}

export default function Root() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' },
          }}
        />
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export { STREAK_REFRESH_EVENT };
