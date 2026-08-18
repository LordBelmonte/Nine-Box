import { prisma } from '../../config/database.js';

class CampaignCompetencyRepository {
  async create(data, tx = prisma) {
    return await tx.campaignCompetency.create({ data });
  }

  // Cria múltiplas competências de uma vez (usado no update da campanha)
  async createMany(items, tx = prisma) {
    return await tx.campaignCompetency.createMany({ data: items });
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
