# Auditoria Técnica - Divergência Backend x Frontend (Nine Box)

**Data:** 26 de junho de 2026  
**Auditor:** Kiro (Engenheiro de Software Sênior)  
**Arquivos Analisados:**
- `backend/src/modules/ninebox/ninebox.service.js` (função `calculateCategoria`)
- `frontend-ref/pages/nine-box.html` (objeto `CATEGORIAS` e função `renderGrid`)

---

## 1. Confirmação da Divergência

### 1.1 Análise do Backend

O backend utiliza a seguinte matriz na função `calculateCategoria`:

```javascript
const matriz = {
  'ALTO-BAIXO': 'Q4 (Dilema)',      // ALTO (Potential) - BAIXO (Performance)
  'ALTO-MÉDIO': 'Q7 (Forte Candidato)',  // ALTO (Potential) - MÉDIO (Performance)
  'ALTO-ALTO': 'Q9 (Estrela)',
  'MÉDIO-BAIXO': 'Q2 (Questionável)',    // MÉDIO (Potential) - BAIXO (Performance)
  'MÉDIO-MÉDIO': 'Q5 (Mantenedor)',
  'MÉDIO-ALTO': 'Q8 (Alto Desempenho)',
  'BAIXO-BAIXO': 'Q1 (Insuficiente)',
  'BAIXO-MÉDIO': 'Q3 (Eficaz)',         // BAIXO (Potential) - MÉDIO (Performance)
  'BAIXO-ALTO': 'Q6 (Especialista)'     // BAIXO (Potential) - ALTO (Performance)
};
```

### 1.2 Análise do Frontend

O frontend define os quadrantes no objeto `CATEGORIAS` usando a escala 1-3 (convertida via `Math.round()` em `renderGrid`):

```javascript
const CATEGORIAS = {
  '1-1': { nome: 'Q1 (Insuficiente)', ... },      // BAIXO(1)-BAIXO(1)
  '2-1': { nome: 'Q2 (Questionável)', ... },      // BAIXO(1)-MÉDIO(2)
  '3-1': { nome: 'Q3 (Eficaz)', ... },            // BAIXO(1)-ALTO(3)
  '1-2': { nome: 'Q4 (Dilema)', ... },            // MÉDIO(2)-BAIXO(1)
  '2-2': { nome: 'Q5 (Mantenedor)', ... },        // MÉDIO(2)-MÉDIO(2)
  '3-2': { nome: 'Q6 (Especialista)', ... },      // MÉDIO(2)-ALTO(3)
  '1-3': { nome: 'Q7 (Forte Candidato)', ... },   // ALTO(3)-BAIXO(1)
  '2-3': { nome: 'Q8 (Alto Desempenho)', ... },   // ALTO(3)-MÉDIO(2)
  '3-3': { nome: 'Q9 (Estrela)', ... },           // ALTO(3)-ALTO(3)
};
```

### 1.3 Mapeamento Comparativo (fora da diagonal)

| Potencial | Performance | Backend retorna | Frontend espera | **DIVERGÊNCIA** |
|-----------|-------------|-----------------|-----------------|-----------------|
| ALTO(3)   | BAIXO(1)    | Q4 (Dilema)     | Q7 (Forte Candidato) | **❌ Q4 ≠ Q7** |
| ALTO(3)   | MÉDIO(2)    | Q7 (Forte Candidato) | Q4 (Dilema) | **❌ Q7 ≠ Q4** |
| MÉDIO(2)  | BAIXO(1)    | Q2 (Questionável) | Q2 (Questionável) | ✓ Ok |
| MÉDIO(2)  | ALTO(3)     | Q8 (Alto Desempenho) | Q8 (Alto Desempenho) | ✓ Ok |
| BAIXO(1)  | MÉDIO(2)    | Q3 (Eficaz)     | Q3 (Eficaz) | ✓ Ok |
| BAIXO(1)  | ALTO(3)     | Q6 (Especialista) | Q6 (Especialista) | ✓ Ok |

### 1.4 Conclusão da Auditoria

**CONFIRMADO:** Existe uma divergência significativa entre backend e frontend.

Os quadrantes **Q4** e **Q7** estão **INVERTIDOS** entre as duas camadas:

- **Backend:** Q4 = Alto Potencial / Baixo Desempenho
- **Frontend:** Q4 = Médio Potencial / Baixo Desempenho

Esta inversão causa classificações incorretas de colaboradores quando o sistema calcula automaticamente o Nine Box a partir das avaliações.

---

## 2. Decisão Recomendada

### 2.1 Fonte da Verdade

**Recomendação:** O **frontend** deve prevalecer como a definição correta dos quadrantes.

**Justificativa:**
1. O frontend é a representação visual oficial do Nine Box Grid, utilizada diretamente pelos gestores para tomada de decisão
2. O objeto `CATEGORIAS` no frontend contém descrições detalhadas (perfil, plano de ação) que são a verdadeira "definição de negócio"
3. A estrutura do grid HTML está montada de acordo com o mapeamento do frontend (ex: `nb-box-1-3` = Q7, `nb-box-1-2` = Q4)
4. Alterar o frontend exigiria reescrever toda a interface e confundir usuários que já estão habituados com a nomenclatura atual

