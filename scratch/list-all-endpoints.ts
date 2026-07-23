import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const filePath = path.join('C:', 'Users', 'rfpit', '.gemini', 'antigravity', 'brain', '2c2b36cc-56a4-4190-bded-70adfe0db616', '.system_generated', 'steps', '2547', 'content.md');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  const jsonStart = fileContent.indexOf('{');
  const jsonStr = fileContent.substring(jsonStart);
  
  try {
    const swagger = JSON.parse(jsonStr);
    const paths = Object.keys(swagger.paths);
    
    console.log(`📌 Listando TODOS os ${paths.length} endpoints do Swagger V3:`);
    paths.forEach((p, index) => {
      const summary = swagger.paths[p].get?.summary || swagger.paths[p].post?.summary || 'Sem descrição';
      console.log(`${index + 1}. ${p} - ${summary}`);
    });
  } catch (error: any) {
    console.error('Erro:', error.message);
  }
}

main();
