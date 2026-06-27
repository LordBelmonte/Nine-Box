# Spec: Modal de Relatório Nine Box (Individual + Consolidado)

**Data:** 26 de junho de 2026  
**Status:** Aprovado → Em Desenvolvimento

---

## 1. Visão Geral

### 1.1 Objetivo
Criar um modal na tela de relatório/resultados do Nine Box v2 que reproduz fielmente o relatório existente do sistema "avaliação-gestor". O modal deve ter duas variantes:
- **Individual**: resultado de 1 colaborador
- **Consolidado**: resultado agregado de todos os colaboradores da avaliação

### 1.2 Fonte Única dos Quadrantes
**IMPORTANTE:** Os 9 quadrantes (nomes, perfil, plano de ação) são os mesmos do grid principal do Nine Box v2. Usar `NINEBOX-FONTE-UNICA-QUADRANTES.md` como referência.

### 1.3 Escopo
- Novo modal acionado a partir da tela de listagem de colaboradores avaliados
- Exportação para PDF com layout preservado
- Correção do bug do backend (6 combinações mapeadas incorretamente)

---

## 2. Tabela dos 9 Quadrantes (Fonte Única)

| Potencial | Desempenho | Código | Nome do quadrante | Perfil | Plano de ação |
|-----------|------------|--------|-------------------|--------|---------------|
| Baixo | Baixo | Q1 | Insuficiente | Potencial baixo e desempenho abaixo do esperado | Identificar obstáculos que poderiam justificar o baixo desempenho e ajudá-lo a removê-los ou encontrar outro cargo interno no qual suas habilidades serão melhor utilizadas. Se não houver melhorias, recomenda-se o desligamento da empresa. |
| Baixo | Médio | Q2 | Questionável | Potencial baixo e desempenho dentro do esperado | Dar feedback, treiná-los para se tornarem mais inovadores, identificar áreas específicas de melhoria e definir um plano de desenvolvimento pessoal, com o objetivo de conduzi-lo à categoria de alto desempenho. |
| Baixo | Alto | Q3 | Eficaz | Potencial baixo e desempenho acima do esperado | Apesar do bom desempenho, da mentalidade de trabalho certa e da sua dedicação, esses profissionais não têm muito potencial ou ambição de crescimento. O ideal é mantê-los felizes e recompensá-los com aumentos e bônus. |
| Médio | Baixo | Q4 | Dilema | Potencial mediano e desempenho abaixo do esperado | Identificar bloqueios para performance — motivos pessoais, dificuldades com a cultura organizacional, falhas no onboarding... Comunique claramente o que se espera do profissional e proporcione um programa de mentoria interno, motivação e oportunidades de desenvolvimento. |
| Médio | Médio | Q5 | Mantenedor | Potencial e desempenho em nível mediano | Invista nesses profissionais chaves para a organização, ao oferecer novos projetos e tarefas que os mantenham engajados, e comece a prepará-los para oportunidades futuras, treinando-os em gestão de pessoas. |
| Médio | Alto | Q6 | Especialista | Potencial mediano e desempenho acima do esperado | Entenda primeiramente se eles estão prontos para o crescimento e mais responsabilidades ou se precisam de mais tempo para se desenvolverem. Trabalhe suas habilidades de pensamento tático e estratégico, que serão úteis para seu futuro na organização. |
| Alto | Baixo | Q7 | Forte Candidato | Alto potencial e desempenho abaixo do esperado | Mesmo que tenham muito potencial, esses profissionais não estão entregando o que se espera deles, seja porque não têm a experiência necessária ou pela falta de compatibilidade com a função atual. Dê a esses profissionais tempo para ganhar experiência e feedback contínuo para construir confiança. |
| Alto | Médio | Q8 | Alto Desempenho | Alto potencial e desempenho dentro do esperado | Proporcione mais exposição para que alcancem maior desempenho, através de oportunidades de treinamento, projetos desafiadores e monitoramento de progresso com KPIs claras. |
| Alto | Alto | Q9 | Estrela | Alto potencial e desempenho acima do esperado | Profissional que já se desenvolveu completamente dentro da sua função e está pronto para uma promoção e novas responsabilidades; é uma boa referência para os demais colaboradores da empresa pela sua capacidade de resolução de problemas, pensamento estratégico e motivação pessoal. |

