-- ============================================================
-- Migration: Grupos gestor-colaborador + Campanhas de avaliação
-- ============================================================

-- Remover enum e índices antigos que não existem mais no schema
DROP INDEX IF EXISTS "evaluations_tipoAvaliacao_idx";
DROP INDEX IF EXISTS "evaluations_anonima_idx";

-- Remover coluna tipoAvaliacao da tabela evaluations (será substituída por campaignId)
-- Primeiro removemos a FK e depois a coluna
ALTER TABLE "evaluations" DROP CONSTRAINT IF EXISTS "evaluations_avaliadorId_fkey";
ALTER TABLE "evaluations" DROP CONSTRAINT IF EXISTS "evaluations_avaliadoId_fkey";

-- Recriar tabela evaluations com nova estrutura
DROP TABLE "evaluations";

-- Remover enum antigo
DROP TYPE IF EXISTS "TipoAvaliacao";

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('planejamento', 'ativa', 'finalizada');

-- CreateTable: grupos gestor-colaborador
CREATE TABLE "gestor_colaborador" (
    "id" TEXT NOT NULL,
    "gestorId" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gestor_colaborador_pkey" PRIMARY KEY ("id")
);

-- CreateTable: campanhas de avaliação
CREATE TABLE "evaluation_campaigns" (
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
);

-- CreateTable: gestores responsáveis por campanha
CREATE TABLE "campaign_gestores" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "gestorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_gestores_pkey" PRIMARY KEY ("id")
);

-- CreateTable: avaliações (nova estrutura)
CREATE TABLE "evaluations" (
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
);

-- Índices: gestor_colaborador
CREATE UNIQUE INDEX "gestor_colaborador_gestorId_colaboradorId_key" ON "gestor_colaborador"("gestorId", "colaboradorId");
CREATE INDEX "gestor_colaborador_gestorId_idx" ON "gestor_colaborador"("gestorId");
CREATE INDEX "gestor_colaborador_colaboradorId_idx" ON "gestor_colaborador"("colaboradorId");

-- Índices: evaluation_campaigns
CREATE INDEX "evaluation_campaigns_status_idx" ON "evaluation_campaigns"("status");

-- Índices: campaign_gestores
CREATE UNIQUE INDEX "campaign_gestores_campaignId_gestorId_key" ON "campaign_gestores"("campaignId", "gestorId");
CREATE INDEX "campaign_gestores_campaignId_idx" ON "campaign_gestores"("campaignId");
CREATE INDEX "campaign_gestores_gestorId_idx" ON "campaign_gestores"("gestorId");

-- Índices: evaluations
CREATE UNIQUE INDEX "evaluations_campaignId_avaliadorId_avaliadoId_key" ON "evaluations"("campaignId", "avaliadorId", "avaliadoId");
CREATE INDEX "evaluations_campaignId_idx" ON "evaluations"("campaignId");
CREATE INDEX "evaluations_avaliadoId_idx" ON "evaluations"("avaliadoId");
CREATE INDEX "evaluations_avaliadorId_idx" ON "evaluations"("avaliadorId");
CREATE INDEX "evaluations_data_idx" ON "evaluations"("data");

-- AddForeignKey: gestor_colaborador
ALTER TABLE "gestor_colaborador" ADD CONSTRAINT "gestor_colaborador_gestorId_fkey" FOREIGN KEY ("gestorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "gestor_colaborador" ADD CONSTRAINT "gestor_colaborador_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: campaign_gestores
ALTER TABLE "campaign_gestores" ADD CONSTRAINT "campaign_gestores_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "evaluation_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "campaign_gestores" ADD CONSTRAINT "campaign_gestores_gestorId_fkey" FOREIGN KEY ("gestorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: evaluations
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "evaluation_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_avaliadorId_fkey" FOREIGN KEY ("avaliadorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_avaliadoId_fkey" FOREIGN KEY ("avaliadoId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
