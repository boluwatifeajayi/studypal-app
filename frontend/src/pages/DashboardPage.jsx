import { useState, useEffect } from 'react';
import { api } from '../utils/api.js';
import toast from 'react-hot-toast';

const DiffBadge = ({ d }) => <span className={`badge badge-${d}`}>{d}</span>;

export default function DashboardPage() {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    Promise.all([api.get('/sessions/today'), api.get('/sessions/stats')])
      .then(([s, st]) => { setSessions(s); setStats(st); })
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (id) => {
    try {
      const updated = await api.patch(`/sessions/${id}/toggle`, {});
      setSessions(sessions.map(s => s.id === id ? { ...s, completed: updated.completed } : s));
      setStats(prev => {
        const diff = updated.completed ? 1 : -1;
        return { ...prev, completed: prev.completed + diff, todayDone: prev.todayDone + diff };
      });
      if (updated.completed) {
        toast.success('Session completed! Great job 🎉');
      }
    } catch (err) {
      toast.error('Failed to update session');
    }
  };

  if (loading) return <div className="empty"><div className="empty-icon">⏳</div><p className="empty-text">Loading…</p></div>;

  const done = sessions.filter(s => s.completed).length;
  const pct = sessions.length ? Math.round((done / sessions.length) * 100) : 0;

  return (
    <div>
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.todayTotal}</div>
            <div className="stat-label">Today's Sessions</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.todayDone}</div>
            <div className="stat-label">Completed Today</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Total Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Sessions</div>
          </div>
        </div>
      )}

      <div className="section-header">
        <div>
          <div className="section-title">📅 Today's Study Plan</div>
          <div className="section-subtitle">{today}</div>
        </div>
        {sessions.length > 0 && (
          <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>{done}/{sessions.length} done</span>
        )}
      </div>

      {sessions.length > 0 && (
        <div className="card" style={{ marginBottom: 24, padding: '12px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
            <span>Daily progress</span><span style={{ fontWeight: 600, color: 'var(--primary)' }}>{pct}%</span>
          </div>
          <div className="progress"><div className="progress-bar" style={{ width: `${pct}%` }} /></div>
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🎉</div>
          <p className="empty-text">No sessions today! Either you're all caught up or haven't added any exams yet.</p>
        </div>
      ) : (
        <div>
          {sessions.map(s => (
            <div key={s.id} className={`session-item ${s.completed ? 'completed' : ''}`}>
              <div className={`session-check ${s.completed ? 'checked' : ''}`} onClick={() => toggle(s.id)}>
                {s.completed && '✓'}
              </div>
              <div className="session-info">
                <div className="session-subject" style={{ textDecoration: s.completed ? 'line-through' : 'none' }}>
                  {s.Subject?.name}
                </div>
                <div className="session-exam">{s.Exam?.name} · Exam {new Date(s.Exam?.examDate + 'T00:00').toLocaleDateString()}</div>
              </div>
              <div className="session-meta">
                <DiffBadge d={s.Subject?.difficulty} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}