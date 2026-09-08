> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan2.7 與 HappyHorse 影片 Agent 技能

> 把阿里系影片模型 Wan2.7 與 HappyHorse 封裝成一個開箱即用的 Agent Skill，丟進 Codex、OpenClaw、Claude Code 等任意編碼 Agent，一句話完成文生影片、圖生影片、參考圖生影片與影片編輯，--model 一鍵切換兩個系列，本地圖可直接上傳。

<Note>
  本頁提供一個**開箱即用的 Agent 技能（Skill）**：一個零依賴指令碼同時覆蓋 **Wan2.7** 與 **HappyHorse** 兩個系列——它們走同一個端點、同一套請求結構、同一個 `Wan&HappyHorse` 令牌分組，用 `--model` 一鍵切換。指令碼會按你傳入的素材**自動選擇模型**（文生 / 圖生 / 參考圖生 / 影片編輯），並封裝好「提交 → 輪詢 → 下載成片」的完整非同步流程，整套東西就兩個檔案。
</Note>

## 這個技能能做什麼

一個合併技能，指令碼根據**傳入的素材型別**自動判斷生成模式、選對模型 ID：

<CardGroup cols={2}>
  <Card title="文生影片" icon="clapperboard">
    只給提示詞 → 生成全新影片，預設開啟提示詞智慧擴寫，短提示詞也有好效果。
  </Card>

  <Card title="圖生影片" icon="image-play">
    傳入首幀圖讓靜態圖動起來——本地圖片直接傳，指令碼自動上傳。
  </Card>

  <Card title="參考圖生影片" icon="layers">
    傳參考圖（Wan 還可傳參考影片）→ 保持角色、物品或風格出新畫面，prompt 裡用「圖1 / 影片1」指代。
  </Card>

  <Card title="影片編輯" icon="scissors">
    傳一段影片 + 參考圖 → 替換 / 改造影片裡的元素，輸出時長跟隨源影片。
  </Card>
</CardGroup>

## 兩個系列怎麼選

兩個系列**呼叫方式完全一致**，區別在價格、畫質取向和參考素材能力。指令碼已按 `--model` 自動處理差異：

| 系列（`--model`） | 定位       | 720P 價格   | 1080P 價格  | 720P/5s 約  | 參考素材       | 720P/5s 實測速度 |
| ------------- | -------- | --------- | --------- | ---------- | ---------- | ------------ |
| `wan`（預設）     | 價效比，走量首選 | \$0.084/秒 | \$0.14/秒  | **\$0.42** | 圖+影片合計 5 個 | 45–155s      |
| `happyhorse`  | 畫質取向     | \$0.126/秒 | \$0.224/秒 | **\$0.63** | 僅圖、最多 9 張  | 105–125s     |

