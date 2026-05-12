import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultModules = [
  { id: 'dados_basicos', name: 'Dados básicos', category: 'Dados pessoais', price: 0.25 },
  { id: 'emails', name: 'E-mails', category: 'Dados pessoais', price: 0.15 },
  { id: 'enderecos', name: 'Endereços', category: 'Dados pessoais', price: 0.30 },
  { id: 'telefones', name: 'Telefones', category: 'Dados pessoais', price: 0.20 },
  { id: 'score_credito', name: 'Score de crédito', category: 'Crédito', price: 5.00 },
  { id: 'risco_credito', name: 'Risco de crédito', category: 'Crédito', price: 3.50 }
];

async function main() {
  console.log('Populando banco de preços...');
  for (const mod of defaultModules) {
    await prisma.modulePricing.upsert({
      where: { id: mod.id },
      update: { price: mod.price },
      create: mod,
    });
  }
  console.log('Pronto!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
