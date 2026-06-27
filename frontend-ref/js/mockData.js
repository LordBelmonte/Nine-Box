// =============================================
// MOCK DATA — Dados simulados para desenvolvimento
// =============================================

/**
 * Usuários mock do sistema
 */
export const MOCK_SYSTEM_USERS = [
  // ========== ADMINISTRADORES ==========
  {
    id: "sys-admin-001",
    ra: "1234567",
    nome: "Admin Sistema",
    email: "admin@eniac.edu.br",
    tipo: "admin",
    cargo: "Administrador do Sistema",
    departamento: "Tecnologia da Informação",
    foto: null,
    dataCadastro: "2024-01-15T10:00:00.000Z"
  },
  {
    id: "sys-admin-002",
    ra: "1234568",
    nome: "Patricia Almeida",
    email: "patricia.almeida@eniac.edu.br",
    tipo: "admin",
    cargo: "Diretora de RH",
    departamento: "Recursos Humanos",
    foto: null,
    dataCadastro: "2024-01-15T10:00:00.000Z"
  },

  // ========== GESTORES ==========
  {
    id: "sys-gestor-001",
    ra: "2021001",
    nome: "João Silva",
    email: "joao.silva@eniac.edu.br",
    tipo: "gestor",
    cargo: "Gerente de TI",
    departamento: "Tecnologia da Informação",
    foto: null,
    dataCadastro: "2024-02-01T10:00:00.000Z"
  },
  {
    id: "sys-gestor-002",
    ra: "2021002",
    nome: "Maria Santos",
    email: "maria.santos@eniac.edu.br",
    tipo: "gestor",
    cargo: "Gerente de RH",
    departamento: "Recursos Humanos",
    foto: null,
    dataCadastro: "2024-02-01T10:00:00.000Z"
  },
  {
    id: "sys-gestor-003",
    ra: "2021003",
    nome: "Roberto Ferreira",
    email: "roberto.ferreira@eniac.edu.br",
    tipo: "gestor",
    cargo: "Coordenador de Desenvolvimento",
    departamento: "Tecnologia da Informação",
    foto: null,
    dataCadastro: "2024-02-05T10:00:00.000Z"
  },
  {
    id: "sys-gestor-004",
    ra: "2021004",
    nome: "Fernanda Lima",
    email: "fernanda.lima@eniac.edu.br",
    tipo: "gestor",
    cargo: "Gerente Comercial",
    departamento: "Vendas",
    foto: null,
    dataCadastro: "2024-02-10T10:00:00.000Z"
  },

  // ========== COLABORADORES - TI ==========
  {
    id: "sys-colab-001",
    ra: "2022001",
    nome: "Ana Costa",
    email: "ana.costa@eniac.edu.br",
    tipo: "colaborador",
    cargo: "Desenvolvedora Full Stack",
    departamento: "Tecnologia da Informação",
    foto: null,
    dataCadastro: "2024-03-01T10:00:00.000Z"
  },
  {
    id: "sys-colab-002",
    ra: "2022002",
    nome: "Carlos Oliveira",
    email: "carlos.oliveira@eniac.edu.br",
    tipo: "colaborador",
    cargo: "Analista de Sistemas",
    departamento: "Tecnologia da Informação",
    foto: null,
    dataCadastro: "2024-03-01T10:00:00.000Z"
  },
  {
    id: "sys-colab-003",
    ra: "2022003",
    nome: "Bruno Martins",
    email: "bruno.martins@eniac.edu.br",
    tipo: "colaborador",
    cargo: "Desenvolvedor Backend",
    departamento: "Tecnologia da Informação",
    foto: null,
    dataCadastro: "2024-03-05T10:00:00.000Z"
  },
  {
    id: "sys-colab-004",
    ra: "2022004",
    nome: "Camila Rodrigues",
    email: "camila.rodrigues@eniac.edu.br",
    tipo: "colaborador",
    cargo: "Desenvolvedora Frontend",
    departamento: "Tecnologia da Informação",
    foto: null,
    dataCadastro: "2024-03-05T10:00:00.000Z"
  },
  {
    id: "sys-colab-005",
    ra: "2022005",
    nome: "Diego Souza",
    email: "diego.souza@eniac.edu.br",
    tipo: "colaborador",
    cargo: "DevOps Engineer",
    departamento: "Tecnologia da Informação",
    foto: null,
    dataCadastro: "2024-03-10T10:00:00.000Z"
  },

  // ========== COLABORADORES - RH ==========
  {
    id: "sys-colab-006",
    ra: "2022006",
    nome: "Felipe Araújo",
    email: "felipe.araujo@eniac.edu.br",
    tipo: "colaborador",
    cargo: "Analista de RH",
    departamento: "Recursos Humanos",
    foto: null,
    dataCadastro: "2024-03-15T10:00:00.000Z"
  },
  {
    id: "sys-colab-007",
    ra: "2022007",
    nome: "Gabriela Nunes",
    email: "gabriela.nunes@eniac.edu.br",
    tipo: "colaborador",
    cargo: "Assistente de Recrutamento",
    departamento: "Recursos Humanos",
    foto: null,
    dataCadastro: "2024-03-15T10:00:00.000Z"
  },

  // ========== COLABORADORES - VENDAS ==========
  {
    id: "sys-colab-008",
    ra: "2022008",
    nome: "Isabela Cardoso",
    email: "isabela.cardoso@eniac.edu.br",
    tipo: "colaborador",
    cargo: "Executiva de Vendas",
    departamento: "Vendas",
    foto: null,
    dataCadastro: "2024-03-20T10:00:00.000Z"
  },
  {
    id: "sys-colab-009",
    ra: "2022009",
    nome: "João Pedro Alves",
    email: "joao.alves@eniac.edu.br",
    tipo: "colaborador",
    cargo: "Consultor Comercial",
    departamento: "Vendas",
    foto: null,
    dataCadastro: "2024-03-25T10:00:00.000Z"
  }
];

