
const axios = require('axios');
const https = require('https');

async function testeEnriquecimentoV3() {
  const email = 'ghabrielcv@gmail.com';
  const TOKEN = '09223E37-417E-4D50-B74F-A928A421E407';
  const url = `https://apiv3.directd.com.br/api/EnriquecimentoLead?TOKEN=${TOKEN}&EMAIL=${encodeURIComponent(email)}`;
  
  console.log(`\n🔍 Testando V3: ${url}`);
  
  try {
    const response = await axios.get(url, {
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    });
    
    console.log('Status:', response.status);
    console.log('Resultado (primeiros 500 chars):', JSON.stringify(response.data, null, 2).substring(0, 500));
    
    if (response.data.retorno) {
      console.log('\n✅ SUCESSO! A API V3 RESPONDEU COM DADOS.');
    } else {
      console.log('\n⚠️ API respondeu, mas sem retorno de dados:', response.data.metaDados?.mensagem);
    }
  } catch (e) {
    console.log(`❌ Erro na consulta V3: ${e.message}`);
    if (e.response) {
      console.log('Status do Erro:', e.response.status);
      console.log('Corpo do Erro:', e.response.data);
    }
  }
}

testeEnriquecimentoV3();
