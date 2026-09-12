> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Lite Agent 技能

> 把 Nano Banana 2 Lite（gemini-3.1-flash-lite-image）封装成开箱即用的 Agent Skill，丢进 Codex、OpenClaw、hermes-agent、Claude Code 等任意编码 Agent，一句话即可调用 API易 平台完成文生图与图片编辑。

<Note>
  本页提供一个**开箱即用的 Agent 技能（Skill）**：把它放进你正在用的编码 Agent，就能用自然语言（或显式命令）直接调用 API易 平台的 **Nano Banana 2 Lite**（`gemini-3.1-flash-lite-image`）完成生图与改图。整套东西就两个文件，复制即用。
</Note>

<Tip>
  如果你需要更高画质或 2K/4K，见 [Nano Banana 2 Agent 技能](/api-capabilities/nano-banana-2-image/skills)（最高 4K）或 [Nano Banana Pro Agent 技能](/api-capabilities/nano-banana-image/skills)（极致画质）。本页是 **Lite**（最快最省，专注 1K，按次 \$0.025/次）。
</Tip>

## 这个技能能做什么

一个合并技能，脚本会根据**是否传入图片**自动判断是「文生图」还是「图片编辑」：

<CardGroup cols={3}>
  <Card title="文生图" icon="wand-sparkles">
    只给提示词 → 生成全新图片，支持 **14 种宽高比**，1K 画布，约 4 秒出图。
  </Card>

  <Card title="图片编辑" icon="image">
    传入一张图 + 指令 → 局部编辑、风格迁移、背景替换等。
  </Card>

  <Card title="多图合成" icon="layers">
    传入多张图 + 一条指令 → 多图合成、对比、换装等高级玩法。
  </Card>
</CardGroup>

Nano Banana 2 Lite 主打**速度与成本**：约 4 秒出图、比 Nano Banana 2 快约 2.7 倍，按量实测约 \$0.018/次（官网 4 折费率）、按次 \$0.025/张，最适合高并发、快速迭代、走量场景。

## 能用在哪些 Agent

<Info>
  一个 Skill 本质上就是**一个文件夹**：一份写给 Agent 看的说明（`SKILL.md`）+ 一个干活的脚本。所以**凡是能读取本地文件、执行命令行的编码 Agent 都能用上**——比如 **Codex、OpenClaw、hermes-agent、Claude Code** 等。

  唯一要求：跑 Agent 的那台机器（你的电脑或服务器）装了 **Python 3** 并且**能联网**（脚本要直连 `api.apiyi.com`）。仅此而已，不挑具体哪家 Agent。
</Info>

## 三步装好

### ① 建目录、贴文件

新建一个技能文件夹，放入下面两个文件（完整内容见后两节）：

```
nano-banana-lite/
├── SKILL.md
├── scripts/
│   └── nano_banana_lite.py
└── .env          # 第②步创建，放你的 Key
```

### ② 同目录写 Key

在 `nano-banana-lite/.env` 里写上你的 **API易 API Key**（在 `api.apiyi.com` 控制台创建）：

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

脚本会自动从这个 `.env` 读取 Key，**无需任何额外配置或环境变量**。

<Warning>
  `.env` 里是你的密钥。如果这个技能要随项目仓库共享，**务必把 `.env` 加进 `.gitignore`，不要提交到 git**。
</Warning>

### ③ 交给 Agent

* **支持技能自动发现的 Agent**（如 Claude Code）：把整个 `nano-banana-lite/` 目录放进它的技能目录——个人级 `~/.claude/skills/`，或项目级 `.claude/skills/`（随仓库共享）。
* **其他 Agent**：按它各自的技能/插件约定放置；或者最简单——**直接让 Agent「读一下这个文件夹里的 SKILL.md，并照着执行」** 即可。