/**
 * Grupos: quais colaboradores cada gestor é responsável
 */
export const MOCK_GRUPOS = [
  {
    gestorId: "sys-gestor-001",
    colaboradorIds: ["sys-colab-001", "sys-colab-002", "sys-colab-003"]
  },
  {
    gestorId: "sys-gestor-002",
    colaboradorIds: ["sys-colab-006", "sys-colab-007"]
  },
  {
    gestorId: "sys-gestor-003",
    colaboradorIds: ["sys-colab-004", "sys-colab-005"]
  },
  {
    gestorId: "sys-gestor-004",
    colaboradorIds: ["sys-colab-008", "sys-colab-009"]
  }
];

/**
 * Campanhas de avaliação criadas pelo admin
 * criterios: Array de { nome, descricao, escala }
 */
export const MOCK_CAMPAIGNS = [
  {
    id: "camp-001",
    nome: "Avaliação Semestral TI - 2026/1",
    descricao: "Avaliação de desempenho semestral dos colaboradores do departamento de TI",
    dataInicio: "2026-05-01T00:00:00.000Z",
    dataFim: "2026-06-30T00:00:00.000Z",
    status: "ativa",
    tipoAlvo: "colaborador",
    criterios: [
      { nome: "Qualidade técnica", descricao: "Qualidade das entregas técnicas", escala: 5 },
      { nome: "Cumprimento de prazos", descricao: "Entrega dentro dos prazos acordados", escala: 5 },
      { nome: "Comunicação", descricao: "Clareza e frequência na comunicação", escala: 5 },
      { nome: "Trabalho em equipe", descricao: "Colaboração com o time", escala: 5 },
      { nome: "Proatividade", descricao: "Iniciativa e antecipação de problemas", escala: 5 }
    ],
    gestores: [
      { gestorId: "sys-gestor-001", gestor: { id: "sys-gestor-001", nome: "João Silva" } }
    ],
    _count: { avaliacoes: 2 },
    createdAt: "2026-04-20T10:00:00.000Z"
  },
  {
    id: "camp-002",
    nome: "Avaliação de Desempenho RH - 2026/1",
    descricao: "Avaliação dos colaboradores do departamento de RH",
    dataInicio: "2026-05-15T00:00:00.000Z",
    dataFim: "2026-07-15T00:00:00.000Z",
    status: "ativa",
    tipoAlvo: "colaborador",
    criterios: [
      { nome: "Atendimento ao cliente interno", descricao: "Qualidade no atendimento", escala: 5 },
      { nome: "Organização", descricao: "Organização e gestão de documentos", escala: 5 },
      { nome: "Conhecimento técnico", descricao: "Domínio das ferramentas e processos de RH", escala: 5 },
      { nome: "Relacionamento interpessoal", descricao: "Qualidade das relações com colegas", escala: 5 }
    ],
    gestores: [
      { gestorId: "sys-gestor-002", gestor: { id: "sys-gestor-002", nome: "Maria Santos" } }
    ],
    _count: { avaliacoes: 1 },
    createdAt: "2026-04-25T10:00:00.000Z"
  },
  {
    id: "camp-003",
    nome: "Avaliação Anual 2025",
    descricao: "Avaliação anual de todos os colaboradores",
    dataInicio: "2025-11-01T00:00:00.000Z",
    dataFim: "2025-12-31T00:00:00.000Z",
    status: "finalizada",
    tipoAlvo: "colaborador",
    criterios: [
      { nome: "Desempenho geral", descricao: "Avaliação geral do desempenho", escala: 10 },
      { nome: "Metas atingidas", descricao: "Percentual de metas atingidas", escala: 10 },
      { nome: "Comportamento", descricao: "Postura e comportamento no trabalho", escala: 10 }
    ],
    gestores: [
      { gestorId: "sys-gestor-001", gestor: { id: "sys-gestor-001", nome: "João Silva" } },
      { gestorId: "sys-gestor-002", gestor: { id: "sys-gestor-002", nome: "Maria Santos" } }
    ],
    _count: { avaliacoes: 5 },
    createdAt: "2025-10-15T10:00:00.000Z"
  },
  {
    id: "camp-004",
    nome: "Avaliação Liderança Comercial - 2026/2",
    descricao: "Avaliação de competências de liderança dos gestores comerciais",
    dataInicio: "2026-07-01T00:00:00.000Z",
    dataFim: "2026-08-31T00:00:00.000Z",
    status: "planejamento",
    tipoAlvo: "gestor",
    criterios: [
      { nome: "Gestão de equipe", descricao: "Capacidade de gerir e motivar a equipe", escala: 5 },
      { nome: "Resultados", descricao: "Atingimento de metas da equipe", escala: 5 },
      { nome: "Desenvolvimento de pessoas", descricao: "Investimento no crescimento do time", escala: 5 }
    ],
    gestores: [],
    _count: { avaliacoes: 0 },
    createdAt: "2026-05-10T10:00:00.000Z"
  }
];

