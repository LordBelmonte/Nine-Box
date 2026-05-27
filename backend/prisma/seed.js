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
  await prisma.competency.deleteMany();
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
        nome: 'Liderança',
        descricao: 'Capacidade de liderar e motivar equipes',
        tipo: 'lideranca',
        competenciaDe: 'gestor',
        criterios: ['Delegar tarefas', 'Motivar equipe', 'Tomar decisões', 'Dar feedback']
      },
      {
        nome: 'Comunicação',
        descricao: 'Clareza e efetividade na comunicação',
        tipo: 'comportamento',
        competenciaDe: 'todos',
        criterios: ['Clareza oral', 'Clareza escrita', 'Escuta ativa']
      },
      {
        nome: 'Trabalho em Equipe',
        descricao: 'Colaboração e sinergia com colegas',
        tipo: 'comportamento',
        competenciaDe: 'colaborador',
        criterios: ['Colaboração', 'Respeito', 'Comprometimento']
      },
      {
        nome: 'Resolução de Problemas',
        descricao: 'Capacidade analítica e criatividade para resolver problemas',
        tipo: 'tecnica',
        competenciaDe: 'todos',
        criterios: ['Análise crítica', 'Criatividade', 'Agilidade']
      },
      {
        nome: 'Proatividade',
        descricao: 'Iniciativa e antecipação de demandas',
        tipo: 'comportamento',
        competenciaDe: 'todos',
        criterios: ['Iniciativa', 'Antecipação', 'Autonomia']
      }
    ]
  });

  console.log('✅ Competências criadas');

  // Buscar competências criadas
  const competencias = await prisma.competency.findMany();
  const lideranca = competencias.find(c => c.nome === 'Liderança');
  const comunicacao = competencias.find(c => c.nome === 'Comunicação');
  const trabalhoEquipe = competencias.find(c => c.nome === 'Trabalho em Equipe');
  const resolucaoProblemas = competencias.find(c => c.nome === 'Resolução de Problemas');
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

  // Associar competências à campanha 1
  await prisma.campaignCompetency.createMany({
    data: [
      { campaignId: campanha1.id, competencyId: lideranca.id },
      { campaignId: campanha1.id, competencyId: comunicacao.id },
      { campaignId: campanha1.id, competencyId: trabalhoEquipe.id },
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
      { campaignId: campanha2.id, competencyId: comunicacao.id },
      { campaignId: campanha2.id, competencyId: trabalhoEquipe.id },
      { campaignId: campanha2.id, competencyId: resolucaoProblemas.id }
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
      { campaignId: campanha3.id, competencyId: lideranca.id },
      { campaignId: campanha3.id, competencyId: comunicacao.id },
      { campaignId: campanha3.id, competencyId: trabalhoEquipe.id }
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
