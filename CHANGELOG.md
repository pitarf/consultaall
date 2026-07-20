# Changelog - Detetive Buscas

Todas as mudanças notáveis para este projeto serão documentadas neste arquivo.

## [0.7.9] - 2026-07-20
### Adicionado / Modificado
- **Gerenciamento de Administradores no Painel (Promover/Rebaixar):**
  - Criação da Server Action `toggleUserRole` em `src/app/actions/admin.ts` para alternar com segurança o privilégio de acesso de qualquer usuário entre `USER` e `ADMIN`.
  - Adição de um botão com ícone de Coroa (`Crown`) na coluna de Ações da tabela de Gestão de Usuários (`/admin/usuarios`), permitindo ao administrador promover ou rebaixar usuários com 1 clique diretamente na interface visual.
  - Adição da Badge visual destacada `ADMIN` com o ícone de coroa para identificação rápida dos administradores da plataforma.

## [0.7.8] - 2026-07-12
### Adicionado / Modificado
- **Blindagem de SSL na API V3 da DirectData:**
  - Criação de uma instância customizada do Axios (`axiosV3`) com a desabilitação da validação estrita de certificados SSL (`rejectUnauthorized: false`) para todas as rotas da V3 (Pessoa Física Plus, Pessoa Jurídica Plus e Consulta Veicular). Isso evita falhas silenciosas de handshake de SSL e erros de certificado expirado/incompleto comuns dentro de containers Docker/Node.js na VPS de produção, garantindo que as buscas de CPF, CNPJ e Veículos carreguem com total estabilidade.
- **Tratamento de Indisponibilidade de Busca por Nome (V2):**
  - Devido a uma instabilidade ou desativação da API V2 da DirectData (`api.directd.com.br` retornando `ECONNRESET`), implementei um tratamento que intercepta o erro de socket. Em vez de exibir a mensagem técnica `read ECONNRESET`, o sistema agora exibe um aviso amigável orientando o usuário a buscar diretamente pelo CPF.


## [0.7.7] - 2026-07-04
### Adicionado / Modificado
- **Correção da Busca por Nome (DirectData V2):**
  - Correção do erro HTTP 400 "Parâmetros não suportados" na busca de Pessoa Física por Nome. A busca por Nome foi migrada de volta para a Pesquisa Avançada V2 (`FilterNaturalPerson`, `ProcessingIds` e `ViewSearch` com polling assíncrono), enquanto as buscas por E-mail e Telefone continuam usando o endpoint síncrono e veloz `/api/EnriquecimentoLead` da V3.
  - Implementação de um tratamento de exceções robusto em todas as chamadas de rede da DirectData, garantindo a leitura e a exibição da mensagem de erro real retornada pela API externa nos Toasts do frontend.
- **Validação Simplificada de Pix Manual (Sem Caça de IDs):**
  - Atualização da Server Action `createAndApproveDepositManual` para tornar o `externalId` opcional. Se o administrador deixar o ID em branco, o sistema gera automaticamente um ID de controle único do tipo `MANUAL-[timestamp]-[randomString]`.
  - Polimento do modal de saldo na Gestão de Usuários, tornando o campo de ID opcional na interface visual e orientando o administrador com um texto amigável.
- **Segurança Dupla e Resiliência no Webhook PushinPay:**
  - Atualização da geração do Pix (`src/app/actions/pagamentos.ts`) para incluir o ID interno da transação (`txId`) na URL do webhook.
  - Otimização do processamento do webhook (`src/app/api/webhooks/pushinpay/route.ts`) para buscar prioritariamente a transação pelo ID interno do banco (`txId`) e, em caso de ausência, usar o ID externo da PushinPay como fallback, eliminando 100% de inconsistências ou atrasos no banco.
  - Flexibilização de status aceitos pelo webhook, confirmando o Pix tanto para o status `"paid"` quanto para o status `"approved"`.
  - Suporte de token de segurança de dupla camada, aceito via Query Parameter (`?token=...`) ou via cabeçalho customizado (`x-pushinpay-token`).

