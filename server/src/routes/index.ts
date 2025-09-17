import express from 'express';

import authRoutes from './auth';
import companyRoutes from './company';
import contractRoutes from './contract';
import invoiceRoutes from './invoice';
import projectRoutes from './project';
import taskRoutes from './task';
import userRoutes from './user';

const app = express();

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api', invoiceRoutes);
app.use('/api', companyRoutes);
app.use('/api', contractRoutes);

export default app;
