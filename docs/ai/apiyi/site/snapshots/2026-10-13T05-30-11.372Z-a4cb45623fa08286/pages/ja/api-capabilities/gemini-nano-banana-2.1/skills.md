> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana 2.1 エージェントスキル

> Nano Banana 2.1（gemini-nano-banana-2.1）をすぐに使えるエージェントスキルとしてパッケージ化します。Codex、OpenClaw、hermes-agent、Claude Code、その他任意のコーディングエージェントに導入すれば、1つの prompt で APIYI を呼び出し、テキストからの画像生成や画像編集を実行できます。

<Note>
  このページでは、**すぐに使えるAgent Skill**を提供しています。普段お使いのコーディングAgentに組み込むだけで、自然言語（または明示的なコマンド）を使用してAPIYIプラットフォーム上の**Nano Banana 2.1**（`gemini-nano-banana-2.1`）を呼び出し、画像生成や編集を行えます。構成はわずか2つのファイルのみで、コピーしてすぐに使い始められます。
</Note>

<Tip>
  代わりに**Pro**スキル（`gemini-3-pro-image`、最高峰のクオリティ）をご希望の場合は、[Nano Banana Pro Agent Skill](/ja/api-capabilities/nano-banana-image/skills)をご覧ください。本ページで扱うのは**Nano Banana 2.1**（画質とテキストレンダリングが向上したNano Banana 2のアップグレード版）です。以前のバージョンをお使いの場合は、[Nano Banana 2 Agent Skill](/ja/api-capabilities/nano-banana-2-image/skills)をご覧ください。
</Tip>

## このスキルの機能

単一の統合スキルです。スクリプトが**入力画像を渡したかどうか**を自動検出し、テキストからの画像生成と画像編集を切り替えます。

<CardGroup cols={3}>
  <Card title="テキストから画像生成" icon="wand-sparkles">
    promptのみ → **14種類のアスペクト比**と1K/2K/4K解像度に対応した、まったく新しい画像を生成。
  </Card>

  <Card title="画像編集" icon="image">
    画像1枚 + 指示 → 部分編集、スタイル変換、背景の置き換えなど。
  </Card>

  <Card title="複数画像の合成" icon="layers">
    複数画像 + 指示1つ → 合成、比較、衣装の着せ替えなど。
  </Card>
</CardGroup>

Proと比較して、Nano Banana 2.1では4つの**超縦長/超横長**アスペクト比（`1:4 / 4:1 / 1:8 / 8:1`）が追加されており、1回の呼び出しあたりわずか\$0.045/画像（1K / 2K / 4Kすべて同価格）で利用できるため、大量処理により適しています。なお、**512pxには非対応**ですのでご注意ください。サムネイル用の解像度が必要な場合はNano Banana 2をご利用ください。

## どのAgentが利用できるか

<Info>
  Skillは本質的に単なる**フォルダー**です。Agentが読み取る一連の指示（`SKILL.md`）と、実際の処理を行うスクリプトで構成されています。そのため、**ローカルファイルを読み取ってシェルコマンドを実行できるコーディングAgentであれば、どれでも利用可能です**。たとえば、**Codex、OpenClaw、hermes-agent、Claude Code**などが挙げられます。

  唯一の要件は、Agentを実行するマシン（お使いのコンピューターまたはサーバー）に**Python 3**がインストールされており、**ネットワークアクセス**があること（スクリプトが`api.apiyi.com`を直接呼び出します）だけです。これだけであり、特定のAgentに依存することはありません。
</Info>

## 3つのステップでセットアップ

### ① フォルダを作成してファイルを配置する

次の2つのファイルを含むスキルフォルダを作成します（完全な内容は次の2つのセクションに記載されています）：

```
nano-banana-2-1/
├── SKILL.md
├── scripts/
│   └── nano_banana_2_1.py
└── .env          # created in step ②, holds your key
```

### ② 同じフォルダにキーを配置する

**APIYI API Key**（`api.apiyi.com`コンソールで作成）を`nano-banana-2-1/.env`に書き込みます：

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

スクリプトはこの`.env`からキーを自動的に読み取ります。**追加の設定や環境変数は不要です**。

<Warning>
  `.env`にはシークレットキーが保持されます。このスキルをプロジェクトリポジトリ経由で共有する場合は、**必ず`.env`を`.gitignore`に追加し、絶対にgitへコミットしないでください**。
</Warning>

### ③ エージェントに渡す

* **スキルを自動検出するエージェント**（Claude Codeなど）：`nano-banana-2-1/`フォルダ全体をそのスキルディレクトリ（個人用の`~/.claude/skills/`、またはリポジトリ経由で共有するプロジェクトレベルの`.claude/skills/`）に配置します。
* **その他のエージェント**：各エージェント独自のスキル/プラグインの規則に従って配置します。あるいは最も簡単な方法として、**「このフォルダにあるSKILL.mdを読み込んで、それに従ってください」とエージェントに指示するだけ**です。

