"""
抠图服务：把 rembg（isnet-general-use）包成 HTTP 接口。

设计要点
--------
1. 模型启动时预加载，`/health` 在就绪前返回 not_ready（用户第一次点抠图不用等下载）。
2. 模型文件由 `U2NET_HOME` 指定，便于部署时预置（不进 git）。
3. 单进程串行推理：onnxruntime 的 session 不是线程安全的并发友好型，
   并发交给 Node 侧排队（见 server/routes/matting.ts）。
4. 只暴露 127.0.0.1，不对外网开放。

启动
----
    U2NET_HOME=/path/to/models PYTHONPATH=. ./venv/bin/uvicorn app:app --host 127.0.0.1 --port 8001

接口
----
    GET  /health  → {status: "ready"|"loading"|"unavailable", model, detail?}
    POST /remove  → body: 原始图片二进制（Content-Type: image/*）
                    返回: image/png（透明底）
"""
from __future__ import annotations

import io
import logging
import os
import threading
import time
from typing import Literal

import numpy as np
from fastapi import FastAPI, HTTPException, Request, Response
from PIL import Image

# 模型目录必须在 import rembg 之前设置；rembg 在模块加载时读取 U2NET_HOME。
DEFAULT_MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
os.environ.setdefault("U2NET_HOME", DEFAULT_MODEL_DIR)

MODEL_NAME = os.environ.get("MATTING_MODEL", "isnet-general-use")
# 允许按请求覆盖模型（Node 侧白名单限制），但所有 session 都缓存复用
ALLOWED_MODELS = {"isnet-general-use", "u2net", "u2netp", "u2net_human_seg"}
MAX_INPUT_BYTES = 25 * 1024 * 1024  # 25MB
# 超大图先缩到这个边长再推理，避免 OOM；输出再按原尺寸回贴 alpha。
MAX_INFERENCE_SIDE = 2048

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [matting] %(levelname)s %(message)s",
)
log = logging.getLogger("matting")

app = FastAPI(title="Garment Canvas Matting Service", version="1.0.0")

# ---------- 模型状态 ----------
_state: Literal["loading", "ready", "unavailable"] = "loading"
_detail: str | None = None
_sessions: dict[str, object] = {}
_session_lock = threading.Lock()


def _load_model() -> None:
    """后台线程里加载默认模型，不阻塞 FastAPI 启动。

    A+C 决策：部署时预置模型文件 + 启动即预加载。
    这样第一个用户点抠图时模型已在内存，不用等 8 分钟下载。

    其他模型（u2net / u2netp / u2net_human_seg）在首次被请求时按需加载并缓存，
    避免启动时把 4 个模型（约 4GB）全塞进内存。
    """
    global _state, _detail
    try:
        t0 = time.time()
        log.info("模型目录: %s", os.environ.get("U2NET_HOME"))
        log.info("开始加载模型: %s", MODEL_NAME)
        from rembg import new_session  # 延迟导入：import 本身很轻，但 session 很重

        session = new_session(MODEL_NAME)
        _sessions[MODEL_NAME] = session
        _state = "ready"
        _detail = None
        log.info("模型加载完成，耗时 %.1fs", time.time() - t0)
    except Exception as exc:  # noqa: BLE001 - 任何失败都要报给 /health
        _state = "unavailable"
        _detail = f"{type(exc).__name__}: {exc}"
        log.exception("模型加载失败")


def _get_session(model: str):
    """取模型 session；未加载过的按需加载并缓存。

    安全阀：按需加载只允许「模型文件已在本地」的情况。
    若文件不存在，rembg 会触发 170MB 下载（约 8 分钟），
    会把 HTTP 请求挂死到超时。此时明确报错，让运维先预置文件。
    """
    if model in _sessions:
        return _sessions[model]

    model_dir = os.environ.get("U2NET_HOME", DEFAULT_MODEL_DIR)
    model_file = os.path.join(model_dir, "models", model, f"{model}.onnx")
    if not os.path.exists(model_file):
        raise FileNotFoundError(
            f"模型文件不存在：{model_file}。"
            f"请先预置模型（见 README「模型文件」），避免首次请求阻塞在 170MB 下载上。"
        )

    from rembg import new_session

    t0 = time.time()
    log.info("按需加载模型: %s", model)
    session = new_session(model)
    _sessions[model] = session
    log.info("模型 %s 加载完成，耗时 %.1fs", model, time.time() - t0)
    return session


@app.on_event("startup")
def _on_startup() -> None:
    threading.Thread(target=_load_model, name="model-loader", daemon=True).start()


# ---------- 接口 ----------
@app.get("/health")
def health() -> dict:
    return {
        "status": _state,
        "model": MODEL_NAME,
        "model_dir": os.environ.get("U2NET_HOME"),
        **({"detail": _detail} if _detail else {}),
    }


@app.post("/remove")
async def remove(request: Request, model: str | None = None) -> Response:
    if _state == "unavailable":
        raise HTTPException(status_code=503, detail=_detail or "模型不可用")
    if _state == "loading":
        # 503 + Retry-After 语义：Node 侧翻译成「抠图服务正在加载模型，请稍后重试」
        raise HTTPException(status_code=503, detail="模型加载中")

    chosen = model or MODEL_NAME
    if chosen not in ALLOWED_MODELS:
        raise HTTPException(status_code=400, detail=f"不支持的模型: {chosen}")

    body = await request.body()
    if not body:
        raise HTTPException(status_code=400, detail="请求体为空")
    if len(body) > MAX_INPUT_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"图片过大：{len(body) / 1024 / 1024:.1f}MB，上限 {MAX_INPUT_BYTES / 1024 / 1024:.0f}MB",
        )

    try:
        src = Image.open(io.BytesIO(body))
        src.load()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"无法解析图片: {exc}") from exc

    original_size = src.size
    work = src.convert("RGB")
    # 超大图先缩小，推理后再把 alpha 放回原尺寸
    scale = 1.0
    if max(work.size) > MAX_INFERENCE_SIDE:
        scale = MAX_INFERENCE_SIDE / max(work.size)
        work = work.resize(
            (max(1, round(work.width * scale)), max(1, round(work.height * scale))),
            Image.LANCZOS,
        )
        log.info("大图缩放: %s → %s (scale=%.3f)", original_size, work.size, scale)

    buf = io.BytesIO()
    work.save(buf, format="PNG")

    from rembg import remove as rembg_remove

    t0 = time.time()
    try:
        session = _get_session(chosen)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    with _session_lock:  # onnxruntime session 串行使用
        out_bytes = rembg_remove(buf.getvalue(), session=session, force_return_bytes=True)
    elapsed = time.time() - t0

    out = Image.open(io.BytesIO(out_bytes)).convert("RGBA")
    if out.size != original_size:
        out = out.resize(original_size, Image.LANCZOS)

    # 保证真有镂空：全不透明时说明模型没识别出前景，明确报错而不是返回白图
    alpha = np.array(out.getchannel("A"))
    transparent_ratio = float((alpha < 10).mean())
    if transparent_ratio < 0.01:
        raise HTTPException(
            status_code=422,
            detail="未识别到可抠除的背景（原图可能是纯色或无明确主体）",
        )

    final = io.BytesIO()
    out.save(final, format="PNG", optimize=True)
    log.info(
        "抠图完成 %.2fs 输入 %s 输出 %s 透明 %.1f%%",
        elapsed, original_size, out.size, transparent_ratio * 100,
    )
    return Response(content=final.getvalue(), media_type="image/png")


@app.get("/")
def root() -> dict:
    return {"service": "garment-canvas-matting", "model": MODEL_NAME, "docs": "/docs"}
