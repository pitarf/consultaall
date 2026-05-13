# Guia de Atualização na VPS - ConsultaALL

Este documento lista os comandos fundamentais que você deve usar na VPS sempre que fizer alterações no código, no banco de dados ou no servidor, explicando o porquê de cada um.

---

## 1. O Jeito Fácil (Atualização Completa Automática)
Sempre que você alterar um botão, o banco de dados ou a lógica do backend, basta executar nosso script de automação de 1-clique:

```bash
./update.sh
```
* **Por que usar?** Esse arquivo junta o `git pull` (baixa novidades), o `npx prisma db push` (sincroniza o banco) e o `docker compose up -d --build` (recria a interface). É a forma mais segura e rápida de jogar qualquer coisa para o ar.

> **Atenção:** Na PRIMEIRA vez que for usar o script, você precisa liberar a permissão rodando: `chmod +x update.sh`.

---

## 2. Atualização Manual de Banco de Dados (Legado)
Se por algum motivo o `./update.sh` não estiver disponível:
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