### 2.1 Cores dos Quadrantes (Heat-map diagonal)

| Código | Nome | Cor Sugerida (Hex) |
|--------|------|-------------------|
| Q1 | Insuficiente | Vermelho #EF4444 |
| Q2 | Questionável | Laranja #F97316 |
| Q3 | Eficaz | Laranja #F97316 |
| Q4 | Dilema | Ambar/Âmbar #EAB308 |
| Q5 | Mantenedor | Ambar/Âmbar #EAB308 |
| Q6 | Especialista | Verde Claro #84CC16 |
| Q7 | Forte Candidato | Verde Claro #84CC16 |
| Q8 | Alto Desempenho | Verde #22C55E |
| Q9 | Estrela | Verde Escuro #15803D |

---

## 3. Estrutura Visual - Variante Individual

### 3.1 Cabeçalho
- Barra completa, fundo indigo/roxo escuro (#4C1D95), texto branco
- Título: `Avaliação [Nome da Empresa] - #[código da avaliação]`
- Subtítulo pequeno: "Detalhes da avaliação do gestor e relação dos colaboradores"
- Ícone/logo no canto superior direito

### 3.2 Card do Colaborador
- Ícone de pessoa + texto: "Colaborador avaliado: [Nome]"
- Badge no canto direito: "Avaliação [N]"
- Grade 2×2 abaixo com:
  - Empresa: [Nome]
  - Setor: [Nome]
  - Cargo: [Nome]
  - Status avaliação: "Respondida" / "Pendente"

### 3.3 Seção "Resultados"
- Título centralizado, cor roxa
- **Matriz Nine Box**: Grid 3×3
  - Eixo Y (vertical): "POTENCIAL" (rótulos Baixo/Médio/Alto, de baixo pra cima)
  - Eixo X (horizontal): "DESEMPENHO" (rótulos Baixo/Médio/Alto, esquerda pra direita)
  - Cada célula com cor própria (ver seção 2.1)
  - Célula do colaborador destacado (borda mais grossa ou marcador)

### 3.4 Gráfico de Competências
- **Média por competência**: Barras horizontais
- Uma barra por competência avaliada
- Escala de 0 a 5
- Legenda com nome da competência + nota

### 3.5 Chips de Estatística
- Dois chips lado a lado com ícone:
  - "Desempenho Médio: X,XX" (formatação brasileira, vírgula decimal)
  - "Potencial Médio: X,XX"

### 3.6 Bloco Perfil
- Ícone + texto curto (1 frase) do quadrante calculado

### 3.7 Bloco Plano de Ação
- Ícone + parágrafo completo com recomendação

### 3.8 Rodapé
- Botão "Voltar"/"Fechar" à esquerda
- Botão "Exportar PDF" à direita

---

## 4. Estrutura Visual - Variante Consolidado

### 4.1 Diferenças da Variante Individual

| Elemento | Individual | Consolidado |
|----------|------------|-------------|
| Card superior | "Colaborador avaliado: [Nome]" + badge | "Colaboradores Avaliados:" + "Gestor: [Nome]" + badge |
| Título seção | "Resultados" | "Resultados Total" |
| Gráfico | "Média por competência" | "Média por competência geral" |
| Chips | "Desempenho Médio: X,XX" | "Desempenho Médio total: X,XX" |
| Perfil | Do colaborador | Geral (média de todos) |
| Plano de ação | Do colaborador | Geral (média de todos) |
| Rodapé | "Voltar" + "Exportar PDF" | "Voltar" + "Exportar PDF" |

---

## 5. Ponto de Entrada

### 5.1 Gatilhos na Tela Principal
Na tela de listagem de colaboradores avaliados:

- **Botão "Ver individual"** → abre Modal Individual daquele colaborador
- **Botão "Resultados"** → abre Modal Consolidado da avaliação inteira

### 5.2 Reaproveitamento
Se a tela atual já tiver uma ação equivalente, reaproveitar - não duplicar botões.

---

## 6. Contrato de API

### 6.1 Endpoint - Modal Individual

**GET** `/api/v1/evaluations/:evaluationId/report/individual/:personId`

**Response:**
```json
{
  "colaborador": {
    "nome": "Leandro",
    "empresa": "Nome da Empresa",
    "setor": "Tecnologia da Informação",
    "cargo": "Dev Front End Junior",
    "statusAvaliacao": "Respondida"
  },
  "notaDesempenho": 3.12,
  "notaPotencial": 3.5,
  "nivelDesempenho": "MEDIO",
  "nivelPotencial": "MEDIO",
  "codigoQuadrante": "Q5",
  "competencias": [
    { "nome": "Aplicação prática de conhecimentos", "nota": 3.4 },
    { "nome": "Comunicação", "nota": 2.8 },
    { "nome": "Liderança", "nota": 4.0 }
  ],
  "avaliacao": {
    "codigo": "AV-2026-001",
    "empresa": "Nome da Empresa"
  }
}
```

### 6.2 Endpoint - Modal Consolidado

**GET** `/api/v1/evaluations/:evaluationId/report/consolidated`

**Response:**
```json
{
  "avaliacao": {
    "codigo": "AV-2026-001",
    "empresa": "Nome da Empresa",
    "gestor": "Nome do Gestor",
    "totalColaboradores": 15,
    "totalRespondidos": 12
  },
  "notaDesempenhoMedia": 3.25,
  "notaPotencialMedia": 3.45,
  "codigoQuadranteGeral": "Q6",
  "competencias": [
    { "nome": "Aplicação prática de conhecimentos", "notaMedia": 3.4 },
    { "nome": "Comunicação", "notaMedia": 3.1 },
    { "nome": "Liderança", "notaMedia": 3.8 }
  ]
}
```

---

## 7. Exportação para PDF

### 7.1 Botão
- Localização: Rodapé do modal, à direita
- Texto: "Exportar PDF"

### 7.2 Nome do Arquivo
```
relatorio-ninebox-{nomeDoColaborador-ou-consolidado}-{idAvaliacao}.pdf
```
Exemplos:
- `relatorio-ninebox-leandro-silva-123.pdf`
- `relatorio-ninebox-consolidado-123.pdf`

### 7.3 Solução Técnica Sugerida

**Client-side (recomendado para este caso):**
- `html2canvas` → captura do DOM do modal
- `jsPDF` → montagem do PDF

**Características:**
- Layout idêntico ao visual na tela
- Cores das células preservadas
- Gráfico de competências visível
- Ícones mantidos
- NÃO converter para texto puro sem formatação

---

## 8. Critérios de Aceite

### 8.1 Funcionais
- [ ] Modal Individual reproduz fielmente a referência visual
- [ ] Modal Consolidado reproduz fielmente a referência visual
- [ ] Célula correta da matriz é destacada conforme `nivelDesempenho` / `nivelPotencial`
- [ ] Textos de perfil/plano de ação batem exatamente com a tabela da seção 2
- [ ] Botão "Exportar PDF" gera arquivo com layout/cores preservados
- [ ] Botão "Ver individual" abre modal do colaborador correto
- [ ] Botão "Resultados" abre modal consolidado da avaliação
- [ ] Formatação brasileira de números (vírgula decimal)

### 8.2 Backend
- [ ] Bug corrigido: 6 combinações potencial×desempenho mapeadas para o quadrante errado
- [ ] API retorna `nivelDesempenho` e `nivelPotencial` nos formatos esperados

### 8.3 UX
- [ ] Modal abre sem delay perceptível
- [ ] Loading state enquanto carrega dados
- [ ] Botão de fechar funciona (ESC, clique fora, botão)

---

## 9. Tasks de Implementação

### 9.1 Backend
- [ ] Corrigir mapeamento de quadrantes em `ninebox.service.js`
- [ ] Criar endpoint GET `/ninebox/report/individual/:personId`
- [ ] Criar endpoint GET `/ninebox/report/consolidated`

### 9.2 Frontend
- [ ] Criar componente `NineBoxReportModal`
- [ ] Criar componente `NineBoxMatrix` (grid 3×3 com destaque)
- [ ] Criar componente `CompetencyChart` (barras horizontais)
- [ ] Adicionar botões na tela de listagem
- [ ] Implementar exportação PDF com `html2canvas` + `jsPDF`

---

## 10. Referências

- `NINEBOX-FONTE-UNICA-QUADRANTES.md` - Tabela oficial dos 9 quadrantes
- Sistema existente "avaliação-gestor" (referência visual)