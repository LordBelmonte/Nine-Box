/**
 * Scripts de Migração de Dados do MySQL para PostgreSQL
 * 
 * Este arquivo contém scripts para migrar dados do sistema legado (MySQL)
 * para o novo sistema (PostgreSQL com Prisma).
 * 
 * Antes de executar:
 * 1. Certifique-se de que o banco de dados MySQL está acessível
 * 2. Configure as conexões de banco de dados
 * 3. Execute os scripts na ordem indicada
 */

import mysql from 'mysql2/promise';
import { prisma } from '../src/config/database.js';

// Configuração do MySQL (legado)
const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'ninebox_legado'
};

// Criar conexão com MySQL
async function getMySQLConnection() {
  return await mysql.createConnection(mysqlConfig);
}

/**
 * Migração 1: Usuários
 * Migra a tabela 'usuarios' do MySQL para 'User' no PostgreSQL
 */
async function migrateUsers() {
  console.log('🔄 Iniciando migração de usuários...');
  
  const connection = await getMySQLConnection();
  
  try {
    const [rows] = await connection.execute(`
      SELECT * FROM usuarios
    `);
    
    for (const user of rows) {
      // Mapeamento de tipos de usuário
      let tipo = 'colaborador';
      if (user.tipo_usuario === 'admin') tipo = 'admin';
      else if (user.tipo_usuario === 'gestor') tipo = 'gestor';
      
      await prisma.user.create({
        data: {
          ra: user.cpf || user.ra,
          nome: user.nome,
          email: user.email,
          senha: user.senha,
          tipo,
          cargo: user.cargo || null,
          departamento: user.departamento || null,
          foto: user.foto || null
        }
      });
      
      console.log(`✅ Usuário migrado: ${user.nome}`);
    }
    
    console.log('✅ Migração de usuários concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro na migração de usuários:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

/**
 * Migração 2: Gestores
 * Migra a tabela 'gestor' do MySQL para 'GestorColaborador' no PostgreSQL
 */
async function migrateGestores() {
  console.log('🔄 Iniciando migração de gestores...');
  
  const connection = await getMySQLConnection();
  
  try {
    const [rows] = await connection.execute(`
      SELECT * FROM gestor
    `);
    
    for (const gestor of rows) {
      // Buscar o gestor no PostgreSQL pelo CPF
      const gestorUser = await prisma.user.findFirst({
        where: { ra: gestor.cpf_gestor }
      });
      
      // Buscar o colaborador no PostgreSQL pelo CPF
      const colaboradorUser = await prisma.user.findFirst({
        where: { ra: gestor.cpf_colaborador }
      });
      
      if (gestorUser && colaboradorUser) {
        await prisma.gestorColaborador.create({
          data: {
            gestorId: gestorUser.id,
            colaboradorId: colaboradorUser.id
          }
        });
        
        console.log(`✅ Relação gestor-colaborador migrada: ${gestorUser.nome} → ${colaboradorUser.nome}`);
      }
    }
    
    console.log('✅ Migração de gestores concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro na migração de gestores:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

/**
 * Migração 3: Competências
 * Migra a tabela 'competencias' do MySQL para 'Competency' no PostgreSQL
 */
async function migrateCompetencies() {
  console.log('🔄 Iniciando migração de competências...');
  
  const connection = await getMySQLConnection();
  
  try {
    const [rows] = await connection.execute(`
      SELECT * FROM competencias
    `);
    
    for (const comp of rows) {
      await prisma.competency.create({
        data: {
          nome: comp.competencia,
          descricao: comp.descricao || '',
          tipo: comp.tipo || 'desempenho',
          competenciaDe: comp.competencia_de || 'todos',
          criterios: comp.criterios ? JSON.parse(comp.criterios) : [],
          ideal: comp.ideal || null,
          bom: comp.bom || null,
          mediano: comp.mediano || null,
          a_melhorar: comp.a_melhorar || null
        }
      });
      
      console.log(`✅ Competência migrada: ${comp.competencia}`);
    }
    
    console.log('✅ Migração de competências concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro na migração de competências:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

/**
 * Migração 4: Avaliações de Colaboradores
 * Migra as tabelas 'avaliacoes' e 'respostas_avaliacao' do MySQL
 * para 'EvaluationCampaign' e 'Evaluation' no PostgreSQL
 */
async function migrateEvaluations() {
  console.log('🔄 Iniciando migração de avaliações...');
  
  const connection = await getMySQLConnection();
  
  try {
    // Migra as avaliações (campanhas)
    const [avaliacoes] = await connection.execute(`
      SELECT * FROM avaliacoes
    `);
    
    for (const avaliacao of avaliacoes) {
      // Criar campanha de avaliação
      const campaign = await prisma.evaluationCampaign.create({
        data: {
          nome: avaliacao.nome,
          descricao: avaliacao.descricao || '',
          tipoAlvo: 'colaborador',
          status: 'finalizada',
          dataInicio: avaliacao.data_criacao || new Date(),
          dataFim: avaliacao.data_fim || new Date(),
          criterios: avaliacao.criterios ? JSON.parse(avaliacao.criterios) : []
        }
      });
      
      console.log(`✅ Campanha migrada: ${avaliacao.nome}`);
      
      // Migrar os avaliados desta avaliação
      const [avaliados] = await connection.execute(`
        SELECT * FROM avaliado_avaliacao WHERE avaliacao_id = ?
      `, [avaliacao.id]);
      
      for (const avaliado of avaliados) {
        const user = await prisma.user.findFirst({
          where: { ra: avaliado.cpf_avaliado }
        });
        
        if (user) {
          await prisma.evaluationCampaign.update({
            where: { id: campaign.id },
            data: {
              avaliacoes: {
                create: {
                  avaliadoId: user.id,
                  avaliadorId: user.id, // Temporário, será atualizado
                  campaignId: campaign.id,
                  criterios: {},
                  media: 0,
                  comentario: null,
                  anonima: true
                }
              }
            }
          });
          
          console.log(`✅ Avaliado adicionado à campanha: ${user.nome}`);
        }
      }
      
      // Migrar as respostas
      const [respostas] = await connection.execute(`
        SELECT * FROM respostas_avaliacao WHERE avaliacao_id = ?
      `, [avaliacao.id]);
      
      for (const resposta of respostas) {
        const avaliador = await prisma.user.findFirst({
          where: { ra: resposta.cpf_avaliador }
        });
        
        const avaliado = await prisma.user.findFirst({
          where: { ra: resposta.cpf_avaliado }
        });
        
        if (avaliador && avaliado) {
          await prisma.evaluation.create({
            data: {
              campaignId: campaign.id,
              avaliadorId: avaliador.id,
              avaliadoId: avaliado.id,
              criterios: resposta.respostas ? JSON.parse(resposta.respostas) : {},
              media: resposta.media || 0,
              comentario: resposta.comentario || null,
              anonima: resposta.anonima || true
            }
          });
          
          console.log(`✅ Resposta migrada: ${avaliador.nome} → ${avaliado.nome}`);
        }
      }
    }
    
    console.log('✅ Migração de avaliações concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro na migração de avaliações:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

/**
 * Migração 5: Avaliações de Gestores
 * Migra as tabelas 'avaliacoes_gestor' e 'respostas_avaliacao_gestor' do MySQL
 */
async function migrateGestorEvaluations() {
  console.log('🔄 Iniciando migração de avaliações de gestores...');
  
  const connection = await getMySQLConnection();
  
  try {
    const [avaliacoes] = await connection.execute(`
      SELECT * FROM avaliacoes_gestor
    `);
    
    for (const avaliacao of avaliacoes) {
      const campaign = await prisma.evaluationCampaign.create({
        data: {
          nome: avaliacao.nome,
          descricao: avaliacao.descricao || '',
          tipoAlvo: 'gestor',
          status: 'finalizada',
          dataInicio: avaliacao.data_criacao || new Date(),
          dataFim: avaliacao.data_fim || new Date(),
          criterios: avaliacao.criterios ? JSON.parse(avaliacao.criterios) : []
        }
      });
      
      console.log(`✅ Campanha de gestor migrada: ${avaliacao.nome}`);
      
      // Migrar as respostas
      const [respostas] = await connection.execute(`
        SELECT * FROM respostas_avaliacao_gestor WHERE avaliacao_id = ?
      `, [avaliacao.id]);
      
      for (const resposta of respostas) {
        const avaliador = await prisma.user.findFirst({
          where: { ra: resposta.cpf_avaliador }
        });
        
        const avaliado = await prisma.user.findFirst({
          where: { ra: resposta.cpf_avaliado }
        });
        
        if (avaliador && avaliado) {
          await prisma.evaluation.create({
            data: {
              campaignId: campaign.id,
              avaliadorId: avaliador.id,
              avaliadoId: avaliado.id,
              criterios: resposta.respostas ? JSON.parse(resposta.respostas) : {},
              media: resposta.media || 0,
              comentario: resposta.comentario || null,
              anonima: resposta.anonima || true
            }
          });
          
          console.log(`✅ Resposta de gestor migrada: ${avaliador.nome} → ${avaliado.nome}`);
        }
      }
    }
    
    console.log('✅ Migração de avaliações de gestores concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro na migração de avaliações de gestores:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

/**
 * Executa todas as migrações na ordem correta
 */
async function runAllMigrations() {
  console.log('🚀 Iniciando processo de migração completa...');
  console.log('=====================================\n');
  
  try {
    await migrateUsers();
    console.log('\n');
    
    await migrateGestores();
    console.log('\n');
    
    await migrateCompetencies();
    console.log('\n');
    
    await migrateEvaluations();
    console.log('\n');
    
    await migrateGestorEvaluations();
    console.log('\n');
    
    console.log('=====================================');
    console.log('✅ Todas as migrações foram concluídas com sucesso!');
  } catch (error) {
    console.error('\n❌ Erro durante o processo de migração:', error);
    process.exit(1);
  }
}

// Executar migrações se este script for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllMigrations();
}

export {
  migrateUsers,
  migrateGestores,
  migrateCompetencies,
  migrateEvaluations,
  migrateGestorEvaluations,
  runAllMigrations
};
