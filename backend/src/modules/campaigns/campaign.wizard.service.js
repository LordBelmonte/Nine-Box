import { AppError } from '../../utils/errors.js';
import { CampaignRepository } from './campaign.repository.js';
import { UserRepository } from '../users/user.repository.js';

class CampaignWizardService {
  constructor() {
    this.campaignRepository = new CampaignRepository();
    this.userRepository = new UserRepository();
    this.wizardSessions = new Map(); // Em produção, usar Redis ou banco de dados
  }

  async startWizard(data, userTipo) {
    if (userTipo !== 'admin') {
      throw new AppError('Apenas admins podem iniciar criação de campanha', 403);
    }

    const sessionId = crypto.randomUUID();
    
    const wizardData = {
      step: 1,
      data: {
        nome: data.nome || '',
        descricao: data.descricao || '',
        tipoAlvo: data.tipoAlvo || 'colaborador',
        criterios: data.criterios || [],
        gestorIds: data.gestorIds || [],
        dataInicio: data.dataInicio || new Date(),
        dataFim: data.dataFim || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
      },
      createdAt: new Date()
    };

    this.wizardSessions.set(sessionId, wizardData);

    return {
      sessionId,
      step: wizardData.step,
      data: wizardData.data
    };
  }

  async updateWizardStep(sessionId, step, data, userTipo) {
    if (userTipo !== 'admin') {
      throw new AppError('Apenas admins podem atualizar wizard', 403);
    }

    const wizardSession = this.wizardSessions.get(sessionId);
    if (!wizardSession) {
      throw new AppError('Sessão de wizard não encontrada', 404);
    }

    // Valida se a sessão não expirou (1 hora)
    if (new Date() - wizardSession.createdAt > 3600000) {
      this.wizardSessions.delete(sessionId);
      throw new AppError('Sessão de wizard expirada', 400);
    }

    // Atualiza os dados da etapa atual
    wizardSession.data = { ...wizardSession.data, ...data };
    wizardSession.step = step;

    this.wizardSessions.set(sessionId, wizardSession);

    return {
      sessionId,
      step: wizardSession.step,
      data: wizardSession.data
    };
  }

  async getWizardSession(sessionId, userTipo) {
    if (userTipo !== 'admin') {
      throw new AppError('Apenas admins podem acessar wizard', 403);
    }

    const wizardSession = this.wizardSessions.get(sessionId);
    if (!wizardSession) {
      throw new AppError('Sessão de wizard não encontrada', 404);
    }

    // Valida se a sessão não expirou
    if (new Date() - wizardSession.createdAt > 3600000) {
      this.wizardSessions.delete(sessionId);
      throw new AppError('Sessão de wizard expirada', 400);
    }

    return wizardSession;
  }

  async completeWizard(sessionId, userTipo) {
    if (userTipo !== 'admin') {
      throw new AppError('Apenas admins podem completar wizard', 403);
    }

    const wizardSession = this.wizardSessions.get(sessionId);
    if (!wizardSession) {
      throw new AppError('Sessão de wizard não encontrada', 404);
    }

    // Valida se a sessão não expirou
    if (new Date() - wizardSession.createdAt > 3600000) {
      this.wizardSessions.delete(sessionId);
      throw new AppError('Sessão de wizard expirada', 400);
    }

    // Valida dados finais
    const data = wizardSession.data;
    
    if (!data.nome || data.nome.trim() === '') {
      throw new AppError('Nome da campanha é obrigatório', 400);
    }

    if (!data.tipoAlvo || !['colaborador', 'gestor', 'todos'].includes(data.tipoAlvo)) {
      throw new AppError('Tipo de alvo inválido', 400);
    }

    if (!data.criterios || data.criterios.length === 0) {
      throw new AppError('Criterios são obrigatórios', 400);
    }

    if (data.tipoAlvo === 'colaborador' && (!data.gestorIds || data.gestorIds.length === 0)) {
      throw new AppError('Gestores são obrigatórios para campanhas de colaboradores', 400);
    }

    // Cria a campanha
    const campaign = await this.campaignRepository.create(data);

    // Remove a sessão
    this.wizardSessions.delete(sessionId);

    return {
      success: true,
      campaign,
      message: 'Campanha criada com sucesso'
    };
  }

  async cancelWizard(sessionId, userTipo) {
    if (userTipo !== 'admin') {
      throw new AppError('Apenas admins podem cancelar wizard', 403);
    }

    this.wizardSessions.delete(sessionId);
    return { message: 'Wizard cancelado com sucesso' };
  }

  // Validações específicas por etapa
  validateStep1(data) {
    if (!data.nome || data.nome.trim() === '') {
      throw new AppError('Nome da campanha é obrigatório', 400);
    }
    if (!data.tipoAlvo || !['colaborador', 'gestor', 'todos'].includes(data.tipoAlvo)) {
      throw new AppError('Tipo de alvo inválido', 400);
    }
    return true;
  }

  validateStep2(data) {
    if (!data.criterios || data.criterios.length === 0) {
      throw new AppError('Criterios são obrigatórios', 400);
    }
    if (data.criterios.length > 20) {
      throw new AppError('Máximo de 20 critérios permitidos', 400);
    }
    return true;
  }

  validateStep3(data) {
    if (data.tipoAlvo === 'colaborador' && (!data.gestorIds || data.gestorIds.length === 0)) {
      throw new AppError('Gestores são obrigatórios para campanhas de colaboradores', 400);
    }
    return true;
  }

  validateStep4(data) {
    if (!data.dataInicio || !data.dataFim) {
      throw new AppError('Datas de início e fim são obrigatórias', 400);
    }
    const inicio = new Date(data.dataInicio);
    const fim = new Date(data.dataFim);
    if (fim <= inicio) {
      throw new AppError('Data de fim deve ser posterior à data de início', 400);
    }
    return true;
  }
}

export { CampaignWizardService };
