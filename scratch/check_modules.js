const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkModules() {
  const modules = await prisma.modulePricing.findMany();
  console.log('Modules in DB:', JSON.stringify(modules, null, 2));
}

checkModules()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
