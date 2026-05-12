import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'rfpita.ti@gmail.com';
  
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });
    console.log(`✅ Sucesso! O usuário ${user.email} agora é ADMIN.`);
  } catch (error) {
    console.error(`❌ Erro: Usuário com e-mail ${email} não encontrado.`);
  } finally {
    await prisma.$disconnect();
  }
}

main();
