> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan2.7 与 HappyHorse 视频 Agent 技能

> 把阿里系视频模型 Wan2.7 与 HappyHorse 封装成一个开箱即用的 Agent Skill，丢进 Codex、OpenClaw、Claude Code 等任意编码 Agent，一句话完成文生视频、图生视频、参考图生视频与视频编辑，--model 一键切换两个系列，本地图可直接上传。

<Note>
  本页提供一个**开箱即用的 Agent 技能（Skill）**：一个零依赖脚本同时覆盖 **Wan2.7** 与 **HappyHorse** 两个系列——它们走同一个端点、同一套请求结构、同一个 `Wan&HappyHorse` 令牌分组，用 `--model` 一键切换。脚本会按你传入的素材**自动选择模型**（文生 / 图生 / 参考图生 / 视频编辑），并封装好「提交 → 轮询 → 下载成片」的完整异步流程，整套东西就两个文件。
</Note>

## 这个技能能做什么

一个合并技能，脚本根据**传入的素材类型**自动判断生成模式、选对模型 ID：

<CardGroup cols={2}>
  <Card title="文生视频" icon="clapperboard">
    只给提示词 → 生成全新视频，默认开启提示词智能扩写，短提示词也有好效果。
  </Card>

  <Card title="图生视频" icon="image-play">
    传入首帧图让静态图动起来——本地图片直接传，脚本自动上传。
  </Card>

  <Card title="参考图生视频" icon="layers">
    传参考图（Wan 还可传参考视频）→ 保持角色、物品或风格出新画面，prompt 里用「图1 / 视频1」指代。
  </Card>

  <Card title="视频编辑" icon="scissors">
    传一段视频 + 参考图 → 替换 / 改造视频里的元素，输出时长跟随源视频。
  </Card>
</CardGroup>

## 两个系列怎么选

两个系列**调用方式完全一致**，区别在价格、画质取向和参考素材能力。脚本已按 `--model` 自动处理差异：

| 系列（`--model`） | 定位       | 720P 价格   | 1080P 价格  | 720P/5s 约  | 参考素材       | 720P/5s 实测速度 |
| ------------- | -------- | --------- | --------- | ---------- | ---------- | ------------ |
| `wan`（默认）     | 性价比，走量首选 | \$0.084/秒 | \$0.14/秒  | **\$0.42** | 图+视频合计 5 个 | 45–155s      |
| `happyhorse`  | 画质取向     | \$0.126/秒 | \$0.224/秒 | **\$0.63** | 仅图、最多 9 张  | 105–125s     |

