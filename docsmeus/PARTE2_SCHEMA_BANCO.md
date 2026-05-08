# 🗄️ Parte 2: Schema do Banco de Dados

## 📋 O que vamos criar

Nosso sistema precisa de 5 tabelas principais:
1. **User** - Usuários do sistema
2. **Evaluation** - Avaliações anônimas
3. **Competency** - Competências organizacionais
4. **NineBox** - Matriz nine-box
5. **Report** - Relatórios gerados

---

## 🎯 Passo 1: Entender o Schema Prisma

O arquivo `prisma/schema.prisma` define:
- Conexão com o banco
- Modelos (tabelas)
- Relacionamentos
- Índices e constraints

---

## 📝 Passo 2: Criar o Schema Completo

Edite `prisma/schema.prisma`:

```prisma
// Configuração do gerador
generator client {
  provider = "prisma-client-js"
}

// Configuração da conexão
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// MODELO: User (Usuários)
// ============================================
model User {
  id        String   @id @default(uuid())
  nome      String
  email     String   @unique
  senha     String
  tipo      String   // 'admin', 'gestor', 'colaborador'
  cargo     String?
  departamento String?
  ativo     Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relacionamentos
  avaliacoesFeitas    Evaluation[] @relation("Avaliador")
  avaliacoesRecebidas Evaluation[] @relation("Avaliado")
  nineBoxes           NineBox[]

  @@map("users")
}

// ============================================
// MODELO: Evaluation (Avaliações)
// ============================================
model Evaluation {
  id            String   @id @default(uuid())
  avaliadorId   String
  avaliadoId    String
  tipoAvaliacao String   // 'gestor_para_colaborador', 'colaborador_para_gestor', 'avaliacao_360'
  criterios     Json?    // { pontualidade: 5, comunicacao: 4, ... }
  media         Float?
  comentario    String?
  anonima       Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relacionamentos
  avaliador User @relation("Avaliador", fields: [avaliadorId], references: [id], onDelete: Cascade)
  avaliado  User @relation("Avaliado", fields: [avaliadoId], references: [id], onDelete: Cascade)

  // Índices para performance
  @@index([avaliadorId])
  @@index([avaliadoId])
  @@index([tipoAvaliacao])
  @@map("evaluations")
}

// ============================================
// MODELO: Competency (Competências)
// ============================================
model Competency {
  id          String   @id @default(uuid())
  nome        String   @unique
  descricao   String?
  categoria   String?  // 'tecnica', 'comportamental', 'lideranca'
  nivelMinimo Int      @default(1)
  nivelMaximo Int      @default(5)
  ativo       Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("competencies")
}

// ============================================
// MODELO: NineBox (Matriz Nine-Box)
// ============================================
model NineBox {
  id           String   @id @default(uuid())
  userId       String
  desempenho   Int      // 1-3 (baixo, médio, alto)
  potencial    Int      // 1-3 (baixo, médio, alto)
  quadrante    String   // 'baixo_desempenho', 'talento', 'estrela', etc.
  observacoes  String?
  dataAvaliacao DateTime @default(now())
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relacionamento
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("nine_boxes")
}

// ============================================
// MODELO: Report (Relatórios)
// ============================================
model Report {
  id        String   @id @default(uuid())
  tipo      String   // 'avaliacao', 'competencia', 'ninebox'
  titulo    String
  dados     Json     // Dados do relatório em JSON
  geradoPor String?  // ID do usuário que gerou
  createdAt DateTime @default(now())

  @@map("reports")
}
```

---

## 📚 Entendendo o Schema

### Tipos de Dados

| Prisma | PostgreSQL | Descrição |
|--------|------------|-----------|
| `String` | `TEXT` | Texto variável |
| `Int` | `INTEGER` | Número inteiro |
| `Float` | `DOUBLE PRECISION` | Número decimal |
| `Boolean` | `BOOLEAN` | Verdadeiro/Falso |
| `DateTime` | `TIMESTAMP` | Data e hora |
| `Json` | `JSONB` | Dados JSON |

### Modificadores

| Modificador | Descrição |
|-------------|-----------|
| `@id` | Chave primária |
| `@unique` | Valor único na tabela |
| `@default(uuid())` | Gera UUID automaticamente |
| `@default(now())` | Data/hora atual |
| `@updatedAt` | Atualiza automaticamente |
| `?` | Campo opcional (nullable) |

