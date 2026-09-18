> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image-2.5 / 2 系列 Agent 技能

> 把 gpt-image-2.5-flare / gpt-image-2.5-sunburst / gpt-image-2（官轉）與 gpt-image-2.5-all / gpt-image-2-all / gpt-image-2-vip（官逆）封裝成一個開箱即用的 Agent Skill，丟進 Codex、OpenClaw、hermes-agent、Claude Code 等任意編碼 Agent，用 --model 一鍵切換六個模型完成文生圖、多圖融合與局部重繪。

<Note>
  本頁提供一個**開箱即用的 Agent 技能（Skill）**：一個指令碼同時覆蓋 **gpt-image-2.5-flare / gpt-image-2.5-sunburst / gpt-image-2（官轉）** 與 **gpt-image-2.5-all / gpt-image-2-all / gpt-image-2-vip（官逆）** 六個模型——它們都走同一套 OpenAI Images API，只是 `--model` 不同。把它放進你正在用的編碼 Agent，一句話即可出圖，整套東西就兩個檔案。
</Note>

## 這個技能能做什麼

一個合併技能，指令碼會根據**是否傳入圖片**自動判斷走「文生圖」還是「圖片編輯」：

<CardGroup cols={3}>
  <Card title="文生圖" icon="wand-sparkles">
    只給提示詞 → 生成全新圖片，文字渲染、寫實質感強。
  </Card>

  <Card title="多圖融合" icon="layers">
    傳入多張圖（最多 16 張）+ 一條指令 → 把圖1的人放進圖2的場景、保留圖3的風格等。
  </Card>

  <Card title="局部重繪" icon="image">
    傳入一張圖 + `--mask` 掩碼 + 指令 → 只改掩碼覆蓋的區域（**僅官轉三款支援**，推薦 `gpt-image-2.5-sunburst`）。
  </Card>
</CardGroup>

## 六個模型怎麼選

六個模型**呼叫方式完全一致**，區別只在通道來源、價格/速度和支援的引數。官轉三款（2.5-flare / 2.5-sunburst / 2）同價同參數，官逆三款同價同參數。指令碼已按 `--model` 自動處理這些差異：

| 模型（`--model`）                                            | 通道                  | 價格                | 速度                       | `size`         | `quality` / `mask`                                      | 適合                        |
| -------------------------------------------------------- | ------------------- | ----------------- | ------------------------ | -------------- | ------------------------------------------------------- | ------------------------- |
| `gpt-image-2.5-flare`（預設）                                | 官轉（官方直連）            | 按量 \~\$0.03–0.2/張 | **官轉最快**（1K low 實測約 10s） | ✅ 任意預設         | ✅ 支援，含 `xhigh` / `max`                                  | 日常文生圖預設、要畫質檔、要透明背景        |
| `gpt-image-2.5-sunburst`                                 | 官轉（官方直連）            | 按量，同 flare        | 比 flare 慢                | ✅ 任意預設         | ✅ 支援，含 `xhigh` / `max`                                  | 改圖 / 多圖融合 / 掩碼局部重繪，編輯精度最高 |
| `gpt-image-2`                                            | 官轉（官方直連）            | 按量，同 flare        | \~100–120s               | ✅ 任意預設         | ✅ 支援（到 `high`）                                          | 上一代，存量專案沿用                |
| `gpt-image-2.5-all`                                      | 官逆（ChatGPT 網頁版 2.5） | flat \$0.03/張     | 約 30–90s                 | ❌ 寫進 prompt    | ❌                                                       | 走量、要快、要 2.5 畫質，尺寸用提示詞描述即可 |
| `gpt-image-2-all`                                        | 官逆（ChatGPT 線）       | flat \$0.03/張     | **最快 \~30–60s**          | ❌ 寫進 prompt    | ❌                                                       | 走量、要快、尺寸用提示詞描述即可          |
| `gpt-image-2-vip`                                        | 官逆（Adobe 線）         | flat \$0.03/張     | \~90–150s                | ✅ 30 檔含 **4K** | ❌                                                       | 要鎖定輸出尺寸 / 4K，價格還想便宜       |
| `gpt-image-2.5-flare-vip` / `gpt-image-2.5-sunburst-vip` | 官逆（Adobe 線 2.5）     | flat \$0.03/張     | \~20–140s                | ✅ 30 檔含 **4K** | `quality` 六檔全開（含 `xhigh` / `max`）、透明背景 ✅；`mask` 只整圖重繪 ❌ | 便宜價拿到 2.5 畫質，尺寸可鎖         |