<Tip>
  简单记：**日常与走量用默认 `wan`**；**对画面质感要求高** → `--model happyhorse`。两家共用 `Wan&HappyHorse` 分组（0.14x 倍率，约为官网人民币价的 98%，叠加充值加赠后更低），一把令牌通吃，没有特价分组。按秒计费、失败任务不扣费。价格明细见 [Wan 概览](/api-capabilities/wan/overview) 与 [HappyHorse 概览](/api-capabilities/happyhorse/overview)。
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
wan/
├── SKILL.md
├── scripts/
│   └── wan_video.py
└── .env          # 第②步创建，放你的 Key
```

### ② 同目录写 Key

在 `wan/.env` 里写上你的 **API易 API Key**（在 `api.apiyi.com` 控制台创建，**令牌须勾选 `Wan&HappyHorse` 分组**、计费模式选按量——按次计费令牌无法路由）：

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

脚本会自动从这个 `.env` 读取 Key，**无需任何额外配置或环境变量**。

<Warning>
  `.env` 里是你的密钥。如果这个技能要随项目仓库共享，**务必把 `.env` 加进 `.gitignore`，不要提交到 git**。
</Warning>

### ③ 交给 Agent

* **支持技能自动发现的 Agent**（如 Claude Code）：把整个 `wan/` 目录放进它的技能目录——个人级 `~/.claude/skills/`，或项目级 `.claude/skills/`（随仓库共享）。
* **其他 Agent**：按它各自的技能/插件约定放置；或者最简单——**直接让 Agent「读一下这个文件夹里的 SKILL.md，并照着执行」** 即可。

装好后就能用了，跳到 [怎么用](#怎么用) 看示例。

## SKILL.md

新建 `wan/SKILL.md`，完整内容如下（`description` 写清「做什么 + 何时用」，Agent 会据此自动触发）：

````markdown theme={null}
---
name: wan
description: Generate videos via APIYI's Wan2.7 and HappyHorse (Alibaba) models — text-to-video, image-to-video (first frame), reference-image/video-to-video, and video editing. Use this when the user asks to create, generate, or animate a video clip, or to restyle/edit an existing video.
allowed-tools: Bash(python3 *)
---

# Wan2.7 / HappyHorse 出视频技能

通过 API易 平台调用阿里系视频模型出片。一个脚本覆盖两个系列，`--model` 切换：

- `wan`（默认）：Wan2.7 系列，更便宜（720P 约 \$0.084/秒）。
- `happyhorse`：HappyHorse-1.1 系列，画质取向，价格约 wan 的 1.5 倍；不支持参考视频。

脚本按传入素材自动选模型：不传图 = 文生视频；`-i` 首帧图 = 图生视频；`--ref-image`/`--ref-video` = 参考生视频；`--video`+`--ref-image` = 视频编辑。

## Key 配置

脚本会自动读取技能目录下 `.env` 文件里的 `APIYI_API_KEY`（也支持同名环境变量）。
若脚本报「未找到 Key」，提示用户在 `.env` 里写一行 `APIYI_API_KEY=sk-xxx`，
且该令牌须勾选 `Wan&HappyHorse` 分组、计费模式为按量（按次计费令牌无法路由）。

## 用法（重要：出片要 2-5 分钟）

视频是**异步任务**：脚本内部会提交任务并轮询到完成，单次调用总耗时通常 2-5 分钟（1080P 或长视频更久）。
**执行时必须给 Bash 设长超时（600 秒以上）或放到后台跑**，不要用默认 2 分钟超时，否则会在出片前被掐断。

```bash
# 文生视频（默认 wan / 720P / 5 秒）
python3 ${CLAUDE_SKILL_DIR}/scripts/wan_video.py "夜晚的东京街头，霓虹灯闪烁，行人撑伞走过，雨天氛围" -o tokyo.mp4

# 图生视频（首帧图；本地路径或公网 URL 都行，本地文件自动转 base64 上传）
python3 ${CLAUDE_SKILL_DIR}/scripts/wan_video.py "镜头缓缓推近，光影流动" -i photo.jpg -o animated.mp4

# 参考图生视频（保持角色/风格；prompt 里用「图1」「图2」指代素材）
python3 ${CLAUDE_SKILL_DIR}/scripts/wan_video.py "图1中的角色在雪地里奔跑" --ref-image role.png -o run.mp4

# 视频编辑（用参考图改视频里的元素）
python3 ${CLAUDE_SKILL_DIR}/scripts/wan_video.py "把视频1里的人物替换成图1的角色" --video https://example.com/src.mp4 --ref-image https://example.com/role.png -o edited.mp4

