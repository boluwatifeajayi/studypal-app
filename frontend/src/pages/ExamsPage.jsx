import { useState, useEffect } from 'react';
import { api } from '../utils/api.js';
import toast from 'react-hot-toast';

const DiffBadge = ({ d }) => <span className={`badge badge-${d}`}>{d}</span>;
const daysUntil = (dateStr) => Math.ceil((new Date(dateStr + 'T00:00') - new Date().setHours(0,0,0,0)) / 86400000);

function AddExamModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [subjects, setSubjects] = useState([{ name: '', difficulty: 'medium' }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const addSubjectRow = () => setSubjects([...subjects, { name: '', difficulty: 'medium' }]);
  const removeRow = (i) => setSubjects(subjects.filter((_, idx) => idx !== i));
  const updateRow = (i, field, val) => setSubjects(subjects.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const validSubs = subjects.filter(s => s.name.trim());
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

  // Min date = tomorrow
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">➕ Add New Exam</div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Exam Name *</label>
              <input className="form-input" placeholder="e.g. Calculus Final" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Exam Date *</label>
              <input className="form-input" type="date" min={minDate} value={examDate} onChange={e => setExamDate(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ marginBottom: 8 }}>Subjects</label>
            {subjects.map((s, i) => (
              <div key={i} className="subject-row">
                <input className="form-input" placeholder="Subject name" value={s.name} onChange={e => updateRow(i, 'name', e.target.value)} />
                <select className="form-select" style={{ width: 'auto' }} value={s.difficulty} onChange={e => updateRow(i, 'difficulty', e.target.value)}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                {subjects.length > 1 && <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeRow(i)}>✕</button>}
              </div>
            ))}
            <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={addSubjectRow}>+ Add Subject</button>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating…' : 'Create Exam'}</button>
          </div>
        </form>
      </div>
    </div>
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

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 360 }}>
        <div className="modal-title">Add Subject to {exam.name}</div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Subject Name</label>
            <input className="form-input" placeholder="e.g. Thermodynamics" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Difficulty</label>
            <select className="form-select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Adding…' : 'Add Subject'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addSubjectTo, setAddSubjectTo] = useState(null);

  useEffect(() => {
    api.get('/exams').then(setExams).finally(() => setLoading(false));
  }, []);

  const deleteExam = async (id) => {
    if (!confirm('Delete this exam and all its study sessions?')) return;
    try {
      await api.delete(`/exams/${id}`);
      setExams(exams.filter(e => e.id !== id));
      toast.success('Exam deleted');
    } catch (err) {
      toast.error('Failed to delete exam');
    }
  };

  const deleteSubject = async (examId, subjectId) => {
    if (!confirm('Delete this subject?')) return;
    try {
      await api.delete(`/exams/${examId}/subjects/${subjectId}`);
      setExams(exams.map(e => e.id === examId ? { ...e, Subjects: e.Subjects.filter(s => s.id !== subjectId) } : e));
      toast.success('Subject deleted');
    } catch (err) {
      toast.error('Failed to delete subject');
    }
  };

  if (loading) return <div className="empty"><div className="empty-icon">⏳</div></div>;

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">📋 My Exams</div>
          <div className="section-subtitle">Manage your exams and subjects</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ New Exam</button>
      </div>

      {exams.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📚</div>
          <p className="empty-text">No exams yet. Add your first exam to get started!</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowAdd(true)}>Add Exam</button>
        </div>
      ) : (
        exams.map(exam => {
          const days = daysUntil(exam.examDate);
          const isPast = days < 0;
          return (
            <div key={exam.id} className="exam-card">
              <div className="exam-header">
                <div>
                  <div className="exam-name">{exam.name}</div>
                  <div className="exam-date">Exam: {new Date(exam.examDate + 'T00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {!isPast && <span className="days-badge">{days === 0 ? 'Today!' : `${days}d left`}</span>}
                  {isPast && <span className="badge" style={{ background: '#f3f4f6', color: '#9ca3af' }}>Past</span>}
                  <button className="btn btn-ghost btn-sm" onClick={() => deleteExam(exam.id)} title="Delete exam">🗑️</button>
                </div>
              </div>

              <div className="subjects-list" style={{ marginBottom: 10 }}>
                {exam.Subjects?.map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 20, padding: '3px 10px', fontSize: 13 }}>
                    {s.name}
                    <span style={{ marginLeft: 2 }}><span className={`badge badge-${s.difficulty}`} style={{ fontSize: 10 }}>{s.difficulty[0].toUpperCase()}</span></span>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: '0 0 0 2px', fontSize: 11, lineHeight: 1 }} onClick={() => deleteSubject(exam.id, s.id)}>✕</button>
                  </div>
                ))}
                {!isPast && (
                  <button className="btn btn-secondary btn-sm" style={{ borderRadius: 20, fontSize: 12 }} onClick={() => setAddSubjectTo(exam)}>+ Subject</button>
                )}
              </div>
            </div>
          );
        })
      )}

      {showAdd && <AddExamModal onClose={() => setShowAdd(false)} onCreated={e => setExams([e, ...exams])} />}
      {addSubjectTo && <AddSubjectModal exam={addSubjectTo} onClose={() => setAddSubjectTo(null)} onAdded={(sub) => {
        setExams(exams.map(e => e.id === addSubjectTo.id ? { ...e, Subjects: [...(e.Subjects || []), sub] } : e));
        setAddSubjectTo(null);
      }} />}
    </div>
  );
}