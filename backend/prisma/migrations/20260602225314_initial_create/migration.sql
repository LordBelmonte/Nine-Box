/*
  Warnings:

  - A unique constraint covering the columns `[nome]` on the table `competencies` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "competencies_competenciaDe_idx";

-- DropIndex
DROP INDEX "competencies_tipo_idx";

-- DropIndex
DROP INDEX "nine_box_data_idx";

-- AlterTable
ALTER TABLE "competencies" ADD COLUMN     "a_melhorar" TEXT,
ADD COLUMN     "bom" TEXT,
ADD COLUMN     "ideal" TEXT,
ADD COLUMN     "mediano" TEXT;

-- AlterTable
ALTER TABLE "nine_box" ALTER COLUMN "performance" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "potential" SET DATA TYPE DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userTipo" TEXT NOT NULL,
    "changes" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_templates" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT,
    "criterios" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluation_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "competencies_nome_key" ON "competencies"("nome");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");
