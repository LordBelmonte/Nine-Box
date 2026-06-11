// =============================================
// AUTH.JS — Autenticação com JWT (com suporte MOCK)
// =============================================
// NOTA: Código mock mantido para referência/desenvolvimento
// Para ativar modo mock: CONFIG.MOCK_MODE = true em config.js
// Em produção, sempre use CONFIG.MOCK_MODE = false

import CONFIG from './config.js';

// =============================================
// MODO MOCK (para desenvolvimento sem backend)
// =============================================
// NOTA: MOCK_MODE está definido em config.js
// Este arquivo mantém dados mock apenas para referência/desenvolvimento

const MOCK_USERS = [
  // ========== ADMINISTRADORES ==========
  {
    id: "sys-admin-001",
    ra: "1234567",
    nome: "Admin Sistema",
    email: "admin@eniac.edu.br",
    senha: "admin123",
    tipo: "admin",
    cargo: "Administrador do Sistema",
    departamento: "Tecnologia da Informação",
    foto: null
  },
  {
    id: "sys-admin-002",
    ra: "1234568",
    nome: "Patricia Almeida",
    email: "patricia.almeida@eniac.edu.br",
    senha: "admin123",
    tipo: "admin",
    cargo: "Diretora de RH",
    departamento: "Recursos Humanos",
    foto: null
  },

  // ========== GESTORES ==========
  {
    id: "sys-gestor-001",
    ra: "2021001",
    nome: "João Silva",
    email: "joao.silva@eniac.edu.br",
    senha: "senha123",
    tipo: "gestor",
    cargo: "Gerente de TI",
    departamento: "Tecnologia da Informação",
    foto: null
  },
  {
    id: "sys-gestor-002",
    ra: "2021002",
    nome: "Maria Santos",
    email: "maria.santos@eniac.edu.br",
    senha: "senha123",
    tipo: "gestor",
    cargo: "Gerente de RH",
    departamento: "Recursos Humanos",
    foto: null
  },
  {
    id: "sys-gestor-003",
    ra: "2021003",
    nome: "Roberto Ferreira",
    email: "roberto.ferreira@eniac.edu.br",
    senha: "senha123",
    tipo: "gestor",
    cargo: "Coordenador de Desenvolvimento",
    departamento: "Tecnologia da Informação",
    foto: null
  },
  {
    id: "sys-gestor-004",
    ra: "2021004",
    nome: "Fernanda Lima",
    email: "fernanda.lima@eniac.edu.br",
    senha: "senha123",
    tipo: "gestor",
    cargo: "Gerente Comercial",
    departamento: "Vendas",
    foto: null
  },
  {
    id: "sys-gestor-005",
    ra: "2021005",
    nome: "Carlos Mendes",
    email: "carlos.mendes@eniac.edu.br",
    senha: "senha123",
    tipo: "gestor",
    cargo: "Gerente Financeiro",
    departamento: "Financeiro",
    foto: null
  },
  {
    id: "sys-gestor-006",
    ra: "2021006",
    nome: "Juliana Costa",
    email: "juliana.costa@eniac.edu.br",
    senha: "senha123",
    tipo: "gestor",
    cargo: "Coordenadora de Marketing",
    departamento: "Marketing",
    foto: null
  },

  // ========== COLABORADORES - TI ==========
  {
    id: "sys-colab-001",
    ra: "2022001",
    nome: "Ana Costa",
    email: "ana.costa@eniac.edu.br",
    senha: "senha123",
    tipo: "colaborador",
    cargo: "Desenvolvedora Full Stack",
    departamento: "Tecnologia da Informação",
    foto: null
  },
  {
    id: "sys-colab-002",
    ra: "2022002",
    nome: "Carlos Oliveira",
    email: "carlos.oliveira@eniac.edu.br",
    senha: "senha123",
    tipo: "colaborador",
    cargo: "Analista de Sistemas",
    departamento: "Tecnologia da Informação",
    foto: null
  },
  {
    id: "sys-colab-003",
    ra: "2022003",
    nome: "Bruno Martins",
    email: "bruno.martins@eniac.edu.br",
    senha: "senha123",
    tipo: "colaborador",
    cargo: "Desenvolvedor Backend",
    departamento: "Tecnologia da Informação",
    foto: null
  },
  {
    id: "sys-colab-004",
    ra: "2022004",
    nome: "Camila Rodrigues",
    email: "camila.rodrigues@eniac.edu.br",
    senha: "senha123",
    tipo: "colaborador",
    cargo: "Desenvolvedora Frontend",
    departamento: "Tecnologia da Informação",
    foto: null
  },
  {
    id: "sys-colab-005",
    ra: "2022005",
    nome: "Diego Souza",
    email: "diego.souza@eniac.edu.br",
    senha: "senha123",
    tipo: "colaborador",
    cargo: "DevOps Engineer",
    departamento: "Tecnologia da Informação",
    foto: null
  },
  {
    id: "sys-colab-006",
    ra: "2022006",
    nome: "Eduarda Pereira",
    email: "eduarda.pereira@eniac.edu.br",
    senha: "senha123",
    tipo: "colaborador",
    cargo: "QA Analyst",
    departamento: "Tecnologia da Informação",
    foto: null
  },

  // ========== COLABORADORES - RH ==========
  {
    id: "sys-colab-007",
    ra: "2022007",
    nome: "Felipe Araújo",
    email: "felipe.araujo@eniac.edu.br",
    senha: "senha123",
    tipo: "colaborador",
    cargo: "Analista de RH",
    departamento: "Recursos Humanos",
    foto: null
  },
  {
    id: "sys-colab-008",
    ra: "2022008",
    nome: "Gabriela Nunes",
    email: "gabriela.nunes@eniac.edu.br",
    senha: "senha123",
    tipo: "colaborador",
    cargo: "Assistente de Recrutamento",
    departamento: "Recursos Humanos",
    foto: null
  },
  {
    id: "sys-colab-009",
    ra: "2022009",
    nome: "Henrique Barros",
    email: "henrique.barros@eniac.edu.br",
    senha: "senha123",
    tipo: "colaborador",
    cargo: "Analista de Desenvolvimento Humano",
    departamento: "Recursos Humanos",
    foto: null
  },

  // ========== COLABORADORES - VENDAS ==========
  {
    id: "sys-colab-010",
    ra: "2022010",
    nome: "Isabela Cardoso",
    email: "isabela.cardoso@eniac.edu.br",
    senha: "senha123",
    tipo: "colaborador",
    cargo: "Executiva de Vendas",
    departamento: "Vendas",
    foto: null
  },
  {
    id: "sys-colab-011",
    ra: "2022011",
    nome: "João Pedro Alves",
    email: "joao.alves@eniac.edu.br",
    senha: "senha123",
    tipo: "colaborador",
    cargo: "Consultor Comercial",
    departamento: "Vendas",
    foto: null
  },
  {
    id: "sys-colab-012",
    ra: "2022012",
    nome: "Larissa Moreira",
    email: "larissa.moreira@eniac.edu.br",
    senha: "senha123",
    tipo: "colaborador",
    cargo: "Analista de Vendas",
    departamento: "Vendas",
    foto: null
  },
  {
    id: "sys-colab-013",
    ra: "2022013",
    nome: "Marcos Vieira",
    email: "marcos.vieira@eniac.edu.br",
    senha: "senha123",
    tipo: "colaborador",
    cargo: "Representante Comercial",
    departamento: "Vendas",
    foto: null
  },

  // ========== COLABORADORES - FINANCEIRO ==========
  {
    id: "sys-colab-014",
    ra: "2022014",
    nome: "Natália Ribeiro",
    email: "natalia.ribeiro@eniac.edu.br",
    senha: "senha123",
    tipo: "colaborador",
    cargo: "Analista Financeiro",
    departamento: "Financeiro",
    foto: null
  },
  {
    id: "sys-colab-015",
    ra: "2022015",
    nome: "Otávio Gomes",
    email: "otavio.gomes@eniac.edu.br",
    senha: "senha123",
    tipo: "colaborador",
    cargo: "Assistente Contábil",
    departamento: "Financeiro",
    foto: null
  },
  {
    id: "sys-colab-016",
    ra: "2022016",
    nome: "Paula Freitas",
    email: "paula.freitas@eniac.edu.br",
    senha: "senha123",
    tipo: "colaborador",
    cargo: "Analista de Contas a Pagar",
    departamento: "Financeiro",
    foto: null
  },

  // ========== COLABORADORES - MARKETING ==========
  {
    id: "sys-colab-017",
    ra: "2022017",
    nome: "Rafael Teixeira",
    email: "rafael.teixeira@eniac.edu.br",
    senha: "senha123",
    tipo: "colaborador",
    cargo: "Designer Gráfico",
    departamento: "Marketing",
    foto: null
  },
  {
    id: "sys-colab-018",
    ra: "2022018",
    nome: "Sabrina Dias",
    email: "sabrina.dias@eniac.edu.br",
    senha: "senha123",
    tipo: "colaborador",
    cargo: "Analista de Marketing Digital",
    departamento: "Marketing",
    foto: null
  },
  {
    id: "sys-colab-019",
    ra: "2022019",
    nome: "Thiago Cunha",
    email: "thiago.cunha@eniac.edu.br",
    senha: "senha123",
    tipo: "colaborador",
    cargo: "Social Media",
    departamento: "Marketing",
    foto: null
  },
  {
    id: "sys-colab-020",
    ra: "2022020",
    nome: "Vanessa Lopes",
    email: "vanessa.lopes@eniac.edu.br",
    senha: "senha123",
    tipo: "colaborador",
    cargo: "Redatora de Conteúdo",
    departamento: "Marketing",
    foto: null
  },

  // ========== COLABORADORES - SUPORTE ==========
  {
    id: "sys-colab-021",
    ra: "2022021",
    nome: "William Castro",
    email: "william.castro@eniac.edu.br",
    senha: "senha123",
    tipo: "colaborador",
    cargo: "Analista de Suporte",
    departamento: "Tecnologia da Informação",
    foto: null
  },
  {
    id: "sys-colab-022",
    ra: "2022022",
    nome: "Yasmin Silva",
    email: "yasmin.silva@eniac.edu.br",
    senha: "senha123",
    tipo: "colaborador",
    cargo: "Técnica de Suporte",
    departamento: "Tecnologia da Informação",
    foto: null
  },

  // ========== COLABORADORES - DIVERSOS ==========
  {
    id: "sys-colab-023",
    ra: "2023001",
    nome: "André Barbosa",
    email: "andre.barbosa@eniac.edu.br",
    senha: "senha123",
    tipo: "colaborador",
    cargo: "Estagiário de TI",
    departamento: "Tecnologia da Informação",
    foto: null
  },
  {
    id: "sys-colab-024",
    ra: "2023002",
    nome: "Beatriz Campos",
    email: "beatriz.campos@eniac.edu.br",
    senha: "senha123",
    tipo: "colaborador",
    cargo: "Estagiária de Marketing",
    departamento: "Marketing",
    foto: null
  },
  {
    id: "sys-colab-025",
    ra: "2023003",
    nome: "Caio Monteiro",
    email: "caio.monteiro@eniac.edu.br",
    senha: "senha123",
    tipo: "colaborador",
    cargo: "Estagiário de Vendas",
    departamento: "Vendas",
    foto: null
  }
];

