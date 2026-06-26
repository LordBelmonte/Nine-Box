import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  console.log('🗑️  Limpando banco...');
  await prisma.evaluation.deleteMany();
  await prisma.campaignGestor.deleteMany();
  await prisma.evaluationCampaign.deleteMany();
  await prisma.gestorColaborador.deleteMany();
  await prisma.nineBox.deleteMany();
  await prisma.nineBoxCategoria.deleteMany();
  await prisma.competency.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // ─── Usuários ────────────────────────────────────────────────────────────────

  console.log('👥 Criando usuários...');

  const admin = await prisma.user.create({
    data: {
      ra: '1234567',
      nome: 'Admin Sistema',
      email: 'admin@eniac.edu.br',
      senha: await bcrypt.hash('admin123', 10),
      tipo: 'admin',
      cargo: 'Administrador',
      departamento: 'TI'
    }
  });

  const gestor1 = await prisma.user.create({
    data: {
      ra: '2021001',
      nome: 'João Silva',
      email: 'joao@eniac.edu.br',
      senha: await bcrypt.hash('senha123', 10),
      tipo: 'gestor',
      cargo: 'Gerente de TI',
      departamento: 'TI'
    }
  });

  const gestor2 = await prisma.user.create({
    data: {
      ra: '2021002',
      nome: 'Maria Santos',
      email: 'maria@eniac.edu.br',
      senha: await bcrypt.hash('senha123', 10),
      tipo: 'gestor',
      cargo: 'Gerente de RH',
      departamento: 'RH'
    }
  });

  const colaborador1 = await prisma.user.create({
    data: {
      ra: '2022001',
      nome: 'Ana Costa',
      email: 'ana@eniac.edu.br',
      senha: await bcrypt.hash('senha123', 10),
      tipo: 'colaborador',
      cargo: 'Desenvolvedora',
      departamento: 'TI'
    }
  });

  const colaborador2 = await prisma.user.create({
    data: {
      ra: '2022002',
      nome: 'Pedro Oliveira',
      email: 'pedro@eniac.edu.br',
      senha: await bcrypt.hash('senha123', 10),
      tipo: 'colaborador',
      cargo: 'Desenvolvedor',
      departamento: 'TI'
    }
  });

  const colaborador3 = await prisma.user.create({
    data: {
      ra: '2022003',
      nome: 'Carla Mendes',
      email: 'carla@eniac.edu.br',
      senha: await bcrypt.hash('senha123', 10),
      tipo: 'colaborador',
      cargo: 'Analista de RH',
      departamento: 'RH'
    }
  });

  const colaborador4 = await prisma.user.create({
    data: {
      ra: '2022004',
      nome: 'Lucas Ferreira',
      email: 'lucas@eniac.edu.br',
      senha: await bcrypt.hash('senha123', 10),
      tipo: 'colaborador',
      cargo: 'Designer',
      departamento: 'RH'
    }
  });

  const colaborador5 = await prisma.user.create({
    data: {
      ra: '2022005',
      nome: 'Beatriz Lima',
      email: 'beatriz@eniac.edu.br',
      senha: await bcrypt.hash('senha123', 10),
      tipo: 'colaborador',
      cargo: 'Analista de Sistemas',
      departamento: 'TI'
    }
  });

  console.log('✅ Usuários criados');

  // ─── Grupos gestor → colaboradores ───────────────────────────────────────────

  console.log('👥 Criando grupos...');

  // Grupo do gestor1 (TI): colaborador1, colaborador2, colaborador5
  await prisma.gestorColaborador.createMany({
    data: [
      { gestorId: gestor1.id, colaboradorId: colaborador1.id },
      { gestorId: gestor1.id, colaboradorId: colaborador2.id },
      { gestorId: gestor1.id, colaboradorId: colaborador5.id }
    ]
  });

  // Grupo do gestor2 (RH): colaborador3, colaborador4
  await prisma.gestorColaborador.createMany({
    data: [
      { gestorId: gestor2.id, colaboradorId: colaborador3.id },
      { gestorId: gestor2.id, colaboradorId: colaborador4.id }
    ]
  });

  console.log('✅ Grupos criados');

  // ─── Competências ─────────────────────────────────────────────────────────────

  console.log('📚 Criando competências...');

  await prisma.competency.createMany({
    data: [
      {
        nome: 'Qualidade Técnica',
        descricao: 'Capacidade de entregar trabalho com qualidade técnica',
        tipo: 'desempenho',
        competenciaDe: 'todos',
        criterios: ['Código limpo', 'Boas práticas', 'Testes', 'Documentação']
      },
      {
        nome: 'Cumprimento de Prazos',
        descricao: 'Capacidade de entregar trabalhos no prazo',
        tipo: 'desempenho',
        competenciaDe: 'todos',
        criterios: ['Pontualidade', 'Gestão de tempo', 'Priorização', 'Comprometimento']
      },
      {
        nome: 'Comunicação',
        descricao: 'Clareza e efetividade na comunicação',
        tipo: 'potencial',
        competenciaDe: 'todos',
        criterios: ['Clareza oral', 'Clareza escrita', 'Escuta ativa', 'Comunicação não-violenta']
      },
      {
        nome: 'Trabalho em Equipe',
        descricao: 'Colaboração e sinergia com colegas',
        tipo: 'potencial',
        competenciaDe: 'colaborador',
        criterios: ['Colaboração', 'Respeito', 'Comprometimento', 'Apoio mútuo']
      },
      {
        nome: 'Proatividade',
        descricao: 'Iniciativa e antecipação de demandas',
        tipo: 'potencial',
        competenciaDe: 'todos',
        criterios: ['Iniciativa', 'Antecipação', 'Autonomia', 'Resolução de problemas']
      }
    ]
  });

  // ─── Nine Box Categorias (TABELA DE REFERÊNCIA ORIGEM) ──────────────────────────────────
  //
  // COMO FUNCIONA O CÁLCULO DO NINE BOX:
  // 1. Cada colaborador recebe notas (1-4) em competências de avaliação
  // 2. Competências são divididas em dois tipos:
  //    - DESEMPENHO: competências técnicas/funcionais → calculam a MÉDIA DE DESEMPENHO
  //    - POTENCIAL: competências comportamentais/de crescimento → calculam a MÉDIA DE POTENCIAL
  // 3. As médias são convertidas em classes:
  //    - Baixo: média entre 1.0 e 1.5
  //    - Médio: média entre 1.6 e 2.5
  //    - Alto: média entre 2.6 e 4.0
  // 4. A interseção entre POTENCIAL (linhas) e DESEMPENHO (colunas) determina a categoria
  //
  //            |  Baixo  |  Médio  |   Alto
  //   ---------|---------|---------|--------
  //   Alto     |    A1   |    A2   |    A3
  //   Médio    |    M1   |    M2   |    M3
  //   Baixo    |    B1   |    B2   |    B3

  console.log('📦 Criando categorias do Nine Box...');

  await prisma.nineBoxCategoria.createMany({
    data: [
      {
        codigo: 'B1',
        potencialClasse: 'Baixo',
        desempenhoClasse: 'Baixo',
        nome: 'B1 - Insuficiente',
        tipo: 'Insuficiente',
        perfil: 'Potencial baixo e desempenho abaixo do esperado',
        planoAcao: 'Identificar obstáculos que impedem o desempenho adequado. Caso não haja melhoria após suporte e desenvolvimento, considerar realocação ou desligamento.',
        icon: 'fa-circle-xmark',
        cor: '#ef4444'
      },
      {
        codigo: 'B2',
        potencialClasse: 'Baixo',
        desempenhoClasse: 'Médio',
        nome: 'B2 - Eficaz',
        tipo: 'Eficaz',
        perfil: 'Potencial baixo e desempenho dentro do esperado',
        planoAcao: 'Profissionais consistentes que cumprem suas responsabilidades. Manter motivação através de reconhecimento e compensação adequada.',
        icon: 'fa-check',
        cor: '#22c55e'
      },
      {
        codigo: 'B3',
        potencialClasse: 'Baixo',
        desempenhoClasse: 'Alto',
        nome: 'B3 - Comprometido',
        tipo: 'Comprometido',
        perfil: 'Potencial baixo e desempenho acima do esperado',
        planoAcao: 'Colaboradores leais e dedicados que superam expectativas. Recompensar com bônus e benefícios, mas sem expectativa de crescimento hierárquico.',
        icon: 'fa-star',
        cor: '#10b981'
      },
      {
        codigo: 'M1',
        potencialClasse: 'Médio',
        desempenhoClasse: 'Baixo',
        nome: 'M1 - Questionável',
        tipo: 'Questionável',
        perfil: 'Potencial mediano e desempenho abaixo do esperado',
        planoAcao: 'Identificar causas do baixo desempenho. Fornecer mentoria, treinamento e definir plano de desenvolvimento com metas claras.',
        icon: 'fa-question-circle',
        cor: '#f59e0b'
      },
      {
        codigo: 'M2',
        potencialClasse: 'Médio',
        desempenhoClasse: 'Médio',
        nome: 'M2 - Mantenedor',
        tipo: 'Mantenedor',
        perfil: 'Potencial e desempenho em nível mediano',
        planoAcao: 'Profissionais sólidos que mantêm o fluxo de trabalho. Oferecer projetos desafiadores e oportunidades de desenvolvimento para evitar estagnação.',
        icon: 'fa-minus-circle',
        cor: '#3b82f6'
      },
      {
        codigo: 'M3',
        potencialClasse: 'Médio',
        desempenhoClasse: 'Alto',
        nome: 'M3 - Forte Desempenho',
        tipo: 'Forte Desempenho',
        perfil: 'Potencial mediano e desempenho acima do esperado',
        planoAcao: 'Desenvolver habilidades de liderança e pensamento estratégico. Preparar para assumir mais responsabilidades e projetos complexos.',
        icon: 'fa-arrow-up',
        cor: '#8b5cf6'
      },
      {
        codigo: 'A1',
        potencialClasse: 'Alto',
        desempenhoClasse: 'Baixo',
        nome: 'A1 - Enigma',
        tipo: 'Enigma',
        perfil: 'Alto potencial e desempenho abaixo do esperado',
        planoAcao: 'Profissionais com grande potencial que não estão entregando. Investigar causas: desalinhamento de função, falta de suporte, questões pessoais.',
        icon: 'fa-puzzle-piece',
        cor: '#f97316'
      },
      {
        codigo: 'A2',
        potencialClasse: 'Alto',
        desempenhoClasse: 'Médio',
        nome: 'A2 - Em crescimento',
        tipo: 'Em crescimento',
        perfil: 'Alto potencial e desempenho dentro do esperado',
        planoAcao: 'Colaboradores em ascensão que respondem bem a desafios. Oferecer projetos estratégicos, mentoria executiva e plano de carreira claro.',
        icon: 'fa-seedling',
        cor: '#06b6d4'
      },
      {
        codigo: 'A3',
        potencialClasse: 'Alto',
        desempenhoClasse: 'Alto',
        nome: 'A3 - Destaque',
        tipo: 'Destaque',
        perfil: 'Alto potencial e desempenho acima do esperado',
        planoAcao: 'Talentos excepcionais prontos para promoções. Desenvolver como futuros líderes, oferecer oportunidades de liderança de projetos e mentoria de pares.',
        icon: 'fa-crown',
        cor: '#eab308'
      }
    ]
  });

  console.log('✅ Categorias do Nine Box criadas');

  // Buscar competências criadas
  const competencias = await prisma.competency.findMany();
  const qualidadeTecnica = competencias.find(c => c.nome === 'Qualidade Técnica');
  const cumprimentoPrazos = competencias.find(c => c.nome === 'Cumprimento de Prazos');
  const comunicacao = competencias.find(c => c.nome === 'Comunicação');
  const trabalhoEquipe = competencias.find(c => c.nome === 'Trabalho em Equipe');
  const proatividade = competencias.find(c => c.nome === 'Proatividade');

  // ─── Campanhas de avaliação ───────────────────────────────────────────────────

  console.log('📋 Criando campanhas...');

  // Campanha 1: Avaliação Semestral TI (ativa, gestor1 responsável)
  const campanha1 = await prisma.evaluationCampaign.create({
    data: {
      nome: 'Avaliação Semestral TI - 2026/1',
      descricao: 'Avaliação de desempenho semestral dos colaboradores do departamento de TI',
      dataInicio: new Date('2026-05-01'),
      dataFim: new Date('2026-06-30'),
      status: 'ativa',
      tipoAlvo: 'gestor',
      gestores: {
        create: [{ gestorId: gestor1.id }]
      }
    }
  });

  // Associar competências à campanha 1 (2 desempenho + 2 potencial)
  await prisma.campaignCompetency.createMany({
    data: [
      { campaignId: campanha1.id, competencyId: qualidadeTecnica.id },
      { campaignId: campanha1.id, competencyId: cumprimentoPrazos.id },
      { campaignId: campanha1.id, competencyId: comunicacao.id },
      { campaignId: campanha1.id, competencyId: proatividade.id }
    ]
  });

  // Campanha 2: Avaliação RH (ativa, gestor2 responsável)
  const campanha2 = await prisma.evaluationCampaign.create({
    data: {
      nome: 'Avaliação de Desempenho RH - 2026/1',
      descricao: 'Avaliação dos colaboradores do departamento de RH',
      dataInicio: new Date('2026-05-15'),
      dataFim: new Date('2026-07-15'),
      status: 'ativa',
      tipoAlvo: 'gestor',
      gestores: {
        create: [{ gestorId: gestor2.id }]
      }
    }
  });

  // Associar competências à campanha 2
  await prisma.campaignCompetency.createMany({
    data: [
      { campaignId: campanha2.id, competencyId: qualidadeTecnica.id },
      { campaignId: campanha2.id, competencyId: comunicacao.id },
      { campaignId: campanha2.id, competencyId: trabalhoEquipe.id },
      { campaignId: campanha2.id, competencyId: proatividade.id }
    ]
  });

  // Campanha 3: Avaliação finalizada (histórico)
  const campanha3 = await prisma.evaluationCampaign.create({
    data: {
      nome: 'Avaliação Anual 2025',
      descricao: 'Avaliação anual de todos os colaboradores',
      dataInicio: new Date('2025-11-01'),
      dataFim: new Date('2025-12-31'),
      status: 'finalizada',
      tipoAlvo: 'colaborador',
      gestores: {
        create: [
          { gestorId: gestor1.id },
          { gestorId: gestor2.id }
        ]
      }
    }
  });

  // Associar competências à campanha 3
  await prisma.campaignCompetency.createMany({
    data: [
      { campaignId: campanha3.id, competencyId: qualidadeTecnica.id },
      { campaignId: campanha3.id, competencyId: cumprimentoPrazos.id },
      { campaignId: campanha3.id, competencyId: comunicacao.id },
      { campaignId: campanha3.id, competencyId: proatividade.id }
    ]
  });

  console.log('✅ Campanhas criadas');

  // ─── Avaliações ───────────────────────────────────────────────────────────────

  console.log('📝 Criando avaliações...');

  // Avaliações na campanha1 (TI) feitas pelo gestor1
  await prisma.evaluation.create({
    data: {
      campaignId: campanha1.id,
      avaliadorId: gestor1.id,
      avaliadoId: colaborador1.id,
      criterios: {
        'Qualidade técnica': 5,
        'Cumprimento de prazos': 4,
        'Comunicação': 4,
        'Trabalho em equipe': 5,
        'Proatividade': 4
      },
      media: 4.4,
      comentario: 'Excelente profissional, entrega com qualidade e dentro dos prazos.',
      anonima: false
    }
  });

  await prisma.evaluation.create({
    data: {
      campaignId: campanha1.id,
      avaliadorId: gestor1.id,
      avaliadoId: colaborador2.id,
      criterios: {
        'Qualidade técnica': 4,
        'Cumprimento de prazos': 3,
        'Comunicação': 4,
        'Trabalho em equipe': 4,
        'Proatividade': 3
      },
      media: 3.6,
      comentario: 'Bom desempenho técnico, precisa melhorar gestão de prazos.',
      anonima: false
    }
  });

  // Avaliações na campanha2 (RH) feitas pelo gestor2
  await prisma.evaluation.create({
    data: {
      campaignId: campanha2.id,
      avaliadorId: gestor2.id,
      avaliadoId: colaborador3.id,
      criterios: {
        'Atendimento ao cliente interno': 5,
        'Organização': 5,
        'Conhecimento técnico': 4,
        'Relacionamento interpessoal': 5
      },
      media: 4.75,
      comentario: 'Profissional exemplar, referência no departamento.',
      anonima: false
    }
  });

  // Avaliações na campanha3 (finalizada) - histórico
  await prisma.evaluation.create({
    data: {
      campaignId: campanha3.id,
      avaliadorId: gestor1.id,
      avaliadoId: colaborador1.id,
      criterios: {
        'Desempenho geral': 9,
        'Metas atingidas': 8,
        'Comportamento': 9
      },
      media: 8.67,
      comentario: 'Ótimo ano, superou expectativas.',
      anonima: false
    }
  });

  await prisma.evaluation.create({
    data: {
      campaignId: campanha3.id,
      avaliadorId: gestor2.id,
      avaliadoId: colaborador3.id,
      criterios: {
        'Desempenho geral': 10,
        'Metas atingidas': 9,
        'Comportamento': 10
      },
      media: 9.67,
      comentario: 'Desempenho excepcional durante todo o ano.',
      anonima: false
    }
  });

  console.log('✅ Avaliações criadas');

  // ─── Nine Box ─────────────────────────────────────────────────────────────────

  console.log('📊 Criando avaliações Nine Box...');

  const nineBoxData = [
    { pessoaId: colaborador1.id, performance: 3, potential: 3, categoria: 'Superstar', comentario: 'Alta performance e alto potencial' },
    { pessoaId: colaborador2.id, performance: 2, potential: 2, categoria: 'Núcleo', comentario: 'Sólido e confiável' },
    { pessoaId: colaborador3.id, performance: 3, potential: 2, categoria: 'Especialista', comentario: 'Excelente especialista técnica' },
    { pessoaId: colaborador4.id, performance: 2, potential: 3, categoria: 'Estrela', comentario: 'Grande potencial de crescimento' },
    { pessoaId: colaborador5.id, performance: 1, potential: 2, categoria: 'Dilema', comentario: 'Potencial presente, performance a desenvolver' }
  ];

  for (const nb of nineBoxData) {
    await prisma.nineBox.create({ data: nb });
  }

  console.log('✅ Nine Box criado');

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📋 Resumo:');
  console.log('  👤 Admin:         admin@eniac.edu.br / admin123');
  console.log('  👔 Gestor TI:     joao@eniac.edu.br / senha123');
  console.log('  👔 Gestor RH:     maria@eniac.edu.br / senha123');
  console.log('  👷 Colaboradores: ana, pedro, carla, lucas, beatriz @eniac.edu.br / senha123');
  console.log('\n  📋 Campanhas ativas: 2 (TI e RH)');
  console.log('  📋 Campanha finalizada: 1 (Anual 2025)');
}

main()
  .catch(e => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
