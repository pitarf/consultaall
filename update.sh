#!/bin/bash
echo "🚀 Iniciando atualizacao da VPS - ConsultaALL..."

echo "📦 1/4 - Puxando novos arquivos do GitHub..."
git pull origin main

echo "🗄️  2/4 - Aplicando Migrations do Banco de Dados (Prisma)..."
docker compose run --rm app npx -y prisma@6.2.1 migrate deploy
docker compose run --rm app npx -y prisma@6.2.1 db seed

echo "🏗️  3/4 - Reconstruindo e reiniciando a aplicacao..."
docker compose up -d --build

echo "🧹 4/4 - Limpando caches e imagens antigas do Docker para liberar espaço..."
# Remove imagens órfãs (dangling) deixadas pela reconstrução
docker image prune -f
# Remove cache de compilação antigo do Docker (ocupa muito espaço no Next.js)
docker builder prune -f

echo ""
echo "✅ Sistema atualizado, limpo e rodando com sucesso!"
