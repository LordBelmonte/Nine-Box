// =============================================
// MOCK DATA — Dados simulados para desenvolvimento
// =============================================

/**
 * Usuários mock do sistema (não são usuários de login)
 * Estes aparecem nas listagens, consultas e avaliações
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
  {
    id: "sys-gestor-005",
    ra: "2021005",
    nome: "Carlos Mendes",
    email: "carlos.mendes@eniac.edu.br",
    tipo: "gestor",
    cargo: "Gerente Financeiro",
    departamento: "Financeiro",
    foto: null,
    dataCadastro: "2024-02-10T10:00:00.000Z"
  },
  {
    id: "sys-gestor-006",
    ra: "2021006",
    nome: "Juliana Costa",
    email: "juliana.costa@eniac.edu.br",
    tipo: "gestor",
    cargo: "Coordenadora de Marketing",
    departamento: "Marketing",
    foto: null,
    dataCadastro: "2024-02-15T10:00:00.000Z"
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
  {
    id: "sys-colab-006",
    ra: "2022006",
    nome: "Eduarda Pereira",
    email: "eduarda.pereira@eniac.edu.br",
    tipo: "colaborador",
    cargo: "QA Analyst",
    departamento: "Tecnologia da Informação",
    foto: null,
    dataCadastro: "2024-03-10T10:00:00.000Z"
  },
  {
    id: "sys-colab-021",
    ra: "2022021",
    nome: "William Castro",
    email: "william.castro@eniac.edu.br",
    tipo: "colaborador",
    cargo: "Analista de Suporte",
    departamento: "Tecnologia da Informação",
    foto: null,
    dataCadastro: "2024-04-01T10:00:00.000Z"
  },
  {
    id: "sys-colab-022",
    ra: "2022022",
    nome: "Yasmin Silva",
    email: "yasmin.silva@eniac.edu.br",
    tipo: "colaborador",
    cargo: "Técnica de Suporte",
    departamento: "Tecnologia da Informação",
    foto: null,
    dataCadastro: "2024-04-01T10:00:00.000Z"
  },

  // ========== COLABORADORES - RH ==========
  {
    id: "sys-colab-007",
    ra: "2022007",
    nome: "Felipe Araújo",
    email: "felipe.araujo@eniac.edu.br",
    tipo: "colaborador",
    cargo: "Analista de RH",
    departamento: "Recursos Humanos",
    foto: null,
    dataCadastro: "2024-03-15T10:00:00.000Z"
  },
  {
    id: "sys-colab-008",
    ra: "2022008",
    nome: "Gabriela Nunes",
    email: "gabriela.nunes@eniac.edu.br",
    tipo: "colaborador",
    cargo: "Assistente de Recrutamento",
    departamento: "Recursos Humanos",
    foto: null,
    dataCadastro: "2024-03-15T10:00:00.000Z"
  },
  {
    id: "sys-colab-009",
    ra: "2022009",
    nome: "Henrique Barros",
    email: "henrique.barros@eniac.edu.br",
    tipo: "colaborador",
    cargo: "Analista de Desenvolvimento Humano",
    departamento: "Recursos Humanos",
    foto: null,
    dataCadastro: "2024-03-20T10:00:00.000Z"
  },

  // ========== COLABORADORES - VENDAS ==========
  {
    id: "sys-colab-010",
    ra: "2022010",
    nome: "Isabela Cardoso",
    email: "isabela.cardoso@eniac.edu.br",
    tipo: "colaborador",
    cargo: "Executiva de Vendas",
    departamento: "Vendas",
    foto: null,
    dataCadastro: "2024-03-20T10:00:00.000Z"
  },
  {
    id: "sys-colab-011",
    ra: "2022011",
    nome: "João Pedro Alves",
    email: "joao.alves@eniac.edu.br",
    tipo: "colaborador",
    cargo: "Consultor Comercial",
    departamento: "Vendas",
    foto: null,
    dataCadastro: "2024-03-25T10:00:00.000Z"
  },
  {
    id: "sys-colab-012",
    ra: "2022012",
    nome: "Larissa Moreira",
    email: "larissa.moreira@eniac.edu.br",
    tipo: "colaborador",
    cargo: "Analista de Vendas",
    departamento: "Vendas",
    foto: null,
    dataCadastro: "2024-03-25T10:00:00.000Z"
  },
  {
    id: "sys-colab-013",
    ra: "2022013",
    nome: "Marcos Vieira",
    email: "marcos.vieira@eniac.edu.br",
    tipo: "colaborador",
    cargo: "Representante Comercial",
    departamento: "Vendas",
    foto: null,
    dataCadastro: "2024-03-30T10:00:00.000Z"
  },

  // ========== COLABORADORES - FINANCEIRO ==========
  {
    id: "sys-colab-014",
    ra: "2022014",
    nome: "Natália Ribeiro",
    email: "natalia.ribeiro@eniac.edu.br",
    tipo: "colaborador",
    cargo: "Analista Financeiro",
    departamento: "Financeiro",
    foto: null,
    dataCadastro: "2024-04-01T10:00:00.000Z"
  },
  {
    id: "sys-colab-015",
    ra: "2022015",
    nome: "Otávio Gomes",
    email: "otavio.gomes@eniac.edu.br",
    tipo: "colaborador",
    cargo: "Assistente Contábil",
    departamento: "Financeiro",
    foto: null,
    dataCadastro: "2024-04-01T10:00:00.000Z"
  },
  {
    id: "sys-colab-016",
    ra: "2022016",
    nome: "Paula Freitas",
    email: "paula.freitas@eniac.edu.br",
    tipo: "colaborador",
    cargo: "Analista de Contas a Pagar",
    departamento: "Financeiro",
    foto: null,
    dataCadastro: "2024-04-05T10:00:00.000Z"
  },

  // ========== COLABORADORES - MARKETING ==========
  {
    id: "sys-colab-017",
    ra: "2022017",
    nome: "Rafael Teixeira",
    email: "rafael.teixeira@eniac.edu.br",
    tipo: "colaborador",
    cargo: "Designer Gráfico",
    departamento: "Marketing",
    foto: null,
    dataCadastro: "2024-04-05T10:00:00.000Z"
  },
  {
    id: "sys-colab-018",
    ra: "2022018",
    nome: "Sabrina Dias",
    email: "sabrina.dias@eniac.edu.br",
    tipo: "colaborador",
    cargo: "Analista de Marketing Digital",
    departamento: "Marketing",
    foto: null,
    dataCadastro: "2024-04-10T10:00:00.000Z"
  },
  {
    id: "sys-colab-019",
    ra: "2022019",
    nome: "Thiago Cunha",
    email: "thiago.cunha@eniac.edu.br",
    tipo: "colaborador",
    cargo: "Social Media",
    departamento: "Marketing",
    foto: null,
    dataCadastro: "2024-04-10T10:00:00.000Z"
  },
  {
    id: "sys-colab-020",
    ra: "2022020",
    nome: "Vanessa Lopes",
    email: "vanessa.lopes@eniac.edu.br",
    tipo: "colaborador",
    cargo: "Redatora de Conteúdo",
    departamento: "Marketing",
    foto: null,
    dataCadastro: "2024-04-15T10:00:00.000Z"
  },

  // ========== ESTAGIÁRIOS ==========
  {
    id: "sys-colab-023",
    ra: "2023001",
    nome: "André Barbosa",
    email: "andre.barbosa@eniac.edu.br",
    tipo: "colaborador",
    cargo: "Estagiário de TI",
    departamento: "Tecnologia da Informação",
    foto: null,
    dataCadastro: "2024-05-01T10:00:00.000Z"
  },
  {
    id: "sys-colab-024",
    ra: "2023002",
    nome: "Beatriz Campos",
    email: "beatriz.campos@eniac.edu.br",
    tipo: "colaborador",
    cargo: "Estagiária de Marketing",
    departamento: "Marketing",
    foto: null,
    dataCadastro: "2024-05-01T10:00:00.000Z"
  },
  {
    id: "sys-colab-025",
    ra: "2023003",
    nome: "Caio Monteiro",
    email: "caio.monteiro@eniac.edu.br",
    tipo: "colaborador",
    cargo: "Estagiário de Vendas",
    departamento: "Vendas",
    foto: null,
    dataCadastro: "2024-05-01T10:00:00.000Z"
  }
];

/**
 * Avaliações mock de exemplo
 */
