const STREAK_KEY = 'studypal_streak';

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export function getStreak() {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { streak: 0, lastCompletedDate: null };
    const data = JSON.parse(raw);
    const today = todayStr();
    const yesterday = yesterdayStr();
    const last = data.lastCompletedDate;
    if (!last) return { streak: 0, lastCompletedDate: null };
    if (last === today || last === yesterday) return { streak: data.streak || 0, lastCompletedDate: last };
    return { streak: 0, lastCompletedDate: null };
  } catch {
    return { streak: 0, lastCompletedDate: null };
  }
}

export function recordSessionCompletedToday() {
  const today = todayStr();
  const yesterday = yesterdayStr();
  const current = getStreak();
  let newStreak = current.streak;
  if (current.lastCompletedDate === today) {
    // already recorded today
  } else if (current.lastCompletedDate === yesterday) {
    newStreak += 1;
  } else {
    newStreak = 1;
  }
  localStorage.setItem(STREAK_KEY, JSON.stringify({ lastCompletedDate: today, streak: newStreak }));
  return newStreak;
}
