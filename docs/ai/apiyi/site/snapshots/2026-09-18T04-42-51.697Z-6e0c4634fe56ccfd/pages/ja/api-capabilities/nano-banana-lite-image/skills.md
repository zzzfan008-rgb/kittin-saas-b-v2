> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Lite エージェントスキル

> Nano Banana 2 Lite (gemini-3.1-flash-lite-image) を、すぐに使えるエージェントスキルとしてパッケージ化します。Codex、OpenClaw、hermes-agent、Claude Code、または任意のコーディングエージェントにそのまま組み込み、1文で APIYI のプラットフォームを呼び出して、テキストから画像生成と画像編集を行えます。

<Note>
  このページでは、**すぐに使える Agent Skill** を提供します。すでにお使いのコーディングエージェントにそのまま入れるだけで、APIYI の **Nano Banana 2 Lite**（`gemini-3.1-flash-lite-image`）を自然言語（または明示的なコマンド）で呼び出して、画像を生成・編集できます。全体はたった 2 ファイルで、コピーしてすぐ使えます。
</Note>

<Tip>
  もっと高品質や 2K/4K が必要な場合は、[Nano Banana 2 Agent Skill](/ja/api-capabilities/nano-banana-2-image/skills)（最大 4K）または [Nano Banana Pro Agent Skill](/ja/api-capabilities/nano-banana-image/skills)（最高品質）をご覧ください。このページは **Lite** 版で、最速かつ最安、1K に特化しており、\$0.025/画像/回の課金です。
</Tip>

## このスキルの内容

1つに統合されたスキル — スクリプトが**画像が渡されたかどうか**を自動判定し、「テキストから画像生成」と「画像編集」を切り替えます：

<CardGroup cols={3}>
  <Card title="Text-to-Image" icon="wand-sparkles">
    プロンプトのみ → 完全に新しい画像を生成し、**14種類のアスペクト比**、1Kキャンバス、1枚あたり約4秒に対応します。
  </Card>

  <Card title="Image Editing" icon="image">
    画像1枚 + 指示を渡す → 局所編集、スタイル転写、背景置換などを行います。
  </Card>

  <Card title="Multi-Image Compositing" icon="layers">
    複数の画像 + 1つの指示を渡す → 合成、比較、衣装の差し替えなどを行います。
  </Card>
</CardGroup>

Nano Banana 2 Lite は**速度とコスト**を重視して設計されています。1枚あたり約4秒、Nano Banana 2 より約2.7倍高速で、トークンベースの平均では実運用で約\$0.018/回（Google の料金の40%）、1回あたり \$0.025/画像です。高い同時実行数、迅速な反復、大量処理に最適です。

## どのエージェントが使用できますか

<Info>
  Skill は本質的には**フォルダ**にすぎません: エージェント向けに書かれた説明（`SKILL.md`）+ 実際の作業を行うスクリプトです。したがって、**ローカルファイルを読み取り、コマンドラインを実行できるコーディングエージェントなら、どれでも使用できます** — たとえば **Codex, OpenClaw, hermes-agent, Claude Code** などです。

  必要条件は1つだけです: エージェントを実行するマシン（お使いのコンピューターまたはサーバー）に **Python 3** がインストールされており、**インターネットアクセス** があることです（スクリプトは `api.apiyi.com` に直接接続します）。それだけです — 特定のエージェントは必要ありません。
</Info>

## 3ステップでインストール

### ① フォルダを作成し、ファイルを貼り付けます

スキルフォルダを作成し、下の 2 つのファイルを追加します（完全な内容は次の 2 セクションにあります）:

```
nano-banana-lite/
├── SKILL.md
├── scripts/
│   └── nano_banana_lite.py
└── .env          # created in step ②, holds your Key
```

### ② 同じフォルダに Key を書き込みます

`nano-banana-lite/.env` に、`api.apiyi.com` コンソールで作成した **APIYI の API キー** を追加します:

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

スクリプトはこの `.env` からキーを自動的に読み込みます — **追加の設定や環境変数は不要です**。

<Warning>
  `.env` は秘密鍵を保存する場所です。このスキルをプロジェクトリポジトリと共有する場合は、**`.env` を `.gitignore` に追加し、git に絶対にコミットしないようにしてください**。
</Warning>

### ③ エージェントに渡します

