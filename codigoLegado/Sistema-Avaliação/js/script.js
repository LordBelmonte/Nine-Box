// --- BANCO DE DADOS---
const MOCK_DATABASE = [
    {
        id: 1,
        title: "Autoavaliação Semestral TI",
        type: "auto",
        icon: "fa-laptop-code",
        date: "15/10/2023",
        description: "Focada em hard skills e prazos.",
        questions: ["Qualidade do código?", "Cumpriu prazos?", "Ajudou a equipe?"]
    },
    {
        id: 2,
        title: "Avaliação de Liderança (Gestor)",
        type: "gestor",
        icon: "fa-users-viewfinder",
        date: "20/11/2023",
        description: "Focada em gestão de pessoas e conflitos.",
        questions: ["O colaborador aceita feedbacks?", "Atingiu metas?", "Tem iniciativa?"]
    },
    {
        id: 3,
        title: "Autoavaliação Soft Skills",
        type: "auto",
        icon: "fa-heart-pulse",
        date: "05/01/2024",
        description: "Comportamental padrão.",
        questions: ["Comunicação?", "Pontualidade?", "Resiliência?"]
    }
];

// Variáveis de Estado
let selectedModelId = null;
let currentFilter = 'all';

// Referências DOM
const gridContainer = document.getElementById('models-grid');
const selectionView = document.getElementById('selection-view');
const editorView = document.getElementById('editor-view');
const confirmationModal = document.getElementById('confirmation-modal');

// --- INICIALIZAÇÃO ---
function init() {
    renderModels();
}

// --- LÓGICA DE FILTRO ---
function setFilter(type) {
    currentFilter = type;
    selectedModelId = null;
    updateFilterButtons();
    renderModels();
}

function updateFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.className = "filter-btn px-4 py-2 rounded-full text-gray-500 hover:bg-gray-100 font-medium text-sm transition-colors";
    });
    const activeBtn = document.getElementById(`filter-${currentFilter}`);
    if (activeBtn) activeBtn.className = "filter-btn px-4 py-2 rounded-full bg-blue-100 text-blue-900 font-bold text-sm transition-colors shadow-sm";
}

// --- ALGORITMO PASSO 1: LISTAR AVALIAÇÕES ---
function renderModels() {
    gridContainer.innerHTML = '';
    const filteredModels = MOCK_DATABASE.filter(model => currentFilter === 'all' ? true : model.type === currentFilter);

    if (filteredModels.length === 0) {
        gridContainer.innerHTML = `<div class="col-span-full text-center py-12 text-gray-400"><p>Nenhum modelo encontrado.</p></div>`;
        return;
    }
    
    filteredModels.forEach(model => {
        const card = document.createElement('div');
        const isSelected = model.id === selectedModelId ? 'selected' : '';
        
        card.className = `model-card bg-white rounded-xl p-6 cursor-pointer flex flex-col gap-4 relative ${isSelected}`;
        card.dataset.id = model.id;
        card.onclick = () => selectCard(model.id);

        card.innerHTML = `
            <div class="flex items-start justify-between">
                <div class="w-12 h-12 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center text-xl">
                    <i class="fa-solid ${model.icon}"></i>
                </div>
                <span class="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">${model.type === 'auto' ? 'Individual' : 'Gestor'}</span>
            </div>
            <div>
                <h3 class="font-bold text-lg text-gray-800 leading-tight mb-1">${model.title}</h3>
                <p class="text-xs text-gray-400 mb-2">Criado a: ${model.date}</p>
                <p class="text-sm text-gray-500 line-clamp-2">${model.description}</p>
            </div>
        `;
        gridContainer.appendChild(card);
    });
}

// --- ALGORITMO PASSO 2: SELEÇÃO ---
function selectCard(id) {
    selectedModelId = id;
    // Re-renderiza apenas visualmente para aplicar classe .selected
    document.querySelectorAll('.model-card').forEach(card => {
        if (parseInt(card.dataset.id) === id) card.classList.add('selected');
        else card.classList.remove('selected');
    });
}

// --- ALGORITMO PASSO 3: CONFIRMAÇÃO ---
function handleProceed() {
    if (!selectedModelId) {
        alert("Selecione um modelo primeiro.");
        return;
    }
    const model = MOCK_DATABASE.find(m => m.id === selectedModelId);
    document.getElementById('modal-model-name').innerText = model.title;
    confirmationModal.classList.remove('hidden');
}

function closeModal() {
    confirmationModal.classList.add('hidden');
}

function confirmSelection() {
    // 1. Checa ID e Busca no Banco
    const modelData = MOCK_DATABASE.find(m => m.id === selectedModelId);

    if (modelData) {
        // 2. Armazena na Session Storage (Simulando Backend)
        sessionStorage.setItem('currentEvaluationModel', JSON.stringify(modelData));
        
        closeModal();
        switchView('editor');
        
        // 3. Insere informações nos campos
        populateEditorForm();
    }
}

function goBackToSelection() {
    switchView('selection');
}

// Lógica de UI (Transição)
function switchView(targetView) {
    const showEl = targetView === 'editor' ? editorView : selectionView;
    const hideEl = targetView === 'editor' ? selectionView : editorView;

    hideEl.classList.remove('visible');
    setTimeout(() => {
        hideEl.classList.remove('display-block');
        showEl.classList.add('display-block');
        setTimeout(() => showEl.classList.add('visible'), 50);
    }, 400);
}

// --- ALGORITMO PASSO 4: PREENCHIMENTO AUTOMÁTICO ---
function populateEditorForm() {
    // Pega da "Sessão"
    const storedData = sessionStorage.getItem('currentEvaluationModel');
    
    if (storedData) {
        const data = JSON.parse(storedData);

        // Preenche Campos Comuns
        document.getElementById('form-title').value = data.title + " (Nova)";
        document.getElementById('form-type').value = data.type;
        document.getElementById('form-desc').value = data.description;

        // LÓGICA GESTOR: Mostra ou esconde a área específica
        const gestorArea = document.getElementById('gestor-area');
        if (data.type === 'gestor') {
            gestorArea.classList.remove('hidden');
        } else {
            gestorArea.classList.add('hidden');
        }

        // Preenche Perguntas
        const container = document.getElementById('questions-container');
        container.innerHTML = ''; 
        data.questions.forEach((q, index) => {
            const qDiv = document.createElement('div');
            qDiv.className = "flex gap-3 items-center";
            qDiv.innerHTML = `
                <span class="font-bold text-gray-400 w-6">${index + 1}.</span>
                <input type="text" value="${q}" class="flex-grow p-3 bg-white border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-gray-700">
            `;
            container.appendChild(qDiv);
        });
    }
}

function handleSave() {
    const type = document.getElementById('form-type').value;
    let msg = 'Avaliação criada com sucesso!';
    if(type === 'gestor') msg += '\n(Dados do colaborador incluídos)';
    alert(msg);
    goBackToSelection();
}

init();