# 换 HappyHorse、要 1080P
python3 ${CLAUDE_SKILL_DIR}/scripts/wan_video.py "无人机航拍秋天山谷，电影感" --model happyhorse --resolution 1080P --duration 8 -o valley.mp4
```

参数说明：

- 第 1 个位置参数：提示词（必填）。多素材时用「图1 / 视频1」按顺序指代。
- `--model`：`wan`（默认）/ `happyhorse`。
- `--resolution`：`720P`（默认）/ `1080P`（注意大写、无 480P 档）。
- `--ratio`：`16:9` / `9:16` / `1:1` / `4:3` / `3:4`（传首帧图时被忽略；happyhorse 文档未列此参数，仅显式传时发送）。
- `--duration`：2-15 整数秒，默认 5；含参考视频时上限 10；编辑模式输出时长跟随源视频。
- `--negative`：负向提示词。`--no-prompt-extend`：关闭提示词智能扩写（默认开启）。
- `-i / --image`：首帧图（本地路径或 URL）。`--ref-image`：参考图可重复（wan 合计最多 5、happyhorse 最多 9）。`--ref-video`：参考视频 URL（仅 wan）。`--video`：待编辑视频 URL。
- `-o / --out`：输出文件名，默认 `output.mp4`。

## 素材输入（重要）

- 图片素材：**本地文件和公网 URL 都行**——脚本会把本地文件转成 base64 data URI 上传（两系列实测可用；官方文档只写了 URL 口径）。
- 视频素材（`--ref-video` / `--video`）：优先用公网 URL；大视频转 base64 体积会膨胀，可能超请求限制。

## 出片条数与成本（重要）

- **一次调用只出 1 条视频**，没有批量参数。用户要多条时串行多次调用，并在动手前提醒成本。
- 按秒计费：wan 720P \$0.084/秒（5 秒约 \$0.42）、1080P \$0.14/秒；happyhorse 约为 wan 的 1.5 倍。
  用户没有明确要求时，**保持默认 wan / 720P / 5s**，不要擅自加时长、升 1080P 或换 happyhorse。
- 失败任务不计费；重复提交会重复计费，不要对同一请求自动重试。

## 输出位置（重要）

- `-o` 传**纯文件名**（如 `cat.mp4`）时，视频统一保存到**项目根目录下的 `wan-output/` 文件夹**。
- `-o` 传**带目录的路径**时按给定路径保存（相对路径相对当前工作目录）。
- 不要把视频写到 `/tmp`、scratchpad 等临时目录，用户会找不到。
- 结果直链 24 小时过期，脚本已自动下载到本地，本地文件才是交付物。

## 完成后

脚本会打印保存路径、文件大小和耗时，把路径如实回报给用户。
若脚本报生成失败（含内容审核拒绝），把错误原文如实转达，不要重试同一提示词。
若报「该模型无可用渠道」，提示用户检查令牌分组是否勾了 `Wan&HappyHorse`、计费模式是否为按量。
````

<Tip>
  `name` 必须是小写字母 + 连字符。在支持斜杠命令的 Agent 里，目录名就是命令名——叫 `wan` 即 `/wan`。`${CLAUDE_SKILL_DIR}` 是 Claude Code 提供的技能目录变量；其他 Agent 直接用脚本的实际路径即可。
</Tip>

## scripts/wan\_video.py

新建 `wan/scripts/wan_video.py`，纯 Python 标准库实现，与本站各 API 参考页的请求代码一致、已实测可跑：

```python theme={null}
#!/usr/bin/env python3
"""通过 API易 调用 Wan2.7 / HappyHorse 生成视频（文生 / 图生 / 参考图生 / 视频编辑）。纯标准库，零依赖。"""
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

# DashScope 透传端点。绝不要用 /v1/videos 扁平路径——它会丢弃 media 字段
CREATE_URL = "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis"
TASK_URL = "https://api.apiyi.com/v1/tasks/{}"

# 家族 × 模式 → 模型 ID。编辑版命名不规则（happyhorse 是 1.0 且带连字符），别手拼
FAMILY_MODELS = {
    "wan": {"t2v": "wan2.7-t2v", "i2v": "wan2.7-i2v",
            "r2v": "wan2.7-r2v", "edit": "wan2.7-videoedit"},
    "happyhorse": {"t2v": "happyhorse-1.1-t2v", "i2v": "happyhorse-1.1-i2v",
                   "r2v": "happyhorse-1.1-r2v", "edit": "happyhorse-1.0-video-edit"},
}
# r2v 参考素材上限：wan 图+视频合计 5，happyhorse 仅图、最多 9
MAX_REFS = {"wan": 5, "happyhorse": 9}
RATIOS = ("16:9", "9:16", "1:1", "4:3", "3:4")

# 出片是异步任务：720P/5s 实测约 70-140 秒，1080P/长视频可能 5 分钟以上
POLL_FIRST_DELAY = 15
POLL_INTERVAL = 8
POLL_TIMEOUT = 20 * 60


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
    """纯文件名 → 存到 <项目根>/wan-output/ 下，确保好找；带目录成分则按给定路径。"""
    if os.path.dirname(out):
        return os.path.abspath(out)
    out_dir = os.path.join(project_root(), "wan-output")
    os.makedirs(out_dir, exist_ok=True)
    return os.path.join(out_dir, out)


def media_source(src):
    """素材入参：URL / data: 原样透传，本地文件转 base64 data URI（实测两系列可用）。"""
    if src.startswith(("http://", "https://", "data:")):
        return src
    if not os.path.exists(src):
        sys.exit(f"素材文件不存在：{src}")
    ext = src.lower().rsplit(".", 1)[-1]
    mime = {"png": "image/png", "webp": "image/webp", "mp4": "video/mp4",
            "mov": "video/quicktime"}.get(ext, "image/jpeg")
    with open(src, "rb") as f:
        return f"data:{mime};base64,{base64.b64encode(f.read()).decode()}"