* **スキルの自動検出に対応したエージェント**（Claude Code など）は、`nano-banana-lite/` フォルダ全体をスキルディレクトリに入れます。ユーザーレベルの `~/.claude/skills/` またはプロジェクトレベルの `.claude/skills/`（リポジトリと共有）に置いてください。
* **その他のエージェント**: それぞれの skill/plugin の規約に従って配置します。あるいは、いちばん簡単なのは — **「このフォルダの SKILL.md を読んで、その指示に従ってください」と伝えるだけです**。

インストールできたら、[使い方](#how-to-use) に進んで例を確認してください。

## SKILL.md

`nano-banana-lite/SKILL.md` を下記の全文で作成してください（`description` には「何をするか + いつ使うか」が記載されており、エージェントが自動トリガーに使います）:

````markdown theme={null}
---
name: nano-banana-lite
description: Generate or edit images via APIYI's Nano Banana 2 Lite (gemini-3.1-flash-lite-image) model. Use this when the user asks to create, draw, render, or generate an image/illustration/poster, or to edit, retouch, restyle, or composite existing images.
allowed-tools: Bash(python3 *)
---

# Nano Banana Lite Image Skill

Call Nano Banana 2 Lite (`gemini-3.1-flash-lite-image`) via APIYI to generate or edit images. ~4s per image, focused on the 1K canvas, great value for volume.

## Key configuration

The script automatically reads `APIYI_API_KEY` from the `.env` file in the skill folder (an environment variable of the same name also works).
If the script reports "Key not found", tell the user to add a line `APIYI_API_KEY=sk-xxx` to `.env`.

## Usage

Call the script in the same folder. The first argument is the prompt; for editing, pass one or more local image paths with `-i`:

```bash
# テキストから画像生成（デフォルトで1画像）
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_lite.py "宇宙飛行士のヘルメットをかぶった柴犬、シネマティックなライティング" -o dog.png --aspect 16:9

# 超ワイドバナー（8:1 / 4:1 など）
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_lite.py "中国風の風景巻物バナー" -o banner.png --aspect 8:1

# 画像編集（画像1枚を渡す）
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_lite.py "背景を夜のサイバーパンク都市に置き換える" -i input.jpg -o edited.png

# 複数画像の合成（複数枚を渡し、-i を繰り返す）
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_lite.py "この2人を1枚のオフィス集合写真に入れる" -i a.png -i b.png -o merged.png

# 複数のバリエーションを一度に生成（最大5件、同時実行）
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_lite.py "中国風の山水画イラスト" -o shanshui.png -n 3 --aspect 16:9
```

Parameters:

- 1st positional argument: the prompt (required).
- `-i / --image`: input image path, repeatable; omit = text-to-image, pass = image editing.
- `-o / --out`: output filename, default `output.png`.
- `-n / --count`: how many to generate, **default 1**, max 5 (concurrent; anything above is auto-capped to 5). When `-n>1`, filenames get `-1` `-2`… suffixes.
- `--aspect`: aspect ratio, 1 of 14 (`1:1` `1:4` `4:1` `1:8` `8:1` `2:3` `3:2` `3:4` `4:3` `4:5` `5:4` `9:16` `16:9` `21:9`), default `1:1`.
- `--size`: resolution `1K` only (Lite is focused on the 1K canvas), default `1K`.

## Number of images (important)

- **Only 1 by default**: when the user doesn't explicitly ask for multiple, keep `-n` at its default (i.e. don't pass it) and generate just 1.
- **Only generate multiple when asked**: use `-n` only when the user says "give me 3 / a few / several versions", and **no more than 5 at once**. For more, call multiple times — don't try to bypass the cap.
- Multiples are concurrent variants of the same prompt (the model is stochastic, so results differ).

## Output location (important)

- When `-o` is a **plain filename** (e.g. `dog.png`), images are saved to the **`nano-banana-output/` folder at the project root**, so the user can find them easily inside the project.
- When `-o` is a **path with a directory** (relative or absolute, e.g. `images/dog.png` or `/abs/path/dog.png`), it saves to that path (relative paths are relative to the current working directory).
- Never write images to `/tmp`, scratchpad, or other temp directories — the user won't find them.

## When done

The script prints one full path per image; report them faithfully to the user. If the script reports a content-safety rejection, relay the reason as-is and don't retry the same prompt.
````

<Tip>
  `name` は小文字の英字とハイフンのみで、`claude` / `anthropic` のような予約語を含んではいけません。スラッシュコマンドのあるエージェントでは、フォルダ名がコマンド名になります。`nano-banana-lite` は `/nano-banana-lite` を意味します。`${CLAUDE_SKILL_DIR}` は Claude Code が提供するスキルディレクトリ変数です。ほかのエージェントでは、スクリプトの実際のパスを使ってください。
