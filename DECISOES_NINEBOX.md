# Auditoria Técnica - Decisões Nine Box

**Data:** 26 de junho de 2026  
**Auditor:** Kiro (Engenheiro de Software Sênior)

---

## 1. DIVERGÊNCIA BACKEND x FRONTEND NO MAPEAMENTO DE QUADRANTE

### Evidência Confirmada

**Backend (ninebox.service.js - calculateCategoria):**
```javascript
const matriz = {
  'ALTO-BAIXO': 'Q4 (Dilema)',      // ALTO(Potential) - BAIXO(Performance)
  'ALTO-MÉDIO': 'Q7 (Forte Candidato)',  // ALTO - MÉDIO
  'ALTO-ALTO': 'Q9 (Estrela)',
  'MÉDIO-BAIXO': 'Q2 (Questionável)',    // MÉDIO - BAIXO
  'MÉDIO-MÉDIO': 'Q5 (Mantenedor)',
  'MÉDIO-ALTO': 'Q8 (Alto Desempenho)',
  'BAIXO-BAIXO': 'Q1 (Insuficiente)',
  'BAIXO-MÉDIO': 'Q3 (Eficaz)',           // BAIXO - MÉDIO
  'BAIXO-ALTO': 'Q6 (Especialista)'       // BAIXO - ALTO
};
```

**Frontend (nine-box.html - CATEGORIAS):**
```javascript
const CATEGORIAS = {
  '1-1': { nome: 'Q1 (Insuficiente)', ... },      // BAIXO-Baixo
  '2-1': { nome: 'Q2 (Questionável)', ... },      // BAIXO-Médio
  '3-1': { nome: 'Q3 (Eficaz)', ... },            // BAIXO-Alto
  '1-2': { nome: 'Q4 (Dilema)', ... },            // MÉDIO-Baixo
  '2-2': { nome: 'Q5 (Mantenedor)', ... },        // MÉDIO-Médio
  '3-2': { nome: 'Q6 (Especialista)', ... },      // MÉDIO-Alto
  '1-3': { nome: 'Q7 (Forte Candidato)', ... },   // ALTO-Baixo
  '2-3': { nome: 'Q8 (Alto Desempenho)', ... },   // ALTO-Médio
  '3-3': { nome: 'Q9 (Estrela)', ... },           // ALTO-Alto
};
```

**Divergência nas 6 células fora da diagonal:**

| Potencial | Performance | Backend | Frontend | Status |
|-----------|-------------|---------|----------|--------|
| ALTO(3)   | BAIXO(1)    | Q4      | Q7       | ❌ INVERTIDO |
| ALTO(3)   | MÉDIO(2)    | Q7      | Q4       | ❌ INVERTIDO |
| MÉDIO(2)  | BAIXO(1)    | Q2      | Q2       | ✓ OK |
| MÉDIO(2)  | ALTO(3)     | Q8      | Q8       | ✓ OK |
| BAIXO(1)  | MÉDIO(2)    | Q3      | Q3       | ✓ OK |
| BAIXO(1)  | ALTO(3)     | Q6      | Q6       | ✓ OK |

### Alternativas Possíveis

1. **Backend prevalece:** Alterar frontend para seguir mapeamento do backend
2. **Frontend prevalece (recomendado):** Corrigir backend para seguir frontend (UI é "verdade de negócio")
3. **Tabela de referência única:** Criar arquivo JSON compartilhado exportado para ambos

### Recomendação

**Frontend deve prevalecer** como definição oficial dos quadrantes.

Justificativa:
- O frontend contém descrições detalhadas de "Perfil" e "Plano de ação" (regra de negócio)
- A interface visual do grid HTML está montada de acordo com o mapeamento do frontend
- Usuários gestores já interagem com a nomenclatura atual do frontend
- Corrigir backend é mais simples (uma linha de mudança)

**Ação:** Corrigir `ninebox.service.js` - trocar as chaves `ALTO-BAIXO` e `ALTO-MÉDIO` na matriz.

---

## 2. INCOMPATIBILIDADE DE "tipo" DE COMPETÊNCIA PARA O CÁLCULO DE POTENTIAL

### Evidência Confirmada

**Enum aceito pela API (competency.validation.js):**
```javascript
tipo: Joi.string().valid('desempenho', 'potencial').required()
```