/**
 * Avaliações mock — agora vinculadas a campanhas com critérios dinâmicos
 */
export const MOCK_EVALUATIONS = [
  {
    id: "eval-001",
    campaignId: "camp-001",
    campaign: { id: "camp-001", nome: "Avaliação Semestral TI - 2026/1" },
    avaliadorId: "sys-gestor-001",
    avaliadoId: "sys-colab-001",
    avaliado: { id: "sys-colab-001", nome: "Ana Costa", tipo: "colaborador", cargo: "Desenvolvedora Full Stack" },
    criterios: {
      "Qualidade técnica": 5,
      "Cumprimento de prazos": 4,
      "Comunicação": 4,
      "Trabalho em equipe": 5,
      "Proatividade": 4
    },
    media: 4.4,
    comentario: "Excelente profissional, entrega com qualidade e dentro dos prazos.",
    anonima: false,
    data: "2026-05-20T14:30:00.000Z"
  },
  {
    id: "eval-002",
    campaignId: "camp-001",
    campaign: { id: "camp-001", nome: "Avaliação Semestral TI - 2026/1" },
    avaliadorId: "sys-gestor-001",
    avaliadoId: "sys-colab-002",
    avaliado: { id: "sys-colab-002", nome: "Carlos Oliveira", tipo: "colaborador", cargo: "Analista de Sistemas" },
    criterios: {
      "Qualidade técnica": 4,
      "Cumprimento de prazos": 3,
      "Comunicação": 4,
      "Trabalho em equipe": 4,
      "Proatividade": 3
    },
    media: 3.6,
    comentario: "Bom desempenho técnico, precisa melhorar gestão de prazos.",
    anonima: false,
    data: "2026-05-21T10:00:00.000Z"
  },
  {
    id: "eval-003",
    campaignId: "camp-002",
    campaign: { id: "camp-002", nome: "Avaliação de Desempenho RH - 2026/1" },
    avaliadorId: "sys-gestor-002",
    avaliadoId: "sys-colab-006",
    avaliado: { id: "sys-colab-006", nome: "Felipe Araújo", tipo: "colaborador", cargo: "Analista de RH" },
    criterios: {
      "Atendimento ao cliente interno": 5,
      "Organização": 5,
      "Conhecimento técnico": 4,
      "Relacionamento interpessoal": 5
    },
    media: 4.75,
    comentario: "Profissional exemplar, referência no departamento.",
    anonima: false,
    data: "2026-05-22T11:00:00.000Z"
  },
  {
    id: "eval-004",
    campaignId: "camp-003",
    campaign: { id: "camp-003", nome: "Avaliação Anual 2025" },
    avaliadorId: "sys-gestor-001",
    avaliadoId: "sys-colab-001",
    avaliado: { id: "sys-colab-001", nome: "Ana Costa", tipo: "colaborador", cargo: "Desenvolvedora Full Stack" },
    criterios: {
      "Desempenho geral": 9,
      "Metas atingidas": 8,
      "Comportamento": 9
    },
    media: 8.67,
    comentario: "Ótimo ano, superou expectativas.",
    anonima: false,
    data: "2025-12-10T10:00:00.000Z"
  }
];

/**
 * Competências mock de exemplo
 */
