import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

import { sequelize } from './models/index.js';
import authRoutes from './routes/auth.js';
import examRoutes from './routes/exams.js';
import sessionRoutes from './routes/sessions.js';
import { startCronJobs } from './services/cronService.js';
import cronRoutes from './routes/cronRoutes.js';




const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;


// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://studypal-app.vercel.app',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/cron', cronRoutes);



// Health check (DB status, uptime, version for monitoring / real-world readiness)
const startTime = Date.now();
app.get('/api/health', async (req, res) => {
  let dbStatus = 'unknown';
  try {
    await sequelize.authenticate();
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected';
  }
  res.json({
    status: dbStatus === 'connected' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    database: dbStatus,
    version: process.env.npm_package_version || '1.0.0',
  });
});

// Start server
const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database synced');
    startCronJobs();
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
};

start();