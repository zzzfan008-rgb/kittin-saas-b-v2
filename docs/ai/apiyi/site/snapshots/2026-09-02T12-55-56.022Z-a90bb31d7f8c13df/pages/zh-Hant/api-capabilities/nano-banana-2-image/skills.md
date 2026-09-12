> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana 2 Agent 技能

> 把 Nano Banana 2（gemini-3.1-flash-image-preview）封裝成開箱即用的 Agent Skill，丟進 Codex、OpenClaw、hermes-agent、Claude Code 等任意編碼 Agent，一句話即可呼叫 API易 平臺完成文生圖與圖片編輯。

<Note>
  本頁提供一個**開箱即用的 Agent 技能（Skill）**：把它放進你正在用的編碼 Agent，就能用自然語言（或顯式命令）直接呼叫 API易 平臺的 **Nano Banana 2**（`gemini-3.1-flash-image-preview`）完成生圖與改圖。整套東西就兩個檔案，複製即用。
</Note>

<Tip>
  如果你想要的是 Nano Banana **Pro**（`gemini-3-pro-image`，極致畫質）的技能，見 [Nano Banana Pro Agent 技能](/zh-Hant/api-capabilities/nano-banana-image/skills)。本頁是 **Nano Banana 2**（Pro 級畫質 + Flash 級速度，價效比更高）。
</Tip>

## 這個技能能做什麼

一個合併技能，指令碼會根據**是否傳入圖片**自動判斷是「文生圖」還是「圖片編輯」：

<CardGroup cols={3}>
  <Card title="文生圖" icon="wand-sparkles">
    只給提示詞 → 生成全新圖片，支援 **14 種寬高比**與 512/1K/2K/4K 解析度。
  </Card>

  <Card title="圖片編輯" icon="image">
    傳入一張圖 + 指令 → 局部編輯、風格遷移、背景替換等。
  </Card>

  <Card title="多圖合成" icon="layers">
    傳入多張圖 + 一條指令 → 多圖合成、對比、換裝等高階玩法。
  </Card>
</CardGroup>

相比 Pro，Nano Banana 2 多了 `1:4 / 4:1 / 1:8 / 8:1` 四種**超長/超寬比例**和獨有的 **512px** 低解析度檔，按次僅 \$0.055/張、按量低至約 \$0.025/張，更適合走量。

## 能用在哪些 Agent

<Info>
  一個 Skill 本質上就是**一個資料夾**：一份寫給 Agent 看的說明（`SKILL.md`）+ 一個幹活的指令碼。所以**凡是能讀取本地檔案、執行命令列的編碼 Agent 都能用上**——比如 **Codex、OpenClaw、hermes-agent、Claude Code** 等。

  唯一要求：跑 Agent 的那臺機器（你的電腦或伺服器）裝了 **Python 3** 並且**能聯網**（指令碼要直連 `api.apiyi.com`）。僅此而已，不挑具體哪家 Agent。
</Info>

## 三步裝好

### ① 建目錄、貼檔案

新建一個技能資料夾，放入下面兩個檔案（完整內容見後兩節）：

```
nano-banana-2/
├── SKILL.md
├── scripts/
│   └── nano_banana_2.py
└── .env          # 第②步建立，放你的 Key
```

### ② 同目錄寫 Key

在 `nano-banana-2/.env` 裡寫上你的 **API易 API Key**（在 `api.apiyi.com` 控制台建立）：

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

指令碼會自動從這個 `.env` 讀取 Key，**無需任何額外配置或環境變數**。

<Warning>
  `.env` 裡是你的金鑰。如果這個技能要隨專案倉庫共享，**務必把 `.env` 加進 `.gitignore`，不要提交到 git**。
</Warning>

### ③ 交給 Agent

* **支援技能自動發現的 Agent**（如 Claude Code）：把整個 `nano-banana-2/` 目錄放進它的技能目錄——個人級 `~/.claude/skills/`，或專案級 `.claude/skills/`（隨倉庫共享）。
* **其他 Agent**：按它各自的技能/外掛約定放置；或者最簡單——**直接讓 Agent「讀一下這個資料夾裡的 SKILL.md，並照著執行」** 即可。

