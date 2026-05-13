
import { performSmartSearch } from '../src/services/direct-data';
import { prisma } from '../src/lib/prisma';

async function diagnosticoEmail() {
  const email = 'ghabrielcv@gmail.com';
  const modulos = ['dados_basicos', 'telefones', 'emails'];
  
  // Teste de ambiente
  console.log('--- DEBUG AMBIENTE ---');
  console.log('TOKEN carregado:', process.env.DIRECT_DATA_TOKEN ? 'SIM (Começa com ' + process.env.DIRECT_DATA_TOKEN.substring(0,4) + ')' : 'NÃO');
  console.log('URL Base:', process.env.DIRECT_DATA_BASE_URL);
  
  console.log('\n🔍 Iniciando Busca...');

  try {
    // Tenta a busca
    const resultado = await performSmartSearch('email', email, modulos);
    console.log('\nResultado Final:', resultado);
  } catch (error: any) {
    console.error('\n💥 ERRO NO FETCH:', error.message);
    if (error.cause) console.error('Causa:', error.cause);
  } finally {
    await prisma.$disconnect();
  }
}

diagnosticoEmail();
