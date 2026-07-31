// =============================================
// CONFIG.JS — Configurações globais da aplicação
// =============================================

/**
 * Regras de resolução da URL base da API:
 *
 * 1. window.__API_URL__ definido antes deste script (injeção manual) → usa ele.
 * 2. Frontend rodando em localhost/127.0.0.1 numa porta diferente de 3000
 *    (live-server em dev) → aponta para http://localhost:3000/api
 * 3. Qualquer outro caso (Render, produção, mesmo domínio) → usa '/api'
 *    O Express serve o frontend como estático, então é same-origin sem CORS.
 *
 * NUNCA hardcode a URL de produção aqui.
 * Use window.__API_URL__ se precisar de uma URL externa específica.
 */

const _hostname    = window.location.hostname;
const _port        = window.location.port;
const _isLocalDev  = (_hostname === 'localhost' || _hostname === '127.0.0.1') && _port !== '3000';
const _injected    = (typeof window.__API_URL__ === 'string' && window.__API_URL__.length > 0)
  ? window.__API_URL__.replace(/\/$/, '')
  : null;

function resolveApiUrl() {
  if (_injected)    return _injected;
  if (_isLocalDev)  return 'http://localhost:3000/api';
  return '/api';
}

const CONFIG = {
  API_BASE_URL: resolveApiUrl(),
  TOKEN_KEY:    'portal_token',
  USER_KEY:     'portal_user',
  DARK_MODE_KEY:'darkMode',
  MOCK_MODE:    false,
};

console.log(`[CONFIG] hostname=${_hostname} port=${_port} isLocalDev=${_isLocalDev}`);
console.log(`[CONFIG] API_BASE_URL=${CONFIG.API_BASE_URL}`);

export default CONFIG;