インストールが完了すれば準備完了です。具体例については[使い方](#how-to-use-it)をご覧ください。

## SKILL.md

以下のすべての内容を含めて `nano-banana-2-1/SKILL.md` を作成します（`description` には「何をするのか + いつ使用するのか」を記述し、エージェントはこれをもとに自動トリガーを行います）：

````markdown theme={null}
---
name: nano-banana-2-1
description: Generate or edit images via APIYI's Nano Banana 2.1 (gemini-nano-banana-2.1) model. Use this when the user asks to create, draw, render, or generate an image/illustration/poster, or to edit, retouch, restyle, or composite existing images.
allowed-tools: Bash(python3 *)
---

# Nano Banana 2.1 Image Skill

Generate or edit images through the APIYI platform using Nano Banana 2.1 (`gemini-nano-banana-2.1`) — an upgrade to Nano Banana 2 with better quality, text rendering and multi-turn consistency; the 512 resolution is not supported.

## Key configuration

The script auto-reads `APIYI_API_KEY` from a `.env` file in the skill folder (an environment variable of the same name also works).
If the script reports "no key found", ask the user to add a line `APIYI_API_KEY=sk-xxx` to `.env`.

## Usage

Call the script in the same directory. The first argument is the prompt; for editing, pass one or more local image paths with `-i`:

```bash
# テキストから画像生成（デフォルトで1枚）
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2_1.py "A shiba inu wearing an astronaut helmet, cinematic lighting" -o dog.png --size 2K --aspect 16:9

# ウルトラワイドバナー（Nano Banana 2.1専用の8:1 / 4:1ウルトラワイド比率）
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2_1.py "Chinese ink long-scroll banner" -o banner.png --aspect 8:1 --size 2K

# 画像編集（画像1枚）
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2_1.py "Replace the background with a cyberpunk night city" -i input.jpg -o edited.png

# 複数画像の合成（-i を複数回指定）
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2_1.py "Composite these two people into one office group photo" -i a.png -i b.png -o merged.png

# 同一promptから一度に複数のバリエーションを生成（最大5枚、同時に生成）
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2_1.py "Chinese ink landscape illustration" -o landscape.png -n 3 --aspect 16:9
```

Arguments:

- 1st positional arg: the prompt (required).
- `-i / --image`: input image path, repeatable; omitted = text-to-image, present = image editing.
- `-o / --out`: output filename, defaults to `output.png`.
- `-n / --count`: how many images at once, **default 1**, max 5 (generated concurrently in-script; anything above is auto-clamped to 5). When `-n>1`, a `-1` `-2`… suffix is added automatically.
- `--aspect`: aspect ratio, one of 14 (`1:1` `1:4` `4:1` `1:8` `8:1` `2:3` `3:2` `3:4` `4:3` `4:5` `5:4` `9:16` `16:9` `21:9`), defaults to `1:1`.
- `--size`: resolution `1K` / `2K` / `4K`, defaults to `2K`.

## Number of images (important)

- **Default to a single image**: when the user does not explicitly ask for several, leave `-n` at its default (i.e. omit it) and generate just 1.
- **Only generate multiple when asked**: use `-n` only when the user says "give me 3 / a few / several versions", and **never exceed 5 at once**. If more are needed, call the script multiple times; do not try to bypass the limit.
- Multiple images are concurrent variants of the same prompt (the model is stochastic, so each differs).

## Output location (important)

- When `-o` is a **bare filename** (e.g. `dog.png`), images are all saved into a **`nano-banana-2-1-output/` folder at the project root**, so the user can find them in the project easily.
- When `-o` is a **path with a directory** (relative or absolute, e.g. `images/dog.png` or `/abs/path/dog.png`), it is saved at that exact path (relative paths are relative to the current working directory).
- Do not write images to `/tmp`, scratchpad, or other temp directories — the user won't find them.

## After running

The script prints one full path per image — report them all back to the user as-is. If the script reports a content-safety rejection, relay the reason as-is and do not retry the same prompt.
````

<Tip>
  `name` は小文字の英字 + ハイフンで構成する必要があり、**`claude` / `anthropic` などの予約語を含めてはなりません**。スラッシュコマンドをサポートするエージェントでは、ディレクトリ名がコマンドになります（`nano-banana-2-1` は `/nano-banana-2` になります）。`${CLAUDE_SKILL_DIR}` は Claude Code から提供されるスキルディレクトリ変数です。他のエージェントではスクリプトの実際のパスを使用してください。
</Tip>

## scripts/nano\_banana\_2\_1.py

Geminiネイティブ形式を使用して`nano-banana-2-1/scripts/nano_banana_2_1.py`を作成します（APIYIのテキストから画像生成 / 画像編集リファレンスページにある、検証済みの動作するコードと同じです）。**純粋なPython標準ライブラリ — `pip install`は不要です**:

```python theme={null}
#!/usr/bin/env python3
"""Generate / edit images via APIYI's Nano Banana 2.1 (gemini-nano-banana-2.1). Stdlib only, zero deps."""
import argparse
import base64
import json
import os
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

# Max images generated concurrently per call (a boundary to avoid firing too many requests at once)
MAX_COUNT = 5


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


def to_b64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()


def mime_of(path):
    return "image/png" if path.lower().endswith(".png") else "image/jpeg"


def generate(api_key, endpoint, prompt, images, aspect, size):
    """Make one request, return image bytes; raise RuntimeError on failure."""
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
        raise RuntimeError(f"Request failed HTTP {e.code}: {e.read().decode(errors='replace')}")

    candidates = resp.get("candidates")
    if not candidates:
        raise RuntimeError(f"No candidate returned (may be blocked by content safety): {resp}")

    cand = candidates[0]
    # Safety rejection: finishReason not STOP, or only text returned
    if cand.get("finishReason") not in (None, "STOP"):
        text = next((p.get("text") for p in cand["content"]["parts"] if p.get("text")), "")
        raise RuntimeError(f"Request rejected (finishReason={cand.get('finishReason')}): {text}")

    image_part = next((p for p in cand["content"]["parts"] if p.get("inlineData")), None)
    if not image_part:
        text = next((p.get("text") for p in cand["content"]["parts"] if p.get("text")), "")
        raise RuntimeError(f"No image returned, model said: {text}")

    return base64.b64decode(image_part["inlineData"]["data"])


def resolve_paths(out, count):
    """Decide the list of output paths.
    - If out has a directory component (relative/absolute), use it as given (relative => cwd).
    - If out is a bare filename, save under <project_root>/nano-banana-2-1-output/ so it's easy to find.
    With count>1, append a -1 / -2 ... suffix.
    """
    if os.path.dirname(out):
        base_path = os.path.abspath(out)
    else:
        out_dir = os.path.join(project_root(), "nano-banana-2-1-output")
        os.makedirs(out_dir, exist_ok=True)
        base_path = os.path.join(out_dir, out)

    if count == 1:
        return [base_path]
    base, ext = os.path.splitext(base_path)
    return [f"{base}-{i}{ext}" for i in range(1, count + 1)]


def main():
    api_key = load_api_key()
    if not api_key:
        sys.exit("No API key found: add a line APIYI_API_KEY=sk-xxx to the .env in the skill folder")

    model = os.environ.get("APIYI_IMAGE_MODEL", "gemini-nano-banana-2.1")
    endpoint = f"https://api.apiyi.com/v1beta/models/{model}:generateContent"

    parser = argparse.ArgumentParser(description="Nano Banana 2.1 image generation")
    parser.add_argument("prompt", help="Prompt / edit instruction")
    parser.add_argument("-i", "--image", action="append", default=[],
                        help="Input image path (repeatable; presence = edit mode)")
    parser.add_argument("-o", "--out", default="output.png", help="Output filename")
    parser.add_argument("-n", "--count", type=int, default=1,
                        help=f"How many images at once, default 1, max {MAX_COUNT} (concurrent)")
    parser.add_argument("--aspect", default="1:1", help="Aspect ratio (14 options), e.g. 16:9 / 1:4 / 8:1")
    parser.add_argument("--size", default="2K", help="Resolution 1K / 2K / 4K")
    args = parser.parse_args()

    count = args.count
    if count < 1:
        count = 1
    if count > MAX_COUNT:
        print(f"Note: max {MAX_COUNT} at once; clamped {args.count} to {MAX_COUNT}.", file=sys.stderr)
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

<Tip>
  デフォルトのモデル名は`gemini-nano-banana-2.1`です。一時的に以前のバージョンへ切り替えるには、`APIYI_IMAGE_MODEL=gemini-3.1-flash-image`を設定してください（以前のバージョンは`--size 512`もサポートしています）。
</Tip>

## なぜ一文で画像が生成されるのか

「コマンドを入力した覚えはないのに、なぜ『猫を描いて』だけで画像が生成されたのだろう？」と疑問に思う方は少なくありません。

仕組みは以下のとおりです。起動時に、Agentは**まず各スキルの`SKILL.md`から`description`を読み込みます**（「このスキルが何を行い、いつ使用するか」を説明する非常に短いメタデータです）。リクエストがそのシナリオに**一致**すると（例：「画像を描く／生成する／レンダリングする」、「この画像を〜に編集する」など）、Agentは**スキルの呼び出しを自動的に判断**し、完全な`SKILL.md`を読み込んでスクリプトを実行します。ユーザーがコマンドを覚えておく必要は一切ありません。

つまり：

* **適切に記述された`description` ＝ より正確な自動トリガー。** このスキルの説明には、「画像を生成／描画／編集／合成する」といった表現がすでに網羅されています。
* Agentの推測に頼らず**完全に制御**したい場合は、以下の**明示的な呼び出し**を使用してください。

## 使用方法

### 自然言語（暗黙的トリガー）

インストール後は、Agentに話しかけるだけです：

| 指示内容 | スキルの動作 |
| - | - |
| 「Nano Banana 2で16:9の雪山と日の出のポスターを描いて」 | スクリプトを実行（`-i`なし）、png 1枚 |
| 「8:1の超ワイドな中国風バナーを作成して」 | `--aspect 8:1`を実行、超ワイドpng 1枚 |
| 「異なる水墨画風の風景画を3枚作成して」 | `-n 3`を実行、png 3枚を同時に生成 |
| 「被写体を強調するためにphoto.jpgの背景をぼかして」 | `-i photo.jpg`を実行、png 1枚 |

### 明示的な呼び出し（より詳細な制御）

Agentに自動で判断させたくない場合は、2つの明示的な方法があります：

* **スラッシュコマンドをサポートするAgent**（例：Claude Code）：

  ```text theme={null}
  /nano-banana-2-1 An orange cat napping in a garden, oil painting style --size 2K --aspect 3:2
  ```

* **任意のAgent / スクリプトの実行を直接指示**（最も汎用的な方法）：

  ```text theme={null}
  Run python3 nano-banana-2-1/scripts/nano_banana_2_1.py "An orange cat napping in a garden, oil painting style" --size 2K --aspect 3:2
  ```

<Tip>
  **アスペクト比と鮮明度の制御方法**：アスペクト比には`--aspect`を使用し（Proにはない`1:4 / 4:1 / 1:8 / 8:1`の超縦長・超横長を含む14の選択肢）、解像度には`--size`を使用します（`1K` / `2K` / `4K`。`512`は非対応）。「縦向き 9:16」、「4Kでレンダリング」、「超ワイドバナーを作成」と伝えるだけで、Agentがこれらのフラグを自動的に追加します。
</Tip>

## 生成された画像の保存先

* `-o` が**ファイル名のみ**（例: `-o dog.png`）の場合、画像はすべて**プロジェクトルートの `nano-banana-2-1-output/` フォルダ**（自動作成）に保存されるため、プロジェクト内ですぐに見つけることができます。
* 「プロジェクトルート」とは、スクリプト自身の場所から上位ディレクトリへと遡って最初に見つかる `.git` または `.claude` を含むディレクトリのことです。そのため、**Agent がどのディレクトリから実行されても、画像は確実にプロジェクト内に保存され**、見つからない一時ディレクトリに保存されることはありません。
* スクリプトは**画像ごとに1つの完全な絶対パスを出力します**（例: `Image saved to /Users/you/project/nano-banana-2-1-output/dog.png`）。
* デフォルトでは**1枚の画像のみ**を生成します。`-n 3` は一度に3枚を生成し（最大5枚、それ以上は5枚に制限されます）、自動的に `-1`、`-2`、`-3` のサフィックスが付加されます。
* `-o` が**ディレクトリを含むパス**（例: `-o images/dog.png` や絶対パス）の場合、その指定された正確なパスに保存され（相対パスは現在の作業ディレクトリ基準となります）、`nano-banana-2-1-output/` には保存されません。
* 画像編集も同様に動作します。出力は新しいファイルとなり、**元のファイルが上書きされることはありません**。

<Info>
  Nano Banana 2.1 には厳格なコンテンツ安全性制御が備わっています。スクリプトが `STOP` 以外の `finishReason` を報告した場合や拒否メッセージを返した場合は、内容を適切に調整し、違反となる同じ prompt を何度も再試行しないでください。
</Info>

## 関連ドキュメント

* [Nano Banana 2.1 画像生成の概要](/ja/api-capabilities/gemini-nano-banana-2.1/overview)
* [Text-to-Image API リファレンス](/ja/api-capabilities/gemini-nano-banana-2.1/text-to-image)
* [画像編集 API リファレンス](/ja/api-capabilities/gemini-nano-banana-2.1/image-edit)
* [Nano Banana Pro エージェントスキル](/ja/api-capabilities/nano-banana-image/skills)
* [Nano Banana の料金](/ja/api-capabilities/nano-banana-pricing)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.