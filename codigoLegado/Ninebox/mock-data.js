// Dados Mock para o Código Legado Ninebox

const mockUsers = [
  { 
    id: 1, 
    email: 'admin@admin.com', 
    senha: 'admin123', 
    tipo: 'admin', 
    nome: 'Administrador',
    cpf: '00000000000'
  },
  { 
    id: 2, 
    cpf: '12345678900', 
    tipo: 'colaborador', 
    nome: 'João Silva',
    email: 'joao.silva@email.com',
    senha: '123456'
  },
  { 
    id: 3, 
    cpf: '09876543211', 
    tipo: 'gestor', 
    nome: 'Maria Santos',
    email: 'maria.santos@email.com',
    senha: '123456'
  },
  { 
    id: 4, 
    cpf: '11122233344', 
    tipo: 'colaborador', 
    nome: 'Pedro Oliveira',
    email: 'pedro.oliveira@email.com',
    senha: '123456'
  },
  { 
    id: 5, 
    cpf: '55566677788', 
    tipo: 'gestor', 
    nome: 'Ana Costa',
    email: 'ana.costa@email.com',
    senha: '123456'
  }
];

const mockAvaliacoes = [
  {
    id: 1,
    nome: 'Avaliação de Desempenho 2024',
    descricao: 'Avaliação anual de desempenho para todos os colaboradores',
    dataInicio: '2024-01-01',
    dataFim: '2024-12-31',
    status: 'ativa',
    tipo: 'anual',
    criador: 'admin'
  },
  {
    id: 2,
    nome: 'Avaliação de Competências Técnicas',
    descricao: 'Avaliação focada em competências técnicas específicas',
    dataInicio: '2024-06-01',
    dataFim: '2024-08-31',
    status: 'planejamento',
    tipo: 'tecnica',
    criador: 'admin'
  },
  {
    id: 3,
    nome: 'Avaliação 180 Graus',
    descricao: 'Autoavaliação e avaliação pelo gestor',
    dataInicio: '2024-03-01',
    dataFim: '2024-04-30',
    status: 'finalizada',
    tipo: '180',
    criador: 'admin'
  }
];

const mockAvaliados = [
  {
    id: 1,
    cpf: '12345678900',
    nome: 'João Silva',
    email: 'joao.silva@email.com',
    cargo: 'Desenvolvedor',
    departamento: 'TI',
    gestorCpf: '09876543211',
    dataAdmissao: '2020-01-15',
    dataNascimento: '1990-05-20',
    genero: 'M',
    empresa: 'Empresa ABC',
    nome_gestor: 'Maria Santos',
    cpf_gestor: '09876543211'
  },
  {
    id: 2,
    cpf: '11122233344',
    nome: 'Pedro Oliveira',
    email: 'pedro.oliveira@email.com',
    cargo: 'Analista de Sistemas',
    departamento: 'TI',
    gestorCpf: '09876543211',
    dataAdmissao: '2021-03-20',
    dataNascimento: '1985-08-15',
    genero: 'M',
    empresa: 'Empresa ABC',
    nome_gestor: 'Maria Santos',
    cpf_gestor: '09876543211'
  },
  {
    id: 3,
    cpf: '33344455566',
    nome: 'Carla Mendes',
    email: 'carla.mendes@email.com',
    cargo: 'Gerente de Projetos',
    departamento: 'Operações',
    gestorCpf: '55566677788',
    dataAdmissao: '2019-07-10',
    dataNascimento: '1988-12-03',
    genero: 'F',
    empresa: 'Empresa ABC',
    nome_gestor: 'Ana Costa',
    cpf_gestor: '55566677788'
  },
  {
    id: 4,
    cpf: '77788899900',
    nome: 'Ricardo Alves',
    email: 'ricardo.alves@email.com',
    cargo: 'Analista Financeiro',
    departamento: 'Financeiro',
    gestorCpf: '55566677788',
    dataAdmissao: '2022-02-28',
    dataNascimento: '1992-09-18',
    genero: 'M',
    empresa: 'Empresa ABC',
    nome_gestor: 'Ana Costa',
    cpf_gestor: '55566677788'
  }
];

const mockGestores = [
  {
    id: 1,
    cpf: '09876543211',
    nome: 'Maria Santos',
    email: 'maria.santos@email.com',
    cargo: 'Gerente de TI',
    departamento: 'TI',
    equipe: ['12345678900', '11122233344'],
    dataNascimento: '1982-03-10',
    genero: 'F',
    empresa: 'Empresa ABC'
  },
  {
    id: 2,
    cpf: '55566677788',
    nome: 'Ana Costa',
    email: 'ana.costa@email.com',
    cargo: 'Gerente de Operações',
    departamento: 'Operações',
    equipe: ['33344455566', '77788899900'],
    dataNascimento: '1980-07-25',
    genero: 'F',
    empresa: 'Empresa ABC'
  }
];

const mockCompetencias = [
  {
    id: 1,
    nome: 'Comunicação',
    descricao: 'Capacidade de se expressar de forma clara e eficaz',
    tipo: 'comportamental',
    criterios: ['Clareza', 'Objetividade', 'Escuta ativa'],
    idAvaliacao: 1
  },
  {
    id: 2,
    nome: 'Trabalho em Equipe',
    descricao: 'Capacidade de colaborar com outros membros da equipe',
    tipo: 'comportamental',
    criterios: ['Colaboração', 'Respeito', 'Cooperação'],
    idAvaliacao: 1
  },
  {
    id: 3,
    nome: 'Programação em JavaScript',
    descricao: 'Conhecimento e habilidade em programação JavaScript',
    tipo: 'tecnica',
    criterios: ['Sintaxe', 'Frameworks', 'Boas práticas'],
    idAvaliacao: 2
  },
  {
    id: 4,
    nome: 'Gestão de Projetos',
    descricao: 'Capacidade de planejar e executar projetos',
    tipo: 'tecnica',
    criterios: ['Planejamento', 'Execução', 'Monitoramento'],
    idAvaliacao: 2
  },
  {
    id: 5,
    nome: 'Liderança',
    descricao: 'Capacidade de liderar e motivar equipes',
    tipo: 'comportamental',
    criterios: ['Motivação', 'Delegação', 'Feedback'],
    idAvaliacao: 1
  }
];

const mockRespostas = [
  {
    id: 1,
    avaliacaoId: 1,
    avaliadoCpf: '12345678900',
    avaliadorCpf: '09876543211',
    competenciaId: 1,
    notas: {
      'Clareza': 4,
      'Objetividade': 5,
      'Escuta ativa': 4
    },
    comentario: 'Boa comunicação geral, pode melhorar na objetividade',
    data: '2024-01-20'
  },
  {
    id: 2,
    avaliacaoId: 1,
    avaliadoCpf: '12345678900',
    avaliadorCpf: '12345678900',
    competenciaId: 1,
    notas: {
      'Clareza': 5,
      'Objetividade': 4,
      'Escuta ativa': 5
    },
    comentario: 'Autoavaliação - me considero bom comunicador',
    data: '2024-01-18'
  },
  {
    id: 3,
    avaliacaoId: 2,
    avaliadoCpf: '11122233344',
    avaliadorCpf: '09876543211',
    competenciaId: 3,
    notas: {
      'Sintaxe': 5,
      'Frameworks': 4,
      'Boas práticas': 5
    },
    comentario: 'Excelente conhecimento técnico',
    data: '2024-06-15'
  }
];

module.exports = {
  mockUsers,
  mockAvaliacoes,
  mockAvaliados,
  mockGestores,
  mockCompetencias,
  mockRespostas
};