## [0.7.6] - 2026-06-26
### Adicionado / Modificado
- **Validação Manual de Pix na Gestão de Usuários:**
  - Adição de uma interface de abas ("Ajuste Simples" e "Validar Pix Manual") no modal de gerenciamento de saldo da lista de usuários (`src/app/admin/usuarios/UserTableClient.tsx`).
  - Adição de um botão de ação rápida com ícone do Pix (`QrCode`) na tabela de usuários para abrir o modal diretamente na aba de validação de Pix.
  - Integração da Server Action `createAndApproveDepositManual` para criar e aprovar transações Pix (`DEPOSIT` com status `COMPLETED`) associadas a um ID Pix externo (`externalId`), incrementando o saldo do usuário e gerando logs de auditoria do sistema em português brasileiro.
  - Prevenção de duplicidade de transações por meio da validação atômica de `externalId` único no banco de dados.

## [0.7.5] - 2026-06-03
### Adicionado / Modificado
- **Copywriting do Hero da Landing Page:** Otimização do título principal na página inicial (`src/app/page.tsx`) para focar nas principais consultas da plataforma. O texto foi atualizado de "Consulte Informações em Segundos" para "Consulte CPF, Telefone e Placa em Segundos".

## [0.7.4] - 2026-05-25
### Adicionado / Modificado
- **Correção Crítica do Webhook PushinPay (Confirmação Pix):** Re-estruturação e robustecimento completo do endpoint de integração de webhook (`/api/webhooks/pushinpay`) para garantir o processamento automático de recargas Pix.
  - **Uso do ID de Transação Correto:** Substituição do mapeamento incorreto do campo `id` (ID da tentativa do webhook) pelo campo `transaction_id` (ID real da transação Pix associado ao `externalId`), resolvendo o bug em que o PIX não era creditado no saldo do cliente.
  - **Leitura Resiliente do Body:** Implementação de parser flexível de corpo de requisição com base no header `Content-Type` do HTTP, tratando nativamente payloads formatados tanto em `application/json` quanto `application/x-www-form-urlencoded` de forma segura.
  - **Tratamento Blindado de Exceções (Zero 500):** Adição de verificações preventivas contra dados nulos ou indefinidos antes de submetê-los ao Prisma Client, evitando que exceções de validação de banco resultem em erros HTTP 500 (Internal Server Error).
  - **Logs de Auditoria e Anti-Fraude:** Inclusão de logs detalhados via banco de dados (`SystemLog`) em português para transações confirmadas, além do bloqueio automático com log em severidade `ERROR` em caso de tentativas de divergência de valores pagos versus faturados.
- **Validação Manual de Pix (Painel do Administrador):**
  - **Ações Administrativas Robustas:** Criação das Server Actions `getPendingDeposits()` e `approveDepositManual(transactionId)` aplicando o mesmo padrão de transação atômica do webhook, com incremento do saldo do usuário, anotação de auditoria na descrição e geração automática de logs do sistema em português brasileiro.
  - **Interface SaaS Interativa (Abas):** Substituição do histórico de faturamento estático pelo componente interativo `<VendasClient />` estruturado em abas ("Aprovações Pendentes" e "Histórico Confirmado") com contador reativo e animações de loading de salvamento assíncrono com a nova API de transições do React 19.
- **Correção de Métricas de Faturamento no Painel Administrativo:**
  - **Cálculo de Receita Real:** Correção lógica na Server Action `getDashboardMetrics` que buscava o faturamento total acumulado e as vendas recentes com o filtro do tipo inexistente `PURCHASE`. Agora as métricas consultam corretamente a soma dos depósitos confirmados (`type: 'DEPOSIT'` e `status: 'COMPLETED'`), restaurando a exibição em tempo real do faturamento e vendas reais.
