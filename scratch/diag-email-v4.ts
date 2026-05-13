
const https = require('https');
const http = require('http');

async function diagnosticoFinal() {
  const email = 'ghabrielcv@gmail.com';
  const TOKEN = '09223E37-417E-4D50-B74F-A928A421E407';
  
  const tests = [
    { url: 'https://api.directd.com.br/api/AdvancedSearch/FilterNaturalPerson', agent: new https.Agent({ rejectUnauthorized: false }) },
    { url: 'http://api.directd.com.br/api/AdvancedSearch/FilterNaturalPerson', agent: new http.Agent() },
    { url: 'https://apiv3.directd.com.br/api/AdvancedSearch/FilterNaturalPerson', agent: new https.Agent({ rejectUnauthorized: false }) },
    { url: 'https://apiv3.directd.com.br/api/FilterNaturalPerson', agent: new https.Agent({ rejectUnauthorized: false }) }
  ];

  for (const test of tests) {
    console.log(`\n🧪 Testando: ${test.url}`);
    try {
      // Usando fetch nativo com o agent configurado
      const response = await fetch(test.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Token': TOKEN },
        body: JSON.stringify({ email }),
        // @ts-ignore
        agent: test.agent 
      });
      
      console.log(`Status: ${response.status}`);
      const text = await response.text();
      console.log(`Resposta (primeiros 100 chars): ${text.substring(0, 100)}`);
      
      if (response.ok) {
        console.log('✅ SUCESSO NESTA URL!');
        return;
      }
    } catch (e: any) {
      console.log(`❌ Erro: ${e.message}`);
    }
  }
}

diagnosticoFinal();
