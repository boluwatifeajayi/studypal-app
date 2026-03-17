import { StudySession, Exam, Subject } from '../models/index.js';
import { Op } from 'sequelize';

export const getTodaySessions = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const sessions = await StudySession.findAll({
      where: { userId: req.user.id, date: today },
      include: [{ model: Exam, attributes: ['name', 'examDate'] }, { model: Subject, attributes: ['name', 'difficulty'] }],
      order: [['id', 'ASC']],
    });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const isValidDate = (str) => /^\d{4}-\d{2}-\d{2}$/.test(str) && !Number.isNaN(Date.parse(str));

export const getSessionsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    if (!isValidDate(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }
    const sessions = await StudySession.findAll({
      where: { userId: req.user.id, date },
      include: [{ model: Exam, attributes: ['name', 'examDate'] }, { model: Subject, attributes: ['name', 'difficulty'] }],
      order: [['id', 'ASC']],
    });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUpcomingSessions = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const sessions = await StudySession.findAll({
      where: { userId: req.user.id, date: { [Op.gte]: today } },
      include: [{ model: Exam, attributes: ['name', 'examDate'] }, { model: Subject, attributes: ['name', 'difficulty'] }],
      order: [['date', 'ASC'], ['id', 'ASC']],
      limit: 30,
    });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const markComplete = async (req, res) => {
  try {
    const session = await StudySession.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    session.completed = !session.completed;
    await session.save();
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const total = await StudySession.count({ where: { userId: req.user.id } });
    const completed = await StudySession.count({ where: { userId: req.user.id, completed: true } });
    const todayTotal = await StudySession.count({ where: { userId: req.user.id, date: today } });
    const todayDone = await StudySession.count({ where: { userId: req.user.id, date: today, completed: true } });
    res.json({ total, completed, todayTotal, todayDone });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};