/**
 * Testes da reestruturação de responder-avaliacao.html
 * Executar: node scripts/test-responder-avaliacao.mjs
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(__dirname, '../frontend-ref/pages/responder-avaliacao.html'), 'utf8');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) { passed++; console.log(`  ✓ ${message}`); }
  else { failed++; console.error(`  ✗ ${message}`); }
}

console.log('\n=== Parte 1: Observações removidas ===');
assert(!html.includes('function buildSteps'), 'buildSteps() removida');
assert(!html.includes("type: 'obs'"), 'steps de observação removidos');
assert(!html.includes('obs-desc'), 'CSS .obs-desc removido');
assert(!html.includes('observacoes-container'), 'CSS .observacoes-container removido');
assert(!html.includes('observacoes-label'), 'CSS .observacoes-label removido');
assert(!html.includes('observacao'), 'campo observacao removido');
assert(html.includes('comentario: null'), 'payload usa comentario: null');

console.log('\n=== Parte 2: Página única ===');
assert(html.includes('function renderAllCompetencies'), 'renderAllCompetencies() presente');
assert(!html.includes('function renderStep'), 'renderStep() removida');
assert(!html.includes('pagination-container'), 'paginação removida');
assert(!html.includes('btn-proximo'), 'botão Próximo removido');
assert(!html.includes('btn-voltar'), 'botão Voltar removido');
assert(html.includes('btn-finalizar-avaliacao'), 'botão Finalizar Avaliação presente');
assert(html.includes('findFirstUnanswered'), 'validação de critérios faltantes presente');
assert(html.includes('criterio-erro'), 'destaque visual de erro presente');
assert(html.includes('competencias-list'), 'lista de competências empilhadas');
assert(!html.includes('currentStep'), 'navegação por currentStep removida');

console.log('\n=== Lógica simulada: progresso e payload ===');
const competencies = [
  { id: 'c1', nome: 'Comp A', criterios: ['Crit A1', 'Crit A2'] },
  { id: 'c2', nome: 'Comp B', criterios: ['Crit B1', 'Crit B2', 'Crit B3'] },
  { id: 'c3', nome: 'Comp C', criterios: ['Crit C1', 'Crit C2'] },
];
const respostas = {
  c1: { criterios: [3, 4] },
  c2: { criterios: [2, null, 4] },
  c3: { criterios: [1, 3] },
};

const totalCrit = competencies.reduce((s, c) => s + c.criterios.length, 0);
let answered = 0;
competencies.forEach(comp => {
  comp.criterios.forEach((_, idx) => {
    if (respostas[comp.id]?.criterios?.[idx] != null) answered++;
  });
});
assert(totalCrit === 7, '7 critérios no total (2+3+2)');
assert(answered === 6, '6 critérios respondidos parcialmente');

function findFirstUnanswered(comps, resp) {
  for (const comp of comps) {
    for (let idx = 0; idx < comp.criterios.length; idx++) {
      if (resp[comp.id]?.criterios?.[idx] == null) return { compId: comp.id, idx };
    }
  }
  return null;
}
const missing = findFirstUnanswered(competencies, respostas);
assert(missing?.compId === 'c2' && missing?.idx === 1, 'primeiro não respondido: Comp B critério 2');

respostas.c2.criterios[1] = 3;
assert(findFirstUnanswered(competencies, respostas) === null, 'todos respondidos abre modal');

const criterios = {};
competencies.forEach(comp => {
  const r = respostas[comp.id];
  if (r?.criterios?.length) {
    const notas = r.criterios.filter(n => n != null);
    criterios[comp.nome] = parseFloat((notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2));
  }
});
assert(criterios['Comp A'] === 3.5, 'média Comp A = 3.5');
assert(criterios['Comp B'] === 3, 'média Comp B = 3');
assert(criterios['Comp C'] === 2, 'média Comp C = 2');

console.log(`\n${'='.repeat(40)}`);
console.log(`Resultado: ${passed} passou, ${failed} falhou`);
process.exit(failed > 0 ? 1 : 0);