<Tip>
  簡單記：**日常文生圖** → `gpt-image-2.5-flare`；**改圖 / 掩碼局部重繪** → `gpt-image-2.5-sunburst`；**要快又便宜** → `gpt-image-2.5-all` / `gpt-image-2-all`；**要鎖尺寸/4K 又便宜** → `gpt-image-2-vip`。
</Tip>

## 能用在哪些 Agent

<Info>
  一個 Skill 本質上就是**一個資料夾**：一份寫給 Agent 看的說明（`SKILL.md`）+ 一個幹活的指令碼。所以**凡是能讀取本地檔案、執行命令列的編碼 Agent 都能用上**——比如 **Codex、OpenClaw、hermes-agent、Claude Code** 等。

  唯一要求：跑 Agent 的那臺機器（你的電腦或伺服器）裝了 **Python 3** 並且**能聯網**（指令碼要直連 `api.apiyi.com`）。僅此而已，不挑具體哪家 Agent。
</Info>

## 三步裝好

### ① 建目錄、貼檔案、裝依賴

新建一個技能資料夾，放入下面兩個檔案（完整內容見後兩節）。本技能用 OpenAI SDK 呼叫，需要先裝一個依賴：

```bash theme={null}
pip install openai
```

```
gpt-image-2/
├── SKILL.md
├── scripts/
│   └── gpt_image.py
└── .env          # 第②步建立，放你的 Key
```

### ② 同目錄寫 Key

在 `gpt-image-2/.env` 裡寫上你的 **API易 API Key**（在 `api.apiyi.com` 控制台建立）：

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

指令碼會自動從這個 `.env` 讀取 Key，**無需任何額外配置或環境變數**。

<Warning>
  `.env` 裡是你的金鑰。如果這個技能要隨專案倉庫共享，**務必把 `.env` 加進 `.gitignore`，不要提交到 git**。
</Warning>

### ③ 交給 Agent

* **支援技能自動發現的 Agent**（如 Claude Code）：把整個 `gpt-image-2/` 目錄放進它的技能目錄——個人級 `~/.claude/skills/`，或專案級 `.claude/skills/`（隨倉庫共享）。
* **其他 Agent**：按它各自的技能/外掛約定放置；或者最簡單——**直接讓 Agent「讀一下這個資料夾裡的 SKILL.md，並照著執行」** 即可。

