/**
 * server.js — ponto de entrada da aplicação
 *
 * IMPORTANTE sobre ES Modules e dotenv:
 * Em ES Modules os `import` são hoisted (avaliados antes do código do módulo).
 * Isso significa que app.js é carregado ANTES que dotenv/config execute,
 * tornando process.env inacessível no topo de app.js durante desenvolvimento local.
 *
 * Solução: usamos `--env-file` do Node 20+ OU mantemos dotenv/config aqui
 * e garantimos que app.js leia process.env apenas em runtime (dentro de funções),
 * não em variáveis de módulo no topo.
 *
 * No Render: as variáveis já estão em process.env ANTES do processo Node iniciar,
 * então dotenv não é necessário lá — mas não atrapalha.
 */
import 'dotenv/config';
import app from './src/app.js';
import { prisma } from './src/config/database.js';

const PORT     = process.env.PORT     || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  console.log(`[SERVER] ✅ Rodando na porta ${PORT} | NODE_ENV=${NODE_ENV}`);
  console.log(`[SERVER] Health: http://localhost:${PORT}/health`);
  console.log(`[SERVER] Frontend: http://localhost:${PORT}/frontend-ref/pages/login.html`);
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────
const gracefulShutdown = async (signal) => {
  console.log(`[SERVER] ${signal} recebido — encerrando...`);

  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log('[SERVER] Banco desconectado. Encerrado com sucesso.');
      process.exit(0);
    } catch (err) {
      console.error('[SERVER] Erro ao desconectar banco:', err);
      process.exit(1);
    }
  });

  // Força encerramento após 10s se o servidor não fechar
  setTimeout(() => {
    console.error('[SERVER] Timeout de shutdown — forçando encerramento.');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('[SERVER] UnhandledRejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[SERVER] UncaughtException:', err);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});