裝好後就能用了，跳到 [怎麼用](#怎麼用) 看示例。

## SKILL.md

新建 `nano-banana-2/SKILL.md`，完整內容如下（`description` 寫清「做什麼 + 何時用」，Agent 會據此自動觸發）：

````markdown theme={null}
---
name: nano-banana-2
description: Generate or edit images via APIYI's Nano Banana 2 (gemini-3.1-flash-image-preview) model. Use this when the user asks to create, draw, render, or generate an image/illustration/poster, or to edit, retouch, restyle, or composite existing images.
allowed-tools: Bash(python3 *)
---

# Nano Banana 2 出圖技能

通過 API易 平臺呼叫 Nano Banana 2（`gemini-3.1-flash-image-preview`）生成或編輯圖片。Pro 級畫質、Flash 級速度，價效比高。

## Key 配置

指令碼會自動讀取技能目錄下 `.env` 檔案裡的 `APIYI_API_KEY`（也支援同名環境變數）。
若指令碼報「未找到 Key」，提示使用者在 `.env` 裡寫一行 `APIYI_API_KEY=sk-xxx`。

## 用法

呼叫同目錄下的指令碼，第一個引數是提示詞；編輯圖片時用 `-i` 傳入一張或多張本地圖片路徑：

```bash
# 文生圖（默認出 1 張）
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2.py "一隻戴著宇航頭盔的柴犬，電影感打光" -o dog.png --size 2K --aspect 16:9

# 超寬橫幅（Nano Banana 2 獨有的 8:1 / 4:1 等超寬比例）
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2.py "國風山水長卷橫幅" -o banner.png --aspect 8:1 --size 2K

# 圖片編輯（傳 1 張）
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2.py "把背景換成賽博朋克城市夜景" -i input.jpg -o edited.png

# 多圖合成（傳多張，重複 -i）
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2.py "把這兩個人合到同一張辦公室合影裡" -i a.png -i b.png -o merged.png

# 一次出多張同主題變體（最多 5 張，併發生成）
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2.py "國風山水插畫" -o shanshui.png -n 3 --aspect 16:9
```

引數說明：

- 第 1 個位置引數：提示詞（必填）。
- `-i / --image`：輸入圖片路徑，可重複多次；不傳 = 文生圖，傳 = 圖片編輯。
- `-o / --out`：輸出檔名，預設 `output.png`。
- `-n / --count`：一次出幾張，**預設 1**，最多 5（指令碼內併發生成，超過會自動截到 5）。`-n>1` 時檔名自動加 `-1` `-2`… 字尾。
- `--aspect`：寬高比，14 選 1（`1:1` `1:4` `4:1` `1:8` `8:1` `2:3` `3:2` `3:4` `4:3` `4:5` `5:4` `9:16` `16:9` `21:9`），預設 `1:1`。
- `--size`：解析度 `512` / `1K` / `2K` / `4K`，預設 `2K`。

## 出圖張數（重要）

- **預設只出 1 張**：使用者沒有明確要求多張時，`-n` 保持預設（即不傳），只生成 1 張。
- **指定多張才出多張**：使用者說「出 3 張 / 來幾張 / 多給幾個版本」時才用 `-n`，且**一次不超過 5 張**。需要更多時分多次呼叫，不要試圖繞過上限。
- 多張是同一提示詞的併發變體（模型有隨機性，結果各不相同）。

## 輸出位置（重要）

- `-o` 傳**純檔名**（如 `dog.png`）時，圖片統一儲存到**專案根目錄下的 `nano-banana-output/` 資料夾**，方便使用者在專案裡直接找到。
- `-o` 傳**帶目錄的路徑**（相對或絕對，如 `images/dog.png` 或 `/abs/path/dog.png`）時，按給定路徑儲存（相對路徑相對當前工作目錄）。
- 不要把圖片寫到 `/tmp`、scratchpad 等臨時目錄，使用者會找不到。

## 完成後

指令碼會為每張圖列印一行完整路徑，把它們如實回報給使用者。若指令碼報告被內容安全策略拒絕，把拒絕原因如實轉達，不要重試同一提示詞。
````

<Tip>
  `name` 必須是小寫字母 + 連字元，且**不能含 `claude` / `anthropic`** 等保留詞。在支援斜槓命令的 Agent 裡，目錄名就是命令名——叫 `nano-banana-2` 即 `/nano-banana-2`。`${CLAUDE_SKILL_DIR}` 是 Claude Code 提供的技能目錄變數；其他 Agent 直接用指令碼的實際路徑即可。
</Tip>

## scripts/nano\_banana\_2.py

新建 `nano-banana-2/scripts/nano_banana_2.py`，使用 Gemini 原生格式（與本站文生圖 / 圖片編輯介面程式碼一致、已驗證可跑）。**純 Python 標準庫，無需 `pip install` 任何東西**：

```python theme={null}
#!/usr/bin/env python3
"""通過 API易 呼叫 Nano Banana 2（gemini-3.1-flash-image-preview）生成 / 編輯圖片。純標準庫，零依賴。"""
import argparse
import base64
import json
import os
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

# 一次呼叫最多併發出幾張圖（邊界，避免一次性打太多請求）
MAX_COUNT = 5


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


def to_b64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()


def mime_of(path):
    return "image/png" if path.lower().endswith(".png") else "image/jpeg"


def generate(api_key, endpoint, prompt, images, aspect, size):
    """發一次請求，返回圖片位元組；失敗拋 RuntimeError。"""
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
        raise RuntimeError(f"請求失敗 HTTP {e.code}：{e.read().decode(errors='replace')}")

    candidates = resp.get("candidates")
    if not candidates:
        raise RuntimeError(f"未返回候選內容（可能被內容安全策略拒絕）：{resp}")

    cand = candidates[0]
    # 內容稽核攔截：finishReason 非 STOP，或只返回了文字說明
    if cand.get("finishReason") not in (None, "STOP"):
        text = next((p.get("text") for p in cand["content"]["parts"] if p.get("text")), "")
        raise RuntimeError(f"請求被拒絕（finishReason={cand.get('finishReason')}）：{text}")

    image_part = next((p for p in cand["content"]["parts"] if p.get("inlineData")), None)
    if not image_part:
        text = next((p.get("text") for p in cand["content"]["parts"] if p.get("text")), "")
        raise RuntimeError(f"未返回圖片，模型回覆：{text}")

    return base64.b64decode(image_part["inlineData"]["data"])


def resolve_paths(out, count):
    """決定輸出路徑列表。
    - 若 out 帶目錄成分（相對/絕對），按使用者給定的路徑處理（相對則相對當前工作目錄）。
    - 若 out 是純檔名，統一存到 <專案根>/nano-banana-output/ 下，確保好找。
    count>1 時給檔名加 -1 / -2 … 字尾。
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
        sys.exit("未找到 API Key：請在技能目錄的 .env 寫一行 APIYI_API_KEY=sk-xxx")

    model = os.environ.get("APIYI_IMAGE_MODEL", "gemini-3.1-flash-image-preview")
    endpoint = f"https://api.apiyi.com/v1beta/models/{model}:generateContent"

    parser = argparse.ArgumentParser(description="Nano Banana 2 出圖")
    parser.add_argument("prompt", help="提示詞 / 編輯指令")
    parser.add_argument("-i", "--image", action="append", default=[],
                        help="輸入圖片路徑（可重複，傳入即為編輯模式）")
    parser.add_argument("-o", "--out", default="output.png", help="輸出檔名")
    parser.add_argument("-n", "--count", type=int, default=1,
                        help=f"一次出幾張，預設 1，最多 {MAX_COUNT}（併發生成）")
    parser.add_argument("--aspect", default="1:1", help="寬高比，14 選 1，如 16:9 / 1:4 / 8:1")
    parser.add_argument("--size", default="2K", help="解析度 512 / 1K / 2K / 4K")
    args = parser.parse_args()

    count = args.count
    if count < 1:
        count = 1
    if count > MAX_COUNT:
        print(f"提示：一次最多 {MAX_COUNT} 張，已將 {args.count} 限制為 {MAX_COUNT}。", file=sys.stderr)
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

<Tip>
  模型名預設 `gemini-3.1-flash-image-preview`。谷歌後續推出了去掉 `-preview` 的正式名 `gemini-3.1-flash-image`，兩者價格一致、都能跑；如需切換設環境變數 `APIYI_IMAGE_MODEL=gemini-3.1-flash-image` 即可。
</Tip>

## 為什麼一句話就能出圖

很多人好奇：我又沒敲命令，怎麼說句"畫只貓"它就出圖了？

原理是這樣：Agent 啟動時會**先讀取每個技能 `SKILL.md` 裡的 `description`**（一段很短的後設資料，說明「這個技能做什麼、什麼時候該用」）。當你說出的需求**匹配上**這段描述的場景（比如"畫/生成/渲染一張圖""把這張圖改成…"），Agent 就**自動決定呼叫這個技能**，去讀完整的 `SKILL.md` 並執行指令碼——整個過程你不用記任何命令。

所以：

* **寫得好的 `description` = 更準的自動觸發**。本技能的描述已覆蓋"生成/繪製/編輯/合成圖片"等說法。
* 不想靠 Agent 猜、想要**百分百可控**時，用下面的**顯性呼叫**。

## 怎麼用

### 自然語言（隱式觸發）

裝好後直接對 Agent 說話即可：

| 你說                                 | 技能行為                            |
| ---------------------------------- | ------------------------------- |
| "用 nano banana 2 畫一張 16:9 的雪山日出海報" | 調指令碼（無 `-i`），出 1 張 png          |
| "做一張 8:1 的超寬國風橫幅"                  | 調指令碼 `--aspect 8:1`，出 1 張超寬 png |
| "國風山水來 3 張不同的"                     | 調指令碼 `-n 3`，併發出 3 張 png         |
| "把 photo.jpg 的背景虛化，突出人物"           | 調指令碼 `-i photo.jpg`，出 1 張 png   |

### 顯性呼叫（更可控）

不想讓 Agent 自己判斷時，兩種顯式方式：

* **支援斜槓命令的 Agent**（如 Claude Code）：

  ```text theme={null}
  /nano-banana-2 一隻在花園裡打盹的橘貓，油畫風格 --size 2K --aspect 3:2
  ```

* **任意 Agent / 直接命令它跑指令碼**（最通用）：

  ```text theme={null}
  執行 python3 nano-banana-2/scripts/nano_banana_2.py "一隻在花園裡打盹的橘貓，油畫風格" --size 2K --aspect 3:2
  ```

<Tip>
  **怎麼控制比例和清晰度**：用 `--aspect` 選寬高比（14 選 1，含 Pro 沒有的 `1:4 / 4:1 / 1:8 / 8:1` 超長超寬），用 `--size` 選解析度（`512` / `1K` / `2K` / `4K`，`512` 是 Nano Banana 2 獨有的省錢低分檔）。直接說"豎屏 9:16""出 4K""來個超寬橫幅"，Agent 也會自動帶上這兩個引數。
</Tip>

## 生成的圖片在哪裡

* 當 `-o` 只傳**檔名**（如 `-o dog.png`）時，圖片統一存到**專案根目錄下的 `nano-banana-output/` 資料夾**（指令碼自動建立），所以你在專案裡的這個資料夾就能直接找到。
* 「專案根目錄」= 指令碼從自身位置向上找到的第一個含 `.git` 或 `.claude` 的目錄——**不管 Agent 在哪個目錄執行，圖都落在專案裡**，不會跑進臨時目錄害你找不到。
* 指令碼會**為每張圖列印一行完整絕對路徑**，例如 `圖片已儲存至 /Users/you/project/nano-banana-output/dog.png`。
* 預設**只出 1 張**；`-n 3` 一次出 3 張（最多 5，超過自動截到 5），檔名自動加 `-1`、`-2`、`-3` 字尾。
* 傳**帶目錄的路徑**（如 `-o images/dog.png` 或絕對路徑）時，按你給的路徑存（相對路徑相對當前工作目錄），不進 `nano-banana-output/`。
* 圖片編輯同理：輸出是新檔案，**不會覆蓋你的原圖**。

<Info>
  Nano Banana 2 有嚴格的內容安全管控。若指令碼提示 `finishReason` 非 `STOP` 或返回的是拒絕說明文本，請按提示調整內容，不要對同一違規提示詞反覆重試。
</Info>

## 相關文件

* [Nano Banana 2 圖片生成總覽](/zh-Hant/api-capabilities/nano-banana-2-image/overview)
* [文生圖 API 參考](/zh-Hant/api-capabilities/nano-banana-2-image/text-to-image)
* [圖片編輯 API 參考](/zh-Hant/api-capabilities/nano-banana-2-image/image-edit)
* [Nano Banana Pro Agent 技能](/zh-Hant/api-capabilities/nano-banana-image/skills)
* [Nano Banana 定價說明](/zh-Hant/api-capabilities/nano-banana-pricing)
