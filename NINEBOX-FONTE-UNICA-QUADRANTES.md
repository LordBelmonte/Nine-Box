# Fonte Única dos 9 Quadrantes — Nine Box v2

**Data:** 26 de junho de 2026  
**Status:** Decisão Final

---

## Decisão Tomada

Os nomes do grid atual do Nine Box v2 (Q1 Insuficiente... Q9 Estrela) são a **única fonte de verdade** em todo o sistema — backend, frontend do grid, e modal de relatório.

Este documento resolve:
- **Achado #1** (auditoria): divergência backend×frontend no mapeamento de quadrantes
- **Achado #6** (auditoria): perfil/plano de ação hardcoded no frontend

---

## 1. Por que o Conteúdo Não Muda, Só o Nome

O texto de "perfil" e "plano de ação" descreve a situação real do colaborador (ex.: "alto potencial, mas desempenho abaixo do esperado") — isso não muda com o nome do quadrante. O que mudou foi só o rótulo usado em cada posição.

| Potencial | Desempenho | Código | Nome (fonte única) | Nome antigo equivalente |
|-----------|------------|--------|-------------------|------------------------|
| Baixo | Baixo | Q1 | Insuficiente | Insuficiente |
| Baixo | Médio | Q2 | Questionável | Eficaz |
| Baixo | Alto | Q3 | Eficaz | Comprometido |
| Médio | Baixo | Q4 | Dilema | Questionável |
| Médio | Médio | Q5 | Mantenedor | Mantenedor |
| Médio | Alto | Q6 | Especialista | Forte desempenho |
| Alto | Baixo | Q7 | Forte Candidato | Enigma |
| Alto | Médio | Q8 | Alto Desempenho | Em crescimento |
| Alto | Alto | Q9 | Estrela | Destaque |

> **Nota:** A coluna "nome antigo equivalente" é só rastreabilidade — não usar em nenhuma tela nova.

---

## 2. Tabela de Seed para NineBoxCategoria (Resolve Achado #6)

```json
[
  {
    "codigo": "Q1",
    "nome": "Insuficiente",
    "potencial": "BAIXO",
    "desempenho": "BAIXO",
    "perfil": "Potencial baixo e desempenho abaixo do esperado",
    "planoAcao": "Identificar obstáculos que poderiam justificar o baixo desempenho e ajudá-lo a removê-los ou encontrar outro cargo interno no qual suas habilidades serão melhor utilizadas. Se não houver melhorias, recomenda-se o desligamento da empresa."
  },
  {
    "codigo": "Q2",
    "nome": "Questionável",
    "potencial": "BAIXO",
    "desempenho": "MEDIO",
    "perfil": "Potencial baixo e desempenho dentro do esperado",
    "planoAcao": "Dar feedback, treiná-los para se tornarem mais inovadores, identificar áreas específicas de melhoria e definir um plano de desenvolvimento pessoal, com o objetivo de conduzi-lo à categoria de alto desempenho."
  },
  {
    "codigo": "Q3",
    "nome": "Eficaz",
    "potencial": "BAIXO",
    "desempenho": "ALTO",
    "perfil": "Potencial baixo e desempenho acima do esperado",
    "planoAcao": "Apesar do bom desempenho, da mentalidade de trabalho certa e da sua dedicação, esses profissionais não têm muito potencial ou ambição de crescimento. O ideal é mantê-los felizes e recompensá-los com aumentos e bônus."
  },
  {
    "codigo": "Q4",
    "nome": "Dilema",
    "potencial": "MEDIO",
    "desempenho": "BAIXO",
    "perfil": "Potencial mediano e desempenho abaixo do esperado",
    "planoAcao": "Identificar bloqueios para performance — motivos pessoais, dificuldades com a cultura organizacional, falhas no onboarding... Comunique claramente o que se espera do profissional e proporcione um programa de mentoria interno, motivação e oportunidades de desenvolvimento."
  },
  {
    "codigo": "Q5",
    "nome": "Mantenedor",
    "potencial": "MEDIO",
    "desempenho": "MEDIO",
    "perfil": "Potencial e desempenho em nível mediano",
    "planoAcao": "Invista nesses profissionais chaves para a organização, ao oferecer novos projetos e tarefas que os mantenham engajados, e comece a prepará-los para oportunidades futuras, treinando-os em gestão de pessoas."
  },
  {
    "codigo": "Q6",
    "nome": "Especialista",
    "potencial": "MEDIO",
    "desempenho": "ALTO",
    "perfil": "Potencial mediano e desempenho acima do esperado",
    "planoAcao": "Entenda primeiramente se eles estão prontos para o crescimento e mais responsabilidades ou se precisam de mais tempo para se desenvolverem. Trabalhe suas habilidades de pensamento tático e estratégico, que serão úteis para seu futuro na organização."
  },
  {
    "codigo": "Q7",
    "nome": "Forte Candidato",
    "potencial": "ALTO",
    "desempenho": "BAIXO",
    "perfil": "Alto potencial e desempenho abaixo do esperado",
    "planoAcao": "Mesmo que tenham muito potencial, esses profissionais não estão entregando o que se espera deles, seja porque não têm a experiência necessária ou pela falta de compatibilidade com a função atual. Dê a esses profissionais tempo para ganhar experiência e feedback contínuo para construir confiança."
  },
  {
    "codigo": "Q8",
    "nome": "Alto Desempenho",
    "potencial": "ALTO",
    "desempenho": "MEDIO",
    "perfil": "Alto potencial e desempenho dentro do esperado",
    "planoAcao": "Proporcione mais exposição para que alcancem maior desempenho, através de oportunidades de treinamento, projetos desafiadores e monitoramento de progresso com KPIs claras."
  },
  {
    "codigo": "Q9",
    "nome": "Estrela",
    "potencial": "ALTO",
    "desempenho": "ALTO",
    "perfil": "Alto potencial e desempenho acima do esperado",
    "planoAcao": "Profissional que já se desenvolveu completamente dentro da sua função e está pronto para uma promoção e novas responsabilidades; é uma boa referência para os demais colaboradores da empresa pela sua capacidade de resolução de problemas, pensamento estratégico e motivação pessoal."
  }
]
```