**Valores buscados no cálculo (ninebox.service.js):**
```javascript
// Performance: busca 'desempenho'
const desempenhoCompetencies = await this.competencyRepository.findByTipo('desempenho');

// Potential: busca 'lideranca' E 'comportamento' (NÃO 'potencial'!)
const liderancaCompetencies = await this.competencyRepository.findByTipo('lideranca');
const comportamentoCompetencies = await this.competencyRepository.findByTipo('comportamento');
```

**Valores usados no seed (seed.js):**
```javascript
await prisma.competency.createMany({
  data: [
    { nome: 'Liderança', tipo: 'lideranca', ... },
    { nome: 'Comunicação', tipo: 'comportamento', ... },
    { nome: 'Resolução de Problemas', tipo: 'tecnica', ... },
  ]
});
```

**Resumo da incompatibilidade:**

| Componente | Valores aceitos/buscados |
|------------|-------------------------|
| API (validação) | `desempenho`, `potencial` |
| Cálculo Nine Box | `desempenho`, `lideranca`, `comportamento` |
| Seed | `lideranca`, `comportamento`, `tecnica` |

### Alternativas Possíveis

**Alternativa 1 - Unificar para 2 tipos:**
- API já aceita `desempenho`, `potencial`
- Mudar seed para usar `potencial` em vez de `lideranca`/`comportamento`
- Simplifica código, mas perde granularidade semântica

**Alternativa 2 - Expandir enum (recomendada):**
- API aceita: `desempenho`, `potencial`, `lideranca`, `comportamento`, `tecnica`
- Cálculo mapeia: Performance = `desempenho` + `tecnica`; Potential = `potencial` + `lideranca` + `comportamento`
- Preserva dados existentes e semântica

### Recomendação

**Alternativa 2 - Expandir enum da API.**

Justificativa:
- Seed já usa `lideranca`/`comportamento`/`tecnica` (possivelmente há dados em produção)
- Semanticamente correto distinguir competências de liderança/comportamento
- Menor risco de quebra de dados existentes

**Ações:**
1. Expandir Joi validation para aceitar 5 tipos
2. Atualizar `findByTipo` no repository/service para listar todos os tipos válidos
3. Documentar mapeamento no README: Performance = `desempenho` + `tecnica`, Potential = `potencial` + `lideranca` + `comportamento`

---

## 3. CAMPOS LEGADOS ideal/bom/mediano/a_melhorar EM "competencies"

### Evidência Confirmada

**Migration (20260602225314_initial_create):**
```sql
ALTER TABLE "competencies" ADD COLUMN     "a_melhorar" TEXT,
ADD COLUMN     "bom" TEXT,
ADD COLUMN     "ideal" TEXT,
ADD COLUMN     "mediano" TEXT;
```

**Schema (schema.prisma):**
```prisma
model Competency {
  // ...
  a_melhorar    String?
  bom           String?
  ideal         String?
  mediano       String?
}
```

**Validation (competency.validation.js):**
```javascript
tipo: Joi.string().valid('desempenho', 'potencial').required(),
// ideal, bom, mediano, a_melhorar NÃO estão no schema Joi
```

**Middleware (validate.js):**
```javascript
const { error, value } = schema.validate(req.body, {
  abortEarly: false,
  stripUnknown: true  // Remove campos não no schema
});
```

**Service (competency.service.js) - CÓDIGO MORTO:**
```javascript
// Linhas 32-46 (create) e 93-107 (update)
if (data.ideal && typeof data.ideal !== 'string') {
  throw new AppError('Descrição ideal deve ser texto', 400);
}
if (data.bom && typeof data.bom !== 'string') {
  throw new AppError('Descrição bom deve ser texto', 400);
}
// ... mediano, a_melhorar
```

**Conclusão:** Os 4 campos existem no banco, mas NUNCA são persistidos via API porque:
1. Joi validation não os inclui
2. `stripUnknown: true` os remove no middleware
3. O código de validação no service nunca é executado (campo não chega até ele)

### Alternativas Possíveis

**Alternativa 1 (a) - Remover campos e código morto:**
- Remover colunas do schema.prisma
- Criar migration para DROP COLUMN
- Remover validações manuais do service
- Formalizar `criterios` array (4 itens) como único modelo