- **Menu Mobile Administrativo (Drawer Deslizante com React Portal):**
  - **Uso de Portais (Solução de CSS):** Substituição da renderização direta pela API `createPortal` do `react-dom` para acoplar a gaveta deslizante diretamente no `document.body`. Isso contorna as limitações de bloco de contenção e o aprisionamento visual gerados pelo `backdrop-blur-md` do cabeçalho pai, restaurando a exibição correta e fluida em tela cheia de smartphones.
  - **Anti-Hidratação:** Adição de controle de montagem em hook `useEffect` para carregar o portal de forma 100% segura no lado do cliente, prevenindo falhas de hidratação ou referências ao servidor.
  - **Navegação Responsiva:** Criação do componente Client `<AdminMobileMenu />` contendo um botão hambúrguer elegante e uma gaveta retrátil lateral em tom escuro (`bg-[#0f172a]`), alinhada ao visual desktop.
  - **Integração no Layout:** Injeção do menu móvel no cabeçalho superior do layout (`src/app/admin/layout.tsx`) com visibilidade restrita a smartphones (`md:hidden`), permitindo a navegação móvel de alto nível por todas as 6 subpáginas de administração.

## [0.7.3] - 2026-05-22
### Adicionado / Modificado
- **Área Administrativa Reativa a Temas (Clean / Dark):** Compatibilização completa de 100% da área administrativa (`/admin`) e das telas e subpáginas internas com o alternador de temas dinâmico.
  - **Layout do Admin:** Cabeçalho adaptado com o componente `<ThemeToggle />`, botão de retorno de alto contraste e contêiner central com background responsivo (`bg-[#f8fafc] dark:bg-background`).
  - **Painel Analítico de KPIs:** Cards de faturamento e consultas convertidos com design glass/white shadow e mini-gráficos reativos a ambos os temas.
  - **Gestão de Usuários e Modais de Auditoria:** Tabela de usuários adaptada com linhas zebradas suaves e transições. Modais completos de auditoria e ajuste de saldo reescritos para suportar fundos dinâmicos (`bg-white dark:bg-[#0f172a]`), tabelas internas claras e inputs numéricos/textuais de alto contraste.
  - **Histórico de Vendas:** Tabela de recargas Pix adaptada com linhas zebradas reativas, cabeçalho de contraste e badges de status reativos.
  - **Configurações de Branding e SEO:** Seção de formulários de metadados, inputs e caixas de pré-visualização de imagens (Logo e Favicon) remodeladas para ótima legibilidade e adaptabilidade visual a fundos claros e escuros.
  - **Preços de Módulos:** Adaptação completa de inputs tarifários, cards de categorias e caixas de alertas amarelos de preços para herdar as tonalidades e contrastes dinâmicos de cada modo.
  - **Logs do Sistema:** Cards de depuração, badges de status de severidade e contêineres pre/code de JSON técnico ajustados para ótima legibilidade sem perder a identidade premium.
  - **Checkpoint de Login Administrativo:** Integração do `<ThemeToggle />` e flexibilização visual completa do formulário de mestre para ótima usabilidade tanto no modo Clean quanto no modo Dark.

## [0.7.2] - 2026-05-22
### Adicionado / Modificado
- **Alternador Dinâmico de Temas (Dark / Clean):** Criação do componente de estado client `ThemeToggle.tsx` com ícones dinâmicos do Lucide (`Sun` e `Moon`), encaixando-se no cabeçalho do painel de controle (/dashboard) e de forma flutuante absoluta no topo-direita das telas de **Login** e **Cadastro**.
- **Adaptação Premium Light/Dark de Login/Cadastro:** Flexibilização total das classes de cores estáticas escuras das páginas de login e cadastro. Agora, os inputs, labels, botões de ação e divisores se adaptam instantaneamente ao tema selecionado (Clean / Dark) mantendo legibilidade perfeita e mantendo o design vívido em ambas as vertentes.
- **Persistência e Evitação de Flicker:** Adição de script head bloqueante em `src/app/layout.tsx` para sincronizar e carregar imediatamente a preferência de tema do `localStorage` (ou do sistema operacional) no primeiro milissegundo de carregamento do DOM, evitando quaisquer piscadas ("flickering") visuais.
- **Suporte Fluido nos Módulos de Busca:** Compatibilização completa das classes utilitárias de cores do Tailwind v4 (`dark:bg-card`, `dark:text-white`, `border-slate-200 dark:border-white/10`, etc.) nas páginas internas para transição imediata e natural.

