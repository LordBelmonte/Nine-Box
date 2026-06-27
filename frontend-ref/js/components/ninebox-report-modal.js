// Componente: Modal de Relatório Nine Box
// Inclui variantes Individual e Consolidado, com exportação PDF

// Fonte única dos quadrantes (conforme NINEBOX-FONTE-UNICA-QUADRANTES.md)
const QUADRANTES = {
  'Q1': {
    nome: 'Insuficiente',
    potencial: 'BAIXO',
    desempenho: 'BAIXO',
    perfil: 'Potencial baixo e desempenho abaixo do esperado',
    planoAcao: 'Identificar obstáculos que poderiam justificar o baixo desempenho e ajudá-lo a removê-los ou encontrar outro cargo interno no qual suas habilidades serão melhor utilizadas. Se não houver melhorias, recomenda-se o desligamento da empresa.',
    cor: '#EF4444'
  },
  'Q2': {
    nome: 'Questionável',
    potencial: 'BAIXO',
    desempenho: 'MÉDIO',
    perfil: 'Potencial baixo e desempenho dentro do esperado',
    planoAcao: 'Dar feedback, treiná-los para se tornarem mais inovadores, identificar áreas específicas de melhoria e definir um plano de desenvolvimento pessoal, com o objetivo de conduzi-lo à categoria de alto desempenho.',
    cor: '#F97316'
  },
  'Q3': {
    nome: 'Eficaz',
    potencial: 'BAIXO',
    desempenho: 'ALTO',
    perfil: 'Potencial baixo e desempenho acima do esperado',
    planoAcao: 'Apesar do bom desempenho, da mentalidade de trabalho certa e da sua dedicação, esses profissionais não têm muito potencial ou ambição de crescimento. O ideal é mantê-los felizes e recompensá-los com aumentos e bônus.',
    cor: '#F97316'
  },
  'Q4': {
    nome: 'Dilema',
    potencial: 'MÉDIO',
    desempenho: 'BAIXO',
    perfil: 'Potencial mediano e desempenho abaixo do esperado',
    planoAcao: 'Identificar bloqueios para performance — motivos pessoais, dificuldades com a cultura organizacional, falhas no onboarding... Comunique claramente o que se espera do profissional e proporcione um programa de mentoria interno, motivação e oportunidades de desenvolvimento.',
    cor: '#EAB308'
  },
  'Q5': {
    nome: 'Mantenedor',
    potencial: 'MÉDIO',
    desempenho: 'MÉDIO',
    perfil: 'Potencial e desempenho em nível mediano',
    planoAcao: 'Invista nesses profissionais chaves para a organização, ao oferecer novos projetos e tarefas que os mantenham engajados, e comece a prepará-los para oportunidades futuras, treinando-os em gestão de pessoas.',
    cor: '#EAB308'
  },
  'Q6': {
    nome: 'Especialista',
    potencial: 'MÉDIO',
    desempenho: 'ALTO',
    perfil: 'Potencial mediano e desempenho acima do esperado',
    planoAcao: 'Entenda primeiramente se eles estão prontos para o crescimento e mais responsabilidades ou se precisam de mais tempo para se desenvolverem. Trabalhe suas habilidades de pensamento tático e estratégico, que serão úteis para seu futuro na organização.',
    cor: '#84CC16'
  },
  'Q7': {
    nome: 'Forte Candidato',
    potencial: 'ALTO',
    desempenho: 'BAIXO',
    perfil: 'Alto potencial e desempenho abaixo do esperado',
    planoAcao: 'Mesmo que tenham muito potencial, esses profissionais não estão entregando o que se espera deles, seja porque não têm a experiência necessária ou pela falta de compatibilidade com a função atual. Dê a esses profissionais tempo para ganhar experiência e feedback contínuo para construir confiança.',
    cor: '#84CC16'
  },
  'Q8': {
    nome: 'Alto Desempenho',
    potencial: 'ALTO',
    desempenho: 'MÉDIO',
    perfil: 'Alto potencial e desempenho dentro do esperado',
    planoAcao: 'Proporcione mais exposição para que alcancem maior desempenho, através de oportunidades de treinamento, projetos desafiadores e monitoramento de progresso com KPIs claras.',
    cor: '#22C55E'
  },
  'Q9': {
    nome: 'Estrela',
    potencial: 'ALTO',
    desempenho: 'ALTO',
    perfil: 'Alto potencial e desempenho acima do esperado',
    planoAcao: 'Profissional que já se desenvolveu completamente dentro da sua função e está pronto para uma promoção e novas responsabilidades; é uma boa referência para os demais colaboradores da empresa pela sua capacidade de resolução de problemas, pensamento estratégico e motivação pessoal.',
    cor: '#15803D'
  }
};

