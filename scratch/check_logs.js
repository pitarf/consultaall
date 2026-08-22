const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Fetching recent errors/logs...');
  const logs = await prisma.systemLog.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' }
  });
  console.dir(logs, { depth: null });
  
  console.log('\nFetching recent searches...');
  const searches = await prisma.searchHistory.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      target: true,
      query: true,
      status: true,
      cost: true,
      createdAt: true,
      result: false
    }
  });
  console.dir(searches, { depth: null });
}

main().catch(console.error).finally(() => prisma.$disconnect());
