import express from 'express';

import {
  createTask,
  deleteTask,
  getTaskById,
  getTasksByProjectId,
  updateTask,
  updateTasks,
} from '@/controllers/task';
import { authMiddleware, requireUserId } from '@/middleware/auth';

const router = express.Router();

// 應用認證中間件到所有任務路由
router.use(authMiddleware);

// 批次任務操作
router.get('/:projectId', requireUserId, getTasksByProjectId);
router.patch('/:projectId', requireUserId, updateTasks);

// 單個任務操作
router.post('/:projectId', requireUserId, createTask);
router.get('/detail/:id', requireUserId, getTaskById);
router.patch('/detail/:id', requireUserId, updateTask);
router.delete('/:id', requireUserId, deleteTask);

export default router;