---

## 3. Correção do Backend (Resolve Achado #1 — Eram 6 Células Erradas)

O objeto `matriz` em `ninebox.service.js` precisa ficar assim:

```javascript
const matriz = {
  'BAIXO-BAIXO': 'Q1 (Insuficiente)',
  'BAIXO-MÉDIO': 'Q2 (Questionável)',
  'BAIXO-ALTO': 'Q3 (Eficaz)',
  'MÉDIO-BAIXO': 'Q4 (Dilema)',
  'MÉDIO-MÉDIO': 'Q5 (Mantenedor)',
  'MÉDIO-ALTO': 'Q6 (Especialista)',
  'ALTO-BAIXO': 'Q7 (Forte Candidato)',
  'ALTO-MÉDIO': 'Q8 (Alto Desempenho)',
  'ALTO-ALTO': 'Q9 (Estrela)',
};
// chave = `${POTENCIAL}-${DESEMPENHO}`, mesma convenção que já estava no backend
```

### 3.1 Correção Recomendada (Ir Além)

Como agora existe a tabela de configuração `NineBoxCategoria` (seção 2), o ideal é o backend **deixar de ter este objeto fixo** e passar a buscar por `(potencial, desempenho)`.

**Benefícios:**
- Única fonte de dados (banco) — não há mais texto fixo em código
- Novas alterações de texto não exigem deploy
- Achado #1 não pode mais divergir

---

## 4. Mapeamento de Níveis

### 4.1 Nível Numérico → Nível Texto

| Nota Média | Nível Texto |
|------------|-------------|
| 1.0 - 1.99 | BAIXO |
| 2.0 - 2.99 | MÉDIO |
| 3.0 - 5.0 | ALTO |

### 4.2 Nível Texto → Índice (para matriz)

| Nível Texto | Índice |
|-------------|--------|
| BAIXO | 1 |
| MÉDIO | 2 |
| ALTO | 3 |

### 4.3 Posição na Matriz (Índice Potencial × Índice Desempenho)

```
                    DESEMPENHO
                 BAIXO  MÉDIO   ALTO
              ┌───────────────┐
         ALTO │ Q7   │ Q8   │ Q9 │
   POTENCIAL      │       │       │
         MÉDIO │ Q4   │ Q5   │ Q6 │
              │       │       │
         BAIXO │ Q1   │ Q2   │ Q3 │
              └───────────────┘
```

### Objeto de Mapeamento (Código Correto)

```javascript
const MATRIZ_QUADRANTES = {
  // POTENCIAL-DESEMPENHO → CÓDIGO
  'BAIXO-BAIXO': 'Q1',
  'BAIXO-MÉDIO': 'Q2',
  'BAIXO-ALTO': 'Q3',
  'MÉDIO-BAIXO': 'Q4',
  'MÉDIO-MÉDIO': 'Q5',
  'MÉDIO-ALTO': 'Q6',
  'ALTO-BAIXO': 'Q7',
  'ALTO-MÉDIO': 'Q8',
  'ALTO-ALTO': 'Q9'
};
```

---

## 5. Cores dos Quadrantes (Heat-map)

| Código | Nome | Cor Sugerida (Hex) |
|--------|------|-------------------|
| Q1 | Insuficiente | #EF4444 (Vermelho) |
| Q2 | Questionável | #F97316 (Laranja) |
| Q3 | Eficaz | #F97316 (Laranja) |
| Q4 | Dilema | #EAB308 (Âmbar) |
| Q5 | Mantenedor | #EAB308 (Âmbar) |
| Q6 | Especialista | #84CC16 (Verde Claro) |
| Q7 | Forte Candidato | #84CC16 (Verde Claro) |
| Q8 | Alto Desempenho | #22C55E (Verde) |
| Q9 | Estrela | #15803D (Verde Escuro) |

---

**Fim do Documento**