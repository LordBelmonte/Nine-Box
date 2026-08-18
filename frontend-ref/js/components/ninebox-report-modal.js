// Componente: Modal de Relatório Nine Box
// Inclui variantes Individual e Consolidado, com exportação PDF

// ══════════════════════════════════════════════════════════════════════════
// FONTE ÚNICA DOS QUADRANTES — NOMENCLATURA OFICIAL B/M/A
// Chave: código oficial (B1-A3)
// MATRIZ:               POTENCIAL
//              BAIXO   MÉDIO    ALTO
// PERF BAIXO    B1      B2      B3
// PERF MÉDIO    M1      M2      M3
// PERF ALTA     A1      A2      A3
// ══════════════════════════════════════════════════════════════════════════
const QUADRANTES = {
  'B1': {
    nome: 'Insuficiente', potencial: 'BAIXO', desempenho: 'BAIXO', cor: '#EF4444',
    perfil: 'Potencial baixo e desempenho abaixo do esperado',
    planoAcao: 'Identificar obstáculos que poderiam justificar o baixo desempenho e ajudá-lo a removê-los ou encontrar outro cargo interno. Se não houver melhorias, recomenda-se o desligamento.'
  },
  'B2': {
    nome: 'Eficaz', potencial: 'MÉDIO', desempenho: 'BAIXO', cor: '#F97316',
    perfil: 'Potencial mediano e desempenho abaixo do esperado',
    planoAcao: 'Identificar bloqueios para performance. Comunicar claramente as expectativas e proporcionar programa de mentoria e oportunidades de desenvolvimento.'
  },
  'B3': {
    nome: 'Comprometido', potencial: 'ALTO', desempenho: 'BAIXO', cor: '#F97316',
    perfil: 'Alto potencial e desempenho abaixo do esperado',
    planoAcao: 'Mesmo com alto potencial, não está entregando. Dar tempo para ganhar experiência e feedback contínuo para construir confiança.'
  },
  'M1': {
    nome: 'Questionável', potencial: 'BAIXO', desempenho: 'MÉDIO', cor: '#EAB308',
    perfil: 'Potencial baixo e desempenho dentro do esperado',
    planoAcao: 'Dar feedback, treinar para se tornarem mais inovadores e definir plano de desenvolvimento para conduzi-los à categoria de alto desempenho.'
  },
  'M2': {
    nome: 'Mantenedor', potencial: 'MÉDIO', desempenho: 'MÉDIO', cor: '#EAB308',
    perfil: 'Potencial e desempenho em nível mediano',
    planoAcao: 'Investir com novos projetos e tarefas que os mantenham engajados, preparando-os para oportunidades futuras.'
  },
  'M3': {
    nome: 'Forte Desempenho', potencial: 'ALTO', desempenho: 'MÉDIO', cor: '#84CC16',
    perfil: 'Alto potencial e desempenho dentro do esperado',
    planoAcao: 'Proporcionar mais exposição através de treinamentos, projetos desafiadores e monitoramento com KPIs claras.'
  },
  'A1': {
    nome: 'Enigma', potencial: 'BAIXO', desempenho: 'ALTO', cor: '#84CC16',
    perfil: 'Potencial baixo e desempenho acima do esperado',
    planoAcao: 'Apesar do bom desempenho, tem pouco potencial de crescimento. Mantê-los felizes e recompensá-los com aumentos e bônus.'
  },
  'A2': {
    nome: 'Em crescimento', potencial: 'MÉDIO', desempenho: 'ALTO', cor: '#22C55E',
    perfil: 'Potencial mediano e desempenho acima do esperado',
    planoAcao: 'Entender se estão prontos para mais responsabilidades. Trabalhar habilidades de pensamento tático e estratégico.'
  },
  'A3': {
    nome: 'Destaque', potencial: 'ALTO', desempenho: 'ALTO', cor: '#15803D',
    perfil: 'Alto potencial e desempenho acima do esperado',
    planoAcao: 'Profissional pronto para promoção e novas responsabilidades. É referência pelos demais pela capacidade de resolução de problemas e pensamento estratégico.'
  }
};

// Compatibilidade: mapeia códigos legados Q1-Q9 para B/M/A
const LEGADO_Q_PARA_BMA = {
  'Q1':'B1','Q2':'M1','Q3':'A1',
  'Q4':'B2','Q5':'M2','Q6':'A2',
  'Q7':'B3','Q8':'M3','Q9':'A3'
};

// Normaliza qualquer código (Q1-Q9 ou B1-A3) para B/M/A oficial
function normalizarCodigo(codigo) {
  if (!codigo) return 'M2';
  if (/^[BMA][123]$/.test(codigo)) return codigo;
  // Remove parênteses e texto extra: "Q5 (Mantenedor)" → "Q5"
  const match = (codigo + '').match(/^Q([1-9])/);
  if (match) return LEGADO_Q_PARA_BMA[`Q${match[1]}`] || 'M2';
  return 'M2'; // fallback seguro
}

// Obtém o quadrante (normalizado) — nunca retorna undefined
function getQuadrante(codigo) {
  return QUADRANTES[normalizarCodigo(codigo)] || QUADRANTES['M2'];
}

// Variáveis de estado
let currentReportData = null;
let currentType = null; // 'individual' ou 'consolidated'

