import { AppError } from '../../utils/errors.js';
import { UserRepository } from '../users/user.repository.js';
import { CampaignRepository } from '../campaigns/campaign.repository.js';

class NotificationService {
  constructor() {
    this.userRepository = new UserRepository();
    this.campaignRepository = new CampaignRepository();
    this.notificationQueue = []; // Em produção, usar uma fila real (Bull, RabbitMQ, etc.)
  }

  async notifyEvaluationAssigned(campaignId, avaliadoId) {
    const campaign = await this.campaignRepository.findById(campaignId);
    const avaliado = await this.userRepository.findById(avaliadoId);

    if (!campaign || !avaliado) {
      throw new AppError('Campanha ou avaliado não encontrado', 404);
    }

    const notification = {
      type: 'evaluation_assigned',
      recipient: avaliado.email,
      subject: `Nova avaliação atribuída: ${campaign.nome}`,
      body: `
        Olá ${avaliado.nome},
        
        Uma nova avaliação foi atribuída a você:
        
        Campanha: ${campaign.nome}
        Descrição: ${campaign.descricao || 'Sem descrição'}
        Data de início: ${new Date(campaign.dataInicio).toLocaleDateString('pt-BR')}
        Data de fim: ${new Date(campaign.dataFim).toLocaleDateString('pt-BR')}
        
        Por favor, acesse o sistema para realizar sua avaliação.
        
        Atenciosamente,
        Equipe de Avaliação
      `,
      createdAt: new Date()
    };

    this.notificationQueue.push(notification);
    
    // Em produção, enviar email real usando Nodemailer ou similar
    console.log(`[NOTIFICATION] Email enviado para ${avaliado.email}: ${notification.subject}`);
    
    return { message: 'Notificação enviada com sucesso', notification };
  }

  async notifyEvaluationReminder(campaignId, avaliadoId) {
    const campaign = await this.campaignRepository.findById(campaignId);
    const avaliado = await this.userRepository.findById(avaliadoId);

    if (!campaign || !avaliado) {
      throw new AppError('Campanha ou avaliado não encontrado', 404);
    }

    const notification = {
      type: 'evaluation_reminder',
      recipient: avaliado.email,
      subject: `Lembrete: Avaliação pendente - ${campaign.nome}`,
      body: `
        Olá ${avaliado.nome},
        
        Este é um lembrete de que você tem uma avaliação pendente:
        
        Campanha: ${campaign.nome}
        Data de fim: ${new Date(campaign.dataFim).toLocaleDateString('pt-BR')}
        
        Por favor, complete sua avaliação antes do prazo.
        
        Atenciosamente,
        Equipe de Avaliação
      `,
      createdAt: new Date()
    };

    this.notificationQueue.push(notification);
    
    console.log(`[NOTIFICATION] Lembrete enviado para ${avaliado.email}: ${notification.subject}`);
    
    return { message: 'Lembrete enviado com sucesso', notification };
  }

  async notifyCampaignCompleted(campaignId) {
    const campaign = await this.campaignRepository.findById(campaignId);

    if (!campaign) {
      throw new AppError('Campanha não encontrada', 404);
    }

    // Notificar todos os gestores responsáveis pela campanha
    const notifications = [];
    
    for (const gestor of campaign.gestores) {
      const notification = {
        type: 'campaign_completed',
        recipient: gestor.gestor.email,
        subject: `Campanha finalizada: ${campaign.nome}`,
        body: `
          Olá ${gestor.gestor.nome},
          
          A campanha de avaliação foi finalizada:
          
          Campanha: ${campaign.nome}
          Status: Finalizada
          
          Você pode acessar os relatórios e resultados no sistema.
          
          Atenciosamente,
          Equipe de Avaliação
        `,
        createdAt: new Date()
      };

      this.notificationQueue.push(notification);
      notifications.push(notification);
      
      console.log(`[NOTIFICATION] Notificação enviada para ${gestor.gestor.email}: ${notification.subject}`);
    }

    return { message: 'Notificações enviadas com sucesso', notifications };
  }

  async getNotificationQueue() {
    return this.notificationQueue;
  }

  async sendBatchNotifications(campaignId) {
    const campaign = await this.campaignRepository.findById(campaignId);
    
    if (!campaign) {
      throw new AppError('Campanha não encontrada', 404);
    }

    // Notificar todos os avaliados da campanha
    const notifications = [];
    
    for (const gestor of campaign.gestores) {
      // Buscar colaboradores do grupo do gestor
      const colaboradores = await this.userRepository.findByGestorId(gestor.gestorId);
      
      for (const colaborador of colaboradores) {
        const notification = await this.notifyEvaluationAssigned(campaignId, colaborador.id);
        notifications.push(notification);
      }
    }

    return { message: 'Notificações em lote enviadas com sucesso', count: notifications.length };
  }
}

export { NotificationService };
