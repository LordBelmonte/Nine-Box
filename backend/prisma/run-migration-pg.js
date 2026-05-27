/**
 * Script para aplicar a migration diretamente via driver pg (sem Prisma)
 * Usa a DATABASE_URL (pooler porta 6543) que funciona neste ambiente
 */
import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Client } = pg;

// Lê a DATABASE_URL do .env manualmente
const envContent = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../.env'), 'utf8');
const dbUrlMatch = envContent.match(/^DATABASE_URL="?([^"\n]+)"?/m);
if (!dbUrlMatch) {
  console.error('DATABASE_URL não encontrada no .env');
  process.exit(1);
}

const connectionString = dbUrlMatch[1];
console.log('🔌 Conectando via pooler:', connectionString.replace(/:([^:@]+)@/, ':***@'));

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

const steps = [
  // 1. Remover índices antigos
  [`DROP INDEX IF EXISTS "evaluations_tipoAvaliacao_idx"`, 'Remover índice tipoAvaliacao'],
  [`DROP INDEX IF EXISTS "evaluations_anonima_idx"`, 'Remover índice anonima'],

  // 2. Remover FKs da tabela evaluations
  [`ALTER TABLE "evaluations" DROP CONSTRAINT IF EXISTS "evaluations_avaliadorId_fkey"`, 'Remover FK avaliadorId'],
  [`ALTER TABLE "evaluations" DROP CONSTRAINT IF EXISTS "evaluations_avaliadoId_fkey"`, 'Remover FK avaliadoId'],

  // 3. Dropar tabela evaluations antiga
  [`DROP TABLE IF EXISTS "evaluations"`, 'Dropar tabela evaluations antiga'],

  // 4. Remover enum antigo
  [`DROP TYPE IF EXISTS "TipoAvaliacao"`, 'Remover enum TipoAvaliacao'],

  // 5. Criar enum CampaignStatus
  [`DO $$ BEGIN
    CREATE TYPE "CampaignStatus" AS ENUM ('planejamento', 'ativa', 'finalizada');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$`, 'Criar enum CampaignStatus'],

  // 6. Criar tabela gestor_colaborador
  [`CREATE TABLE IF NOT EXISTS "gestor_colaborador" (
    "id" TEXT NOT NULL,
    "gestorId" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "gestor_colaborador_pkey" PRIMARY KEY ("id")
  )`, 'Criar tabela gestor_colaborador'],

  // 7. Criar tabela evaluation_campaigns
  [`CREATE TABLE IF NOT EXISTS "evaluation_campaigns" (
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
  )`, 'Criar tabela evaluation_campaigns'],

  // 8. Criar tabela campaign_gestores
  [`CREATE TABLE IF NOT EXISTS "campaign_gestores" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "gestorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "campaign_gestores_pkey" PRIMARY KEY ("id")
  )`, 'Criar tabela campaign_gestores'],

  // 9. Criar nova tabela evaluations
  [`CREATE TABLE IF NOT EXISTS "evaluations" (
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
  )`, 'Criar nova tabela evaluations'],

  // 10. Índices gestor_colaborador
  [`CREATE UNIQUE INDEX IF NOT EXISTS "gestor_colaborador_gestorId_colaboradorId_key" ON "gestor_colaborador"("gestorId", "colaboradorId")`, 'Índice único gestor_colaborador'],
  [`CREATE INDEX IF NOT EXISTS "gestor_colaborador_gestorId_idx" ON "gestor_colaborador"("gestorId")`, 'Índice gestorId'],
  [`CREATE INDEX IF NOT EXISTS "gestor_colaborador_colaboradorId_idx" ON "gestor_colaborador"("colaboradorId")`, 'Índice colaboradorId'],

  // 11. Índices evaluation_campaigns
  [`CREATE INDEX IF NOT EXISTS "evaluation_campaigns_status_idx" ON "evaluation_campaigns"("status")`, 'Índice status campaigns'],

  // 12. Índices campaign_gestores
  [`CREATE UNIQUE INDEX IF NOT EXISTS "campaign_gestores_campaignId_gestorId_key" ON "campaign_gestores"("campaignId", "gestorId")`, 'Índice único campaign_gestores'],
  [`CREATE INDEX IF NOT EXISTS "campaign_gestores_campaignId_idx" ON "campaign_gestores"("campaignId")`, 'Índice campaignId'],
  [`CREATE INDEX IF NOT EXISTS "campaign_gestores_gestorId_idx" ON "campaign_gestores"("gestorId")`, 'Índice gestorId em campaign_gestores'],

  // 13. Índices evaluations
  [`CREATE UNIQUE INDEX IF NOT EXISTS "evaluations_campaignId_avaliadorId_avaliadoId_key" ON "evaluations"("campaignId", "avaliadorId", "avaliadoId")`, 'Índice único evaluations'],
  [`CREATE INDEX IF NOT EXISTS "evaluations_campaignId_idx" ON "evaluations"("campaignId")`, 'Índice campaignId em evaluations'],
  [`CREATE INDEX IF NOT EXISTS "evaluations_avaliadoId_idx" ON "evaluations"("avaliadoId")`, 'Índice avaliadoId'],
  [`CREATE INDEX IF NOT EXISTS "evaluations_avaliadorId_idx" ON "evaluations"("avaliadorId")`, 'Índice avaliadorId'],
  [`CREATE INDEX IF NOT EXISTS "evaluations_data_idx" ON "evaluations"("data")`, 'Índice data'],

  // 14. FKs gestor_colaborador
  [`ALTER TABLE "gestor_colaborador" ADD CONSTRAINT "gestor_colaborador_gestorId_fkey"
    FOREIGN KEY ("gestorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`, 'FK gestorId em gestor_colaborador'],
  [`ALTER TABLE "gestor_colaborador" ADD CONSTRAINT "gestor_colaborador_colaboradorId_fkey"
    FOREIGN KEY ("colaboradorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`, 'FK colaboradorId em gestor_colaborador'],

  // 15. FKs campaign_gestores
  [`ALTER TABLE "campaign_gestores" ADD CONSTRAINT "campaign_gestores_campaignId_fkey"
    FOREIGN KEY ("campaignId") REFERENCES "evaluation_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE`, 'FK campaignId em campaign_gestores'],
  [`ALTER TABLE "campaign_gestores" ADD CONSTRAINT "campaign_gestores_gestorId_fkey"
    FOREIGN KEY ("gestorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`, 'FK gestorId em campaign_gestores'],

  // 16. FKs evaluations
  [`ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_campaignId_fkey"
    FOREIGN KEY ("campaignId") REFERENCES "evaluation_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE`, 'FK campaignId em evaluations'],
  [`ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_avaliadorId_fkey"
    FOREIGN KEY ("avaliadorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`, 'FK avaliadorId em evaluations'],
  [`ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_avaliadoId_fkey"
    FOREIGN KEY ("avaliadoId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`, 'FK avaliadoId em evaluations'],

  // 17. Registrar migration na tabela do Prisma
  [`DO $$
   BEGIN
     IF NOT EXISTS (
       SELECT 1 FROM "_prisma_migrations" WHERE migration_name = '20260526000000_group_campaigns'
     ) THEN
       INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count")
       VALUES (gen_random_uuid()::text, 'manual-20260526', NOW(), '20260526000000_group_campaigns', NULL, NULL, NOW(), 1);
     END IF;
   END $$`, 'Registrar migration no histórico Prisma']
];

async function run() {
  await client.connect();
  console.log('✅ Conectado ao banco!\n');
  console.log(`🚀 Aplicando ${steps.length} passos da migration...\n`);

  for (let i = 0; i < steps.length; i++) {
    const [sql, desc] = steps[i];
    try {
      await client.query(sql);
      console.log(`  ✅ [${i + 1}/${steps.length}] ${desc}`);
    } catch (err) {
      const msg = err.message || '';
      // Ignorar erros de "já existe" / "não existe" para idempotência
      if (
        msg.includes('already exists') ||
        msg.includes('does not exist') ||
        msg.includes('duplicate key')
      ) {
        console.log(`  ⚠️  [${i + 1}/${steps.length}] Ignorado (já existe/não existe): ${desc}`);
      } else {
        console.error(`  ❌ [${i + 1}/${steps.length}] ERRO em "${desc}": ${msg}`);
        throw err;
      }
    }
  }

  console.log('\n🎉 Migration aplicada com sucesso!');
}

run()
  .catch(e => {
    console.error('\n❌ Falha:', e.message);
    process.exit(1);
  })
  .finally(() => client.end());
