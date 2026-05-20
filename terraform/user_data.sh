#!/bin/bash
set -euxo pipefail

INSTANCE_INDEX="${instance_index}"
INSTANCE_TAG="instance-$${INSTANCE_INDEX}"
hostnamectl set-hostname "$${INSTANCE_TAG}" || true
echo "127.0.0.1 $${INSTANCE_TAG}" >> /etc/hosts

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl ca-certificates gnupg git build-essential mysql-client

curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

APP_DIR="/opt/parcial-valero"
mkdir -p "$${APP_DIR}"
git clone --branch "${repo_branch}" "${repo_url}" "$${APP_DIR}/repo" || \
  (cd "$${APP_DIR}/repo" && git pull)

cd "$${APP_DIR}/repo/${app_subdir}"
npm install --omit=dev

cat > "$${APP_DIR}/repo/${app_subdir}/.env" <<EOF
NODE_ENV=production
PORT=${app_port}
DB_HOST=${db_host}
DB_PORT=${db_port}
DB_NAME=${db_name}
DB_USER=${db_user}
DB_PASSWORD=${db_password}
DB_SSL=true
DB_POOL_MAX=10
INSTANCE_TAG=$${INSTANCE_TAG}
EOF
chmod 600 "$${APP_DIR}/repo/${app_subdir}/.env"

cat > /etc/systemd/system/parcial-valero.service <<EOF
[Unit]
Description=Parcial Valero - API Node.js
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=$${APP_DIR}/repo/${app_subdir}
EnvironmentFile=$${APP_DIR}/repo/${app_subdir}/.env
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

chown -R ubuntu:ubuntu "$${APP_DIR}"
systemctl daemon-reload
systemctl enable parcial-valero.service
systemctl start parcial-valero.service

for i in $$(seq 1 30); do
  if curl -fsS "http://127.0.0.1:${app_port}/health" > /dev/null; then
    echo "App OK en intento $$i"
    break
  fi
  sleep 2
done

echo "user_data finalizado en $${INSTANCE_TAG}"