export const MOCK_COMPETENCIES = [
  {
    id: "comp-001",
    nome: "Liderança",
    tipo: "lideranca",
    competenciaDe: "gestor",
    descricao: "Capacidade de liderar equipes e inspirar pessoas",
    criterios: ["Delegar tarefas", "Motivar equipe", "Tomar decisões", "Dar feedback"],
    createdAt: "2024-01-10T10:00:00.000Z"
  },
  {
    id: "comp-002",
    nome: "Comunicação",
    tipo: "comportamento",
    competenciaDe: "todos",
    descricao: "Clareza e efetividade na comunicação",
    criterios: ["Clareza oral", "Clareza escrita", "Escuta ativa"],
    createdAt: "2024-01-10T10:00:00.000Z"
  },
  {
    id: "comp-003",
    nome: "Trabalho em Equipe",
    tipo: "comportamento",
    competenciaDe: "colaborador",
    descricao: "Colaboração e sinergia com colegas",
    criterios: ["Colaboração", "Respeito", "Comprometimento"],
    createdAt: "2024-01-10T10:00:00.000Z"
  },
  {
    id: "comp-004",
    nome: "Resolução de Problemas",
    tipo: "tecnica",
    competenciaDe: "todos",
    descricao: "Capacidade analítica e criatividade para resolver problemas",
    criterios: ["Análise crítica", "Criatividade", "Agilidade"],
    createdAt: "2024-01-10T10:00:00.000Z"
  },
  {
    id: "comp-005",
    nome: "Proatividade",
    tipo: "comportamento",
    competenciaDe: "todos",
    descricao: "Iniciativa e antecipação de demandas",
    criterios: ["Iniciativa", "Antecipação", "Autonomia"],
    createdAt: "2024-01-10T10:00:00.000Z"
  }
];

/**
 * Nine Box mock de exemplo
 */
export const MOCK_NINEBOXES = [
  {
    id: "nb-001",
    pessoaId: "sys-colab-001",
    pessoa: { id: "sys-colab-001", nome: "Ana Costa", tipo: "colaborador", cargo: "Desenvolvedora Full Stack" },
    performance: 3,
    potential: 3,
    categoria: "A3 (Destaque)",
    comentario: "Excelente performance e alto potencial de crescimento",
    data: "2026-05-15T10:00:00.000Z"
  },
  {
    id: "nb-002",
    pessoaId: "sys-colab-008",
    pessoa: { id: "sys-colab-008", nome: "Isabela Cardoso", tipo: "colaborador", cargo: "Executiva de Vendas" },
    performance: 3,
    potential: 3,
    categoria: "A3 (Destaque)",
    comentario: "Sempre supera metas e tem grande potencial de liderança",
    data: "2026-05-16T10:00:00.000Z"
  },
  {
    id: "nb-003",
    pessoaId: "sys-colab-004",
    pessoa: { id: "sys-colab-004", nome: "Camila Rodrigues", tipo: "colaborador", cargo: "Desenvolvedora Frontend" },
    performance: 2,
    potential: 3,
    categoria: "A2 (Em crescimento)",
    comentario: "Bom desempenho com excelente potencial",
    data: "2026-05-17T10:00:00.000Z"
  },
  {
    id: "nb-004",
    pessoaId: "sys-colab-003",
    pessoa: { id: "sys-colab-003", nome: "Bruno Martins", tipo: "colaborador", cargo: "Desenvolvedor Backend" },
    performance: 3,
    potential: 2,
    categoria: "M3 (Forte Desempenho)",
    comentario: "Excelente tecnicamente, especialista na área",
    data: "2026-05-18T10:00:00.000Z"
  },
  {
    id: "nb-005",
    pessoaId: "sys-colab-002",
    pessoa: { id: "sys-colab-002", nome: "Carlos Oliveira", tipo: "colaborador", cargo: "Analista de Sistemas" },
    performance: 2,
    potential: 2,
    categoria: "M2 (Mantenedor)",
    comentario: "Desempenho sólido e consistente",
    data: "2026-05-19T10:00:00.000Z"
  },
  {
    id: "nb-006",
    pessoaId: "sys-colab-006",
    pessoa: { id: "sys-colab-006", nome: "Felipe Araújo", tipo: "colaborador", cargo: "Analista de RH" },
    performance: 2,
    potential: 2,
    categoria: "M2 (Mantenedor)",
    comentario: "Bom desempenho nas atividades de RH",
    data: "2026-05-20T10:00:00.000Z"
  },
  {
    id: "nb-007",
    pessoaId: "sys-colab-005",
    pessoa: { id: "sys-colab-005", nome: "Diego Souza", tipo: "colaborador", cargo: "DevOps Engineer" },
    performance: 1,
    potential: 2,
    categoria: "M1 (Questionável)",
    comentario: "Potencial presente, performance a desenvolver",
    data: "2026-05-21T10:00:00.000Z"
  }
];
