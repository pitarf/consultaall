# Manual do Desenvolvedor - Detetive Buscas

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

## Canal de Proteção de Dados (Opt-out LGPD) e Whitelist
Para conformidade com o Google Ads e LGPD, a plataforma expõe uma rota `/protecao-de-dados`:
- **Estrutura:** A página `src/app/protecao-de-dados/page.tsx` usa componentes client interativos para gerenciar formulário, máscaras e feedbacks com Toasts.
- **Armazenamento sem Migrations:** O formulário consome a Server Action `registrarOptOut` (`src/app/actions/optout.ts`). Ela valida o CPF pelo motor interno e registra a solicitação diretamente na tabela `SystemLog` com o nível `WARNING`. Isso permite ao administrador realizar auditorias e dar baixa técnica em solicitações sem a necessidade de migrações complexas de esquema no PostgreSQL.
- **Componentização SSR:** A Landing Page principal (`src/app/page.tsx`) roda em modo de servidor (Server Component) para otimização extrema de SEO e metadados dinâmicos vindos da tabela `SystemSetting`. Elementos com estado dinâmico como abas (`HomeTabs`), accordions (`FaqAccordion`) e menus (`NavbarClient`) são carregados modularmente como Client Components híbridos.

## Reatividade de Temas Claro e Escuro (Clean / Dark)
A plataforma possui suporte completo a temas dinâmicos em toda a sua área pública, painel do cliente (`/dashboard`) e área administrativa (`/admin`).
- **Prevenção de Flicadas (Anti-Flicker):** O `layout.tsx` injeta um scripthead síncrono que lê o `localStorage` no primeiro milissegundo de carregamento do DOM. Ele atribui a classe `.dark` ao elemento raiz `<html>` de forma síncrona antes que qualquer renderização ocorra, mitigando flashes brancos em visitas com modo escuro.
- **Alternador de Temas (`ThemeToggle.tsx`):** Componente cliente reativo que alterna o estado visual adicionando/removendo a classe `.dark` da raiz HTML e gravando a preferência no `localStorage`.
- **Estilização Adaptativa:** Utiliza as classes nativas de variantes `dark:` do Tailwind v4 (`bg-white dark:bg-card`, `text-slate-900 dark:text-white`, `border-slate-200 dark:border-white/10`) assegurando uma estética premium glassmorphism nos tons escuros e um design clean limpo e profissional nos tons claros.
- **Área Administrativa e Login de Checkpoint:** A mesma reatividade e paleta de cores flexíveis foram estendidas para 100% das páginas administrativas, tabelas de KPI, listagem de transações Pix, modais de auditoria técnica e telas de segurança de mestre.

## Validação Manual de Recarga Pix
Para resolver inconsistências de webhooks da PushinPay (especialmente em ambientes locais de teste ou quando a transação Pix é criada e paga mas não é registrada no banco de dados de produção por problemas do gateway):
- **Server Action**: `createAndApproveDepositManual(userId, externalId, amount)` em `src/app/actions/admin.ts`. Ela verifica a existência prévia do `externalId` para evitar duplicidade, insere o registro `DEPOSIT` com status `COMPLETED`, credita o saldo ao usuário e registra logs no `SystemLog`. O campo `externalId` é opcional. Se não for informado, a Server Action gerará automaticamente um ID único no formato `MANUAL-[timestamp]-[randomString]`.
- **Interface**: No modal de gerenciamento de saldo do usuário (`UserTableClient.tsx`), há uma aba "Validar Pix Manual". Ela permite creditar Pix de forma simplificada sem exigir que o administrador digite ou localize o ID do Pix na PushinPay.

## Busca por Nome (DirectData V2 & V3 Híbrido)
Para a realização de consultas de Pessoa Física na API da DirectData:
- **Buscas por Telefone e E-mail**: Utilizam a API síncrona V3 da DirectData (`/api/EnriquecimentoLead`), que é rápida e consome apenas uma requisição por chamada.
- **Busca por Nome**: Como a API V3 da DirectData não possui um correspondente síncrono para busca por Nome (o endpoint `/api/Similarity` exige o CPF para validar similaridade cadastral), o sistema utiliza a Pesquisa Avançada V2 da DirectData (`/api/AdvancedSearch/FilterNaturalPerson`, `/api/AdvancedSearch/ProcessingIds` e `/api/AdvancedSearch/ViewSearch` com polling assíncrono). A Server Action executa o fluxo em 3 etapas por baixo dos panos e realiza um polling rápido de até 10 tentativas para retornar o resultado síncrono traduzido para o frontend.

## Webhook PushinPay (Segurança Dupla)
A rota `/api/webhooks/pushinpay` está configurada com segurança robusta de dupla camada para autenticação de requisições:
- **Query String**: Valida o token `PUSHINPAY_WEBHOOK_TOKEN` passado no parâmetro `?token=...` na URL configurada.
- **Headers**: Valida o token nos cabeçalhos `x-pushinpay-token` ou `x-pushin-pay-token` enviados de forma nativa pela API da PushinPay.
Esta estrutura assegura compatibilidade total com os manuais de integração de produção e com scripts de simulação local.





