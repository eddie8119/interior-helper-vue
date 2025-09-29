import express from 'express';

import { getUserSettings, updateUserSettings } from '@/controllers/user-settings';
import { authMiddleware, requireUserId } from '@/middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.get('/', requireUserId, getUserSettings);
router.put('/', requireUserId, updateUserSettings);

export default router;
