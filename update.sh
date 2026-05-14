#!/bin/bash
echo "🚀 Iniciando atualizacao da VPS - ConsultaALL..."

echo "📦 1/3 - Puxando novos arquivos do GitHub..."
git pull origin main

echo "🗄️  2/3 - Sincronizando Banco de Dados (Prisma)..."
docker compose run --rm app npx prisma@6.2.1 db push --skip-generate
docker compose run --rm app npx prisma@6.2.1 db seed

echo "🏗️  3/3 - Reconstruindo e reiniciando a aplicacao..."
docker compose up -d --build

echo ""
echo "✅ Sistema atualizado e rodando com sucesso!"