### Relacionamentos

```prisma
// User tem muitas avaliações feitas
avaliacoesFeitas Evaluation[] @relation("Avaliador")

// Evaluation pertence a um avaliador
avaliador User @relation("Avaliador", fields: [avaliadorId], references: [id])
```

**Explicação:**
- `@relation("Avaliador")` - Nome do relacionamento
- `fields: [avaliadorId]` - Campo na tabela atual
- `references: [id]` - Campo na tabela relacionada
- `onDelete: Cascade` - Deleta avaliações se usuário for deletado

---

## 🚀 Passo 3: Gerar o Cliente Prisma

```bash
npx prisma generate
```

**O que isso faz:**
- Lê o `schema.prisma`
- Gera código TypeScript/JavaScript
- Cria o cliente Prisma em `node_modules/@prisma/client`

**Saída esperada:**
```
✔ Generated Prisma Client (v6.19.3) to ./node_modules/@prisma/client
```

---

## 🗄️ Passo 4: Criar a Migração

```bash
npx prisma migrate dev --name init
```

**O que isso faz:**
1. Cria o SQL baseado no schema
2. Aplica no banco de dados
3. Salva em `prisma/migrations/`

**Saída esperada:**
```
✔ Generated Prisma Client
✔ The migration has been created successfully
✔ Applied migration 20260505210256_init
```

**Arquivo gerado:** `prisma/migrations/20260505210256_init/migration.sql`

---

## 📊 Passo 5: Visualizar o Banco

```bash
npx prisma studio
```

**O que isso faz:**
- Abre interface web em `http://localhost:5555`
- Permite visualizar e editar dados
- Útil para debug

---

## 🌱 Passo 6: Criar Dados Iniciais (Seed)

Crie o arquivo `prisma/seed.js`:

```javascript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.evaluation.deleteMany();
  await prisma.nineBox.deleteMany();
  await prisma.competency.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Dados antigos removidos');

  // Hash da senha padrão
  const senhaHash = await bcrypt.hash('senha123', 10);

  // ============================================
  // CRIAR USUÁRIOS
  // ============================================
  
  // Admin
  const admin = await prisma.user.create({
    data: {
      id: 'sys-admin-001',
      nome: 'Administrador',
      email: 'admin@empresa.com',
      senha: senhaHash,
      tipo: 'admin',
      cargo: 'Administrador do Sistema',
      departamento: 'TI'
    }
  });

  // Gestores
  const gestor1 = await prisma.user.create({
    data: {
      id: 'sys-gestor-001',
      nome: 'João Silva',
      email: 'joao.silva@empresa.com',
      senha: senhaHash,
      tipo: 'gestor',
      cargo: 'Gerente de Projetos',
      departamento: 'Tecnologia'
    }
  });

  const gestor2 = await prisma.user.create({
    data: {
      id: 'sys-gestor-002',
      nome: 'Maria Santos',
      email: 'maria.santos@empresa.com',
      senha: senhaHash,
      tipo: 'gestor',
      cargo: 'Gerente de RH',
      departamento: 'Recursos Humanos'
    }
  });

  // Colaboradores
  const colab1 = await prisma.user.create({
    data: {
      id: 'sys-colab-001',
      nome: 'Ana Costa',
      email: 'ana.costa@empresa.com',
      senha: senhaHash,
      tipo: 'colaborador',
      cargo: 'Desenvolvedora',
      departamento: 'Tecnologia'
    }
  });

  const colab2 = await prisma.user.create({
    data: {
      id: 'sys-colab-002',
      nome: 'Carlos Oliveira',
      email: 'carlos.oliveira@empresa.com',
      senha: senhaHash,
      tipo: 'colaborador',
      cargo: 'Analista',
      departamento: 'Tecnologia'
    }
  });

  console.log('✅ Usuários criados:', {
    admin: admin.email,
    gestores: [gestor1.email, gestor2.email],
    colaboradores: [colab1.email, colab2.email]
  });

  // ============================================
  // CRIAR COMPETÊNCIAS
  // ============================================
  
  const competencias = await prisma.competency.createMany({
    data: [
      {
        nome: 'Comunicação',
        descricao: 'Capacidade de se comunicar de forma clara e efetiva',
        categoria: 'comportamental',
        nivelMinimo: 1,
        nivelMaximo: 5
      },
      {
        nome: 'Liderança',
        descricao: 'Habilidade de liderar e inspirar equipes',
        categoria: 'lideranca',
        nivelMinimo: 1,
        nivelMaximo: 5
      },
      {
        nome: 'Conhecimento Técnico',
        descricao: 'Domínio de ferramentas e tecnologias',
        categoria: 'tecnica',
        nivelMinimo: 1,
        nivelMaximo: 5
      },
      {
        nome: 'Trabalho em Equipe',
        descricao: 'Capacidade de colaborar com colegas',
        categoria: 'comportamental',
        nivelMinimo: 1,
        nivelMaximo: 5
      },
      {
        nome: 'Proatividade',
        descricao: 'Iniciativa para resolver problemas',
        categoria: 'comportamental',
        nivelMinimo: 1,
        nivelMaximo: 5
      }
    ]
  });

  console.log('✅ Competências criadas:', competencias.count);

  // ============================================
  // CRIAR AVALIAÇÕES
  // ============================================
  
  // Gestor avalia colaborador (180°)
  await prisma.evaluation.create({
    data: {
      avaliadorId: gestor1.id,
      avaliadoId: colab1.id,
      tipoAvaliacao: 'gestor_para_colaborador',
      criterios: {
        pontualidade: 5,
        comunicacao: 4,
        tecnico: 5,
        proatividade: 4,
        equipe: 5
      },
      media: 4.6,
      comentario: 'Excelente profissional, muito dedicada',
      anonima: false
    }
  });

  // Colaborador avalia gestor (360°)
  await prisma.evaluation.create({
    data: {
      avaliadorId: colab1.id,
      avaliadoId: gestor1.id,
      tipoAvaliacao: 'colaborador_para_gestor',
      criterios: {
        lideranca: 5,
        comunicacao: 5,
        suporte: 4,
        feedback: 5
      },
      media: 4.75,
      comentario: 'Ótimo líder, sempre disponível',
      anonima: true
    }
  });

  // Colaborador avalia colaborador (360° peer review)
  await prisma.evaluation.create({
    data: {
      avaliadorId: colab1.id,
      avaliadoId: colab2.id,
      tipoAvaliacao: 'avaliacao_360',
      criterios: {
        colaboracao: 5,
        comunicacao: 4,
        tecnico: 5
      },
      media: 4.67,
      comentario: 'Ótimo colega de equipe',
      anonima: true
    }
  });

  console.log('✅ Avaliações criadas: 3');

  // ============================================
  // CRIAR NINE-BOX
  // ============================================
  
  await prisma.nineBox.create({
    data: {
      userId: colab1.id,
      desempenho: 3,  // Alto
      potencial: 3,   // Alto
      quadrante: 'estrela',
      observacoes: 'Alto potencial de crescimento'
    }
  });

  await prisma.nineBox.create({
    data: {
      userId: colab2.id,
      desempenho: 2,  // Médio
      potencial: 3,   // Alto
      quadrante: 'talento',
      observacoes: 'Potencial para desenvolvimento'
    }
  });

  console.log('✅ Nine-box criados: 2');

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📝 Credenciais de acesso:');
  console.log('   Admin: admin@empresa.com / senha123');
  console.log('   Gestor: joao.silva@empresa.com / senha123');
  console.log('   Colaborador: ana.costa@empresa.com / senha123');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## 🌱 Passo 7: Executar o Seed

```bash
npm run prisma:seed
```

**Saída esperada:**
```
🌱 Iniciando seed do banco de dados...
✅ Dados antigos removidos
✅ Usuários criados
✅ Competências criadas: 5
✅ Avaliações criadas: 3
✅ Nine-box criados: 2
🎉 Seed concluído com sucesso!
```

---

## ✅ Verificação

Abra o Prisma Studio e verifique:

```bash
npx prisma studio
```

Você deve ver:
- ✅ 5 usuários (1 admin, 2 gestores, 2 colaboradores)
- ✅ 5 competências
- ✅ 3 avaliações
- ✅ 2 registros nine-box

---

## 🎯 Próximos Passos

Continue para **PARTE3_ESTRUTURA_BACKEND.md** para:
1. Criar a estrutura de pastas
2. Configurar Express
3. Criar middlewares
4. Implementar módulos

---

**Tempo estimado:** 20-30 minutos  
**Dificuldade:** ⭐⭐ Médio
