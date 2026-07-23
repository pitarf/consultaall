import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const searchId = "A21A4C79-A568-44A9-80CB-4EF3AFA6A777";
  
  console.log(`🔎 Procurando pela transação com ID/ExternalId contendo: ${searchId}`);
  
  // 1. Procurando por externalId exato
  const tx1 = await prisma.transaction.findFirst({
    where: {
      externalId: {
        equals: searchId,
        mode: 'insensitive' // case insensitive
      }
    },
    include: { user: true }
  });
  console.log("Busca por externalId (case-insensitive):", JSON.stringify(tx1, null, 2));

  // 2. Procurando por ID interno exato
  const tx2 = await prisma.transaction.findUnique({
    where: { id: searchId },
    include: { user: true }
  }).catch(() => null);
  console.log("Busca por ID interno:", JSON.stringify(tx2, null, 2));

  // 3. Listando as últimas 10 transações do tipo DEPOSIT no banco
  const recentDeposits = await prisma.transaction.findMany({
    where: { type: "DEPOSIT" },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { user: { select: { email: true } } }
  });
  console.log("Últimos 10 depósitos criados:", JSON.stringify(recentDeposits, null, 2));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
