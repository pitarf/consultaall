const fs = require('fs');
const path = require('path');

const docXmlPath = path.join(__dirname, 'extracted_docx', 'word', 'document.xml');
if (!fs.existsSync(docXmlPath)) {
  console.error("document.xml not found at: " + docXmlPath);
  process.exit(1);
}

const content = fs.readFileSync(docXmlPath, 'utf8');
const regex = /<w:t[^>]*>(.*?)<\/w:t>/g;
let match;
let text = [];

while ((match = regex.exec(content)) !== null) {
  text.push(match[1]);
}

fs.writeFileSync(path.join(__dirname, 'docx_content.txt'), text.join('\n'), 'utf8');
console.log("Successfully extracted text. Total runs: " + text.length);
