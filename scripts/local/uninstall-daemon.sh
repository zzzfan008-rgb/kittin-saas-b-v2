#!/usr/bin/env bash
# 卸载系统级开机自启守护（需要 sudo 密码）。
# 用法：./scripts/local/uninstall-daemon.sh
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LABEL="com.coin-ai-canvas.supervisor"
DAEMON_PLIST="/Library/LaunchDaemons/$LABEL.plist"
LOG_DIR="$ROOT/logs"

echo "== 卸载系统守护 =="
if sudo launchctl bootout "system/$LABEL" 2>/dev/null; then
  echo "   已停止并卸载 $LABEL"
else
  echo "   未加载或不存在"
fi
sudo rm -f "$DAEMON_PLIST"
rm -f "$LOG_DIR/.autostart-ok"

echo "== 停止残留进程 =="
"$ROOT/scripts/local/stop.sh" >/dev/null 2>&1 || true

echo "== 清理用户级方案 =="
launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null && echo "   已卸载 LaunchAgent" || true
rm -f "$HOME/Library/LaunchAgents/$LABEL.plist"
rm -rf "$HOME/Applications/Coin-AI Canvas 守护.app"

echo "完成。开机不再自动启动，数据保持不变。"
