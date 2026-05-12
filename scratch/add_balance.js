const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addBalance() {
  const user = await prisma.user.findFirst();
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { balance: 1000.0 }
    });
    console.log(`Saldo atualizado para ${user.email}: R$ 1.000,00`);
  } else {
    console.log('Nenhum usuário encontrado.');
  }
}

addBalance()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
