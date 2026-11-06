#!/usr/bin/env bash
# 常驻守护：PostgreSQL + 抠图服务 + 应用，任一进程退出即自动拉起。
# 设计为「前台长期运行」，交给 launchd 或登录项托管，不要用 nohup 手动后台化。
# 手动调试：./scripts/local/supervise.sh
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
NODE="/Users/kittin/.nvm/versions/node/v24.20.0/bin/node"
PGBIN="/Library/PostgreSQL/18/bin"
# 以 LaunchDaemon 身份运行时 HOME 可能是 "/"，此处解析真实家目录，避免 PGDATA 指错
if [ -z "${HOME:-}" ] || [ "$HOME" = "/" ]; then
  HOME="$(dscl . -read "/Users/$(id -un)" NFSHomeDirectory 2>/dev/null | awk '{print $2}')"
fi
[ -n "${HOME:-}" ] || { echo "无法确定家目录，退出" >&2; exit 1; }
PGDATA="$HOME/.local/share/coin-ai-saas-v2/pgdata"
PGPORT=5433
LOG_DIR="$ROOT/logs"
MATTING_DIR="$ROOT/rembg-service"

mkdir -p "$LOG_DIR"

APP_LOG="$LOG_DIR/app.log"
MATTING_LOG="$LOG_DIR/matting.log"
PG_LOG="$LOG_DIR/postgres.log"
SUP_LOG="$LOG_DIR/supervisor.log"

# 单实例锁：避免重复拉起两套进程
SUP_PID_FILE="$LOG_DIR/supervisor.pid"
if [ -f "$SUP_PID_FILE" ]; then
  OLD_PID="$(cat "$SUP_PID_FILE")"
  if [ -n "$OLD_PID" ] && kill -0 "$OLD_PID" 2>/dev/null && [ "$OLD_PID" != "$$" ]; then
    echo "守护进程已在运行 (PID $OLD_PID)，退出" >&2
    exit 0
  fi
fi
echo $$ > "$SUP_PID_FILE"

