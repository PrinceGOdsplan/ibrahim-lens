#!/usr/bin/env bash
#
# Snapshots pb_data (SQLite DB + any local uploads) into ./backups.
#
# PocketBase is stopped for the duration — a few seconds — because copying a
# live SQLite database with its WAL can yield an archive that will not restore.
set -euo pipefail

APP_DIR=/opt/ibrahim-lens
KEEP=7
STAMP=$(date +%Y%m%d-%H%M%S)
ARCHIVE="$APP_DIR/backups/pb_data-$STAMP.tar.gz"

cd "$APP_DIR"

docker compose stop pocketbase >/dev/null 2>&1
trap 'docker compose start pocketbase >/dev/null 2>&1' EXIT

tar -czf "$ARCHIVE" pb_data

docker compose start pocketbase >/dev/null 2>&1
trap - EXIT

# Keep only the newest $KEEP archives locally.
ls -1t "$APP_DIR"/backups/pb_data-*.tar.gz 2>/dev/null | tail -n +$((KEEP + 1)) | xargs -r rm -f

if command -v rclone >/dev/null 2>&1; then
	rclone copy "$ARCHIVE" "r2:ibrahimlens/_backups/" --retries 2
	rclone delete "r2:ibrahimlens/_backups/" --min-age 8d --retries 1 || true
	echo "$(date -Is) backup ok $(basename "$ARCHIVE") $(du -h "$ARCHIVE" | cut -f1) (copied to R2)"
else
	echo "$(date -Is) backup ok $(basename "$ARCHIVE") $(du -h "$ARCHIVE" | cut -f1) (rclone missing — local only)"
fi
