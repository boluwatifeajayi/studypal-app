import { Exam, Subject, StudySession, sequelize } from '../models/index.js';
import { generateStudyPlan } from '../services/studyPlanService.js';

export const getExams = async (req, res) => {
  try {
    const exams = await Exam.findAll({
      where: { userId: req.user.id },
      include: [{ model: Subject }],
      order: [['examDate', 'ASC']],
    });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createExam = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { name, examDate, subjects } = req.body;
    if (!name || !examDate) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Name and exam date required' });
    }

    const today = new Date(); today.setHours(0,0,0,0);
    const date = new Date(examDate);
    if (date <= today) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Exam date must be in the future' });
    }

    const exam = await Exam.create({ name, examDate, userId: req.user.id }, { transaction });

    if (subjects && subjects.length > 0) {
      const subjectRows = subjects.map(({ name: sName, difficulty }) => ({
        name: sName, difficulty: difficulty || 'medium', examId: exam.id,
      }));
      await Subject.bulkCreate(subjectRows, { transaction });
      const created = await Subject.findAll({ where: { examId: exam.id }, transaction });
      await generateStudyPlan(exam, created, transaction);
    }

    await transaction.commit();

    const result = await Exam.findByPk(exam.id, { include: [{ model: Subject }] });
    res.status(201).json(result);
  } catch (err) {
    await transaction.rollback();
    res.status(400).json({ error: err.message });
  }
};

export const getExam = async (req, res) => {
  try {
    const exam = await Exam.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: Subject }],
    });
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    res.json(exam);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    await exam.destroy();
    res.json({ message: 'Exam deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addSubject = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const exam = await Exam.findOne({ where: { id: req.params.id, userId: req.user.id }, transaction });
    if (!exam) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Exam not found' });
    }

    const { name, difficulty } = req.body;
    if (!name) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Subject name required' });
    }

    const subject = await Subject.create({ name, difficulty: difficulty || 'medium', examId: exam.id }, { transaction });

    // Regenerate study plan
    const allSubjects = await Subject.findAll({ where: { examId: exam.id }, transaction });
    await generateStudyPlan(exam, allSubjects, transaction);

    await transaction.commit();

    res.status(201).json(subject);
  } catch (err) {
    await transaction.rollback();
    res.status(400).json({ error: err.message });
  }
};

export const deleteSubject = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const exam = await Exam.findOne({ where: { id: req.params.examId, userId: req.user.id }, transaction });
    if (!exam) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Exam not found' });
    }

    const subject = await Subject.findOne({ where: { id: req.params.subjectId, examId: exam.id }, transaction });
    if (!subject) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Subject not found' });
    }

    await subject.destroy({ transaction });

    const allSubjects = await Subject.findAll({ where: { examId: exam.id }, transaction });
    await generateStudyPlan(exam, allSubjects, transaction);

    await transaction.commit();

    res.json({ message: 'Subject deleted' });
  } catch (err) {
    await transaction.rollback();
    res.status(500).json({ error: err.message });
  }
};