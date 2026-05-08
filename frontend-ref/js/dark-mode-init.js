// Aplicar dark mode imediatamente para evitar flash
(function() {
  const darkMode = localStorage.getItem('darkMode');
  if (darkMode === '1' || (darkMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark-mode');
    document.body.classList.add('dark-mode');
  }
})();
