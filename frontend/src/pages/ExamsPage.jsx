import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HiPlus, HiTrash, HiClipboardDocumentList, HiBookOpen, HiArrowPath } from 'react-icons/hi2';
import { HiXMark } from 'react-icons/hi2';
import { api } from '../utils/api.js';
import toast from 'react-hot-toast';
import { SubjectIcon } from '../components/SubjectIcon.jsx';

const daysUntil = (dateStr) => Math.ceil((new Date(dateStr + 'T00:00') - new Date().setHours(0, 0, 0, 0)) / 86400000);

function daysBadgeClass(days) {
  if (days < 0) return '';
  if (days > 7) return 'green';
  if (days > 3) return 'gold';
  return 'red';
}

function AddExamModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [subjects, setSubjects] = useState([{ name: '', difficulty: 'medium' }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const addSubjectRow = () => setSubjects([...subjects, { name: '', difficulty: 'medium' }]);
  const removeRow = (i) => setSubjects(subjects.filter((_, idx) => idx !== i));
  const updateRow = (i, field, val) => setSubjects(subjects.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)));

  const onSubjectKeyDown = (e, i) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const s = subjects[i];
      if (s.name.trim()) {
        addSubjectRow();
      }
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const validSubs = subjects.filter((s) => s.name.trim());
      const exam = await api.post('/exams', { name, examDate, subjects: validSubs });
      onCreated(exam);
      toast.success('Exam created successfully!');
      onClose();
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];
  const validChips = subjects.filter((s) => s.name.trim());

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    boxSizing: 'border-box',
    overflowY: 'auto',
  };
  const cardStyle = {
    position: 'relative',
    zIndex: 10000,
    width: '100%',
    maxWidth: '560px',
    maxHeight: 'calc(100vh - 40px)',
    overflowY: 'auto',
    borderRadius: '20px',
    padding: '32px',
    boxSizing: 'border-box',
    margin: 'auto',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5)',
  };

  return createPortal(
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">
          <HiPlus style={{ fontSize: 22 }} />
          New exam
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Exam name *</label>
              <input
                className="form-input"
                placeholder="e.g. Calculus Final"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Exam date *</label>
              <input
                className="form-input"
                type="date"
                min={minDate}
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ marginBottom: 8 }}>Subjects</label>
            {subjects.map((s, i) => (
              <div key={i} className="subject-row">
                <input
                  className="form-input"
                  placeholder="Subject name (Enter to add)"
                  value={s.name}
                  onChange={(e) => updateRow(i, 'name', e.target.value)}
                  onKeyDown={(e) => onSubjectKeyDown(e, i)}
                />
                <select
                  className="form-select"
                  style={{ width: 'auto' }}
                  value={s.difficulty}
                  onChange={(e) => updateRow(i, 'difficulty', e.target.value)}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                {subjects.length > 1 && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeRow(i)} aria-label="Remove row">
                    <HiXMark style={{ fontSize: 16 }} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={addSubjectRow}>
              <HiPlus style={{ fontSize: 14 }} />
              Add subject
            </button>
            {validChips.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {validChips.map((sub, i) => (
                  <span key={i} className="subject-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <SubjectIcon name={sub.name} size={14} />
                    <span className={`dot ${sub.difficulty}`} />
                    {sub.name} ({sub.difficulty[0].toUpperCase()})
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="modal-footer" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px 20px' }}
              disabled={loading}
            >
              {loading && <HiArrowPath style={{ fontSize: 18, marginRight: 8 }} className="spin" />}
              {loading ? 'Creating…' : 'Create exam'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

function AddSubjectModal({ exam, onClose, onAdded }) {
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const sub = await api.post(`/exams/${exam.id}/subjects`, { name, difficulty });
      onAdded(sub);
      toast.success('Subject added!');
      onClose();
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to add subject');
    } finally {
      setLoading(false);
    }
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    boxSizing: 'border-box',
    overflowY: 'auto',
  };
  const cardStyle = {
    position: 'relative',
    zIndex: 10000,
    width: '100%',
    maxWidth: '380px',
    maxHeight: 'calc(100vh - 40px)',
    overflowY: 'auto',
    borderRadius: '20px',
    padding: '32px',
    boxSizing: 'border-box',
    margin: 'auto',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5)',
  };

  return createPortal(
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">
          <HiBookOpen style={{ fontSize: 22 }} />
          Add subject to {exam.name}
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Subject name</label>
            <input className="form-input" placeholder="e.g. Thermodynamics" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Difficulty</label>
            <select className="form-select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading && <HiArrowPath style={{ fontSize: 16, marginRight: 6, verticalAlign: 'middle' }} className="spin" />}
              {loading ? 'Adding…' : 'Add subject'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addSubjectTo, setAddSubjectTo] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/exams'),
      api.get('/sessions/upcoming').catch(() => []),
    ]).then(([e, s]) => {
      setExams(e);
      setSessions(Array.isArray(s) ? s : []);
    }).finally(() => setLoading(false));
  }, []);

  const deleteExam = async (id) => {
    if (!confirm('Delete this exam and all its study sessions?')) return;
    try {
      await api.delete(`/exams/${id}`);
      setExams((prev) => prev.filter((e) => e.id !== id));
      toast.success('Exam deleted');
    } catch (err) {
      toast.error('Failed to delete exam');
    }
  };

  const deleteSubject = async (examId, subjectId) => {
    if (!confirm('Delete this subject?')) return;
    try {
      await api.delete(`/exams/${examId}/subjects/${subjectId}`);
      setExams((prev) => prev.map((e) => (e.id === examId ? { ...e, Subjects: e.Subjects.filter((s) => s.id !== subjectId) } : e)));
      toast.success('Subject deleted');
    } catch (err) {
      toast.error('Failed to delete subject');
    }
  };

  const sessionCountByExam = (examId) => {
    const list = sessions.filter((s) => s.examId === examId || s.Exam?.id === examId);
    const remaining = list.filter((s) => !s.completed).length;
    return { total: list.length, remaining };
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

  return (
    <div className="page-enter">
      <div className="section-header">
        <div>
          <div className="section-title">
            <HiClipboardDocumentList style={{ fontSize: 22 }} />
            My exams
          </div>
          <div className="section-subtitle">Manage your exams and subjects</div>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <HiPlus style={{ fontSize: 18 }} />
          New exam
        </button>
      </div>

      {exams.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">
            <HiBookOpen style={{ fontSize: 48, color: 'var(--text-muted)' }} />
          </div>
          <p className="empty-text">No exams yet. Add your first exam to get started.</p>
          <button type="button" className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowAdd(true)}>
            <HiPlus style={{ fontSize: 16 }} />
            Add exam
          </button>
        </div>
      ) : (
        exams.map((exam) => {
          const days = daysUntil(exam.examDate);
          const isPast = days < 0;
          const badgeClass = daysBadgeClass(days);
          const isUrgent = days >= 0 && days <= 2;
          const { total: totalSessions, remaining: remainingSessions } = sessionCountByExam(exam.id);
          const loadPct = totalSessions > 0 ? Math.round(((totalSessions - remainingSessions) / totalSessions) * 100) : 0;
          return (
            <div key={exam.id} className="exam-card">
              <button
                type="button"
                className="exam-delete-btn"
                onClick={() => deleteExam(exam.id)}
                title="Delete exam"
                aria-label="Delete exam"
              >
                <HiTrash style={{ fontSize: 16 }} />
              </button>
              <div className="exam-header">
                <div>
                  <div className="exam-name">{exam.name}</div>
                  <div className="exam-date">
                    Exam: {new Date(exam.examDate + 'T00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {!isPast && (
                    <span className={`days-badge ${badgeClass} ${isUrgent ? 'pulse' : ''}`}>
                      {days === 0 ? 'Today!' : `${days}d left`}
                    </span>
                  )}
                  {isPast && (
                    <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                      Past
                    </span>
                  )}
                </div>
              </div>

              <div className="subjects-list" style={{ marginBottom: 0 }}>
                {exam.Subjects?.map((s) => (
                  <div key={s.id} className="subject-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <SubjectIcon name={s.name} size={14} />
                    <span className={`dot ${s.difficulty}`} />
                    <span>{s.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>{s.difficulty[0].toUpperCase()}</span>
                    <button
                      type="button"
                      className="subject-chip-remove"
                      onClick={() => deleteSubject(exam.id, s.id)}
                      aria-label={`Remove ${s.name}`}
                    >
                      <HiXMark style={{ fontSize: 12 }} />
                    </button>
                  </div>
                ))}
                {!isPast && (
                  <button type="button" className="subject-add-btn" onClick={() => setAddSubjectTo(exam)}>
                    <HiPlus style={{ fontSize: 14 }} />
                    Subject
                  </button>
                )}
              </div>

              {totalSessions > 0 && (
                <div className="study-load-row">
                  <span>Study load:</span>
                  <div className="study-load-bar">
                    <div className="study-load-fill" style={{ width: `${loadPct}%` }} />
                  </div>
                  <span>{remainingSessions} sessions remaining</span>
                </div>
              )}
            </div>
          );
        })
      )}

      {showAdd && <AddExamModal onClose={() => setShowAdd(false)} onCreated={(e) => setExams([e, ...exams])} />}
      {addSubjectTo && (
        <AddSubjectModal
          exam={addSubjectTo}
          onClose={() => setAddSubjectTo(null)}
          onAdded={(sub) => {
            setExams((prev) => prev.map((e) => (e.id === addSubjectTo.id ? { ...e, Subjects: [...(e.Subjects || []), sub] } : e)));
            setAddSubjectTo(null);
          }}
        />
      )}
    </div>
  );
}