/**
 * Login MOCK (simulação do backend)
 */
export function loginMock(email, senha) {
  const usuario = MOCK_USERS.find(u => u.email === email);
  
  if (!usuario || usuario.senha !== senha) {
    throw new Error('Email ou senha incorretos');
  }
  
  // Criar token mock
  const token = btoa(JSON.stringify({
    userId: usuario.id,
    email: usuario.email,
    tipo: usuario.tipo,
    ra: usuario.ra,
    timestamp: Date.now()
  }));
  
  // Remover senha antes de salvar
  const { senha: _, ...usuarioSemSenha } = usuario;
  
  return {
    success: true,
    data: {
      token,
      user: usuarioSemSenha
    },
    message: 'Login realizado com sucesso'
  };
}

// =============================================
// TOKEN
// =============================================
export function getToken() {
  return localStorage.getItem(CONFIG.TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(CONFIG.TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(CONFIG.TOKEN_KEY);
}

// =============================================
// USUÁRIO LOGADO
// =============================================
export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG.USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function setUser(user) {
  localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
}

export function removeUser() {
  localStorage.removeItem(CONFIG.USER_KEY);
}

// =============================================
// SESSÃO
// =============================================
export function isLoggedIn() {
  return !!getToken();
}

export function logout() {
  removeToken();
  removeUser();
  window.location.href = '/frontend-ref/pages/login.html';
}

// =============================================
// PERMISSÕES
// =============================================
export function isAdmin() {
  return getUser()?.tipo === 'admin';
}

export function isGestor() {
  return getUser()?.tipo === 'gestor';
}

export function isColaborador() {
  return getUser()?.tipo === 'colaborador';
}

// =============================================
// PROTEÇÃO DE ROTAS
// =============================================

/**
 * Redireciona para login se não estiver autenticado.
 * Chame no início de cada página protegida.
 * Também atualiza o perfil do usuário do servidor.
 */
export async function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = '/frontend-ref/pages/login.html';
    return false;
  }
  
  // Atualizar perfil do servidor para garantir dados mais recentes (incluindo foto)
  // Apenas admin pode acessar o perfil
  const user = getUser();
  if (user?.tipo === 'admin') {
    try {
      const { usersApi } = await import('./api.js');
      const res = await usersApi.getProfile();
      if (res.data) {
        setUser(res.data);
        console.log('[AUTH] Perfil atualizado do servidor:', res.data);
      }
    } catch (err) {
      console.warn('[AUTH] Não foi possível atualizar perfil do servidor:', err);
    }
  }
  
  return true;
}