// Inicializar o modal
function initNineBoxReportModal() {
  // Criar o HTML do modal se não existir
  if (!document.getElementById('nb-report-modal')) {
    createModalHTML();
  }
}

// Criar HTML do modal
function createModalHTML() {
  const modalHTML = `
    <!-- Modal de Relatório Nine Box -->
    <div class="nb-report-modal-overlay" id="nb-report-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);z-index:2000;align-items:center;justify-content:center;padding:20px;overflow-y:auto;">
      <div class="nb-report-modal-box" style="background:var(--surface);border-radius:var(--radius);box-shadow:var(--shadow-lg);width:100%;max-width:900px;margin:auto;animation:dropdownIn 0.3s ease;" id="nb-report-modal-content">
        <!-- Loading -->
        <div id="nb-report-loading" style="display:none;padding:60px 20px;text-align:center;">
          <i class="fa-solid fa-spinner fa-spin" style="font-size:48px;color:var(--primary);margin-bottom:16px;"></i>
          <p style="color:var(--text-muted);">Carregando relatório...</p>
        </div>
        
        <!-- Conteúdo do relatório -->
        <div id="nb-report-content" style="display:none;">
          <!-- Cabeçalho -->
          <div class="nb-report-header" style="background:#4C1D95;padding:20px 24px;color:white;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
              <div>
                <h2 style="margin:0;font-size:20px;font-weight:700;" id="nb-report-title">Avaliação</h2>
                <p style="margin:4px 0 0;font-size:13px;opacity:0.9;" id="nb-report-subtitle">Detalhes da avaliação</p>
              </div>
              <div style="text-align:right;">
                <i class="fa-solid fa-building" style="font-size:32px;opacity:0.8;"></i>
              </div>
            </div>
          </div>
          
          <!-- Corpo do relatório -->
          <div class="nb-report-body" style="padding:24px;">
            <!-- Card do colaborador (Individual) ou info geral (Consolidado) -->
            <div id="nb-report-card" style="background:var(--surface);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:20px;margin-bottom:24px;">
              <!-- Preenchido via JS -->
            </div>
            
            <!-- Seção Resultados -->
            <h3 style="font-size:16px;font-weight:700;color:#4C1D95;margin:0 0 20px;text-align:center;" id="nb-report-results-title">Resultados</h3>
            
            <!-- Matriz Nine Box -->
            <div style="margin-bottom:24px;">
              <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:12px;">
                <i class="fa-solid fa-chart-pie" style="color:var(--primary);"></i>
                <span style="font-size:13px;font-weight:600;color:var(--text);">Matriz Nine Box</span>
              </div>
              
              <div style="display:flex;gap:8px;align-items:center;justify-content:center;margin-bottom:12px;">
                <span style="font-size:11px;font-weight:600;color:var(--text-muted);writing-mode:vertical-rl;transform:rotate(180deg);">POTENCIAL</span>
                
                <div style="position:relative;">
                  <!-- Labels do eixo X -->
                  <div style="display:flex;gap:60px;justify-content:center;margin-bottom:8px;">
                    <span style="font-size:10px;font-weight:600;color:var(--text-muted);">BAIXO</span>
                    <span style="font-size:10px;font-weight:600;color:var(--text-muted);">MÉDIO</span>
                    <span style="font-size:10px;font-weight:600;color:var(--text-muted);">ALTO</span>
                  </div>
                  
                  <!-- Grid 3x3 -->
                  <div id="nb-report-matrix" style="display:grid;grid-template-columns:repeat(3,100px);grid-template-rows:repeat(3,100px);gap:8px;">
                    <!-- Preenchido via JS -->
                  </div>
                  
                  <div style="text-align:center;margin-top:8px;">
                    <span style="font-size:11px;font-weight:600;color:var(--text-muted);padding:4px 12px;background:var(--surface);border-radius:6px;">DESEMPENHO</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Gráfico de competências -->
            <div style="margin-bottom:24px;">
              <h4 style="font-size:14px;font-weight:700;color:var(--primary);margin:0 0 16px;display:flex;align-items:center;gap:8px;">
                <i class="fa-solid fa-chart-simple"></i>
                <span id="nb-report-comp-title">Média por competência</span>
              </h4>
              
              <div id="nb-report-chart" style="display:flex;flex-direction:column;gap:12px;">
                <!-- Preenchido via JS -->
              </div>
            </div>
            
            <!-- Chips de estatística -->
            <div style="display:flex;gap:16px;justify-content:center;margin-bottom:24px;">
              <div style="display:flex;align-items:center;gap:8px;background:#dbeafe;padding:10px 16px;border-radius:100px;" id="nb-chip-performance">
                <i class="fa-solid fa-chart-line" style="color:#1d4ed8;"></i>
                <span style="font-size:14px;font-weight:600;color:#1d4ed8;" id="nb-chip-performance-text">Desempenho Médio: —</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px;background:#dcfce7;padding:10px 16px;border-radius:100px;" id="nb-chip-potential">
                <i class="fa-solid fa-arrow-trend-up" style="color:#166534;"></i>
                <span style="font-size:14px;font-weight:600;color:#166534;" id="nb-chip-potential-text">Potencial Médio: —</span>
              </div>
            </div>
            
            <!-- Perfil e Plano de Ação -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
              <div style="background:#fef3c7;border:1.5px solid #fde68a;border-radius:var(--radius-sm);padding:16px;">
                <h5 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#92400e;display:flex;align-items:center;gap:8px;">
                  <i class="fa-solid fa-user"></i>
                  Perfil
                </h5>
                <p style="margin:0;font-size:13px;color:#78350f;line-height:1.5;" id="nb-report-perfil">—</p>
              </div>
              <div style="background:#e0f2fe;border:1.5px solid #7dd3fc;border-radius:var(--radius-sm);padding:16px;">
                <h5 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#0369a1;display:flex;align-items:center;gap:8px;">
                  <i class="fa-solid fa-lightbulb"></i>
                  Plano de Ação
                </h5>
                <p style="margin:0;font-size:13px;color:#0c4a6e;line-height:1.6;" id="nb-report-plano">—</p>
              </div>
            </div>
          </div>
          
          <!-- Rodapé -->
          <div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;background:#fafafa;border-radius:0 0 var(--radius) var(--radius);">
            <button onclick="closeNineBoxReportModal()" style="padding:10px 20px;background:transparent;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:13px;font-weight:600;color:var(--text);cursor:pointer;display:flex;align-items:center;gap:6px;font-family:inherit;">
              <i class="fa-solid fa-arrow-left"></i> Voltar
            </button>
            <button onclick="exportNineBoxReportPDF()" style="padding:10px 20px;background:#10b981;border:none;border-radius:var(--radius-sm);font-size:13px;font-weight:600;color:white;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:inherit;" id="btn-export-pdf">
              <i class="fa-solid fa-file-pdf"></i> Exportar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Abrir modal individual
async function openNineBoxReportIndividual(evaluationId, pessoaId) {
  currentType = 'individual';
  
  const modal = document.getElementById('nb-report-modal');
  const loading = document.getElementById('nb-report-loading');
  const content = document.getElementById('nb-report-content');
  
  // Resetar visual
  modal.style.display = 'flex';
  loading.style.display = 'block';
  content.style.display = 'none';
  
  try {
    // Chamar API
    const response = await fetch(`${getApiBaseUrl()}/ninebox/report/individual/${evaluationId}/${pessoaId}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `Erro ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    currentReportData = result.data;
    
    // Renderizar conteúdo
    renderReportIndividual(result.data);
    
    loading.style.display = 'none';
    content.style.display = 'block';
    
  } catch (error) {
    console.error('Erro ao carregar relatório individual:', error);
    showToastMsg('Erro ao carregar relatório: ' + error.message, 'error');
    closeNineBoxReportModal();
  }
}

// Abrir modal consolidado
async function openNineBoxReportConsolidated(evaluationId) {
  currentType = 'consolidated';
  
  const modal = document.getElementById('nb-report-modal');
  const loading = document.getElementById('nb-report-loading');
  const content = document.getElementById('nb-report-content');
  
  // Resetar visual
  modal.style.display = 'flex';
  loading.style.display = 'block';
  content.style.display = 'none';
  
  try {
    // Chamar API
    const response = await fetch(`${getApiBaseUrl()}/ninebox/report/consolidated/${evaluationId}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `Erro ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    currentReportData = result.data;
    
    // Renderizar conteúdo
    renderReportConsolidated(result.data);
    
    loading.style.display = 'none';
    content.style.display = 'block';
    
  } catch (error) {
    console.error('Erro ao carregar relatório consolidado:', error);
    showToastMsg('Erro ao carregar relatório: ' + error.message, 'error');
    closeNineBoxReportModal();
  }
}

// Renderizar relatório individual
function renderReportIndividual(data) {
  // Cabeçalho
  const campanhaNome = data.avaliacao?.campanha || data.avaliacao?.empresa || 'N/A';
  document.getElementById('nb-report-title').textContent =
    `Resultado Individual — ${data.colaborador.nome}`;
  document.getElementById('nb-report-subtitle').textContent =
    `${data.colaborador.cargo} · ${data.colaborador.departamento} · ${data.colaborador.totalAvaliacoes || 0} avaliação(ões) recebida(s)`;

  // Card do colaborador
  const card = document.getElementById('nb-report-card');
  const iniciais = (data.colaborador.nome || 'C')
    .split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();

  card.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
      <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#4C1D95,#7C3AED);display:flex;align-items:center;justify-content:center;color:white;font-size:18px;font-weight:700;flex-shrink:0;">
        ${iniciais}
      </div>
      <div style="flex:1;">
        <div style="font-size:16px;font-weight:700;color:var(--text);">${data.colaborador.nome}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">
          ${data.colaborador.cargo} · ${data.colaborador.departamento}
        </div>
      </div>
      <span style="padding:4px 12px;background:${data.colaborador.statusAvaliacao === 'Respondida' ? '#dcfce7' : '#fef3c7'};color:${data.colaborador.statusAvaliacao === 'Respondida' ? '#166534' : '#92400e'};border-radius:100px;font-size:11px;font-weight:700;">
        ${data.colaborador.statusAvaliacao}
      </span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">
      <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-muted);">
        <i class="fa-solid fa-building" style="color:var(--primary);width:16px;"></i>
        <span>Departamento: <strong style="color:var(--text);">${data.colaborador.departamento}</strong></span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-muted);">
        <i class="fa-solid fa-star" style="color:var(--primary);width:16px;"></i>
        <span>Campanha: <strong style="color:var(--text);">${campanhaNome}</strong></span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-muted);">
        <i class="fa-solid fa-briefcase" style="color:var(--primary);width:16px;"></i>
        <span>Cargo: <strong style="color:var(--text);">${data.colaborador.cargo}</strong></span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-muted);">
        <i class="fa-solid fa-hashtag" style="color:var(--primary);width:16px;"></i>
        <span>Avaliações: <strong style="color:var(--text);">${data.colaborador.totalAvaliacoes || 0}</strong></span>
      </div>
    </div>
  `;

  // Renderizar matriz (usa níveis já calculados pelo backend)
  renderMatrix(data.nivelDesempenho, data.nivelPotencial);

  // Renderizar gráfico de competências (médias)
  renderChart(data.competencias, 'Média por competência');

  // Chips de resultado
  document.getElementById('nb-chip-performance-text').textContent =
    `Desempenho: ${formatarNota(data.notaDesempenho)}/4`;
  document.getElementById('nb-chip-potential-text').textContent =
    `Potencial: ${formatarNota(data.notaPotencial)}/4`;

  // Perfil e Plano de Ação do quadrante
  const quadrante = getQuadrante(data.codigoQuadrante);
  document.getElementById('nb-report-perfil').textContent  = quadrante.perfil;
  document.getElementById('nb-report-plano').textContent   = quadrante.planoAcao;

  // Título da seção de resultados
  document.getElementById('nb-report-results-title').textContent =
    `${data.codigoQuadrante} — ${data.nomeQuadrante}`;

  // Detalhamento por avaliação — exibe após os gráficos se houver dados
  _renderDetalhamentoAvaliacoes(data.detalhamentoAvaliacoes || []);
}