def api_request(url, api_key, body=None, extra_headers=None):
    """网关会标 content-encoding: gzip 但实际未压缩，必须 Accept-Encoding: identity。"""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept-Encoding": "identity",
    }
    if extra_headers:
        headers.update(extra_headers)
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers,
                                 method="POST" if body is not None else "GET")
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"请求失败 HTTP {e.code}：{e.read().decode(errors='replace')[:800]}")


def download(url, path):
    """下载结果视频：OSS 签名直链，绝不能带 Authorization 头（带了 403）。"""
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=300) as r, open(path, "wb") as f:
        shutil.copyfileobj(r, f)
    return os.path.getsize(path)


def detect_mode(args):
    if args.video:
        return "edit"
    if args.image:
        return "i2v"
    if args.ref_image or args.ref_video:
        return "r2v"
    return "t2v"


def build_media(args, mode):
    media = []
    if mode == "i2v":
        media.append({"type": "first_frame", "url": media_source(args.image)})
    elif mode == "r2v":
        for src in args.ref_image:
            media.append({"type": "reference_image", "url": media_source(src)})
        for src in args.ref_video:
            media.append({"type": "reference_video", "url": media_source(src)})
    elif mode == "edit":
        media.append({"type": "video", "url": media_source(args.video)})
        for src in args.ref_image:
            media.append({"type": "reference_image", "url": media_source(src)})
    return media


def main():
    api_key = load_api_key()
    if not api_key:
        sys.exit("未找到 API Key：请在技能目录的 .env 写一行 APIYI_API_KEY=sk-xxx"
                 "（令牌须勾选 Wan&HappyHorse 分组、计费模式为按量）")

    parser = argparse.ArgumentParser(description="Wan2.7 / HappyHorse 出视频")
    parser.add_argument("prompt", help="提示词（画面 + 运镜 + 氛围；多素材时用「图1/视频1」指代）")
    parser.add_argument("--model", default="wan", choices=sorted(FAMILY_MODELS),
                        help="wan=Wan2.7（默认，更便宜）/ happyhorse=HappyHorse-1.1（画质取向）")
    parser.add_argument("--resolution", default="720P", type=str.upper,
                        choices=("720P", "1080P"), help="分辨率，默认 720P（注意无 480P）")
    parser.add_argument("--ratio", default=None, choices=RATIOS,
                        help="宽高比（传首帧图时忽略；happyhorse 文档未列此参数，仅显式传时发送）")
    parser.add_argument("--duration", type=int, default=5,
                        help="时长 2-15 整数秒，默认 5；含参考视频时上限 10；编辑模式跟随源视频")
    parser.add_argument("--negative", help="负向提示词（不想出现的内容，500 字符内）")
    parser.add_argument("--no-prompt-extend", action="store_true",
                        help="关闭提示词智能扩写（默认开启，短提示词效果更好）")
    parser.add_argument("--seed", type=int, default=None, help="随机种子，复现用")
    parser.add_argument("-i", "--image", help="首帧图（本地路径或 URL，图生视频）")
    parser.add_argument("--ref-image", action="append", default=[],
                        help="参考图，可重复（wan 与参考视频合计最多 5、happyhorse 最多 9）")
    parser.add_argument("--ref-video", action="append", default=[],
                        help="参考视频 URL，可重复（仅 wan 支持）")
    parser.add_argument("--video", help="待编辑视频 URL（视频编辑模式，需配 --ref-image）")
    parser.add_argument("-o", "--out", default="output.mp4", help="输出文件名")
    args = parser.parse_args()

    if args.image and (args.ref_image or args.ref_video):
        sys.exit("首帧模式（-i）与参考模式（--ref-image/--ref-video）互斥，一次只能用一种。")
    if args.video and args.image:
        sys.exit("视频编辑模式（--video）与首帧模式（-i）互斥。")
    if args.video and not args.ref_image:
        sys.exit("视频编辑模式需要至少 1 张参考图（--ref-image）。")
    if args.model == "happyhorse" and args.ref_video:
        sys.exit("happyhorse 不支持参考视频（--ref-video），仅 wan 支持。")
    n_refs = len(args.ref_image) + len(args.ref_video)
    if n_refs > MAX_REFS[args.model]:
        sys.exit(f"{args.model} 参考素材最多 {MAX_REFS[args.model]} 个，当前 {n_refs} 个。")
    if not 2 <= args.duration <= 15:
        sys.exit("时长只支持 2-15 整数秒。")
    if args.ref_video and args.duration > 10:
        sys.exit("含参考视频时时长上限 10 秒。")

    mode = detect_mode(args)
    model = FAMILY_MODELS[args.model][mode]

    input_part = {"prompt": args.prompt}
    if args.negative:
        input_part["negative_prompt"] = args.negative
    media = build_media(args, mode)
    if media:
        input_part["media"] = media

    parameters = {
        "resolution": args.resolution,
        "duration": args.duration,
        "prompt_extend": not args.no_prompt_extend,
    }
    if args.ratio:
        parameters["ratio"] = args.ratio
    if args.seed is not None:
        parameters["seed"] = args.seed

    body = {"model": model, "input": input_part, "parameters": parameters}

    try:
        resp = api_request(CREATE_URL, api_key, body,
                           extra_headers={"X-DashScope-Async": "enable"})
    except (RuntimeError, OSError) as e:
        sys.exit(f"提交失败：{e}")
    task_id = (resp.get("output") or {}).get("task_id") or resp.get("task_id")
    if not task_id:
        sys.exit(f"提交失败，响应：{json.dumps(resp, ensure_ascii=False)[:500]}")
    print(f"任务已提交 model={model} task_id={task_id}，出片通常需要 2-5 分钟，开始轮询…")

    t0 = time.time()
    time.sleep(POLL_FIRST_DELAY)
    while True:
        try:
            task = api_request(TASK_URL.format(task_id), api_key)
        except (RuntimeError, OSError) as e:  # 网络抖动不中断轮询
            print(f"  轮询异常（继续）：{e}")
            time.sleep(POLL_INTERVAL)
            continue
        status = str(task.get("status", "unknown")).lower()
        progress = task.get("progress", "")
        elapsed = round(time.time() - t0)
        # progress 常停在 30（上游只有 0/10/30/100 几档），不代表卡住
        print(f"  [{elapsed:>4}s] status={status}" + (f" progress={progress}" if progress != "" else ""))
        if status in ("completed", "failed"):
            break
        if time.time() - t0 > POLL_TIMEOUT:
            sys.exit(f"轮询超时（{POLL_TIMEOUT}s）。任务仍在服务端，可稍后手动查询：\n"
                     f"  GET {TASK_URL.format(task_id)}")
        time.sleep(POLL_INTERVAL)

    if status != "completed":
        err = task.get("error") or task.get("fail_reason") or task
        sys.exit(f"生成失败（status={status}）：{json.dumps(err, ensure_ascii=False)[:500]}"
                 "\n（失败任务不计费）")

    result_url = task.get("result_url")
    if not result_url:
        sys.exit(f"任务完成但未返回视频地址：{json.dumps(task, ensure_ascii=False)[:500]}")

    path = resolve_path(args.out)
    size = download(result_url, path)
    print(f"视频已保存至 {path}（{size / 1e6:.1f} MB，耗时 {round(time.time() - t0)}s，"
          f"模型 {model}）")


