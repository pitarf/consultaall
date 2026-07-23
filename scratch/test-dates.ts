function testDates() {
  const d1 = new Date();
  console.log("new Date().toLocaleDateString('pt-BR'):", d1.toLocaleDateString('pt-BR'));
  
  const d2 = new Date("2026-07-22T22:00:00.000Z"); // From DB Prisma
  console.log("DB Date toLocaleDateString('pt-BR'):", d2.toLocaleDateString('pt-BR'));
  
  // What if we force TimeZone?
  console.log("Forced TZ:", d1.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }));
}
testDates();
