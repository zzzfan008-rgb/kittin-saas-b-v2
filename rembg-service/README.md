# 抠图服务

把 [rembg](https://github.com/danielgatis/rembg)（IS-Net）包成本地 HTTP 服务，
替代原来在浏览器里跑 `@imgly/background-removal` 的方案。

## 为什么

原方案抠图在浏览器本地跑，模型（约 170MB ONNX）要每次从 `staticimgly.com` 下载：

- 清了浏览器缓存 → 重下
- 境外 CDN 超时/被墙 → 失败
- 切换画质档（`isnet_quint8` / `isnet_fp16` / `isnet`）→ 重下不同的文件

改成本地服务后，模型只在服务端加载一次，前端零下载。

### 为什么不调 API

API易 的 `background: "transparent"` 是**重绘去背**，不是精确抠像。
官方文档原文：

> 模型是理解画面之后重新画一遍主体，而不是像 Photoshop 那样沿着原图轮廓把主体切下来。
> 主体的姿态、风格、细节会有变化，不是原图像素级保留。

服装业务的核心资产是面料纹理、印花细节，被重绘等于换了件衣服。所以用 rembg 本地推理。

## 模型选择

`isnet-general-use`（默认）。与 `u2net` 的实测对比（同一张 900×1200 服装图）：

| 指标 | u2net | isnet-general-use |
|---|---|---|
| 过渡带占比（越低越锐） | 1.210% | **0.307%** |
| 边缘梯度均值（越高越陡） | 10.35 | **28.61** |
| 推理耗时 | 4.11s | 4.15s |
| 下载耗时 | 6分40秒 | 8分20秒 |
| 印花区完好度 | 100% | 100% |

isnet 的边缘过渡带只有 u2net 的 1/4，视觉上是「边缘干净」与「边缘发毛」的差别。

## 环境要求

**Python 3.12+**，不能用 3.9。原因：`onnxruntime` 没有 Python 3.9 的 wheel，
pip 会静默跳过，导致 `import rembg` 直接 `ModuleNotFoundError`。

本机验证环境：

```
Python 3.14.7  (/opt/homebrew/bin/python3.14)
rembg         2.0.86
onnxruntime   1.31.0  (CoreML / CPU)
pillow        13.0.0
numpy         2.5.4
```

## 安装

```bash
cd rembg-service
/opt/homebrew/bin/python3.14 -m venv venv
./venv/bin/pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt
```

## 模型文件

**部署时预置，不进 git。** 模型约 170MB。

默认目录：`rembg-service/models/`（已被 `.gitignore` 忽略）。

rembg 通过 `U2NET_HOME` 定位模型，实际落盘路径是：

```
$U2NET_HOME/models/<model>/<model>.onnx
            ^^^^^^ 注意 models/ 出现两次，这是 rembg 的行为
```

预置方式二选一：

**A. 首次启动自动下载**（约 8 分钟，480KB/s）

```bash
U2NET_HOME=./models ./venv/bin/python -c \
  "from rembg import new_session; new_session('isnet-general-use')"
```

**B. 手动放文件**

```bash
mkdir -p models/models/isnet-general-use
curl -L -o models/models/isnet-general-use/isnet-general-use.onnx \
  https://github.com/danielgatis/rembg/releases/download/v0.0.0/isnet-general-use.onnx
```

## 启动

推荐用 `start.sh`（带 fail-fast 检查）：

```bash
# 前台
./start.sh

# 后台（写 .matting.pid）
./start.sh --daemon
```

脚本做三件事：检查 venv 与模型文件存在、清空 `PYTHONPATH`、启动 uvicorn。

手动启动等价于：

```bash
cd rembg-service
env -u PYTHONPATH -u VIRTUAL_ENV \
  U2NET_HOME=./models \
  ./venv/bin/python -m uvicorn app:app --host 127.0.0.1 --port 8001
```

> **必须清空 `PYTHONPATH`。** Hermes / IDE 等工具会注入自己的 site-packages，
> 不清会让 `import uvicorn` 从别的 venv 解析，表现为「装了却找不到」。

启动后立即在后台线程加载模型（约 1-5 秒）。加载期间 `/health` 返回 `loading`。

```bash
curl -s localhost:8001/health
# {"status":"ready","model":"isnet-general-use","model_dir":"./models"}
```

## Node 侧接入

`server/routes/matting.ts` 通过环境变量指向服务：

```bash
MATTING_SERVICE_URL=http://127.0.0.1:8001   # 默认值就是这个
```

前端调 `POST /api/matting`，不直接连 Python 服务（只有回环地址可达）。

## 部署（常驻形态）

决策 **A+C**：部署时预置模型 + 启动即预加载。

### macOS（launchd）

`~/Library/LaunchAgents/com.garmentcanvas.matting.plist`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.garmentcanvas.matting</string>
  <key>ProgramArguments</key>
  <array>
    <string>/path/to/kittin-saas-b-v2/rembg-service/start.sh</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>/tmp/matting.log</string>
  <key>StandardErrorPath</key><string>/tmp/matting.log</string>
</dict>
</plist>
```

```bash
launchctl load ~/Library/LaunchAgents/com.garmentcanvas.matting.plist
```

### Linux（systemd）

```ini
# /etc/systemd/system/garment-canvas-matting.service
[Unit]
Description=Garment Canvas Matting Service
After=network.target

[Service]
Type=simple
User=garment
WorkingDirectory=/opt/kittin-saas-b-v2/rembg-service
ExecStart=/opt/kittin-saas-b-v2/rembg-service/start.sh
Restart=always
RestartSec=5
Environment=MATTING_PORT=8001

[Install]
WantedBy=multi-user.target
```

```bash
systemctl enable --now garment-canvas-matting
```

## 接口

### `GET /health`

```json
{"status": "ready" | "loading" | "unavailable", "model": "isnet-general-use", "model_dir": "..."}
```

`unavailable` 时会带 `detail` 字段说明原因。

### `POST /remove`

请求体是**原始图片二进制**（不是 multipart，不是 base64）：

```bash
curl -X POST localhost:8001/remove \
  -H 'Content-Type: image/jpeg' \
  --data-binary @garment.jpg \
  -o garment-cutout.png
```

返回 `image/png`，RGBA 透明底，尺寸与原图一致。

错误码：

| 状态 | 场景 |
|---|---|
| 400 | 请求体为空 / 无法解析为图片 |
| 413 | 超过 25MB |
| 422 | 未识别到可抠除的背景（纯色图或无明确主体） |
| 503 | 模型加载中或加载失败 |

## 大图处理

超过 2048px 的图先缩小推理，alpha 再按原尺寸回贴。避免大图 OOM。

## 并发

单进程串行推理（`_session_lock`）。并发请求在 Node 侧排队（`server/routes/matting.ts`）。

若需提高吞吐，用 `--workers N`，但每个 worker 都会加载一份模型（约 1GB 内存）。

## 安全

只监听 `127.0.0.1`，不对外网开放。Node 侧鉴权后转发。
