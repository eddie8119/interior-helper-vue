import express from 'express';

import {
  checkUserExists,
  deleteUser,
  getCurrentUser,
  register,
  updateUser,
} from '@/controllers/user';
import { validateAuth } from '@/middleware/validateAuth';

const router = express.Router();

router.post('/register', register);
router.get('/profile', getCurrentUser);
router.put('/user/:documentId', validateAuth, updateUser);
router.delete('/user/:documentId', validateAuth, deleteUser);
router.get('/check/:email', validateAuth, checkUserExists);

export default router;
