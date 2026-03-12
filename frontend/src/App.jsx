import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth.js';
import { AuthProvider } from './context/AuthProvider.jsx';
import AuthPage from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ExamsPage from './pages/ExamsPage.jsx';
import UpcomingPage from './pages/UpcomingPage.jsx';

function Nav() {
  const { user, logout } = useAuth();
  return (
    <nav className="nav">
      <div className="nav-brand">StudyPal</div>
      <div className="nav-links">
        <span className="nav-user">{user?.name}</span>
        <button className="btn btn-ghost btn-sm" onClick={logout}>Sign out</button>
      </div>
    </nav>
  );
}

function TabNav() {
  return (
    <div className="tab-nav">
      <NavLink to="/today" className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>Today</NavLink>
      <NavLink to="/upcoming" className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>Upcoming</NavLink>
      <NavLink to="/exams" className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>My Exams</NavLink>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>📚</div>
        <p style={{ color: 'var(--gray-400)', marginTop: 8 }}>Loading StudyPal…</p>
      </div>
    </div>
  );

  if (!user) return <AuthPage />;

  return (
    <div className="layout">
      <Nav />
      <main className="main">
        <TabNav />
        <Routes>
          <Route path="/" element={<Navigate to="/today" replace />} />
          <Route path="/today" element={<DashboardPage />} />
          <Route path="/upcoming" element={<UpcomingPage />} />
          <Route path="/exams" element={<ExamsPage />} />
          <Route path="*" element={<Navigate to="/today" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function Root() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
