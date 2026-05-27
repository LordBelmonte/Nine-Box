/**
 * Script para aplicar a migration manualmente via Prisma $executeRawUnsafe
 * Usa a DATABASE_URL (pooler) que funciona neste ambiente
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const steps = [
  // 1. Remover índices antigos
  `DROP INDEX IF EXISTS "evaluations_tipoAvaliacao_idx"`,
  `DROP INDEX IF EXISTS "evaluations_anonima_idx"`,

  // 2. Remover FKs da tabela evaluations
  `ALTER TABLE "evaluations" DROP CONSTRAINT IF EXISTS "evaluations_avaliadorId_fkey"`,
  `ALTER TABLE "evaluations" DROP CONSTRAINT IF EXISTS "evaluations_avaliadoId_fkey"`,

  // 3. Dropar tabela evaluations antiga
  `DROP TABLE IF EXISTS "evaluations"`,

  // 4. Remover enum antigo
  `DROP TYPE IF EXISTS "TipoAvaliacao"`,

  // 5. Criar enum CampaignStatus
  `DO $$ BEGIN
    CREATE TYPE "CampaignStatus" AS ENUM ('planejamento', 'ativa', 'finalizada');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$`,

  // 6. Criar tabela gestor_colaborador
  `CREATE TABLE IF NOT EXISTS "gestor_colaborador" (
    "id" TEXT NOT NULL,
    "gestorId" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "gestor_colaborador_pkey" PRIMARY KEY ("id")
  )`,

  // 7. Criar tabela evaluation_campaigns
  `CREATE TABLE IF NOT EXISTS "evaluation_campaigns" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'planejamento',
    "criterios" JSONB NOT NULL,
    "tipoAlvo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "evaluation_campaigns_pkey" PRIMARY KEY ("id")
  )`,

  // 8. Criar tabela campaign_gestores
  `CREATE TABLE IF NOT EXISTS "campaign_gestores" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "gestorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "campaign_gestores_pkey" PRIMARY KEY ("id")
  )`,

  // 9. Criar nova tabela evaluations
  `CREATE TABLE IF NOT EXISTS "evaluations" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "avaliadorId" TEXT NOT NULL,
    "avaliadoId" TEXT NOT NULL,
    "criterios" JSONB NOT NULL,
    "media" DOUBLE PRECISION,
    "comentario" TEXT,
    "anonima" BOOLEAN NOT NULL DEFAULT true,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
  )`,

  // 10. Índices gestor_colaborador
  `CREATE UNIQUE INDEX IF NOT EXISTS "gestor_colaborador_gestorId_colaboradorId_key" ON "gestor_colaborador"("gestorId", "colaboradorId")`,
  `CREATE INDEX IF NOT EXISTS "gestor_colaborador_gestorId_idx" ON "gestor_colaborador"("gestorId")`,
  `CREATE INDEX IF NOT EXISTS "gestor_colaborador_colaboradorId_idx" ON "gestor_colaborador"("colaboradorId")`,

  // 11. Índices evaluation_campaigns
  `CREATE INDEX IF NOT EXISTS "evaluation_campaigns_status_idx" ON "evaluation_campaigns"("status")`,

  // 12. Índices campaign_gestores
  `CREATE UNIQUE INDEX IF NOT EXISTS "campaign_gestores_campaignId_gestorId_key" ON "campaign_gestores"("campaignId", "gestorId")`,
  `CREATE INDEX IF NOT EXISTS "campaign_gestores_campaignId_idx" ON "campaign_gestores"("campaignId")`,
  `CREATE INDEX IF NOT EXISTS "campaign_gestores_gestorId_idx" ON "campaign_gestores"("gestorId")`,

  // 13. Índices evaluations
  `CREATE UNIQUE INDEX IF NOT EXISTS "evaluations_campaignId_avaliadorId_avaliadoId_key" ON "evaluations"("campaignId", "avaliadorId", "avaliadoId")`,
  `CREATE INDEX IF NOT EXISTS "evaluations_campaignId_idx" ON "evaluations"("campaignId")`,
  `CREATE INDEX IF NOT EXISTS "evaluations_avaliadoId_idx" ON "evaluations"("avaliadoId")`,
  `CREATE INDEX IF NOT EXISTS "evaluations_avaliadorId_idx" ON "evaluations"("avaliadorId")`,
  `CREATE INDEX IF NOT EXISTS "evaluations_data_idx" ON "evaluations"("data")`,

  // 14. FKs gestor_colaborador
  `ALTER TABLE "gestor_colaborador" ADD CONSTRAINT "gestor_colaborador_gestorId_fkey"
    FOREIGN KEY ("gestorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "gestor_colaborador" ADD CONSTRAINT "gestor_colaborador_colaboradorId_fkey"
    FOREIGN KEY ("colaboradorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,

  // 15. FKs campaign_gestores
  `ALTER TABLE "campaign_gestores" ADD CONSTRAINT "campaign_gestores_campaignId_fkey"
    FOREIGN KEY ("campaignId") REFERENCES "evaluation_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "campaign_gestores" ADD CONSTRAINT "campaign_gestores_gestorId_fkey"
    FOREIGN KEY ("gestorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,

  // 16. FKs evaluations
  `ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_campaignId_fkey"
    FOREIGN KEY ("campaignId") REFERENCES "evaluation_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_avaliadorId_fkey"
    FOREIGN KEY ("avaliadorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_avaliadoId_fkey"
    FOREIGN KEY ("avaliadoId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,

  // 17. Registrar migration na tabela do Prisma
  `INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count")
   VALUES (
     gen_random_uuid()::text,
     'manual',
     NOW(),
     '20260526000000_group_campaigns',
     NULL,
     NULL,
     NOW(),
     1
   ) ON CONFLICT DO NOTHING`
];

async function run() {
  console.log('🚀 Aplicando migration: group_campaigns\n');

  for (let i = 0; i < steps.length; i++) {
    const sql = steps[i].trim();
    const preview = sql.split('\n')[0].substring(0, 70);
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log(`  ✅ [${i + 1}/${steps.length}] ${preview}`);
    } catch (err) {
      // Ignorar erros de "já existe" para idempotência
      if (
        err.message.includes('already exists') ||
        err.message.includes('does not exist') ||
        err.message.includes('duplicate')
      ) {
        console.log(`  ⚠️  [${i + 1}/${steps.length}] Ignorado (já existe): ${preview}`);
      } else {
        console.error(`  ❌ [${i + 1}/${steps.length}] ERRO: ${err.message}`);
        console.error(`     SQL: ${preview}`);
        throw err;
      }
    }
  }

  console.log('\n✅ Migration aplicada com sucesso!');
}

run()
  .catch(e => {
    console.error('\n❌ Falha na migration:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
