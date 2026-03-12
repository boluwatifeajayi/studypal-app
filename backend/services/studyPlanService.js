import { StudySession, Subject } from '../models/index.js';

const DIFFICULTY_WEIGHT = { easy: 1, medium: 2, hard: 3 };
const MAX_SESSIONS_PER_DAY = 3;

// Generate a study plan for an exam.
export const generateStudyPlan = async (exam, subjects, transaction = null) => {
  if (!subjects || subjects.length === 0) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const examDate = new Date(exam.examDate);
  examDate.setHours(0, 0, 0, 0);

  // Calculate available days (exclude exam day itself)
  const msPerDay = 86400000;
  const daysAvailable = Math.floor((examDate - today) / msPerDay);
  if (daysAvailable <= 0) return;

  // Build weighted session list
  const totalWeight = subjects.reduce((s, sub) => s + DIFFICULTY_WEIGHT[sub.difficulty], 0);
  const totalSlots = daysAvailable * MAX_SESSIONS_PER_DAY;

  // Assign session counts per subject proportionally
  const subjectSessions = subjects.map((sub) => {
    const fraction = DIFFICULTY_WEIGHT[sub.difficulty] / totalWeight;
    return {
      subject: sub,
      count: Math.max(1, Math.round(fraction * totalSlots)),
    };
  });

  // Build flat list of (date, subjectId) pairs using round-robin across days
  const sessionQueue = buildSessionQueue(subjectSessions, daysAvailable, today);

  // Delete old sessions for this exam then bulk insert
  await StudySession.destroy({ where: { examId: exam.id }, transaction });

  const rows = sessionQueue.map(({ date, subject }) => ({
    date: formatDate(date),
    examId: exam.id,
    subjectId: subject.id,
    userId: exam.userId,
    completed: false,
  }));

  await StudySession.bulkCreate(rows, { transaction });
};

function buildSessionQueue(subjectSessions, daysAvailable, startDate) {
  const msPerDay = 86400000;
  // Expand each subject into an array of that many sessions
  const sessions = [];
  for (const { subject, count } of subjectSessions) {
    for (let i = 0; i < count; i++) sessions.push(subject);
  }

  // Shuffle for variety then distribute into day buckets
  shuffle(sessions);

  const buckets = Array.from({ length: daysAvailable }, () => []);
  for (const subject of sessions) {
    // Find day bucket with fewest sessions that still has room
    let assigned = false;
    for (let attempt = 0; attempt < daysAvailable; attempt++) {
      const idx = attempt % daysAvailable;
      if (buckets[idx].length < MAX_SESSIONS_PER_DAY) {
        buckets[idx].push(subject);
        assigned = true;
        break;
      }
    }
    // If all buckets full, skip (cap total sessions)
    if (!assigned) break;
  }

  const result = [];
  buckets.forEach((bucket, dayIndex) => {
    const date = new Date(startDate.getTime() + dayIndex * msPerDay);
    bucket.forEach((subject) => result.push({ date, subject }));
  });
  return result;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function formatDate(d) {
  return d.toISOString().split('T')[0];
}