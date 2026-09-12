> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.0 影片 Agent 技能

> 把 Seedance 2.5 與 2.0 四個模型（sd25 / mini / fast / 標準版）封裝成一個開箱即用的 Agent Skill，丟進 Codex、OpenClaw、Claude Code 等任意編碼 Agent，一句話完成文生影片、圖生影片與參考圖生影片，指令碼自動輪詢非同步任務並把成片下載到本地。

<Note>
  本頁提供一個**開箱即用的 Agent 技能（Skill）**：一個零依賴指令碼覆蓋 Seedance 全部四個模型（`sd25` / `mini` / `fast` / 標準版），用 `--model` 一鍵切換。把它放進你正在用的編碼 Agent，一句話即可出影片——整套東西就兩個檔案。這也是本站**第一個影片模型技能**：與圖片不同，影片是非同步任務，指令碼已把「提交 → 輪詢 → 下載成片」整個流程封裝好。
</Note>

## 這個技能能做什麼

一個合併技能，指令碼根據**傳入的圖片及其角色**自動判斷生成模式：

<CardGroup cols={3}>
  <Card title="文生影片" icon="clapperboard">
    只給提示詞 → 生成全新影片，預設自帶同步音訊（對白、音效、環境音）。
  </Card>

  <Card title="圖生影片" icon="image-play">
    傳入首幀圖讓靜態圖動起來；再加一張尾幀圖即可做首尾幀平滑過渡。
  </Card>

  <Card title="參考圖生影片" icon="layers">
    傳入最多 9 張參考圖 → 以參考圖的角色、物品或風格生成新畫面。
  </Card>
</CardGroup>

## 四個模型怎麼選

四個模型**呼叫方式完全一致**，區別在解析度上限、時長上限、參考素材上限、速度和價格。指令碼已按 `--model` 自動處理差異：

| 模型（`--model`） | 模型 ID                             | 解析度上限     | 速度（720p/5s 實測）   | 所屬分組                                     | 720p/5s 名義價                   | 適合                                              |
| ------------- | --------------------------------- | --------- | ---------------- | ---------------------------------------- | ----------------------------- | ----------------------------------------------- |
| `mini`（預設）    | `doubao-seedance-2-0-mini-260615` | 720p      | **最快 \~87–170s** | `SeeDance2` 0.18x<br />或 `SD2Mini` 0.10x | \$0.4508<br />特價 **\$0.2504** | Agent 高頻出片、走量、快速預覽                              |
| `fast`        | `doubao-seedance-2-0-fast-260128` | 720p      | \~100–290s       | `SeeDance2` 0.18x<br />或 `SD2Fast` 0.15x | \$0.7253<br />特價 **\$0.6044** | 品質與成本折中                                         |
| `std`         | `doubao-seedance-2-0-260128`      | **1080p** | \~100–290s       | `SeeDance2` 0.18x                        | \$0.9074                      | 要 1080p、最高品質                                    |
| `sd25`        | `doubao-seedance-2-5-260628`      | **1080p** | \~150s           | `SeeDance2` 0.18x                        | **\$1.3721**                  | **最長 30 秒、最多 30 張參考圖、mov 輸出**；約為 `std` 的 1.5 倍價 |

<Tip>
  簡單記：**日常與 Agent 場景就用預設 `mini`**；**要 1080p 或最高品質** → `--model std`；**要 30 秒長片、30 張參考圖或 mov 輸出** → 只能 `--model sd25`（約為 `std` 的 1.5 倍價，分組與 2.0 系相同）。同檔位全比例同價，時長按秒線性計費，幀率固定 24fps。特價分組 `SD2Mini` / `SD2Fast` 截至 **2026 年 9 月 7 日 23:59 (UTC+8)**，到期分組不下線、倍率恢復 0.18x，詳見 [概覽頁的分組說明](/zh-Hant/api-capabilities/seedance2/overview)。
</Tip>

