import express from 'express';

import authRoutes from './auth';
import commonRoutes from './common';
import draftRoutes from './draft';
import projectRoutes from './project';
import taskRoutes from './task';
import userRoutes from './user';

const app = express();

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/common', commonRoutes);
app.use('/api/draft', draftRoutes);

export default app;
