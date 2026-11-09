#!/usr/bin/env bash
# 卸载开机自启与守护：launchd 代理、登录项 .app、运行中的守护进程一并清理。
# 用法：./scripts/local/uninstall-autostart.sh
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LABEL="com.coin-ai-canvas.supervisor"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
APP="$HOME/Applications/Coin-AI Canvas 守护.app"
UID_="$(id -u)"
LOG_DIR="$ROOT/logs"

echo "== 停止运行中的守护 =="
if [ -f "$LOG_DIR/supervisor.pid" ]; then
  PID="$(cat "$LOG_DIR/supervisor.pid")"
  if kill -0 "$PID" 2>/dev/null; then
    kill "$PID"
    for _ in $(seq 1 20); do kill -0 "$PID" 2>/dev/null || break; sleep 1; done
    echo "   已停止 PID $PID"
  fi
fi

echo "== 移除 launchd 代理 =="
if launchctl bootout "gui/$UID_/$LABEL" 2>/dev/null; then
  echo "   已卸载 $LABEL"
else
  echo "   未安装或已在未加载状态"
fi
rm -f "$PLIST"

echo "== 移除登录项 =="
if [ -d "$APP" ]; then
  osascript -e "tell application \"System Events\" to delete login item \"Coin-AI Canvas 守护\"" >/dev/null 2>&1 \
    && echo "   已移除登录项" \
    || echo "   未能自动移除，请在「系统设置 → 通用 → 登录项与扩展」中手动删除「Coin-AI Canvas 守护」"
  rm -rf "$APP"
fi

echo "完成。数据库与应用的运行进程已停止，数据保持不变。"
