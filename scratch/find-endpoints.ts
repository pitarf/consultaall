
const axios = require('axios');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });
const TOKEN = '09223E37-417E-4D50-B74F-A928A421E407';

async function bruteForceEndpoints() {
  const variations = [
    '/api/AdvancedSearch/FilterNaturalPerson',
    '/api/v1/AdvancedSearch/FilterNaturalPerson',
    '/api/v2/AdvancedSearch/FilterNaturalPerson',
    '/AdvancedSearch/FilterNaturalPerson',
    '/api/AdvancedSearch/ViewSearch', // Teste de outro método
    '/api/ConsultaVeicular' // Teste de algo que sabemos que existe (embora em outro domínio, testar aqui)
  ];

  const domains = [
    'https://api.directd.com.br',
    'https://apiv3.directd.com.br'
  ];

  for (const domain of domains) {
    for (const path of variations) {
      const url = domain + path;
      console.log(`\n🧪 Testando: ${url}`);
      try {
        const res = await axios.post(url, {}, { 
          headers: { 'Token': TOKEN },
          httpsAgent: agent,
          validateStatus: false
        });
        console.log(`Status: ${res.status}`);
        if (res.status !== 404) {
          console.log('💡 Resposta interessante encontrada!');
        }
      } catch (e) {
        console.log(`❌ Erro: ${e.message}`);
      }
    }
  }
}

bruteForceEndpoints();
