import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorHandler } from './middlewares/errorHandler.js';

import userRoutes          from './modules/users/user.routes.js';
import evaluationRoutes    from './modules/evaluations/evaluation.routes.js';
import competencyRoutes    from './modules/competencies/competency.routes.js';
import nineBoxRoutes       from './modules/ninebox/ninebox.routes.js';
import reportsRoutes       from './modules/reports/reports.routes.js';
import exportRoutes        from './modules/reports/export.routes.js';
import campaignRoutes      from './modules/campaigns/campaign.routes.js';
import groupRoutes         from './modules/groups/group.routes.js';
import passwordResetRoutes from './modules/auth/password-reset.routes.js';
import auditRoutes         from './modules/audit/audit.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// NODE_ENV — lido do process.env que o Render injeta antes de iniciar o processo
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PROD  = NODE_ENV === 'production';

// Log sempre visível — confirma ambiente no Render
console.log(`[APP] Iniciando... NODE_ENV=${NODE_ENV} | IS_PROD=${IS_PROD}`);

// ================================================================
// CORS — configuração centralizada e dinâmica
// ================================================================

/**
 * Constrói a lista de origens permitidas a partir das variáveis de ambiente.
 *
 * FRONTEND_URL  — URL principal do frontend (pode ser lista separada por vírgula)
 * BACKEND_URL   — URL pública deste servidor (incluída para same-domain fetches)
 * CORS_ORIGINS  — Lista extra separada por vírgula
 *
 * Em desenvolvimento local, origens localhost são incluídas automaticamente.
 */
function buildAllowedOrigins() {
  const origins = new Set();

  if (!IS_PROD) {
    ['http://localhost:5500', 'http://127.0.0.1:5500',
     'http://localhost:3000', 'http://127.0.0.1:3000',
     'http://localhost:8080', 'http://127.0.0.1:8080',
     'http://localhost:4200', 'http://127.0.0.1:4200',
    ].forEach(o => origins.add(o));
  }

  [process.env.FRONTEND_URL, process.env.BACKEND_URL, process.env.CORS_ORIGINS]
    .filter(Boolean)
    .flatMap(v => v.split(','))
    .map(v => v.trim().replace(/\/$/, ''))
    .filter(Boolean)
    .forEach(o => origins.add(o));

  return [...origins];
}

const allowedOrigins = buildAllowedOrigins();

// Logs de CORS — sempre visíveis para facilitar debug no Render
console.log('[CORS] FRONTEND_URL :', process.env.FRONTEND_URL  || '(vazio)');
console.log('[CORS] BACKEND_URL  :', process.env.BACKEND_URL   || '(vazio)');
console.log('[CORS] CORS_ORIGINS :', process.env.CORS_ORIGINS  || '(vazio)');
console.log('[CORS] Lista final  :', allowedOrigins.length ? allowedOrigins.join(', ') : '(somente same-origin)');

const app = express();

// ─── CORS deve vir ANTES do Helmet ───────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Sem Origin header = same-origin, Postman, curl, health checks → permitir
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/$/, '');

    if (allowedOrigins.includes(normalizedOrigin)) {
      console.log(`[CORS] ✅ Permitida: ${origin}`);
      return callback(null, true);
    }

    console.warn(`[CORS] ❌ Bloqueada: ${origin}`);
    console.warn(`[CORS]    → Adicione ao FRONTEND_URL ou CORS_ORIGINS no painel do Render`);
    return callback(new Error(`CORS: origem não permitida: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200, // Compatibilidade com browsers antigos (IE11)
}));

// ─── Helmet — Content Security Policy ────────────────────────────────────────
// connectSrc precisa incluir o domínio do Render para que fetch() funcione
// quando o frontend roda em porta diferente do backend em dev
const connectSrcDirectives = ["'self'"];
if (!IS_PROD) {
  connectSrcDirectives.push('http://localhost:3000', 'http://127.0.0.1:3000');
}
if (process.env.BACKEND_URL)  connectSrcDirectives.push(process.env.BACKEND_URL.trim().replace(/\/$/, ''));
if (process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL.split(',').forEach(u => {
    const t = u.trim().replace(/\/$/, '');
    if (t) connectSrcDirectives.push(t);
  });
}

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:    ["'self'"],
      scriptSrc:     ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com', 'https://cdn.jsdelivr.net'],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc:      ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdnjs.cloudflare.com', 'https://cdn.jsdelivr.net'],
      fontSrc:       ["'self'", 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com', 'https://cdn.jsdelivr.net'],
      imgSrc:        ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc:    connectSrcDirectives,
      workerSrc:     ["'self'", 'blob:'],
    },
  },
  crossOriginEmbedderPolicy: false, // Necessário para carregar recursos externos (fontes, CDN)
}));

// ─── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Frontend estático ────────────────────────────────────────────────────────
// O Render clona o repositório completo em /opt/render/project/src
// rootDir: backend muda apenas o CWD do processo para /opt/render/project/src/backend
// __dirname aqui = .../backend/src
// path.join(__dirname, '../../frontend-ref') = .../frontend-ref  ✓
const frontendPath = path.resolve(__dirname, '..', '..', 'frontend-ref');
console.log(`[STATIC] Servindo frontend de: ${frontendPath}`);

app.use('/frontend-ref', express.static(frontendPath, {
  // Sem cache em desenvolvimento para facilitar debug
  maxAge: IS_PROD ? '1d' : 0,
  // Fallthrough: se arquivo não existe, passa para o próximo handler (404 correto)
  fallthrough: true,
}));

// ─── Rotas especiais ──────────────────────────────────────────────────────────
app.get('/', (_req, res) => res.redirect('/frontend-ref/pages/login.html'));

app.get('/health', (_req, res) => res.json({
  status: 'ok',
  env:    NODE_ENV,
  ts:     new Date().toISOString(),
}));

// ─── API routes ───────────────────────────────────────────────────────────────
app.use('/api/users',          userRoutes);
app.use('/api/evaluations',    evaluationRoutes);
app.use('/api/competencies',   competencyRoutes);
app.use('/api/ninebox',        nineBoxRoutes);
app.use('/api/reports',        reportsRoutes);
app.use('/api/export',         exportRoutes);
app.use('/api/campaigns',      campaignRoutes);
app.use('/api/groups',         groupRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/audit',          auditRoutes);

// ─── Error handler — deve ser o último middleware ────────────────────────────
app.use(errorHandler);

export default app;
