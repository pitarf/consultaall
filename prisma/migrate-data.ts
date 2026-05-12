import { PrismaClient } from '@prisma/client';

async function migrate() {
  const localUrl = "postgresql://postgres:Rafael@180@localhost:5432/consultaall?schema=public";
  const neonUrl = "postgresql://neondb_owner:npg_HldaYWo92Beg@ep-steep-moon-apdvw1tz-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require";

  console.log('🔄 Conectando aos bancos de dados...');
  const localPrisma = new PrismaClient({ datasources: { db: { url: localUrl } } });
  const neonPrisma = new PrismaClient({ datasources: { db: { url: neonUrl } } });

  try {
    // 1. Migrar Usuários
    console.log('👥 Migrando Usuários...');
    const users = await localPrisma.user.findMany();
    for (const user of users) {
      await neonPrisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user,
      });
    }

    // 2. Migrar Configurações
    console.log('⚙️ Migrando Configurações...');
    const settings = await localPrisma.systemSetting.findMany();
    for (const setting of settings) {
      await neonPrisma.systemSetting.upsert({
        where: { id: setting.id },
        update: setting,
        create: setting,
      });
    }

    // 3. Migrar Preços
    console.log('💰 Migrando Módulos e Preços...');
    const modules = await localPrisma.modulePricing.findMany();
    for (const mod of modules) {
      await neonPrisma.modulePricing.upsert({
        where: { id: mod.id },
        update: mod,
        create: mod,
      });
    }

    // 4. Migrar Transações
    console.log('💸 Migrando Transações...');
    const transactions = await localPrisma.transaction.findMany();
    for (const tx of transactions) {
      await neonPrisma.transaction.upsert({
        where: { id: tx.id },
        update: tx,
        create: tx,
      });
    }

    // 5. Migrar Histórico de Busca
    console.log('🔍 Migrando Histórico de Buscas...');
    const searches = await localPrisma.searchHistory.findMany();
    for (const s of searches) {
      await neonPrisma.searchHistory.upsert({
        where: { id: s.id },
        update: s,
        create: s,
      });
    }

    // 6. Migrar Logs
    console.log('📜 Migrando Logs...');
    const logs = await localPrisma.systemLog.findMany();
    for (const log of logs) {
      await neonPrisma.systemLog.upsert({
        where: { id: log.id },
        update: log,
        create: log,
      });
    }

    console.log('✅ Migração concluída com sucesso! Todos os dados estão no Neon.');

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
  } finally {
    await localPrisma.$disconnect();
    await neonPrisma.$disconnect();
  }
}

migrate();
