import { CampaignRepository } from './src/modules/campaigns/campaign.repository.js';
import { CampaignService } from './src/modules/campaigns/campaign.service.js';
import { prisma } from './src/config/database.js';

const repo = new CampaignRepository();
const service = new CampaignService(repo);

try {
  console.log('Duplicando f020a4e4-a54a-4a46-a138-cf711018bdd6...');
  const result = await service.duplicate('f020a4e4-a54a-4a46-a138-cf711018bdd6', 'admin');
  console.log('SUCESSO id:', result.id);
  await prisma.evaluationCampaign.delete({ where: { id: result.id } });
  console.log('Copia deletada.');
} catch (e) {
  console.error('ERRO:', e.message);
  console.error('Tipo:', e.constructor.name);
  console.error('Code:', e.code);
  console.error('Stack:', e.stack?.split('\n').slice(0,5).join('\n'));
}
await prisma.$disconnect();
