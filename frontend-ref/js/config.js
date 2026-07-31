// =============================================
// CONFIG.JS — Configurações globais da aplicação
// =============================================

/**
 * Detecta o ambiente e define a URL base da API:
 *
 * 1. Se VITE_API_URL ou __API_URL__ estiver definido em build-time → usa ele.
 * 2. Se o frontend rodar em localhost/127.0.0.1 em porta diferente de 3000
 *    → desenvolvimento local com live-server → aponta para localhost:3000
 * 3. Caso contrário → mesmo domínio (Express serve o frontend), usa '/api'
 *
 * Para deploy no Render onde o Express serve o HTML diretamente:
 *   O frontend acessa /api (same-origin) → sem CORS.
 *
 * Para deploy separado (frontend em Vercel, backend no Render):
 *   Defina a variável global window.__API_URL__ ou VITE_API_URL com a URL
 *   completa do backend (ex: https://meu-backend.onrender.com/api).
 */

// Suporte à injeção de URL via variável global (útil para deploy sem bundler)
// Ex: coloque <script>window.__API_URL__ = "https://meu-app.onrender.com/api"</script>
// no <head> do HTML antes deste script.
const _injectedApiUrl = (typeof window !== 'undefined' && window.__API_URL__)
  ? window.__API_URL__
  : null;

// Detecção de desenvolvimento local
const _hostname = window.location.hostname;
const _port = window.location.port;
const _isLocalDev = (
  _hostname === 'localhost' ||
  _hostname === '127.0.0.1'
) && _port !== '3000';

// Resolução da URL base
function resolveApiUrl() {
  // 1. URL injetada explicitamente tem precedência máxima
  if (_injectedApiUrl) return _injectedApiUrl;

  // 2. Desenvolvimento local (porta diferente do backend)
  if (_isLocalDev) return 'http://localhost:3000/api';

  // 3. Same-origin (Express serve o frontend, sem CORS)
  return '/api';
}

const CONFIG = {
  API_BASE_URL: resolveApiUrl(),
  TOKEN_KEY: 'portal_token',
  USER_KEY: 'portal_user',
  DARK_MODE_KEY: 'darkMode',
  MOCK_MODE: false, // false = backend real, true = dados mock
};

// Log em desenvolvimento para facilitar debug
if (_isLocalDev) {
  console.log('[CONFIG] Modo: desenvolvimento local');
  console.log('[CONFIG] API_BASE_URL:', CONFIG.API_BASE_URL);
} else {
  console.log('[CONFIG] Modo: produção / same-origin');
  console.log('[CONFIG] API_BASE_URL:', CONFIG.API_BASE_URL);
}

export default CONFIG;
