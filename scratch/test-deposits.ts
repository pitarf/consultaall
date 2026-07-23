import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugData() {
  const allDeposits = await prisma.transaction.findMany({
    where: { type: 'DEPOSIT', status: 'COMPLETED' },
    select: { amount: true, createdAt: true, status: true }
  });
  console.log(allDeposits);
}

debugData();