装好后就能用了，跳到 [怎么用](#怎么用) 看示例。

## SKILL.md

新建 `nano-banana-lite/SKILL.md`，完整内容如下（`description` 写清「做什么 + 何时用」，Agent 会据此自动触发）：

````markdown theme={null}
---
name: nano-banana-lite
description: Generate or edit images via APIYI's Nano Banana 2 Lite (gemini-3.1-flash-lite-image) model. Use this when the user asks to create, draw, render, or generate an image/illustration/poster, or to edit, retouch, restyle, or composite existing images.
allowed-tools: Bash(python3 *)
---

# Nano Banana Lite 出图技能

通过 API易 平台调用 Nano Banana 2 Lite（`gemini-3.1-flash-lite-image`）生成或编辑图片。约 4 秒出图、专注 1K 画布，性价比高、适合走量。

## Key 配置

脚本会自动读取技能目录下 `.env` 文件里的 `APIYI_API_KEY`（也支持同名环境变量）。
若脚本报「未找到 Key」，提示用户在 `.env` 里写一行 `APIYI_API_KEY=sk-xxx`。

## 用法

调用同目录下的脚本，第一个参数是提示词；编辑图片时用 `-i` 传入一张或多张本地图片路径：

```bash
# 文生图（默认出 1 张）
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_lite.py "一只戴着宇航头盔的柴犬，电影感打光" -o dog.png --aspect 16:9

# 超宽横幅（8:1 / 4:1 等超宽比例）
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_lite.py "国风山水长卷横幅" -o banner.png --aspect 8:1

# 图片编辑（传 1 张）
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_lite.py "把背景换成赛博朋克城市夜景" -i input.jpg -o edited.png

# 多图合成（传多张，重复 -i）
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_lite.py "把这两个人合到同一张办公室合影里" -i a.png -i b.png -o merged.png

# 一次出多张同主题变体（最多 5 张，并发生成）
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_lite.py "国风山水插画" -o shanshui.png -n 3 --aspect 16:9
```

参数说明：

- 第 1 个位置参数：提示词（必填）。
- `-i / --image`：输入图片路径，可重复多次；不传 = 文生图，传 = 图片编辑。
- `-o / --out`：输出文件名，默认 `output.png`。
- `-n / --count`：一次出几张，**默认 1**，最多 5（脚本内并发生成，超过会自动截到 5）。`-n>1` 时文件名自动加 `-1` `-2`… 后缀。
- `--aspect`：宽高比，14 选 1（`1:1` `1:4` `4:1` `1:8` `8:1` `2:3` `3:2` `3:4` `4:3` `4:5` `5:4` `9:16` `16:9` `21:9`），默认 `1:1`。
- `--size`：分辨率仅支持 `1K`（Lite 专注 1K 画布），默认 `1K`。

## 出图张数（重要）

- **默认只出 1 张**：用户没有明确要求多张时，`-n` 保持默认（即不传），只生成 1 张。
- **指定多张才出多张**：用户说「出 3 张 / 来几张 / 多给几个版本」时才用 `-n`，且**一次不超过 5 张**。需要更多时分多次调用，不要试图绕过上限。
- 多张是同一提示词的并发变体（模型有随机性，结果各不相同）。

## 输出位置（重要）

- `-o` 传**纯文件名**（如 `dog.png`）时，图片统一保存到**项目根目录下的 `nano-banana-output/` 文件夹**，方便用户在项目里直接找到。
- `-o` 传**带目录的路径**（相对或绝对，如 `images/dog.png` 或 `/abs/path/dog.png`）时，按给定路径保存（相对路径相对当前工作目录）。
- 不要把图片写到 `/tmp`、scratchpad 等临时目录，用户会找不到。

## 完成后

脚本会为每张图打印一行完整路径，把它们如实回报给用户。若脚本报告被内容安全策略拒绝，把拒绝原因如实转达，不要重试同一提示词。
````

<Tip>
  `name` 必须是小写字母 + 连字符，且**不能含 `claude` / `anthropic`** 等保留词。在支持斜杠命令的 Agent 里，目录名就是命令名——叫 `nano-banana-lite` 即 `/nano-banana-lite`。`${CLAUDE_SKILL_DIR}` 是 Claude Code 提供的技能目录变量；其他 Agent 直接用脚本的实际路径即可。
</Tip>

## scripts/nano\_banana\_lite.py

新建 `nano-banana-lite/scripts/nano_banana_lite.py`，使用 Gemini 原生格式（与本站文生图 / 图片编辑接口代码一致、已验证可跑）。**纯 Python 标准库，无需 `pip install` 任何东西**：

```python theme={null}
#!/usr/bin/env python3
"""通过 API易 调用 Nano Banana 2 Lite（gemini-3.1-flash-lite-image）生成 / 编辑图片。纯标准库，零依赖。"""
import argparse
import base64
import json
import os
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

# 一次调用最多并发出几张图（边界，避免一次性打太多请求）
MAX_COUNT = 5


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


def to_b64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()


def mime_of(path):
    return "image/png" if path.lower().endswith(".png") else "image/jpeg"


def generate(api_key, endpoint, prompt, images, aspect, size):
    """发一次请求，返回图片字节；失败抛 RuntimeError。"""
    parts = [{"text": prompt}]
    for path in images:
        parts.append({"inlineData": {"mimeType": mime_of(path), "data": to_b64(path)}})

    payload = json.dumps({
        "contents": [{"parts": parts}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": aspect, "imageSize": size},
        },
    }).encode()

    req = urllib.request.Request(
        endpoint, data=payload, method="POST",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=360) as r:
            resp = json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"请求失败 HTTP {e.code}：{e.read().decode(errors='replace')}")

    candidates = resp.get("candidates")
    if not candidates:
        raise RuntimeError(f"未返回候选内容（可能被内容安全策略拒绝）：{resp}")

    cand = candidates[0]
    # 内容审核拦截：finishReason 非 STOP，或只返回了文字说明
    if cand.get("finishReason") not in (None, "STOP"):
        text = next((p.get("text") for p in cand["content"]["parts"] if p.get("text")), "")
        raise RuntimeError(f"请求被拒绝（finishReason={cand.get('finishReason')}）：{text}")

    image_part = next((p for p in cand["content"]["parts"] if p.get("inlineData")), None)
    if not image_part:
        text = next((p.get("text") for p in cand["content"]["parts"] if p.get("text")), "")
        raise RuntimeError(f"未返回图片，模型回复：{text}")

    return base64.b64decode(image_part["inlineData"]["data"])


def resolve_paths(out, count):
    """决定输出路径列表。
    - 若 out 带目录成分（相对/绝对），按用户给定的路径处理（相对则相对当前工作目录）。
    - 若 out 是纯文件名，统一存到 <项目根>/nano-banana-output/ 下，确保好找。
    count>1 时给文件名加 -1 / -2 … 后缀。
    """
    if os.path.dirname(out):
        base_path = os.path.abspath(out)
    else:
        out_dir = os.path.join(project_root(), "nano-banana-output")
        os.makedirs(out_dir, exist_ok=True)
        base_path = os.path.join(out_dir, out)

    if count == 1:
        return [base_path]
    base, ext = os.path.splitext(base_path)
    return [f"{base}-{i}{ext}" for i in range(1, count + 1)]


def main():
    api_key = load_api_key()
    if not api_key:
        sys.exit("未找到 API Key：请在技能目录的 .env 写一行 APIYI_API_KEY=sk-xxx")

    model = os.environ.get("APIYI_IMAGE_MODEL", "gemini-3.1-flash-lite-image")
    endpoint = f"https://api.apiyi.com/v1beta/models/{model}:generateContent"

    parser = argparse.ArgumentParser(description="Nano Banana Lite 出图")
    parser.add_argument("prompt", help="提示词 / 编辑指令")
    parser.add_argument("-i", "--image", action="append", default=[],
                        help="输入图片路径（可重复，传入即为编辑模式）")
    parser.add_argument("-o", "--out", default="output.png", help="输出文件名")
    parser.add_argument("-n", "--count", type=int, default=1,
                        help=f"一次出几张，默认 1，最多 {MAX_COUNT}（并发生成）")
    parser.add_argument("--aspect", default="1:1", help="宽高比，14 选 1，如 16:9 / 1:4 / 8:1")
    parser.add_argument("--size", default="1K", help="分辨率仅支持 1K（Lite 专注 1K 画布）")
    args = parser.parse_args()

    count = args.count
    if count < 1:
        count = 1
    if count > MAX_COUNT:
        print(f"提示：一次最多 {MAX_COUNT} 张，已将 {args.count} 限制为 {MAX_COUNT}。", file=sys.stderr)
        count = MAX_COUNT

    paths = resolve_paths(args.out, count)

    def task(path):
        data = generate(api_key, endpoint, args.prompt, args.image, args.aspect, args.size)
        with open(path, "wb") as f:
            f.write(data)
        return os.path.abspath(path)

    failures = 0
    with ThreadPoolExecutor(max_workers=count) as pool:
        for path, result in zip(paths, pool.map(lambda p: _safe(task, p), paths)):
            ok, value = result
            if ok:
                print(f"图片已保存至 {value}")
            else:
                failures += 1
                print(f"第 {os.path.basename(path)} 张生成失败：{value}", file=sys.stderr)

    if failures == count:
        sys.exit("全部生成失败。")


def _safe(fn, arg):
    try:
        return True, fn(arg)
    except Exception as e:  # noqa: BLE001 — 单张失败不影响其它并发任务
        return False, str(e)


if __name__ == "__main__":
    main()
```

<Tip>
  模型名默认 `gemini-3.1-flash-lite-image`。Lite 专注 1K 画布，`--size` 保持 `1K` 即可；如需 2K/4K 或更强画质，换用 Nano Banana 2 / Pro 的技能（设环境变量 `APIYI_IMAGE_MODEL` 也可切换模型）。
</Tip>

## 为什么一句话就能出图

很多人好奇：我又没敲命令，怎么说句"画只猫"它就出图了？

原理是这样：Agent 启动时会**先读取每个技能 `SKILL.md` 里的 `description`**（一段很短的元数据，说明「这个技能做什么、什么时候该用」）。当你说出的需求**匹配上**这段描述的场景（比如"画/生成/渲染一张图""把这张图改成…"），Agent 就**自动决定调用这个技能**，去读完整的 `SKILL.md` 并运行脚本——整个过程你不用记任何命令。

所以：

* **写得好的 `description` = 更准的自动触发**。本技能的描述已覆盖"生成/绘制/编辑/合成图片"等说法。
* 不想靠 Agent 猜、想要**百分百可控**时，用下面的**显性调用**。

## 怎么用

### 自然语言（隐式触发）

装好后直接对 Agent 说话即可：

| 你说                                    | 技能行为                           |
| ------------------------------------- | ------------------------------ |
| "用 nano banana lite 画一张 16:9 的雪山日出海报" | 调脚本（无 `-i`），出 1 张 png          |
| "做一张 8:1 的超宽国风横幅"                     | 调脚本 `--aspect 8:1`，出 1 张超宽 png |
| "国风山水来 3 张不同的"                        | 调脚本 `-n 3`，并发出 3 张 png         |
| "把 photo.jpg 的背景虚化，突出人物"              | 调脚本 `-i photo.jpg`，出 1 张 png   |

### 显性调用（更可控）

不想让 Agent 自己判断时，两种显式方式：

* **支持斜杠命令的 Agent**（如 Claude Code）：

  ```text theme={null}
  /nano-banana-lite 一只在花园里打盹的橘猫，油画风格 --aspect 3:2
  ```

* **任意 Agent / 直接命令它跑脚本**（最通用）：

  ```text theme={null}
  运行 python3 nano-banana-lite/scripts/nano_banana_lite.py "一只在花园里打盹的橘猫，油画风格" --aspect 3:2
  ```

<Tip>
  **怎么控制比例**：用 `--aspect` 选宽高比（14 选 1，含 `1:4 / 4:1 / 1:8 / 8:1` 超长超宽）。Lite 专注 1K 画布，无需指定分辨率。直接说"竖屏 9:16""来个超宽横幅"，Agent 也会自动带上宽高比参数。
</Tip>

## 生成的图片在哪里

* 当 `-o` 只传**文件名**（如 `-o dog.png`）时，图片统一存到**项目根目录下的 `nano-banana-output/` 文件夹**（脚本自动创建），所以你在项目里的这个文件夹就能直接找到。
* 「项目根目录」= 脚本从自身位置向上找到的第一个含 `.git` 或 `.claude` 的目录——**不管 Agent 在哪个目录运行，图都落在项目里**，不会跑进临时目录害你找不到。
* 脚本会**为每张图打印一行完整绝对路径**，例如 `图片已保存至 /Users/you/project/nano-banana-output/dog.png`。
* 默认**只出 1 张**；`-n 3` 一次出 3 张（最多 5，超过自动截到 5），文件名自动加 `-1`、`-2`、`-3` 后缀。
* 传**带目录的路径**（如 `-o images/dog.png` 或绝对路径）时，按你给的路径存（相对路径相对当前工作目录），不进 `nano-banana-output/`。
* 图片编辑同理：输出是新文件，**不会覆盖你的原图**。

<Info>
  Nano Banana 2 Lite 有严格的内容安全管控。若脚本提示 `finishReason` 非 `STOP` 或返回的是拒绝说明文本，请按提示调整内容，不要对同一违规提示词反复重试。
</Info>

## 相关文档

* [Nano Banana Lite 图片生成总览](/api-capabilities/nano-banana-lite-image/overview)
* [文生图 API 参考](/api-capabilities/nano-banana-lite-image/text-to-image)
* [图片编辑 API 参考](/api-capabilities/nano-banana-lite-image/image-edit)
* [Nano Banana 2 Agent 技能](/api-capabilities/nano-banana-2-image/skills)
* [Nano Banana 定价说明](/api-capabilities/nano-banana-pricing)