## 能用在哪些 Agent

<Info>
  一個 Skill 本質上就是**一個資料夾**：一份寫給 Agent 看的說明（`SKILL.md`）+ 一個幹活的指令碼。所以**凡是能讀取本地檔案、執行命令列的編碼 Agent 都能用上**——比如 **Codex、OpenClaw、hermes-agent、Claude Code** 等。

  唯一要求：跑 Agent 的那臺機器（你的電腦或伺服器）裝了 **Python 3** 並且**能聯網**（指令碼要直連 `api.apiyi.com`）。指令碼只用 Python 標準庫，**無需 `pip install` 任何東西**。
</Info>

## 三步裝好

### ① 建目錄、貼檔案

新建一個技能資料夾，放入下面兩個檔案（完整內容見後兩節）：

```
seedance2/
├── SKILL.md
├── scripts/
│   └── seedance_video.py
└── .env          # 第②步建立，放你的 Key
```

### ② 同目錄寫 Key

在 `seedance2/.env` 裡寫上你的 **API易 API Key**（在 `api.apiyi.com` 控制台建立，計費模式選按量，**令牌須勾選 `SeeDance2` 分組**，四個模型通用（`mini` / `fast` 另有特價的 `SD2Mini` / `SD2Fast`））：

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

指令碼會自動從這個 `.env` 讀取 Key，**無需任何額外配置或環境變數**。

<Warning>
  `.env` 裡是你的金鑰。如果這個技能要隨專案倉庫共享，**務必把 `.env` 加進 `.gitignore`，不要提交到 git**。
</Warning>

### ③ 交給 Agent

* **支援技能自動發現的 Agent**（如 Claude Code）：把整個 `seedance2/` 目錄放進它的技能目錄——個人級 `~/.claude/skills/`，或專案級 `.claude/skills/`（隨倉庫共享）。
* **其他 Agent**：按它各自的技能/外掛約定放置；或者最簡單——**直接讓 Agent「讀一下這個資料夾裡的 SKILL.md，並照著執行」** 即可。

