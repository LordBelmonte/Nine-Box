# CHECKLIST DO PROJETO — Portal de Gestão de Pessoas (Nine Box)
**Faculdade ENIAC — Digital Tech Solution**
**Sistema:** Portal web para avaliação de desempenho e mapeamento Nine Box
**Tecnologias:** Node.js · Express · Prisma ORM · PostgreSQL · HTML/CSS/JS · JWT

---

## 1. Captação e Definição do Desafio

- [x] Identificar o desafio na Link+ (necessidade de uma plataforma digital para avaliação Nine Box)
- [x] Definir objetivos principais: digitalizar o processo de avaliação de colaboradores e gestores com cálculo automático do Nine Box

---

## 2. Aprovação do Comitê de Projetos

- [x] Apresentar o desafio ao comitê
- [x] Obter aprovação formal
- [x] Definir gestor de projeto (Comitê)

---

## 3. Escolha dos Integrantes do Grupo

- [x] Selecionar equipe com base em habilidades (backend, frontend, banco de dados, documentação)
- [x] Definir papéis e responsabilidades (squads)

---

## 4. Montagem da TAP (Termo de Abertura do Projeto)

- [x] Estruturar o TAP com escopo, objetivos, restrições e stakeholders do sistema
- [x] Validar as informações com a equipe

---

## 5. Definição das Squads

- [x] Squad Backend: Node.js, Express, Prisma, PostgreSQL, autenticação JWT
- [x] Squad Frontend: HTML, CSS, JavaScript, design responsivo, acessibilidade
- [x] Squad Banco de Dados: modelagem Prisma, migrations, seed de dados
- [x] Squad Documentação: READMEs, auditoria técnica, decisões arquiteturais

---

## 6. Montagem do Cronograma (5W2H)

- [x] Definir atividades usando a metodologia 5W2H
- [x] Estabelecer prazos e responsáveis por cada entrega

---

## 7. Reunião de Kickoff

- [ ] Apresentar o projeto à equipe (sistema Nine Box + stack técnica)
- [ ] Alinhar expectativas: MVP, papéis (admin, gestor, colaborador), fluxo de avaliação

---

## 8. Primeira Sprint — Estrutura Base

- [x] 8.1 Postagem do currículo na plataforma Link+
- [x] 8.2 Descrição do propósito: sistema para avaliação de desempenho e potencial com classificação Nine Box
- [x] 8.3 Criação do infográfico do desafio
- [x] 8.4 Finalização e postagem do TAP
- [x] 8.5 Elaboração do plano de ação e cronograma (5W2H)
- [x] 8.6 Postagem dos entregáveis (TAP, 5W2H, infográfico)
- [ ] 8.7 Coleta de feedback das postagens

**Entregas técnicas desta sprint:**
- [x] Configuração do projeto (Node.js + Express + Prisma + PostgreSQL)
- [x] Modelagem do banco de dados (usuários, competências, campanhas, avaliações, Nine Box)
- [x] Autenticação JWT com 3 perfis: administrador, gestor e colaborador
- [x] CRUD de usuários com cadastro e consulta
- [x] Estrutura HTML/CSS base com Navbar, header, dark mode e responsividade

---

## 9. Reunião de Progresso (Sprint 1 → 2)

- [ ] Revisar andamento do projeto
- [ ] Ajustar estratégias conforme necessidade (priorização de funcionalidades MVP)

---

## 10. Segunda Sprint — Funcionalidades Core

- [x] 10.1 Postagem dos entregáveis da sprint 1
- [x] 10.2 Registro das pesquisas realizadas (metodologia Nine Box, cálculo de potencial/desempenho)
- [ ] 10.3 Realização de testes gerais (bancada / integração frontend-backend)
- [ ] 10.4 Aprovação pela GQA
- [ ] 10.5 Postagem das ATAs das reuniões
- [ ] 10.6 Publicação dos resultados conquistados
- [ ] 10.7 Coleta de feedback das postagens

**Entregas técnicas desta sprint:**
- [x] Módulo de Competências (CRUD, tipos: desempenho/potencial/liderança/comportamento/técnica)
- [x] Módulo de Campanhas (criação, ativação, finalização, duplicação)
- [x] Módulo de Grupos (vincular colaboradores a gestores)
- [x] Módulo de Avaliações (formulário de resposta, orientações, agradecimentos)
- [x] Cálculo automático Nine Box com classificação nos 9 quadrantes
- [x] Resolução de divergência de mapeamento Q4/Q7 entre backend e frontend (auditoria técnica documentada)
- [x] Módulo de Relatórios (dashboard, filtros por categoria, exportação)
- [x] Middleware de autenticação, validação e tratamento de erros