<Tip>
  簡單記：**日常與走量用預設 `wan`**；**對畫面質感要求高** → `--model happyhorse`。兩家共用 `Wan&HappyHorse` 分組（0.14x 倍率，約為官網人民幣價的 98%，疊加充值加贈後更低），一把令牌通吃，沒有特價分組。按秒計費、失敗任務不扣費。價格明細見 [Wan 概覽](/zh-Hant/api-capabilities/wan/overview) 與 [HappyHorse 概覽](/zh-Hant/api-capabilities/happyhorse/overview)。
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
wan/
├── SKILL.md
├── scripts/
│   └── wan_video.py
└── .env          # 第②步建立，放你的 Key
```

### ② 同目錄寫 Key

在 `wan/.env` 裡寫上你的 **API易 API Key**（在 `api.apiyi.com` 控制台建立，**令牌須勾選 `Wan&HappyHorse` 分組**、計費模式選按量——按次計費令牌無法路由）：

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

指令碼會自動從這個 `.env` 讀取 Key，**無需任何額外配置或環境變數**。

<Warning>
  `.env` 裡是你的金鑰。如果這個技能要隨專案倉庫共享，**務必把 `.env` 加進 `.gitignore`，不要提交到 git**。
</Warning>

### ③ 交給 Agent

* **支援技能自動發現的 Agent**（如 Claude Code）：把整個 `wan/` 目錄放進它的技能目錄——個人級 `~/.claude/skills/`，或專案級 `.claude/skills/`（隨倉庫共享）。
* **其他 Agent**：按它各自的技能/外掛約定放置；或者最簡單——**直接讓 Agent「讀一下這個資料夾裡的 SKILL.md，並照著執行」** 即可。

裝好後就能用了，跳到 [怎麼用](#怎麼用) 看示例。

## SKILL.md

新建 `wan/SKILL.md`，完整內容如下（`description` 寫清「做什麼 + 何時用」，Agent 會據此自動觸發）：

````markdown theme={null}
---
name: wan
description: Generate videos via APIYI's Wan2.7 and HappyHorse (Alibaba) models — text-to-video, image-to-video (first frame), reference-image/video-to-video, and video editing. Use this when the user asks to create, generate, or animate a video clip, or to restyle/edit an existing video.
allowed-tools: Bash(python3 *)
---

# Wan2.7 / HappyHorse 出影片技能

通過 API易 平臺呼叫阿里系影片模型出片。一個指令碼覆蓋兩個系列，`--model` 切換：

- `wan`（預設）：Wan2.7 系列，更便宜（720P 約 \$0.084/秒）。
- `happyhorse`：HappyHorse-1.1 系列，畫質取向，價格約 wan 的 1.5 倍；不支援參考影片。

指令碼按傳入素材自動選模型：不傳圖 = 文生影片；`-i` 首幀圖 = 圖生影片；`--ref-image`/`--ref-video` = 參考生影片；`--video`+`--ref-image` = 影片編輯。

## Key 配置

指令碼會自動讀取技能目錄下 `.env` 檔案裡的 `APIYI_API_KEY`（也支援同名環境變數）。
若指令碼報「未找到 Key」，提示使用者在 `.env` 裡寫一行 `APIYI_API_KEY=sk-xxx`，
且該令牌須勾選 `Wan&HappyHorse` 分組、計費模式為按量（按次計費令牌無法路由）。

## 用法（重要：出片要 2-5 分鐘）

影片是**非同步任務**：指令碼內部會提交任務並輪詢到完成，單次呼叫總耗時通常 2-5 分鐘（1080P 或長影片更久）。
**執行時必須給 Bash 設長超時（600 秒以上）或放到後臺跑**，不要用預設 2 分鐘超時，否則會在出片前被掐斷。

```bash
# 文生影片（預設 wan / 720P / 5 秒）
python3 ${CLAUDE_SKILL_DIR}/scripts/wan_video.py "夜晚的東京街頭，霓虹燈閃爍，行人撐傘走過，雨天氛圍" -o tokyo.mp4

# 圖生影片（首幀圖；本地路徑或公網 URL 都行，本地檔案自動轉 base64 上傳）
python3 ${CLAUDE_SKILL_DIR}/scripts/wan_video.py "鏡頭緩緩推近，光影流動" -i photo.jpg -o animated.mp4

# 參考圖生影片（保持角色/風格；prompt 裡用「圖1」「圖2」指代素材）
python3 ${CLAUDE_SKILL_DIR}/scripts/wan_video.py "圖1中的角色在雪地裡奔跑" --ref-image role.png -o run.mp4

# 影片編輯（用參考圖改影片裡的元素）
python3 ${CLAUDE_SKILL_DIR}/scripts/wan_video.py "把影片1裡的人物替換成圖1的角色" --video https://example.com/src.mp4 --ref-image https://example.com/role.png -o edited.mp4

