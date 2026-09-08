> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Pro エージェントスキル

> Nano Banana Pro (gemini-3-pro-image) をすぐ使える Agent Skill としてパッケージ化します。Codex、OpenClaw、hermes-agent、Claude Code、または任意のコーディング Agent に組み込み、単一の prompt でテキストから画像生成と画像編集のために APIYI を呼び出せます。

<Note>
  このページでは、**すぐに使えるエージェントスキル**を提供します: すでに使っているコーディングエージェントに入れて、自然言語（または明示的なコマンド）で **Nano Banana Pro**（`gemini-3-pro-image`）を APIYI プラットフォーム上で呼び出し、画像生成と編集に使えます。全体はたった 2 ファイルです — コピーしてそのまま使えます。
</Note>

## このスキルでできること

1つの統合スキルです。スクリプトが**入力画像を渡しているかどうか**を自動判定し、テキストから画像生成と画像編集を切り替えます:

<CardGroup cols={3}>
  <Card title="テキストから画像生成" icon="wand-sparkles">
    プロンプトのみ → まったく新しい画像を生成します。アスペクト比は10種類、解像度は1K/2K/4Kです。
  </Card>

  <Card title="画像編集" icon="image">
    画像1枚 + 1つの指示 → ローカル編集、リスタイル、背景差し替えなどを行います。
  </Card>

  <Card title="複数画像の合成" icon="layers">
    複数画像 + 1つの指示 → 合成、比較、衣装の入れ替えなどを行います。
  </Card>
</CardGroup>

## どのエージェントが使用できますか

<Info>
  Skill は実質的には単なる **フォルダ** です。エージェントが読むための指示セット（`SKILL.md`）と、作業を行うスクリプトで構成されています。つまり、**ローカルファイルを読み、シェルコマンドを実行できるコーディングエージェントならどれでも使用できます** — たとえば **Codex, OpenClaw, hermes-agent, Claude Code** などです。

  必要条件はただ 1 つです。エージェントを実行するマシン（お使いのコンピュータまたはサーバー）に **Python 3** がインストールされており、**ネットワークアクセス** があることです（スクリプトは `api.apiyi.com` を直接呼び出します）。それだけです — 特定のエージェントに紐づいているわけではありません。
</Info>

## 3ステップでセットアップ

### ① フォルダを作成してファイルを貼り付ける

次の 2 つのファイルを含むスキルフォルダを作成します（完全な内容は次の 2 セクションにあります）:

```
nano-banana-pro/
├── SKILL.md
├── scripts/
│   └── nano_banana.py
└── .env          # created in step ②, holds your key
```

### ② 同じフォルダにキーを置く

**APIYI API Key** を、（`api.apiyi.com` コンソールで作成したものを）`nano-banana-pro/.env` に書き込みます:

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

スクリプトはこの `.env` からキーを自動で読み込みます — **追加の設定や環境変数は不要です**。

<Warning>
  `.env` には秘密鍵が保存されています。プロジェクトのリポジトリ経由でこのスキルを共有する場合は、**必ず `.env` を `.gitignore` に追加し、git に commit しないでください**。
</Warning>

### ③ エージェントに渡す

* **スキルを自動検出するエージェント**（例: Claude Code）の場合: `nano-banana-pro/` フォルダ全体を、そのスキルディレクトリに配置します — 個人用の `~/.claude/skills/`、またはリポジトリで共有するプロジェクトレベルの `.claude/skills/`。
* **その他のエージェント**: それぞれのスキル/プラグインの規約に従って配置してください。あるいは、いちばん簡単なのは — **エージェントに「このフォルダの SKILL.md を読んで従ってください」と伝えるだけです**。