// Renderiza o bloco de detalhamento de cada avaliação recebida pelo avaliado
function _renderDetalhamentoAvaliacoes(detalhamento) {
  // Remove seção anterior se existir
  const idSecao = 'nb-report-detalhamento';
  const anterior = document.getElementById(idSecao);
  if (anterior) anterior.remove();

  if (!detalhamento || detalhamento.length === 0) return;

  const body = document.getElementById('nb-report-content');
  if (!body) return;

  // Cria o bloco de detalhamento
  const secao = document.createElement('div');
  secao.id = idSecao;
  secao.style.cssText = 'padding:0 24px 24px;';

  const avaliacoesHtml = detalhamento.map((av, idx) => {
    const dataFormatada = av.data
      ? new Date(av.data).toLocaleDateString('pt-BR')
      : '—';
    const mediaFormatada = av.media != null ? formatarNota(av.media) : '—';

    // Critérios desta avaliação
    const criteriosHtml = Object.entries(av.criterios || {})
      .filter(([, nota]) => typeof nota === 'number')
      .map(([nome, nota]) => {
        const cor = nota >= 3 ? '#22C55E' : nota >= 2 ? '#EAB308' : '#EF4444';
        const pct = Math.min(((nota - 1) / 3) * 100, 100).toFixed(0);
        return `
          <div style="margin-bottom:6px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
              <span style="font-size:12px;color:var(--text);">${nome}</span>
              <span style="font-size:12px;font-weight:700;color:${cor};">${formatarNota(nota)}</span>
            </div>
            <div style="background:#e5e7eb;border-radius:100px;height:6px;overflow:hidden;">
              <div style="width:${pct}%;height:100%;background:${cor};border-radius:100px;"></div>
            </div>
          </div>`;
      }).join('');

    return `
      <div style="border:1.5px solid var(--border);border-radius:10px;padding:14px 16px;margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <div>
            <div style="font-size:13px;font-weight:700;color:var(--text);">
              <i class="fa-solid fa-star" style="color:#7C3AED;margin-right:6px;"></i>${av.campanha}
            </div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">Data: ${dataFormatada}</div>
          </div>
          <div style="background:#ede9fe;padding:4px 12px;border-radius:100px;font-size:12px;font-weight:700;color:#4C1D95;">
            Média: ${mediaFormatada}/4
          </div>
        </div>
        ${criteriosHtml || '<p style="font-size:12px;color:var(--text-muted);">Sem critérios registrados.</p>'}
      </div>`;
  }).join('');

  secao.innerHTML = `
    <div style="border-top:1.5px solid var(--border);padding-top:20px;margin-top:4px;">
      <h4 style="font-size:14px;font-weight:700;color:#4C1D95;margin:0 0 14px;display:flex;align-items:center;gap:8px;">
        <i class="fa-solid fa-list-check"></i> Detalhamento por avaliação recebida
      </h4>
      ${avaliacoesHtml}
    </div>`;

  // Insere no final do .nb-report-body (antes do rodapé que fica fora do body)
  const reportBody = document.querySelector('.nb-report-body');
  if (reportBody) {
    reportBody.appendChild(secao);
  } else {
    // Fallback: insere no #nb-report-content antes do último filho (rodapé)
    const content = document.getElementById('nb-report-content');
    if (content && content.lastElementChild) {
      content.insertBefore(secao, content.lastElementChild);
    }
  }
}

