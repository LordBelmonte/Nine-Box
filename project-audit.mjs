#!/usr/bin/env node
/**
 * project-audit.mjs
 * Auditoria automática do projeto NineBox — sintaxe, navegação, links
 * quebrados, arquivos órfãos e status do git. Não usa IA, não gasta
 * créditos, roda 100% local.
 *
 * Uso:
 *   node project-audit.mjs
 * Execute na pasta raiz do projeto (onde estão backend/ e frontend-ref/).
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT = process.cwd();
const BACKEND_SRC = path.join(ROOT, 'backend', 'src');
const FRONTEND_DIR = path.join(ROOT, 'frontend-ref');
const PAGES_DIR = path.join(FRONTEND_DIR, 'pages');
const JS_DIR = path.join(FRONTEND_DIR, 'js');

const totalIssues = [];

function section(title) { console.log('\n--- ' + title + ' ---'); }
function flag(msg) { totalIssues.push(msg); console.log('  ❌ ' + msg); }
function ok(msg) { console.log('  ✅ ' + msg); }
function warn(msg) { totalIssues.push('(aviso) ' + msg); console.log('  ⚠️  ' + msg); }

function walk(dir, exts, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(full, exts, results); }
    else if (exts.some(e => entry.name.endsWith(e))) { results.push(full); }
  }
  return results;
}

function rel(p) { return path.relative(ROOT, p).replace(/\\/g, '/'); }

console.log('========================================');
console.log(' AUDITORIA AUTOMÁTICA — NineBox');
console.log(' Raiz: ' + ROOT);
console.log('========================================');

// ─── 0. Git status ──────────────────────────────────────────────────────────
section('0. Status do Git (mudanças não commitadas)');
try {
  const status = execSync('git status --short', { cwd: ROOT, encoding: 'utf8' });
  if (status.trim()) {
    warn('Existem alterações não commitadas. Revise antes de continuar:');
    console.log(status.split('\n').map(l => '      ' + l).join('\n'));
  } else {
    ok('Nenhuma alteração pendente (working tree limpo).');
  }
} catch (e) {
  warn('Não foi possível verificar o git.');
}

// ─── 1. Sintaxe do backend ──────────────────────────────────────────────────
section('1. Sintaxe dos arquivos backend (.js)');
const backendFiles = walk(BACKEND_SRC, ['.js']);
let syntaxErrors = 0;
for (const file of backendFiles) {
  try {
    execSync(`node --check "${file}"`, { stdio: 'pipe' });
  } catch (e) {
    syntaxErrors++;
    flag(`Erro de sintaxe em ${rel(file)}`);
    const stderr = (e.stderr || '').toString().split('\n').slice(0, 4).join('\n      ');
    console.log('      ' + stderr);
  }
}
if (backendFiles.length === 0) {
  warn('Nenhum arquivo backend encontrado em ' + rel(BACKEND_SRC));
} else if (syntaxErrors === 0) {
  ok(`${backendFiles.length} arquivos verificados, nenhum erro de sintaxe.`);
}

// ─── 2. Páginas HTML: navbar + header + links quebrados ────────────────────
section('2. Páginas HTML (navbar.js, header, links internos)');
const htmlFiles = walk(PAGES_DIR, ['.html']);
const REQUIRED_HEADER_IDS = [
  'user-menu', 'user-btn', 'user-dropdown',
  'user-dropdown-nome', 'user-dropdown-tipo', 'user-dropdown-avatar',
  'btn-sair-header'
];
const PAGES_WITHOUT_NAVBAR_OK = ['login.html'];
const allHtmlNames = new Set(htmlFiles.map(f => path.basename(f)));
const referencedPages = new Set();

for (const file of htmlFiles) {
  const name = path.basename(file);
  const content = fs.readFileSync(file, 'utf8');

  if (!PAGES_WITHOUT_NAVBAR_OK.includes(name)) {
    if (!content.includes('navbar.js')) {
      flag(`${name}: não importa navbar.js`);
    }
    const missingIds = REQUIRED_HEADER_IDS.filter(id => !content.includes(`id="${id}"`));
    if (missingIds.length > 0) {
      flag(`${name}: header incompleto, faltam IDs: ${missingIds.join(', ')}`);
    }
  }

  const hrefMatches = [...content.matchAll(/href=["']([a-zA-Z0-9_\-]+\.html)["']/g)];
  for (const m of hrefMatches) {
    referencedPages.add(m[1]);
    if (!allHtmlNames.has(m[1])) {
      flag(`${name}: link quebrado <a href="${m[1]}"> (arquivo não existe em pages/)`);
    }
  }

  const redirMatches = [...content.matchAll(/location\.href\s*=\s*["']([a-zA-Z0-9_\-]+\.html)["']/g)];
  for (const m of redirMatches) {
    referencedPages.add(m[1]);
    if (!allHtmlNames.has(m[1])) {
      flag(`${name}: redirecionamento quebrado para '${m[1]}'`);
    }
  }
}

if (htmlFiles.length === 0) {
  warn('Nenhuma página HTML encontrada em ' + rel(PAGES_DIR));
} else {
  ok(`${htmlFiles.length} páginas verificadas.`);
}

// ─── 3. Páginas órfãs ───────────────────────────────────────────────────────
section('3. Páginas HTML possivelmente órfãs');
const ENTRY_POINTS = ['login.html', 'index.html'];
let orphanCount = 0;
for (const file of htmlFiles) {
  const name = path.basename(file);
  if (ENTRY_POINTS.includes(name)) continue;
  if (!referencedPages.has(name)) {
    orphanCount++;
    warn(`${name}: não referenciada em nenhuma outra página — confirme manualmente.`);
  }
}
if (orphanCount === 0) ok('Nenhuma página órfã detectada.');

// ─── 4. Arquivos JS não importados ─────────────────────────────────────────
section('4. Arquivos JS do frontend não importados em nenhum lugar');
const jsFiles = walk(JS_DIR, ['.js']);
const allFrontendSource =
  htmlFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n') +
  jsFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');
let unusedJsCount = 0;
for (const file of jsFiles) {
  const name = path.basename(file);
  const occurrences = allFrontendSource.split(name).length - 1;
  const selfOccurrences = fs.readFileSync(file, 'utf8').split(name).length - 1;
  if (occurrences - selfOccurrences <= 0) {
    unusedJsCount++;
    warn(`${rel(file)}: não encontrado em nenhum import externo.`);
  }
}
if (unusedJsCount === 0) ok('Todos os arquivos JS do frontend parecem estar em uso.');

// ─── 5. Módulos backend vs rotas registradas em app.js ─────────────────────
section('5. Módulos backend vs rotas registradas em app.js');
const appJsPath = path.join(BACKEND_SRC, 'app.js');
if (fs.existsSync(appJsPath)) {
  const appJsContent = fs.readFileSync(appJsPath, 'utf8');
  const modulesDir = path.join(BACKEND_SRC, 'modules');
  if (fs.existsSync(modulesDir)) {
    const moduleNames = fs.readdirSync(modulesDir, { withFileTypes: true })
      .filter(e => e.isDirectory()).map(e => e.name);
    for (const mod of moduleNames) {
      if (!appJsContent.includes(`/modules/${mod}/`)) {
        warn(`Módulo '${mod}' não aparece referenciado em app.js.`);
      }
    }
    ok(`${moduleNames.length} módulos verificados contra app.js.`);
  }
} else {
  warn('Não encontrei backend/src/app.js — pulei esta verificação.');
}

// ─── Resumo final ────────────────────────────────────────────────────────────
console.log('\n========================================');
console.log(' RESUMO');
console.log('========================================');
if (totalIssues.length === 0) {
  console.log('✅ Nenhum problema encontrado.');
} else {
  console.log(`Encontrados ${totalIssues.length} ponto(s) para revisar:`);
  totalIssues.forEach((msg, i) => console.log(`  ${i + 1}. ${msg}`));
}
console.log('\nLembrete: verificações MECÂNICAS apenas. Não substitui teste manual.');
