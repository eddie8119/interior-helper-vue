import express from 'express';

import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  updateProject,
  getOverviewProjects,
} from '@/controllers/project';
import { authMiddleware, requireUserId } from '@/middleware/auth';

const router = express.Router();

router.use(authMiddleware);

// 用於概覽頁面
router.get('/overview', requireUserId, getOverviewProjects);
router.get('/', requireUserId, getProjects);
router.get('/:id', requireUserId, getProject);
router.post('/', requireUserId, createProject);
router.patch('/:id', requireUserId, updateProject);
router.delete('/:id', requireUserId, deleteProject);

export default router;
