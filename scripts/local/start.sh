#!/usr/bin/env bash
# 本地（非 Docker）前台启动：交给守护脚本统一拉起数据库 / 抠图 / 应用。
# Ctrl+C 即整体停止。需要「开机自启 + 后台常驻」请执行 install-autostart.sh。
# 用法：./scripts/local/start.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_DIR="$ROOT/logs"
UID_="$(id -u)"

if [ ! -f "$ROOT/dist-server/index.js" ]; then
  echo "缺少构建产物，请先执行：npm ci && npm run build" >&2
  exit 1
fi
if [ ! -x "$ROOT/rembg-service/venv/bin/python" ]; then
  echo "缺少抠图服务虚拟环境，见 rembg-service/README.md" >&2
  exit 1
fi

# 已在 launchd 托管时，直接交给 launchd，避免重复进程
if launchctl print "gui/$UID_/com.coin-ai-canvas.supervisor" >/dev/null 2>&1; then
  echo "守护已由 launchd 托管，正在拉起…"
  launchctl kickstart -k "gui/$UID_/com.coin-ai-canvas.supervisor"
  sleep 3
  "$ROOT/scripts/local/status.sh"
  exit 0
fi

if [ -f "$LOG_DIR/supervisor.pid" ] && kill -0 "$(cat "$LOG_DIR/supervisor.pid")" 2>/dev/null; then
  echo "守护进程已在运行 (PID $(cat "$LOG_DIR/supervisor.pid"))"
  "$ROOT/scripts/local/status.sh"
  exit 0
fi

echo "前台启动守护（Ctrl+C 停止；要开机自启请运行 scripts/local/install-autostart.sh）"
echo ""
rm -f "$LOG_DIR/launcher.stop"
exec "$ROOT/scripts/local/supervise.sh"