**Alternativa 1 (b) - Reativar campos na API:**
- Adicionar campos ao Joi schema
- Manter colunas no banco
- Documentar que são opcionais e legacy

### Recomendação

**Alternativa 1(a) - Remover campos e código morto.**

Justificativa:
- Campos são legacy e nunca foram usados via API
- 代码死区 (código morto) no service causa confusão
- Migration recentes (< 1 mês) podem ser recriadas sem impacto
- Simplifica o modelo de dados

**Ações:**
1. Criar migration para `DROP COLUMN ideal, bom, mediano, a_melhorar`
2. Remover campos do schema.prisma
3. Remover blocos de validação manual no service ( linhas 32-46 e 93-107 )

---

## 4. ESCALA DE NOTAS INCONSISTENTE ENTRE VALIDAÇÃO E UI

### Evidência Confirmada

**Backend (evaluation.validation.js):**
```javascript
criterios: Joi.object().pattern(
  Joi.string(),
  Joi.number().min(1).max(10)  // Escala 1-10!
).min(1).required(),
```

**Frontend (responder-avaliacao.html):**
```javascript
const NOTAS = [
  { val: 1, label: 'Ruim',     desc: 'Não atende',           sel: 'sel-1' },
  { val: 2, label: 'Regular',  desc: 'Atende parcialmente',  sel: 'sel-2' },
  { val: 3, label: 'Bom',      desc: 'Atende bem',           sel: 'sel-3' },
  { val: 4, label: 'Excelente',desc: 'Supera expectativas',  sel: 'sel-4' },
];
```

**Conclusão:** A UI usa escala 1-4, mas a API valida 1-10. Existe risco de:
- Usuário enviar nota >4 via API direta (seria aceita)
- Inconsistência nos cálculos de média se houver notas 5-10

### Alternativas Possíveis

1. **Ajustar Joi para 1-4 (recomendado):** Escala oficial passa a ser 1-4
2. **Expandir UI para 1-10:** Maior granularidade, mas muda UX atual
3. **Documentar como "feature":** JS permite 1-10, UI só mostra 1-4

### Recomendação

**Ajustar Joi schema para escala 1-4.**

Justificativa:
- UI já usa 1-4 consistentemente
- Cálculo de Nine Box assume média de competências (espera 1-4)
- Seed do Nine Box usa valores 1-3 para performance/potential
- Manter 1-10 causaria confusão e possíveis bugs

**Ação:**
```javascript
Joi.number().min(1).max(4)
```

Documentar formalmente no README que a escala oficial é 1-4.

---

## 5. AUSÊNCIA DE PÁGINA "DETALHE DE 1 PESSOA NO NINE BOX"

### Evidência Confirmada

**nine-box.html (modal existente):**
O modal mostra nome, tipo, performance, potential, categoria, perfil e plano de ação, mas:
- Não mostra nota média por competência
- Não há gráfico de barras por competência
- Não mostra idade, gestor (dados do usuário)

**relatorios.html:**
Possui aba "Por usuário" que mostra:
- Card com dados do usuário (nome, avatar, RA, tipo)
- Seção de avaliações (lista com média, comentário, data)
- Seção Nine Box (categoria, performance, potential)
- **MAS** não há:
  - Nota média por competência
  - Gráfico de radar/barras por competência
  - Visualização consolidada "dashboard de 1 pessoa"

**Conclusão:** NÃO existe uma página dedicada equivalente a "dashboard de 1 avaliado" com:
- Nome, idade, cargo, gestor
- Nota média geral
- Gráfico de barras por competência
- Posição no Nine Box com explicação
- Histórico de avaliações

### Alternativas Possíveis

1. **Criar nova página dedicada** (ex.: `pessoa-ninebox.html`)
2. **Estender modal existente** em nine-box.html
3. **Expandir seção "Por usuário"** em relatorios.html

### Recomendação

**Alternativa 2 - Estender o modal existente em nine-box.html.**

Justificativa:
- Modal já existe e é usado para exibir detalhes de pessoas no Nine Box
- Usuário já está no contexto do Nine Box quando clica em uma pessoa
- Evita fragmentação de navegação
- Menos código novo a manter

