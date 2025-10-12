import express from 'express';

import authRoutes from './auth';
import collaboratorRoutes from './collaborator';
import commonRoutes from './common';
import draftRoutes from './draft';
import invitationRoutes from './invitation';
import notificationRoutes from './notification';
import projectRoutes from './project';
import taskRoutes from './task';
import userRoutes from './user';
import userSettingsRoutes from './user-settings';

const app = express();

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/common', commonRoutes);
app.use('/api/draft', draftRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/user-settings', userSettingsRoutes);
app.use('/api/collaborators', collaboratorRoutes);
app.use('/api/invitations', invitationRoutes);

export default app;
