-- Migration to implement decisions from DECISOES_NINEBOX.md
-- Items: 2 (document competency types), 3 (remove legacy fields), 6 (create nine_box_categorias table)

-- 1. Remove legacy columns from competencies table (Decision Item 3)
ALTER TABLE "competencies" DROP COLUMN IF EXISTS "a_melhorar";
ALTER TABLE "competencies" DROP COLUMN IF EXISTS "bom";
ALTER TABLE "competencies" DROP COLUMN IF EXISTS "ideal";
ALTER TABLE "competencies" DROP COLUMN IF EXISTS "mediano";

-- 2. Add soft delete column to competencies (align with existing database)
ALTER TABLE "competencies" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- 3. Add soft delete column to evaluation_campaigns (align with existing database)
ALTER TABLE "evaluation_campaigns" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- 4. Add soft delete column to users (align with existing database)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- 5. Add tipoAvaliacao column to evaluation_campaigns (align with existing database)
ALTER TABLE "evaluation_campaigns" ADD COLUMN IF NOT EXISTS "tipoAvaliacao" TEXT;

-- 6. Create refresh_tokens table (align with existing database)
CREATE TABLE IF NOT EXISTS "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "refresh_tokens_token_key" ON "refresh_tokens"("token");
CREATE INDEX IF NOT EXISTS "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- 7. Create nine_box_categorias table (Decision Item 6)
CREATE TABLE IF NOT EXISTS "nine_box_categorias" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "potencialClasse" TEXT NOT NULL,
    "desempenhoClasse" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "perfil" TEXT NOT NULL,
    "planoAcao" TEXT NOT NULL,
    "icon" TEXT,
    "cor" TEXT,
    CONSTRAINT "nine_box_categorias_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "nine_box_categorias_codigo_key" ON "nine_box_categorias"("codigo");

-- 8. Add indexes for soft delete queries
CREATE INDEX IF NOT EXISTS "competencies_deletedAt_idx" ON "competencies"("deletedAt");
CREATE INDEX IF NOT EXISTS "evaluation_campaigns_deletedAt_idx" ON "evaluation_campaigns"("deletedAt");
CREATE INDEX IF NOT EXISTS "users_deletedAt_idx" ON "users"("deletedAt");