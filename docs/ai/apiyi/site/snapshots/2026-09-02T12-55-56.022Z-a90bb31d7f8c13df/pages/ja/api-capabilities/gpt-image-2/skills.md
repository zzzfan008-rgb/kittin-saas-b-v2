> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image-2 シリーズ Agent Skill

> gpt-image-2（公式）に gpt-image-2-all / gpt-image-2-vip（逆向き）をまとめ、すぐ使える 1 つの Agent Skill にしたものです。Codex、OpenClaw、hermes-agent、Claude Code、または任意のコーディング Agent にそのまま組み込み、--model でチャネルを切り替えて、テキストから画像生成、複数画像融合、インペインティングを行えます。

<Note>
  このページでは、**すぐに使える Agent Skill** を提供します。1つのスクリプトで、**gpt-image-2 (公式)**、**gpt-image-2-all**、**gpt-image-2-vip**（リバース）の3つのチャネルすべてをカバーします。いずれも同じ OpenAI Images API を使用し、違うのは`--model`だけです。既に使っているコーディング Agent にそのまま入れて、1つの prompt で画像を生成できます。必要なのはたった2ファイルです。
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

## どのモデルを選ぶか

3つのチャネルはすべて**同じ名称で呼ばれます**が、ソースチャネル、価格/速度、そしてどの params が反映されるかだけが異なります。スクリプトは`--model`によってこれらの違いを自動的に処理します:

| モデル（`--model`）        | チャネル           | 価格                        | 速度              | `size`         | `quality` / `mask` | 適している用途                     |
| --------------------- | -------------- | ------------------------- | --------------- | -------------- | ------------------ | --------------------------- |
| `gpt-image-2` (デフォルト) | 公式パススルー        | tokenベース \~\$0.03–0.2/img | \~100–120s      | ✅ 任意のプリセット     | ✅ はい               | 品質階層、マスク補完、透明背景             |
| `gpt-image-2-all`     | リバース（ChatGPT系） | 一律 \$0.03/img             | **最速 \~30–60s** | ❌ prompt に書き込む | ❌                  | 大量処理、速度、prompt テキストによるサイズ指定 |
| `gpt-image-2-vip`     | リバース（Codex系）   | 一律 \$0.03/img             | \~90–150s       | ✅ 4K を含む 30 段階 | ❌                  | 出力サイズ固定 / 低価格で 4K           |

<Tip>
  簡単な目安: **高速かつ安価** → `gpt-image-2-all`; **サイズ固定/4K かつ安価** → `gpt-image-2-vip`; **品質階層、マスク補完** → `gpt-image-2`（公式）。
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

以下の完全な内容で`gpt-image-2/SKILL.md`を作成してください（`description` には「what it does + when to use it」と記載します。これは Agent が自動起動に使用するものです）:

````markdown theme={null}
---
name: gpt-image-2
description: Generate or edit images via APIYI's gpt-image-2 (official) and gpt-image-2-all / gpt-image-2-vip (reverse) models. Use this when the user asks to create, draw, render, or generate an image/illustration/poster, or to edit, retouch, restyle, fuse, or inpaint existing images.
allowed-tools: Bash(python3 *)
---

# GPT-Image-2 Series Image Skill

Generate or edit images through the APIYI platform using the gpt-image-2 series. One script covers three channels, switched by `--model`:

- `gpt-image-2` (default, official): supports `size` / `quality` / `mask` inpainting; token-based billing.
- `gpt-image-2-all` (reverse, ChatGPT line): fastest, flat \$0.03/img; **no `size`/`quality`** — put size in the prompt.
- `gpt-image-2-vip` (reverse, Codex line): can lock `size` (30 tiers incl. 4K), flat \$0.03/img; **no `quality`/`mask`**.

## Key configuration

The script auto-reads `APIYI_API_KEY` from a `.env` file in the skill folder (an environment variable of the same name also works).
The script depends on the OpenAI SDK; if it reports a missing package, ask the user to run `pip install openai`.

## Usage

The first argument is the prompt; for editing/fusion, pass one or more local image paths with `-i`:

