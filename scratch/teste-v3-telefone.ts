
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n');
const env: Record<string, string> = {};
envLines.forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    let cleanValue = value.trim();
    if (cleanValue.startsWith('"') && cleanValue.endsWith('"')) {
      cleanValue = cleanValue.substring(1, cleanValue.length - 1);
    }
    env[key.trim()] = cleanValue;
  }
});

const TOKEN = env['DIRECT_DATA_TOKEN'];
const V3_URL = 'https://apiv3.directd.com.br';

async function testPhone() {
  const phone = '11985430773';
  const url = `${V3_URL}/api/EnriquecimentoLead?TOKEN=${TOKEN}&CELULAR=${phone}`;
  
  console.log(`\nTestando CELULAR: ${phone}`);
  try {
    const response = await axios.get(url);
    console.log('Status:', response.status);
    console.log('JSON Completo:', JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    console.error('Erro:', error.response?.data || error.message);
  }
}

testPhone();
