// =============================================
// CONFIG.JS — Configurações globais da aplicação
// =============================================

// Detecta o ambiente para definir a URL base da API:
// - Em produção (frontend servido pelo mesmo domínio do backend), usa caminho relativo '/api'
//   para evitar CORS e funcionar com qualquer domínio sem hardcode.
// - Em desenvolvimento local (live-server em porta diferente), aponta para o backend em localhost:3000.
const _isLocalDev = (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
) && window.location.port !== '3000';

const CONFIG = {
  API_BASE_URL: _isLocalDev ? 'http://localhost:3000/api' : '/api',
  TOKEN_KEY: 'portal_token',
  USER_KEY: 'portal_user',
  DARK_MODE_KEY: 'darkMode',
  MOCK_MODE: false, // false = backend real, true = dados mock
};

export default CONFIG;