裝好後就能用了，跳到 [怎麼用](#怎麼用) 看示例。

## SKILL.md

新建 `seedance2/SKILL.md`，完整內容如下（`description` 寫清「做什麼 + 何時用」，Agent 會據此自動觸發）：

````markdown theme={null}
---
name: seedance2
description: Generate videos via APIYI's Seedance 2.5 and 2.0 (doubao-seedance-2-5 / doubao-seedance-2-0 series) models — text-to-video, image-to-video (first/last frame), and reference-image-to-video, with synced audio by default. Use this when the user asks to create, generate, or animate a video clip.
allowed-tools: Bash(python3 *)
---

# Seedance 出影片技能

通過 API易 平臺呼叫 Seedance 2.5（`doubao-seedance-2-5-260628`）與 2.0（`doubao-seedance-2-0` 系列）生成影片。預設用最快最便宜的 mini 版，出片自帶同步音訊。

## Key 配置

指令碼會自動讀取技能目錄下 `.env` 檔案裡的 `APIYI_API_KEY`（也支援同名環境變數）。
若指令碼報「未找到 Key」，提示使用者在 `.env` 裡寫一行 `APIYI_API_KEY=sk-xxx`，
且該令牌須勾選 `SeeDance2` 分組、計費模式為按量 —— **四個模型都在這個分組裡**，
`mini` 與 `fast` 另有特價的 `SD2Mini` / `SD2Fast`。

## 用法（重要：出片要 2-5 分鐘）

影片是**非同步任務**：指令碼內部會提交任務並輪詢到完成，單次呼叫總耗時通常 2-5 分鐘。
**執行時必須給 Bash 設長超時（600 秒以上）或放到後臺跑**，不要用預設 2 分鐘超時，否則會在出片前被掐斷。

```bash
# 文生影片（預設 mini / 720p / 5 秒 / 帶音訊）
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "一隻橘貓在草地上追蝴蝶，鏡頭緩慢跟隨，自然光" -o cat.mp4

# 圖生影片（首幀圖，讓靜態圖動起來）
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "鏡頭緩緩推近，光影流動" -i photo.jpg -o animated.mp4

# 首尾幀過渡
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "畫面從第一幀平滑過渡到最後一幀" -i first.png --last-frame last.png -o morph.mp4

# 參考圖生影片（以參考圖的角色/風格出新畫面，最多 9 張）
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "參考圖中的角色在雪地裡奔跑" --ref-image role.png -o run.mp4

# 高畫質：標準版 + 1080p + 10 秒
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "無人機航拍秋天山谷，電影感" --model std --resolution 1080p --duration 10 -o valley.mp4

# Seedance 2.5：最長 30 秒長片（價格是 5 秒的 6 倍，動手前先跟使用者確認）
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "無人機飛越秋天山谷，一鏡到底" --model sd25 --duration 30 -o long.mp4

# Seedance 2.5：mov 輸出，給後期調色用
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "海浪拍打礁石，慢鏡頭" --model sd25 --output-format mov -o waves.mov
```

引數說明：

- 第 1 個位置引數：提示詞（必填）。寫清畫面 + 運鏡 + 氛圍效果最好。
- `--model`：`mini`（預設，最快最便宜）/ `fast`（極速版）/ `std`（標準版）/ `sd25`（**Seedance 2.5**，最長 30 秒、最多 30 張參考圖、支援 1080p 與 mov，約為 std 的 1.5 倍價，分組與 2.0 系相同）。
- `--resolution`：`480p` / `720p`（預設）/ `1080p`（僅 `sd25` 與 `std`）。四個模型都不支援 4k。
- `--ratio`：`adaptive`（預設）/ `16:9` / `4:3` / `1:1` / `3:4` / `9:16` / `21:9`，同檔位全比例同價。
- `--duration`：整數秒，`sd25` 支援 4-30、2.0 系支援 4-15，預設 5；`-1` 讓模型智慧決定時長。時長越長越貴。
- `--no-audio`：關閉同步音訊（預設帶聲音）。
- `-i / --image`：首幀圖（本地路徑 / URL / `asset://` 素材 ID），傳入即圖生影片；`--last-frame` 搭配做首尾幀。
- `--ref-image`：參考圖，可重複；`sd25` 最多 30 張，2.0 系最多 9 張，與 `-i` 互斥。
- `--output-format`：`mp4`（預設）/ `mov`，**僅 `sd25` 支援**。mov 色彩還原更好，但部分播放器不相容，做網頁/移動端分發別用。
- `-o / --out`：輸出檔名，預設 `output.mp4`。

## 出片條數與成本（重要）

- **一次呼叫只出 1 條影片**，沒有批次引數。使用者要多條時序列多次呼叫，並在動手前提醒成本。
- 影片按 token 計費、比圖片貴得多（720p/5s 一條名義約 \$0.45-0.91，時長和解析度越高越貴）。
  使用者沒有明確要求時，**保持預設 mini / 720p / 5s**，不要擅自加時長、升解析度或換模型。
- **`sd25` 的 30 秒長片約 \$8.18 一條、1080p/5s 約 \$3.09 一條**，比預設檔貴一個量級，動手前必須先跟使用者確認。

## 輸出位置（重要）

- `-o` 傳**純檔名**（如 `cat.mp4`）時，影片統一儲存到**專案根目錄下的 `seedance-output/` 資料夾**。
- `-o` 傳**帶目錄的路徑**時按給定路徑儲存（相對路徑相對當前工作目錄）。
- 不要把影片寫到 `/tmp`、scratchpad 等臨時目錄，使用者會找不到。
- 服務端返回的影片直鏈 24 小時過期，指令碼已自動下載到本地，本地檔案才是交付物。

## 完成後

指令碼會列印儲存路徑、檔案大小、耗時和計費 tokens，把路徑如實回報給使用者。
若指令碼報生成失敗（含內容稽核拒絕），把錯誤原文如實轉達，不要重試同一提示詞。
若報「該模型無可用渠道」，提示使用者檢查令牌分組：四個模型都在 `SeeDance2`，`mini` / `fast` 也可走 `SD2Mini` / `SD2Fast`。
````

<Tip>
  `name` 必須是小寫字母 + 連字元。在支援斜槓命令的 Agent 裡，目錄名就是命令名——叫 `seedance2` 即 `/seedance2`。`${CLAUDE_SKILL_DIR}` 是 Claude Code 提供的技能目錄變數；其他 Agent 直接用指令碼的實際路徑即可。
</Tip>

## scripts/seedance\_video.py

新建 `seedance2/scripts/seedance_video.py`，純 Python 標準庫實現，與本站 [影片生成 API 參考](/zh-Hant/api-capabilities/seedance2/video-generation) 的請求程式碼一致、已實測可跑：

```python theme={null}
#!/usr/bin/env python3
"""通過 API易 呼叫 Seedance 2.5 / 2.0 生成影片（文生 / 圖生 / 參考圖生影片）。純標準庫，零依賴。"""
import argparse
import base64
import json
import os
import shutil
import sys
import time
import urllib.error
import urllib.request

# 輸出重定向到檔案/管道時也逐行落盤，方便 Agent 後臺跟蹤進度
sys.stdout.reconfigure(line_buffering=True)

TASKS_URL = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks"

# 短名 → 完整模型 ID
MODELS = {
    "sd25": "doubao-seedance-2-5-260628",
    "mini": "doubao-seedance-2-0-mini-260615",
    "fast": "doubao-seedance-2-0-fast-260128",
    "std": "doubao-seedance-2-0-260128",
}
# 各型號解析度上限（mini/fast 傳 1080p 上游會 400，客戶端直接攔下省一次請求）
MODEL_CAPS = {
    "sd25": ("480p", "720p", "1080p"),
    "mini": ("480p", "720p"),
    "fast": ("480p", "720p"),
    "std": ("480p", "720p", "1080p"),
}
# 時長上限：2.5 是 30 秒，2.0 系是 15 秒
MAX_DURATION = {"sd25": 30, "mini": 15, "fast": 15, "std": 15}
# 參考圖上限：2.5 是 30 張，2.0 系是 9 張
MAX_REF_IMAGES_BY_MODEL = {"sd25": 30, "mini": 9, "fast": 9, "std": 9}
RATIOS = ("adaptive", "16:9", "4:3", "1:1", "3:4", "9:16", "21:9")
MAX_REF_IMAGES = 30

# 出片是非同步任務：提交後先等一段再查，720p/5s 實測約 90-170 秒
POLL_FIRST_DELAY = 25
POLL_INTERVAL = 15
POLL_TIMEOUT = 15 * 60


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


def resolve_path(out):
    """純檔名 → 存到 <專案根>/seedance-output/ 下，確保好找；帶目錄成分則按給定路徑。"""
    if os.path.dirname(out):
        return os.path.abspath(out)
    out_dir = os.path.join(project_root(), "seedance-output")
    os.makedirs(out_dir, exist_ok=True)
    return os.path.join(out_dir, out)


def image_source(src):
    """圖片入參：URL / asset:// / data: 原樣透傳，本地檔案轉 base64 data URI。"""
    if src.startswith(("http://", "https://", "asset://", "data:")):
        return src
    if not os.path.exists(src):
        sys.exit(f"圖片檔案不存在：{src}")
    ext = src.lower().rsplit(".", 1)[-1]
    mime = {"png": "image/png", "webp": "image/webp"}.get(ext, "image/jpeg")
    with open(src, "rb") as f:
        return f"data:{mime};base64,{base64.b64encode(f.read()).decode()}"


def api_request(url, api_key, body=None):
    """閘道會標 content-encoding: gzip 但實際未壓縮，必須 Accept-Encoding: identity。"""
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
        raise RuntimeError(f"請求失敗 HTTP {e.code}：{e.read().decode(errors='replace')[:800]}")


def download(url, path):
    """下載結果影片：簽名直鏈，不要帶 Authorization 頭。"""
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
        sys.exit("未找到 API Key：請在技能目錄的 .env 寫一行 APIYI_API_KEY=sk-xxx"
                 "（令牌須勾 SeeDance2 分組；mini / fast 也可走 SD2Mini / SD2Fast）")

    parser = argparse.ArgumentParser(description="Seedance 2.5 / 2.0 出影片")
    parser.add_argument("prompt", help="提示詞（畫面 + 運鏡 + 氛圍）")
    parser.add_argument("--model", default="mini", choices=sorted(MODELS),
                        help="mini=最快最便宜（預設）/ fast=極速版 / std=標準版 / "
                             "sd25=Seedance 2.5（最長 30 秒、最多 30 張參考圖、支援 1080p 與 mov）")
    parser.add_argument("--resolution", default="720p", choices=("480p", "720p", "1080p"),
                        help="解析度，預設 720p")
    parser.add_argument("--ratio", default="adaptive", choices=RATIOS,
                        help="寬高比，預設 adaptive（同檔位全比例同價）")
    parser.add_argument("--duration", type=int, default=5,
                        help="時長整數秒（2.5 為 4-30，2.0 係為 4-15），或 -1 讓模型智慧決定，預設 5")
    parser.add_argument("--output-format", default=None, choices=("mp4", "mov"),
                        help="輸出格式，僅 sd25 支援；mov 色彩還原更好但部分播放器不相容")
    parser.add_argument("--no-audio", action="store_true",
                        help="關閉同步音訊（預設帶聲音）")
    parser.add_argument("--seed", type=int, default=None, help="隨機種子，復現用")
    parser.add_argument("-i", "--image", help="首幀圖（本地路徑 / URL / asset://），傳入即圖生影片")
    parser.add_argument("--last-frame", help="尾幀圖，與 -i 搭配做首尾幀過渡")
    parser.add_argument("--ref-image", action="append", default=[],
                        help=f"參考圖（可重複；2.5 最多 {MAX_REF_IMAGES} 張，2.0 系最多 9 張），與 -i 互斥")
    parser.add_argument("-o", "--out", default="output.mp4", help="輸出檔名")
    args = parser.parse_args()

    if args.image and args.ref_image:
        sys.exit("首幀模式（-i）與參考圖模式（--ref-image）互斥，一次只能用一種。")
    if args.last_frame and not args.image:
        sys.exit("--last-frame 必須與 -i（首幀圖）搭配使用。")
    max_refs = MAX_REF_IMAGES_BY_MODEL[args.model]
    if len(args.ref_image) > max_refs:
        sys.exit(f"{args.model} 的參考圖最多 {max_refs} 張"
                 f"{'（30 張請用 --model sd25）' if max_refs == 9 else ''}。")
    max_dur = MAX_DURATION[args.model]
    if args.duration != -1 and not 4 <= args.duration <= max_dur:
        sys.exit(f"{args.model} 的時長只支援 4-{max_dur} 整數秒，或 -1 智慧時長"
                 f"{'（30 秒請用 --model sd25）' if max_dur == 15 else ''}。")
    if args.resolution not in MODEL_CAPS[args.model]:
        sys.exit(f"{args.model} 最高支援 {MODEL_CAPS[args.model][-1]}，"
                 f"1080p 請用 --model sd25 或 --model std。")
    # 2.5 的首幀 / 首尾幀任務強制 ratio=adaptive，客戶端先攔下省一次往返
    if args.model == "sd25" and args.image and args.ratio != "adaptive":
        sys.exit("Seedance 2.5 的首幀 / 首尾幀生影片必須用 --ratio adaptive（上游硬約束）。")
    if args.output_format and args.model != "sd25":
        sys.exit("--output-format 僅 Seedance 2.5（--model sd25）支援。")

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
        sys.exit(f"提交失敗：{e}")
    task_id = task.get("id")
    if not task_id:
        sys.exit(f"提交失敗，響應：{json.dumps(task, ensure_ascii=False)[:500]}")
    print(f"任務已提交 task_id={task_id}，出片通常需要 2-5 分鐘，開始輪詢…")

    t0 = time.time()
    time.sleep(POLL_FIRST_DELAY)
    while True:
        try:
            task = api_request(f"{TASKS_URL}/{task_id}", api_key)
        except (RuntimeError, OSError) as e:  # 網路抖動不中斷輪詢
            print(f"  輪詢異常（繼續）：{e}")
            time.sleep(POLL_INTERVAL)
            continue
        status = task.get("status", "unknown")
        elapsed = round(time.time() - t0)
        print(f"  [{elapsed:>4}s] status={status}")
        if status in ("succeeded", "failed", "expired"):
            break
        if time.time() - t0 > POLL_TIMEOUT:
            sys.exit(f"輪詢超時（{POLL_TIMEOUT}s）。任務仍在服務端，可稍後手動查詢：\n"
                     f"  GET {TASKS_URL}/{task_id}")
        time.sleep(POLL_INTERVAL)

    if status != "succeeded":
        err = task.get("error") or task
        sys.exit(f"生成失敗（status={status}）：{json.dumps(err, ensure_ascii=False)[:500]}")

    video_url = (task.get("content") or {}).get("video_url")
    if not video_url:
        sys.exit(f"任務成功但未返回影片地址：{json.dumps(task, ensure_ascii=False)[:500]}")

    path = resolve_path(args.out)
    size = download(video_url, path)
    tokens = (task.get("usage") or {}).get("completion_tokens", "?")
    print(f"影片已儲存至 {path}（{size / 1e6:.1f} MB，耗時 {round(time.time() - t0)}s，"
          f"計費 {tokens} tokens）")


if __name__ == "__main__":
    main()
```

## 怎麼切換模型

切換模型**只需改 `--model`**，四種值任選：

```text theme={null}
... seedance_video.py "提示詞"                                    # 預設 mini（最快最便宜）
... seedance_video.py "提示詞" --model fast                       # 極速版
... seedance_video.py "提示詞" --model std --resolution 1080p     # 2.0 標準版
... seedance_video.py "提示詞" --model sd25 --duration 30         # Seedance 2.5·最長 30 秒
```

<Info>
  **令牌分組決定能調哪個模型**：`SeeDance2`（0.18x）裡是**四個模型全部**（`sd25` / `std` / `fast` / `mini`）；特價分組是「單模型專用通道」——`SD2Mini`（0.10x）裡只有 `mini`、`SD2Fast`（0.15x）裡只有 `fast`，拿特價令牌調其它模型會報「該模型無可用渠道」。**一把勾了 `SeeDance2` 的令牌就夠用**；跑量大再單獨開特價令牌，詳見 [概覽頁的分組介紹](/zh-Hant/api-capabilities/seedance2/overview)。
</Info>

## 出片要等 2-5 分鐘（重要）

影片生成是**非同步任務**，這是它與圖片技能最大的不同：

* 指令碼已封裝完整流程：提交任務 → 每 15 秒輪詢一次 → 成功後自動下載 mp4，**720p/5s 實測全程約 2-3 分鐘**，1080p 或長時長會更久。
* **Agent 執行時要給命令設長超時（600 秒以上）或放到後臺跑**——很多 Agent 的命令預設 2 分鐘超時，會在出片前把指令碼掐斷。`SKILL.md` 裡已寫明這條，支援後臺執行的 Agent（如 Claude Code）會自動處理。
* 萬一輪詢超時（15 分鐘），任務仍在服務端排隊，指令碼會列印 `task_id` 和查詢命令，稍後手動查詢即可，**不會白扣費**——Seedance 2.0 是提交預扣、完成後多退少補，提交被拒（HTTP 400）分文不扣。

## 為什麼一句話就能出影片

很多人好奇：我又沒敲命令，怎麼說句"生成一段貓的影片"它就出片了？

原理是這樣：Agent 啟動時會**先讀取每個技能 `SKILL.md` 裡的 `description`**（一段很短的後設資料，說明「這個技能做什麼、什麼時候該用」）。當你說出的需求**匹配上**這段描述的場景（比如"生成/做一段影片""把這張圖做成動圖"），Agent 就**自動決定呼叫這個技能**，去讀完整的 `SKILL.md` 並執行指令碼——整個過程你不用記任何命令。

不想靠 Agent 猜、想要**百分百可控**時，用下面的**顯性呼叫**。

## 怎麼用

### 自然語言（隱式觸發）

裝好後直接對 Agent 說話即可：

| 你說                   | 技能行為                                             |
| -------------------- | ------------------------------------------------ |
| "生成一段貓在草地上跑的影片"      | 預設 `mini` / 720p / 5 秒，出 1 條帶音訊的 mp4             |
| "把這張海報做成動態影片"        | 帶 `-i poster.png`，首幀圖生影片                         |
| "來一段 10 秒的 1080p 航拍" | 帶 `--model std --resolution 1080p --duration 10` |
| "用這幾張角色圖出一段跑酷影片"     | 帶 `--ref-image` 傳參考圖                             |
| "不要背景音"              | 帶 `--no-audio`                                   |

### 顯性呼叫（更可控）

* **支援斜槓命令的 Agent**（如 Claude Code）：

  ```text theme={null}
  /seedance2 無人機航拍秋天的山谷，金黃色森林，電影感 --duration 8 --ratio 16:9
  ```

* **任意 Agent / 直接命令它跑指令碼**（最通用）：

  ```text theme={null}
  執行 python3 seedance2/scripts/seedance_video.py "無人機航拍秋天的山谷，電影感" --duration 8
  ```

## 生成的影片在哪裡

* 當 `-o` 只傳**檔名**（如 `-o cat.mp4`）時，影片統一存到**專案根目錄下的 `seedance-output/` 資料夾**（指令碼自動建立），在專案裡直接就能找到。
* 「專案根目錄」= 指令碼從自身位置向上找到的第一個含 `.git` 或 `.claude` 的目錄——**不管 Agent 在哪個目錄執行，影片都落在專案裡**，不會跑進臨時目錄害你找不到。
* 指令碼完成後會**列印一行完整絕對路徑**，附帶檔案大小、耗時和計費 tokens，例如 `影片已儲存至 /Users/you/project/seedance-output/cat.mp4（3.8 MB，耗時 132s，計費 108900 tokens）`。
* 服務端返回的影片直鏈 **24 小時過期**，所以指令碼一律先下載到本地——**本地 mp4 才是交付物**，不要把直鏈存起來當結果。
* 傳**帶目錄的路徑**（如 `-o videos/cat.mp4` 或絕對路徑）時，按你給的路徑存，不進 `seedance-output/`。

## 相關文件

* [Seedance 2.0 概覽](/zh-Hant/api-capabilities/seedance2/overview)（模型、價格、分組）
* [影片生成 API 參考](/zh-Hant/api-capabilities/seedance2/video-generation)（完整引數與端點）
* [素材引用生影片實戰](/zh-Hant/api-capabilities/seedance2/asset-reference)（人物一致性、`asset://` 素材）
* [GPT-Image-2 系列 Agent 技能](/zh-Hant/api-capabilities/gpt-image-2/skills)（圖片版姊妹篇）
* [Nano Banana Pro Agent 技能](/zh-Hant/api-capabilities/nano-banana-image/skills)
