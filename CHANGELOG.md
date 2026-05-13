# Changelog - ConsultaALL

Todas as mudanças notáveis para este projeto serão documentadas neste arquivo.

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
