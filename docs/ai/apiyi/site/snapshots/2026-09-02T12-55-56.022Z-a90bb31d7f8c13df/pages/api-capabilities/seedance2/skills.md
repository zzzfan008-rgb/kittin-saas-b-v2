> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.0 视频 Agent 技能

> 把 Seedance 2.5 与 2.0 四个模型（sd25 / mini / fast / 标准版）封装成一个开箱即用的 Agent Skill，丢进 Codex、OpenClaw、Claude Code 等任意编码 Agent，一句话完成文生视频、图生视频与参考图生视频，脚本自动轮询异步任务并把成片下载到本地。

<Note>
  本页提供一个**开箱即用的 Agent 技能（Skill）**：一个零依赖脚本覆盖 Seedance 全部四个模型（`sd25` / `mini` / `fast` / 标准版），用 `--model` 一键切换。把它放进你正在用的编码 Agent，一句话即可出视频——整套东西就两个文件。这也是本站**第一个视频模型技能**：与图片不同，视频是异步任务，脚本已把「提交 → 轮询 → 下载成片」整个流程封装好。
</Note>

## 这个技能能做什么

一个合并技能，脚本根据**传入的图片及其角色**自动判断生成模式：

<CardGroup cols={3}>
  <Card title="文生视频" icon="clapperboard">
    只给提示词 → 生成全新视频，默认自带同步音频（对白、音效、环境音）。
  </Card>

  <Card title="图生视频" icon="image-play">
    传入首帧图让静态图动起来；再加一张尾帧图即可做首尾帧平滑过渡。
  </Card>

  <Card title="参考图生视频" icon="layers">
    传入最多 9 张参考图 → 以参考图的角色、物品或风格生成新画面。
  </Card>
</CardGroup>

## 四个模型怎么选

四个模型**调用方式完全一致**，区别在分辨率上限、时长上限、参考素材上限、速度和价格。脚本已按 `--model` 自动处理差异：

| 模型（`--model`） | 模型 ID                             | 分辨率上限     | 速度（720p/5s 实测）   | 所属分组                                     | 720p/5s 名义价                   | 适合                                              |
| ------------- | --------------------------------- | --------- | ---------------- | ---------------------------------------- | ----------------------------- | ----------------------------------------------- |
| `mini`（默认）    | `doubao-seedance-2-0-mini-260615` | 720p      | **最快 \~87–170s** | `SeeDance2` 0.18x<br />或 `SD2Mini` 0.10x | \$0.4508<br />特价 **\$0.2504** | Agent 高频出片、走量、快速预览                              |
| `fast`        | `doubao-seedance-2-0-fast-260128` | 720p      | \~100–290s       | `SeeDance2` 0.18x<br />或 `SD2Fast` 0.15x | \$0.7253<br />特价 **\$0.6044** | 质量与成本折中                                         |
| `std`         | `doubao-seedance-2-0-260128`      | **1080p** | \~100–290s       | `SeeDance2` 0.18x                        | \$0.9074                      | 要 1080p、最高质量                                    |
| `sd25`        | `doubao-seedance-2-5-260628`      | **1080p** | \~150s           | `SeeDance2` 0.18x                        | **\$1.3721**                  | **最长 30 秒、最多 30 张参考图、mov 输出**；约为 `std` 的 1.5 倍价 |

<Tip>
  简单记：**日常与 Agent 场景就用默认 `mini`**；**要 1080p 或最高质量** → `--model std`；**要 30 秒长片、30 张参考图或 mov 输出** → 只能 `--model sd25`（约为 `std` 的 1.5 倍价，分组与 2.0 系相同）。同档位全比例同价，时长按秒线性计费，帧率固定 24fps。特价分组 `SD2Mini` / `SD2Fast` 截至 **2026 年 9 月 7 日 23:59 (UTC+8)**，到期分组不下线、倍率恢复 0.18x，详见 [概览页的分组说明](/api-capabilities/seedance2/overview)。
</Tip>

## 能用在哪些 Agent