裝好後就能用了，跳到 [怎麼用](#怎麼用) 看示例。

## SKILL.md

新建 `gpt-image-2/SKILL.md`，完整內容如下（`description` 寫清「做什麼 + 何時用」，Agent 會據此自動觸發）：

````markdown theme={null}
---
name: gpt-image-2
description: Generate or edit images via APIYI's gpt-image-2 (official) and gpt-image-2-all / gpt-image-2-vip (reverse) models. Use this when the user asks to create, draw, render, or generate an image/illustration/poster, or to edit, retouch, restyle, fuse, or inpaint existing images.
allowed-tools: Bash(python3 *)
---

# GPT-Image-2 系列出圖技能

通過 API易 平臺呼叫 GPT-Image 2.5 / 2 系列生成或編輯圖片。一個指令碼覆蓋六個模型，用 `--model` 切換：

- `gpt-image-2.5-flare`（預設，官轉）：速度優先，支援 `size` / `quality`（含 `xhigh` / `max`）/ `mask` 局部重繪，按量計費。
- `gpt-image-2.5-sunburst`（官轉）：編輯精度優先，引數同 flare，改圖 / 多圖融合首選。
- `gpt-image-2`（官轉）：上一代，引數同上（`quality` 只到 `high`）。
- `gpt-image-2.5-all`（官逆）：ChatGPT 網頁版 2.5 逆向，flat \$0.03/張，引數同 `-all`。
- `gpt-image-2.5-flare-vip` / `gpt-image-2.5-sunburst-vip`（官逆·Adobe 線 2.5）：flat \$0.03/張，可鎖 `size`，支援 `quality` 六檔（含 `xhigh` / `max`）與透明背景；`mask` 只整圖重繪。
- `gpt-image-2-all`（官逆·ChatGPT 線）：最快、flat \$0.03/張；**不支援 `size`/`quality`**，尺寸寫進提示詞。
- `gpt-image-2-vip`（官逆·Adobe 線）：可鎖 `size`（30 檔含 4K）、flat \$0.03/張；**不支援 `quality`/`mask`**。

## Key 配置

指令碼會自動讀取技能目錄下 `.env` 檔案裡的 `APIYI_API_KEY`（也支援同名環境變數）。
指令碼依賴 OpenAI SDK，若報缺包，提示使用者 `pip install openai`。

## 用法

第一個引數是提示詞；編輯/融合時用 `-i` 傳入一張或多張本地圖片：

```bash
# 文生圖（預設 gpt-image-2.5-flare 官轉，可帶畫質）
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "一隻戴墨鏡的橘貓坐在海邊吧檯，電影畫幅" -o cat.png --size 1536x1024 --quality high

# 最快、最省：用官逆 all（尺寸寫進提示詞，別傳 size）
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "扁平插畫風節日海報，豎版 2:3" -o poster.png --model gpt-image-2-all

# 要鎖 4K：用官逆 vip
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "城市夜景航拍" -o city.png --model gpt-image-2-vip --size 3840x2160

# 多圖融合（最多 16 張，重複 -i）
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "把圖1的人物放進圖2的場景，保留圖3的色彩風格" -i person.png -i scene.png -i style.png -o fused.png

# 局部重繪（掩碼，僅官轉三款；推薦 gpt-image-2.5-sunburst）
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "把蒙版區域換成一扇圓窗" -i room.png --mask mask.png -o edited.png

# 一次出多張（最多 5 張，併發）
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "節日海報草圖" -o draft.png -n 3 --model gpt-image-2-all
```

引數說明：

- 第 1 個位置引數：提示詞（必填）。
- `--model`：`gpt-image-2`（預設）/ `gpt-image-2-all` / `gpt-image-2-vip`。也可在 `.env` 寫 `APIYI_IMAGE_MODEL=...` 設預設。
- `-i / --image`：輸入圖片路徑，可重複（最多 16 張）；不傳 = 文生圖，傳 = 編輯/融合。
- `-o / --out`：輸出檔名，預設 `output.png`。
- `-n / --count`：一次出幾張，**預設 1**，最多 5（客戶端併發；指令碼一律不傳 `n`，避免官逆通道按張數超扣費）。
- `--size`：尺寸，預設 `auto`（`gpt-image-2-all` 會忽略，請把尺寸/比例寫進提示詞）。
- `--quality`：`low`/`medium`/`high`/`xhigh`/`max`/`auto`，**官轉三款與 2.5 兩款 -vip 生效**（`xhigh` / `max` 只有 2.5 系列接受；指令碼對 `-all` / `gpt-image-2-vip` 自動不傳）。
- `--format`：`png`/`jpeg`/`webp`，僅官轉生效。
- `--mask`：掩碼圖，僅官轉編輯生效（PNG 帶 alpha，對第一張圖）。
- `--background`：`transparent`/`opaque`/`auto`，僅官轉生效。傳 `transparent` 時 `--format` 必須是 `png` 或 `webp`。

## 選型與紅線（重要）

- **預設 `gpt-image-2.5-flare`（官轉）**：日常文生圖；改圖 / 掩碼局部重繪換 `gpt-image-2.5-sunburst`。
- 要**快/便宜** → `gpt-image-2-all`；要**鎖尺寸/4K** → `gpt-image-2-vip`。
- 官逆 `-all` / `gpt-image-2-vip` **不要傳 `quality`**（2.5 兩款 -vip 可傳）；**`gpt-image-2-all` 不要傳 `size`**（寫進提示詞）。指令碼已自動門控，但你直接調指令碼時也請遵守。
- **透明背景**僅官轉三款有 `background` 引數：加 `--background transparent` 即可出帶 alpha 通道的透明底圖（`--format` 需為 `png`/`webp`）。官逆 all/vip 沒有這個引數，只能在提示詞裡要求，偶現不穩定。

## 出圖張數與成本

- **預設只出 1 張**；使用者明確要多張才用 `-n`，一次不超過 5。
- 官逆 2.5-all/all/vip 是 flat \$0.03/張；官轉三款按量、`--quality high` 較貴（1K 檔約 \$0.05～0.21/張，`xhigh` / `max` 更貴），預算敏感就降 `medium`/`low` 或改用官逆。

## 輸出位置（重要）

- `-o` 傳**純檔名**時存到**專案根目錄下的 `gpt-image-output/`**；傳**帶目錄路徑**時按給定路徑存。
- 不要把圖片寫到 `/tmp`、scratchpad 等臨時目錄，使用者會找不到。

## 完成後

指令碼會為每張圖列印一行完整路徑，如實回報給使用者。若被內容稽核拒絕，把原因如實轉達，不要重試同一提示詞。
````

<Tip>
  `name` 必須是小寫字母 + 連字元。在支援斜槓命令的 Agent 裡，目錄名就是命令名——叫 `gpt-image-2` 即 `/gpt-image-2`。`${CLAUDE_SKILL_DIR}` 是 Claude Code 提供的技能目錄變數；其他 Agent 直接用指令碼的實際路徑即可。
</Tip>

## scripts/gpt\_image.py

新建 `gpt-image-2/scripts/gpt_image.py`，使用 OpenAI SDK 指向 API易（`base_url="https://api.apiyi.com/v1"`）：

```python theme={null}
#!/usr/bin/env python3
"""通過 API易 呼叫 GPT-Image 2.5 / 2 系列（gpt-image-2.5-flare / gpt-image-2.5-sunburst / gpt-image-2 官轉，gpt-image-2.5-all / gpt-image-2-all / gpt-image-2-vip 官逆）生成 / 編輯圖片。
都走 OpenAI Images API（/v1/images/generations + /v1/images/edits），用 --model 切換。需要：pip install openai"""
import argparse
import base64
import os
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor

from openai import OpenAI

# 一次呼叫最多併發出幾張圖（服務端 n 只出 1 張，這裡用客戶端併發模擬多張）
MAX_COUNT = 5

# 各模型能力門控：是否接受這些引數（不接受的一律不傳，避免報錯或超扣費）
MODEL_CAPS = {
    "gpt-image-2.5-flare":    {"size": True,  "quality": True,  "output_format": True,  "mask": True,  "background": True},   # 官轉·速度優先
    "gpt-image-2.5-sunburst": {"size": True,  "quality": True,  "output_format": True,  "mask": True,  "background": True},   # 官轉·編輯優先
    "gpt-image-2":     {"size": True,  "quality": True,  "output_format": True,  "mask": True,  "background": True},   # 官轉·上一代
    "gpt-image-2.5-all": {"size": False, "quality": False, "output_format": False, "mask": False, "background": False},  # 官逆·ChatGPT 2.5
    "gpt-image-2-all": {"size": False, "quality": False, "output_format": False, "mask": False, "background": False},  # 官逆·ChatGPT
    "gpt-image-2-vip": {"size": True,  "quality": False, "output_format": False, "mask": False, "background": False},  # 官逆·Adobe
    "gpt-image-2.5-flare-vip":    {"size": True,  "quality": True,  "output_format": False, "mask": False, "background": True},   # 官逆·Adobe 2.5（quality 六檔全開；mask 不做局部重繪）
    "gpt-image-2.5-sunburst-vip": {"size": True,  "quality": True,  "output_format": False, "mask": False, "background": True},   # 官逆·Adobe 2.5
    "gpt-image-2.5-vip":          {"size": True,  "quality": True,  "output_format": False, "mask": False, "background": True},   # = sunburst-vip 別名
}


def caps_of(model):
    # 未知模型回落到官轉能力集
    return MODEL_CAPS.get(model, MODEL_CAPS["gpt-image-2.5-flare"])


def load_api_key():
    """優先讀環境變數；否則在指令碼所在目錄及其父目錄找 .env。"""
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
    """從指令碼位置向上找包含 .git 或 .claude 的目錄，作為專案根目錄；找不到則用當前工作目錄。"""
    d = os.path.dirname(os.path.abspath(__file__))
    while True:
        if os.path.isdir(os.path.join(d, ".git")) or os.path.isdir(os.path.join(d, ".claude")):
            return d
        parent = os.path.dirname(d)
        if parent == d:
            return os.getcwd()
        d = parent


def resolve_paths(out, count):
    """決定輸出路徑列表。純檔名 → 存到 <專案根>/gpt-image-output/；帶目錄則按給定路徑。"""
    if os.path.dirname(out):
        base_path = os.path.abspath(out)
    else:
        out_dir = os.path.join(project_root(), "gpt-image-output")
        os.makedirs(out_dir, exist_ok=True)
        base_path = os.path.join(out_dir, out)

    if count == 1:
        return [base_path]
    base, ext = os.path.splitext(base_path)
    return [f"{base}-{i}{ext}" for i in range(1, count + 1)]


def decode_image(item):
    """統一取圖位元組：b64_json 可能是純 base64 或帶 data:image 字首的 data URL（官逆模型）；也可能只給 url。"""
    raw = getattr(item, "b64_json", None)
    if raw:
        if raw.startswith("data:"):
            raw = raw.split(",", 1)[1]  # 剝掉 data:image/png;base64, 字首
        return base64.b64decode(raw)
    url = getattr(item, "url", None)
    if url:
        with urllib.request.urlopen(url, timeout=360) as r:
            return r.read()
    raise RuntimeError("響應裡既沒有 b64_json 也沒有 url")


def one_image(client, model, args):
    """發一次請求，返回圖片位元組；失敗拋異常（由 _safe 兜住）。一律不傳 n（預設 1 張，多張靠客戶端併發）。"""
    cap = caps_of(model)
    if args.image:
        # 編輯 / 多圖融合：每次重新 open 檔案，避免執行緒間共享控制代碼
        files = [open(p, "rb") for p in args.image]
        try:
            kwargs = dict(model=model, image=files if len(files) > 1 else files[0], prompt=args.prompt)
            if cap["size"] and args.size:
                kwargs["size"] = args.size
            if cap["quality"] and args.quality:
                kwargs["quality"] = args.quality
            if cap["output_format"] and args.format:
                kwargs["output_format"] = args.format
            if cap["background"] and args.background and args.background != "auto":
                kwargs["background"] = args.background
            if cap["mask"] and args.mask:
                kwargs["mask"] = open(args.mask, "rb")
            resp = client.images.edit(**kwargs)
        finally:
            for fh in files:
                fh.close()
    else:
        # 文生圖
        kwargs = dict(model=model, prompt=args.prompt)
        if cap["size"] and args.size:
            kwargs["size"] = args.size
        if cap["quality"] and args.quality:
            kwargs["quality"] = args.quality
        if cap["output_format"] and args.format:
            kwargs["output_format"] = args.format
        if cap["background"] and args.background and args.background != "auto":
            kwargs["background"] = args.background
        resp = client.images.generate(**kwargs)
    return decode_image(resp.data[0])


def main():
    api_key = load_api_key()
    if not api_key:
        sys.exit("未找到 API Key：請在技能目錄的 .env 寫一行 APIYI_API_KEY=sk-xxx")

    default_model = os.environ.get("APIYI_IMAGE_MODEL", "gpt-image-2.5-flare")
    # 同步阻塞呼叫，圖片生成慢，超時給足 360s
    client = OpenAI(api_key=api_key, base_url="https://api.apiyi.com/v1", timeout=360)

    parser = argparse.ArgumentParser(description="GPT-Image 2.5 / 2 系列出圖")
    parser.add_argument("prompt", help="提示詞 / 編輯指令")
    parser.add_argument("--model", default=default_model,
                        help="gpt-image-2.5-flare(官轉·預設) / gpt-image-2.5-sunburst(官轉·編輯) / gpt-image-2(官轉·上一代) / gpt-image-2.5-all / gpt-image-2-all(官逆·最快) / gpt-image-2-vip(官逆·可鎖尺寸) / gpt-image-2.5-flare-vip / gpt-image-2.5-sunburst-vip(官逆·2.5·可鎖尺寸+quality)")
    parser.add_argument("-i", "--image", action="append", default=[],
                        help="輸入圖片路徑（可重複，最多 16 張；傳入即為編輯/融合模式）")
    parser.add_argument("-o", "--out", default="output.png", help="輸出檔名")
    parser.add_argument("-n", "--count", type=int, default=1,
                        help=f"一次出幾張，預設 1，最多 {MAX_COUNT}（客戶端併發）")
    parser.add_argument("--size", default="auto",
                        help="尺寸，如 1024x1024 / 2048x1152 / auto（gpt-image-2-all 不支援，寫進 prompt）")
    parser.add_argument("--quality", default="high",
                        help="畫質 low / medium / high / xhigh / max / auto（僅官轉生效；xhigh/max 僅 2.5）")
    parser.add_argument("--format", default="png", help="輸出格式 png / jpeg / webp（僅官轉生效）")
    parser.add_argument("--mask", help="掩碼圖（僅官轉編輯，PNG 帶 alpha，對第一張圖生效）")
    parser.add_argument("--background", default="auto", choices=["transparent", "opaque", "auto"],
                        help="背景，transparent 出透明底（僅官轉生效，需配 --format png/webp）")
    args = parser.parse_args()

    # jpeg 沒有 alpha 通道，與透明背景互斥，先在本地攔掉，別把 400 甩給使用者
    if args.background == "transparent" and args.format == "jpeg":
        sys.exit("--background transparent 不能配 --format jpeg（jpeg 無 alpha 通道），請改用 png 或 webp")

    count = args.count
    if count < 1:
        count = 1
    if count > MAX_COUNT:
        print(f"提示：一次最多 {MAX_COUNT} 張，已將 {args.count} 限制為 {MAX_COUNT}。", file=sys.stderr)
        count = MAX_COUNT

    paths = resolve_paths(args.out, count)

    def task(path):
        data = one_image(client, args.model, args)
        with open(path, "wb") as f:
            f.write(data)
        return os.path.abspath(path)

    failures = 0
    with ThreadPoolExecutor(max_workers=count) as pool:
        for path, result in zip(paths, pool.map(lambda p: _safe(task, p), paths)):
            ok, value = result
            if ok:
                print(f"圖片已儲存至 {value}")
            else:
                failures += 1
                print(f"第 {os.path.basename(path)} 張生成失敗：{value}", file=sys.stderr)

    if failures == count:
        sys.exit("全部生成失敗。")


def _safe(fn, arg):
    try:
        return True, fn(arg)
    except Exception as e:  # noqa: BLE001 — 單張失敗不影響其它併發任務
        return False, str(e)


if __name__ == "__main__":
    main()
```

## 怎麼切換模型

切換模型**只需改 `--model`**，六個值任選：

```text theme={null}
... gpt_image.py "提示詞"                              # 預設 gpt-image-2.5-flare（官轉·速度優先）
... gpt_image.py "改成水彩" -i in.png --model gpt-image-2.5-sunburst   # 官轉·編輯精度優先
... gpt_image.py "提示詞" --model gpt-image-2            # 官轉·上一代
... gpt_image.py "提示詞" --model gpt-image-2.5-all      # 官逆·ChatGPT 網頁版 2.5
... gpt_image.py "提示詞" --model gpt-image-2-all      # 官逆·最快·最省
... gpt_image.py "提示詞" --model gpt-image-2-vip --size 3840x2160   # 官逆·鎖 4K
```

想改預設通道（不每次都加 `--model`），在 `gpt-image-2/.env` 里加一行：

```bash theme={null}
APIYI_IMAGE_MODEL=gpt-image-2-all
```

<Info>
  指令碼已**自動相容** base64 與 url 兩種返回（官逆模型的 `b64_json` 帶 `data:image;base64,` 字首，指令碼會自動剝除）。只有當你**強依賴 URL 輸出**時，才需要在 API易 控制台把令牌「分組」切到 `image2_OSS`——普通出圖無需關心。
</Info>

## 為什麼一句話就能出圖

很多人好奇：我又沒敲命令，怎麼說句"畫只貓"它就出圖了？

原理是這樣：Agent 啟動時會**先讀取每個技能 `SKILL.md` 裡的 `description`**（一段很短的後設資料，說明「這個技能做什麼、什麼時候該用」）。當你說出的需求**匹配上**這段描述的場景（比如"畫/生成/渲染一張圖""把這幾張圖融合一下"），Agent 就**自動決定呼叫這個技能**，去讀完整的 `SKILL.md` 並執行指令碼——整個過程你不用記任何命令。

不想靠 Agent 猜、想要**百分百可控**時，用下面的**顯性呼叫**。

## 怎麼用

### 自然語言（隱式觸發）

裝好後直接對 Agent 說話即可：

| 你說                            | 技能行為                                                |
| ----------------------------- | --------------------------------------------------- |
| "畫一張電影畫幅的貓"                   | 預設 gpt-image-2.5-flare，出 1 張 png                    |
| "快點、便宜點出張海報"                  | Agent 會帶 `--model gpt-image-2-all`                  |
| "出一張 4K 的城市夜景"                | Agent 會帶 `--model gpt-image-2-vip --size 3840x2160` |
| "把 person.png 的人放進 scene.png" | 調 `-i person.png -i scene.png`，融合出圖                 |

### 顯性呼叫（更可控）

* **支援斜槓命令的 Agent**（如 Claude Code）：

  ```text theme={null}
  /gpt-image-2 賽博朋克城市雨夜，霓虹招牌特寫 --model gpt-image-2-vip --size 2048x1152
  ```

* **任意 Agent / 直接命令它跑指令碼**（最通用）：

  ```text theme={null}
  執行 python3 gpt-image-2/scripts/gpt_image.py "賽博朋克城市雨夜，霓虹招牌特寫" --model gpt-image-2-all
  ```

## 生成的圖片在哪裡

* 當 `-o` 只傳**檔名**（如 `-o cat.png`）時，圖片統一存到**專案根目錄下的 `gpt-image-output/` 資料夾**（指令碼自動建立），所以你在專案裡的這個資料夾就能直接找到。
* 「專案根目錄」= 指令碼從自身位置向上找到的第一個含 `.git` 或 `.claude` 的目錄——**不管 Agent 在哪個目錄執行，圖都落在專案裡**，不會跑進臨時目錄害你找不到。
* 指令碼會**為每張圖列印一行完整絕對路徑**，例如 `圖片已儲存至 /Users/you/project/gpt-image-output/cat.png`。
* 預設**只出 1 張**；`-n 3` 一次出 3 張（最多 5），檔名自動加 `-1`、`-2`、`-3` 字尾。
* 傳**帶目錄的路徑**（如 `-o images/cat.png` 或絕對路徑）時，按你給的路徑存，不進 `gpt-image-output/`。
* 編輯 / 融合同理：輸出是新檔案，**不會覆蓋你的原圖**。

## 相關文件

* [GPT-Image-2-All Agent 技能](/zh-Hant/api-capabilities/gpt-image-2-all/skills)（官逆·最快）
* [GPT-Image-2-VIP Agent 技能](/zh-Hant/api-capabilities/gpt-image-2-vip/skills)（官逆·鎖 4K）
* [GPT-Image-2 圖片生成總覽](/zh-Hant/api-capabilities/gpt-image-2/overview)
* [Nano Banana Pro Agent 技能](/zh-Hant/api-capabilities/nano-banana-image/skills)