# 換 HappyHorse、要 1080P
python3 ${CLAUDE_SKILL_DIR}/scripts/wan_video.py "無人機航拍秋天山谷，電影感" --model happyhorse --resolution 1080P --duration 8 -o valley.mp4
```

引數說明：

- 第 1 個位置引數：提示詞（必填）。多素材時用「圖1 / 影片1」按順序指代。
- `--model`：`wan`（預設）/ `happyhorse`。
- `--resolution`：`720P`（預設）/ `1080P`（注意大寫、無 480P 檔）。
- `--ratio`：`16:9` / `9:16` / `1:1` / `4:3` / `3:4`（傳首幀圖時被忽略；happyhorse 文件未列此引數，僅顯式傳時傳送）。
- `--duration`：2-15 整數秒，預設 5；含參考影片時上限 10；編輯模式輸出時長跟隨源影片。
- `--negative`：負向提示詞。`--no-prompt-extend`：關閉提示詞智慧擴寫（預設開啟）。
- `-i / --image`：首幀圖（本地路徑或 URL）。`--ref-image`：參考圖可重複（wan 合計最多 5、happyhorse 最多 9）。`--ref-video`：參考影片 URL（僅 wan）。`--video`：待編輯影片 URL。
- `-o / --out`：輸出檔名，預設 `output.mp4`。

## 素材輸入（重要）

- 圖片素材：**本地檔案和公網 URL 都行**——指令碼會把本地檔案轉成 base64 data URI 上傳（兩系列實測可用；官方文件只寫了 URL 口徑）。
- 影片素材（`--ref-video` / `--video`）：優先用公網 URL；大影片轉 base64 體積會膨脹，可能超請求限制。

## 出片條數與成本（重要）

- **一次呼叫只出 1 條影片**，沒有批次引數。使用者要多條時序列多次呼叫，並在動手前提醒成本。
- 按秒計費：wan 720P \$0.084/秒（5 秒約 \$0.42）、1080P \$0.14/秒；happyhorse 約為 wan 的 1.5 倍。
  使用者沒有明確要求時，**保持預設 wan / 720P / 5s**，不要擅自加時長、升 1080P 或換 happyhorse。
- 失敗任務不計費；重複提交會重複計費，不要對同一請求自動重試。

## 輸出位置（重要）

- `-o` 傳**純檔名**（如 `cat.mp4`）時，影片統一儲存到**專案根目錄下的 `wan-output/` 資料夾**。
- `-o` 傳**帶目錄的路徑**時按給定路徑儲存（相對路徑相對當前工作目錄）。
- 不要把影片寫到 `/tmp`、scratchpad 等臨時目錄，使用者會找不到。
- 結果直鏈 24 小時過期，指令碼已自動下載到本地，本地檔案才是交付物。

## 完成後

指令碼會列印儲存路徑、檔案大小和耗時，把路徑如實回報給使用者。
若指令碼報生成失敗（含內容稽核拒絕），把錯誤原文如實轉達，不要重試同一提示詞。
若報「該模型無可用渠道」，提示使用者檢查令牌分組是否勾了 `Wan&HappyHorse`、計費模式是否為按量。
````

<Tip>
  `name` 必須是小寫字母 + 連字元。在支援斜槓命令的 Agent 裡，目錄名就是命令名——叫 `wan` 即 `/wan`。`${CLAUDE_SKILL_DIR}` 是 Claude Code 提供的技能目錄變數；其他 Agent 直接用指令碼的實際路徑即可。
</Tip>

## scripts/wan\_video.py

新建 `wan/scripts/wan_video.py`，純 Python 標準庫實現，與本站各 API 參考頁的請求程式碼一致、已實測可跑：

```python theme={null}
#!/usr/bin/env python3
"""通過 API易 呼叫 Wan2.7 / HappyHorse 生成影片（文生 / 圖生 / 參考圖生 / 影片編輯）。純標準庫，零依賴。"""
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

# DashScope 透傳端點。絕不要用 /v1/videos 扁平路徑——它會丟棄 media 欄位
CREATE_URL = "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis"
TASK_URL = "https://api.apiyi.com/v1/tasks/{}"

# 家族 × 模式 → 模型 ID。編輯版命名不規則（happyhorse 是 1.0 且帶連字元），別手拼
FAMILY_MODELS = {
    "wan": {"t2v": "wan2.7-t2v", "i2v": "wan2.7-i2v",
            "r2v": "wan2.7-r2v", "edit": "wan2.7-videoedit"},
    "happyhorse": {"t2v": "happyhorse-1.1-t2v", "i2v": "happyhorse-1.1-i2v",
                   "r2v": "happyhorse-1.1-r2v", "edit": "happyhorse-1.0-video-edit"},
}
# r2v 參考素材上限：wan 圖+影片合計 5，happyhorse 僅圖、最多 9
MAX_REFS = {"wan": 5, "happyhorse": 9}
RATIOS = ("16:9", "9:16", "1:1", "4:3", "3:4")

# 出片是非同步任務：720P/5s 實測約 70-140 秒，1080P/長影片可能 5 分鐘以上
POLL_FIRST_DELAY = 15
POLL_INTERVAL = 8
POLL_TIMEOUT = 20 * 60


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
    """純檔名 → 存到 <專案根>/wan-output/ 下，確保好找；帶目錄成分則按給定路徑。"""
    if os.path.dirname(out):
        return os.path.abspath(out)
    out_dir = os.path.join(project_root(), "wan-output")
    os.makedirs(out_dir, exist_ok=True)
    return os.path.join(out_dir, out)