<Info>
  一个 Skill 本质上就是**一个文件夹**：一份写给 Agent 看的说明（`SKILL.md`）+ 一个干活的脚本。所以**凡是能读取本地文件、执行命令行的编码 Agent 都能用上**——比如 **Codex、OpenClaw、hermes-agent、Claude Code** 等。

  唯一要求：跑 Agent 的那台机器（你的电脑或服务器）装了 **Python 3** 并且**能联网**（脚本要直连 `api.apiyi.com`）。脚本只用 Python 标准库，**无需 `pip install` 任何东西**。
</Info>

## 三步装好

### ① 建目录、贴文件

新建一个技能文件夹，放入下面两个文件（完整内容见后两节）：

```
seedance2/
├── SKILL.md
├── scripts/
│   └── seedance_video.py
└── .env          # 第②步创建，放你的 Key
```

### ② 同目录写 Key

在 `seedance2/.env` 里写上你的 **API易 API Key**（在 `api.apiyi.com` 控制台创建，计费模式选按量，**令牌须勾选 `SeeDance2` 分组**，四个模型通用（`mini` / `fast` 另有特价的 `SD2Mini` / `SD2Fast`））：

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

脚本会自动从这个 `.env` 读取 Key，**无需任何额外配置或环境变量**。

<Warning>
  `.env` 里是你的密钥。如果这个技能要随项目仓库共享，**务必把 `.env` 加进 `.gitignore`，不要提交到 git**。
</Warning>

### ③ 交给 Agent

* **支持技能自动发现的 Agent**（如 Claude Code）：把整个 `seedance2/` 目录放进它的技能目录——个人级 `~/.claude/skills/`，或项目级 `.claude/skills/`（随仓库共享）。
* **其他 Agent**：按它各自的技能/插件约定放置；或者最简单——**直接让 Agent「读一下这个文件夹里的 SKILL.md，并照着执行」** 即可。

