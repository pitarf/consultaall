const fs = require('fs');
const path = require('path');

const data = JSON.stringify({
  token: "eyJleHAiOjE3ODExMDUzMDIsImFwaV90YXJnZXQiOiJjcGYtZGV0YWxoYWRhLXBlc3NvYS1maXNpY2EiLCJsaW1pdF9yZXEiOjUsInBhY290ZSI6InRlc3RlIiwiY29tcHJhX2lkIjoyOTR9",
  target: "cpf-detalhada-pessoa-fisica",
  pacote: "teste",
  query: "50415398800"
});

const options = {
  hostname: 'services.apiconsultabrasil.com',
  port: 443,
  path: '/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const https = require('https');
const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (d) => { body += d; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const filePath = path.join(__dirname, '..', 'src', 'services', 'api-sample-response.json');
    fs.writeFileSync(filePath, body);
    console.log('Saved to:', filePath);
    console.log('Response:', body);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