export const MOCK_EVALUATIONS = [
  {
    id: "eval-001",
    avaliadorId: "sys-gestor-001",
    avaliadoId: "sys-colab-001",
    avaliado: { id: "sys-colab-001", nome: "Ana Costa", tipo: "colaborador" },
    tipoAvaliacao: "gestor_para_colaborador",
    criterios: { pontualidade: 5, comunicacao: 4, tecnico: 5, proatividade: 4, equipe: 5 },
    media: 4.6,
    comentario: "Excelente desenvolvedora, sempre entrega no prazo e com qualidade.",
    anonima: true,
    data: "2024-04-15T14:30:00.000Z"
  },
  {
    id: "eval-002",
    avaliadorId: "sys-colab-001",
    avaliadoId: "sys-gestor-001",
    avaliado: { id: "sys-gestor-001", nome: "João Silva", tipo: "gestor" },
    tipoAvaliacao: "colaborador_para_gestor",
    criterios: { pontualidade: 5, comunicacao: 5, tecnico: 4, proatividade: 5, equipe: 5 },
    media: 4.8,
    comentario: "Ótimo gestor, sempre disponível e dá feedbacks construtivos.",
    anonima: true,
    data: "2024-04-16T10:00:00.000Z"
  },
  {
    id: "eval-003",
    avaliadorId: "sys-gestor-001",
    avaliadoId: "sys-colab-002",
    avaliado: { id: "sys-colab-002", nome: "Carlos Oliveira", tipo: "colaborador" },
    tipoAvaliacao: "gestor_para_colaborador",
    criterios: { pontualidade: 4, comunicacao: 4, tecnico: 5, proatividade: 3, equipe: 4 },
    media: 4.0,
    comentario: "Bom desempenho técnico, pode melhorar na proatividade.",
    anonima: true,
    data: "2024-04-17T11:00:00.000Z"
  },
  {
    id: "eval-004",
    avaliadorId: "sys-gestor-003",
    avaliadoId: "sys-colab-003",
    avaliado: { id: "sys-colab-003", nome: "Bruno Martins", tipo: "colaborador" },
    tipoAvaliacao: "gestor_para_colaborador",
    criterios: { pontualidade: 5, comunicacao: 3, tecnico: 5, proatividade: 4, equipe: 3 },
    media: 4.0,
    comentario: "Excelente tecnicamente, mas precisa melhorar comunicação com o time.",
    anonima: true,
    data: "2024-04-18T09:00:00.000Z"
  },
  {
    id: "eval-005",
    avaliadorId: "sys-colab-004",
    avaliadoId: "sys-gestor-003",
    avaliado: { id: "sys-gestor-003", nome: "Roberto Ferreira", tipo: "gestor" },
    tipoAvaliacao: "colaborador_para_gestor",
    criterios: { pontualidade: 4, comunicacao: 5, tecnico: 5, proatividade: 5, equipe: 4 },
    media: 4.6,
    comentario: "Coordenador muito técnico e sempre ajuda o time.",
    anonima: true,
    data: "2024-04-19T15:00:00.000Z"
  },
  {
    id: "eval-006",
    avaliadorId: "sys-gestor-004",
    avaliadoId: "sys-colab-010",
    avaliado: { id: "sys-colab-010", nome: "Isabela Cardoso", tipo: "colaborador" },
    tipoAvaliacao: "gestor_para_colaborador",
    criterios: { pontualidade: 5, comunicacao: 5, tecnico: 4, proatividade: 5, equipe: 5 },
    media: 4.8,
    comentario: "Vendedora excepcional, sempre bate as metas.",
    anonima: true,
    data: "2024-04-20T10:30:00.000Z"
  },
  {
    id: "eval-007",
    avaliadorId: "sys-colab-010",
    avaliadoId: "sys-gestor-004",
    avaliado: { id: "sys-gestor-004", nome: "Fernanda Lima", tipo: "gestor" },
    tipoAvaliacao: "colaborador_para_gestor",
    criterios: { pontualidade: 5, comunicacao: 5, tecnico: 4, proatividade: 5, equipe: 5 },
    media: 4.8,
    comentario: "Gerente inspiradora, motiva muito o time de vendas.",
    anonima: true,
    data: "2024-04-21T14:00:00.000Z"
  },
  {
    id: "eval-008",
    avaliadorId: "sys-gestor-002",
    avaliadoId: "sys-colab-007",
    avaliado: { id: "sys-colab-007", nome: "Felipe Araújo", tipo: "colaborador" },
    tipoAvaliacao: "gestor_para_colaborador",
    criterios: { pontualidade: 5, comunicacao: 5, tecnico: 4, proatividade: 4, equipe: 5 },
    media: 4.6,
    comentario: "Analista de RH muito competente e organizado.",
    anonima: true,
    data: "2024-04-22T11:00:00.000Z"
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
    descricao: "Capacidade de liderar equipes e inspirar pessoas",
    dataCriacao: "2024-01-10T10:00:00.000Z"
  },
  {
    id: "comp-002",
    nome: "Comunicação Efetiva",
    tipo: "comportamento",
    descricao: "Habilidade de se comunicar de forma clara e objetiva",
    dataCriacao: "2024-01-10T10:00:00.000Z"
  },
  {
    id: "comp-003",
    nome: "Resolução de Problemas",
    tipo: "tecnica",
    descricao: "Capacidade de identificar e resolver problemas complexos",
    dataCriacao: "2024-01-10T10:00:00.000Z"
  },
  {
    id: "comp-004",
    nome: "Trabalho em Equipe",
    tipo: "comportamento",
    descricao: "Colaboração efetiva com colegas e equipes",
    dataCriacao: "2024-01-10T10:00:00.000Z"
  },
  {
    id: "comp-005",
    nome: "Gestão de Tempo",
    tipo: "desempenho",
    descricao: "Organização e priorização de tarefas",
    dataCriacao: "2024-01-10T10:00:00.000Z"
  },
  {
    id: "comp-006",
    nome: "Pensamento Estratégico",
    tipo: "lideranca",
    descricao: "Visão de longo prazo e planejamento estratégico",
    dataCriacao: "2024-01-10T10:00:00.000Z"
  },
  {
    id: "comp-007",
    nome: "Desenvolvimento Técnico",
    tipo: "tecnica",
    descricao: "Conhecimento técnico e atualização constante",
    dataCriacao: "2024-01-10T10:00:00.000Z"
  },
  {
    id: "comp-008",
    nome: "Adaptabilidade",
    tipo: "comportamento",
    descricao: "Flexibilidade para se adaptar a mudanças",
    dataCriacao: "2024-01-10T10:00:00.000Z"
  },
  {
    id: "comp-009",
    nome: "Orientação para Resultados",
    tipo: "desempenho",
    descricao: "Foco em atingir metas e objetivos",
    dataCriacao: "2024-01-10T10:00:00.000Z"
  },
  {
    id: "comp-010",
    nome: "Inovação",
    tipo: "tecnica",
    descricao: "Criatividade e busca por soluções inovadoras",
    dataCriacao: "2024-01-10T10:00:00.000Z"
  }
];

