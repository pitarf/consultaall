# Manual do Desenvolvedor - ConsultaALL

## Integração de API e Modo Híbrido (DirectData V3)
O sistema utiliza o arquivo `src/services/direct-data.ts` como ponte de comunicação.
- **Modo Real:** Ativado quando `isDemo: false`. Realiza as chamadas via `axios` para a V3 (`/EnriquecimentoLead` ou `/Similarity/SmartSearch`).
- **Roteamento Inteligente:** O método `performSmartSearch` decide dinamicamente a rota dependendo do tipo da chave (`telefone`, `nome`, `email`, `cpf`).
- **Modo Demo:** Retorna dados de fallback (mock) sem acionar custos. Disponível apenas via painel UI se o usuário tiver `role: 'ADMIN'`.

## Autenticação e Segurança
- **Login Social (Google):** Fluxo OAuth2 puro (sem NextAuth) usando `/api/auth/google/callback/route.ts`. Trata erros invisíveis via `useSearchParams` encapsulados em `<Suspense>`.
- **Recuperação de Senha:** O fluxo "Esqueceu a Senha" salva chaves únicas na tabela `PasswordResetToken` (expiram em 1h). Os e-mails são disparados nativamente via API V3 do **Brevo** (`fetch`), economizando memória no container (sem precisar do pacote `nodemailer`).

## Sistema de Cache Modular (48 Horas)
Implementado na Server Action `realizarConsulta` (`src/app/actions/consultas.ts`).
- **Funcionamento:** O banco verifica se existe uma busca nas últimas 48h com o mesmo `type` (tipo), `query` (valor) E o mesmo array de `modules` (módulos comprados).
- **Cobrança Anti-Prejuízo:** O sistema sempre debita o valor dos módulos selecionados, mas o provedor de API não é chamado (custo de API = 0), mantendo a margem de lucro.

## Variáveis de Ambiente Necessárias (.env)
```env
# DirectData V3
DIRECT_DATA_TOKEN=seu_token_v3
DIRECT_DATA_V3_URL=https://apiv3.directd.com.br

# Google OAuth2
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret

# E-mail e Recuperação (Brevo)
BREVO_API_KEY=sua_chave_api_v3_do_brevo

# Pagamentos PushinPay
PUSHINPAY_TOKEN=token_do_gateway_pagamentos
PUSHINPAY_WEBHOOK_TOKEN=token_de_seguranca_do_webhook

# Banco de Dados (PostgreSQL Prisma)
DATABASE_URL=postgres://user:pass@host/db
```

## Tratamento de Dados (DataViewer)
O componente `src/components/DataViewer.tsx` foi refatorado para realizar uma leitura inteligente de arrays e JSONs aninhados. Em vez de despejar JSON puro na tela (o que afugenta o usuário), ele aplica o `formatObjectItem` transformando chaves em labels legíveis.

## Monitoramento de Logs
- **SystemLog:** Registra falhas de API, trocas de senha e confirmações de saldo. Visualizável no admin via interface dedicada.
