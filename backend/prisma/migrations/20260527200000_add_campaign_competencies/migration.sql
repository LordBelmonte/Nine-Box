-- Create campaign_competencies table
CREATE TABLE "campaign_competencies" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_competencies_pkey" PRIMARY KEY ("id")
);

-- Create index on campaignId
CREATE INDEX "campaign_competencies_campaignId_idx" ON "campaign_competencies"("campaignId");

-- Create index on competencyId
CREATE INDEX "campaign_competencies_competencyId_idx" ON "campaign_competencies"("competencyId");

-- Create unique constraint on campaignId and competencyId
ALTER TABLE "campaign_competencies" ADD CONSTRAINT "campaign_competencies_campaignId_competencyId_key" UNIQUE ("campaignId", "competencyId");

-- Add foreign key constraint for campaignId
ALTER TABLE "campaign_competencies" ADD CONSTRAINT "campaign_competencies_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "evaluation_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add foreign key constraint for competencyId
ALTER TABLE "campaign_competencies" ADD CONSTRAINT "campaign_competencies_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "competencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop criterios column from evaluation_campaigns
ALTER TABLE "evaluation_campaigns" DROP COLUMN IF EXISTS "criterios";
