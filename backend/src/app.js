import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middlewares/errorHandler.js';

// Rotas do aplicativo
// MVC: routes apenas roteiam requests, controllers recebem/retornam respostas,
// services encapsulam regras de negócio e repositories acessam o banco de dados.
import userRoutes from './modules/users/user.routes.js';
import evaluationRoutes from './modules/evaluations/evaluation.routes.js';
import competencyRoutes from './modules/competencies/competency.routes.js';
import nineBoxRoutes from './modules/ninebox/ninebox.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';
import exportRoutes from './modules/reports/export.routes.js';
import campaignRoutes from './modules/campaigns/campaign.routes.js';
import campaignWizardRoutes from './modules/campaigns/campaign.wizard.routes.js';
import groupRoutes from './modules/groups/group.routes.js';
import templateRoutes from './modules/templates/template.routes.js';
import passwordResetRoutes from './modules/auth/password-reset.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';
import auditRoutes from './modules/audit/audit.routes.js';

const app = express();

// Middlewares
app.use(helmet());

// CORS com credentials para aceitar cookies
// Aceitar múltiplas origens (localhost e 127.0.0.1)
const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

// Adicionar origens do ambiente se existirem
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
if (process.env.CORS_ORIGIN) {
  allowedOrigins.push(process.env.CORS_ORIGIN);
}

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origin (como Postman, curl, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas
app.use('/api/users', userRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/competencies', competencyRoutes);
app.use('/api/ninebox', nineBoxRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/campaigns/wizard', campaignWizardRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit', auditRoutes);

// Error handler (sempre por último)
app.use(errorHandler);

export default app;
