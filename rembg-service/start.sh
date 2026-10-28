#!/usr/bin/env bash
# 抠图服务启动脚本（常驻形态，部署决策 A+C）。
#
# A = 启动预加载：服务起即在后台线程加载模型，第一个用户点抠图不用等。
# C = 部署预置：模型文件在部署阶段放好，不允许运行时下载。
#
# 用法：
#   ./rembg-service/start.sh              # 前台
#   ./rembg-service/start.sh --daemon     # 后台（写 PID 文件）
set -euo pipefail

SERVICE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SERVICE_DIR"

PYTHON="${MATTING_PYTHON:-$SERVICE_DIR/venv/bin/python}"
MODEL_DIR="${U2NET_HOME:-$SERVICE_DIR/models}"
PORT="${MATTING_PORT:-8001}"
HOST="${MATTING_HOST:-127.0.0.1}"
MODEL="${MATTING_MODEL:-isnet-general-use}"
PID_FILE="$SERVICE_DIR/.matting.pid"
LOG_FILE="${MATTING_LOG:-/tmp/garment-canvas-matting.log}"

if [[ ! -x "$PYTHON" ]]; then
  echo "错误：Python 解释器不存在：$PYTHON" >&2
  echo "请先建 venv（必须 Python 3.12+，onnxruntime 没有 3.9 的 wheel）：" >&2
  echo "  /opt/homebrew/bin/python3.14 -m venv $SERVICE_DIR/venv" >&2
  echo "  $SERVICE_DIR/venv/bin/pip install -r $SERVICE_DIR/requirements.txt" >&2
  exit 1
fi

# 关键：必须检查模型文件存在，否则 rembg 会在首个请求里触发 170MB 下载，
# 把请求挂 8 分钟直到超时。这里 fail-fast。
MODEL_FILE="$MODEL_DIR/models/$MODEL/$MODEL.onnx"
if [[ ! -f "$MODEL_FILE" ]]; then
  echo "错误：模型文件不存在：$MODEL_FILE" >&2
  echo "请先预置模型（见 rembg-service/README.md「模型文件」）：" >&2
  echo "  mkdir -p $MODEL_DIR/models/$MODEL" >&2
  echo "  curl -L -o $MODEL_FILE \\" >&2
  echo "    https://github.com/danielgatis/rembg/releases/download/v0.0.0/$MODEL.onnx" >&2
  exit 1
fi

# PYTHONPATH 必须清空：Hermes 等工具会注入自己的 site-packages，
# 不清会让 `import uvicorn` 从别的 venv 解析，跑起来后行为诡异。
RUN=(env -u PYTHONPATH -u VIRTUAL_ENV \
     U2NET_HOME="$MODEL_DIR" \
     MATTING_MODEL="$MODEL" \
     "$PYTHON" -m uvicorn app:app --host "$HOST" --port "$PORT")

if [[ "${1:-}" == "--daemon" ]]; then
  if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    echo "抠图服务已在运行（PID $(cat "$PID_FILE")）"
    exit 0
  fi
  nohup "${RUN[@]}" > "$LOG_FILE" 2>&1 &
  echo $! > "$PID_FILE"
  # 变量后面紧跟中文全角括号时必须用 ${PORT}：bash 会把全角括号的 UTF-8 字节
  # 当成变量名的一部分，报 "PORT?: unbound variable"。
  echo "抠图服务已在后台启动（PID $(cat "$PID_FILE")，端口 ${PORT}）"
  echo "日志：$LOG_FILE"
  echo "就绪检查：curl -s localhost:$PORT/health"
else
  echo "启动抠图服务：$HOST:$PORT  模型 $MODEL  目录 $MODEL_DIR"
  exec "${RUN[@]}"
fi