**Ações sugeridas para estender o modal:**
1. Adicionar seção "Notas por Competência" com gráfico Chart.js
2. Exibir campos do usuário: cargo, departamento, gestor
3. Adicionar link para ver histórico completo em relatorios.html
4. Manter layout atual, apenas expandir sections

---

## 6. CAMPO PARA PERSISTIR "Perfil" e "Plano de ação" POR CATEGORIA

### Evidência Confirmada

**Schema (schema.prisma) - tabela nine_box:**
```prisma
model NineBox {
  id          String   @id @default(uuid())
  pessoaId    String
  performance Float
  potential   Float
  categoria   String    // Apenas o nome (ex: "Q9 (Estrela)")
  comentario  String?
  data        DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  pessoa      User     @relation(...)
}
```

**Frontend (nine-box.html) - hardcoded:**
```javascript
const CATEGORIAS = {
  '3-3': {
    nome: 'Q9 (Estrela)',
    tipo: 'Estrela',
    perfil: 'Alto potencial e desempenho acima do esperado',
    plano: 'Profissional que já se desenvolveu completamente...'
  },
  // ... todas as categorias hardcoded
};
```

**Conclusão:** Os textos de "Perfil" e "Plano de ação":
- NÃO existem como colunas na tabela `nine_box`
- Estão HARDCODED no frontend
- São compartilhados (iguais para todas as pessoas da mesma categoria)
- Seriam diferentes se admin quisesse customizar por empresa

### Alternativas Possíveis

**Alternativa 1 - Manter como está (estático em frontend):**
- CATEGORIAS permanece no frontend
- Simples, sem mudança de schema
- Todas as pessoas da mesma categoria veem os mesmos textos

**Alternativa 2 - Criar tabela de configuração (recomendada):**
- Criar tabela `nine_box_categorias` (ou `nine_box_settings`)
- Admin pode editar textos de Perfil e Plano
- Frontend consome da API ou arquivo JSON compartilhado
- Possibilidade de customização futura por empresa

### Recomendação

**Alternativa 2 - Criar tabela de configuração editável por admin.**

Justificativa:
- Separa conteúdo da apresentação (boas práticas)
- Permite customização sem mudar código
- Pode ser expandido para múltiplas empresas/franquias
- Frontend já está consumindo API em outros pontos

**Ações:**
1. Criar tabela `nine_box_categorias` no schema:
   ```prisma
   model NineBoxCategoria {
     id          String @id @default(uuid())
     codigo      String @unique  // Ex: "Q9", "Q1"
     nome        String
     tipo        String  // Ex: "Estrela", "Insuficiente"
     perfil      String
     planoAcao   String
     icon        String?
     cor         String?
   }
   ```
2. Seed.popular() com dados atuais das 9 categorias
3. Endpoint GET `/nine-box/categorias` para frontend
4. Admin UI para editar (futuro)
5. Remover CATEGORIAS hardcoded ou manter como fallback

---

## Tabela de Referência ORIGEM (regras de negócio)

| Potencial | Desempenho | Nome       | Tipo          | Perfil                                               |
|-----------|------------|------------|---------------|------------------------------------------------------|
| Baixo     | Baixo      | Q1         | Insuficiente  | Potencial baixo e desempenho abaixo do esperado      |
| Baixo     | Médio      | Q2         | Questionável  | Potencial baixo e desempenho dentro do esperado      |
| Baixo     | Alto       | Q3         | Eficaz        | Potencial baixo e desempenho acima do esperado       |
| Médio     | Baixo      | Q4         | Dilema        | Potencial mediano e desempenho abaixo do esperado    |
| Médio     | Médio      | Q5         | Mantenedor    | Potencial e desempenho em nível mediano              |
| Médio     | Alto       | Q6         | Especialista  | Potencial mediano e desempenho acima do esperado     |
| Alto      | Baixo      | Q7         | Forte Candidato| Alto potencial e desempenho abaixo do esperado     |
| Alto      | Médio      | Q8         | Alto Desempenho| Alto potencial e desempenho dentro do esperado     |
| Alto      | Alto       | Q9         | Estrela       | Alto potencial e desempenho acima do esperado        |

**Nota:** Os textos completos de "Plano de ação" estão no objeto CATEGORIAS do frontend.

---

**Fim do Documento de Decisões**