インストールが完了したら準備完了です — 例は [使い方](#how-to-use-it) をご覧ください。

## SKILL.md

`nano-banana-pro/SKILL.md`を、以下の完全な内容で作成してください（`description` は「何をするか + いつ使うか」を示し、これを Agent が自動トリガーに使用します）:

````markdown theme={null}
---
name: nano-banana-pro
description: Generate or edit images via APIYI's Nano Banana Pro (gemini-3-pro-image) model. Use this when the user asks to create, draw, render, or generate an image/illustration/poster, or to edit, retouch, restyle, or composite existing images.
allowed-tools: Bash(python3 *)
---

# Nano Banana Pro Image Skill

Generate or edit images through the APIYI platform using Nano Banana Pro (`gemini-3-pro-image`).

## Key configuration

The script auto-reads `APIYI_API_KEY` from a `.env` file in the skill folder (an environment variable of the same name also works).
If the script reports "no key found", ask the user to add a line `APIYI_API_KEY=sk-xxx` to `.env`.

## Usage

Call the script in the same directory. The first argument is the prompt; for editing, pass one or more local image paths with `-i`:

```bash
# テキストから画像生成（デフォルトでは1枚）
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana.py "宇宙飛行士のヘルメットをかぶった柴犬、シネマティックなライティング" -o dog.png --size 2K --aspect 16:9

# 画像編集（1枚）
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana.py "背景をサイバーパンクの夜の街に置き換えてください" -i input.jpg -o edited.png

# 複数画像の合成（-i を繰り返し指定）
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana.py "この2人を1枚のオフィス集合写真に合成してください" -i a.png -i b.png -o merged.png

# 同じ prompt の複数バリエーションを一度に生成（最大5件、同時生成）
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana.py "中国水墨風の風景イラスト" -o landscape.png -n 3 --aspect 16:9
```

Arguments:

- 1st positional arg: the prompt (required).
- `-i / --image`: input image path, repeatable; omitted = text-to-image, present = image editing.
- `-o / --out`: output filename, defaults to `output.png`.
- `-n / --count`: how many images at once, **default 1**, max 5 (generated concurrently in-script; anything above is auto-clamped to 5). When `-n>1`, a `-1` `-2`… suffix is added automatically.
- `--aspect`: aspect ratio, one of (`1:1` `2:3` `3:2` `3:4` `4:3` `4:5` `5:4` `9:16` `16:9` `21:9`), defaults to `1:1`.
- `--size`: resolution `1K` / `2K` / `4K`, defaults to `2K`.

## Number of images (important)

- **Default to a single image**: when the user does not explicitly ask for several, leave `-n` at its default (i.e. omit it) and generate just 1.
- **Only generate multiple when asked**: use `-n` only when the user says "give me 3 / a few / several versions", and **never exceed 5 at once**. If more are needed, call the script multiple times; do not try to bypass the limit.
- Multiple images are concurrent variants of the same prompt (the model is stochastic, so each differs).

## Output location (important)

- When `-o` is a **bare filename** (e.g. `dog.png`), images are all saved into a **`nano-banana-output/` folder at the project root**, so the user can find them in the project easily.
- When `-o` is a **path with a directory** (relative or absolute, e.g. `images/dog.png` or `/abs/path/dog.png`), it is saved at that exact path (relative paths are relative to the current working directory).
- Do not write images to `/tmp`, scratchpad, or other temp directories — the user won't find them.

## After running

The script prints one full path per image — report them all back to the user as-is. If the script reports a content-safety rejection, relay the reason as-is and do not retry the same prompt.
````

<Tip>
  `name` は小文字の英字とハイフンのみで構成し、**`claude` / `anthropic` のような予約語を含めてはいけません**。スラッシュコマンドをサポートする Agent では、ディレクトリ名がコマンドになります — `nano-banana-pro` は `/nano-banana-pro` になります。`${CLAUDE_SKILL_DIR}` は Claude Code が提供するスキルディレクトリ変数です。ほかの Agent では、スクリプトの実際のパスを使用してください。
</Tip>

## scripts/nano\_banana.py

APIYI の text-to-image / image-edit 参考ページで検証済みの動作コードと同一の、Gemini ネイティブ形式を使って `nano-banana-pro/scripts/nano_banana.py` を作成してください。**Pure Python 標準ライブラリのみ — `pip install` は不要です**:

```python theme={null}
#!/usr/bin/env python3
"""Generate / edit images via APIYI's Nano Banana Pro (gemini-3-pro-image). Stdlib only, zero deps."""
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
    - If out is a bare filename, save under <project_root>/nano-banana-output/ so it's easy to find.
    With count>1, append a -1 / -2 ... suffix.
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
        sys.exit("No API key found: add a line APIYI_API_KEY=sk-xxx to the .env in the skill folder")

    model = os.environ.get("APIYI_IMAGE_MODEL", "gemini-3-pro-image")
    endpoint = f"https://api.apiyi.com/v1beta/models/{model}:generateContent"

    parser = argparse.ArgumentParser(description="Nano Banana Pro image generation")
    parser.add_argument("prompt", help="Prompt / edit instruction")
    parser.add_argument("-i", "--image", action="append", default=[],
                        help="Input image path (repeatable; presence = edit mode)")
    parser.add_argument("-o", "--out", default="output.png", help="Output filename")
    parser.add_argument("-n", "--count", type=int, default=1,
                        help=f"How many images at once, default 1, max {MAX_COUNT} (concurrent)")
    parser.add_argument("--aspect", default="1:1", help="Aspect ratio, e.g. 16:9")
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
  デフォルトの model 名は `gemini-3-pro-image`（安定版名）です。元の `gemini-3-pro-image-preview` を使うには、`APIYI_IMAGE_MODEL=gemini-3-pro-image-preview` を設定してください — どちらも同じ価格で、機能的に同等です。
</Tip>

## なぜ一文で画像が生成されるのか

よくある疑問です。コマンドを入力していないのに、どうして「猫を描く」で画像が生成されるのでしょうか？

仕組みはこうです。起動時に、エージェントは**まず各スキルの `SKILL.md` から `description` を読み取ります**（そのスキルが「何をするのか、いつ使うのか」を説明する、とても短いメタデータです）。あなたのリクエストがそのシナリオに**一致**すると（たとえば「画像を描く / 生成する / レンダリングする」「この画像を...に編集する」など）、エージェントは**自動的にそのスキルを呼び出すことを決定し**、`SKILL.md` 全体を読み取り、スクリプトを実行します。コマンドを覚えておく必要はありません。

つまり:

* **よく書かれた `description` = より正確な自動トリガー。** このスキルの説明には、すでに「画像を生成する / 描く / 編集する / 合成する」といった表現が含まれています。
* エージェントに推測させたくなく、**完全に自分で制御したい**場合は、下の**明示的な呼び出し**を使ってください。

## 使い方

### 自然言語（暗黙のトリガー）

インストール後は、エージェントに話しかけるだけです。

| あなたの発話                                                      | Skill の動作                         |
| ----------------------------------------------------------- | --------------------------------- |
| "Draw a 16:9 snow-mountain sunrise poster with nano banana" | スクリプトを実行します（`-i` なし）、png 1枚       |
| "Blur the background of photo.jpg to emphasize the subject" | `-i photo.jpg` を実行します、png 1枚      |
| "Give me 3 different Chinese ink landscapes"                | `-n 3` を並列で実行します、png 3枚           |
| "Composite the people in a.png and b.png into one photo"    | `-i a.png -i b.png` を実行します、png 1枚 |

### 明示的な呼び出し（より細かく制御）

エージェントに自動判断させたくない場合は、明示的な方法が 2 つあります。

* **スラッシュコマンドをサポートするエージェント**（例: Claude Code）:

  ```text theme={null}
  /nano-banana-pro An orange cat napping in a garden, oil painting style --size 4K --aspect 3:2
  ```

* **任意のエージェント / 単にスクリプトを実行するよう指示する**（最も汎用的）:

  ```text theme={null}
  Run python3 nano-banana-pro/scripts/nano_banana.py "An orange cat napping in a garden, oil painting style" --size 4K --aspect 3:2
  ```

<Tip>
  **アスペクト比とシャープネスの制御方法**: アスペクト比には `--aspect` を使い（例: `--aspect 16:9`、10 個のオプション）、解像度には `--size` を使います（`1K` / `2K` / `4K`）。「縦長 9:16 にして」「正方形の画像にして」「4K でレンダーして」と言うだけで、エージェントがこれらのフラグを自動的に追加します。
</Tip>

## 生成された画像の保存先

* `-o` が **ベアファイル名**（例: `-o dog.png`）の場合、画像はすべて **プロジェクトルート直下の `nano-banana-output/` フォルダ** に保存されます（自動で作成されます）。そのため、画像はプロジェクト内のその場所にあります。
* 「プロジェクトルート」= スクリプト自身の場所から上方向にたどって見つかった、`.git` または `.claude` を含む最初のディレクトリです。そのため、Agent がどのディレクトリから実行されても、画像はプロジェクト内に保存され、見つけられない一時ディレクトリには保存されません。
* スクリプトは画像ごとに 1 つの完全な絶対パスを出力します。例: `Image saved to /Users/you/project/nano-banana-output/dog.png`。
* デフォルトでは **1 枚だけ** 生成します。`-n 3` では一度に 3 枚生成されます（最大 5 枚で、それ以上は 5 に丸められます）。また、`-1`、`-2`、`-3` の接尾辞が自動で追加されます。
* `-o` が **ディレクトリを含むパス**（例: `-o images/dog.png` や絶対パス）の場合は、その正確なパスに保存され（相対パスは現在の作業ディレクトリからの相対になります）、`nano-banana-output/` には入りません。
* 画像編集も同じ仕組みです。出力は新しいファイルになり、**元のファイルは上書きされません**。

<Info>
  Nano Banana Pro には厳格なコンテンツ安全制御があります。スクリプトが `finishReason` を `STOP` 以外で返す、または拒否テキストを返した場合は、内容をそれに合わせて調整し、同じ違反 prompt を繰り返し再試行しないでください。生成リファレンスの [エラーハンドリングガイド](/ja/api-capabilities/nano-banana-image/overview) を参照してください。
</Info>

## 関連ドキュメント

* [Nano Banana Pro 画像生成の概要](/ja/api-capabilities/nano-banana-image/overview)
* [テキストから画像への API リファレンス](/ja/api-capabilities/nano-banana-image/text-to-image)
* [画像編集 API リファレンス](/ja/api-capabilities/nano-banana-image/image-edit)
* [Nano Banana 料金](/ja/api-capabilities/nano-banana-pricing)
