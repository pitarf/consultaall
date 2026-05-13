
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fixHistory() {
  const query = 'ghabrielcv@gmail.com';
  // Módulos que costumam ser selecionados (ajustados para bater com o padrão)
  const modules = 'dados_basicos,dados_trabalhistas,documentos,emails,enderecos,parentes,poder_aquisitivo,telefones';
  
  const updated = await prisma.searchHistory.updateMany({
    where: { 
      query: query,
      modules: null 
    },
    data: { 
      modules: modules
    }
  });
  
  console.log(`Sucesso! ${updated.count} registros de histórico foram preparados para o cache.`);
  await prisma.$disconnect();
}

fixHistory();
