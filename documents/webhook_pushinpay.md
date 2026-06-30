# Guia de Configuração e Funcionamento do Webhook PushinPay - Detetive Buscas

Este guia detalha como funciona a integração de pagamentos Pix em tempo real através de Webhooks na plataforma **Detetive Buscas** utilizando o gateway **PushinPay**, cobrindo o fluxo de segurança, a configuração no painel do gateway e fornecendo um script adaptado para testes.

---

## 1. Como Funciona o Webhook?
O Webhook é uma notificação do tipo HTTP POST enviada pelo servidor da PushinPay diretamente para o servidor do **Detetive Buscas** sempre que o status de uma cobrança Pix é alterado (por exemplo, quando o cliente realiza o pagamento).

No **Detetive Buscas**, o processamento foi desenhado com foco em segurança absoluta e integridade financeira:

```mermaid
sequenceDiagram
    participant P as PushinPay
    participant W as Webhook (/api/webhooks/pushinpay)
    participant B as Banco de Dados (Prisma)
    
    P->>W: POST /api/webhooks/pushinpay?token=880d... (JSON Payload)
    Note over W: 1. Valida o Token de Segurança na URL
    alt Token Inválido
        W-->>P: Retorna HTTP 401 Unauthorized
    else Token Válido
        Note over W: 2. Lê e parseia o Body (JSON ou URL-Encoded)
        W->>B: 3. Executa Transação Atômica (tx)
        B->>B: Busca transação pelo externalId (transaction_id)
        alt Transação Não Encontrada
            B-->>W: Retorna Erro 404
            W-->>P: Retorna HTTP 404 Not Found
        else Transação Já Confirmada (Completed)
            B-->>W: Retorna Sucesso (Ignorado)
            W-->>P: Retorna HTTP 200 OK
        else Transação Pendente (Pending)
            Note over B: Valida se o valor pago coincide com o esperado
            alt Divergência de Valores
                B->>B: Registra LOG de Erro de Auditoria
                B-->>W: Retorna Erro 400
                W-->>P: Retorna HTTP 400 Bad Request
            else Valores Coincidentes
                B->>B: Atualiza status da transação para COMPLETED
                B->>B: Incrementa o saldo na conta do usuário
                B->>B: Registra LOG de INFO no Sistema
                B-->>W: Transação Concluída com Sucesso
                W-->>P: Retorna HTTP 200 OK
            end
        end
    end
```

---

## 2. Como Configurar no Painel da PushinPay

Siga os seguintes passos para colocar o Webhook para funcionar em produção:

### Passo 1: Obter a URL do Webhook da sua aplicação
O webhook do **Detetive Buscas** conta com um mecanismo de segurança de camada dupla. Você pode configurar a URL de notificações da PushinPay de duas formas no painel do gateway:
1. **Via URL Limpa (Recomendado):** `https://detetivebuscas.com/api/webhooks/pushinpay`
   *Nesse modelo, o sistema validará a autenticidade comparando o token configurado no `.env` com o header de segurança `x-pushinpay-token` enviado de forma nativa pela PushinPay.*
2. **Via Query String:** `https://detetivebuscas.com/api/webhooks/pushinpay?token=SEU_TOKEN_DO_WEBHOOK`
   *Caso opte por passar o token na URL, o sistema validará o parâmetro `?token=...` de forma transparente.*

> [!NOTE]
> O token correspondente deve ser inserido sob a variável `PUSHINPAY_WEBHOOK_TOKEN` no arquivo `.env` de produção.

### Passo 2: Configurar no Painel da PushinPay
1. Faça login na sua conta no painel da **PushinPay**.
2. Vá até a seção de **Integrações** ou **Configurações de Webhook**.
3. Adicione o novo endpoint:
   - **URL de Destino:** `https://detetivebuscas.com/api/webhooks/pushinpay` (ou use a versão com Query String contendo o token do seu `.env`).
   - **Eventos:** Selecione o evento de pagamento (ou alteração de status de transação para `paid`).
   - **Token/Chave de Webhook:** Defina a chave igual ao `PUSHINPAY_WEBHOOK_TOKEN` configurado no seu `.env` (ex: `880d03ddeda5ad631ebd021c6d7b5013`).

