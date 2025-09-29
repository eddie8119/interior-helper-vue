import express from 'express';

import {
  checkReminders,
  getPendingReminders,
  resetReminderStatus,
} from '@/controllers/notification';
import { authMiddleware, requireUserId } from '@/middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.post('/check-reminders', requireUserId, checkReminders);
router.get('/pending-reminders', requireUserId, getPendingReminders);
router.post('/reset-reminder/:taskId', requireUserId, resetReminderStatus);

export default router;