def media_source(src):
    """素材入參：URL / data: 原樣透傳，本地檔案轉 base64 data URI（實測兩系列可用）。"""
    if src.startswith(("http://", "https://", "data:")):
        return src
    if not os.path.exists(src):
        sys.exit(f"素材檔案不存在：{src}")
    ext = src.lower().rsplit(".", 1)[-1]
    mime = {"png": "image/png", "webp": "image/webp", "mp4": "video/mp4",
            "mov": "video/quicktime"}.get(ext, "image/jpeg")
    with open(src, "rb") as f:
        return f"data:{mime};base64,{base64.b64encode(f.read()).decode()}"


def api_request(url, api_key, body=None, extra_headers=None):
    """閘道會標 content-encoding: gzip 但實際未壓縮，必須 Accept-Encoding: identity。"""
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
        raise RuntimeError(f"請求失敗 HTTP {e.code}：{e.read().decode(errors='replace')[:800]}")


def download(url, path):
    """下載結果影片：OSS 簽名直鏈，絕不能帶 Authorization 頭（帶了 403）。"""
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
        sys.exit("未找到 API Key：請在技能目錄的 .env 寫一行 APIYI_API_KEY=sk-xxx"
                 "（令牌須勾選 Wan&HappyHorse 分組、計費模式為按量）")

    parser = argparse.ArgumentParser(description="Wan2.7 / HappyHorse 出影片")
    parser.add_argument("prompt", help="提示詞（畫面 + 運鏡 + 氛圍；多素材時用「圖1/影片1」指代）")
    parser.add_argument("--model", default="wan", choices=sorted(FAMILY_MODELS),
                        help="wan=Wan2.7（預設，更便宜）/ happyhorse=HappyHorse-1.1（畫質取向）")
    parser.add_argument("--resolution", default="720P", type=str.upper,
                        choices=("720P", "1080P"), help="解析度，預設 720P（注意無 480P）")
    parser.add_argument("--ratio", default=None, choices=RATIOS,
                        help="寬高比（傳首幀圖時忽略；happyhorse 文件未列此引數，僅顯式傳時傳送）")
    parser.add_argument("--duration", type=int, default=5,
                        help="時長 2-15 整數秒，預設 5；含參考影片時上限 10；編輯模式跟隨源影片")
    parser.add_argument("--negative", help="負向提示詞（不想出現的內容，500 字元內）")
    parser.add_argument("--no-prompt-extend", action="store_true",
                        help="關閉提示詞智慧擴寫（預設開啟，短提示詞效果更好）")
    parser.add_argument("--seed", type=int, default=None, help="隨機種子，復現用")
    parser.add_argument("-i", "--image", help="首幀圖（本地路徑或 URL，圖生影片）")
    parser.add_argument("--ref-image", action="append", default=[],
                        help="參考圖，可重複（wan 與參考影片合計最多 5、happyhorse 最多 9）")
    parser.add_argument("--ref-video", action="append", default=[],
                        help="參考影片 URL，可重複（僅 wan 支援）")
    parser.add_argument("--video", help="待編輯影片 URL（影片編輯模式，需配 --ref-image）")
    parser.add_argument("-o", "--out", default="output.mp4", help="輸出檔名")
    args = parser.parse_args()

    if args.image and (args.ref_image or args.ref_video):
        sys.exit("首幀模式（-i）與參考模式（--ref-image/--ref-video）互斥，一次只能用一種。")
    if args.video and args.image:
        sys.exit("影片編輯模式（--video）與首幀模式（-i）互斥。")
    if args.video and not args.ref_image:
        sys.exit("影片編輯模式需要至少 1 張參考圖（--ref-image）。")
    if args.model == "happyhorse" and args.ref_video:
        sys.exit("happyhorse 不支援參考影片（--ref-video），僅 wan 支援。")
    n_refs = len(args.ref_image) + len(args.ref_video)
    if n_refs > MAX_REFS[args.model]:
        sys.exit(f"{args.model} 參考素材最多 {MAX_REFS[args.model]} 個，當前 {n_refs} 個。")
    if not 2 <= args.duration <= 15:
        sys.exit("時長只支援 2-15 整數秒。")
    if args.ref_video and args.duration > 10:
        sys.exit("含參考影片時時長上限 10 秒。")

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
        sys.exit(f"提交失敗：{e}")
    task_id = (resp.get("output") or {}).get("task_id") or resp.get("task_id")
    if not task_id:
        sys.exit(f"提交失敗，響應：{json.dumps(resp, ensure_ascii=False)[:500]}")
    print(f"任務已提交 model={model} task_id={task_id}，出片通常需要 2-5 分鐘，開始輪詢…")

    t0 = time.time()
    time.sleep(POLL_FIRST_DELAY)
    while True:
        try:
            task = api_request(TASK_URL.format(task_id), api_key)
        except (RuntimeError, OSError) as e:  # 網路抖動不中斷輪詢
            print(f"  輪詢異常（繼續）：{e}")
            time.sleep(POLL_INTERVAL)
            continue
        status = str(task.get("status", "unknown")).lower()
        progress = task.get("progress", "")
        elapsed = round(time.time() - t0)
        # progress 常停在 30（上游只有 0/10/30/100 幾檔），不代表卡住
        print(f"  [{elapsed:>4}s] status={status}" + (f" progress={progress}" if progress != "" else ""))
        if status in ("completed", "failed"):
            break
        if time.time() - t0 > POLL_TIMEOUT:
            sys.exit(f"輪詢超時（{POLL_TIMEOUT}s）。任務仍在服務端，可稍後手動查詢：\n"
                     f"  GET {TASK_URL.format(task_id)}")
        time.sleep(POLL_INTERVAL)

    if status != "completed":
        err = task.get("error") or task.get("fail_reason") or task
        sys.exit(f"生成失敗（status={status}）：{json.dumps(err, ensure_ascii=False)[:500]}"
                 "\n（失敗任務不計費）")

    result_url = task.get("result_url")
    if not result_url:
        sys.exit(f"任務完成但未返回影片地址：{json.dumps(task, ensure_ascii=False)[:500]}")

    path = resolve_path(args.out)
    size = download(result_url, path)
    print(f"影片已儲存至 {path}（{size / 1e6:.1f} MB，耗時 {round(time.time() - t0)}s，"
          f"模型 {model}）")