---

## 11. Comprovação Física das Atividades

- [x] 11.1 Registro fotográfico/screenshots das telas do sistema
- [x] 11.2 Gravação de vídeos das funcionalidades (demonstração do fluxo de avaliação)
- [x] 11.3 Coleta de depoimentos sobre o sistema e o processo de desenvolvimento

---

## 12. Terceira Sprint — Refinamento e Apresentação

- [x] 12.1 Postagem da coleta de depoimentos
- [ ] 12.2 Apresentação para a banca examinadora
- [ ] 12.3 Apresentação do pitch (demonstração do portal Nine Box)
- [ ] 12.4 TEP (Termo de Encerramento do Projeto)
- [ ] 12.5 Avaliação para o Proj Week
- [ ] 12.6 Coleta de feedback das postagens

**Entregas técnicas desta sprint:**
- [x] Refatoração completa da Navbar (estrutura: Início · Contatos · Avaliações · Relatórios)
- [x] Ocultação de telas de teste do MVP (sem remoção de código)
- [x] Melhorias visuais: fonte Poppins, alinhamento, espaçamento, responsividade
- [x] Auditoria técnica: divergência backend ↔ frontend documentada e corrigida
- [x] Documentação de decisões arquiteturais (`DECISOES_NINEBOX.md`, `AUDITORIA_NINEBOX.md`)
- [ ] Testes de integração e correção de bugs finais
- [ ] Deploy em ambiente de demonstração

---

## 13. Apresentação Final

- [ ] Finalizar todos os materiais e apresentações do portal Nine Box
- [ ] Realizar apresentação final para os stakeholders (demo ao vivo do sistema)

---

## 14. Ranking dos Projetos para Proj Week

- [ ] Revisar os critérios de avaliação
- [ ] Acompanhar a classificação do projeto

---

## 15. Quarta Sprint — Implantação e NPS

- [ ] 15.1 Criação do plano de implantação (instalação, configuração, migração de dados)
- [ ] 15.2 Reunião com o cliente (apresentação do sistema finalizado)
- [ ] 15.3 Pesquisa de NPS (Net Promoter Score) com gestores e colaboradores que usarem o portal
- [ ] 15.4 Avaliação de contratação dos alunos

**Entregas técnicas desta sprint:**
- [ ] Guia de instalação e deploy (README atualizado)
- [ ] Script de migração de dados legados (se aplicável)
- [ ] Configuração de variáveis de ambiente para produção (`.env.example` documentado)

---

## 16. Case de Sucesso

- [ ] Documentação do projeto como estudo de caso: como o Nine Box foi implementado, desafios técnicos e soluções
- [ ] Preparação de material para divulgação (portfolio, LinkedIn, apresentações)

---

## 17. Entrevista no Podcast

- [ ] Agendamento da entrevista
- [ ] Preparação dos tópicos: Nine Box, stack técnica, trabalho em equipe, aprendizados

---

## 18. Publicações

- [ ] Criar posts para redes sociais (LinkedIn, Instagram) com screenshots do sistema e resultados
- [ ] Divulgação dos impactos: número de avaliações realizadas, quadrantes preenchidos, tempo economizado

---

## 19. Atualização dos Dashboards de Resultados

- [ ] Revisão e atualização dos dashboards de métricas do projeto conforme progresso

---

## Resumo Técnico do Sistema

| Módulo | Status |
|--------|--------|
| Autenticação JWT (admin / gestor / colaborador) | ✅ Concluído |
| Cadastro e consulta de usuários | ✅ Concluído |
| Grupos (gestor ↔ colaboradores) | ✅ Concluído |
| Competências (CRUD + tipos) | ✅ Concluído |
| Campanhas de Avaliação | ✅ Concluído |
| Formulário de Avaliação (responder) | ✅ Concluído |
| Cálculo Nine Box automático | ✅ Concluído |
| Grid Nine Box (9 quadrantes) | ✅ Concluído |
| Relatórios e Dashboard | ✅ Concluído |
| Navbar refatorada (MVP) | ✅ Concluído |
| Auditoria técnica Q4/Q7 | ✅ Documentado |
| Testes de integração | ⏳ Em andamento |
| Deploy produção | ⏳ Pendente |

---

📌 *Checklist adaptado ao projeto real desenvolvido pela equipe Digital Tech Solution — Faculdade ENIAC.*
