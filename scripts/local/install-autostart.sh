#!/usr/bin/env bash
# 安装开机自启 + 守护。优先用 launchd；若 launchd 不可用则回退为「登录项 + .app 包装」。
# 请在 macOS 终端里运行（需要用户级权限，某些受限环境无法执行 launchctl / System Events）。
# 用法：./scripts/local/install-autostart.sh
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SUP="$ROOT/scripts/local/supervise.sh"
LABEL="com.coin-ai-canvas.supervisor"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
UID_="$(id -u)"
LOG_DIR="$ROOT/logs"

mkdir -p "$LOG_DIR" "$HOME/Library/LaunchAgents"

if [ ! -x "$SUP" ]; then
  chmod +x "$SUP"
fi

echo "== 1/3 写入 LaunchAgent =="
cat > "$PLIST" <<EOF
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
    <key>WorkingDirectory</key>
    <string>$ROOT</string>
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
echo "   $PLIST"

echo "== 2/3 尝试交给 launchd 托管 =="
launchctl bootout "gui/$UID_/$LABEL" 2>/dev/null
if launchctl bootstrap "gui/$UID_" "$PLIST" 2>/dev/null; then
  echo "   ✅ launchd 安装成功"
  touch "$LOG_DIR/.autostart-ok"
  echo "   查看状态：launchctl print gui/$UID_/$LABEL | head -20"
  echo "   卸载：$ROOT/scripts/local/uninstall-autostart.sh"
  exit 0
fi
echo "   ⚠️  launchd 不可用（当前环境可能受限），改用登录项方案"
rm -f "$LOG_DIR/.autostart-ok"

echo "== 3/3 创建 .app 并注册为登录项 =="
APP="$HOME/Applications/Coin-AI Canvas 守护.app"
rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS"
cat > "$APP/Contents/Info.plist" <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleName</key>
    <string>Coin-AI Canvas 守护</string>
    <key>CFBundleIdentifier</key>
    <string>com.coin-ai-canvas.supervisor</string>
    <key>CFBundleExecutable</key>
    <string>launcher</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleVersion</key>
    <string>1.0</string>
    <key>LSUIElement</key>
    <true/>
    <key>LSArchitecturePriority</key>
    <array>
        <string>arm64</string>
        <string>x86_64</string>
    </array>
</dict>
</plist>
EOF

cat > "$APP/Contents/MacOS/launcher" <<EOF
#!/bin/bash
# 登录项入口：自我循环，守护脚本异常退出时自动重启（stop.sh 会先杀本进程，因此不会误拉）。
# shell 脚本没有架构信息，LaunchServices 可能用 x86_64 拉起，导致 arm64 的 numpy 加载失败，
# 这里按机器架构强制指定解释器架构。
ROOT="$ROOT"
LOG_DIR="$LOG_DIR"
# 用户主动启动 = 期望运行，清掉上次 stop.sh 留下的停止标记
rm -f "\$LOG_DIR/launcher.stop"
echo \$\$ > "\$LOG_DIR/launcher.pid"
while true; do
    if [ "$(uname -m)" = "arm64" ]; then
        arch -arm64 /bin/bash "$SUP" >> "\$LOG_DIR/supervisor.log" 2>&1
    else
        /bin/bash "$SUP" >> "\$LOG_DIR/supervisor.log" 2>&1
    fi
    [ -f "\$LOG_DIR/launcher.stop" ] && break
    echo "\$(date '+%Y-%m-%d %H:%M:%S') [launcher] 守护退出，5 秒后重启" >> "\$LOG_DIR/supervisor.log"
    sleep 5
done
rm -f "\$LOG_DIR/launcher.pid"
EOF
chmod +x "$APP/Contents/MacOS/launcher"
echo "   $APP"

if osascript -e "tell application \"System Events\" to make login item at end with properties {path:\"$APP\", hidden:true}" >/dev/null 2>&1; then
  echo "   ✅ 已添加为登录项"
  touch "$LOG_DIR/.autostart-ok"
  echo "   下次登录 / 重启后自动启动守护进程"
  echo "   卸载：$ROOT/scripts/local/uninstall-autostart.sh"
else
  echo "   ⚠️  自动添加登录项被系统拒绝（需要「自动化」权限）"
  echo ""
  echo "   请手动完成最后一步（只需一次）："
  echo "   系统设置 → 通用 → 登录项与扩展 → 点「+」→ 选择："
  echo "   $APP"
  echo ""
  echo "   或先在「系统设置 → 隐私与安全性 → 自动化」中允许终端控制 System Events 后重跑本脚本。"
  exit 2
fi