// Matriz de posição no grid (para destacar a célula correta)
const MATRIZ_POSICAO = {
  'BAIXO-BAIXO': { row: 3, col: 1 },    // Q1
  'MÉDIO-BAIXO': { row: 3, col: 2 },    // Q2
  'ALTO-BAIXO': { row: 3, col: 3 },     // Q3
  'BAIXO-MÉDIO': { row: 2, col: 1 },    // Q4
  'MÉDIO-MÉDIO': { row: 2, col: 2 },    // Q5
  'ALTO-MÉDIO': { row: 2, col: 3 },     // Q6
  'BAIXO-ALTO': { row: 1, col: 1 },     // Q7
  'MÉDIO-ALTO': { row: 1, col: 2 },     // Q8
  'ALTO-ALTO': { row: 1, col: 3 }       // Q9
};

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
  document.getElementById('nb-report-title').textContent = `Avaliação ${data.avaliacao.empresa} - #${data.avaliacao.codigo}`;
  document.getElementById('nb-report-subtitle').textContent = 'Detalhes da avaliação do gestor e relação dos colaboradores';
  
  // Card do colaborador
  const card = document.getElementById('nb-report-card');
  card.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
      <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--primary-light));display:flex;align-items:center;justify-content:center;color:white;font-size:18px;font-weight:700;">
        <i class="fa-solid fa-user"></i>
      </div>
      <div style="flex:1;">
        <div style="font-size:16px;font-weight:600;color:var(--text);">Colaborador avaliado: ${data.colaborador.nome}</div>
        <span style="display:inline-block;margin-top:4px;padding:2px 8px;background:#dbeafe;color:#1d4ed8;border-radius:100px;font-size:11px;font-weight:600;">Avaliação ${data.avaliacao.codigo}</span>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;">
      <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-muted);">
        <i class="fa-solid fa-building" style="color:var(--primary);width:20px;"></i>
        <span>Empresa: <strong style="color:var(--text);">${data.colaborador.empresa}</strong></span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-muted);">
        <i class="fa-solid fa-sitemap" style="color:var(--primary);width:20px;"></i>
        <span>Setor: <strong style="color:var(--text);">${data.colaborador.setor}</strong></span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-muted);">
        <i class="fa-solid fa-briefcase" style="color:var(--primary);width:20px;"></i>
        <span>Cargo: <strong style="color:var(--text);">${data.colaborador.cargo}</strong></span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-muted);">
        <i class="fa-solid fa-circle-check" style="color:var(--primary);width:20px;"></i>
        <span>Status: <strong style="color:var(--success);">${data.colaborador.statusAvaliacao}</strong></span>
      </div>
    </div>
  `;
  
  // Renderizar matriz
  renderMatrix(data.nivelDesempenho, data.nivelPotencial);
  
  // Renderizar gráfico
  renderChart(data.competencias, 'Média por competência');
  
  // Chips
  document.getElementById('nb-chip-performance-text').textContent = `Desempenho Médio: ${formatarNota(data.notaDesempenho)}`;
  document.getElementById('nb-chip-potential-text').textContent = `Potencial Médio: ${formatarNota(data.notaPotencial)}`;
  
  // Perfil e Plano
  const quadrante = QUADRANTES[data.codigoQuadrante] || QUADRANTES['Q5'];
  document.getElementById('nb-report-perfil').textContent = quadrante.perfil;
  document.getElementById('nb-report-plano').textContent = quadrante.planoAcao;
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
  document.getElementById('nb-chip-performance-text').textContent = `Desempenho Médio total: ${formatarNota(data.notaDesempenhoMedia)}`;
  document.getElementById('nb-chip-potential-text').textContent = `Potencial Médio total: ${formatarNota(data.notaPotencialMedia)}`;
  
  // Perfil e Plano
  const quadrante = QUADRANTES[data.codigoQuadranteGeral] || QUADRANTES['Q5'];
  document.getElementById('nb-report-perfil').textContent = quadrante.perfil;
  document.getElementById('nb-report-plano').textContent = quadrante.planoAcao;
  
  // Atualizar título da seção
  document.getElementById('nb-report-results-title').textContent = 'Resultados Total';
}

// Renderizar matriz 3x3
function renderMatrix(nivelDesempenho, nivelPotencial) {
  const matrix = document.getElementById('nb-report-matrix');
  matrix.innerHTML = '';
  
  // Ordem: ALTO (topo) → BAIXO (base)
  const ordenacaoPotencial = ['ALTO', 'MÉDIO', 'BAIXO'];
  const ordenacaoDesempenho = ['BAIXO', 'MÉDIO', 'ALTO'];
  
  // Criar células
  ordenacaoPotencial.forEach((potencial, rowIndex) => {
    ordenacaoDesempenho.forEach((desempenho, colIndex) => {
      const chave = `${potencial}-${desempenho}`;
      const codigo = Object.keys(QUADRANTES).find(q => 
        QUADRANTES[q].potencial === potencial && 
        QUADRANTES[q].desempenho === desempenho
      );
      
      const quadrante = QUADRANTES[codigo];
      const isDestacado = potencial === nivelPotencial && desempenho === nivelDesempenho;
      
      const cell = document.createElement('div');
      const destaqueCss = isDestacado
        ? 'border: 3px solid #1d4ed8 !important; transform: scale(1.08); box-shadow: 0 6px 20px rgba(29,78,216,0.4); z-index: 2; position: relative;'
        : '';
      cell.style.cssText = `
        border-radius: 12px;
        padding: 12px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;
        background: linear-gradient(135deg, ${quadrante.cor}20 0%, ${quadrante.cor}40 100%);
        border: 2px solid ${quadrante.cor};
        ${destaqueCss}
      `;
      
      const estrelaIcon = isDestacado
        ? `<i class="fa-solid fa-location-dot" style="color:#1d4ed8;font-size:22px;margin-bottom:4px;"></i>`
        : `<i class="fa-solid fa-star" style="color:${quadrante.cor};font-size:18px;margin-bottom:4px;opacity:0.7;"></i>`;
      
      cell.innerHTML = `
        ${estrelaIcon}
        <span style="font-size:11px;font-weight:700;color:${isDestacado ? '#1d4ed8' : quadrante.cor};">${codigo}</span>
        <span style="font-size:9px;color:var(--text-muted);margin-top:2px;">${quadrante.nome}</span>
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
        <span style="font-size:12px;font-weight:600;color:var(--primary);">${formatarNota(nota)}</span>
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
  currentReportData = null;
  currentType = null;
}

