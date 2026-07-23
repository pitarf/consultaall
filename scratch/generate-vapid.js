const webpush = require('web-push');
const fs = require('fs');

const vapidKeys = webpush.generateVAPIDKeys();

const envContent = `\nNEXT_PUBLIC_VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"\nVAPID_PRIVATE_KEY="${vapidKeys.privateKey}"\nVAPID_SUBJECT="mailto:contato@detetivebuscas.com"\n`;

fs.appendFileSync('.env', envContent);
console.log('VAPID Keys generated and appended to .env:');
console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);
