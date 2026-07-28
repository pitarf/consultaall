const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const page = await prisma.page.findFirst({
    where: { slug: 'consulta-placa' }
  });
  if (!page) {
    console.log("Página não encontrada!");
  } else {
    console.log("Título:", page.title);
    console.log("Tem script?", page.content.includes('<script>'));
    const matches = page.content.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi);
    console.log("Script tags encontradas:", matches ? matches.length : 0);
    if (matches) {
      matches.forEach((m, i) => {
        console.log(`Tag ${i + 1} de tamanho: ${m.length}`);
      });
    }
  }
  await prisma.$disconnect();
}

main().catch(console.error);