// Exportar para PDF
async function exportNineBoxReportPDF() {
  const btn = document.getElementById('btn-export-pdf');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Gerando PDF...';
  btn.disabled = true;
  
  try {
    // Verificar se html2canvas e jsPDF estão disponíveis
    if (typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
      throw new Error('Bibliotecas html2canvas/jsPDF não carregadas. Adicione ao HTML: <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>');
    }
    
    const content = document.getElementById('nb-report-modal-content');
    
    // Capturar como canvas
    const canvas = await html2canvas(content, {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    // Criar PDF
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // Nome do arquivo
    const nomeArquivo = currentType === 'individual' 
      ? `relatorio-ninebox-${currentReportData?.colaborador?.nome?.replace(/\s+/g, '-').toLowerCase() || 'individual'}-${Date.now()}.pdf`
      : `relatorio-ninebox-consolidado-${Date.now()}.pdf`;
    
    pdf.save(nomeArquivo);
    
    showToastMsg('PDF exportado com sucesso!', 'success');
    
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    showToastMsg('Erro ao exportar PDF: ' + error.message, 'error');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// Helper: Formatar nota com vírgula decimal
function formatarNota(nota) {
  if (nota == null || isNaN(nota)) return '—';
  return Number(nota).toFixed(2).replace('.', ',');
}

// Helper: Classificar nota em BAIXO/MÉDIO/ALTO (espelha o backend — escala 1-4)
function classifyScore(score) {
  if (score >= 1 && score <= 1.5) return 'BAIXO';
  if (score >= 1.6 && score <= 2.5) return 'MÉDIO';
  if (score >= 2.6) return 'ALTO';
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

// Exportar funções para uso global
window.NineBoxReportModal = {
  init: initNineBoxReportModal,
  openIndividual: openNineBoxReportIndividual,
  openConsolidated: openNineBoxReportConsolidated,
  close: closeNineBoxReportModal,
  exportPDF: exportNineBoxReportPDF
};