import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'rfpita.ti@gmail.com';
  
  const user = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
  });

  console.log(`✅ Usuário ${user.email} agora é ADMIN!`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao atualizar usuário:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
