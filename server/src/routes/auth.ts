import express from 'express';

import { login, logout, refresh } from '@/controllers/auth';
import { validateAuth } from '@/middleware/validateAuth';

const router = express.Router();

router.post('/login', validateAuth, login);
router.post('/logout', logout);
router.post('/token/refresh', refresh);

export default router;