### Passo 3: Configurar as Variáveis de Ambiente (.env) na VPS
No arquivo `.env` da aplicação na sua VPS, certifique-se de que as seguintes chaves estão configuradas corretamente:

```env
# Token usado para autenticar requisições de API normais (Bearer Token)
PUSHINPAY_TOKEN="67768|cy3n6j9UdLD0FeXc0ZjhiNRYrcbGL4pwBIbzJT5B0d32938d"

# Token de segurança gerado especificamente para o Webhook (Query String ?token=...)
PUSHINPAY_WEBHOOK_TOKEN="880d03ddeda5ad631ebd021c6d7b5013"
```

> [!IMPORTANT]
> Lembre-se de rodar `./update.sh` na VPS após alterar o arquivo `.env` para aplicar as novas configurações ao container do Next.js.

---

## 3. Payload do Webhook (Exemplo de Dados)
O formato do JSON enviado pela PushinPay para o webhook segue a estrutura abaixo:

```json
{
  "id": "A21A4CDF-70B5-4E06-A485-F9FA47874ADB",
  "transaction_id": "A21A4C79-A568-44A9-80CB-4EF3AFA6A777",
  "status": "paid",
  "value": "1000",
  "created_at": "2026-06-30T18:57:43.000Z"
}
```
*Note que `value` é enviado em centavos (ex: `"1000"` equivale a R$ 10,00).*

---

## 4. Script de Simulação e Teste (Node.js)
Salve o código abaixo como `test_webhook.js` para simular o disparo de uma notificação do webhook da PushinPay para a sua aplicação local ou em produção. Ele passa o token de segurança na query string (`?token=...`) conforme exigido pela segurança do Detetive Buscas.

```javascript
/**
 * Script de Teste de Webhook - Detetive Buscas
 * Como usar: node test_webhook.js <URL_BASE_WEBHOOK> <WEBHOOK_TOKEN> <TRANSACTION_ID>
 * Exemplo local: node test_webhook.js http://localhost:3000/api/webhooks/pushinpay 880d03ddeda5ad631ebd021c6d7b5013 A21A4C79-A568-44A9-80CB-4EF3AFA6A777
 */
const http = require('http');
const https = require('https');

const args = process.argv.slice(2);
const baseUrl = args[0] || 'http://localhost:3000/api/webhooks/pushinpay';
const webhookToken = args[1] || '880d03ddeda5ad631ebd021c6d7b5013';
const transactionId = args[2] || 'A21A4C79-A568-44A9-80CB-4EF3AFA6A777';

// Adiciona o token de segurança na query string (?token=...)
const targetUrl = new URL(baseUrl);
targetUrl.searchParams.set('token', webhookToken);

console.log("🚀 Iniciando simulação de Webhook da PushinPay...");
console.log(`📍 URL Alvo: ${targetUrl.toString()}`);
console.log(`🔑 Token de Segurança: ${webhookToken.substring(0, 6)}...`);
console.log(`🆔 ID da Transação: ${transactionId}\n`);

// Payload JSON simulando o pagamento concluído na PushinPay (valor em centavos, ex: 1000 = R$ 10,00)
const payload = JSON.stringify({
    transaction_id: transactionId,
    status: 'paid',
    value: '1000'
});

const client = targetUrl.protocol === 'https:' ? https : http;

const options = {
    hostname: targetUrl.hostname,
    port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
    path: targetUrl.pathname + targetUrl.search,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
    }
};

const req = client.request(options, (res) => {
    let data = '';
    console.log(`STATUS HTTP RETORNADO: ${res.statusCode}`);
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('RESPOSTA DO SERVIDOR:', data);
        if (res.statusCode === 200) {
            console.log('\n🟢 SUCESSO: Webhook aceito e processado com sucesso!');
        } else {
            console.log('\n🔴 ERRO: Verifique o console da aplicação, os logs do SystemLog e as chaves no seu .env.');
        }
    });
});

req.on('error', (e) => {
    console.error(`\n❌ Falha na conexão: ${e.message}`);
});

req.write(payload);
req.end();
```
