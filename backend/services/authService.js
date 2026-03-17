import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export const register = async ({ name, email, password }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new Error('Email already registered');
  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashed });
  const token = generateToken(user.id);
  return { token, user: sanitize(user) };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error('Invalid email or password');
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Invalid email or password');
  const token = generateToken(user.id);
  return { token, user: sanitize(user) };
};

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const sanitize = (user) => ({ id: user.id, name: user.name, email: user.email, reminderEnabled: user.reminderEnabled ?? true });