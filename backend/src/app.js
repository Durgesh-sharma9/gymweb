import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import signupRoutes from './routes/signup.routes.js';
import superAdminRoutes from './routes/superAdmin.routes.js';
import gymRoutes from './routes/gym.routes.js';
import memberRoutes from './routes/member.routes.js';
import planRoutes from './routes/plan.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import trainerRoutes from './routes/trainer.routes.js';
import expenseRoutes from './routes/expense.routes.js';
import registrationRoutes from './routes/registration.routes.js';
import utilityRoutes from './routes/utility.routes.js';
import publicRoutes from './routes/public.routes.js';
import contactRoutes from './routes/contact.routes.js';
import demoRoutes from './routes/demo.routes.js';
import onboardingRoutes from './routes/onboarding.routes.js';

const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/auth', signupRoutes);
app.use('/api/v1/super-admin', superAdminRoutes);
app.use('/api/v1/gym', gymRoutes);
app.use('/api/v1/members', memberRoutes);
app.use('/api/v1/plans', planRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/trainers', trainerRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/registrations', registrationRoutes);
app.use('/api/v1', utilityRoutes);
app.use('/api/v1', contactRoutes);
app.use('/api/v1', demoRoutes);
app.use('/api/v1', onboardingRoutes);
app.use('/api/v1/public', publicRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
