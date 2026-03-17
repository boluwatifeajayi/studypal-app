// routes/cronRoutes.js
import express from 'express';
import { sendReminders } from '../services/cronService.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/trigger-reminders', authenticate, async (req, res) => {
  try {
    await sendReminders();
    res.status(200).send('Reminders sent successfully');
  } catch (err) {
    console.error('[Cron] Error:', err);
    res.status(500).send('Failed to send reminders');
  }
});

export default router;