/**
 * Nine Box mock de exemplo
 */
export const MOCK_NINEBOXES = [
  // Superstars (3-3)
  {
    id: "nb-001",
    pessoaId: "sys-colab-001",
    pessoa: { id: "sys-colab-001", nome: "Ana Costa", tipo: "colaborador", cargo: "Desenvolvedora Full Stack" },
    performance: 3,
    potential: 3,
    comentario: "Excelente performance e alto potencial de crescimento",
    data: "2024-04-15T10:00:00.000Z"
  },
  {
    id: "nb-002",
    pessoaId: "sys-colab-010",
    pessoa: { id: "sys-colab-010", nome: "Isabela Cardoso", tipo: "colaborador", cargo: "Executiva de Vendas" },
    performance: 3,
    potential: 3,
    comentario: "Sempre supera metas e tem grande potencial de liderança",
    data: "2024-04-16T10:00:00.000Z"
  },
  
  // Estrelas (2-3)
  {
    id: "nb-003",
    pessoaId: "sys-colab-004",
    pessoa: { id: "sys-colab-004", nome: "Camila Rodrigues", tipo: "colaborador", cargo: "Desenvolvedora Frontend" },
    performance: 2,
    potential: 3,
    comentario: "Bom desempenho com excelente potencial",
    data: "2024-04-17T10:00:00.000Z"
  },
  {
    id: "nb-004",
    pessoaId: "sys-colab-018",
    pessoa: { id: "sys-colab-018", nome: "Sabrina Dias", tipo: "colaborador", cargo: "Analista de Marketing Digital" },
    performance: 2,
    potential: 3,
    comentario: "Criativa e com grande potencial de crescimento",
    data: "2024-04-18T10:00:00.000Z"
  },
  
  // Especialistas (3-2)
  {
    id: "nb-005",
    pessoaId: "sys-colab-003",
    pessoa: { id: "sys-colab-003", nome: "Bruno Martins", tipo: "colaborador", cargo: "Desenvolvedor Backend" },
    performance: 3,
    potential: 2,
    comentario: "Excelente tecnicamente, especialista na área",
    data: "2024-04-19T10:00:00.000Z"
  },
  {
    id: "nb-006",
    pessoaId: "sys-colab-014",
    pessoa: { id: "sys-colab-014", nome: "Natália Ribeiro", tipo: "colaborador", cargo: "Analista Financeiro" },
    performance: 3,
    potential: 2,
    comentario: "Domínio completo das atividades financeiras",
    data: "2024-04-20T10:00:00.000Z"
  },
  
  // Núcleo (2-2)
  {
    id: "nb-007",
    pessoaId: "sys-colab-002",
    pessoa: { id: "sys-colab-002", nome: "Carlos Oliveira", tipo: "colaborador", cargo: "Analista de Sistemas" },
    performance: 2,
    potential: 2,
    comentario: "Desempenho sólido e consistente",
    data: "2024-04-21T10:00:00.000Z"
  },
  {
    id: "nb-008",
    pessoaId: "sys-colab-007",
    pessoa: { id: "sys-colab-007", nome: "Felipe Araújo", tipo: "colaborador", cargo: "Analista de RH" },
    performance: 2,
    potential: 2,
    comentario: "Bom desempenho nas atividades de RH",
    data: "2024-04-22T10:00:00.000Z"
  },
  {
    id: "nb-009",
    pessoaId: "sys-colab-011",
    pessoa: { id: "sys-colab-011", nome: "João Pedro Alves", tipo: "colaborador", cargo: "Consultor Comercial" },
    performance: 2,
    potential: 2,
    comentario: "Atinge as metas consistentemente",
    data: "2024-04-23T10:00:00.000Z"
  },
  
  // Enigmas (1-3)
  {
    id: "nb-010",
    pessoaId: "sys-colab-023",
    pessoa: { id: "sys-colab-023", nome: "André Barbosa", tipo: "colaborador", cargo: "Estagiário de TI" },
    performance: 1,
    potential: 3,
    comentario: "Ainda em desenvolvimento mas com grande potencial",
    data: "2024-05-01T10:00:00.000Z"
  },
  {
    id: "nb-011",
    pessoaId: "sys-colab-024",
    pessoa: { id: "sys-colab-024", nome: "Beatriz Campos", tipo: "colaborador", cargo: "Estagiária de Marketing" },
    performance: 1,
    potential: 3,
    comentario: "Estagiária promissora com muito potencial",
    data: "2024-05-02T10:00:00.000Z"
  },
  
  // Dilemas (1-2)
  {
    id: "nb-012",
    pessoaId: "sys-colab-025",
    pessoa: { id: "sys-colab-025", nome: "Caio Monteiro", tipo: "colaborador", cargo: "Estagiário de Vendas" },
    performance: 1,
    potential: 2,
    comentario: "Precisa melhorar o desempenho",
    data: "2024-05-03T10:00:00.000Z"
  },
  
  // Trabalhadores (2-1)
  {
    id: "nb-013",
    pessoaId: "sys-colab-015",
    pessoa: { id: "sys-colab-015", nome: "Otávio Gomes", tipo: "colaborador", cargo: "Assistente Contábil" },
    performance: 2,
    potential: 1,
    comentario: "Bom desempenho operacional",
    data: "2024-04-24T10:00:00.000Z"
  },
  {
    id: "nb-014",
    pessoaId: "sys-colab-021",
    pessoa: { id: "sys-colab-021", nome: "William Castro", tipo: "colaborador", cargo: "Analista de Suporte" },
    performance: 2,
    potential: 1,
    comentario: "Executa bem as tarefas do dia a dia",
    data: "2024-04-25T10:00:00.000Z"
  },
  
  // Âncoras (3-1)
  {
    id: "nb-015",
    pessoaId: "sys-colab-016",
    pessoa: { id: "sys-colab-016", nome: "Paula Freitas", tipo: "colaborador", cargo: "Analista de Contas a Pagar" },
    performance: 3,
    potential: 1,
    comentario: "Excelente no que faz, especialista operacional",
    data: "2024-04-26T10:00:00.000Z"
  },
  
  // Questões (1-1)
  {
    id: "nb-016",
    pessoaId: "sys-colab-022",
    pessoa: { id: "sys-colab-022", nome: "Yasmin Silva", tipo: "colaborador", cargo: "Técnica de Suporte" },
    performance: 1,
    potential: 1,
    comentario: "Necessita desenvolvimento urgente",
    data: "2024-04-27T10:00:00.000Z"
  }
];