```bash
# テキストから画像へ（デフォルトは高品質の gpt-image-2 公式版）
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "サングラスをかけたオレンジ色の猫が海辺のバーにいる、シネマティック" -o cat.png --size 1536x1024 --quality high

# 最速かつ最安：'all' の逆（サイズは prompt に入れ、size は渡さない）
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "フラットイラストのフェスティバルポスター、縦長 2:3" -o poster.png --model gpt-image-2-all

# 固定された 4K が必要：'vip' の逆
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "空撮の都市夜景" -o city.png --model gpt-image-2-vip --size 3840x2160

# 複数画像の融合（最大 16 枚、-i を繰り返す）
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "画像 1 の人物を画像 2 のシーンに入れ、画像 3 の色を保ってください" -i person.png -i scene.png -i style.png -o fused.png

# インペインティング（マスク、gpt-image-2 公式のみ）
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "マスクされた領域を丸い窓に置き換える" -i room.png --mask mask.png -o edited.png

# まとめて複数回（最大 5、同時実行）
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "フェスティバルポスターの下書き" -o draft.png -n 3 --model gpt-image-2-all
```

Arguments:

- 1st positional arg: the prompt (required).
- `--model`: `gpt-image-2` (default) / `gpt-image-2-all` / `gpt-image-2-vip`. You can also set a default with `APIYI_IMAGE_MODEL=...` in `.env`.
- `-i / --image`: input image path, repeatable (up to 16); omitted = text-to-image, present = edit/fusion.
- `-o / --out`: output filename, defaults to `output.png`.
- `-n / --count`: how many at once, **default 1**, max 5 (client-side concurrency; the script never sends `n`, avoiding per-image overbilling on reverse channels).
- `--size`: size, default `auto` (`gpt-image-2-all` ignores it — write size/ratio into the prompt).
- `--quality`: `low`/`medium`/`high`/`auto`, **only effective on `gpt-image-2` official** (the script omits it for reverse models).
- `--format`: `png`/`jpeg`/`webp`, official only.
- `--mask`: mask image, official edit only (PNG with alpha, applies to the first image).
- `--background`: `transparent`/`opaque`/`auto`, official only. With `transparent`, `--format` must be `png` or `webp`.

## Choice & red lines (important)

- **Default `gpt-image-2` (official)**: use it for quality tiers and mask inpainting.
- **Fast/cheap** → `gpt-image-2-all`; **locked size/4K** → `gpt-image-2-vip`.
- For reverse models (all/vip), **never pass `quality`**; for **`gpt-image-2-all` never pass `size`** (put it in the prompt). The script gates this automatically, but follow it when calling the script directly too.
- **Transparent backgrounds**: only official `gpt-image-2` has a `background` parameter. Add `--background transparent` to get a real alpha-channel image (`--format` must be `png`/`webp`). The reverse models all/vip have no such parameter — you can only ask for it in the prompt, and it is occasionally unreliable.

## Number of images & cost

- **Default to a single image**; use `-n` only when the user explicitly asks, max 5.
- Reverse all/vip are flat \$0.03/img; official gpt-image-2 is token-based and `--quality high` is pricier (~\$0.21/img at 1K) — drop to `medium`/`low` or use a reverse model when budget matters.

## Output location (important)

- A **bare filename** for `-o` saves into a **`gpt-image-output/` folder at the project root**; a **path with a directory** is saved as given.
- Do not write images to `/tmp`, scratchpad, or other temp directories — the user won't find them.

## After running

The script prints one full path per image — report them all back to the user. If a request is rejected by moderation, relay the reason as-is and do not retry the same prompt.
````

<Tip>
  `name` は小文字の英字 + ハイフンでなければなりません。スラッシュコマンドに対応した Agent では、ディレクトリ名がコマンドになります — `gpt-image-2` は `/gpt-image-2` になります。`${CLAUDE_SKILL_DIR}` は Claude Code が提供する skill-directory 変数です。ほかの Agent ではスクリプトの実際のパスをそのまま使ってください。
</Tip>

## scripts/gpt\_image.py

