// Teste do Nine Box com avaliações recentes
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testNineBox() {
  try {
    // Ver competências
    const competencias = await prisma.competency.findMany({ where: { deletedAt: null } });
    console.log('=== Competências ===');
    competencias.forEach(c => console.log(`  - ${c.nome} (tipo: ${c.tipo})`));

    // Map de competências
    const desempenhoMap = {};
    const potencialMap = {};
    competencias.filter(c => c.tipo === 'desempenho' || c.tipo === 'tecnica')
      .forEach(c => desempenhoMap[c.nome.toLowerCase()] = true);
    competencias.filter(c => c.tipo === 'potencial' || c.tipo === 'lideranca' || c.tipo === 'comportamento')
      .forEach(c => potencialMap[c.nome.toLowerCase()] = true);

    console.log('\nMap desempenho:', Object.keys(desempenhoMap));
    console.log('Map potencial:', Object.keys(potencialMap));

    // Pegar avaliações recentes com competências corretas
    const avaliacoesRecentes = await prisma.evaluation.findMany({
      where: {
        criterios: {
          path: ['Proatividade'] // Só avaliações recentes têm isso
        }
      },
      include: { avaliado: true }
    });

    console.log(`\n=== Avaliações recentes (com competências corretas): ${avaliacoesRecentes.length} ===`);

    if (avaliacoesRecentes.length > 0) {
      for (const eval of avaliacoesRecentes) {
        console.log(`\nColaborador: ${eval.avaliado.nome}`);
        console.log('Critérios:', JSON.stringify(eval.criterios, null, 2));

        let notasDesempenho = [];
        let notasPotencial = [];

        for (const [nome, nota] of Object.entries(eval.criterios)) {
          if (desempenhoMap[nome.toLowerCase()]) {
            notasDesempenho.push(nota);
            console.log(`  ✓ MATCH desempenho: ${nome} = ${nota}`);
          }
          if (potencialMap[nome.toLowerCase()]) {
            notasPotencial.push(nota);
            console.log(`  ✓ MATCH potencial: ${nome} = ${nota}`);
          }
        }

        if (notasDesempenho.length > 0 && notasPotencial.length > 0) {
          const mediaDes = notasDesempenho.reduce((a, b) => a + b, 0) / notasDesempenho.length;
          const mediaPot = notasPotencial.reduce((a, b) => a + b, 0) / notasPotencial.length;

          // Classificar
          const classifyScore = (score) => {
            if (score >= 1 && score <= 1.5) return 'BAIXO';
            if (score >= 1.6 && score <= 2.5) return 'MÉDIO';
            if (score >= 2.6 && score <= 4) return 'ALTO';
            return 'INDEFINIDO';
          };

          const xClass = classifyScore(mediaDes);
          const yClass = classifyScore(mediaPot);

          const matriz = {
            'ALTO-BAIXO': 'A1 (Enigma)',
            'ALTO-MÉDIO': 'A2 (Em crescimento)',
            'ALTO-ALTO': 'A3 (Destaque)',
            'MÉDIO-BAIXO': 'M1 (Questionável)',
            'MÉDIO-MÉDIO': 'M2 (Mantenedor)',
            'MÉDIO-ALTO': 'M3 (Forte Desempenho)',
            'BAIXO-BAIXO': 'B1 (Insuficiente)',
            'BAIXO-MÉDIO': 'B2 (Eficaz)',
            'BAIXO-ALTO': 'B3 (Comprometido)'
          };

          const categoria = matriz[`${yClass}-${xClass}`] || 'Indefinido';
          console.log(`\n  Performance: ${mediaDes.toFixed(2)} (${xClass})`);
          console.log(`  Potential: ${mediaPot.toFixed(2)} (${yClass})`);
          console.log(`  ✅ CATEGORIA: ${categoria}`);
        }
      }
    } else {
      console.log('\n❌ Nenhuma avaliação recente encontrada');
    }

  } catch (error) {
    console.error('Erro:', error.message, error.stack);
  }
  await prisma.$disconnect();
}

testNineBox();