if __name__ == "__main__":
    main()
```

## 怎麼切換系列

切換系列**只需改 `--model`**，兩種值任選，模型 ID 由指令碼按「系列 × 素材型別」自動推導：

```text theme={null}
... wan_video.py "提示詞"                        # 預設 wan（Wan2.7 系列）
... wan_video.py "提示詞" --model happyhorse     # HappyHorse-1.1 系列
```

<Info>
  **模型 ID 自動推導表**（不用記這些名字，指令碼按素材自動選）：

  | 你傳的素材                         | 模式    | wan                | happyhorse                  |
  | ----------------------------- | ----- | ------------------ | --------------------------- |
  | 只有提示詞                         | 文生影片  | `wan2.7-t2v`       | `happyhorse-1.1-t2v`        |
  | `-i` 首幀圖                      | 圖生影片  | `wan2.7-i2v`       | `happyhorse-1.1-i2v`        |
  | `--ref-image` / `--ref-video` | 參考生影片 | `wan2.7-r2v`       | `happyhorse-1.1-r2v`        |
  | `--video` + `--ref-image`     | 影片編輯  | `wan2.7-videoedit` | `happyhorse-1.0-video-edit` |
</Info>

## 素材輸入：本地圖直接傳（實測）

官方文件口徑是「media 須為公網可訪問的 https URL」，但我們實測兩個系列**都接受 base64 data URI**——所以指令碼對本地圖片做了自動轉換，`-i photo.jpg`、`--ref-image role.png` 直接傳本地路徑即可，無需先上傳圖床。影片素材（`--ref-video` / `--video`）仍建議用公網 URL，大檔案轉 base64 體積膨脹約三分之一，容易超請求限制。

## 出片要等 2-5 分鐘（重要）

影片生成是**非同步任務**：

* 指令碼已封裝完整流程：提交（`X-DashScope-Async` 非同步頭）→ 每 8 秒輪詢 → 完成後自動下載 mp4。**720P/5s 實測全程約 45–155 秒**，1080P 或長時長可能 5 分鐘以上。
* 輪詢列印的 `progress` **長時間停在 30% 是正常現象**（上游只上報 0/10/30/100 幾檔），不代表卡住。
* **Agent 執行時要給命令設長超時（600 秒以上）或放到後臺跑**——很多 Agent 的命令預設 2 分鐘超時，會在出片前把指令碼掐斷。`SKILL.md` 裡已寫明這條。
* 萬一輪詢超時（20 分鐘），任務仍在服務端，指令碼會列印 `task_id` 和查詢命令。**失敗任務不計費**；但重複提交會重複計費，指令碼不做自動重試。

## 為什麼一句話就能出影片

很多人好奇：我又沒敲命令，怎麼說句"生成一段影片"它就出片了？

原理是這樣：Agent 啟動時會**先讀取每個技能 `SKILL.md` 裡的 `description`**（一段很短的後設資料，說明「這個技能做什麼、什麼時候該用」）。當你說出的需求**匹配上**這段描述的場景（比如"生成/做一段影片""把這張圖做成動圖""改一下這段影片"），Agent 就**自動決定呼叫這個技能**，去讀完整的 `SKILL.md` 並執行指令碼——整個過程你不用記任何命令。

不想靠 Agent 猜、想要**百分百可控**時，用下面的**顯性呼叫**。

## 怎麼用

### 自然語言（隱式觸發）

裝好後直接對 Agent 說話即可：

| 你說                  | 技能行為                                      |
| ------------------- | ----------------------------------------- |
| "生成一段東京雨夜街頭的影片"     | 預設 `wan` / 720P / 5 秒                     |
| "把這張海報做成動態影片"       | 帶 `-i poster.png`，本地圖自動上傳                 |
| "用畫質好點的模型出一段 1080P" | 帶 `--model happyhorse --resolution 1080P` |
| "讓圖1的角色在圖2的場景裡跑起來"  | 帶兩個 `--ref-image`，參考生影片                   |
| "把這段影片裡的人換成這張圖的角色"  | 帶 `--video` + `--ref-image`，影片編輯          |

### 顯性呼叫（更可控）

* **支援斜槓命令的 Agent**（如 Claude Code）：

  ```text theme={null}
  /wan 無人機航拍秋天的山谷，金黃色森林，電影感 --duration 8 --ratio 16:9
  ```

* **任意 Agent / 直接命令它跑指令碼**（最通用）：

  ```text theme={null}
  執行 python3 wan/scripts/wan_video.py "無人機航拍秋天的山谷，電影感" --duration 8
  ```

## 生成的影片在哪裡

* 當 `-o` 只傳**檔名**（如 `-o cat.mp4`）時，影片統一存到**專案根目錄下的 `wan-output/` 資料夾**（指令碼自動建立），兩個系列共用這個目錄。
* 「專案根目錄」= 指令碼從自身位置向上找到的第一個含 `.git` 或 `.claude` 的目錄——**不管 Agent 在哪個目錄執行，影片都落在專案裡**，不會跑進臨時目錄害你找不到。
* 指令碼完成後會**列印一行完整絕對路徑**，附帶檔案大小和耗時，例如 `影片已儲存至 /Users/you/project/wan-output/tokyo.mp4（4.9 MB，耗時 153s，模型 wan2.7-t2v）`。
* 實測出片**自帶音軌**（AAC 雙聲道）。
* 結果直鏈 **24 小時過期**，所以指令碼一律先下載到本地——**本地 mp4 才是交付物**，不要把直鏈存起來當結果。
* 傳**帶目錄的路徑**（如 `-o videos/cat.mp4` 或絕對路徑）時，按你給的路徑存，不進 `wan-output/`。

## 相關文件

* [Wan 影片生成概覽](/zh-Hant/api-capabilities/wan/overview)（模型、價格、分組）
* [Wan2.7 文生影片 API 參考](/zh-Hant/api-capabilities/wan/text-to-video)
* [Wan2.7 參考圖生影片 API 參考](/zh-Hant/api-capabilities/wan/reference-to-video)
* [HappyHorse 影片 Agent 技能](/zh-Hant/api-capabilities/happyhorse/skills)（衛星頁 · 差異速覽）
* [Seedance 2.0 影片 Agent 技能](/zh-Hant/api-capabilities/seedance2/skills)（火山系姊妹篇）