// Renderizar relatório consolidado
function renderReportConsolidated(data) {
  // Cabeçalho
  document.getElementById('nb-report-title').textContent = `Avaliação ${data.avaliacao.empresa} - #${data.avaliacao.codigo}`;
  document.getElementById('nb-report-subtitle').textContent = 'Detalhes consolidados da avaliação';
  
  // Card info geral (sem dados do colaborador individual)
  const card = document.getElementById('nb-report-card');
  card.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
      <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#10b981,#059669);display:flex;align-items:center;justify-content:center;color:white;font-size:18px;">
        <i class="fa-solid fa-users"></i>
      </div>
      <div style="flex:1;">
        <div style="font-size:16px;font-weight:600;color:var(--text);">Colaboradores Avaliados</div>
        <span style="display:inline-block;margin-top:4px;padding:2px 8px;background:#dbeafe;color:#1d4ed8;border-radius:100px;font-size:11px;font-weight:600;">Avaliação ${data.avaliacao.codigo}</span>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;">
      <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-muted);">
        <i class="fa-solid fa-user-tie" style="color:#10b981;width:20px;"></i>
        <span>Gestor: <strong style="color:var(--text);">${data.avaliacao.gestor}</strong></span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-muted);">
        <i class="fa-solid fa-users" style="color:#10b981;width:20px;"></i>
        <span>Total: <strong style="color:var(--text);">${data.avaliacao.totalRespondidos} de ${data.avaliacao.totalColaboradores}</strong></span>
      </div>
    </div>
  `;
  
  // Renderizar matriz (usando dados médios)
  const nivelDesempenho = classifyScore(data.notaDesempenhoMedia);
  const nivelPotencial = classifyScore(data.notaPotencialMedia);
  renderMatrix(nivelDesempenho, nivelPotencial);
  
  // Renderizar gráfico
  renderChart(data.competencias, 'Média por competência geral');
  
  // Chips (com "total")
  document.getElementById('nb-chip-performance-text').textContent = `Desempenho Médio total: ${formatarNota(data.notaDesempenhoMedia)}/4`;
  document.getElementById('nb-chip-potential-text').textContent = `Potencial Médio total: ${formatarNota(data.notaPotencialMedia)}/4`;
  
  // Perfil e Plano
  const quadrante = getQuadrante(data.codigoQuadranteGeral);
  document.getElementById('nb-report-perfil').textContent = quadrante.perfil;
  document.getElementById('nb-report-plano').textContent = quadrante.planoAcao;
  
  // Atualizar título da seção
  document.getElementById('nb-report-results-title').textContent = 'Resultados Total';
}

// Renderizar matriz 3x3 — usa nomenclatura oficial B/M/A
function renderMatrix(nivelDesempenho, nivelPotencial) {
  const matrix = document.getElementById('nb-report-matrix');
  matrix.innerHTML = '';

  // Ordem exibição: ALTO(topo)→BAIXO(base) no eixo Y (potencial)
  // Ordem exibição: BAIXO→MÉDIO→ALTO no eixo X (desempenho)
  const ordenacaoPotencial  = ['ALTO', 'MÉDIO', 'BAIXO'];
  const ordenacaoDesempenho = ['BAIXO', 'MÉDIO', 'ALTO'];

  ordenacaoPotencial.forEach(potencial => {
    ordenacaoDesempenho.forEach(desempenho => {
      // Encontra o código B/M/A correspondente
      const codigo = Object.keys(QUADRANTES).find(c =>
        QUADRANTES[c].potencial  === potencial &&
        QUADRANTES[c].desempenho === desempenho
      ) || 'M2';

      const q = QUADRANTES[codigo];
      const isDestacado = potencial === nivelPotencial && desempenho === nivelDesempenho;

      const cell = document.createElement('div');
      cell.style.cssText = `
        border-radius:10px;padding:10px;text-align:center;
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        transition:all 0.3s;
        background:linear-gradient(135deg,${q.cor}22,${q.cor}44);
        border:${isDestacado ? '3px solid #1d4ed8' : `2px solid ${q.cor}`};
        ${isDestacado ? 'transform:scale(1.08);box-shadow:0 6px 20px rgba(29,78,216,0.4);z-index:2;position:relative;' : ''}
      `;
      cell.innerHTML = `
        ${isDestacado
          ? `<i class="fa-solid fa-location-dot" style="color:#1d4ed8;font-size:20px;margin-bottom:3px;"></i>`
          : `<i class="fa-solid fa-circle" style="color:${q.cor};font-size:14px;margin-bottom:3px;opacity:0.6;"></i>`}
        <span style="font-size:11px;font-weight:700;color:${isDestacado ? '#1d4ed8' : q.cor};">${codigo}</span>
        <span style="font-size:9px;color:var(--text-muted);margin-top:2px;">${q.nome}</span>
      `;
      matrix.appendChild(cell);
    });
  });
}

// Renderizar gráfico de barras
function renderChart(competencias, titulo) {
  const chart = document.getElementById('nb-report-chart');
  chart.innerHTML = '';
  
  document.getElementById('nb-report-comp-title').textContent = titulo;
  
  if (!competencias || competencias.length === 0) {
    chart.innerHTML = '<p style="text-align:center;color:var(--text-muted);font-size:13px;">Nenhuma competência avaliada</p>';
    return;
  }
  
  competencias.forEach(comp => {
    const barraContainer = document.createElement('div');
    const nota = comp.nota != null ? comp.nota : comp.notaMedia;
    // Escala 1-4 (backend). Percentual relativo ao máximo 4.
    const percentual = Math.min(((nota - 1) / 3) * 100, 100);
    const percentualDisplay = Math.max(percentual, 0).toFixed(0);
    
    barraContainer.innerHTML = `
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <span style="font-size:12px;color:var(--text);font-weight:500;">${comp.nome}</span>
        <span style="font-size:12px;font-weight:600;color:var(--primary);">${formatarNota(nota)}<span style="font-size:10px;font-weight:400;color:var(--text-muted)">/4</span></span>
      </div>
      <div style="background:#e5e7eb;border-radius:100px;height:8px;overflow:hidden;">
        <div style="background:linear-gradient(90deg,var(--primary),var(--primary-light));height:100%;width:${percentualDisplay}%;border-radius:100px;transition:width 0.5s ease;"></div>
      </div>
    `;
    
    chart.appendChild(barraContainer);
  });
}

// Fechar modal
function closeNineBoxReportModal() {
  const modal = document.getElementById('nb-report-modal');
  modal.style.display = 'none';
  // Limpa detalhamento para evitar duplicação na próxima abertura
  const det = document.getElementById('nb-report-detalhamento');
  if (det) det.remove();
  currentReportData = null;
  currentType = null;
}

// Exportar para PDF
// Cria um container dedicado fora do overlay para captura limpa pelo html2canvas
async function exportNineBoxReportPDF() {
  const btn = document.getElementById('btn-export-pdf');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Gerando PDF...';
  btn.disabled = true;

  // Container dedicado para PDF — renderizado fora de qualquer overlay
  const pdfContainer = document.createElement('div');
  pdfContainer.id = 'relatorio-pdf-container';
  pdfContainer.style.cssText = [
    'position:fixed',
    'top:-9999px',
    'left:0',
    'width:794px',       // largura A4 a 96dpi
    'background:#ffffff',
    'font-family:Poppins,sans-serif',
    'color:#1e293b',
    'padding:32px',
    'box-sizing:border-box',
    'z-index:-1',
  ].join(';');

  try {
    if (!currentReportData) throw new Error('Nenhum dado de relatório carregado.');

    const data = currentReportData;
    const q    = getQuadrante(data.codigoQuadrante);
    const cor  = q.cor || '#7C3AED';

    // Formata nota com vírgula
    const fmt = n => (n != null && !isNaN(n)) ? Number(n).toFixed(2).replace('.', ',') : '—';

    // ─── Monta a mini-matriz para PDF ────────────────────────────────────────
    const ordemGrid = [
      ['B3','M3','A3'],  // pot ALTO
      ['B2','M2','A2'],  // pot MÉDIO
      ['B1','M1','A1'],  // pot BAIXO
    ];
    const NOMES_Q = {
      B1:'Insuficiente',B2:'Eficaz',B3:'Comprometido',
      M1:'Questionável',M2:'Mantenedor',M3:'Forte Desempenho',
      A1:'Enigma',A2:'Em crescimento',A3:'Destaque'
    };
    const CORES_Q = {
      B1:'#EF4444',B2:'#F97316',B3:'#F97316',
      M1:'#EAB308',M2:'#EAB308',M3:'#84CC16',
      A1:'#84CC16',A2:'#22C55E',A3:'#15803D'
    };
    const matrizHtml = ordemGrid.map(linha => `
      <div style="display:flex;gap:3px;margin-bottom:3px;">
        ${linha.map(cod => {
          const dest = cod === data.codigoQuadrante;
          const c    = CORES_Q[cod] || '#94a3b8';
          return `<div style="width:72px;height:48px;border-radius:6px;background:${dest ? c : c+'22'};border:${dest ? '2.5px solid '+c : '1px solid '+c+'55'};display:flex;flex-direction:column;align-items:center;justify-content:center;${dest ? 'box-shadow:0 0 0 3px '+c+'44;' : ''}">
            <span style="font-size:10px;font-weight:700;color:${dest ? '#fff' : c}">${cod}</span>
            <span style="font-size:7px;color:${dest ? '#fff' : c};opacity:${dest ? 1 : 0.75};text-align:center;line-height:1.2;padding:0 2px">${NOMES_Q[cod]}</span>
          </div>`;
        }).join('')}
      </div>`).join('');

    // ─── Competências ────────────────────────────────────────────────────────
    const compHtml = (data.competencias || []).map(c => {
      const nota = c.nota != null ? c.nota : c.notaMedia;
      const pct  = Math.min(Math.max(((nota - 1) / 3) * 100, 0), 100).toFixed(0);
      const cor2 = nota >= 3 ? '#22C55E' : nota >= 2 ? '#EAB308' : '#EF4444';
      return `
        <div style="margin-bottom:8px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
            <span style="font-size:12px;color:#1e293b;">${c.nome}</span>
            <span style="font-size:12px;font-weight:700;color:${cor2};">${fmt(nota)}</span>
          </div>
          <div style="background:#e2e8f0;border-radius:100px;height:7px;overflow:hidden;">
            <div style="width:${pct}%;height:100%;background:${cor2};border-radius:100px;"></div>
          </div>
        </div>`;
    }).join('') || '<p style="font-size:12px;color:#64748b;">Nenhuma competência registrada.</p>';

    // ─── Detalhamento de avaliações ───────────────────────────────────────────
    const detHtml = (data.detalhamentoAvaliacoes || []).map(av => {
      const dataAv = av.data ? new Date(av.data).toLocaleDateString('pt-BR') : '—';
      const crits  = Object.entries(av.criterios || {})
        .filter(([, v]) => typeof v === 'number')
        .map(([nome, nota]) => `
          <div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #f1f5f9;">
            <span style="font-size:11px;color:#475569;">${nome}</span>
            <span style="font-size:11px;font-weight:700;color:#334155;">${Number(nota).toFixed(2)}</span>
          </div>`).join('');
      return `
        <div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin-bottom:8px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <div>
              <div style="font-size:12px;font-weight:700;color:#1e293b;">${av.campanha}</div>
              <div style="font-size:10px;color:#64748b;">Data: ${dataAv}</div>
            </div>
            <div style="background:#ede9fe;padding:2px 10px;border-radius:100px;font-size:11px;font-weight:700;color:#4C1D95;">
              Média: ${av.media != null ? fmt(av.media) : '—'}/4
            </div>
          </div>
          ${crits || '<p style="font-size:11px;color:#94a3b8;">Sem critérios.</p>'}
        </div>`;
    }).join('') || '';

    // ─── Monta o HTML do PDF ──────────────────────────────────────────────────
    pdfContainer.innerHTML = `
      <!-- CABEÇALHO -->
      <div style="background:linear-gradient(135deg,#4C1D95,#7C3AED);color:white;padding:24px 28px;border-radius:10px;margin-bottom:20px;">
        <div style="font-size:10px;font-weight:600;opacity:.7;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Relatório Individual — Nine Box</div>
        <div style="font-size:22px;font-weight:700;margin-bottom:4px;">${data.colaborador.nome}</div>
        <div style="font-size:13px;opacity:.85;">${data.colaborador.cargo} · ${data.colaborador.departamento}</div>
        <div style="font-size:12px;opacity:.7;margin-top:4px;">Campanha: ${data.avaliacao?.campanha || 'N/A'}</div>
      </div>

      <!-- RESULTADO NINE BOX -->
      <div style="display:flex;gap:20px;margin-bottom:20px;flex-wrap:wrap;">
        <!-- Chips -->
        <div style="flex:1;min-width:180px;display:flex;flex-direction:column;gap:8px;">
          <div style="background:#dbeafe;border-radius:8px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:11px;font-weight:600;color:#1e40af;text-transform:uppercase;">Desempenho</span>
            <span style="font-size:20px;font-weight:700;color:#1e40af;">${fmt(data.notaDesempenho)}<span style="font-size:11px;font-weight:400;">/4</span></span>
          </div>
          <div style="background:#dcfce7;border-radius:8px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:11px;font-weight:600;color:#166534;text-transform:uppercase;">Potencial</span>
            <span style="font-size:20px;font-weight:700;color:#166534;">${fmt(data.notaPotencial)}<span style="font-size:11px;font-weight:400;">/4</span></span>
          </div>
          <div style="background:${cor}22;border:1.5px solid ${cor}66;border-radius:8px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:11px;font-weight:600;color:${cor};text-transform:uppercase;">Quadrante</span>
            <span style="font-size:18px;font-weight:700;color:${cor};">${data.codigoQuadrante} — ${data.nomeQuadrante}</span>
          </div>
        </div>
        <!-- Matriz -->
        <div style="flex:0 0 auto;">
          <div style="font-size:11px;font-weight:700;color:#4C1D95;margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px;">Posição na Matriz</div>
          <div style="display:flex;align-items:flex-start;gap:4px;">
            <div style="writing-mode:vertical-rl;transform:rotate(180deg);font-size:9px;font-weight:600;color:#64748b;letter-spacing:.5px;margin-top:8px;">← POTENCIAL</div>
            <div>
              <div style="display:flex;gap:3px;margin-bottom:2px;">
                ${['Baixo','Médio','Alto'].map(l => `<div style="width:72px;text-align:center;font-size:8px;color:#64748b;font-weight:600;">${l}</div>`).join('')}
              </div>
              ${matrizHtml}
              <div style="text-align:center;font-size:8px;color:#64748b;font-weight:600;margin-top:2px;">DESEMPENHO →</div>
            </div>
          </div>
        </div>
      </div>

      <!-- COMPETÊNCIAS -->
      <div style="margin-bottom:20px;">
        <div style="font-size:12px;font-weight:700;color:#4C1D95;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #ede9fe;">
          Média por Competência
        </div>
        ${compHtml}
      </div>

      ${detHtml ? `
      <!-- DETALHAMENTO -->
      <div style="margin-bottom:20px;">
        <div style="font-size:12px;font-weight:700;color:#4C1D95;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #ede9fe;">
          Detalhamento das Avaliações Recebidas
        </div>
        ${detHtml}
      </div>` : ''}

      <!-- PERFIL E PLANO -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
        <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:14px;border-radius:0 8px 8px 0;">
          <div style="font-size:11px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;">Perfil</div>
          <div style="font-size:12px;color:#78350f;line-height:1.5;">${q.perfil}</div>
        </div>
        <div style="background:#ecfdf5;border-left:4px solid #10b981;padding:14px;border-radius:0 8px 8px 0;">
          <div style="font-size:11px;font-weight:700;color:#065f46;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;">Plano de Ação</div>
          <div style="font-size:12px;color:#064e3b;line-height:1.5;">${q.planoAcao}</div>
        </div>
      </div>

      <!-- RODAPÉ -->
      <div style="border-top:1px solid #e2e8f0;padding-top:10px;text-align:center;">
        <span style="font-size:10px;color:#94a3b8;">Portal de Gestão de Pessoas · Relatório gerado em ${new Date().toLocaleDateString('pt-BR')}</span>
      </div>
    `;

    document.body.appendChild(pdfContainer);

    // Aguarda libs
    let t = 0;
    while ((!window.html2canvas || !window.jspdf) && t < 15) {
      await new Promise(r => setTimeout(r, 300)); t++;
    }
    if (!window.html2canvas || !window.jspdf) {
      throw new Error('Bibliotecas html2canvas/jsPDF não carregadas. Verifique se os scripts estão incluídos na página HTML.');
    }

    await new Promise(r => setTimeout(r, 60));

    const canvas = await html2canvas(pdfContainer, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth:  pdfContainer.scrollWidth,
      windowHeight: pdfContainer.scrollHeight,
    });

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const imgData    = canvas.toDataURL('image/png');
    const pdfWidth   = pdf.internal.pageSize.getWidth();
    const pdfHeight  = (canvas.height * pdfWidth) / canvas.width;
    const pageHeight = pdf.internal.pageSize.getHeight();

    let y = 0;
    while (y < pdfHeight) {
      if (y > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, -y, pdfWidth, pdfHeight);
      y += pageHeight;
    }

    const nomeColaborador = (currentReportData?.colaborador?.nome || 'relatorio')
      .replace(/\s+/g, '-').toLowerCase();
    pdf.save(`relatorio-ninebox-${nomeColaborador}.pdf`);
    showToastMsg('PDF exportado com sucesso!', 'success');

  } catch (error) {
    console.error('[PDF]', error);
    showToastMsg('Erro ao exportar PDF: ' + error.message, 'error');
  } finally {
    // Remove o container temporário
    const el = document.getElementById('relatorio-pdf-container');
    if (el) el.remove();
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// Helper: Formatar nota com vírgula decimal
function formatarNota(nota) {
  if (nota == null || isNaN(nota)) return '—';
  return Number(nota).toFixed(2).replace('.', ',');
}

// Helper: Classificar nota em BAIXO/MÉDIO/ALTO — espelha exatamente o backend
// Faixas: BAIXO=1–1.99, MÉDIO=2–2.99, ALTO=3–4
function classifyScore(score) {
  if (score === null || score === undefined || isNaN(score)) return 'MÉDIO';
  if (score >= 1 && score <= 1.99) return 'BAIXO';
  if (score >= 2 && score <= 2.99) return 'MÉDIO';
  if (score >= 3 && score <= 4)    return 'ALTO';
  return 'MÉDIO'; // fallback seguro
}

// Helper: Mostrar toast (compatível com módulo e script normal)
function showToastMsg(msg, type = 'error') {
  // Tentar usar a função global showToast se disponível
  if (typeof window.showToast === 'function') {
    window.showToast(msg, type);
    return;
  }
  if (type === 'error') {
    console.error('[NineBox Report]', msg);
  }
  // Criar toast manual se não existir função global
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed;bottom:24px;right:24px;z-index:9999;
    padding:12px 20px;border-radius:8px;font-size:14px;font-weight:600;
    color:white;box-shadow:0 4px 16px rgba(0,0,0,0.2);
    background:${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#ef4444'};
    animation:slideUp 0.3s ease;
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Helper: Obter URL base da API (lê do mesmo config.js do projeto)
function getApiBaseUrl() {
  // Tenta usar o CONFIG global se disponível (importado pelo módulo ES da página)
  if (typeof window.__API_BASE_URL !== 'undefined') return window.__API_BASE_URL;
  // Fallback: detecta igual ao config.js
  const isLocalDev = (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) && window.location.port !== '3000';
  return isLocalDev ? 'http://localhost:3000/api' : '/api';
}

// Helper: Obter headers de autenticação
function getAuthHeaders() {
  // Chave do token conforme config.js: CONFIG.TOKEN_KEY = 'portal_token'
  const token = localStorage.getItem('portal_token') || localStorage.getItem('token') || '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// Inicializar automaticamente quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initNineBoxReportModal);

// Exportar funções para uso global — inclui as usadas em onclick= inline do HTML do modal
window.closeNineBoxReportModal = closeNineBoxReportModal;
window.exportNineBoxReportPDF  = exportNineBoxReportPDF;

window.NineBoxReportModal = {
  init: initNineBoxReportModal,
  openIndividual: openNineBoxReportIndividual,
  openConsolidated: openNineBoxReportConsolidated,
  close: closeNineBoxReportModal,
  exportPDF: exportNineBoxReportPDF
};