</Tip>

## scripts/nano\_banana\_lite.py

Gemini のネイティブ形式を使って `nano-banana-lite/scripts/nano_banana_lite.py` を作成してください（このサイトの text-to-image / image-editing のコードと同一で、動作確認済みです）。**純粋な Python 標準ライブラリのみ — `pip install` は不要です**:

```python theme={null}
#!/usr/bin/env python3
"""Generate / edit images via APIYI's Nano Banana 2 Lite (gemini-3.1-flash-lite-image). Pure stdlib, zero deps."""
import argparse
import base64
import json
import os
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

# Max images generated concurrently per call (a bound to avoid firing too many requests at once)
MAX_COUNT = 5


def load_api_key():
    """Prefer the env var; otherwise look for .env in the script folder and its parent."""
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
    """Walk up from the script to the first dir containing .git or .claude as the project root; fall back to cwd."""
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
    """Send one request, return image bytes; raise RuntimeError on failure."""
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
        raise RuntimeError(f"No candidates returned (possibly rejected by content safety): {resp}")

    cand = candidates[0]
    # Content moderation block: finishReason not STOP, or only a text explanation returned
    if cand.get("finishReason") not in (None, "STOP"):
        text = next((p.get("text") for p in cand["content"]["parts"] if p.get("text")), "")
        raise RuntimeError(f"Request rejected (finishReason={cand.get('finishReason')}): {text}")

    image_part = next((p for p in cand["content"]["parts"] if p.get("inlineData")), None)
    if not image_part:
        text = next((p.get("text") for p in cand["content"]["parts"] if p.get("text")), "")
        raise RuntimeError(f"No image returned, model replied: {text}")

    return base64.b64decode(image_part["inlineData"]["data"])


def resolve_paths(out, count):
    """Decide the list of output paths.
    - If out has a directory component (relative/absolute), use it as given (relative -> relative to cwd).
    - If out is a plain filename, save to <project root>/nano-banana-output/ so it's easy to find.
    When count>1, add -1 / -2 … suffixes to the filename.
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
        sys.exit("API Key not found: add a line APIYI_API_KEY=sk-xxx to .env in the skill folder")

    model = os.environ.get("APIYI_IMAGE_MODEL", "gemini-3.1-flash-lite-image")
    endpoint = f"https://api.apiyi.com/v1beta/models/{model}:generateContent"

    parser = argparse.ArgumentParser(description="Nano Banana Lite image generation")
    parser.add_argument("prompt", help="prompt / edit instruction")
    parser.add_argument("-i", "--image", action="append", default=[],
                        help="input image path (repeatable; passing one triggers edit mode)")
    parser.add_argument("-o", "--out", default="output.png", help="output filename")
    parser.add_argument("-n", "--count", type=int, default=1,
                        help=f"how many to generate, default 1, max {MAX_COUNT} (concurrent)")
    parser.add_argument("--aspect", default="1:1", help="aspect ratio, 1 of 14, e.g. 16:9 / 1:4 / 8:1")
    parser.add_argument("--size", default="1K", help="resolution 1K only (Lite is focused on the 1K canvas)")
    args = parser.parse_args()

    count = args.count
    if count < 1:
        count = 1
    if count > MAX_COUNT:
        print(f"Note: max {MAX_COUNT} per call; capped {args.count} to {MAX_COUNT}.", file=sys.stderr)
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
    except Exception as e:  # noqa: BLE001 — one failure shouldn't affect other concurrent tasks
        return False, str(e)


if __name__ == "__main__":
    main()
```

<Tip>
  モデル名のデフォルトは `gemini-3.1-flash-lite-image` です。Lite は 1K キャンバスに特化しています — `--size` は `1K` に保ってください。2K/4K、またはより高い品質が必要な場合は、Nano Banana 2 / Pro のスキルを使用してください（`APIYI_IMAGE_MODEL` 環境変数でモデルを切り替えることもできます）。
</Tip>

## なぜ一文で画像が生成されるのか

多くの人が不思議に思います。コマンドを入力していないのに、どうして「猫を描いて」と言うだけで画像が生成されるのでしょうか？

仕組みはこうです。エージェントが起動すると、**まず各スキルの`SKILL.md`にある`description`を読みます**（これは「このスキルが何を行い、いつ使うか」を示す短いメタデータです）。あなたのリクエストがその説明のシナリオに**一致**すると（たとえば「画像を描く/生成する/レンダリングする」、「この画像を...に変更する」など）、エージェントは**自動的にこのスキルを呼び出すことを決定し**、`SKILL.md`全体を読み込んでスクリプトを実行します。コマンドを何も覚える必要はありません。