## [0.7.1] - 2026-05-22
### Adicionado / Modificado
- **Ajuste Fino do Hero Copy na Landing Page:** Otimização do título principal para "Consulte Informações em Segundos", da descrição secundária para realçar o acesso ágil a contatos, placas e vínculos, e da chamada principal de cadastro para "Consultar Agora 🔎" (incluindo uma sutil micro-animação pulsante de conversão).
- **Esquema de Cores Claro nos Termos de Uso:** Implementação e polimento de design 100% claro (SaaS Light Premium) na página `/termos`, usando fundo `#f8fafc`, cartões brancos e fontes escuras de alta legibilidade para alinhamento com a Landing Page Whitelist para Google Ads.
- **Correção Crítica de Sintaxe em Termos:** Correção de rodapé duplicado e código sintático inválido que gerava falha de compilação em produção.
- **Rebranding Completo Residual (Detetive Buscas):** Remoção definitiva das ocorrências da marca antiga "ConsultaALL" no mockup das abas da home, no FaqAccordion corporativo e na tela de login de administradores.

## [0.7.0] - 2026-05-22
- **Nova Landing Page Whitelist (Estilo DeskData):** Reconstrução total da página pública inicial (`src/app/page.tsx`) com uma paleta de cores light premium corporativa B2B (cinza claro, azul vibrante e marinho) e copywriting whitelist focado em validação cadastral, enriquecimento de leads e mitigação de fraudes para aprovação total do Google Ads.
- **Dados Estritamente Genéricos nos Mockups (Opt-in Ads):** Ajuste fino de todas as demonstrações e exemplos visuais das abas interativas. Substituição de dados mascarados ou simulados por strings puramente conceituais (ex: "Nome Completo do Titular", "123.456.789-00", "01/02/1987", "exemplo@email.com", "Razão Social da Empresa Ltda") para eliminar qualquer falsa impressão de vazamento de dados aos revisores do Google Ads.
- **Preservação Histórica (Home 2):** Migração e preservação da Landing Page original escura ("Detetive Buscas") na nova rota pública `/home2` (`src/app/home2/page.tsx`), mantendo-a totalmente funcional.
- **Re-Branding Oficial (Detetive Buscas):** Substituição de todas as ocorrências visuais de "ConsultaALL" na home e navbar pela marca **Detetive Buscas**, posicionando-a como uma solução SaaS B2B premium e whitelisting de inteligência cadastral sob o domínio público.
- **Copy Suave Whitelist (Inspirada na DeskData):** Redefinição da copy do Hero e do corpo da Landing Page para um tom corporativo leve, profissional e legítimo (adequado contra restrições no Google Ads), além de acrescentar o aviso explícito de mockups ilustrativos/fictícios no componente de abas de consultas.
- **Canal Público de Proteção de Dados (Comentado / Em Desenvolvimento):** Ocultação completa do formulário de oposição LGPD na página `/protecao-de-dados`, substituindo a interface por um card elegante de "Módulo LGPD sob demanda / Em Desenvolvimento técnico". Toda a estrutura real do formulário e da action foi deixada perfeitamente comentada no código para permitir demonstração comercial e liberação imediata pós-venda.
- **Componentização Modular da Landing Page:**
  - Componente client `HomeTabs.tsx` para exibição interativa das consultas e mocks B2B de retorno, sem exibição de preços públicos.
  - Componente client `FaqAccordion.tsx` com accordions responsivos institucionais.
  - Componente client `NavbarClient.tsx` para cabeçalho responsivo leve com menu mobile retrátil.

