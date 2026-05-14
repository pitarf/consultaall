import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // 1. Configurações do Sistema
  await prisma.systemSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteTitle: 'ConsultaALL - Inteligência em Dados',
      siteDescription: 'A plataforma mais completa para consulta de dados e informações.',
      supportWhatsapp: '5511999999999',
    },
  });

  // 2. Módulos de Precificação com Categorias
  const modules = [
    // Categoria: Dados pessoais
    { id: 'dados_basicos', name: 'Dados básicos', price: 1.0, category: 'Dados pessoais' },
    { id: 'documentos', name: 'Documentos (RG/PIS/NIS)', price: 1.0, category: 'Dados pessoais' },
    { id: 'emails', name: 'E-mails', price: 0.5, category: 'Dados pessoais' },
    { id: 'telefones', name: 'Telefones', price: 0.5, category: 'Dados pessoais' },
    { id: 'enderecos', name: 'Endereços', price: 1.0, category: 'Dados pessoais' },
    
    // Categoria: Pessoas relacionadas
    { id: 'parentes', name: 'Parentes', price: 1.0, category: 'Pessoas relacionadas' },
    { id: 'vizinhos', name: 'Vizinhos', price: 1.0, category: 'Pessoas relacionadas' },
    { id: 'socio_empresa', name: 'Sócios/Empresas', price: 1.5, category: 'Pessoas relacionadas' },
    
    // Categoria: Patrimônio e Renda
    { id: 'poder_aquisitivo', name: 'Poder Aquisitivo', price: 1.5, category: 'Patrimônio e Renda' },
    { id: 'dados_trabalhistas', name: 'Dados Trabalhistas', price: 1.0, category: 'Patrimônio e Renda' },
    { id: 'seguro_social', name: 'Seguro Social (INSS)', price: 1.0, category: 'Patrimônio e Renda' },
    { id: 'dados_universitarios', name: 'Dados Universitários', price: 0.5, category: 'Patrimônio e Renda' },
    
    // Categoria: Veículos
    { id: 'veiculo_basico', name: 'Dados Básicos e Técnicos', price: 1.0, category: 'Veículos' },
    { id: 'veiculo_documentacao', name: 'Situação e Documentação', price: 1.0, category: 'Veículos' },
    { id: 'veiculo_proprietario', name: 'Dados do Proprietário', price: 1.5, category: 'Veículos' },
    { id: 'veiculo_restricoes', name: 'Restrições, Leilão e Histórico', price: 2.0, category: 'Veículos' },

    // Categoria: Empresas
    { id: 'cnpj_basico', name: 'Dados Básicos e Natureza', price: 1.0, category: 'Empresas' },
    { id: 'cnpj_contato', name: 'Contato e Localização', price: 1.0, category: 'Empresas' },
    { id: 'cnpj_filiais', name: 'Lista de Filiais', price: 1.0, category: 'Empresas' },
    { id: 'cnpj_socios', name: 'Quadro Societário (QSA)', price: 1.5, category: 'Empresas' },
    { id: 'cnpj_faturamento', name: 'Faturamento e Porte', price: 2.0, category: 'Empresas' },

    // Categoria: Crédito e Histórico
    { id: 'analise_credito', name: 'Score de Crédito', price: 2.0, category: 'Crédito e Histórico' },
    { id: 'processos', name: 'Processos Judiciais', price: 1.0, category: 'Crédito e Histórico' },
    { id: 'certidoes', name: 'Certidões Negativas', price: 1.0, category: 'Crédito e Histórico' },
  ];

  for (const m of modules) {
    await prisma.modulePricing.upsert({
      where: { id: m.id },
      update: { name: m.name, price: m.price, category: m.category },
      create: { id: m.id, name: m.name, price: m.price, category: m.category },
    });
  }

  console.log('✅ Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
