#!/usr/bin/env bash
# 本地（非 Docker）停止：守护进程（若有）+ 应用 + 抠图服务 + PostgreSQL
# 用法：./scripts/local/stop.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PGBIN="/Library/PostgreSQL/18/bin"
PGDATA="$HOME/.local/share/coin-ai-saas-v2/pgdata"
LOG_DIR="$ROOT/logs"

# 先标记停止，避免登录项启动器的自愈循环又把守护拉起来
touch "$LOG_DIR/launcher.stop"

if [ -f "$LOG_DIR/launcher.pid" ]; then
  LPID="$(cat "$LOG_DIR/launcher.pid")"
  if kill -0 "$LPID" 2>/dev/null; then
    echo "停止登录项启动器 (PID $LPID)"
    kill "$LPID" 2>/dev/null
  fi
  rm -f "$LOG_DIR/launcher.pid"
fi

# 守护进程在跑时，必须先停守护，否则子进程会被立刻拉起
if [ -f "$LOG_DIR/supervisor.pid" ]; then
  PID="$(cat "$LOG_DIR/supervisor.pid")"
  if kill -0 "$PID" 2>/dev/null; then
    echo "停止守护进程 (PID $PID)，子进程会随之退出"
    kill "$PID"
    for _ in $(seq 1 30); do
      kill -0 "$PID" 2>/dev/null || break
      sleep 1
    done
    kill -0 "$PID" 2>/dev/null && kill -9 "$PID"
  fi
fi

stop_pid() {
  local name="$1" file="$2"
  [ -f "$file" ] || { echo "$name 未运行"; return 0; }
  local pid; pid="$(cat "$file")"
  if kill -0 "$pid" 2>/dev/null; then
    echo "停止 $name (PID $pid)"
    kill "$pid"
    for _ in $(seq 1 15); do
      kill -0 "$pid" 2>/dev/null || break
      sleep 1
    done
    kill -0 "$pid" 2>/dev/null && kill -9 "$pid"
  fi
  rm -f "$file"
}

stop_pid "应用" "$LOG_DIR/app.pid"
stop_pid "抠图服务" "$LOG_DIR/matting.pid"

# 兜底清扫：守护被强杀时子进程会变成孤儿，仅靠 PID 文件停不干净
pkill -f "$ROOT/dist-server/index.js" 2>/dev/null
pkill -f "uvicorn app:app --host 127.0.0.1 --port 8001" 2>/dev/null
sleep 1

if "$PGBIN/pg_isready" -h 127.0.0.1 -p 5433 >/dev/null 2>&1; then
  echo "停止 PostgreSQL"
  "$PGBIN/pg_ctl" -D "$PGDATA" -m fast -w stop
fi
