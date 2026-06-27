// Integração do Modal de Relatório Nine Box na tela de Relatórios
// Adiciona botões "Ver Individual" e "Resultados" na listagem de colaboradores

// Aguardar DOM pronto
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar componente do modal
  if (typeof window.NineBoxReportModal !== 'undefined') {
    window.NineBoxReportModal.init();
  }
  
  // Sobrescrever/adicionar botões na lista de usuários do grid Nine Box
  setupUserListButtons();
});

// Configurar botões na lista de usuários
function setupUserListButtons() {
  // Observar mudanças no DOM — o painel de usuários usa id="nb-users-panel"
  const observer = new MutationObserver(function() {
    const userCards = document.querySelectorAll('.nb-user-card-inline:not(.buttons-injected)');
    if (userCards.length > 0) {
      injectButtonsIntoUserCards(userCards);
    }
  });

  // Observar tanto nb-users-panel (novo) quanto nb-users-list (legado, caso exista)
  ['nb-users-panel', 'nb-users-list'].forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el, { childList: true, subtree: true });
  });

  // Injetar em cards já existentes após carregamento
  setTimeout(function() {
    const cards = document.querySelectorAll('.nb-user-card-inline:not(.buttons-injected)');
    if (cards.length > 0) injectButtonsIntoUserCards(cards);
  }, 800);
}

// Injetar botões nos cards de usuário
function injectButtonsIntoUserCards(cards) {
  cards.forEach(function(card) {
    // Verificar se já tem os botões
    if (card.classList.contains('buttons-injected')) return;
    
    // Marcar como processado
    card.classList.add('buttons-injected');
    
    // Buscar dados do card e combinar com dados globais da página
    const pessoaId = extractPessoaIdFromCard(card);
    const nineboxId = card.dataset?.nineboxId || null;
    const evaluationId = getEvaluationId();
    
    // ID a usar como referência de avaliação (prioridade: global > nineboxId > 'all')
    const effectiveEvalId = evaluationId || nineboxId || 'all';
    
    // Criar container de botões
    const buttonsDiv = document.createElement('div');
    buttonsDiv.style.cssText = 'display:flex;gap:8px;margin-top:12px;';
    buttonsDiv.className = 'user-card-buttons';
    
    // Botão Ver Individual
    const btnIndividual = document.createElement('button');
    btnIndividual.className = 'btn-ver-individual';
    btnIndividual.innerHTML = '<i class="fa-solid fa-user"></i> Ver Individual';
    btnIndividual.style.cssText = 'padding:6px 12px;background:#4C1D95;color:white;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px;transition:all 0.2s;';
    btnIndividual.title = 'Ver relatório individual do colaborador';
    btnIndividual.onclick = function() {
      if (typeof window.NineBoxReportModal !== 'undefined') {
        if (pessoaId) {
          // Sempre passa 'all' como evaluationId — o backend usa a avaliação mais recente da pessoa
          window.NineBoxReportModal.openIndividual('all', pessoaId);
        } else {
          console.warn('ID do colaborador não encontrado para o relatório individual');
          if (typeof window.showToast === 'function') window.showToast('Dados do colaborador não encontrados.', 'error');
          else alert('Não foi possível abrir o relatório. Dados do colaborador não encontrados.');
        }
      }
    };
    
    // Botão Resultados (Consolidado)
    const btnConsolidado = document.createElement('button');
    btnConsolidado.className = 'btn-resultados';
    btnConsolidado.innerHTML = '<i class="fa-solid fa-chart-pie"></i> Resultados';
    btnConsolidado.style.cssText = 'padding:6px 12px;background:#10b981;color:white;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px;transition:all 0.2s;';
    btnConsolidado.title = 'Ver relatório consolidado da avaliação';
    btnConsolidado.onclick = function() {
      if (typeof window.NineBoxReportModal !== 'undefined') {
        // Consolidado sempre usa 'all' — agrega todos os colaboradores
        window.NineBoxReportModal.openConsolidated('all');
      }
    };
    
    buttonsDiv.appendChild(btnIndividual);
    buttonsDiv.appendChild(btnConsolidado);
    
    // Injetar após o último elemento de info
    const infoDiv = card.querySelector('.nb-user-card-info');
    if (infoDiv) {
      infoDiv.appendChild(buttonsDiv);
    } else {
      // Se não encontrar infoDiv, adicionar no final do card
      card.appendChild(buttonsDiv);
    }
  });
}

