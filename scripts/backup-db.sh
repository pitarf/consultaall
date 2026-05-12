#!/bin/bash

# Configurações
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_NAME="backup_consultaall_$TIMESTAMP.sql"
CONTAINER_NAME="consultaall-db"
DB_USER="postgres"
DB_NAME="consultaall"

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

echo "🚀 Iniciando backup do banco de dados..."

# Executa o pg_dump dentro do container e salva fora
docker exec $CONTAINER_NAME pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/$BACKUP_NAME

# Compactar para economizar espaço
gzip $BACKUP_DIR/$BACKUP_NAME

# Manter apenas os últimos 7 dias de backup (limpeza automática)
find $BACKUP_DIR -type f -name "*.gz" -mtime +7 -delete

echo "✅ Backup concluído: $BACKUP_NAME.gz"
echo "📂 Arquivo salvo em: $BACKUP_DIR"
