import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HiCalendarDays, HiClock, HiBookOpen, HiArrowPath, HiCheckCircle, HiArrowTrendingUp, HiRectangleStack, HiCheck } from 'react-icons/hi2';
import confetti from 'canvas-confetti';
import { api } from '../utils/api.js';
import toast from 'react-hot-toast';
import { useCountUp } from '../hooks/useCountUp.js';
import { getRandomQuote } from '../data/quotes.js';
import { recordSessionCompletedToday } from '../utils/streak.js';
import { SubjectIcon } from '../components/SubjectIcon.jsx';
import { STREAK_REFRESH_EVENT } from '../App.jsx';

const DIFFICULTY_MINUTES = { easy: 30, medium: 45, hard: 60 };

const difficultyStyles = {
  easy: { background: 'rgba(94, 184, 138, 0.2)', color: 'var(--difficulty-easy, #5eb88a)' },
  medium: { background: 'rgba(232, 201, 126, 0.2)', color: 'var(--difficulty-medium, #e8c97e)' },
  hard: { background: 'rgba(224, 107, 107, 0.2)', color: 'var(--difficulty-hard, #e06b6b)' },
};

export default function DashboardPage() {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const confettiFired = useRef(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const countTodayTotal = useCountUp(stats?.todayTotal ?? 0, 600, !!stats);
  const countTodayDone = useCountUp(stats?.todayDone ?? 0, 600, !!stats);
  const countCompleted = useCountUp(stats?.completed ?? 0, 600, !!stats);
  const countTotal = useCountUp(stats?.total ?? 0, 600, !!stats);

  useEffect(() => {
    Promise.all([
      api.get('/sessions/today'),
      api.get('/sessions/stats'),
      api.get('/exams').catch(() => []),
    ])
      .then(([s, st, e]) => {
        setSessions(s);
        setStats(st);
        setExams(Array.isArray(e) ? e : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (id) => {
    try {
      const updated = await api.patch(`/sessions/${id}/toggle`, {});
      setSessions(sessions.map((s) => (s.id === id ? { ...s, completed: updated.completed } : s)));
      setStats((prev) => {
        const diff = updated.completed ? 1 : -1;
        return { ...prev, completed: prev.completed + diff, todayDone: prev.todayDone + diff };
      });
      if (updated.completed) {
        recordSessionCompletedToday();
        window.dispatchEvent(new Event(STREAK_REFRESH_EVENT));
        toast.success('Session completed! Great job 🎉');
      }
    } catch (err) {
      toast.error('Failed to update session');
    }
  };

  const done = sessions.filter((s) => s.completed).length;
  const pct = sessions.length ? Math.round((done / sessions.length) * 100) : 0;
  const allDone = sessions.length > 0 && done === sessions.length;

  useEffect(() => {
    if (allDone && !confettiFired.current) {
      confettiFired.current = true;
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      toast.success("You crushed today's plan. 🎯", { duration: 4000 });
    }
  }, [allDone]);

  const [quote] = useState(() => getRandomQuote());
  const upcomingExams = (exams || []).filter((e) => new Date(e.examDate + 'T00:00') >= new Date(todayStr + 'T00:00'));

  if (loading)
    return (
      <div className="empty page-enter">
        <div className="empty-icon">
          <HiArrowPath style={{ fontSize: 40 }} className="spin" />
        </div>
        <p className="empty-text">Loading…</p>
      </div>
    );

  return (
    <div className="page-enter">
      <div className="quote-block">&ldquo;{quote}&rdquo;</div>

      {stats && (
        <div className="stats-row">
          <div className="stat-tile">
            <HiCalendarDays className="stat-icon" style={{ fontSize: 24 }} />
            <div className="stat-value">{countTodayTotal}</div>
            <div className="stat-label">Today&apos;s sessions</div>
          </div>
          <div className="stat-tile">
            <HiCheckCircle className="stat-icon" style={{ fontSize: 24, color: 'var(--success)' }} />
            <div className="stat-value">{countTodayDone}</div>
            <div className="stat-label">Completed today</div>
          </div>
          <div className="stat-tile">
            <HiArrowTrendingUp className="stat-icon" style={{ fontSize: 24 }} />
            <div className="stat-value">{countCompleted}</div>
            <div className="stat-label">Total completed</div>
          </div>
          <div className="stat-tile">
            <HiRectangleStack className="stat-icon" style={{ fontSize: 24 }} />
            <div className="stat-value">{countTotal}</div>
            <div className="stat-label">Total sessions</div>
          </div>
        </div>
      )}

      {upcomingExams.length > 0 && (
        <div className="countdown-strip">
          {upcomingExams.slice(0, 5).map((exam) => {
            const days = Math.ceil((new Date(exam.examDate + 'T00:00') - new Date()) / 86400000);
            const urgency = days > 7 ? 'ok' : days > 3 ? 'soon' : 'urgent';
            return (
              <Link
                key={exam.id}
                to="/exams"
                className={`countdown-pill ${urgency} ${days <= 2 ? 'pulse' : ''}`}
              >
                {exam.name} · {days}d
              </Link>
            );
          })}
        </div>
      )}

      <div className="section-header">
        <div>
          <div className="section-title">
            <HiCalendarDays style={{ fontSize: 22 }} />
            Today&apos;s study plan
          </div>
          <div className="section-subtitle">{today}</div>
        </div>
        {sessions.length > 0 && (
          <span className="text-sm text-muted">
            {done}/{sessions.length} done
          </span>
        )}
      </div>

      {sessions.length > 0 && (
        <div className="progress-wrap">
          <div className="progress-bar-track">
            <div className="progress-fill" style={{ width: `${pct}%` }}>
              <span className="progress-pct">{pct}%</span>
            </div>
          </div>
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">
            <HiBookOpen style={{ fontSize: 80, color: 'var(--text-muted)' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>All clear for today!</h2>
          <p className="empty-text">Your next sessions are coming up — check Upcoming to stay ahead.</p>
          <Link to="/upcoming" className="btn btn-primary" style={{ marginTop: 16 }}>
            View Upcoming →
          </Link>
        </div>
      ) : (
        <div>
          {sessions.map((s) => {
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
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {s.Exam?.name} · Exam {new Date(s.Exam?.examDate + 'T00:00').toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <HiClock style={{ fontSize: 12 }} />
                    <span>~{mins} min</span>
                  </div>
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
      )}
    </div>
  );
}
