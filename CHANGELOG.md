# Changelog - Detetive Buscas

Todas as mudanças notáveis para este projeto serão documentadas neste arquivo.

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
