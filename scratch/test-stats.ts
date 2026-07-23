import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testStats() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const dailyData = await prisma.transaction.findMany({
    where: { 
      type: 'DEPOSIT', 
      status: 'COMPLETED',
      createdAt: { gte: thirtyDaysAgo }
    },
    select: { amount: true, createdAt: true },
    orderBy: { createdAt: 'asc' }
  });

  const statsByDay: { [key: string]: number } = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('pt-BR');
    statsByDay[dateStr] = 0;
  }

  dailyData.forEach((t) => {
    const dateStr = t.createdAt.toLocaleDateString('pt-BR');
    if (dateStr in statsByDay) {
      statsByDay[dateStr] += t.amount;
    } else {
      console.log(`Mismatch! Database date ${dateStr} not in statsByDay keys!`);
      // Add it anyway for debugging
      statsByDay[dateStr] = (statsByDay[dateStr] || 0) + t.amount;
    }
  });

  console.log(statsByDay);
}

testStats();