/**
 * Redireciona para index se não tiver a permissão necessária.
 * @param {'admin'|'gestor'|'colaborador'|'gestorOrAdmin'} role
 */
export function requireRole(role) {
  if (!requireAuth()) return false;

  const tipo = getUser()?.tipo;
  const allowed = {
    admin:         tipo === 'admin',
    gestor:        tipo === 'gestor',
    colaborador:   tipo === 'colaborador',
    gestorOrAdmin: tipo === 'gestor' || tipo === 'admin',
  };

  if (!allowed[role]) {
    // Se for gestor ou colaborador tentando acessar página de admin, redireciona para avaliações
    if (tipo === 'gestor' || tipo === 'colaborador') {
      window.location.href = '/frontend-ref/pages/avaliacoes.html';
    } else {
      window.location.href = '/frontend-ref/index.html';
    }
    return false;
  }
  return true;
}

/**
 * Redireciona gestor/colaborador para avaliações se tentarem acessar página administrativa
 * Apenas admin pode acessar páginas administrativas
 */
export function requireAdmin() {
  if (!requireAuth()) return false;

  const tipo = getUser()?.tipo;
  if (tipo !== 'admin') {
    window.location.href = '/frontend-ref/pages/avaliacoes.html';
    return false;
  }
  return true;
}

