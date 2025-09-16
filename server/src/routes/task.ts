import express from 'express';

import {
  createTask,
  deleteTask,
  getTaskById,
  getTasksByProjectId,
  updateTask,
  updateTasks,
} from '@/controllers/task';
import { authMiddleware } from '@/middleware/auth';

const router = express.Router();

// 應用認證中間件到所有任務路由
router.use(authMiddleware);

// 批次任務操作
router.get('/:projectId', getTasksByProjectId);
router.patch('/:projectId', updateTasks);

// 單個任務操作
router.post('/:projectId', createTask);
router.get('/detail/:id', getTaskById);
router.patch('/detail/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
