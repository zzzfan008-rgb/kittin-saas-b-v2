> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image-2.5 / 2 シリーズのエージェントスキル

> gpt-image-2.5-flare / gpt-image-2.5-sunburst / gpt-image-2（公式）と、gpt-image-2.5-all / gpt-image-2-all / gpt-image-2-vip（リバース）を、すぐに使える1つのエージェントスキルにパッケージ化します。Codex、OpenClaw、hermes-agent、Claude Code、または任意のコーディングエージェントに追加し、--model でチャンネルを切り替えて、テキストから画像への変換、複数画像の融合、インペインティングに対応できます。

<Note>
  このページでは、**すぐに使える Agent Skill** を提供します。1つのスクリプトで6つのモデル、**gpt-image-2.5-flare / gpt-image-2.5-sunburst / gpt-image-2 (公式)** および **gpt-image-2.5-all / gpt-image-2-all / gpt-image-2-vip**（リバース）をカバーします。いずれも同じ OpenAI Images API を使用し、異なるのは `--model` のみです。すでに使用しているコーディング Agent に追加すれば、わずか2つのファイルで1つの prompt から画像を生成できます。
</Note>

## このスキルが行うこと

単一の統合スキルです。スクリプトは入力画像を渡すかどうかを自動判定し、テキストから画像生成と画像編集を切り替えます:

<CardGroup cols={3}>
  <Card title="テキストから画像生成" icon="wand-sparkles">
    プロンプトのみ → 強力なテキスト描画と写実的な品質を備えた、まったく新しい画像。
  </Card>

  <Card title="マルチ画像融合" icon="layers">
    複数の画像（最大16枚）+ 1つの指示 → 画像1の人物を画像2のシーンに入れ、画像3のスタイルを維持する、など。
  </Card>

  <Card title="インペインティング" icon="image">
    1枚の画像 + `--mask` + 指示 → マスクした領域だけを変更します（**gpt-image-2 の公式サポートのみ対応**）。
  </Card>
</CardGroup>

## 選択するモデル

6つのモデルは**同一の方法で呼び出します**。違いは、ソースチャネル、価格／速度、そしてどのパラメータが有効になるかだけです。3つの公式モデル（2.5-flare／2.5-sunburst／2）は価格とパラメータを共有し、3つのリバースモデルも同様です。スクリプトはこれらの違いを`--model`によって自動的に処理します。

| モデル（`--model`）                                         | チャネル                 | 価格                      | 速度                       | `size`           | `quality`／`mask`                                            | 最適な用途                              |
| ------------------------------------------------------ | -------------------- | ----------------------- | ------------------------ | ---------------- | ----------------------------------------------------------- | ---------------------------------- |
| `gpt-image-2.5-flare`（デフォルト）                           | 公式パススルー              | tokenベース 約\$0.03–0.2／画像 | **公式で最速**（1Kの低負荷測定で約10秒） | ✅ 任意のプリセット       | ✅ `xhigh`／`max`を含む                                          | 日常的なテキストから画像への変換のデフォルト、品質ティア、透明背景  |
| `gpt-image-2.5-sunburst`                               | 公式パススルー              | tokenベース、flareと同じ       | flareより低速                | ✅ 任意のプリセット       | ✅ `xhigh`／`max`を含む                                          | 編集／複数画像の融合／マスクによるインペインティング、最高精度の編集 |
| `gpt-image-2`                                          | 公式パススルー              | tokenベース、flareと同じ       | 約100–120秒                | ✅ 任意のプリセット       | ✅（`high`まで）                                                 | 旧世代、既存の連携                          |
| `gpt-image-2.5-all`                                    | リバース（ChatGPTウェブ 2.5） | 一律 \$0.03／画像            | 約30–90秒                  | ❌ promptに記述      | ❌                                                           | 大量処理、速度、2.5の品質、promptテキストによるサイズ指定  |
| `gpt-image-2-all`                                      | リバース（ChatGPTライン）     | 一律 \$0.03／画像            | **最速 約30–60秒**           | ❌ promptに記述      | ❌                                                           | 大量処理、速度、promptテキストによるサイズ指定         |
| `gpt-image-2-vip`                                      | リバース（Adobeライン）       | 一律 \$0.03／画像            | 約90–150秒                 | ✅ **4K**を含む30ティア | ❌                                                           | 固定出力サイズ／低価格での4K                    |
| `gpt-image-2.5-flare-vip`／`gpt-image-2.5-sunburst-vip` | リバース（Adobeライン、2.5）   | 一律 \$0.03／画像            | 約20–140秒                 | ✅ **4K**を含む30ティア | 6つすべての`quality`ティア（`xhigh`／`max`を含む）、透明背景 ✅；`mask`は画像全体のみ ❌ | 一律価格での2.5品質、サイズ固定                  |