if __name__ == "__main__":
    main()
```

## 怎么切换系列

切换系列**只需改 `--model`**，两种值任选，模型 ID 由脚本按「系列 × 素材类型」自动推导：

```text theme={null}
... wan_video.py "提示词"                        # 默认 wan（Wan2.7 系列）
... wan_video.py "提示词" --model happyhorse     # HappyHorse-1.1 系列
```

<Info>
  **模型 ID 自动推导表**（不用记这些名字，脚本按素材自动选）：

  | 你传的素材                         | 模式    | wan                | happyhorse                  |
  | ----------------------------- | ----- | ------------------ | --------------------------- |
  | 只有提示词                         | 文生视频  | `wan2.7-t2v`       | `happyhorse-1.1-t2v`        |
  | `-i` 首帧图                      | 图生视频  | `wan2.7-i2v`       | `happyhorse-1.1-i2v`        |
  | `--ref-image` / `--ref-video` | 参考生视频 | `wan2.7-r2v`       | `happyhorse-1.1-r2v`        |
  | `--video` + `--ref-image`     | 视频编辑  | `wan2.7-videoedit` | `happyhorse-1.0-video-edit` |
</Info>

## 素材输入：本地图直接传（实测）

官方文档口径是「media 须为公网可访问的 https URL」，但我们实测两个系列**都接受 base64 data URI**——所以脚本对本地图片做了自动转换，`-i photo.jpg`、`--ref-image role.png` 直接传本地路径即可，无需先上传图床。视频素材（`--ref-video` / `--video`）仍建议用公网 URL，大文件转 base64 体积膨胀约三分之一，容易超请求限制。

## 出片要等 2-5 分钟（重要）

视频生成是**异步任务**：

* 脚本已封装完整流程：提交（`X-DashScope-Async` 异步头）→ 每 8 秒轮询 → 完成后自动下载 mp4。**720P/5s 实测全程约 45–155 秒**，1080P 或长时长可能 5 分钟以上。
* 轮询打印的 `progress` **长时间停在 30% 是正常现象**（上游只上报 0/10/30/100 几档），不代表卡住。
* **Agent 执行时要给命令设长超时（600 秒以上）或放到后台跑**——很多 Agent 的命令默认 2 分钟超时，会在出片前把脚本掐断。`SKILL.md` 里已写明这条。
* 万一轮询超时（20 分钟），任务仍在服务端，脚本会打印 `task_id` 和查询命令。**失败任务不计费**；但重复提交会重复计费，脚本不做自动重试。

## 为什么一句话就能出视频

很多人好奇：我又没敲命令，怎么说句"生成一段视频"它就出片了？

原理是这样：Agent 启动时会**先读取每个技能 `SKILL.md` 里的 `description`**（一段很短的元数据，说明「这个技能做什么、什么时候该用」）。当你说出的需求**匹配上**这段描述的场景（比如"生成/做一段视频""把这张图做成动图""改一下这段视频"），Agent 就**自动决定调用这个技能**，去读完整的 `SKILL.md` 并运行脚本——整个过程你不用记任何命令。

不想靠 Agent 猜、想要**百分百可控**时，用下面的**显性调用**。

## 怎么用

### 自然语言（隐式触发）

装好后直接对 Agent 说话即可：

| 你说                  | 技能行为                                      |
| ------------------- | ----------------------------------------- |
| "生成一段东京雨夜街头的视频"     | 默认 `wan` / 720P / 5 秒                     |
| "把这张海报做成动态视频"       | 带 `-i poster.png`，本地图自动上传                 |
| "用画质好点的模型出一段 1080P" | 带 `--model happyhorse --resolution 1080P` |
| "让图1的角色在图2的场景里跑起来"  | 带两个 `--ref-image`，参考生视频                   |
| "把这段视频里的人换成这张图的角色"  | 带 `--video` + `--ref-image`，视频编辑          |

### 显性调用（更可控）

* **支持斜杠命令的 Agent**（如 Claude Code）：

  ```text theme={null}
  /wan 无人机航拍秋天的山谷，金黄色森林，电影感 --duration 8 --ratio 16:9
  ```

* **任意 Agent / 直接命令它跑脚本**（最通用）：

  ```text theme={null}
  运行 python3 wan/scripts/wan_video.py "无人机航拍秋天的山谷，电影感" --duration 8
  ```

## 生成的视频在哪里

* 当 `-o` 只传**文件名**（如 `-o cat.mp4`）时，视频统一存到**项目根目录下的 `wan-output/` 文件夹**（脚本自动创建），两个系列共用这个目录。
* 「项目根目录」= 脚本从自身位置向上找到的第一个含 `.git` 或 `.claude` 的目录——**不管 Agent 在哪个目录运行，视频都落在项目里**，不会跑进临时目录害你找不到。
* 脚本完成后会**打印一行完整绝对路径**，附带文件大小和耗时，例如 `视频已保存至 /Users/you/project/wan-output/tokyo.mp4（4.9 MB，耗时 153s，模型 wan2.7-t2v）`。
* 实测出片**自带音轨**（AAC 双声道）。
* 结果直链 **24 小时过期**，所以脚本一律先下载到本地——**本地 mp4 才是交付物**，不要把直链存起来当结果。
* 传**带目录的路径**（如 `-o videos/cat.mp4` 或绝对路径）时，按你给的路径存，不进 `wan-output/`。

## 相关文档

* [Wan 视频生成概览](/api-capabilities/wan/overview)（模型、价格、分组）
* [Wan2.7 文生视频 API 参考](/api-capabilities/wan/text-to-video)
* [Wan2.7 参考图生视频 API 参考](/api-capabilities/wan/reference-to-video)
* [HappyHorse 视频 Agent 技能](/api-capabilities/happyhorse/skills)（卫星页 · 差异速览）
* [Seedance 2.0 视频 Agent 技能](/api-capabilities/seedance2/skills)（火山系姊妹篇）
