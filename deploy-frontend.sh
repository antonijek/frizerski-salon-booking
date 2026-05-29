#!/bin/bash
# Frontend + Backend deployment script — direktno na server, bez Dockera

REMOTE_HOST="213.199.32.240"
REMOTE_USER="root"
REMOTE_DIR="/var/www/frizerski-salon"
DOMAIN="frizerski-salon.com"

set -e

echo "=== (1/6) Building frontend ==="
cd frontend && npm run build

echo "=== (2/6) Uploading build-ovan frontend ==="
ssh -o StrictHostKeyChecking=no "$REMOTE_USER@$REMOTE_HOST" "mkdir -p $REMOTE_DIR/frontend/dist"
scp -o StrictHostKeyChecking=no -r frontend/dist/* "$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/frontend/dist/"

echo "=== (3/6) Pulling latest backend code ==="
ssh -o StrictHostKeyChecking=no "$REMOTE_USER@$REMOTE_HOST" "cd $REMOTE_DIR/backend && git pull"

echo "=== (4/6) Installing backend dependencies ==="
ssh -o StrictHostKeyChecking=no "$REMOTE_USER@$REMOTE_HOST" "cd $REMOTE_DIR/backend && npm install"

echo "=== (5/6) Postavljanje nginx config-a sa wildcard subdomain-om ==="
ssh -o StrictHostKeyChecking=no "$REMOTE_USER@$REMOTE_HOST" "cat > /etc/nginx/sites-available/$DOMAIN << 'NGINX'
# HTTP -> HTTPS redirect
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN *.$DOMAIN;
    return 301 https://\$host\$request_uri;
}

# HTTPS server — wildcard za sve subdominove
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN *.$DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root $REMOTE_DIR/frontend/dist;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
    gzip_min_length 1000;

    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 90;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:5000/uploads/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 90;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }

    location = /favicon.ico { log_not_found off; access_log off; }
    location = /robots.txt  { log_not_found off; access_log off; }
}
NGINX
"

echo "=== Enabling site and reloading nginx ==="
ssh -o StrictHostKeyChecking=no "$REMOTE_USER@$REMOTE_HOST" "
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
"

echo "=== (6/6) Restarting backend (pm2) ==="
ssh -o StrictHostKeyChecking=no "$REMOTE_USER@$REMOTE_HOST" "pm2 restart frizerski-salon --update-env"

echo ""
echo "=== Deployment completed ==="
echo "Frontend:  https://$DOMAIN"
echo "Backend:   http://127.0.0.1:5000"
echo "Subdomain: https://salon1.$DOMAIN"
