# Guia de Atualização na VPS - ConsultaALL

Este documento lista os comandos fundamentais que você deve usar na VPS sempre que fizer alterações no código, no banco de dados ou no servidor, explicando o porquê de cada um.

---

## 1. Atualização Básica (Alterações visuais, textos ou lógicas no frontend)
Sempre que você alterar um botão, uma cor, arrumar um bug no Next.js ou alterar variáveis de ambiente, utilize este fluxo:

```bash
git pull origin main
docker compose up -d --build
```
* **Por que usar?** O `git pull` baixa as novidades do repositório. O `docker compose up -d --build` destrói a versão antiga do site e reconstrói (build) o Next.js com as peças novas, colocando no ar sem desligar o banco de dados. A flag `-d` garante que o painel continue rodando em segundo plano.

---

## 2. Atualização de Banco de Dados (Novas tabelas ou colunas)
Sempre que você alterar o arquivo `prisma/schema.prisma` (ex: adicionar uma tabela nova ou mudar um tipo de dado), você precisa atualizar o esquema do banco de produção.

```bash
git pull origin main
docker compose run --rm app npx prisma db push
docker compose up -d --build
```
* **Por que usar?** O `npx prisma db push` força o PostgreSQL da VPS a criar as colunas novas sem apagar os dados antigos. O `--rm app` cria um container temporário rápido só para rodar esse comando e se auto-destrói depois para economizar memória.

---

## 3. População de Dados Iniciais (Seed)
Se criarmos regras novas, usuários administradores padrão ou tabelas de preços padrão no arquivo `prisma/seed.ts` e quisermos forçar o banco a recebê-las.

```bash
docker compose run --rm app npx tsx prisma/seed.ts
```
* **Por que usar?** Isso injeta as informações básicas de configuração do sistema (como valores padrões dos módulos) diretamente no banco de dados PostgreSQL vivo.

---

## 4. Visualizar os Logs de Erro
Se o site sair do ar na VPS ou começar a retornar "Erro 500" e você quiser ver qual o erro por trás das cortinas.

```bash
docker compose logs -f app
```
* **Por que usar?** A flag `-f` (follow) prende a tela do terminal exibindo em tempo real tudo o que acontece no servidor Next.js. Útil para debugar Webhooks ou conexões de API com falhas. Pressione `Ctrl + C` para sair.

---

## 5. Derrubar o Sistema Inteiro
Caso precise reiniciar todo o servidor do zero (ex: trocar portas físicas ou limpeza geral).

```bash
docker compose down
```
* **Por que usar?** Desliga e desfaz todos os containers do projeto. **Não se preocupe**, isso NÃO apaga os dados do banco de dados, pois eles ficam protegidos em um "Docker Volume" mapeado externamente.