### 2.2 Ação Corretiva Recomendada

**Corrigir o backend** para alinhar com o frontend.

Correção necessária na função `calculateCategoria` do arquivo `ninebox.service.js`:

```javascript
// CORRIGIR de:
'ALTO-BAIXO': 'Q4 (Dilema)',
'ALTO-MÉDIO': 'Q7 (Forte Candidato)',

// PARA:
'ALTO-BAIXO': 'Q7 (Forte Candidato)',
'ALTO-MÉDIO': 'Q4 (Dilema)',
```

---

## 3. Tabela de Referência Única (ORIGEM)

Para evitar futuras inconsistências, recomenda-se criar um arquivo compartilhado (ex: `backend/src/config/ninebox-reference.json`) ou documento técnico com a seguinte tabela:

| Quadrante | Potencial | Performance | Nome | Descrição |
|-----------|-----------|-------------|------|-----------|
| Q1 | Baixo | Baixo | Insuficiente | Potencial baixo e desempenho abaixo do esperado |
| Q2 | Baixo | Médio | Questionável | Potencial baixo e desempenho dentro do esperado |
| Q3 | Baixo | Alto | Eficaz | Potencial baixo e desempenho acima do esperado |
| Q4 | Médio | Baixo | Dilema | Potencial mediano e desempenho abaixo do esperado |
| Q5 | Médio | Médio | Mantenedor | Potencial e desempenho em nível mediano |
| Q6 | Médio | Alto | Especialista | Potencial mediano e desempenho acima do esperado |
| Q7 | Alto | Baixo | Forte Candidato | Alto potencial e desempenho abaixo do esperado |
| Q8 | Alto | Médio | Alto Desempenho | Alto potencial e desempenho dentro do esperado |
| Q9 | Alto | Alto | Estrela | Alto potencial e desempenho acima do esperado |

**Nota:** Na escala 1-3: Baixo=1, Médio=2, Alto=3

---

## 4. Impacto da Correção

- **Colaboradores atualmente classificados como Q4** (via API) → passarão a ser Q7
- **Colaboradores atualmente classificados como Q7** (via API) → passarão a ser Q4
- **Necessário recalcular** todos os Nine Boxes existentes após a correção
- **Recomendação:** Executar migração de dados ou marcar como "pendente de recalculo" até que gestores revisitem as classificações

---

## 5. Validação Pós-Correção

Após implementar a correção no backend, validar com os seguintes testes:

1. Backend responde corretamente para `ALTO-BAIXO` → "Q7 (Forte Candidato)"
2. Backend responde corretamente para `ALTO-MÉDIO` → "Q4 (Dilema)"
3. Frontend exibe colaboradores nos quadrantes corretos ao visualizar o grid
4. Modal de detalhes mostra a descrição correspondente ao quadrante

---

**Fim do Relatório de Auditoria**
---

# Adendo: Incompatibilidade de "tipo" de Competência para Cálculo de Potential

**Data:** 26 de junho de 2026  
**Auditor:** Kiro (Engenheiro de Software Sênior)

---

## 1. Confirmação da Incompatibilidade

### 1.1 Enum Aceito pela API (competency.validation.js)

```javascript
tipo: Joi.string().valid('desempenho', 'potencial').required()
```

A API **só aceita** os valores:
- `desempenho`
- `potencial`

### 1.2 Valores Buscados pelo Serviço de Cálculo (ninebox.service.js)

```javascript
// calculatePerformanceFromEvaluations busca:
const desempenhoCompetencies = await this.competencyRepository.findByTipo('desempenho');

// calculatePotentialFromEvaluations busca:
const liderancaCompetencies = await this.competencyRepository.findByTipo('lideranca');
const comportamentoCompetencies = await this.competencyRepository.findByTipo('comportamento');
```

O serviço de Nine Box busca:
- Performance: `desempenho`
- Potential: `lideranca` E `comportamento`

### 1.3 Valores no Seed (seed.js)

O seed cria competências com valores **não aceitos pela API**:

```javascript
await prisma.competency.createMany({
  data: [
    { nome: 'Liderança', tipo: 'lideranca', ... },
    { nome: 'Comunicação', tipo: 'comportamento', ... },
    { nome: 'Trabalho em Equipe', tipo: 'comportamento', ... },
    { nome: 'Resolução de Problemas', tipo: 'tecnica', ... },
    { nome: 'Proatividade', tipo: 'comportamento', ... }
  ]
});
```

### 1.4 Conclusão da Auditoria

**CONFIRMADO:** Existe uma incompatibilidade crítica:

| Componente | Valores de "tipo" |
|------------|-------------------|
| API (validation.js) | `desempenho`, `potencial` |
| Seed (dados de teste) | `lideranca`, `comportamento`, `tecnica` |
| Cálculo Nine Box | `desempenho`, `lideranca`, `comportamento` |

**Impacto:** 
- A API **rejeitaria** a criação de competências com os valores do seed
- As competências do seed **nunca seriam encontradas** pelo cálculo de Potential se o banco fosse recriado
- O sistema de cálculo de Nine Box está "deslocado" da realidade dos dados

