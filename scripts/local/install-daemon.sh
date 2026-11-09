#!/usr/bin/env bash
# 安装「开机即启动」的系统级守护（LaunchDaemon）。
#
# 与 LaunchAgent 的区别：
#   LaunchAgent  → 用户登录后才启动
#   LaunchDaemon → 系统启动完成就启动，不需要任何人登录（需 root 安装）
#
# 需要 sudo 密码，请在「终端」里运行：
#   ./scripts/local/install-daemon.sh
#
# 卸载：./scripts/local/uninstall-daemon.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SUP="$ROOT/scripts/local/supervise.sh"
LABEL="com.coin-ai-canvas.supervisor"
DAEMON_PLIST="/Library/LaunchDaemons/$LABEL.plist"
RUN_USER="$(id -un)"
LOG_DIR="$ROOT/logs"

[ -x "$SUP" ] || chmod +x "$SUP"
mkdir -p "$LOG_DIR"

echo "== 1/4 生成 LaunchDaemon 配置 =="
echo "   运行用户：${RUN_USER}（服务不需要图形界面）"
TMP_PLIST="$(mktemp)"
cat > "$TMP_PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>$LABEL</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>$SUP</string>
    </array>
    <key>UserName</key>
    <string>$RUN_USER</string>
    <key>WorkingDirectory</key>
    <string>$ROOT</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>HOME</key>
        <string>$HOME</string>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    </dict>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>ThrottleInterval</key>
    <integer>10</integer>
    <key>StandardOutPath</key>
    <string>$LOG_DIR/supervisor.stdout.log</string>
    <key>StandardErrorPath</key>
    <string>$LOG_DIR/supervisor.stderr.log</string>
    <key>ProcessType</key>
    <string>Background</string>
</dict>
</plist>
EOF
echo "   $DAEMON_PLIST"

# 干跑模式：只校验生成的 plist 是否合法，不做任何系统改动
if [ "${1:-}" = "--dry-run" ]; then
  echo "== dry-run：校验配置 =="
  plutil -lint "$TMP_PLIST" && echo "   配置合法，未安装"
  rm -f "$TMP_PLIST"
  exit 0
fi

echo "== 2/4 请求管理员权限写入 /Library/LaunchDaemons =="
sudo cp "$TMP_PLIST" "$DAEMON_PLIST"
rm -f "$TMP_PLIST"
sudo chown root:wheel "$DAEMON_PLIST"
sudo chmod 644 "$DAEMON_PLIST"
echo "   已写入并设置 root:wheel 644"

echo "== 3/4 先清理同名的用户级代理，避免两套守护打架 =="
launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null && echo "   已卸载旧 LaunchAgent" || echo "   无旧 LaunchAgent"
rm -f "$HOME/Library/LaunchAgents/$LABEL.plist"
# 登录项方案与系统守护互斥，一并移除，防止重复拉起
APP="$HOME/Applications/Coin-AI Canvas 守护.app"
if [ -d "$APP" ]; then
  echo "   移除登录项 .app（已由系统守护接管）"
  rm -rf "$APP"
fi

echo "== 4/4 加载系统守护 =="
sudo launchctl bootout "system/$LABEL" 2>/dev/null || true
sudo launchctl bootstrap system "$DAEMON_PLIST"
sudo launchctl enable "system/$LABEL"

sleep 5
if pgrep -f "$SUP" >/dev/null 2>&1; then
  echo "   ✅ 守护已运行"
  touch "$LOG_DIR/.autostart-ok"
  echo ""
  echo "配置完成。以后开机（无需登录）会自动启动：PostgreSQL + 抠图服务 + 应用"
  echo "查看状态：$ROOT/scripts/local/status.sh"
  echo "查看服务：sudo launchctl print system/$LABEL | head -20"
else
  echo "   ⚠️  已安装但守护未运行，检查："
  echo "   sudo launchctl print system/$LABEL | head -30"
  echo "   tail -20 $LOG_DIR/supervisor.stderr.log"
  exit 1
fi
