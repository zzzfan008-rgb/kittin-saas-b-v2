#!/usr/bin/env bash
# 本地（非 Docker）运行状态一览
# 用法：./scripts/local/status.sh
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PGBIN="/Library/PostgreSQL/18/bin"
LOG_DIR="$ROOT/logs"
PORT_NUM="$(grep -E '^PORT=' "$ROOT/.env" 2>/dev/null | cut -d= -f2-)"
PORT_NUM="${PORT_NUM:-3002}"

printf '守护进程     : '
if [ -f "$LOG_DIR/supervisor.pid" ] && kill -0 "$(cat "$LOG_DIR/supervisor.pid")" 2>/dev/null; then
  echo "运行中 (PID $(cat "$LOG_DIR/supervisor.pid"))"
else
  echo "未运行（无自动重启）"
fi

printf 'PostgreSQL   : '
"$PGBIN/pg_isready" -h 127.0.0.1 -p 5433 >/dev/null 2>&1 && echo "运行中 (5433)" || echo "已停止"

printf '应用进程     : '
if [ -f "$LOG_DIR/app.pid" ] && kill -0 "$(cat "$LOG_DIR/app.pid")" 2>/dev/null; then
  echo "运行中 (PID $(cat "$LOG_DIR/app.pid"))"
else
  echo "已停止"
fi

printf '就绪检查     : '
curl -s -o /dev/null -w 'HTTP %{http_code}\n' "http://127.0.0.1:$PORT_NUM/api/ready" 2>/dev/null || echo "不可达"

printf '抠图服务     : '
H=$(curl -s --max-time 5 "http://127.0.0.1:8001/health" 2>/dev/null)
if [ -n "$H" ]; then echo "$H"; else echo "未运行 (8001 不可达)"; fi

printf '开机自启     : '
if [ -f "/Library/LaunchDaemons/com.coin-ai-canvas.supervisor.plist" ]; then
  if launchctl print "system/com.coin-ai-canvas.supervisor" >/dev/null 2>&1; then
    echo "已安装（系统守护，开机无需登录即启）"
  else
    echo "已安装但未加载（sudo launchctl bootstrap system /Library/LaunchDaemons/com.coin-ai-canvas.supervisor.plist）"
  fi
elif launchctl print "gui/$(id -u)/com.coin-ai-canvas.supervisor" >/dev/null 2>&1; then
  echo "已安装（登录项/LaunchAgent，仅登录后启动）"
elif [ -f "$LOG_DIR/.autostart-ok" ]; then
  echo "已安装（登录项，仅登录后启动）"
elif [ -d "$HOME/Applications/Coin-AI Canvas 守护.app" ]; then
  echo "待完成：.app 已生成，但未注册为登录项"
else
  echo "未安装，执行 scripts/local/install-daemon.sh"
fi

printf '局域网地址   : '
LAN_IP="$(ipconfig getifaddr en1 2>/dev/null || ipconfig getifaddr en0 2>/dev/null || true)"
[ -n "$LAN_IP" ] && echo "http://$LAN_IP:$PORT_NUM" || echo "未取到局域网 IP"

printf '稳定地址     : '
BONJOUR="$(scutil --get LocalHostName 2>/dev/null || true)"
[ -n "$BONJOUR" ] && echo "http://$BONJOUR.local:${PORT_NUM}（IP 变化不受影响）" || echo "未取到 Bonjour 名称"
