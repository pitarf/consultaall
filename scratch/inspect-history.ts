
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function inspect() {
  const query = '11985430773';
  const history = await prisma.searchHistory.findMany({
    where: { 
      query: { contains: query }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  console.log('Resultados encontrados:', history.length);
  history.forEach(h => {
    console.log(`- ID: ${h.id} | Data: ${h.createdAt} | Modules: ${h.modules} | Target: ${h.target}`);
  });
  
  await prisma.$disconnect();
}

inspect();