// Extrair pessoaId do card usando múltiplas estratégias
function extractPessoaIdFromCard(card) {
  // 1. Tentar do data-pessoa-id (injetado pelo template HTML)
  if (card.dataset?.pessoaId) return card.dataset.pessoaId;
  
  // 2. Tentar do data-ninebox-id como fallback de segundo nível
  if (card.dataset?.nineboxId) return card.dataset.nineboxId;
  
  // 3. Tentar encontrar pelo nome na lista global de ninebox
  const nomeCard = card.querySelector('.nb-user-card-nome')?.textContent?.trim();
  if (nomeCard) {
    const nineboxItem = getNineboxDataByNome(nomeCard);
    if (nineboxItem) {
      return nineboxItem.pessoa?.id || nineboxItem.pessoaId || nineboxItem.id;
    }
  }
  
  return null;
}

// Extrair nineboxId do card (para usar como evaluationId fallback)
function extractNineboxIdFromCard(card) {
  return card.dataset?.nineboxId || null;
}

// Obter dados do Nine Box pelo nome do colaborador
function getNineboxDataByNome(nome) {
  const nbData = getNineBoxDataFromPage();
  return nbData.find(u => u.pessoa?.nome === nome);
}

// Obter dados do Nine Box pelo ID da pessoa
function getNineboxDataByPessoaId(pessoaId) {
  const nbData = getNineBoxDataFromPage();
  return nbData.find(u => u.pessoa?.id === pessoaId || u.id === pessoaId);
}

// Obter dados do Nine Box da página (se disponíveis globalmente)
function getNineBoxDataFromPage() {
  if (typeof allNineBoxData !== 'undefined' && allNineBoxData.length > 0) {
    return allNineBoxData;
  }
  // Tentar outras variáveis globais possíveis
  if (typeof window.nineBoxData !== 'undefined') {
    return window.nineBoxData;
  }
  return [];
}

// Obter evaluationId da página (tenta várias fontes)
function getEvaluationId() {
  // 1. Tentar de elemento hidden na página
  const hiddenInput = document.getElementById('current-evaluation-id') || document.getElementById('evaluation-id');
  if (hiddenInput && hiddenInput.value) return hiddenInput.value;
  
  // 2. Tentar de variável global
  if (typeof currentEvaluationId !== 'undefined') return currentEvaluationId;
  if (typeof evaluationId !== 'undefined') return evaluationId;
  if (typeof currentCampaignId !== 'undefined') return currentCampaignId;
  
  // 3. Tentar de elementos data nas tabs
  const tabElement = document.querySelector('[data-evaluation-id]');
  if (tabElement) return tabElement.dataset.evaluationId;
  
  // 4. Tentar do elemento da campanha atual
  const campaignElement = document.getElementById('current-campaign') || document.getElementById('campaign-id');
  if (campaignElement) return campaignElement.value || campaignElement.textContent;
  
  // 5. Se não tiver evaluationId específico, usar 'all' para consolidado
  return null;
}

// Função helper para abrir modal individual (chamada pelo botão na lista)
window.abrirRelatorioIndividual = function(evaluationId, pessoaId) {
  if (typeof window.NineBoxReportModal !== 'undefined') {
    window.NineBoxReportModal.openIndividual(evaluationId, pessoaId);
  }
};

// Função helper para abrir modal consolidado
window.abrirRelatorioConsolidado = function(evaluationId) {
  if (typeof window.NineBoxReportModal !== 'undefined') {
    window.NineBoxReportModal.openConsolidated(evaluationId);
  }
};

// Exportar para uso global
window.NineBoxReportIntegration = {
  setupButtons: setupUserListButtons,
  injectButtons: injectButtonsIntoUserCards,
  getPessoaId: extractPessoaIdFromCard,
  getEvaluationId: getEvaluationId,
  getNineboxData: getNineboxDataByPessoaId
};