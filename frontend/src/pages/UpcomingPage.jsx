import { useState, useEffect } from 'react';
import { HiCalendar, HiViewColumns, HiSquares2X2, HiArrowPath, HiCalendarDays, HiClock, HiCheck } from 'react-icons/hi2';
import { api } from '../utils/api.js';
import toast from 'react-hot-toast';
import { recordSessionCompletedToday } from '../utils/streak.js';
import { SubjectIcon } from '../components/SubjectIcon.jsx';
import { STREAK_REFRESH_EVENT } from '../App.jsx';

const DIFFICULTY_MINUTES = { easy: 30, medium: 45, hard: 60 };

const difficultyStyles = {
  easy: { background: 'rgba(94, 184, 138, 0.2)', color: 'var(--difficulty-easy, #5eb88a)' },
  medium: { background: 'rgba(232, 201, 126, 0.2)', color: 'var(--difficulty-medium, #e8c97e)' },
  hard: { background: 'rgba(224, 107, 107, 0.2)', color: 'var(--difficulty-hard, #e06b6b)' },
};

const groupByDate = (sessions) => {
  const groups = {};
  sessions.forEach((s) => {
    if (!groups[s.date]) groups[s.date] = [];
    groups[s.date].push(s);
  });
  return groups;
};

const fmtDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d - today) / 86400000);
  const label = diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const dayCap = diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'long' });
  return { label, dayCap, isToday: diff === 0 };
};

export default function UpcomingPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    api.get('/sessions/upcoming').then(setSessions).finally(() => setLoading(false));
  }, []);

  const toggle = async (id) => {
    try {
      const updated = await api.patch(`/sessions/${id}/toggle`, {});
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, completed: updated.completed } : s)));
      if (updated.completed) {
        recordSessionCompletedToday();
        window.dispatchEvent(new Event(STREAK_REFRESH_EVENT));
        toast.success('Session completed!');
      }
    } catch (err) {
      toast.error('Failed to update session');
    }
  };

  if (loading)
    return (
      <div className="empty page-enter">
        <div className="empty-icon">
          <HiArrowPath style={{ fontSize: 40 }} className="spin" />
        </div>
        <p className="empty-text">Loading…</p>
      </div>
    );

  const groups = groupByDate(sessions);
  const dates = Object.keys(groups).sort();

  return (
    <div className="page-enter">
      <div className="section-header">
        <div>
          <div className="section-title">
            <HiCalendar style={{ fontSize: 22 }} />
            Upcoming sessions
          </div>
          <div className="section-subtitle">Next 30 days of your study plan</div>
        </div>
        <div className="view-toggle">
          <button
            type="button"
            className={compact ? '' : 'active'}
            style={{ padding: '6px 10px', background: compact ? 'transparent' : 'var(--bg-surface)', border: 'none', borderRadius: 6, color: compact ? 'var(--text-muted)' : 'var(--text-primary)', cursor: 'pointer' }}
            onClick={() => setCompact(false)}
            aria-label="Expanded view"
          >
            <HiViewColumns style={{ fontSize: 16 }} />
          </button>
          <button
            type="button"
            className={compact ? 'active' : ''}
            style={{ padding: '6px 10px', background: compact ? 'var(--bg-surface)' : 'transparent', border: 'none', borderRadius: 6, color: compact ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer' }}
            onClick={() => setCompact(true)}
            aria-label="Compact view"
          >
            <HiSquares2X2 style={{ fontSize: 16 }} />
          </button>
        </div>
      </div>

      {dates.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">
            <HiCalendarDays style={{ fontSize: 48, color: 'var(--text-muted)' }} />
          </div>
          <p className="empty-text">No upcoming sessions. Add an exam to generate your study plan.</p>
        </div>
      ) : (
        <div className={compact ? 'compact' : ''}>
          {dates.map((date) => {
            const { label, dayCap, isToday } = fmtDate(date);
            const list = groups[date];
            const done = list.filter((s) => s.completed).length;
            return (
              <div key={date} className="upcoming-day-group">
                <div className={`upcoming-day-header ${isToday ? 'today' : ''}`}>
                  <span className="upcoming-day-cap">{dayCap}</span>
                  <span className="upcoming-day-label">{label}</span>
                  <span className="upcoming-day-pill">{done}/{list.length} done</span>
                </div>
                {list.map((s) => {
                  const diff = s.Subject?.difficulty || 'medium';
                  const mins = DIFFICULTY_MINUTES[diff] || 45;
                  const subjectName = s.Subject?.name || '';
                  const badgeStyle = difficultyStyles[diff] || difficultyStyles.medium;
                  return (
                    <div
                      key={s.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '16px 20px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        marginBottom: 'var(--space-3)',
                        borderLeft: `4px solid var(--difficulty-${diff})`,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => toggle(s.id)}
                        aria-label={s.completed ? 'Mark incomplete' : 'Mark complete'}
                        style={{
                          flexShrink: 0,
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          border: s.completed ? '2px solid var(--success, #5eb88a)' : '2px solid var(--border, rgba(0,0,0,0.2))',
                          background: s.completed ? 'var(--success, #5eb88a)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          padding: 0,
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      >
                        {s.completed && <HiCheck style={{ color: 'white', fontSize: 16 }} />}
                      </button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: 600,
                          fontSize: '15px',
                          color: 'var(--text-primary)',
                          textDecoration: s.completed ? 'line-through' : 'none',
                          opacity: s.completed ? 0.5 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}>
                          <SubjectIcon name={subjectName} size={18} />
                          <span>{subjectName}</span>
                        </div>
                        {!compact && (
                          <>
                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>{s.Exam?.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <HiClock style={{ fontSize: 12 }} />
                              <span>~{mins} min</span>
                            </div>
                          </>
                        )}
                      </div>
                      <span style={{
                        flexShrink: 0,
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 600,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        ...badgeStyle,
                      }}>
                        {diff}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
