import { useState, useEffect } from 'react';
import { api } from '../utils/api.js';
import toast from 'react-hot-toast';

const DiffBadge = ({ d }) => <span className={`badge badge-${d}`}>{d}</span>;

const groupByDate = (sessions) => {
  const groups = {};
  sessions.forEach(s => {
    if (!groups[s.date]) groups[s.date] = [];
    groups[s.date].push(s);
  });
  return groups;
};

const fmtDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00');
  const today = new Date(); today.setHours(0,0,0,0);
  const diff = Math.round((d - today) / 86400000);
  const label = diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  return { label, isToday: diff === 0 };
};

export default function UpcomingPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/sessions/upcoming').then(setSessions).finally(() => setLoading(false));
  }, []);

  const toggle = async (id) => {
    try {
      const updated = await api.patch(`/sessions/${id}/toggle`, {});
      setSessions(sessions.map(s => s.id === id ? { ...s, completed: updated.completed } : s));
      if (updated.completed) {
        toast.success('Session completed!');
      }
    } catch (err) {
      toast.error('Failed to update session');
    }
  };

  if (loading) return <div className="empty"><div className="empty-icon">⏳</div></div>;

  const groups = groupByDate(sessions);
  const dates = Object.keys(groups).sort();

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">📆 Upcoming Sessions</div>
          <div className="section-subtitle">Next 30 days of study plan</div>
        </div>
      </div>

      {dates.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">✅</div>
          <p className="empty-text">No upcoming sessions. Add an exam to generate your study plan!</p>
        </div>
      ) : (
        dates.map(date => {
          const { label, isToday } = fmtDate(date);
          const list = groups[date];
          const done = list.filter(s => s.completed).length;
          return (
            <div key={date} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: isToday ? 'var(--primary)' : 'var(--gray-600)' }}>{label}</span>
                <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{done}/{list.length} done</span>
                <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
              </div>
              {list.map(s => (
                <div key={s.id} className={`session-item ${s.completed ? 'completed' : ''}`}>
                  <div className={`session-check ${s.completed ? 'checked' : ''}`} onClick={() => toggle(s.id)}>
                    {s.completed && '✓'}
                  </div>
                  <div className="session-info">
                    <div className="session-subject" style={{ textDecoration: s.completed ? 'line-through' : 'none' }}>{s.Subject?.name}</div>
                    <div className="session-exam">{s.Exam?.name}</div>
                  </div>
                  <DiffBadge d={s.Subject?.difficulty} />
                </div>
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}