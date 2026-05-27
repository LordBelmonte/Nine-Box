import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class CampaignCompetencyRepository {
  async create(data) {
    return await prisma.campaignCompetency.create({ data });
  }

  async findByCampaignId(campaignId) {
    return await prisma.campaignCompetency.findMany({
      where: { campaignId },
      include: {
        competency: true
      }
    });
  }

  async deleteByCampaignId(campaignId) {
    return await prisma.campaignCompetency.deleteMany({
      where: { campaignId }
    });
  }

  async delete(id) {
    return await prisma.campaignCompetency.delete({
      where: { id }
    });
  }
}

export { CampaignCompetencyRepository };
