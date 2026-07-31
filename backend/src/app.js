import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorHandler } from './middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
import groupRoutes from './modules/groups/group.routes.js';
import passwordResetRoutes from './modules/auth/password-reset.routes.js';
import auditRoutes from './modules/audit/audit.routes.js';

const app = express();
const NODE_ENV = process.env.NODE_ENV || 'development';

// =============================================
// CORS — Configuração centralizada
// =============================================

/**
 * Constrói a lista de origens permitidas a partir de variáveis de ambiente
 * e de origens fixas para desenvolvimento local.
 *
 * Variáveis reconhecidas:
 *   FRONTEND_URL   — URL principal do frontend (ex: https://meu-app.vercel.app)
 *   CORS_ORIGINS   — Lista extra separada por vírgula, para múltiplos domínios
 */
function buildAllowedOrigins() {
  const origins = new Set([
    // Desenvolvimento local — live-server padrão
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    // Desenvolvimento local — porta do próprio backend
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    // Variações comuns de porta em dev
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:4200',
    'http://127.0.0.1:4200',
  ]);

  // URL principal do frontend definida em variável de ambiente
  if (process.env.FRONTEND_URL) {
    origins.add(process.env.FRONTEND_URL.trim());
  }

  // Lista extra separada por vírgula (ex: "https://a.vercel.app,https://b.vercel.app")
  if (process.env.CORS_ORIGINS) {
    process.env.CORS_ORIGINS.split(',').forEach(o => {
      const trimmed = o.trim();
      if (trimmed) origins.add(trimmed);
    });
  }

  return [...origins];
}

const allowedOrigins = buildAllowedOrigins();

if (NODE_ENV === 'development') {
  console.log('[CORS] Origens permitidas:', allowedOrigins);
}

app.use(cors({
  origin: (origin, callback) => {
    // Sem origin → Postman, curl, same-origin, mobile apps → permitir
    if (!origin) {
      if (NODE_ENV === 'development') {
        console.log('[CORS] Requisição sem origin → permitida');
      }
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      if (NODE_ENV === 'development') {
        console.log(`[CORS] Origin permitida: ${origin}`);
      }
      return callback(null, true);
    }

    // Em desenvolvimento, logar a origem bloqueada para facilitar debug
    console.warn(`[CORS] Origin BLOQUEADA: ${origin}`);
    console.warn(`[CORS] Adicione esta URL em FRONTEND_URL ou CORS_ORIGINS no .env`);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// =============================================
// HELMET — Content Security Policy
// =============================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net"
      ],
      // Necessário para onclick="..." e outros event handlers inline no HTML
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net"
      ],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      // connectSrc precisa incluir o backend explicitamente quando o frontend
      // roda em porta diferente (dev com live-server) e também o domínio
      // do Render em produção.
      connectSrc: [
        "'self'",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        ...(process.env.BACKEND_URL ? [process.env.BACKEND_URL] : []),
        ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
      ],
      workerSrc: ["'self'", "blob:"],
    },
  },
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve o frontend estático sob /frontend-ref
// Mantém os caminhos absolutos que o código frontend já usa (ex: /frontend-ref/pages/login.html)
app.use('/frontend-ref', express.static(path.join(__dirname, '../../frontend-ref')));

// Redireciona a raiz para a tela de login
app.get('/', (req, res) => {
  res.redirect('/frontend-ref/pages/login.html');
});

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
app.use('/api/groups', groupRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/audit', auditRoutes);

// Error handler (sempre por último)
app.use(errorHandler);

export default app;
