# Módulo de Avaliações

Este módulo segue o padrão MVC:

- `evaluation.routes.js` -> define endpoints da API.
- `evaluation.controller.js` -> recebe as requisições e devolve respostas.
- `evaluation.service.js` -> contém regras de negócio e validações de permissão.
- `evaluation.repository.js` -> acessa o banco de dados via Prisma.

## Endpoints principais

- `GET /api/evaluations/dashboard/gestor` - dashboard de gestor
- `GET /api/evaluations/dashboard/colaborador` - dashboard de colaborador
- `GET /api/evaluations/dashboard/admin` - dashboard de admin
- `GET /api/evaluations/avaliado/:avaliadoId` - avaliações recebidas por um usuário
- `GET /api/evaluations/avaliador/:avaliadorId` - avaliações feitas por um usuário
- `GET /api/evaluations/campanha/:campaignId` - avaliações por campanha
- `GET /api/evaluations/stats/avaliado/:avaliadoId` - estatísticas de um avaliado
- `POST /api/evaluations` - criar avaliação
- `PUT /api/evaluations/:id` - atualizar avaliação
- `DELETE /api/evaluations/:id` - excluir avaliação

## Permissões de leitura para gestores

- Gestores podem consultar seu próprio dashboard.
- Gestores podem listar colaboradores de seu grupo via `GET /api/groups/gestor/:gestorId/colaboradores`.
- Gestores podem ver avaliações que fizeram e avaliações que receberam.
- As regras de permissão estão centralizadas em `evaluation.service.js` para leitura e criação de avaliações.