<Tip>
  クイックルール：**日常的なテキストから画像への変換** → `gpt-image-2.5-flare`；**編集／マスクによるインペインティング** → `gpt-image-2.5-sunburst`；**高速かつ低価格** → `gpt-image-2.5-all`／`gpt-image-2-all`；**サイズ固定／4Kかつ低価格** → `gpt-image-2-vip`。
</Tip>

## どのエージェントが使用できますか

<Info>
  Skill は本質的には単なる **フォルダ** です。つまり、エージェントが読むための手順の集まり（`SKILL.md`）+ 実際の作業を行うスクリプトです。したがって、ローカルファイルを読み取り、シェルコマンドを実行できる **あらゆるコーディングエージェントが使用できます**。たとえば **Codex、OpenClaw、hermes-agent、Claude Code** などです。

  必要条件は1つだけです。エージェントが動作するマシン（お使いのコンピュータまたはサーバー）に **Python 3** がインストールされており、**ネットワークアクセス** があることです（スクリプトが `api.apiyi.com` を直接呼び出します）。それだけです。特定のエージェントに紐づいているわけではありません。
</Info>

## 3ステップでセットアップ

### ① フォルダを作成してファイルを貼り付け、依存関係をインストールする

次の2つのファイルを含むスキルフォルダを作成します（完全な内容は次の2セクションにあります）。このスキルはOpenAI SDK経由で呼び出すため、まず依存関係を1つインストールします:

```bash theme={null}
pip install openai
```

```
gpt-image-2/
├── SKILL.md
├── scripts/
│   └── gpt_image.py
└── .env          # created in step ②, holds your key
```

### ② 同じフォルダにキーを入れる

**APIYIのAPIキー**（`api.apiyi.com`コンソールで1つ作成します）を`gpt-image-2/.env`に書き込みます:

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

スクリプトはこの`.env`からキーを自動で読み取ります — **追加の設定や環境変数は不要です**。

<Warning>
  `.env`には秘密キーが保存されます。このスキルをプロジェクトのリポジトリ経由で共有する場合は、必ず`.env`を`.gitignore`に追加し、gitにコミットしないでください。
</Warning>

### ③ Agentに渡す

* **スキルを自動検出するAgent**（例: Claude Code）は、`gpt-image-2/`フォルダ全体をそのskillsディレクトリに入れてください。個人用の`~/.claude/skills/`、またはプロジェクトレベルの`.claude/skills/`（リポジトリ経由で共有）です。
* **その他のAgent**は、それぞれのスキル/プラグインの規約に従って配置してください。あるいは、最も簡単なのは、単にAgentに「このフォルダのSKILL.mdを読んで、それに従ってください」と伝えることです。

