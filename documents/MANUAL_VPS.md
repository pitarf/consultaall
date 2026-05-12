# 🐧 Guia de Deploy VPS Ubuntu - ConsultaALL

Este manual descreve o passo a passo para configurar sua VPS Hostinger e colocar o sistema no ar usando Docker.

## 1. Acesso Inicial
Acesse sua VPS via SSH (use o terminal ou PuTTY):
```bash
ssh root@IP_DA_SUA_VPS
```

## 2. Preparação do Ambiente
Execute os comandos abaixo para preparar o sistema:
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install docker-compose -y

# Instalar Nginx (Proxy Reverso)
sudo apt install nginx -y

# Instalar Certbot (SSL)
sudo apt install certbot python3-certbot-nginx -y
```

## 3. Clonagem e Configuração do Projeto
```bash
# Clone o repositório
git clone https://github.com/pitarf/consultaall.git
cd consultaall

# Crie o arquivo de ambiente
nano .env
```
*(Cole o conteúdo do seu .env local aqui e salve com Ctrl+O, Enter, Ctrl+X)*

## 4. Deploy com Docker
```bash
# Iniciar os containers
docker-compose up -d --build

# Criar as tabelas no banco de dados (Apenas na primeira vez)
docker-compose exec app npx prisma db push
```
O sistema estará rodando internamente na porta **3000**.

## 5. Configuração do Nginx (Cadeado HTTPS)
Crie o arquivo de configuração do seu domínio:
```bash
sudo nano /etc/nginx/sites-available/consultaall
```
**Cole este conteúdo (ajustando seu domínio):**
```nginx
server {
    server_name detetivebuscas.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Ative o site e gere o SSL:
```bash
sudo ln -s /etc/nginx/sites-available/consultaall /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Gerar SSL Grátis
sudo certbot --nginx -d detetivebuscas.com
```

## 6. Comandos Úteis
- **Ver logs:** `docker-compose logs -f`
- **Parar sistema:** `docker-compose down`
- **Atualizar código:** `git pull && docker-compose up -d --build`

## 7. Backups Automáticos Diários
Para garantir que você nunca perca dados, configure o backup automático:

1. Dê permissão de execução ao script:
```bash
chmod +x scripts/backup-db.sh
```

2. Abra o agendador de tarefas (Cron):
```bash
crontab -e
```

3. Adicione esta linha ao final do arquivo para rodar todo dia às 03:00 da manhã:
```bash
00 03 * * * /path/to/consultaall/scripts/backup-db.sh
```
*(Substitua `/path/to/` pelo caminho real da pasta na sua VPS)*

Os backups ficarão salvos na pasta `./backups/` dentro do projeto.
