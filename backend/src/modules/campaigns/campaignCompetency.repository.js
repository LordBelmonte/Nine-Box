import { prisma } from '../../config/database.js';

class CampaignCompetencyRepository {
  async create(data, tx = prisma) {
    return await tx.campaignCompetency.create({ data });
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
