// Deterministic daily motivation – seed by date so same quote all day
const QUOTES = [
  'The expert in anything was once a beginner.',
  'Small steps lead to big results.',
  'Discipline is choosing between what you want now and what you want most.',
  'Your future is created by what you do today.',
  'Study not for school but for life.',
  'The only way to do great work is to love what you study.',
  'Success is the sum of small efforts repeated day in and day out.',
  'Learn something new every day.',
  "Today's preparation determines tomorrow's achievement.",
  'Focus on progress, not perfection.',
  'Every expert was once a beginner.',
  'The harder you work, the luckier you get.',
  'Invest in your mind. It pays the best interest.',
  "Don't watch the clock; do what it does. Keep going.",
  'Learning is a treasure that follows its owner everywhere.',
  'Start where you are. Use what you have. Do what you can.',
  'The best time to plant a tree was 20 years ago. The second best time is now.',
  "You don't have to be great to start, but you have to start to be great.",
  'Knowledge is power. Stay curious.',
  'One day or day one. You decide.',
  'Your attitude determines your direction.',
  'Excellence is not an act but a habit.',
  'Study hard, dream big.',
  'The only limit is the one you set yourself.',
  'Every session counts.',
  'Consistency beats intensity.',
  'Small progress is still progress.',
  'You are one study session away from a good mood.',
  'Trust the process.',
  'Make today count.',
];

export function getDailyQuote() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + today.getMonth() * 100 + today.getDate();
  const index = seed % QUOTES.length;
  return QUOTES[index];
}

export function getRandomQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}