`gpt-image-2/scripts/gpt_image.py` を、APIYI（`base_url="https://api.apiyi.com/v1"`）を指す OpenAI SDK を使って作成します:

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
    "gpt-image-2":     {"size": True,  "quality": True,  "output_format": True,  "mask": True,  "background": True},   # official
    "gpt-image-2-all": {"size": False, "quality": False, "output_format": False, "mask": False, "background": False},  # reverse, ChatGPT
    "gpt-image-2-vip": {"size": True,  "quality": False, "output_format": False, "mask": False, "background": False},  # reverse, Codex
}


def caps_of(model):
    # Unknown models fall back to the official capability set
    return MODEL_CAPS.get(model, MODEL_CAPS["gpt-image-2"])


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

    default_model = os.environ.get("APIYI_IMAGE_MODEL", "gpt-image-2")
    # Synchronous blocking call; image generation is slow, so give a generous 360s timeout
    client = OpenAI(api_key=api_key, base_url="https://api.apiyi.com/v1", timeout=360)

    parser = argparse.ArgumentParser(description="gpt-image-2 series image generation")
    parser.add_argument("prompt", help="Prompt / edit instruction")
    parser.add_argument("--model", default=default_model,
                        help="gpt-image-2 (official) / gpt-image-2-all (fastest) / gpt-image-2-vip (lockable size)")
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

チャンネルの切り替えは **`--model`** だけで、3つの値のうちの1つです:

```text theme={null}
... gpt_image.py "prompt"                              # default gpt-image-2 (official)
... gpt_image.py "prompt" --model gpt-image-2-all      # reverse, fastest, cheapest
... gpt_image.py "prompt" --model gpt-image-2-vip --size 3840x2160   # reverse, locked 4K
```

既定のチャンネルを変更するには（毎回 `--model` を渡さなくて済むように）、`gpt-image-2/.env` に1行追加します:

```bash theme={null}
APIYI_IMAGE_MODEL=gpt-image-2-all
```

<Info>
  スクリプトは base64 と URL の両方のレスポンスを自動的に**処理します**（逆方向モデルの `b64_json` には `data:image;base64,` プレフィックスが付いており、スクリプトがそれを取り除きます）。**URL 出力を厳密に必要とする** 場合にのみ、APIYI コンソールで token の課金グループを `image2_OSS` に切り替える必要があります。通常の生成では必要ありません。
</Info>

## なぜ1文で画像が生成されるのか

多くの人がこう疑問に思います。コマンドを一度も入力していないのに、どうして「猫を描いて」で画像が生成されたのでしょうか？

仕組みはこうです。起動時に、Agent は **各スキルの `SKILL.md` から `description` をまず読み取ります**（これは「このスキルが何をするか、いつ使うか」を説明する、とても短いメタデータです）。あなたのリクエストがそのシナリオに **一致する** 場合（たとえば「画像を描く / 生成する / レンダリングする」、「これらの画像を合成する」など）、Agent は **自動的にそのスキルを呼び出すことを決定し**、`SKILL.md` 全体を読み取り、スクリプトを実行します。しかも、あなたがどのコマンドも覚えていなくてよいように、すべて自動で行われます。

Agent に推測してほしくない場合や **完全に制御したい** 場合は、以下の **明示的な呼び出し** を使ってください。

## 使い方

### 自然言語（暗黙のトリガー）

インストール後は、エージェントに話しかけるだけです:

| 言うこと                                 | Skill の動作                                                 |
| ------------------------------------ | --------------------------------------------------------- |
| 「gpt-image-2 でシネマティックな猫を描いて」         | デフォルトで gpt-image-2、png 1枚                                 |
| 「ポスターを、速くて安く作って」                     | エージェントが `--model gpt-image-2-all` を追加します                  |
| 「4K の都市の夜景をレンダリングして」                 | エージェントが `--model gpt-image-2-vip --size 3840x2160` を追加します |
| 「person.png の人物を scene.png のシーンに入れて」 | `-i person.png -i scene.png` を実行し、融合画像を生成します              |

### 明示的な呼び出し（より細かく制御）

* **スラッシュコマンドに対応しているエージェント**（例: Claude Code）:

  ```text theme={null}
  /gpt-image-2 Cyberpunk city rainy night, neon sign close-up --model gpt-image-2-vip --size 2048x1152
  ```

* **任意のエージェント / スクリプトを実行するよう指示するだけ**（最も汎用的）:

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
