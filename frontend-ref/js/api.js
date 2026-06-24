// =============================================
// API.JS — Client HTTP centralizado (com suporte MOCK)
// =============================================
// NOTA: Código mock mantido para referência/desenvolvimento
// Para ativar modo mock: CONFIG.MOCK_MODE = true em config.js
// Em produção, sempre use CONFIG.MOCK_MODE = false

import CONFIG from './config.js';
import { getToken, logout, loginMock } from './auth.js';
import { showToast } from './components/toast.js';
import { showLoading, hideLoading } from './components/loading.js';
import { MOCK_SYSTEM_USERS, MOCK_EVALUATIONS, MOCK_COMPETENCIES, MOCK_NINEBOXES, MOCK_CAMPAIGNS, MOCK_GRUPOS } from './mockData.js';

// =============================================
// MODO MOCK (para desenvolvimento sem backend)
// =============================================
const MOCK_MODE = CONFIG.MOCK_MODE; // Importado de config.js

/**
 * Faz uma requisição HTTP para a API.
 * @param {string} endpoint - Caminho relativo (ex: '/users/login')
 * @param {object} options  - Opções do fetch (method, body, etc.)
 * @param {boolean} silent  - Se true, não exibe loading/toast de erro
 */
async function request(endpoint, options = {}, silent = false) {
  const url = `${CONFIG.API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  if (!silent) showLoading();

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      // Token expirado ou inválido → logout automático
      if (response.status === 401) {
        logout();
        return;
      }

      const msg = data.message || 'Erro na requisição';
      if (!silent) showToast(msg, 'error');
      throw new Error(msg);
    }

    return data;
  } catch (err) {
    if (!silent && !(err instanceof TypeError)) {
      // TypeError = falha de rede (servidor offline)
    }
    if (err instanceof TypeError) {
      if (!silent) showToast('Servidor indisponível. Verifique se o backend está rodando.', 'error');
    }
    throw err;
  } finally {
    if (!silent) hideLoading();
  }
}

// =============================================
// HELPERS DE MÉTODO
// =============================================
const api = {
  get:    (endpoint, silent)       => request(endpoint, { method: 'GET' }, silent),
  post:   (endpoint, body, silent) => request(endpoint, { method: 'POST', body }, silent),
  put:    (endpoint, body, silent) => request(endpoint, { method: 'PUT', body }, silent),
  patch:  (endpoint, body, silent) => request(endpoint, { method: 'PATCH', body }, silent),
  delete: (endpoint, silent)       => request(endpoint, { method: 'DELETE' }, silent),
};

// =============================================
// ENDPOINTS — USUÁRIOS
// =============================================
export const usersApi = {
  login: async (body) => {
    if (MOCK_MODE) {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      return loginMock(body.email, body.senha);
    }
    return api.post('/users/login', body);
  },
  
  register: async (body) => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Buscar usuários do localStorage ou MOCK_SYSTEM_USERS
      const stored = localStorage.getItem('mock_users');
      let users = stored ? JSON.parse(stored) : [...MOCK_SYSTEM_USERS];
      
      // Validar email único
      if (users.some(u => u.email.toLowerCase() === body.email.toLowerCase())) {
        throw new Error('Este e-mail já está cadastrado no sistema');
      }
      
      // Validar RA único
      if (users.some(u => u.ra === body.ra)) {
        throw new Error('Este RA já está cadastrado no sistema');
      }
      
      // Criar novo usuário
      const novoUsuario = {
        id: `sys-${body.tipo}-${Date.now()}`,
        ra: body.ra,
        nome: body.nome,
        email: body.email.toLowerCase(),
        tipo: body.tipo,
        cargo: body.cargo || null,
        departamento: body.departamento || null,
        foto: null,
        dataCadastro: new Date().toISOString()
      };
      
      users.push(novoUsuario);
      localStorage.setItem('mock_users', JSON.stringify(users));
      
      // Adicionar também ao MOCK_SYSTEM_USERS em memória
      MOCK_SYSTEM_USERS.push(novoUsuario);
      
      return {
        success: true,
        data: { user: novoUsuario },
        message: 'Usuário cadastrado com sucesso'
      };
    }
    return api.post('/users/register', body);
  },
  
  getProfile: () => api.get('/users/profile'),
  
  updateProfile: (body) => api.put('/users/profile', body),
  
  list: async (params) => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Carregar usuários do localStorage ou usar MOCK_SYSTEM_USERS
      const stored = localStorage.getItem('mock_users');
      let users;
      
      if (stored) {
        users = JSON.parse(stored);
      } else {
        // Inicializar localStorage com dados mock
        users = [...MOCK_SYSTEM_USERS];
        localStorage.setItem('mock_users', JSON.stringify(users));
      }
      
      // Filtrar por tipo
      if (params?.tipo) {
        users = users.filter(u => u.tipo === params.tipo);
      }
      
      // Filtrar por departamento
      if (params?.departamento) {
        users = users.filter(u => u.departamento === params.departamento);
      }
      
      // Busca por nome ou email
      if (params?.search) {
        const search = params.search.toLowerCase();
        users = users.filter(u => 
          u.nome.toLowerCase().includes(search) || 
          u.email.toLowerCase().includes(search) ||
          u.ra.includes(search)
        );
      }
      
      // Paginação
      const limit = params?.limit || 10;
      const page = params?.page || 1;
      const totalPages = Math.ceil(users.length / limit);
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedUsers = users.slice(start, end);
      
      return {
        success: true,
        data: {
          users: paginatedUsers,
          pagination: {
            total: users.length,
            page: page,
            limit: limit,
            totalPages: totalPages
          }
        }
      };
    }
    return api.get(`/users${buildQuery(params)}`);
  },
  
  getById: async (id) => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Carregar usuários do localStorage ou usar MOCK_SYSTEM_USERS
      const stored = localStorage.getItem('mock_users');
      const users = stored ? JSON.parse(stored) : MOCK_SYSTEM_USERS;
      
      const user = users.find(u => u.id === id);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      return { 
        success: true, 
        data: { 
          ...user,
          createdAt: user.dataCadastro || new Date().toISOString()
        } 
      };
    }
    return api.get(`/users/${id}`);
  },
  
  getByRA: async (ra) => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Carregar usuários do localStorage ou usar MOCK_SYSTEM_USERS
      const stored = localStorage.getItem('mock_users');
      const users = stored ? JSON.parse(stored) : MOCK_SYSTEM_USERS;
      
      const user = users.find(u => u.ra === ra);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      return { 
        success: true, 
        data: {
          ...user,
          createdAt: user.dataCadastro || new Date().toISOString()
        }
      };
    }
    return api.get(`/users/ra/${ra}`);
  },
  
  update: async (id, body) => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Buscar usuário no localStorage ou MOCK_SYSTEM_USERS
      const stored = localStorage.getItem('mock_users');
      let users = stored ? JSON.parse(stored) : [...MOCK_SYSTEM_USERS];
      
      const index = users.findIndex(u => u.id === id);
      if (index === -1) {
        throw new Error('Usuário não encontrado');
      }
      
      // Atualizar dados
      users[index] = { ...users[index], ...body };
      
      // Salvar no localStorage
      localStorage.setItem('mock_users', JSON.stringify(users));
      
      // Atualizar também MOCK_SYSTEM_USERS em memória
      const memIndex = MOCK_SYSTEM_USERS.findIndex(u => u.id === id);
      if (memIndex !== -1) {
        Object.assign(MOCK_SYSTEM_USERS[memIndex], body);
      }
      
      return {
        success: true,
        data: { user: users[index] },
        message: 'Usuário atualizado com sucesso'
      };
    }
    return api.put(`/users/${id}`, body);
  },
  
  delete: async (id) => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Buscar usuário no localStorage ou MOCK_SYSTEM_USERS
      const stored = localStorage.getItem('mock_users');
      let users = stored ? JSON.parse(stored) : [...MOCK_SYSTEM_USERS];
      
      const user = users.find(u => u.id === id);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      // Não permitir excluir admin
      if (user.tipo === 'admin') {
        throw new Error('Não é possível excluir este usuário');
      }
      
      // Remover usuário
      users = users.filter(u => u.id !== id);
      
      // Salvar no localStorage
      localStorage.setItem('mock_users', JSON.stringify(users));
      
      // Remover também de MOCK_SYSTEM_USERS em memória
      const memIndex = MOCK_SYSTEM_USERS.findIndex(u => u.id === id);
      if (memIndex !== -1) {
        MOCK_SYSTEM_USERS.splice(memIndex, 1);
      }
      
      return {
        success: true,
        message: 'Usuário removido com sucesso'
      };
    }
    return api.delete(`/users/${id}`);
  },
};

// =============================================
// ENDPOINTS — AVALIAÇÕES
// =============================================
export const evaluationsApi = {
  create: async (body) => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Buscar dados do avaliado
      const avaliado = MOCK_SYSTEM_USERS.find(u => u.id === body.avaliadoId);
      
      // Determinar tipo de avaliação baseado no tipo do avaliado
      let tipoAvaliacao = body.tipoAvaliacao || 'gestor_para_colaborador';
      if (avaliado?.tipo === 'gestor') {
        tipoAvaliacao = 'colaborador_para_gestor';
      } else if (avaliado?.tipo === 'colaborador') {
        tipoAvaliacao = 'gestor_para_colaborador';
      }
      
      // Calcular média
      const criterios = body.criterios || {};
      const valores = Object.values(criterios).filter(v => v > 0);
      const media = valores.length > 0 
        ? parseFloat((valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(1))
        : null;
      
      const avaliadorId = getToken() ? JSON.parse(atob(getToken().split('.')[1] || 'e30=')).userId : 'unknown';
      
      const novaAvaliacao = {
        id: `eval-${Date.now()}`,
        avaliadorId: avaliadorId,
        avaliadoId: body.avaliadoId,
        avaliado: avaliado ? { id: avaliado.id, nome: avaliado.nome, tipo: avaliado.tipo } : null,
        tipoAvaliacao,
        criterios,
        media,
        comentario: body.comentario || null,
        anonima: body.anonima !== false,
        isMine: true, // Sempre true pois foi criada pelo usuário logado
        data: new Date().toISOString()
      };
      
      // Salvar no localStorage
      const stored = localStorage.getItem('mock_evaluations');
      const evaluations = stored ? JSON.parse(stored) : [...MOCK_EVALUATIONS];
      evaluations.push(novaAvaliacao);
      localStorage.setItem('mock_evaluations', JSON.stringify(evaluations));
      
      return {
        success: true,
        data: { evaluation: novaAvaliacao },
        message: 'Avaliação criada com sucesso'
      };
    }
    return api.post('/evaluations', body);
  },
  
  list: async (params) => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Carregar avaliações do localStorage ou usar as mock
      const stored = localStorage.getItem('mock_evaluations');
      let evaluations;
      
      if (stored) {
        evaluations = JSON.parse(stored);
      } else {
        // Inicializar localStorage com dados mock
        evaluations = [...MOCK_EVALUATIONS];
        localStorage.setItem('mock_evaluations', JSON.stringify(evaluations));
      }
      
      // Obter usuário logado
      const token = getToken();
      const userId = token ? JSON.parse(atob(token.split('.')[1] || 'e30=')).userId : null;
      
      // Adicionar campo isMine em cada avaliação
      evaluations = evaluations.map(e => ({
        ...e,
        isMine: userId ? e.avaliadorId === userId : false
      }));
      
      // Filtrar por tipo de avaliação
      if (params?.tipoAvaliacao) {
        evaluations = evaluations.filter(e => e.tipoAvaliacao === params.tipoAvaliacao);
      }
      
      // Filtrar por avaliado
      if (params?.avaliadoId) {
        evaluations = evaluations.filter(e => e.avaliadoId === params.avaliadoId);
      }
      
      // Filtrar por avaliador
      if (params?.avaliadorId) {
        evaluations = evaluations.filter(e => e.avaliadorId === params.avaliadorId);
      }
      
      // Ordenar por data (mais recente primeiro)
      evaluations.sort((a, b) => new Date(b.data) - new Date(a.data));
      
      // Paginação
      const limit = params?.limit || 10;
      const page = params?.page || 1;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedEvals = evaluations.slice(start, end);
      
      return {
        success: true,
        data: {
          evaluations: paginatedEvals,
          total: evaluations.length,
          page: page,
          limit: limit,
          totalPages: Math.ceil(evaluations.length / limit)
        }
      };
    }
    return api.get(`/evaluations${buildQuery(params)}`);
  },
  
  getById: async (id) => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const stored = localStorage.getItem('mock_evaluations');
      const evaluations = stored ? JSON.parse(stored) : [...MOCK_EVALUATIONS];
      const evaluation = evaluations.find(e => e.id === id);
      
      if (!evaluation) {
        throw new Error('Avaliação não encontrada');
      }
      
      return {
        success: true,
        data: evaluation
      };
    }
    return api.get(`/evaluations/${id}`);
  },
  
  getByAvaliado: (id, p) => api.get(`/evaluations/avaliado/${id}${buildQuery(p)}`),
  getStats: (id) => api.get(`/evaluations/stats/avaliado/${id}`),

  listByCampaign: async (campaignId) => {
    if (MOCK_MODE) {
      await new Promise(r => setTimeout(r, 200));
      const stored = localStorage.getItem('mock_evaluations');
      const all = stored ? JSON.parse(stored) : [...MOCK_EVALUATIONS];
      const filtered = all.filter(e => e.campaignId === campaignId);
      return { success: true, data: filtered };
    }
    return api.get(`/evaluations/campanha/${campaignId}`);
  },
  
  update: async (id, body) => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const stored = localStorage.getItem('mock_evaluations');
      let evaluations = stored ? JSON.parse(stored) : [...MOCK_EVALUATIONS];
      
      const index = evaluations.findIndex(e => e.id === id);
      if (index === -1) {
        throw new Error('Avaliação não encontrada');
      }
      
      // Recalcular média se critérios foram alterados
      if (body.criterios) {
        const valores = Object.values(body.criterios).filter(v => v > 0);
        body.media = valores.length > 0 
          ? parseFloat((valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(1))
          : null;
      }
      
      // Atualizar avaliação
      evaluations[index] = { ...evaluations[index], ...body };
      
      // Salvar no localStorage
      localStorage.setItem('mock_evaluations', JSON.stringify(evaluations));
      
      return {
        success: true,
        data: { evaluation: evaluations[index] },
        message: 'Avaliação atualizada com sucesso'
      };
    }
    return api.put(`/evaluations/${id}`, body);
  },
  
  delete: async (id) => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const stored = localStorage.getItem('mock_evaluations');
      let evaluations = stored ? JSON.parse(stored) : [];
      evaluations = evaluations.filter(e => e.id !== id);
      localStorage.setItem('mock_evaluations', JSON.stringify(evaluations));
      
      return {
        success: true,
        message: 'Avaliação removida com sucesso'
      };
    }
    return api.delete(`/evaluations/${id}`);
  },
};

// =============================================
// ENDPOINTS — NINE BOX
// =============================================
export const nineBoxApi = {
  create: async (body) => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const pessoa = MOCK_SYSTEM_USERS.find(u => u.id === body.pessoaId);
      
      const novoNineBox = {
        id: `nb-${Date.now()}`,
        pessoaId: body.pessoaId,
        pessoa: pessoa ? { id: pessoa.id, nome: pessoa.nome, tipo: pessoa.tipo, cargo: pessoa.cargo } : null,
        performance: body.performance,
        potential: body.potential,
        comentario: body.comentario || null,
        data: new Date().toISOString()
      };
      
      const stored = localStorage.getItem('mock_nineboxes');
      const nineBoxes = stored ? JSON.parse(stored) : [];
      nineBoxes.push(novoNineBox);
      localStorage.setItem('mock_nineboxes', JSON.stringify(nineBoxes));
      
      return {
        success: true,
        data: { nineBox: novoNineBox },
        message: 'Posição Nine Box criada com sucesso'
      };
    }
    return api.post('/ninebox', body);
  },
  
  list: async (params) => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const stored = localStorage.getItem('mock_nineboxes');
      let nineBoxes = stored ? JSON.parse(stored) : [...MOCK_NINEBOXES];
      
      // Filtrar por pessoa
      if (params?.pessoaId) {
        nineBoxes = nineBoxes.filter(nb => nb.pessoaId === params.pessoaId);
      }
      
      // Ordenar por data (mais recente primeiro)
      nineBoxes.sort((a, b) => new Date(b.data) - new Date(a.data));
      
      // Paginação
      const limit = params?.limit || 10;
      const page = params?.page || 1;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedNB = nineBoxes.slice(start, end);
      
      return {
        success: true,
        data: {
          nineBoxes: paginatedNB,
          total: nineBoxes.length,
          page: page,
          limit: limit,
          totalPages: Math.ceil(nineBoxes.length / limit)
        }
      };
    }
    return api.get(`/ninebox${buildQuery(params)}`);
  },
  
  getById: (id) => api.get(`/ninebox/${id}`),
  
  findById: (id) => api.get(`/ninebox/${id}`),
  
  getByPessoa: async (id) => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const stored = localStorage.getItem('mock_nineboxes');
      const nineBoxes = stored ? JSON.parse(stored) : [...MOCK_NINEBOXES];
      const userNineBoxes = nineBoxes.filter(nb => nb.pessoaId === id);
      
      return {
        success: true,
        data: { nineBoxes: userNineBoxes }
      };
    }
    return api.get(`/ninebox/pessoa/${id}`);
  },
  
  getLatest: async (id) => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const stored = localStorage.getItem('mock_nineboxes');
      const nineBoxes = stored ? JSON.parse(stored) : [...MOCK_NINEBOXES];
      const userNineBoxes = nineBoxes
        .filter(nb => nb.pessoaId === id)
        .sort((a, b) => new Date(b.data) - new Date(a.data));
      
      return {
        success: true,
        data: { nineBox: userNineBoxes[0] || null }
      };
    }
    return api.get(`/ninebox/pessoa/${id}/latest`);
  },
  
  getDistribution: async () => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const stored = localStorage.getItem('mock_nineboxes');
      const nineBoxes = stored ? JSON.parse(stored) : [...MOCK_NINEBOXES];
      
      // Contar distribuição por quadrante
      const distribution = {};
      for (let perf = 1; perf <= 3; perf++) {
        for (let pot = 1; pot <= 3; pot++) {
          const key = `${perf}-${pot}`;
          distribution[key] = nineBoxes.filter(
            nb => nb.performance === perf && nb.potential === pot
          ).length;
        }
      }
      
      return {
        success: true,
        data: { distribution }
      };
    }
    return api.get('/ninebox/stats/distribution');
  },

  calculateTeam: async () => {
    return api.get('/ninebox/calculate/team');
  },

  calculateAll: async () => {
    return api.get('/ninebox/calculate/all');
  },

  calculateForPerson: async (pessoaId) => {
    return api.get(`/ninebox/calculate/person/${pessoaId}`);
  },

  update: (id, b) => api.put(`/ninebox/${id}`, b),
  
  delete: async (id) => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const stored = localStorage.getItem('mock_nineboxes');
      let nineBoxes = stored ? JSON.parse(stored) : [];
      nineBoxes = nineBoxes.filter(nb => nb.id !== id);
      localStorage.setItem('mock_nineboxes', JSON.stringify(nineBoxes));
      
      return {
        success: true,
        message: 'Nine Box removido com sucesso'
      };
    }
    return api.delete(`/ninebox/${id}`);
  },
};

// =============================================
// ENDPOINTS — COMPETÊNCIAS
// =============================================
export const competenciesApi = {
  create: async (body) => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const novaCompetencia = {
        id: `comp-${Date.now()}`,
        ...body,
        dataCriacao: new Date().toISOString()
      };
      
      const stored = localStorage.getItem('mock_competencies');
      const competencies = stored ? JSON.parse(stored) : [...MOCK_COMPETENCIES];
      competencies.push(novaCompetencia);
      localStorage.setItem('mock_competencies', JSON.stringify(competencies));
      
      return {
        success: true,
        data: { competency: novaCompetencia },
        message: 'Competência criada com sucesso'
      };
    }
    return api.post('/competencies', body);
  },
  
  list: async (params) => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const stored = localStorage.getItem('mock_competencies');
      let competencies = stored ? JSON.parse(stored) : [...MOCK_COMPETENCIES];
      
      // Filtrar por tipo
      if (params?.tipo) {
        competencies = competencies.filter(c => c.tipo === params.tipo);
      }
      
      // Busca por nome
      if (params?.search) {
        const search = params.search.toLowerCase();
        competencies = competencies.filter(c => 
          c.nome.toLowerCase().includes(search) || 
          (c.descricao && c.descricao.toLowerCase().includes(search))
        );
      }
      
      // Paginação
      const limit = params?.limit || 10;
      const page = params?.page || 1;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedComps = competencies.slice(start, end);
      
      return {
        success: true,
        data: {
          competencies: paginatedComps,
          total: competencies.length,
          page: page,
          limit: limit,
          totalPages: Math.ceil(competencies.length / limit)
        }
      };
    }
    return api.get(`/competencies${buildQuery(params)}`);
  },
  
  getById: (id) => api.get(`/competencies/${id}`),
  
  update: async (id, body) => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const stored = localStorage.getItem('mock_competencies');
      let competencies = stored ? JSON.parse(stored) : [...MOCK_COMPETENCIES];
      
      const index = competencies.findIndex(c => c.id === id);
      if (index === -1) {
        throw new Error('Competência não encontrada');
      }
      
      // Atualizar competência
      competencies[index] = { ...competencies[index], ...body };
      
      // Salvar no localStorage
      localStorage.setItem('mock_competencies', JSON.stringify(competencies));
      
      return {
        success: true,
        data: { competency: competencies[index] },
        message: 'Competência atualizada com sucesso'
      };
    }
    return api.put(`/competencies/${id}`, body);
  },
  
  delete: async (id) => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const stored = localStorage.getItem('mock_competencies');
      let competencies = stored ? JSON.parse(stored) : [...MOCK_COMPETENCIES];
      competencies = competencies.filter(c => c.id !== id);
      localStorage.setItem('mock_competencies', JSON.stringify(competencies));
      
      return {
        success: true,
        message: 'Competência removida com sucesso'
      };
    }
    return api.delete(`/competencies/${id}`);
  },
};

// =============================================
// ENDPOINTS — RELATÓRIOS
// =============================================
export const reportsApi = {
  dashboard: async () => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const stored = localStorage.getItem('mock_evaluations');
      const evaluations = stored ? JSON.parse(stored) : [...MOCK_EVALUATIONS];
      
      const storedNB = localStorage.getItem('mock_nineboxes');
      const nineBoxes = storedNB ? JSON.parse(storedNB) : [...MOCK_NINEBOXES];
      
      // Calcular estatísticas
      const totalAvaliacoes = evaluations.length;
      const avaliacoes180 = evaluations.filter(e => e.tipoAvaliacao === 'gestor_para_colaborador').length;
      const avaliacoes360 = evaluations.filter(e => e.tipoAvaliacao === 'colaborador_para_gestor').length;
      
      const mediaGeral = evaluations.length > 0
        ? (evaluations.reduce((sum, e) => sum + (e.media || 0), 0) / evaluations.length).toFixed(1)
        : 0;
      
      return {
        success: true,
        data: {
          totalUsuarios: MOCK_SYSTEM_USERS.length,
          totalGestores: MOCK_SYSTEM_USERS.filter(u => u.tipo === 'gestor').length,
          totalColaboradores: MOCK_SYSTEM_USERS.filter(u => u.tipo === 'colaborador').length,
          totalAvaliacoes,
          totalNineBox: nineBoxes.length,
          avaliacoes180,
          avaliacoes360,
          mediaGeral: parseFloat(mediaGeral),
          ultimasAvaliacoes: evaluations.slice(-5).reverse()
        }
      };
    }
    return api.get('/reports/dashboard');
  },
  
  user: async (id) => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const user = MOCK_SYSTEM_USERS.find(u => u.id === id);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      const stored = localStorage.getItem('mock_evaluations');
      const allEvaluations = stored ? JSON.parse(stored) : [...MOCK_EVALUATIONS];
      
      // Avaliações recebidas (onde o usuário é o avaliado)
      const avaliacoesRecebidas = allEvaluations.filter(e => e.avaliadoId === id);
      
      // Avaliações feitas (onde o usuário é o avaliador)
      const avaliacoesFeitas = allEvaluations.filter(e => e.avaliadorId === id);
      
      // Calcular média das avaliações recebidas
      const mediaRecebidas = avaliacoesRecebidas.length > 0
        ? (avaliacoesRecebidas.reduce((sum, e) => sum + (e.media || 0), 0) / avaliacoesRecebidas.length).toFixed(1)
        : 0;
      
      return {
        success: true,
        data: {
          user: {
            ...user,
            createdAt: user.dataCadastro || new Date().toISOString()
          },
          avaliacoesRecebidas: avaliacoesRecebidas.length,
          avaliacoesFeitas: avaliacoesFeitas.length,
          mediaGeral: parseFloat(mediaRecebidas),
          ultimasAvaliacoes: avaliacoesRecebidas.slice(-10).reverse(),
          criteriosMedia: calcularMediaCriterios(avaliacoesRecebidas)
        }
      };
    }
    return api.get(`/reports/user/${id}`);
  },
  
  team: (id) => api.get(`/reports/team/${id}`),
  export: (id) => api.get(`/reports/export/${id}`),
};

// Helper para calcular média por critério (dinâmico)
function calcularMediaCriterios(avaliacoes) {
  if (!avaliacoes || avaliacoes.length === 0) return {};
  const totais = {}, contagens = {};
  for (const av of avaliacoes) {
    if (av.criterios && typeof av.criterios === 'object') {
      for (const [nome, nota] of Object.entries(av.criterios)) {
        if (typeof nota === 'number') {
          totais[nome] = (totais[nome] || 0) + nota;
          contagens[nome] = (contagens[nome] || 0) + 1;
        }
      }
    }
  }
  const medias = {};
  for (const nome of Object.keys(totais)) {
    medias[nome] = parseFloat((totais[nome] / contagens[nome]).toFixed(1));
  }
  return medias;
}

// =============================================
// ENDPOINTS — CAMPANHAS
// =============================================
export const campaignsApi = {
  // Lista campanhas ativas para o gestor logado
  listAtivas: async () => {
    if (MOCK_MODE) {
      await new Promise(r => setTimeout(r, 200));
      const token = getToken();
      const userId = token ? JSON.parse(atob(token.split('.')[1] || 'e30=')).userId : null;
      const campanhas = MOCK_CAMPAIGNS.filter(c => {
        if (c.status !== 'ativa') return false;
        // Se gestor, filtra apenas campanhas onde é responsável
        if (userId) return c.gestores.some(g => g.gestorId === userId);
        return true;
      });
      return { success: true, data: campanhas };
    }
    return api.get('/campaigns/ativas/gestor');
  },

  // Lista campanhas pendentes para colaborador
  getPendingForColaborador: async () => {
    if (MOCK_MODE) {
      await new Promise(r => setTimeout(r, 200));
      const token = getToken();
      const userId = token ? JSON.parse(atob(token.split('.')[1] || 'e30=')).userId : null;
      const campanhas = MOCK_CAMPAIGNS.filter(c => {
        if (c.status !== 'ativa') return false;
        if (c.tipoAlvo !== 'gestor') return false; // Colaborador avalia gestor
        return true;
      });
      return { success: true, data: campanhas };
    }
    return api.get('/campaigns/colaborador/pendentes');
  },

  // Lista campanhas pendentes para gestor
  getPendingForGestor: async () => {
    if (MOCK_MODE) {
      await new Promise(r => setTimeout(r, 200));
      const token = getToken();
      const userId = token ? JSON.parse(atob(token.split('.')[1] || 'e30=')).userId : null;
      const campanhas = MOCK_CAMPAIGNS.filter(c => {
        if (c.status !== 'ativa') return false;
        if (userId) return c.gestores.some(g => g.gestorId === userId);
        return true;
      });
      return { success: true, data: campanhas };
    }
    return api.get('/campaigns/gestor/pendentes');
  },

  list: async (params) => {
    if (MOCK_MODE) {
      await new Promise(r => setTimeout(r, 200));
      let campanhas = [...MOCK_CAMPAIGNS];
      if (params?.status) campanhas = campanhas.filter(c => c.status === params.status);
      return { success: true, data: { campaigns: campanhas, pagination: { total: campanhas.length } } };
    }
    return api.get(`/campaigns${buildQuery(params)}`);
  },

  getById: async (id) => {
    if (MOCK_MODE) {
      await new Promise(r => setTimeout(r, 200));
      const c = MOCK_CAMPAIGNS.find(c => c.id === id);
      if (!c) throw new Error('Campanha não encontrada');
      return { success: true, data: c };
    }
    return api.get(`/campaigns/${id}`);
  },

  create: (body) => api.post('/campaigns', body),
  update: (id, body) => api.put(`/campaigns/${id}`, body),
  updateStatus: (id, status) => api.patch ? api.patch(`/campaigns/${id}/status`, { status }) : request(`/campaigns/${id}/status`, { method: 'PATCH', body: { status } }),
  delete: (id) => api.delete(`/campaigns/${id}`),

  getProgress: (campaignId, gestorId) =>
    api.get(`/campaigns/${campaignId}/progresso${gestorId ? '/' + gestorId : ''}`),
  
  getColaboradoresNaoAvaliados: (campaignId, gestorId) =>
    api.get(`/campaigns/${campaignId}/colaboradores-nao-avaliados/${gestorId}`),

  getGestoresNaoAvaliados: (campaignId, colaboradorId) =>
    api.get(`/campaigns/${campaignId}/gestores-nao-avaliados/${colaboradorId}`),

  duplicate: (id) => api.post(`/campaigns/${id}/duplicate`),
};

// =============================================
// ENDPOINTS — GRUPOS (gestor → colaboradores)
// =============================================
export const groupsApi = {
  getColaboradores: async (gestorId) => {
    if (MOCK_MODE) {
      await new Promise(r => setTimeout(r, 200));
      const grupo = MOCK_GRUPOS.find(g => g.gestorId === gestorId);
      const ids = grupo?.colaboradorIds || [];
      const colaboradores = MOCK_SYSTEM_USERS.filter(u => ids.includes(u.id));
      return { success: true, data: colaboradores };
    }
    return api.get(`/groups/gestor/${gestorId}/colaboradores`);
  },

  addColaborador: (gestorId, colaboradorId) =>
    api.post(`/groups/gestor/${gestorId}/colaboradores`, { colaboradorId }),

  removeColaborador: (gestorId, colaboradorId) =>
    api.delete(`/groups/gestor/${gestorId}/colaboradores/${colaboradorId}`),

  setColaboradores: (gestorId, colaboradorIds) =>
    api.put(`/groups/gestor/${gestorId}/colaboradores`, { colaboradorIds }),

  getGestores: (colaboradorId) =>
    api.get(`/groups/colaborador/${colaboradorId}/gestores`),
};

// =============================================
// HELPER — monta query string
// =============================================
function buildQuery(params) {
  if (!params) return '';
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString();
  return qs ? `?${qs}` : '';
}

export default api;