装好后就能用了，跳到 [怎么用](#怎么用) 看示例。

## SKILL.md

新建 `seedance2/SKILL.md`，完整内容如下（`description` 写清「做什么 + 何时用」，Agent 会据此自动触发）：

````markdown theme={null}
---
name: seedance2
description: Generate videos via APIYI's Seedance 2.5 and 2.0 (doubao-seedance-2-5 / doubao-seedance-2-0 series) models — text-to-video, image-to-video (first/last frame), and reference-image-to-video, with synced audio by default. Use this when the user asks to create, generate, or animate a video clip.
allowed-tools: Bash(python3 *)
---

# Seedance 出视频技能

通过 API易 平台调用 Seedance 2.5（`doubao-seedance-2-5-260628`）与 2.0（`doubao-seedance-2-0` 系列）生成视频。默认用最快最便宜的 mini 版，出片自带同步音频。

## Key 配置

脚本会自动读取技能目录下 `.env` 文件里的 `APIYI_API_KEY`（也支持同名环境变量）。
若脚本报「未找到 Key」，提示用户在 `.env` 里写一行 `APIYI_API_KEY=sk-xxx`，
且该令牌须勾选 `SeeDance2` 分组、计费模式为按量 —— **四个模型都在这个分组里**，
`mini` 与 `fast` 另有特价的 `SD2Mini` / `SD2Fast`。

## 用法（重要：出片要 2-5 分钟）

视频是**异步任务**：脚本内部会提交任务并轮询到完成，单次调用总耗时通常 2-5 分钟。
**执行时必须给 Bash 设长超时（600 秒以上）或放到后台跑**，不要用默认 2 分钟超时，否则会在出片前被掐断。

```bash
# 文生视频（默认 mini / 720p / 5 秒 / 带音频）
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "一只橘猫在草地上追蝴蝶，镜头缓慢跟随，自然光" -o cat.mp4

# 图生视频（首帧图，让静态图动起来）
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "镜头缓缓推近，光影流动" -i photo.jpg -o animated.mp4

# 首尾帧过渡
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "画面从第一帧平滑过渡到最后一帧" -i first.png --last-frame last.png -o morph.mp4

# 参考图生视频（以参考图的角色/风格出新画面，最多 9 张）
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "参考图中的角色在雪地里奔跑" --ref-image role.png -o run.mp4

# 高画质：标准版 + 1080p + 10 秒
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "无人机航拍秋天山谷，电影感" --model std --resolution 1080p --duration 10 -o valley.mp4

# Seedance 2.5：最长 30 秒长片（价格是 5 秒的 6 倍，动手前先跟用户确认）
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "无人机飞越秋天山谷，一镜到底" --model sd25 --duration 30 -o long.mp4

# Seedance 2.5：mov 输出，给后期调色用
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "海浪拍打礁石，慢镜头" --model sd25 --output-format mov -o waves.mov
```

参数说明：

- 第 1 个位置参数：提示词（必填）。写清画面 + 运镜 + 氛围效果最好。
- `--model`：`mini`（默认，最快最便宜）/ `fast`（极速版）/ `std`（标准版）/ `sd25`（**Seedance 2.5**，最长 30 秒、最多 30 张参考图、支持 1080p 与 mov，约为 std 的 1.5 倍价，分组与 2.0 系相同）。
- `--resolution`：`480p` / `720p`（默认）/ `1080p`（仅 `sd25` 与 `std`）。四个模型都不支持 4k。
- `--ratio`：`adaptive`（默认）/ `16:9` / `4:3` / `1:1` / `3:4` / `9:16` / `21:9`，同档位全比例同价。
- `--duration`：整数秒，`sd25` 支持 4-30、2.0 系支持 4-15，默认 5；`-1` 让模型智能决定时长。时长越长越贵。
- `--no-audio`：关闭同步音频（默认带声音）。
- `-i / --image`：首帧图（本地路径 / URL / `asset://` 素材 ID），传入即图生视频；`--last-frame` 搭配做首尾帧。
- `--ref-image`：参考图，可重复；`sd25` 最多 30 张，2.0 系最多 9 张，与 `-i` 互斥。
- `--output-format`：`mp4`（默认）/ `mov`，**仅 `sd25` 支持**。mov 色彩还原更好，但部分播放器不兼容，做网页/移动端分发别用。
- `-o / --out`：输出文件名，默认 `output.mp4`。

## 出片条数与成本（重要）

- **一次调用只出 1 条视频**，没有批量参数。用户要多条时串行多次调用，并在动手前提醒成本。
- 视频按 token 计费、比图片贵得多（720p/5s 一条名义约 \$0.45-0.91，时长和分辨率越高越贵）。
  用户没有明确要求时，**保持默认 mini / 720p / 5s**，不要擅自加时长、升分辨率或换模型。
- **`sd25` 的 30 秒长片约 \$8.18 一条、1080p/5s 约 \$3.09 一条**，比默认档贵一个量级，动手前必须先跟用户确认。

## 输出位置（重要）

- `-o` 传**纯文件名**（如 `cat.mp4`）时，视频统一保存到**项目根目录下的 `seedance-output/` 文件夹**。
- `-o` 传**带目录的路径**时按给定路径保存（相对路径相对当前工作目录）。
- 不要把视频写到 `/tmp`、scratchpad 等临时目录，用户会找不到。
- 服务端返回的视频直链 24 小时过期，脚本已自动下载到本地，本地文件才是交付物。

## 完成后

脚本会打印保存路径、文件大小、耗时和计费 tokens，把路径如实回报给用户。
若脚本报生成失败（含内容审核拒绝），把错误原文如实转达，不要重试同一提示词。
若报「该模型无可用渠道」，提示用户检查令牌分组：四个模型都在 `SeeDance2`，`mini` / `fast` 也可走 `SD2Mini` / `SD2Fast`。
````

<Tip>
  `name` 必须是小写字母 + 连字符。在支持斜杠命令的 Agent 里，目录名就是命令名——叫 `seedance2` 即 `/seedance2`。`${CLAUDE_SKILL_DIR}` 是 Claude Code 提供的技能目录变量；其他 Agent 直接用脚本的实际路径即可。
</Tip>

## scripts/seedance\_video.py

新建 `seedance2/scripts/seedance_video.py`，纯 Python 标准库实现，与本站 [视频生成 API 参考](/api-capabilities/seedance2/video-generation) 的请求代码一致、已实测可跑：

```python theme={null}
#!/usr/bin/env python3
"""通过 API易 调用 Seedance 2.5 / 2.0 生成视频（文生 / 图生 / 参考图生视频）。纯标准库，零依赖。"""
import argparse
import base64
import json
import os
import shutil
import sys
import time
import urllib.error
import urllib.request

# 输出重定向到文件/管道时也逐行落盘，方便 Agent 后台跟踪进度
sys.stdout.reconfigure(line_buffering=True)

TASKS_URL = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks"

# 短名 → 完整模型 ID
MODELS = {
    "sd25": "doubao-seedance-2-5-260628",
    "mini": "doubao-seedance-2-0-mini-260615",
    "fast": "doubao-seedance-2-0-fast-260128",
    "std": "doubao-seedance-2-0-260128",
}
# 各型号分辨率上限（mini/fast 传 1080p 上游会 400，客户端直接拦下省一次请求）
MODEL_CAPS = {
    "sd25": ("480p", "720p", "1080p"),
    "mini": ("480p", "720p"),
    "fast": ("480p", "720p"),
    "std": ("480p", "720p", "1080p"),
}
# 时长上限：2.5 是 30 秒，2.0 系是 15 秒
MAX_DURATION = {"sd25": 30, "mini": 15, "fast": 15, "std": 15}
# 参考图上限：2.5 是 30 张，2.0 系是 9 张
MAX_REF_IMAGES_BY_MODEL = {"sd25": 30, "mini": 9, "fast": 9, "std": 9}
RATIOS = ("adaptive", "16:9", "4:3", "1:1", "3:4", "9:16", "21:9")
MAX_REF_IMAGES = 30

# 出片是异步任务：提交后先等一段再查，720p/5s 实测约 90-170 秒
POLL_FIRST_DELAY = 25
POLL_INTERVAL = 15
POLL_TIMEOUT = 15 * 60


def load_api_key():
    """优先读环境变量；否则在脚本所在目录及其父目录找 .env。"""
    key = os.environ.get("APIYI_API_KEY")
    if key:
        return key
    here = os.path.dirname(os.path.abspath(__file__))
    for d in (here, os.path.dirname(here)):
        env_path = os.path.join(d, ".env")
        if os.path.exists(env_path):
            with open(env_path, encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("APIYI_API_KEY") and "=" in line:
                        return line.split("=", 1)[1].strip().strip('"').strip("'")
    return None


def project_root():
    """从脚本位置向上找包含 .git 或 .claude 的目录，作为项目根目录；找不到则用当前工作目录。"""
    d = os.path.dirname(os.path.abspath(__file__))
    while True:
        if os.path.isdir(os.path.join(d, ".git")) or os.path.isdir(os.path.join(d, ".claude")):
            return d
        parent = os.path.dirname(d)
        if parent == d:
            return os.getcwd()
        d = parent


def resolve_path(out):
    """纯文件名 → 存到 <项目根>/seedance-output/ 下，确保好找；带目录成分则按给定路径。"""
    if os.path.dirname(out):
        return os.path.abspath(out)
    out_dir = os.path.join(project_root(), "seedance-output")
    os.makedirs(out_dir, exist_ok=True)
    return os.path.join(out_dir, out)


def image_source(src):
    """图片入参：URL / asset:// / data: 原样透传，本地文件转 base64 data URI。"""
    if src.startswith(("http://", "https://", "asset://", "data:")):
        return src
    if not os.path.exists(src):
        sys.exit(f"图片文件不存在：{src}")
    ext = src.lower().rsplit(".", 1)[-1]
    mime = {"png": "image/png", "webp": "image/webp"}.get(ext, "image/jpeg")
    with open(src, "rb") as f:
        return f"data:{mime};base64,{base64.b64encode(f.read()).decode()}"


def api_request(url, api_key, body=None):
    """网关会标 content-encoding: gzip 但实际未压缩，必须 Accept-Encoding: identity。"""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept-Encoding": "identity",
    }
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers,
                                 method="POST" if body is not None else "GET")
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"请求失败 HTTP {e.code}：{e.read().decode(errors='replace')[:800]}")


def download(url, path):
    """下载结果视频：签名直链，不要带 Authorization 头。"""
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=300) as r, open(path, "wb") as f:
        shutil.copyfileobj(r, f)
    return os.path.getsize(path)


def build_content(args):
    content = [{"type": "text", "text": args.prompt}]
    if args.image:
        content.append({"type": "image_url",
                        "image_url": {"url": image_source(args.image)},
                        "role": "first_frame"})
        if args.last_frame:
            content.append({"type": "image_url",
                            "image_url": {"url": image_source(args.last_frame)},
                            "role": "last_frame"})
    for src in args.ref_image:
        content.append({"type": "image_url",
                        "image_url": {"url": image_source(src)},
                        "role": "reference_image"})
    return content


def main():
    api_key = load_api_key()
    if not api_key:
        sys.exit("未找到 API Key：请在技能目录的 .env 写一行 APIYI_API_KEY=sk-xxx"
                 "（令牌须勾 SeeDance2 分组；mini / fast 也可走 SD2Mini / SD2Fast）")

    parser = argparse.ArgumentParser(description="Seedance 2.5 / 2.0 出视频")
    parser.add_argument("prompt", help="提示词（画面 + 运镜 + 氛围）")
    parser.add_argument("--model", default="mini", choices=sorted(MODELS),
                        help="mini=最快最便宜（默认）/ fast=极速版 / std=标准版 / "
                             "sd25=Seedance 2.5（最长 30 秒、最多 30 张参考图、支持 1080p 与 mov）")
    parser.add_argument("--resolution", default="720p", choices=("480p", "720p", "1080p"),
                        help="分辨率，默认 720p")
    parser.add_argument("--ratio", default="adaptive", choices=RATIOS,
                        help="宽高比，默认 adaptive（同档位全比例同价）")
    parser.add_argument("--duration", type=int, default=5,
                        help="时长整数秒（2.5 为 4-30，2.0 系为 4-15），或 -1 让模型智能决定，默认 5")
    parser.add_argument("--output-format", default=None, choices=("mp4", "mov"),
                        help="输出格式，仅 sd25 支持；mov 色彩还原更好但部分播放器不兼容")
    parser.add_argument("--no-audio", action="store_true",
                        help="关闭同步音频（默认带声音）")
    parser.add_argument("--seed", type=int, default=None, help="随机种子，复现用")
    parser.add_argument("-i", "--image", help="首帧图（本地路径 / URL / asset://），传入即图生视频")
    parser.add_argument("--last-frame", help="尾帧图，与 -i 搭配做首尾帧过渡")
    parser.add_argument("--ref-image", action="append", default=[],
                        help=f"参考图（可重复；2.5 最多 {MAX_REF_IMAGES} 张，2.0 系最多 9 张），与 -i 互斥")
    parser.add_argument("-o", "--out", default="output.mp4", help="输出文件名")
    args = parser.parse_args()

    if args.image and args.ref_image:
        sys.exit("首帧模式（-i）与参考图模式（--ref-image）互斥，一次只能用一种。")
    if args.last_frame and not args.image:
        sys.exit("--last-frame 必须与 -i（首帧图）搭配使用。")
    max_refs = MAX_REF_IMAGES_BY_MODEL[args.model]
    if len(args.ref_image) > max_refs:
        sys.exit(f"{args.model} 的参考图最多 {max_refs} 张"
                 f"{'（30 张请用 --model sd25）' if max_refs == 9 else ''}。")
    max_dur = MAX_DURATION[args.model]
    if args.duration != -1 and not 4 <= args.duration <= max_dur:
        sys.exit(f"{args.model} 的时长只支持 4-{max_dur} 整数秒，或 -1 智能时长"
                 f"{'（30 秒请用 --model sd25）' if max_dur == 15 else ''}。")
    if args.resolution not in MODEL_CAPS[args.model]:
        sys.exit(f"{args.model} 最高支持 {MODEL_CAPS[args.model][-1]}，"
                 f"1080p 请用 --model sd25 或 --model std。")
    # 2.5 的首帧 / 首尾帧任务强制 ratio=adaptive，客户端先拦下省一次往返
    if args.model == "sd25" and args.image and args.ratio != "adaptive":
        sys.exit("Seedance 2.5 的首帧 / 首尾帧生视频必须用 --ratio adaptive（上游硬约束）。")
    if args.output_format and args.model != "sd25":
        sys.exit("--output-format 仅 Seedance 2.5（--model sd25）支持。")

    body = {
        "model": MODELS[args.model],
        "content": build_content(args),
        "resolution": args.resolution,
        "ratio": args.ratio,
        "duration": args.duration,
    }
    if args.no_audio:
        body["generate_audio"] = False
    if args.seed is not None:
        body["seed"] = args.seed
    if args.output_format:
        body["output_format"] = args.output_format

    try:
        task = api_request(TASKS_URL, api_key, body)
    except (RuntimeError, OSError) as e:
        sys.exit(f"提交失败：{e}")
    task_id = task.get("id")
    if not task_id:
        sys.exit(f"提交失败，响应：{json.dumps(task, ensure_ascii=False)[:500]}")
    print(f"任务已提交 task_id={task_id}，出片通常需要 2-5 分钟，开始轮询…")

    t0 = time.time()
    time.sleep(POLL_FIRST_DELAY)
    while True:
        try:
            task = api_request(f"{TASKS_URL}/{task_id}", api_key)
        except (RuntimeError, OSError) as e:  # 网络抖动不中断轮询
            print(f"  轮询异常（继续）：{e}")
            time.sleep(POLL_INTERVAL)
            continue
        status = task.get("status", "unknown")
        elapsed = round(time.time() - t0)
        print(f"  [{elapsed:>4}s] status={status}")
        if status in ("succeeded", "failed", "expired"):
            break
        if time.time() - t0 > POLL_TIMEOUT:
            sys.exit(f"轮询超时（{POLL_TIMEOUT}s）。任务仍在服务端，可稍后手动查询：\n"
                     f"  GET {TASKS_URL}/{task_id}")
        time.sleep(POLL_INTERVAL)

    if status != "succeeded":
        err = task.get("error") or task
        sys.exit(f"生成失败（status={status}）：{json.dumps(err, ensure_ascii=False)[:500]}")

    video_url = (task.get("content") or {}).get("video_url")
    if not video_url:
        sys.exit(f"任务成功但未返回视频地址：{json.dumps(task, ensure_ascii=False)[:500]}")

    path = resolve_path(args.out)
    size = download(video_url, path)
    tokens = (task.get("usage") or {}).get("completion_tokens", "?")
    print(f"视频已保存至 {path}（{size / 1e6:.1f} MB，耗时 {round(time.time() - t0)}s，"
          f"计费 {tokens} tokens）")


if __name__ == "__main__":
    main()
```

## 怎么切换模型

切换模型**只需改 `--model`**，四种值任选：

```text theme={null}
... seedance_video.py "提示词"                                    # 默认 mini（最快最便宜）
... seedance_video.py "提示词" --model fast                       # 极速版
... seedance_video.py "提示词" --model std --resolution 1080p     # 2.0 标准版
... seedance_video.py "提示词" --model sd25 --duration 30         # Seedance 2.5·最长 30 秒
```

<Info>
  **令牌分组决定能调哪个模型**：`SeeDance2`（0.18x）里是**四个模型全部**（`sd25` / `std` / `fast` / `mini`）；特价分组是「单模型专用通道」——`SD2Mini`（0.10x）里只有 `mini`、`SD2Fast`（0.15x）里只有 `fast`，拿特价令牌调其它模型会报「该模型无可用渠道」。**一把勾了 `SeeDance2` 的令牌就够用**；跑量大再单独开特价令牌，详见 [概览页的分组介绍](/api-capabilities/seedance2/overview)。
</Info>

## 出片要等 2-5 分钟（重要）

视频生成是**异步任务**，这是它与图片技能最大的不同：

* 脚本已封装完整流程：提交任务 → 每 15 秒轮询一次 → 成功后自动下载 mp4，**720p/5s 实测全程约 2-3 分钟**，1080p 或长时长会更久。
* **Agent 执行时要给命令设长超时（600 秒以上）或放到后台跑**——很多 Agent 的命令默认 2 分钟超时，会在出片前把脚本掐断。`SKILL.md` 里已写明这条，支持后台执行的 Agent（如 Claude Code）会自动处理。
* 万一轮询超时（15 分钟），任务仍在服务端排队，脚本会打印 `task_id` 和查询命令，稍后手动查询即可，**不会白扣费**——Seedance 2.0 是提交预扣、完成后多退少补，提交被拒（HTTP 400）分文不扣。

## 为什么一句话就能出视频

很多人好奇：我又没敲命令，怎么说句"生成一段猫的视频"它就出片了？

原理是这样：Agent 启动时会**先读取每个技能 `SKILL.md` 里的 `description`**（一段很短的元数据，说明「这个技能做什么、什么时候该用」）。当你说出的需求**匹配上**这段描述的场景（比如"生成/做一段视频""把这张图做成动图"），Agent 就**自动决定调用这个技能**，去读完整的 `SKILL.md` 并运行脚本——整个过程你不用记任何命令。

不想靠 Agent 猜、想要**百分百可控**时，用下面的**显性调用**。

## 怎么用

### 自然语言（隐式触发）

装好后直接对 Agent 说话即可：

| 你说                   | 技能行为                                             |
| -------------------- | ------------------------------------------------ |
| "生成一段猫在草地上跑的视频"      | 默认 `mini` / 720p / 5 秒，出 1 条带音频的 mp4             |
| "把这张海报做成动态视频"        | 带 `-i poster.png`，首帧图生视频                         |
| "来一段 10 秒的 1080p 航拍" | 带 `--model std --resolution 1080p --duration 10` |
| "用这几张角色图出一段跑酷视频"     | 带 `--ref-image` 传参考图                             |
| "不要背景音"              | 带 `--no-audio`                                   |

### 显性调用（更可控）

* **支持斜杠命令的 Agent**（如 Claude Code）：

  ```text theme={null}
  /seedance2 无人机航拍秋天的山谷，金黄色森林，电影感 --duration 8 --ratio 16:9
  ```

* **任意 Agent / 直接命令它跑脚本**（最通用）：

  ```text theme={null}
  运行 python3 seedance2/scripts/seedance_video.py "无人机航拍秋天的山谷，电影感" --duration 8
  ```

## 生成的视频在哪里

* 当 `-o` 只传**文件名**（如 `-o cat.mp4`）时，视频统一存到**项目根目录下的 `seedance-output/` 文件夹**（脚本自动创建），在项目里直接就能找到。
* 「项目根目录」= 脚本从自身位置向上找到的第一个含 `.git` 或 `.claude` 的目录——**不管 Agent 在哪个目录运行，视频都落在项目里**，不会跑进临时目录害你找不到。
* 脚本完成后会**打印一行完整绝对路径**，附带文件大小、耗时和计费 tokens，例如 `视频已保存至 /Users/you/project/seedance-output/cat.mp4（3.8 MB，耗时 132s，计费 108900 tokens）`。
* 服务端返回的视频直链 **24 小时过期**，所以脚本一律先下载到本地——**本地 mp4 才是交付物**，不要把直链存起来当结果。
* 传**带目录的路径**（如 `-o videos/cat.mp4` 或绝对路径）时，按你给的路径存，不进 `seedance-output/`。

## 相关文档

* [Seedance 2.0 概览](/api-capabilities/seedance2/overview)（模型、价格、分组）
* [视频生成 API 参考](/api-capabilities/seedance2/video-generation)（完整参数与端点）
* [素材引用生视频实战](/api-capabilities/seedance2/asset-reference)（人物一致性、`asset://` 素材）
* [GPT-Image-2 系列 Agent 技能](/api-capabilities/gpt-image-2/skills)（图片版姊妹篇）
* [Nano Banana Pro Agent 技能](/api-capabilities/nano-banana-image/skills)
