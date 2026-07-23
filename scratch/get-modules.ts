import { prisma } from '../src/lib/prisma';
async function main() {
  const pricings = await prisma.modulePricing.findMany();
  console.log(pricings.map(p => ({ id: p.id, name: p.name, price: p.price })));
}
main();