---

## 2. Decisões Recomendadas

### 2.1 Análise dos Trade-offs

**Realidade atual:**
- Frontend provavelmente exibe/permite seleccionar `lideranca`, `comportamento`, `tecnica`
- Seed usa esses valores há meses (dados de produção já podem existir)
- Cálculo foi escrito esperando esses valores

---

### 2.2 Alternativa 1: Unificar para 'desempenho'/'potencial' (Recomendada se não há dados em produção)

**Descrição:** Alinhar tudo ao enum da API (atualizar seed e cálculo)

| Aspecto | Detalhe |
|---------|---------|
| **API** | Já aceita `desempenho`, `potencial` |
| **Seed** | Atualizar para usar `potencial` em vez de `lideranca`/`comportamento`/`tecnica` |
| **Cálculo Nine Box** | Remover busca por `lideranca`/`comportamento`, usar só `potencial` |
| **Frontend** | Adaptar UI se necessário |

**Trade-offs:**
| Prós | Contras |
|------|---------|
| Simplicidade (2 valores apenas) | Perda de granularidade (liderança ≠ comportamento) |
| Alinhado com validação da API | Quebra de consistência semântica |
| Facilidade de manutenção | Não diferencia competências de liderança vs. comportamento |
| Sem migração complexa | Requer atualização de todos os dados existentes |

---

### 2.3 Alternativa 2: Expandir enum da API (Recomendada para preservação de granularidade)

**Descrição:** Expandir a API para aceitar todos os valores e mapear no cálculo

```javascript
// competency.validation.js
tipo: Joi.string().valid(
  'desempenho', 
  'potencial',
  'lideranca',
  'comportamento', 
  'tecnica'
).required()

// ninebox.service.js - mapeamento:
const POTENTIAL_TYPES = ['potencial', 'lideranca', 'comportamento', 'tecnica'];
const PERFORMANCE_TYPES = ['desempenho', 'tecnica'];
```

| Aspecto | Detalhe |
|---------|---------|
| **API** | Aceita: `desempenho`, `potencial`, `lideranca`, `comportamento`, `tecnica` |
| **Seed** | Mantido como está |
| **Cálculo Nine Box** | Performance = `desempenho` + `tecnica`; Potential = `potencial` + `lideranca` + `comportamento` |

**Trade-offs:**
| Prós | Contras |
|------|---------|
| Preserva granularidade semântica | Maior complexidade no código |
| Seed e dados reais já utilizam | Validação mais extensa |
| Cálculo pode ser ajustado | Possível inconsistência futura |
| Não requer migração de dados | — |

---

### 2.4 Alternativa 3: Híbrida (Mapeamento via tabela de referência)

**Descrição:** Criar tabela de configuração que define qual tipo pertence a qual eixo

```javascript
// Arquivo de configuração
const TIPO_EIXO_MAP = {
  desempenho: 'PERFORMANCE',
  tecnica: 'PERFORMANCE',  // Técnica contribui para performance
  potencial: 'POTENTIAL',
  lideranca: 'POTENTIAL',
  comportamento: 'POTENTIAL'
};

function calculateScore(evaluations, tipoFilter) {
  // Busca competências onde tipo está no mapeamento
}
```

**Trade-offs:**
| Prós | Contras |
|------|---------|
| Máxima flexibilidade | Overhead de configuração |
| Facilita alterações futuras | Mais uma "camada" para manter |
| Pode ser expandido para UI | Risco de configurações conflitantes |

---

## 3. Recomendação Final

** Recomendada: Alternativa 2 (Expandir enum da API)**

**Justificativa:**
1. **Dados existentes:** O seed já usa `lideranca`/`comportamento`/`tecnica` e possivelmente há dados em produção
2. **Semanticamente correto:** Liderança e comportamento são conceitos diferentes de desempenho técnico
3. **Custo de mudança:** Alterar a API e dados existentes tem maior risco
4. **Alinhamento com Frontend:** A UI provavelmente já suporta esses valores

**Ação proposta:**

1. **Atualizar** `competency.validation.js`:
```javascript
tipo: Joi.string().valid(
  'desempenho',
  'potencial',
  'lideranca',
  'comportamento',
  'tecnica'
).required()
```

2. **Atualizar** `ninebox.service.js` - `calculatePerformanceFromEvaluations`:
```javascript
// Performance = competências de desempenho + técnicas
const desempenhoCompetencies = await this.competencyRepository.findByTipo('desempenho');
const tecnicaCompetencies = await this.competencyRepository.findByTipo('tecnica');
```

3. **Manter** seed.js como está

4. **Documentar** no README ou arquivo de configuração que:
   - Eixo **Performance** = `desempenho` + `tecnica`
   - Eixo **Potential** = `potencial` + `lideranca` + `comportamento`

---

## 4. Validação Pós-Correção

1. API aceita criação de competências com qualquer um dos 5 tipos
2. Seed executa sem erros
3. Cálculo de Nine Box considera competências corretas para cada eixo
4. Frontend exibe/distribui competências corretamente

---

**Fim do Adendo de Auditoria**