log() { printf '%s [supervisor] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" >> "$SUP_LOG"; }

PG_PID=""; MAT_PID=""; APP_PID=""
SHUTTING_DOWN=0

# 用于清理上一次被强杀后留下的孤儿进程（强杀父进程不会带走子进程）
MATCH_APP="$ROOT/dist-server/index.js"
MATCH_MAT="uvicorn app:app --host 127.0.0.1 --port 8001"

sweep_children() {
  pkill -f "$MATCH_APP" 2>/dev/null
  pkill -f "$MATCH_MAT" 2>/dev/null
}

cleanup() {
  SHUTTING_DOWN=1
  log "收到退出信号，停止子进程"
  for pid in "$APP_PID" "$MAT_PID"; do
    [ -n "$pid" ] && kill "$pid" 2>/dev/null
  done
  # PostgreSQL 用 fast 模式优雅关闭，避免下次启动做长恢复
  "$PGBIN/pg_ctl" -D "$PGDATA" -m fast -w stop >> "$PG_LOG" 2>&1
  # 兜底：清掉可能残留的孤儿进程，否则下次启动会端口冲突
  sleep 1
  sweep_children
  rm -f "$SUP_PID_FILE" "$LOG_DIR/app.pid" "$LOG_DIR/matting.pid"
  exit 0
}
trap cleanup TERM INT HUP

# 日志超过 16MB 时轮转一份，避免长期运行撑爆磁盘
rotate() {
  local f="$1"
  if [ -f "$f" ] && [ "$(stat -f%z "$f" 2>/dev/null || echo 0)" -gt 16777216 ]; then
    mv "$f" "$f.1"
  fi
}

start_pg() {
  if "$PGBIN/pg_isready" -h 127.0.0.1 -p "$PGPORT" >/dev/null 2>&1; then
    return 0
  fi
  rotate "$PG_LOG"
  log "启动 PostgreSQL"
  "$PGBIN/pg_ctl" -D "$PGDATA" -l "$PG_LOG" -w -t 60 start >> "$SUP_LOG" 2>&1
}

start_app() {
  rotate "$APP_LOG"
  log "启动应用"
  (
    cd "$ROOT" || exit 1
    NODE_ENV=production exec "$NODE" "$ROOT/dist-server/index.js"
  ) >> "$APP_LOG" 2>&1 &
  APP_PID=$!
  echo "$APP_PID" > "$LOG_DIR/app.pid"
}

start_matting() {
  rotate "$MATTING_LOG"
  log "启动抠图服务"
  (
    cd "$MATTING_DIR" || exit 1
    # 必须清空 PYTHONPATH，否则 uvicorn 可能从别的 venv 解析
    exec env -u PYTHONPATH -u VIRTUAL_ENV U2NET_HOME="$MATTING_DIR/models" \
      "$MATTING_DIR/venv/bin/python" -m uvicorn app:app --host 127.0.0.1 --port 8001
  ) >> "$MATTING_LOG" 2>&1 &
  MAT_PID=$!
  echo "$MAT_PID" > "$LOG_DIR/matting.pid"
}

# 以实际进程为准跟踪子进程：不再只依赖启动时拿到的 $!，
# 避免出现「进程还活着但守护以为它死了」进而重复拉起、端口冲突的死循环。
current_app_pid() { pgrep -f "$MATCH_APP" 2>/dev/null | head -1; }
current_mat_pid() { pgrep -f "$MATCH_MAT" 2>/dev/null | head -1; }

log "守护启动 (PID $$)"

# 先清掉上次残留的孤儿进程，避免端口被占导致新进程起不来
sweep_children
sleep 1

start_pg
# 数据库就绪后再起应用，避免启动期连接失败
for _ in $(seq 1 60); do
  "$PGBIN/pg_isready" -h 127.0.0.1 -p "$PGPORT" >/dev/null 2>&1 && break
  [ "$SHUTTING_DOWN" = "1" ] && exit 0
  sleep 1
done

start_matting
start_app

FAIL_APP=0; FAIL_MAT=0; FAIL_PG=0

while [ "$SHUTTING_DOWN" = "0" ]; do
  sleep 2
  [ "$SHUTTING_DOWN" = "1" ] && break
  # 自愈：pid 文件可能被上一个实例的延迟清理删掉，每轮补写一次
  [ -f "$SUP_PID_FILE" ] || echo $$ > "$SUP_PID_FILE"

  if CUR="$(current_app_pid)"; [ -n "$CUR" ]; then
    # 进程在跑：同步真实 PID，纠正任何 PID 漂移
    if [ "$CUR" != "$APP_PID" ]; then APP_PID="$CUR"; echo "$APP_PID" > "$LOG_DIR/app.pid"; fi
    FAIL_APP=0
  else
    FAIL_APP=$((FAIL_APP + 1))
    # 连续失败时逐步退避，避免崩溃循环把 CPU 打满；首次故障只等 2 秒
    APP_DELAY=2
    [ "$FAIL_APP" -ge 3 ] && APP_DELAY=10
    [ "$FAIL_APP" -ge 5 ] && APP_DELAY=30
    log "应用退出（连续第 $FAIL_APP 次），${APP_DELAY} 秒后重启"
    sleep "$APP_DELAY"
    start_app
    sleep 2
  fi

  if CUR="$(current_mat_pid)"; [ -n "$CUR" ]; then
    if [ "$CUR" != "$MAT_PID" ]; then MAT_PID="$CUR"; echo "$MAT_PID" > "$LOG_DIR/matting.pid"; fi
    FAIL_MAT=0
  else
    FAIL_MAT=$((FAIL_MAT + 1))
    MAT_DELAY=2
    [ "$FAIL_MAT" -ge 3 ] && MAT_DELAY=10
    [ "$FAIL_MAT" -ge 5 ] && MAT_DELAY=30
    log "抠图服务退出（连续第 $FAIL_MAT 次），${MAT_DELAY} 秒后重启"
    sleep "$MAT_DELAY"
    start_matting
    sleep 2
  fi

  if ! "$PGBIN/pg_isready" -h 127.0.0.1 -p "$PGPORT" >/dev/null 2>&1; then
    FAIL_PG=$((FAIL_PG + 1))
    log "数据库不可用（连续第 $FAIL_PG 次），5 秒后重启"
    sleep 5
    start_pg
    for _ in $(seq 1 60); do
      "$PGBIN/pg_isready" -h 127.0.0.1 -p "$PGPORT" >/dev/null 2>&1 && break
      sleep 1
    done
  else
    FAIL_PG=0
  fi
done
