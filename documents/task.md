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

## SPLIT 3: Expansão de Módulos e Deploy Final em Docker (⏳ PENDENTE)
*Este split foca na escala final do produto para lançamento oficial.*

### 🛠️ Implementação de Novos Módulos de Consulta
- [ ] **Módulo Empresas (CNPJ):**
    - Consulta detalhada de QSA (Quadro de Sócios e Administradores).
    - Histórico financeiro, capital social e situação cadastral ativa/inativa.
    - Mapeamento de filiais e vínculos econômicos.
- [ ] **Módulo Veículos (Placas/Chassi):**
    - Busca detalhada por placa para identificação de multas e débitos.
    - Histórico de proprietários anteriores e restrições administrativas.
    - Alertas de furto/roubo e histórico de leilão/sinistro.
- [ ] **Módulo Endereços:**
    - Localização precisa via CEP ou logradouro.
    - Identificação de moradores no mesmo endereço (vizinhança técnica).
    - Validação de dados postais e geolocalização.

### 🚀 Deploy e Infraestrutura Profissional
- [ ] **Containerização com Docker:**
    - Criação de `Dockerfile` e `docker-compose.yml` otimizados para Next.js.
    - Isolamento de ambiente para garantir estabilidade e segurança.
- [ ] **Deploy em VPS Hostinger:**
    - Configuração de servidor Linux com Docker Engine.
    - Orquestração de containers para máxima disponibilidade (Uptime).
- [ ] **Certificados e Segurança:**
    - Implementação de Proxy Reverso (Nginx/Traefik).
    - Certificados SSL automáticos (HTTPS) e Firewall avançado.

### 💎 Recursos de Valor Agregado
- [ ] **Exportação Profissional:** Botão para download de relatórios em PDF/Excel.
- [ ] **Login Social:** Implementação do botão "Entrar com Google" (OAuth2).
- [ ] **Plataforma de API:** Documentação e acesso para desenvolvedores externos.
