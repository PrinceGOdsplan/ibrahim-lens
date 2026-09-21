#!/usr/bin/env bash
#
# Prepares a fresh Ubuntu server to run Ibrahim Lens: Docker, swap, firewall,
# log caps, and the app directory. Safe to re-run.
#
# Usage: sudo bash bootstrap.sh
set -euo pipefail

APP_DIR=/opt/ibrahim-lens
SWAP_FILE=/swapfile
SWAP_MB=2048

if [[ $EUID -ne 0 ]]; then
	echo "Run as root: sudo bash bootstrap.sh" >&2
	exit 1
fi

export DEBIAN_FRONTEND=noninteractive

echo "==> Updating base system"
apt-get update
apt-get upgrade -y
apt-get install -y ca-certificates curl ufw fail2ban unattended-upgrades

echo "==> Installing Docker"
if command -v docker >/dev/null 2>&1; then
	echo "    already installed"
else
	install -m 0755 -d /etc/apt/keyrings
	curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
	chmod a+r /etc/apt/keyrings/docker.asc
	echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
		>/etc/apt/sources.list.d/docker.list
	apt-get update
	apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
	systemctl enable --now docker
fi

echo "==> Configuring swap"
if swapon --show=NAME --noheadings | grep -qx "$SWAP_FILE"; then
	echo "    already active"
else
	fallocate -l "${SWAP_MB}M" "$SWAP_FILE" 2>/dev/null ||
		dd if=/dev/zero of="$SWAP_FILE" bs=1M count="$SWAP_MB" status=none
	chmod 600 "$SWAP_FILE"
	mkswap "$SWAP_FILE" >/dev/null
	swapon "$SWAP_FILE"
	grep -q "^${SWAP_FILE}" /etc/fstab || echo "$SWAP_FILE none swap sw 0 0" >>/etc/fstab
fi

echo "==> Capping container logs"
# A 10 GB disk cannot absorb unbounded json-file logs.
if [[ -f /etc/docker/daemon.json ]] && ! grep -q '"log-opts"' /etc/docker/daemon.json; then
	echo "    /etc/docker/daemon.json exists without log-opts — leaving it alone, set max-size manually" >&2
else
	mkdir -p /etc/docker
	cat >/etc/docker/daemon.json <<'JSON'
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" }
}
JSON
	systemctl restart docker
fi

echo "==> Scheduling weekly image prune"
cat >/etc/cron.weekly/docker-prune <<'SH'
#!/bin/sh
docker image prune -af --filter "until=168h" >/dev/null 2>&1
docker builder prune -af >/dev/null 2>&1
SH
chmod +x /etc/cron.weekly/docker-prune

echo "==> Configuring firewall"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "==> Creating $APP_DIR"
mkdir -p "$APP_DIR"/{site,pb_data,backups}

echo
echo "Server ready."
docker --version
docker compose version
free -h | head -n 3
df -h / | tail -n 1