つまり:

* **よく書かれた`description` = より正確な自動トリガー**です。このスキルの説明にはすでに、「画像を生成する/描く/編集する/合成する」といった表現が含まれています。
* エージェントに推測させたくなく、**100%の制御**を求める場合は、以下の**明示的な呼び出し**を使ってください。

## 使い方

### 自然言語（暗黙のトリガー）

インストールしたら、あとはエージェントに話しかけるだけです。

| あなたの発話                                                             | Skill の動作                                      |
| ------------------------------------------------------------------ | ---------------------------------------------- |
| "Use nano banana lite to make a 16:9 snow-mountain sunrise poster" | スクリプトを呼び出します（`-i` なし）、png を1枚出力します             |
| "Make an 8:1 ultra-wide Chinese-style banner"                      | スクリプト `--aspect 8:1` を呼び出します、超横長の png を1枚出力します |
| "Give me 3 different Chinese-style landscapes"                     | スクリプト `-n 3` を呼び出します、png を3枚同時に出力します           |
| "Blur the background of photo.jpg to highlight the person"         | スクリプト `-i photo.jpg` を呼び出します、png を1枚出力します      |

### 明示的な呼び出し（より細かい制御）

エージェントに自動判断させたくない場合は、明示的な方法が2つあります。

* **スラッシュコマンドに対応したエージェント**（Claude Code など）:

  ```text theme={null}
  /nano-banana-lite An orange cat napping in a garden, oil-painting style --aspect 3:2
  ```

* **どのエージェントでも可 / 単にスクリプトを実行するよう伝える**（最も汎用的）:

  ```text theme={null}
  Run python3 nano-banana-lite/scripts/nano_banana_lite.py "An orange cat napping in a garden, oil-painting style" --aspect 3:2
  ```

<Tip>
  **比率の指定**: `--aspect` を使ってアスペクト比を選びます（14種類のうち1つで、超縦長/超横長の `1:4 / 4:1 / 1:8 / 8:1` を含みます）。Lite は 1K キャンバスに特化しているため、解像度を指定する必要はありません。「portrait 9:16」や「超横長のバナーを作って」と言うだけで、エージェントが自動的に aspect パラメータを追加します。
</Tip>

## 生成された画像の保存先

* `-o` が **ファイル名** だけの場合（例: `-o dog.png`）、画像は**プロジェクトルート直下の `nano-banana-output/` フォルダ**（自動作成）に保存されるので、プロジェクト内ですぐ見つけられます。
* 「プロジェクトルート」= スクリプトから親ディレクトリをたどって見つかる、`.git` または `.claude` を含む最初のディレクトリです — **エージェントがどのディレクトリで実行されていても、画像は一時ディレクトリではなくプロジェクト内に保存される**ため、失われることはありません。
* スクリプトは画像ごとに完全な絶対パスを1つずつ出力します。例: `Image saved to /Users/you/project/nano-banana-output/dog.png`。
* デフォルトでは**1枚のみの画像**が生成されます。`-n 3` では一度に3枚出力します（最大5枚、それを超える場合は自動的に5枚に制限されます）。ファイル名には `-1`、`-2`、`-3` のサフィックスが追加されます。
* **ディレクトリを含むパス**（例: `-o images/dog.png` や絶対パス）を渡した場合は、指定したパス（相対パスは現在の作業ディレクトリ基準）に保存され、`nano-banana-output/` には保存されません。
* 画像編集も同じ仕組みで動作します。出力は新しいファイルになり、**元のファイルを上書きすることはありません**。

<Info>
  Nano Banana 2 Lite には厳格なコンテンツ安全対策があります。スクリプトが `finishReason` を `STOP` 以外で報告したり、拒否テキストを返したりした場合は、メッセージに従って内容を調整してください。同じ違反プロンプトを繰り返し再試行しないでください。
</Info>

## 関連ドキュメント

* [Nano Banana Lite 画像生成の概要](/ja/api-capabilities/nano-banana-lite-image/overview)
* [テキストから画像への API リファレンス](/ja/api-capabilities/nano-banana-lite-image/text-to-image)
* [画像編集 API リファレンス](/ja/api-capabilities/nano-banana-lite-image/image-edit)
* [Nano Banana 2 エージェントスキル](/ja/api-capabilities/nano-banana-2-image/skills)
* [Nano Banana の料金](/ja/api-capabilities/nano-banana-pricing)