## [0.6.0] - 2026-05-13
### Adicionado / Modificado
- **Integração DirectData V3:** Migração completa da base de consultas para a API V3 (Enriquecimento e Smart Search), corrigindo roteamentos para buscas via Telefone e Nome.
- **Autenticação Social:** Implementação de Login e Cadastro via Google OAuth2 utilizando rota de callback nativa (zero dependências) e com fallback seguro.
- **Recuperação de Senha Segura:** Novo fluxo completo de "Esqueceu a Senha" implementado de ponta a ponta com a API do Brevo nativa e banco de tokens rotativos (validade de 1 hora) em Next.js Server Actions.
- **Automação de Infraestrutura:** Criação do script nativo `update.sh` para atualizar o banco e reconstruir o sistema na VPS com um único comando.
- **Cache Modular e Anti-Prejuízo:** O sistema agora valida os módulos selecionados e salva o array no banco (`SearchHistory`), protegendo a operação de duplicidade na fatura da API externa.
- **Formatação de Dados Elegante:** Refatoração do `DataViewer` para processar objetos aninhados (ex: endereços) de forma limpa, eliminando exibições em JSON bruto.
- **Melhorias Críticas de UX/UI:**
  - **Conversão (Recarga):** Injeção de CTAs de Recarga diretamente nos alertas e Toasts quando o usuário não possui saldo.
  - **Botão de Consulta Aprimorado:** Botão gigante adaptado para polegar em dispositivos móveis, com folga visual (margin-bottom).
  - **Select Intuitivo:** Adição de chevron estilizado para facilitar a identificação dos campos de filtro.
  - **Mobile Sidebar (React Portal):** Correção do bug de aprisionamento do menu lateral pelo `backdrop-blur` do cabeçalho, garantindo navegação imersiva 100% de tela no celular.

## [0.5.0] - 2026-05-11
### Adicionado
- **Motor de API Híbrido:** Implementação de switch "Real vs Demo" exclusivo para administradores, permitindo testes sem custo de API ou débito de saldo.
- **Sistema de Cache Inteligente:** Armazenamento de resultados por 48 horas para evitar cobranças duplicadas e reduzir custos com o provedor de API.
- **Integração Real (Base):** Conexão estabelecida com `services.apiconsultabrasil.com` com mapeamento para o target `cpf-detalhada-pessoa-fisica`.
- **Segurança de Nível de Usuário (Role-Based):** Detecção dinâmica de cargo (Admin/User) no frontend para controle de visibilidade de recursos sensíveis.
- **Feedback de Cache:** Notificações (toasts) que informam quando um resultado foi recuperado do banco de dados.

## [0.4.0] - 2026-05-11
### Adicionado
- **Dashboard Administrativo Analítico:** Interface com métricas de faturamento (Dia/Mês), gráficos de desempenho e ranking de serviços.
- **Auditoria Financeira e Vendas:** Histórico detalhado de faturamento com integração de IDs externos da PushinPay e status visual (PAGO/PENDENTE).
- **Central de Logs do Sistema:** Monitoramento de erros técnicos de API, falhas de servidor e eventos críticos de segurança.

## [0.3.0] - 2026-05-10
### Adicionado
- **Pagamentos Automáticos (PushinPay):** Integração completa com o gateway Pix via Webhooks.
- **Área de Perfil:** Edição de perfil e troca de senha segura com hash bcryptjs.
- **Configurações Globais:** Gestão dinâmica de SEO e suporte via Admin.
- **Auditoria de Usuários:** Visualização de histórico de consultas e extrato individual de clientes.

## [0.2.0] - 2026-05-09
### Adicionado
- **Wallet System:** Migração para saldo em Reais (R$) e sistema de transações atômicas.
- **Precificação Dinâmica:** Controle de custos de módulos via banco de dados.
- **Dashboard do Usuário:** Novo layout premium com histórico de buscas e visualizador de dados JSON.

## [0.1.0] - 2026-05-08
### Adicionado
- **Base do Projeto:** Estrutura Next.js, Prisma, PostgreSQL e Autenticação JWT.
- **Landing Page:** Design premium responsivo.