インストールが終われば準備完了です — 例は[使い方](#how-to-use-it)をご覧ください。

## SKILL.md

以下の完全な内容で`gpt-image-2/SKILL.md`を作成します（`description`には「何をするか + いつ使用するか」を記載します。これはAgentが自動トリガーに使用します）：

````markdown theme={null}
---
name: gpt-image-2
description: Generate or edit images via APIYI's GPT-Image 2.5 / 2 series — gpt-image-2.5-flare / gpt-image-2.5-sunburst / gpt-image-2 (official) and gpt-image-2.5-all / gpt-image-2-all / gpt-image-2-vip (reverse). Use this when the user asks to create, draw, render, or generate an image/illustration/poster, or to edit, retouch, restyle, fuse, or inpaint existing images.
allowed-tools: Bash(python3 *)
---

# GPT-Image-2 Series Image Skill

Generate or edit images through the APIYI platform using the GPT-Image 2.5 / 2 series. One script covers six models, switched by `--model`:

- `gpt-image-2.5-flare` (default, official): speed-first; supports `size` / `quality` (incl. `xhigh` / `max`) / `mask` inpainting; token-based billing.
- `gpt-image-2.5-sunburst` (official): editing-precision-first, same parameters as flare; the pick for edits / multi-image fusion.
- `gpt-image-2` (official): previous generation, same parameters (`quality` up to `high`).
- `gpt-image-2.5-all` (reverse): ChatGPT web 2.5 reverse line, flat \$0.03/img, same parameters as `-all`.
- `gpt-image-2.5-flare-vip` / `gpt-image-2.5-sunburst-vip` (reverse, Adobe line 2.5): flat \$0.03/img, lockable `size`, all six `quality` tiers (incl. `xhigh` / `max`) and transparent background; `mask` only regenerates the whole image.
- `gpt-image-2-all` (reverse, ChatGPT line): fastest, flat \$0.03/img; **no `size`/`quality`** — put size in the prompt.
- `gpt-image-2-vip` (reverse, Adobe line): can lock `size` (30 tiers incl. 4K), flat \$0.03/img; **no `quality`/`mask`**.

## Key configuration

The script auto-reads `APIYI_API_KEY` from a `.env` file in the skill folder (an environment variable of the same name also works).
The script depends on the OpenAI SDK; if it reports a missing package, ask the user to run `pip install openai`.

## Usage

The first argument is the prompt; for editing/fusion, pass one or more local image paths with `-i`:

```bash
# テキストから画像へ（デフォルトは品質指定付きの公式 gpt-image-2.5-flare）
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "サングラスをかけたオレンジ色の猫が海辺のバーにいる、シネマティック" -o cat.png --size 1536x1024 --quality high

# 最速かつ最安：リバース「all」（サイズは prompt に指定し、size は渡さない）
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "フラットイラストのフェスティバルポスター、縦長 2:3" -o poster.png --model gpt-image-2-all

# 固定4Kが必要：リバース「vip」
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "都市の夜景を空撮したビュー" -o city.png --model gpt-image-2-vip --size 3840x2160

# 複数画像の融合（最大16枚、-i を繰り返す）
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "画像1の人物を画像2のシーンに配置し、画像3の色を維持する" -i person.png -i scene.png -i style.png -o fused.png

# インペインティング（マスク、公式モデルのみ。gpt-image-2.5-sunburst 推奨）
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "マスクされた領域を丸い窓に置き換える" -i room.png --mask mask.png -o edited.png

# 一度に複数（最大5件、同時実行）
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "フェスティバルポスターのドラフト" -o draft.png -n 3 --model gpt-image-2-all
```

Arguments:

- 1st positional arg: the prompt (required).
- `--model`: `gpt-image-2` (default) / `gpt-image-2-all` / `gpt-image-2-vip`. You can also set a default with `APIYI_IMAGE_MODEL=...` in `.env`.
- `-i / --image`: input image path, repeatable (up to 16); omitted = text-to-image, present = edit/fusion.
- `-o / --out`: output filename, defaults to `output.png`.
- `-n / --count`: how many at once, **default 1**, max 5 (client-side concurrency; the script never sends `n`, avoiding per-image overbilling on reverse channels).
- `--size`: size, default `auto` (`gpt-image-2-all` ignores it — write size/ratio into the prompt).
- `--quality`: `low`/`medium`/`high`/`xhigh`/`max`/`auto`, **effective on the three official models and the two 2.5 -vip models** (`xhigh` / `max` on the 2.5 series only; the script omits it for `-all` / `gpt-image-2-vip`).
- `--format`: `png`/`jpeg`/`webp`, official only.
- `--mask`: mask image, official edit only (PNG with alpha, applies to the first image).
- `--background`: `transparent`/`opaque`/`auto`, official only. With `transparent`, `--format` must be `png` or `webp`.

## Choice & red lines (important)

- **Default `gpt-image-2.5-flare` (official)**: everyday text-to-image; switch to `gpt-image-2.5-sunburst` for edits and mask inpainting.
- **Fast/cheap** → `gpt-image-2.5-all` / `gpt-image-2-all`; **locked size/4K** → `gpt-image-2-vip`.
- For reverse `-all` / `gpt-image-2-vip`, **never pass `quality`** (the two 2.5 -vip models accept it); for **`gpt-image-2-all` never pass `size`** (put it in the prompt). The script gates this automatically, but follow it when calling the script directly too.
- **Transparent backgrounds**: only the three official models have a `background` parameter. Add `--background transparent` to get a real alpha-channel image (`--format` must be `png`/`webp`). The reverse models all/vip have no such parameter — you can only ask for it in the prompt, and it is occasionally unreliable.

## Number of images & cost

- **Default to a single image**; use `-n` only when the user explicitly asks, max 5.
- Reverse 2.5-all/all/vip are flat \$0.03/img; the official models are token-based and `--quality high` is pricier (~\$0.05–0.21/img at 1K, `xhigh` / `max` more) — drop to `medium`/`low` or use a reverse model when budget matters.

## Output location (important)

- A **bare filename** for `-o` saves into a **`gpt-image-output/` folder at the project root**; a **path with a directory** is saved as given.
- Do not write images to `/tmp`, scratchpad, or other temp directories — the user won't find them.

## After running

The script prints one full path per image — report them all back to the user. If a request is rejected by moderation, relay the reason as-is and do not retry the same prompt.
````

<Tip>
  `name`は小文字の英字とハイフンである必要があります。スラッシュコマンドをサポートするAgentでは、ディレクトリ名がコマンドになります — `gpt-image-2`は`/gpt-image-2`になります。`${CLAUDE_SKILL_DIR}`はClaude Codeが提供するスキルディレクトリ変数です。他のAgentでは、スクリプトの実際のパスを使用してください。
</Tip>

## scripts/gpt\_image.py

APIYI（`base_url="https://api.apiyi.com/v1"`）を指す OpenAI SDK を使用して`gpt-image-2/scripts/gpt_image.py`を作成します：

```python theme={null}
#!/usr/bin/env python3
"""Generate / edit images via APIYI's gpt-image-2 series (gpt-image-2 official / gpt-image-2-all / gpt-image-2-vip reverse).
All use the OpenAI Images API (/v1/images/generations + /v1/images/edits), switched by --model. Needs: pip install openai"""
import argparse
import base64
import os
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor

from openai import OpenAI

# Max images generated concurrently per call (server returns 1 per call; this simulates more client-side)
MAX_COUNT = 5

# Per-model capability gating: whether these params are accepted (never send the unaccepted ones)
MODEL_CAPS = {
    "gpt-image-2.5-flare":    {"size": True,  "quality": True,  "output_format": True,  "mask": True,  "background": True},   # official, speed-first
    "gpt-image-2.5-sunburst": {"size": True,  "quality": True,  "output_format": True,  "mask": True,  "background": True},   # official, editing-first
    "gpt-image-2":     {"size": True,  "quality": True,  "output_format": True,  "mask": True,  "background": True},   # official, previous gen
    "gpt-image-2.5-all": {"size": False, "quality": False, "output_format": False, "mask": False, "background": False},  # reverse, ChatGPT 2.5
    "gpt-image-2-all": {"size": False, "quality": False, "output_format": False, "mask": False, "background": False},  # reverse, ChatGPT
    "gpt-image-2-vip": {"size": True,  "quality": False, "output_format": False, "mask": False, "background": False},  # reverse, Adobe
    "gpt-image-2.5-flare-vip":    {"size": True,  "quality": True,  "output_format": False, "mask": False, "background": True},   # reverse, Adobe 2.5 (all six quality tiers; mask is not inpainting)
    "gpt-image-2.5-sunburst-vip": {"size": True,  "quality": True,  "output_format": False, "mask": False, "background": True},   # reverse, Adobe 2.5
    "gpt-image-2.5-vip":          {"size": True,  "quality": True,  "output_format": False, "mask": False, "background": True},   # alias of sunburst-vip
}


def caps_of(model):
    # Unknown models fall back to the official capability set
    return MODEL_CAPS.get(model, MODEL_CAPS["gpt-image-2.5-flare"])


def load_api_key():
    """Prefer the env var; otherwise look for a .env in the script dir and its parent."""
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
    """Walk up from the script location to the first dir containing .git or .claude; else cwd."""
    d = os.path.dirname(os.path.abspath(__file__))
    while True:
        if os.path.isdir(os.path.join(d, ".git")) or os.path.isdir(os.path.join(d, ".claude")):
            return d
        parent = os.path.dirname(d)
        if parent == d:
            return os.getcwd()
        d = parent


def resolve_paths(out, count):
    """Decide output paths. Bare filename -> <project_root>/gpt-image-output/; a path with a dir -> as given."""
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
    """Get image bytes: b64_json may be pure base64 or a data:image-prefixed data URL (reverse models); or only a url."""
    raw = getattr(item, "b64_json", None)
    if raw:
        if raw.startswith("data:"):
            raw = raw.split(",", 1)[1]  # strip the data:image/png;base64, prefix
        return base64.b64decode(raw)
    url = getattr(item, "url", None)
    if url:
        with urllib.request.urlopen(url, timeout=360) as r:
            return r.read()
    raise RuntimeError("response has neither b64_json nor url")


def one_image(client, model, args):
    """Make one request, return image bytes; raise on failure (caught by _safe). Never sends n (default 1; concurrency for more)."""
    cap = caps_of(model)
    if args.image:
        # Edit / multi-image fusion: reopen files each call to avoid sharing handles across threads
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
        # Text to image
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
        sys.exit("No API key found: add a line APIYI_API_KEY=sk-xxx to the .env in the skill folder")

    default_model = os.environ.get("APIYI_IMAGE_MODEL", "gpt-image-2.5-flare")
    # Synchronous blocking call; image generation is slow, so give a generous 360s timeout
    client = OpenAI(api_key=api_key, base_url="https://api.apiyi.com/v1", timeout=360)

    parser = argparse.ArgumentParser(description="GPT-Image 2.5 / 2 series image generation")
    parser.add_argument("prompt", help="Prompt / edit instruction")
    parser.add_argument("--model", default=default_model,
                        help="gpt-image-2.5-flare (official, default) / gpt-image-2.5-sunburst (official, edits) / gpt-image-2 (official, previous gen) / gpt-image-2.5-all / gpt-image-2-all (reverse, fastest) / gpt-image-2-vip (reverse, lockable size) / gpt-image-2.5-flare-vip / gpt-image-2.5-sunburst-vip (reverse 2.5, lockable size + quality)")
    parser.add_argument("-i", "--image", action="append", default=[],
                        help="Input image path (repeatable, up to 16; presence = edit/fusion mode)")
    parser.add_argument("-o", "--out", default="output.png", help="Output filename")
    parser.add_argument("-n", "--count", type=int, default=1,
                        help=f"How many at once, default 1, max {MAX_COUNT} (client-side concurrency)")
    parser.add_argument("--size", default="auto",
                        help="Size, e.g. 1024x1024 / 2048x1152 / auto (gpt-image-2-all ignores it; put it in the prompt)")
    parser.add_argument("--quality", default="high",
                        help="Quality low / medium / high / auto (only effective on gpt-image-2 official)")
    parser.add_argument("--format", default="png", help="Output format png / jpeg / webp (official only)")
    parser.add_argument("--mask", help="Mask image (official edit only, PNG with alpha, applies to the first image)")
    parser.add_argument("--background", default="auto", choices=["transparent", "opaque", "auto"],
                        help="Background; transparent yields an alpha-channel image (official only, needs --format png/webp)")
    args = parser.parse_args()

    # jpeg has no alpha channel and is mutually exclusive with transparency — catch it locally, do not hand the user a 400
    if args.background == "transparent" and args.format == "jpeg":
        sys.exit("--background transparent cannot be combined with --format jpeg (no alpha channel); use png or webp")

    count = args.count
    if count < 1:
        count = 1
    if count > MAX_COUNT:
        print(f"Note: max {MAX_COUNT} at once; clamped {args.count} to {MAX_COUNT}.", file=sys.stderr)
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
                print(f"Image saved to {value}")
            else:
                failures += 1
                print(f"Image {os.path.basename(path)} failed: {value}", file=sys.stderr)

    if failures == count:
        sys.exit("All generations failed.")


def _safe(fn, arg):
    try:
        return True, fn(arg)
    except Exception as e:  # noqa: BLE001 — one failure should not abort the other concurrent tasks
        return False, str(e)


if __name__ == "__main__":
    main()
```

## モデルの切り替え方法

モデルの切り替えは、6つの値のいずれかである **`--model`** を変更するだけです。

```text theme={null}
... gpt_image.py "prompt"                              # default gpt-image-2.5-flare (official, speed-first)
... gpt_image.py "make it watercolor" -i in.png --model gpt-image-2.5-sunburst   # official, editing-first
... gpt_image.py "prompt" --model gpt-image-2            # official, previous generation
... gpt_image.py "prompt" --model gpt-image-2.5-all      # reverse, ChatGPT web 2.5
... gpt_image.py "prompt" --model gpt-image-2-all      # reverse, fastest, cheapest
... gpt_image.py "prompt" --model gpt-image-2-vip --size 3840x2160   # reverse, locked 4K
```

デフォルトのチャンネルを変更する（毎回 `--model` を渡さないようにする）には、`gpt-image-2/.env` に次の行を追加します。

```bash theme={null}
APIYI_IMAGE_MODEL=gpt-image-2-all
```

<Info>
  スクリプトは base64 と URL のレスポンスの**両方を**自動的に処理します（リバースモデルの `b64_json` には `data:image;base64,` プレフィックスが含まれており、スクリプトがこれを取り除きます）。**URL 出力が必須の場合に限り**、APIYI コンソールでトークンの課金グループを `image2_OSS` に切り替えてください。通常の生成では必要ありません。
</Info>

## なぜ1文で画像が生成されるのか

多くの人がこう疑問に思います。コマンドを一度も入力していないのに、どうして「猫を描いて」で画像が生成されたのでしょうか？

仕組みはこうです。起動時に、Agent は **各スキルの `SKILL.md` から `description` をまず読み取ります**（これは「このスキルが何をするか、いつ使うか」を説明する、とても短いメタデータです）。あなたのリクエストがそのシナリオに **一致する** 場合（たとえば「画像を描く / 生成する / レンダリングする」、「これらの画像を合成する」など）、Agent は **自動的にそのスキルを呼び出すことを決定し**、`SKILL.md` 全体を読み取り、スクリプトを実行します。しかも、あなたがどのコマンドも覚えていなくてよいように、すべて自動で行われます。

Agent に推測してほしくない場合や **完全に制御したい** 場合は、以下の **明示的な呼び出し** を使ってください。

## 使用方法

### 自然言語（暗黙のトリガー）

インストール後は、エージェントに話しかけるだけです。

| 入力内容                              | スキルの動作                                                 |
| --------------------------------- | ------------------------------------------------------ |
| 「映画のワンシーンのような猫を描いて」               | デフォルトの gpt-image-2.5-flare、1 png                       |
| 「高速かつ低コストでポスターを作成して」              | エージェントが `--model gpt-image-2-all` を追加                  |
| 「4Kの夜の都市景観をレンダリングして」              | エージェントが `--model gpt-image-2-vip --size 3840x2160` を追加 |
| 「person.png の人物を scene.png に配置して」 | `-i person.png -i scene.png` を実行し、画像を合成                |

### 明示的な呼び出し（より細かい制御）

* **スラッシュコマンドに対応するエージェント**（例：Claude Code）：

  ```text theme={null}
  /gpt-image-2 Cyberpunk city rainy night, neon sign close-up --model gpt-image-2-vip --size 2048x1152
  ```

* **任意のエージェント／スクリプトを実行するよう指示するだけ**（最も汎用的）：

  ```text theme={null}
  Run python3 gpt-image-2/scripts/gpt_image.py "Cyberpunk city rainy night, neon sign close-up" --model gpt-image-2-all
  ```

## 生成された画像の保存先

* `-o` が **bare filename**（例: `-o cat.png`）の場合、画像はすべて **プロジェクトルートの `gpt-image-output/` フォルダ** に保存されます（自動で作成されます）。そのため、プロジェクト内のその場所ですぐに見つかります。
* 「Project root」とは、スクリプト自身の場所から上位にたどって見つかる `.git` または `.claude` を含む最初のディレクトリです。つまり、エージェントがどのディレクトリから実行されても、画像はプロジェクト内に保存され、見つけられない一時ディレクトリには保存されません。
* スクリプトは、画像ごとに完全な絶対パスを 1 つずつ出力します。例: `Image saved to /Users/you/project/gpt-image-output/cat.png`。
* デフォルトでは **1 枚だけ** 生成します。`-n 3` では一度に 3 枚生成されます（最大 5 枚）し、`-1`、`-2`、`-3` のサフィックスが自動で追加されます。
* `-o` が **ディレクトリを含むパス**（例: `-o images/cat.png` や絶対パス）の場合は、その正確なパスに保存され、`gpt-image-output/` には保存されません。
* 編集 / フュージョンも同じ仕組みです。出力は新しいファイルになり、**元のファイルは上書きされません**。

## 関連ドキュメント

* [GPT-Image-2-All エージェントスキル](/ja/api-capabilities/gpt-image-2-all/skills)（リバース、最速）
* [GPT-Image-2-VIP エージェントスキル](/ja/api-capabilities/gpt-image-2-vip/skills)（リバース、4K固定）
* [GPT-Image-2 画像生成の概要](/ja/api-capabilities/gpt-image-2/overview)
* [Nano Banana Pro エージェントスキル](/ja/api-capabilities/nano-banana-image/skills)
