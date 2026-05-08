// Navegação, dark mode e controle de usuário
// Gerencia a navegação do sistema, alternância de modo escuro e permissões de acesso

import { getUser, sairDaConta, toggleUserMenu, updateHeaderUser, isAdmin, isGestorOrAdmin, isGestor, isColaborador } from './auth.js';

// Controle de submenu dropdown
window.toggleSubmenu = function(e, link) {
  e.preventDefault();
  const item = link.closest('.navbar-item-dropdown');
  if (!item) return;
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.navbar-item-dropdown.open').forEach(el => {
    if (el !== item) el.classList.remove('open');
  });
  item.classList.toggle('open', !isOpen);
};

// Fechar submenus ao clicar fora
document.addEventListener('click', (e) => {
  if (!e.target.closest('.navbar-item-dropdown')) {
    document.querySelectorAll('.navbar-item-dropdown.open').forEach(el => el.classList.remove('open'));
  }
});

// Aplicar modo escuro
function aplicarDarkMode(ativo) {
  document.body.classList.toggle('dark-mode', ativo);
  const btn = document.getElementById('dark-mode-btn');
  if (btn) {
    btn.innerHTML = ativo ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    btn.title = ativo ? 'Modo claro' : 'Modo escuro';
  }
}

// Alternar modo escuro
window.toggleDarkMode = function() {
  const ativo = !document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', ativo ? '1' : '0');
  aplicarDarkMode(ativo);
};

// Controlar visibilidade de elementos baseado em permissões
function aplicarPermissoesNav() {
  const user = getUser();
  if (!user) return;

  // Elementos visíveis apenas para administradores
  document.querySelectorAll('[data-role="admin"]').forEach(el => {
    el.style.display = isAdmin() ? '' : 'none';
  });

  // Elementos visíveis para gestores e administradores
  document.querySelectorAll('[data-role="gestorOrAdmin"]').forEach(el => {
    el.style.display = isGestorOrAdmin() ? '' : 'none';
  });
}

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  // Destacar link ativo baseado na página atual
  const page = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.navbar-link:not(.navbar-link-dropdown)').forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (!href) return;
    const hrefPage = href.split('/').pop();
    if ((page === 'index.html' || page === '') && (hrefPage === 'index.html' || href.includes('index.html'))) {
      link.classList.add('active');
    } else if (hrefPage && hrefPage !== 'index.html' && page === hrefPage) {
      link.classList.add('active');
    }
  });

  document.querySelectorAll('.navbar-submenu-link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const hrefPage = href.split('/').pop();
    if (hrefPage && page === hrefPage) {
      link.classList.add('active');
      const parentItem = link.closest('.navbar-item-dropdown');
      if (parentItem) {
        parentItem.querySelector('.navbar-link-dropdown')?.classList.add('active');
      }
    }
  });

  // Atualizar informações do usuário no header
  updateHeaderUser();
  aplicarPermissoesNav();

  // Aplicar modo escuro salvo ou preferência do sistema
  const darkSalvo = localStorage.getItem('darkMode');
  if (darkSalvo === '1') {
    aplicarDarkMode(true);
  } else if (darkSalvo === null) {
    aplicarDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }
});

// Expor funções para uso em HTML inline
window.sairDaConta = sairDaConta;
window.toggleUserMenu = toggleUserMenu;
