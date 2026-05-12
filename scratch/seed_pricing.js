const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const modules = [
  // Dados pessoais
  { id: 'dados_basicos', name: 'Dados básicos', category: 'Dados pessoais', price: 1.0 },
  { id: 'documentos', name: 'Documentos (RG/PIS/NIS)', category: 'Dados pessoais', price: 1.0 },
  { id: 'emails', name: 'E-mails', category: 'Dados pessoais', price: 0.5 },
  { id: 'telefones', name: 'Telefones', category: 'Dados pessoais', price: 0.5 },
  { id: 'enderecos', name: 'Endereços', category: 'Dados pessoais', price: 1.0 },
  
  // Pessoas relacionadas
  { id: 'parentes', name: 'Parentes', category: 'Pessoas relacionadas', price: 1.0 },
  { id: 'vizinhos', name: 'Vizinhos', category: 'Pessoas relacionadas', price: 1.0 },
  { id: 'socio_empresa', name: 'Sócios/Empresas', category: 'Pessoas relacionadas', price: 1.5 },
  
  // Patrimônio e Renda
  { id: 'poder_aquisitivo', name: 'Poder Aquisitivo', category: 'Patrimônio e Renda', price: 1.5 },
  { id: 'veiculos', name: 'Veículos', category: 'Patrimônio e Renda', price: 1.5 },
  { id: 'dados_trabalhistas', name: 'Dados Trabalhistas', category: 'Patrimônio e Renda', price: 1.0 },
  { id: 'seguro_social', name: 'Seguro Social (INSS)', category: 'Patrimônio e Renda', price: 1.0 },
  { id: 'dados_universitarios', name: 'Dados Universitários', category: 'Patrimônio e Renda', price: 0.5 },
  
  // Crédito e Histórico
  { id: 'analise_credito', name: 'Score de Crédito', category: 'Crédito e Histórico', price: 2.0 },
  { id: 'processos', name: 'Processos Judiciais', category: 'Crédito e Histórico', price: 1.0 },
  { id: 'certidoes', name: 'Certidões Negativas', category: 'Crédito e Histórico', price: 1.0 },
];

async function seed() {
  console.log('Seeding modules...');
  for (const mod of modules) {
    await prisma.modulePricing.upsert({
      where: { id: mod.id },
      update: mod,
      create: mod,
    });
  }
  console.log('Seeding complete.');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
