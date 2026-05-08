# Parte 2: Schema do Banco de Dados

## O que vamos criar

5 tabelas:
1. **User** - Usuários
2. **Evaluation** - Avaliações
3. **Competency** - Competências
4. **NineBox** - Matriz 3x3
5. Não precisa de tabela Report (é só consulta)

## Passo 1: Criar o Schema

Edite `prisma/schema.prisma` e substitua tudo por:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum UserType {
  admin
  gestor
  colaborador
}

model User {
  id           String   @id @default(uuid())
  ra           String   @unique
  nome         String
  email        String   @unique
  senha        String
  tipo         UserType
  foto         String?
  cargo        String?
  departamento String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  avaliacoesFeitas    Evaluation[] @relation("AvaliadorRelation")
  avaliacoesRecebidas Evaluation[] @relation("AvaliadoRelation")
  nineBoxAvaliacoes   NineBox[]

  @@index([ra])
  @@index([email])
  @@map("users")
}

model Evaluation {
  id            String        @id @default(uuid())
  tipoAvaliacao TipoAvaliacao
  avaliadorId   String
  avaliadoId    String
  criterios     Json
  media         Float?
  comentario    String?
  anonima       Boolean       @default(true)
  data          DateTime      @default(now())
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  avaliador User @relation("AvaliadorRelation", fields: [avaliadorId], references: [id], onDelete: Cascade)
  avaliado  User @relation("AvaliadoRelation", fields: [avaliadoId], references: [id], onDelete: Cascade)

  @@index([avaliadoId])
  @@index([avaliadorId])
  @@index([data])
  @@index([tipoAvaliacao])
  @@index([anonima])
  @@map("evaluations")
}

enum TipoAvaliacao {
  gestor_para_colaborador
  colaborador_para_gestor
  avaliacao_360
  avaliacao_180
}

model NineBox {
  id          String   @id @default(uuid())
  pessoaId    String
  performance Int
  potential   Int
  categoria   String
  comentario  String?
  data        DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  pessoa User @relation(fields: [pessoaId], references: [id], onDelete: Cascade)

  @@index([pessoaId])
  @@map("nine_box")
}

model Competency {
  id             String   @id @default(uuid())
  nome           String   @unique
  descricao      String
  tipo           String
  competenciaDe  String
  criterios      String[]
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@map("competencies")
}
```

## Passo 2: Criar a migration

```bash
npx prisma migrate dev --name init
```

Isso vai:
1. Criar as tabelas no banco
2. Gerar o Prisma Client
3. Criar pasta `prisma/migrations/`

## Passo 3: Criar dados iniciais

Crie `prisma/seed.js`:

```javascript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Limpando banco...');
  await prisma.evaluation.deleteMany();
  await prisma.nineBox.deleteMany();
  await prisma.competency.deleteMany();
  await prisma.user.deleteMany();

  console.log('Criando usuários...');
  
  const senhaHash = await bcrypt.hash('senha123', 10);
  const adminHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.create({
    data: {
      ra: '2024001',
      nome: 'Admin Sistema',
      email: 'admin@eniac.edu.br',
      senha: adminHash,
      tipo: 'admin',
      cargo: 'Administrador',
      departamento: 'TI'
    }
  });

  const gestor = await prisma.user.create({
    data: {
      ra: '2021001',
      nome: 'João Silva',
      email: 'joao.silva@eniac.edu.br',
      senha: senhaHash,
      tipo: 'gestor',
      cargo: 'Gerente de Projetos',
      departamento: 'Tecnologia'
    }
  });

  const colaborador1 = await prisma.user.create({
    data: {
      ra: '2021002',
      nome: 'Maria Santos',
      email: 'maria.santos@eniac.edu.br',
      senha: senhaHash,
      tipo: 'colaborador',
      cargo: 'Desenvolvedora',
      departamento: 'Tecnologia'
    }
  });

  const colaborador2 = await prisma.user.create({
    data: {
      ra: '2022001',
      nome: 'Ana Costa',
      email: 'ana.costa@eniac.edu.br',
      senha: senhaHash,
      tipo: 'colaborador',
      cargo: 'Analista de RH',
      departamento: 'Recursos Humanos'
    }
  });

  console.log('Criando avaliações...');
  
  await prisma.evaluation.create({
    data: {
      tipoAvaliacao: 'gestor_para_colaborador',
      avaliadorId: gestor.id,
      avaliadoId: colaborador1.id,
      criterios: {
        pontualidade: 5,
        comunicacao: 4,
        tecnico: 5,
        proatividade: 4,
        equipe: 5
      },
      media: 4.6,
      comentario: 'Excelente desempenho técnico',
      anonima: false
    }
  });

  await prisma.evaluation.create({
    data: {
      tipoAvaliacao: 'colaborador_para_gestor',
      avaliadorId: colaborador1.id,
      avaliadoId: gestor.id,
      criterios: {
        pontualidade: 5,
        comunicacao: 5,
        tecnico: 4,
        proatividade: 5,
        equipe: 5
      },
      media: 4.8,
      comentario: 'Ótima liderança',
      anonima: true
    }
  });

  console.log('Criando Nine Box...');
  
  await prisma.nineBox.create({
    data: {
      pessoaId: colaborador1.id,
      performance: 3,
      potential: 3,
      categoria: 'Superstar',
      comentario: 'Alto desempenho e potencial'
    }
  });

  await prisma.nineBox.create({
    data: {
      pessoaId: colaborador2.id,
      performance: 2,
      potential: 3,
      categoria: 'Estrela',
      comentario: 'Grande potencial de crescimento'
    }
  });

  console.log('Criando competências...');
  
  await prisma.competency.create({
    data: {
      nome: 'Comunicação Efetiva',
      descricao: 'Capacidade de se comunicar claramente',
      tipo: 'Comportamental',
      competenciaDe: 'Todos',
      criterios: ['Clareza', 'Objetividade', 'Empatia']
    }
  });

  await prisma.competency.create({
    data: {
      nome: 'Liderança',
      descricao: 'Capacidade de liderar equipes',
      tipo: 'Liderança',
      competenciaDe: 'Gestores',
      criterios: ['Motivação', 'Delegação', 'Feedback']
    }
  });

  await prisma.competency.create({
    data: {
      nome: 'Programação',
      descricao: 'Conhecimento em linguagens de programação',
      tipo: 'Técnica',
      competenciaDe: 'Desenvolvedores',
      criterios: ['JavaScript', 'Python', 'SQL']
    }
  });

  console.log('Seed concluído!');
  console.log('\nUsuários criados:');
  console.log('- Admin: admin@eniac.edu.br / admin123');
  console.log('- Gestor: joao.silva@eniac.edu.br / senha123');
  console.log('- Colaborador: maria.santos@eniac.edu.br / senha123');
  console.log('- Colaborador: ana.costa@eniac.edu.br / senha123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## Passo 4: Popular o banco

```bash
npm run prisma:seed
```

## Passo 5: Verificar

Abra o Prisma Studio para ver os dados:

```bash
npm run prisma:studio
```

Vai abrir no navegador em `http://localhost:5555`

## Verificação

Você deve ter:
- 4 usuários
- 2 avaliações
- 2 registros no Nine Box
- 3 competências

## Próximo passo

Continue na **PARTE3_ESTRUTURA_BACKEND.md** para criar a API.

Tempo: ~20 minutos
