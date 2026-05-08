import 'dotenv/config';
import app from './src/app.js';
import { prisma } from './src/config/database.js';

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  if (NODE_ENV === 'development') {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🌍 Ambiente: ${NODE_ENV}`);
  }
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  if (NODE_ENV === 'development') {
    console.log(`\n${signal} recebido. Encerrando servidor...`);
  }
  
  server.close(async () => {
    if (NODE_ENV === 'development') {
      console.log('Servidor HTTP fechado');
    }
    
    try {
      await prisma.$disconnect();
      if (NODE_ENV === 'development') {
        console.log('Conexão com banco de dados fechada');
      }
      process.exit(0);
    } catch (error) {
      console.error('Erro ao fechar conexão com banco:', error);
      process.exit(1);
    }
  });

  // Força o encerramento após 10 segundos
  setTimeout(() => {
    console.error('Forçando encerramento após timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});
