/**
 * Testes do contador de progresso e estrutura visual de avaliacao-sucesso.html
 * Executar: node scripts/test-avaliacao-progresso.mjs
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message}`);
  }
}

function calcProgress(filaRestante, colaboradoresTotal) {
  const totalGeral = parseInt(colaboradoresTotal, 10) || (filaRestante.length + 1);
  const avaliadosAte = totalGeral - filaRestante.length;
  const percentual = totalGeral > 0 ? (avaliadosAte / totalGeral) * 100 : 0;
  return { totalGeral, avaliadosAte, percentual };
}

function simularFilaDe4() {
  const colaboradores = [
    { id: '1', nome: 'Ana' },
    { id: '2', nome: 'Bruno' },
    { id: '3', nome: 'Carla' },
    { id: '4', nome: 'Diego' },
  ];
  const total = String(colaboradores.length);
  let fila = [...colaboradores];
  const resultados = [];

  for (let i = 0; i < 4; i++) {
    fila.shift();
    if (fila.length > 0) {
      const { totalGeral, avaliadosAte, percentual } = calcProgress(fila, total);
      resultados.push({
        avaliadosAte,
        totalGeral,
        percentual,
        proximo: fila[0].nome,
        texto: `${avaliadosAte} de ${totalGeral} colaboradores avaliados`,
      });
    } else {
      resultados.push({ fim: true });
    }
  }
  return resultados;
}

console.log('\n=== Teste 1: Sequência do contador (fila de 4) ===');
const seq = simularFilaDe4();
assert(seq[0].texto === '1 de 4 colaboradores avaliados', 'Após 1ª avaliação: 1 de 4');
assert(seq[0].percentual === 25, 'Barra após 1ª: 25%');
assert(seq[0].proximo === 'Bruno', 'Próximo após 1ª: Bruno');

assert(seq[1].texto === '2 de 4 colaboradores avaliados', 'Após 2ª avaliação: 2 de 4');
assert(seq[1].percentual === 50, 'Barra após 2ª: 50%');
assert(seq[1].proximo === 'Carla', 'Próximo após 2ª: Carla');

assert(seq[2].texto === '3 de 4 colaboradores avaliados', 'Após 3ª avaliação: 3 de 4');
assert(seq[2].percentual === 75, 'Barra após 3ª: 75%');
assert(seq[2].proximo === 'Diego', 'Próximo após 3ª: Diego');

assert(seq[3].fim === true, 'Após 4ª: redireciona para agradecimentos (sem tela sucesso)');

console.log('\n=== Teste 2: Fallback sem colaboradoresTotal ===');
const fb = calcProgress([{ id: '2' }, { id: '3' }], null);
assert(fb.totalGeral === 3, 'Fallback totalGeral = filaRestante.length + 1');
assert(fb.avaliadosAte === 1, 'Fallback avaliadosAte = 1');

console.log('\n=== Teste 3: confirmarAvaliacao persiste colaboradoresTotal ===');
const avaliacoesHtml = readFileSync(join(root, 'frontend-ref/pages/avaliacoes.html'), 'utf8');
assert(
  avaliacoesHtml.includes("localStorage.setItem('colaboradoresTotal'"),
  'avaliacoes.html salva colaboradoresTotal'
);
assert(
  !avaliacoesHtml.includes('proximoNum + 1'),
  'avaliacoes.html não usa lógica antiga proximoNum'
);

console.log('\n=== Teste 4: Limpeza de colaboradoresTotal nos 3 pontos ===');
const sucessoHtml = readFileSync(join(root, 'frontend-ref/pages/avaliacao-sucesso.html'), 'utf8');
const responderHtml = readFileSync(join(root, 'frontend-ref/pages/responder-avaliacao.html'), 'utf8');
const agradecimentosHtml = readFileSync(join(root, 'frontend-ref/pages/avaliacao-agradecimentos.html'), 'utf8');

assert(
  sucessoHtml.includes("localStorage.removeItem('colaboradoresTotal')"),
  'avaliacao-sucesso.html remove colaboradoresTotal no Cancelar'
);
assert(
  responderHtml.includes("localStorage.removeItem('colaboradoresTotal')"),
  'responder-avaliacao.html remove colaboradoresTotal ao fim da fila'
);
assert(
  agradecimentosHtml.includes("localStorage.removeItem('colaboradoresTotal')"),
  'avaliacao-agradecimentos.html remove colaboradoresTotal em finalizar()'
);

console.log('\n=== Teste 5: Visual padronizado (avaliacao-sucesso.html) ===');
assert(sucessoHtml.includes('<main class="wrapper">'), 'Usa <main class="wrapper">');
assert(sucessoHtml.includes('agradecimentos-container'), 'Usa .agradecimentos-container');
assert(sucessoHtml.includes('agradecimentos-box'), 'Usa .agradecimentos-box');
assert(sucessoHtml.includes('fa-solid fa-check-circle agradecimentos-icon'), 'Ícone fa-check-circle');
assert(sucessoHtml.includes('agradecimentos-titulo'), 'Usa .agradecimentos-titulo');
assert(sucessoHtml.includes('btn-finalizar'), 'Botão primário usa .btn-finalizar');
assert(sucessoHtml.includes('btn-cancelar'), 'Botão Cancelar com estilo secundário');
assert(!sucessoHtml.includes('success-icon'), 'Remove ícone gradiente antigo (.success-icon)');
assert(
  sucessoHtml.includes('avaliadosAte} de ${totalGeral}'),
  'Texto de progresso usa avaliadosAte e totalGeral'
);
assert(
  !sucessoHtml.includes('proximoNum + 1'),
  'Remove lógica antiga totalGeral = proximoNum + 1'
);

console.log('\n=== Teste 6: CSS idêntico ao agradecimentos (valores-chave) ===');
const cssKeys = [
  'max-width: 600px',
  'padding: 60px 40px',
  'box-shadow: var(--shadow-md)',
  'font-size: 64px',
  'font-size: 28px',
  'padding: 14px 48px',
];
for (const key of cssKeys) {
  assert(sucessoHtml.includes(key), `CSS contém "${key}"`);
}

console.log(`\n${'='.repeat(40)}`);
console.log(`Resultado: ${passed} passou, ${failed} falhou`);
process.exit(failed > 0 ? 1 : 0);
