# Roadmap de Desenvolvimento - ConsultaALL (Splits de Entrega)

## SPLIT 1: Fundação, Design e Estrutura Core (✅ CONCLUÍDO)
*Este split foca na base sólida do sistema e na experiência do usuário.*
- [x] Arquitetura Next.js 16 + Prisma + PostgreSQL.
- [x] **UI/UX Premium:** Interface Glassmorphism com suporte a Dark/Light Mode.
- [x] **Sistema de Autenticação:** Login seguro via JWT e Gestão de Perfil.
- [x] **SEO Gerenciável:** Painel para controle de Metadados e Branding.
- [x] **Estrutura de Dashboard:** Menu lateral funcional e navegação responsiva.

## SPLIT 2: Financeiro, Auditoria e Inteligência de Dados (✅ CONCLUÍDO)
*Este split foca na monetização, controle administrativo e performance.*
- [x] **Wallet System:** Carteira digital em Reais (R$) com histórico de transações.
- [x] **Integração PushinPay:** Automação total de depósitos via Pix (Webhook).
- [x] **Painel Administrativo Analítico:** Visão de faturamento, lucros e logs técnicos.
- [x] **Auditoria e Segurança:** Rastreamento de IDs externos e central de logs proativa.
- [x] **Sistema de Cache Inteligente (48h):** Redução de custos operacionais e prevenção de gastos duplicados.
- [x] **Integração Real (CPF):** Conexão oficial com o provedor de consultas e Modo Demo para Admin.
- [x] **Migração Cloud:** Banco de dados migrado para Neon PostgreSQL e pronto para Vercel.

## SPLIT 3: Deploy Docker, Segurança Admin e API V3 (✅ 100% CONCLUÍDO)
*Este split foca na escala final, infraestrutura de produção e blindagem do sistema.*

### 🚀 Deploy e Infraestrutura Profissional (✅ 100% CONCLUÍDO)
- [x] **Containerização com Docker:**
    - `Dockerfile` e `docker-compose.yml` otimizados para modo standalone.
    - Persistência de volumes e isolamento de banco de dados.
- [x] **Deploy em VPS:**
    - Deploy realizado com sucesso na VPS Hostinger (srv1664973).
    - Automação de backup diário às 03:00 AM.
- [x] **Certificados e Proxy:**
    - Configuração de Nginx para Proxy Reverso.
    - Certificados SSL (HTTPS) via Certbot.

### 💎 Identidade e Conversão (✅ CONCLUÍDO)
- [x] **Landing Page "WolfBuscas":** Nova interface premium em Dark Mode com foco em conversão.
- [x] **Mecanismo de Isca (SearchTeaser):** Simulação de busca com animação e loading para atrair cadastros.
- [x] **Branding Dinâmico:** Gerenciamento de Logo e Favicon via Painel Admin com URL externa.
- [x] **Metadata Inteligente:** SEO Dinâmico gerado automaticamente a partir do banco de dados.

### 🔐 Segurança e Gestão Admin (✅ CONCLUÍDO)
- [x] **Gestão de Preços:** Aba administrativa para alterar valores de cada módulo em tempo real.
- [x] **Checkpoint de Segurança Admin:** Senha secundária mestra (@212121@) no ambiente (.env).
- [x] **Proteção Anti-Brute Force:** Limite de 3 tentativas na senha admin com bloqueio automático de 1h.

### 📱 Experiência e Engajamento (V3 & UX) (✅ CONCLUÍDO)
- [x] **Estabilização da API V3:** Migração para DirectData V3 (Smart Search e Enriquecimento) para CPF, Nome, Telefone e Email.
- [x] **Cache Modular:** Prevenção inteligente de dupla cobrança por até 48 horas validando módulos exatos no banco.
- [x] **Visualizador de Dados:** Renderização formatada e legível de arrays/objetos complexos (Endereços).
- [x] **Mobile-First Real:** Implementação da Sidebar retrátil com `React Portal` para quebrar bloqueios de blur e usabilidade de botões gigantes.
- [x] **Fluxo de Conversão (Saldo):** Banner e botões de "Recarregar" integrados a falhas de tentativa de busca sem saldo.

## SPLIT 4: Adaptação de Temas (Clean / Dark) na Área Admin (✅ CONCLUÍDO)
*Este split foca em estender o alternador de temas dinâmico para toda a área administrativa e login de admin.*
- [x] Adaptar o layout do Admin (`src/app/admin/layout.tsx`) com `ThemeToggle` e suporte a contraste.
- [x] Adaptar a página principal de métricas (`src/app/admin/page.tsx` & `DashboardClient.tsx`).
- [x] Adaptar a página de Vendas (`src/app/admin/vendas/page.tsx`).
- [x] Adaptar a gestão de usuários e auditoria (`src/app/admin/usuarios/page.tsx` & `UserTableClient.tsx`).
- [x] Adaptar a página de Configurações de Branding e SEO (`src/app/admin/configuracoes/page.tsx`).
- [x] Adaptar a tabela de Preços de Módulos (`src/app/admin/precos/PrecosClient.tsx`).
- [x] Adaptar os logs do sistema (`src/app/admin/logs/page.tsx`).
- [x] Adaptar a tela de Checkpoint de Login Administrativo (`src/app/admin-login/page.tsx`).

### 🛠️ Próximas Tarefas Prioritárias
- [x] Implementação de Login Social (Google OAuth2).
- [x] Configuração final do SSL/Nginx no domínio oficial.
- [x] Correção técnica e estabilização do Webhook da PushinPay (Resiliência, IDs corretos e idempotência).
- [x] Teste de ponta a ponta do Webhook da PushinPay em ambiente de produção.
- [x] Correção de cálculo de faturamento e vendas no painel administrativo.
- [x] Criação de navegação deslizante premium móvel (AdminMobileMenu) para administradores no celular.
- [x] Implementação de aba e Server Actions para Confirmação/Aprovação Manual de Pix pelo Administrador.
- [x] Correção do menu mobile do administrador com React Portal (solução de aprisionamento de CSS por backdrop-blur).
- [x] Otimização da chamada principal (Hero) na Landing Page para focar em "CPF, Telefone e Placa".
- [x] Criação de opção de validação manual de Pix na Gestão de Usuários para criar e aprovar Pix manualmente (Pix IDs não registrados).
- [x] Correção do erro 400 na busca por Nome (Migrando para a Pesquisa Avançada V2 da DirectData com polling e tratamento de erro robusto).
- [x] Validação simplificada de recargas Pix manuais na Gestão de Usuários (tornando o campo ID opcional com fallback autogerado).
- [x] Implementação de blindagem de SSL (axiosV3 com rejectUnauthorized: false) nas chamadas V3 da DirectData para evitar falhas de carregamento e incompatibilidade de certificados em containers.
- [x] Criação de botão de ação (Promover/Rebaixar Admin) na Gestão de Usuários e Server Action `toggleUserRole` para gerenciar administradores pela interface.
- [x] Criação de campos dinâmicos no Painel de Configurações (`/admin/configuracoes`) para alterar o Token da API PushinPay e o Token do Webhook em tempo real.
- [x] Adição do link "Preços" no menu e da seção de Tabela de Preços Dinâmica na Landing Page (`/` e `#precos`).
- [x] Exibição do horário exato do cadastro dos usuários na coluna "Data Registro" da Gestão de Usuários (`/admin/usuarios`).
- [x] Alteração do nome do menu lateral e cabeçalho de "Histórico" para **"Minhas consultas"**.
- [x] Criação da rota `/dashboard/faturas` para eliminar o erro 404 do botão "Adicionar Saldo" no menu lateral.









