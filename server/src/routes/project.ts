import express from 'express';

import {
  createProject,
  deleteProject,
  getOverviewProjects,
  getProject,
  getProjects,
  getSharedProject,
  toggleProjectShare,
  updateProject,
} from '@/controllers/project';
import { authMiddleware, requireUserId } from '@/middleware/auth';

const router = express.Router();

// 公開路由（不需要認證）
router.get('/shared/:id', getSharedProject);

router.use(authMiddleware);

router.get('/overview', requireUserId, getOverviewProjects); // 用於概覽頁面
router.get('/', requireUserId, getProjects);
router.get('/:id', requireUserId, getProject);
router.post('/', requireUserId, createProject);
router.patch('/:id', requireUserId, updateProject);
router.patch('/:id/share', requireUserId, toggleProjectShare);
router.delete('/:id', requireUserId, deleteProject);

export default router;
