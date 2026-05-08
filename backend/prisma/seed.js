import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');
  
  console.log('🗑️  Limpando banco...');
  await prisma.evaluation.deleteMany();
  await prisma.nineBox.deleteMany();
  await prisma.competency.deleteMany();
  await prisma.user.deleteMany();

  console.log('👥 Criando usuários...');

  // Admin
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

  // Gestores
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

  // Colaboradores
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
      departamento: 'Marketing'
    }
  });

  const colaborador5 = await prisma.user.create({
    data: {
      ra: '2022005',
      nome: 'Juliana Rocha',
      email: 'juliana@eniac.edu.br',
      senha: await bcrypt.hash('senha123', 10),
      tipo: 'colaborador',
      cargo: 'Analista de Marketing',
      departamento: 'Marketing'
    }
  });

  console.log('📝 Criando competências...');

  // Competências de Gestor
  await prisma.competency.create({
    data: {
      nome: 'Delegar tarefas',
      descricao: 'Capacidade de distribuir tarefas adequadamente entre os membros da equipe',
      tipo: 'lideranca',
      competenciaDe: 'gestor',
      criterios: [
        'Identifica as habilidades de cada membro da equipe',
        'Distribui tarefas de forma equilibrada',
        'Acompanha o progresso das tarefas delegadas',
        'Fornece suporte quando necessário'
      ]
    }
  });

  await prisma.competency.create({
    data: {
      nome: 'Comunicação efetiva',
      descricao: 'Habilidade de se comunicar de forma clara e objetiva com a equipe',
      tipo: 'comportamento',
      competenciaDe: 'gestor',
      criterios: [
        'Comunica expectativas de forma clara',
        'Escuta ativamente os membros da equipe',
        'Fornece feedback construtivo',
        'Mantém canais de comunicação abertos'
      ]
    }
  });

  // Competências de Colaborador
  await prisma.competency.create({
    data: {
      nome: 'Trabalho em equipe',
      descricao: 'Capacidade de colaborar efetivamente com outros membros da equipe',
      tipo: 'comportamento',
      competenciaDe: 'colaborador',
      criterios: [
        'Colabora ativamente com colegas',
        'Compartilha conhecimento e recursos',
        'Respeita opiniões diferentes',
        'Contribui para um ambiente positivo'
      ]
    }
  });

  await prisma.competency.create({
    data: {
      nome: 'Resolução de problemas',
      descricao: 'Habilidade de identificar e resolver problemas de forma eficiente',
      tipo: 'tecnica',
      competenciaDe: 'colaborador',
      criterios: [
        'Identifica problemas rapidamente',
        'Analisa causas raiz',
        'Propõe soluções viáveis',
        'Implementa soluções efetivas'
      ]
    }
  });

  // Competências para Todos
  await prisma.competency.create({
    data: {
      nome: 'Pontualidade',
      descricao: 'Compromisso com horários e prazos estabelecidos',
      tipo: 'comportamento',
      competenciaDe: 'todos',
      criterios: [
        'Chega no horário estabelecido',
        'Cumpre prazos de entregas',
        'Avisa com antecedência quando há imprevistos',
        'Respeita o tempo dos outros'
      ]
    }
  });

  await prisma.competency.create({
    data: {
      nome: 'Proatividade',
      descricao: 'Iniciativa para identificar e resolver problemas sem necessidade de supervisão',
      tipo: 'comportamento',
      competenciaDe: 'todos',
      criterios: [
        'Toma iniciativa sem ser solicitado',
        'Identifica oportunidades de melhoria',
        'Busca soluções de forma independente',
        'Antecipa necessidades da equipe'
      ]
    }
  });

  console.log('⭐ Criando avaliações anônimas bidirecionais...');

  // Gestor avalia colaborador (180° - anônimo)
  await prisma.evaluation.create({
    data: {
      tipoAvaliacao: 'gestor_para_colaborador',
      avaliadorId: gestor1.id,
      avaliadoId: colaborador1.id,
      criterios: {
        pontualidade: 5,
        comunicacao: 5,
        tecnico: 4,
        proatividade: 5,
        equipe: 5
      },
      media: 4.8,
      comentario: 'Colaboradora muito dedicada e pontual.',
      anonima: true
    }
  });

  await prisma.evaluation.create({
    data: {
      tipoAvaliacao: 'gestor_para_colaborador',
      avaliadorId: gestor1.id,
      avaliadoId: colaborador2.id,
      criterios: {
        pontualidade: 4,
        comunicacao: 4,
        tecnico: 5,
        proatividade: 4,
        equipe: 4
      },
      media: 4.2,
      comentario: 'Excelente habilidades técnicas.',
      anonima: true
    }
  });

  // Colaborador avalia gestor (360° - anônimo)
  await prisma.evaluation.create({
    data: {
      tipoAvaliacao: 'colaborador_para_gestor',
      avaliadorId: colaborador1.id,
      avaliadoId: gestor1.id,
      criterios: {
        pontualidade: 5,
        comunicacao: 4,
        tecnico: 5,
        proatividade: 5,
        equipe: 4
      },
      media: 4.6,
      comentario: 'Gestor muito acessível e sempre disposto a ajudar.',
      anonima: true
    }
  });

  await prisma.evaluation.create({
    data: {
      tipoAvaliacao: 'colaborador_para_gestor',
      avaliadorId: colaborador2.id,
      avaliadoId: gestor1.id,
      criterios: {
        pontualidade: 5,
        comunicacao: 5,
        tecnico: 4,
        proatividade: 5,
        equipe: 5
      },
      media: 4.8,
      comentario: 'Ótima liderança e comunicação.',
      anonima: true
    }
  });

  // Admin avalia (360°)
  await prisma.evaluation.create({
    data: {
      tipoAvaliacao: 'avaliacao_360',
      avaliadorId: admin.id,
      avaliadoId: gestor1.id,
      criterios: {
        pontualidade: 5,
        comunicacao: 5,
        tecnico: 5,
        proatividade: 5,
        equipe: 5
      },
      media: 5.0,
      comentario: 'Excelente gestor, referência para a equipe.',
      anonima: false
    }
  });

  console.log('📊 Criando avaliações Nine Box...');

  // Nine Box para colaboradores
  await prisma.nineBox.create({
    data: {
      pessoaId: colaborador1.id,
      performance: 3,
      potential: 3,
      categoria: 'Superstar',
      comentario: 'Alto desempenho e alto potencial de crescimento'
    }
  });

  await prisma.nineBox.create({
    data: {
      pessoaId: colaborador2.id,
      performance: 3,
      potential: 2,
      categoria: 'Especialista',
      comentario: 'Excelente desempenho técnico'
    }
  });

  await prisma.nineBox.create({
    data: {
      pessoaId: colaborador3.id,
      performance: 2,
      potential: 3,
      categoria: 'Estrela',
      comentario: 'Grande potencial de crescimento'
    }
  });

  await prisma.nineBox.create({
    data: {
      pessoaId: colaborador4.id,
      performance: 2,
      potential: 2,
      categoria: 'Núcleo',
      comentario: 'Desempenho sólido e consistente'
    }
  });

  await prisma.nineBox.create({
    data: {
      pessoaId: colaborador5.id,
      performance: 2,
      potential: 2,
      categoria: 'Núcleo',
      comentario: 'Bom desempenho geral'
    }
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log('\n📋 Usuários criados:');
  console.log('   Admin: admin@eniac.edu.br / admin123');
  console.log('   Gestor 1: joao@eniac.edu.br / senha123');
  console.log('   Gestor 2: maria@eniac.edu.br / senha123');
  console.log('   Colaborador 1: ana@eniac.edu.br / senha123');
  console.log('   Colaborador 2: pedro@eniac.edu.br / senha123');
  console.log('   Colaborador 3: carla@eniac.edu.br / senha123');
  console.log('   Colaborador 4: lucas@eniac.edu.br / senha123');
  console.log('   Colaborador 5: juliana@eniac.edu.br / senha123');
  console.log('\n🎯 Sistema pronto para uso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