/**
 * Atualiza o header com os dados do usuário logado.
 * Chame após requireAuth() em cada página.
 */
export function updateHeaderUser() {
  const user = getUser();
  console.log('updateHeaderUser chamado, user:', user);
  if (!user) return;

  const nomeEl   = document.getElementById('user-dropdown-nome');
  const tipoEl   = document.getElementById('user-dropdown-tipo');
  const avatarEl = document.getElementById('user-dropdown-avatar');
  const userBtn  = document.getElementById('user-btn');
  const sairBtn  = document.getElementById('btn-sair-header');

  if (nomeEl)  nomeEl.textContent  = user.nome || 'Usuário';
  if (tipoEl)  tipoEl.textContent  = tipoLabel(user.tipo);
  if (sairBtn) sairBtn.style.display = 'flex';

  const iniciais = (user.nome || 'U').split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();

  // Atualizar avatar no dropdown
  if (avatarEl) {
    console.log('Atualizando avatar dropdown, foto:', user.foto);
    if (user.foto) {
      avatarEl.innerHTML = `<img src="${user.foto}" alt="${user.nome}">`;
    } else {
      avatarEl.innerHTML = `<span>${iniciais}</span>`;
    }
  }

  // Atualizar botão do usuário no header
  if (userBtn) {
    console.log('Atualizando botão header, foto:', user.foto);
    if (user.foto) {
      userBtn.innerHTML = `<img src="${user.foto}" alt="${user.nome}">`;
    } else {
      userBtn.innerHTML = `<span>${iniciais}</span>`;
    }
  }

  // Esconder link de perfil para não-admin
  document.querySelectorAll('[data-role="admin"]').forEach(el => {
    el.style.display = user.tipo === 'admin' ? '' : 'none';
  });
}

export function sairDaConta() {
  logout();
}

export function toggleUserMenu() {
  document.getElementById('user-dropdown')?.classList.toggle('open');
}

// Fechar dropdown ao clicar fora
document.addEventListener('click', (e) => {
  if (!e.target.closest('#user-menu')) {
    document.getElementById('user-dropdown')?.classList.remove('open');
  }
});

// =============================================
// HELPERS
// =============================================
export function tipoLabel(tipo) {
  const labels = { admin: 'Administrador', gestor: 'Gestor', colaborador: 'Colaborador' };
  return labels[tipo] || tipo;
}
