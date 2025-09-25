import express from 'express';

import {
  createDraft,
  deleteDraft,
  getDraft,
  getDrafts,
  updateDraft,
} from '@/controllers/draft';
import { authMiddleware, requireUserId } from '@/middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.get('/', requireUserId, getDrafts);
router.post('/', requireUserId, createDraft);
router.get('/:id', requireUserId, getDraft);
router.patch('/:id', requireUserId, updateDraft);
router.delete('/:id', requireUserId, deleteDraft);

export default router;
