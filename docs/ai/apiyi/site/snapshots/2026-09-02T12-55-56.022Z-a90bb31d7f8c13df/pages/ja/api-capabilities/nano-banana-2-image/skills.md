> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana 2 エージェントスキル

> Nano Banana 2 (gemini-3.1-flash-image-preview) を、すぐに使えるエージェントスキルとしてパッケージ化します。Codex、OpenClaw、hermes-agent、Claude Code、または任意のコーディングエージェントにそのまま組み込み、APIYI を呼び出して、1 つの prompt でテキストから画像生成と画像編集を行えます。

<Note>
  このページでは、すぐに使える**Agent Skill**を提供します。すでに使っているコーディングAgentにそのまま入れて、自然言語（または明示的なコマンド）で APIYI プラットフォーム上の **Nano Banana 2**（`gemini-3.1-flash-image-preview`）を呼び出し、画像生成と編集を行えます。必要なのはたった2つのファイルだけです。コピーしてすぐ使えます。
</Note>

<Tip>
  代わりに **Pro** スキル（`gemini-3-pro-image`、最高品質）を使いたい場合は、[Nano Banana Pro Agent Skill](/ja/api-capabilities/nano-banana-image/skills) をご覧ください。このページは **Nano Banana 2**（Flash級の速度で Pro レベルの品質、より高いコストパフォーマンス）向けです。
</Tip>

## このスキルの機能

単一の統合スキルです。スクリプトが**入力画像を渡したかどうか**を自動判定し、テキストから画像生成と画像編集を切り替えます。

<CardGroup cols={3}>
  <Card title="テキストから画像生成" icon="wand-sparkles">
    プロンプトのみ → 完全に新しい画像を生成。**14種類のアスペクト比**と 512/1K/2K/4K の解像度に対応します。
  </Card>

  <Card title="画像編集" icon="image">
    1枚の画像 + 指示 → ローカル編集、スタイル変更、背景置換などを行えます。
  </Card>

  <Card title="マルチ画像合成" icon="layers">
    複数画像 + 1つの指示 → 合成、比較、服装の差し替えなどができます。
  </Card>
</CardGroup>

Pro と比べると、Nano Banana 2 は 4つの**超縦長/超横長**比率（`1:4 / 4:1 / 1:8 / 8:1`）と、専用の**512px**低解像度階層を追加し、1回あたりわずか \$0.055/image です（token ベースでは最安で約 \$0.025/image）— 大量利用により適しています。

## どのエージェントが使用できるか

<Info>
  Skill は本質的には単なる **フォルダ** です。Agent が読むための指示一式（`SKILL.md`）と、実際の処理を行うスクリプトで構成されています。つまり、ローカルファイルを読み取り、シェルコマンドを実行できる **どのコーディング Agent でも使用できます**。たとえば **Codex, OpenClaw, hermes-agent, Claude Code** などです。

  必要条件は1つだけです。Agent を実行するマシン（あなたのコンピューターまたはサーバー）に **Python 3** がインストールされていて、**ネットワークアクセス** があることです（スクリプトが `api.apiyi.com` を直接呼び出します）。それだけです。特定の Agent に依存するものではありません。
</Info>

## 3ステップでセットアップ

### ① フォルダを作成してファイルを貼り付ける

次の2つのファイルを含むスキルフォルダを作成します（全文は次の2セクションにあります）:

```
nano-banana-2/
├── SKILL.md
├── scripts/
│   └── nano_banana_2.py
└── .env          # created in step ②, holds your key
```

### ② 同じフォルダにキーを入れる

`api.apiyi.com` コンソールで作成した **APIYI API Key** を `nano-banana-2/.env` に書き込みます:

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

スクリプトはこの `.env` からキーを自動的に読み取ります — **追加の設定や環境変数は不要です**。

<Warning>
  `.env` には秘密キーが入っています。プロジェクトのリポジトリ経由でこのスキルを共有する場合は、**必ず `.env` を `.gitignore` に追加し、git に commit しないでください**。
</Warning>

### ③ エージェントに渡す

* **スキルを自動検出するエージェント**（例: Claude Code）の場合: フォルダ全体の `nano-banana-2/` を、そのスキル用ディレクトリに置きます。個人用の `~/.claude/skills/`、またはリポジトリ経由で共有されるプロジェクトレベルの `.claude/skills/` のどちらでも構いません。
* **その他のエージェント**: それぞれのスキル/プラグインの規約に従って配置してください。最も簡単なのは、**「このフォルダの SKILL.md を読んで、それに従ってください」とエージェントに伝えることです**。

インストールが完了したら準備完了です — 例については [使い方](#how-to-use-it) をご覧ください。

## SKILL.md

以下の全文を使って `nano-banana-2/SKILL.md` を作成してください（`description` は「何をするか + いつ使うか」を示し、これはエージェントが自動トリガーに使います）:

````markdown theme={null}
---
name: nano-banana-2
description: Generate or edit images via APIYI's Nano Banana 2 (gemini-3.1-flash-image-preview) model. Use this when the user asks to create, draw, render, or generate an image/illustration/poster, or to edit, retouch, restyle, or composite existing images.
allowed-tools: Bash(python3 *)
---

# Nano Banana 2 Image Skill

Generate or edit images through the APIYI platform using Nano Banana 2 (`gemini-3.1-flash-image-preview`) — Pro-level quality at Flash-tier speed, great value.

## Key configuration

The script auto-reads `APIYI_API_KEY` from a `.env` file in the skill folder (an environment variable of the same name also works).
If the script reports "no key found", ask the user to add a line `APIYI_API_KEY=sk-xxx` to `.env`.

## Usage

Call the script in the same directory. The first argument is the prompt; for editing, pass one or more local image paths with `-i`:

```bash
# テキストから画像へ（デフォルトで画像1枚）
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2.py "宇宙飛行士のヘルメットをかぶった柴犬、シネマティックなライティング" -o dog.png --size 2K --aspect 16:9

# 超横長バナー（Nano Banana 2 専用の 8:1 / 4:1 の超横長比率）
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2.py "水墨画風の長巻きバナー" -o banner.png --aspect 8:1 --size 2K

# 画像編集（画像1枚）
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2.py "背景をサイバーパンクの夜の街に置き換える" -i input.jpg -o edited.png

# 複数画像の合成（-i を繰り返し指定）
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2.py "この2人を1枚のオフィスの集合写真に合成する" -i a.png -i b.png -o merged.png

# 同じ prompt の複数バリエーションを一度に生成（最大5件、同時生成）
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2.py "水墨画風の風景イラスト" -o landscape.png -n 3 --aspect 16:9
```

Arguments:

- 1st positional arg: the prompt (required).
- `-i / --image`: input image path, repeatable; omitted = text-to-image, present = image editing.
- `-o / --out`: output filename, defaults to `output.png`.
- `-n / --count`: how many images at once, **default 1**, max 5 (generated concurrently in-script; anything above is auto-clamped to 5). When `-n>1`, a `-1` `-2`… suffix is added automatically.
- `--aspect`: aspect ratio, one of 14 (`1:1` `1:4` `4:1` `1:8` `8:1` `2:3` `3:2` `3:4` `4:3` `4:5` `5:4` `9:16` `16:9` `21:9`), defaults to `1:1`.
- `--size`: resolution `512` / `1K` / `2K` / `4K`, defaults to `2K`.

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
  `name` は小文字の英字 + ハイフンでなければならず、**`claude` / `anthropic` のような予約語を含めてはいけません**。スラッシュコマンドをサポートするエージェントでは、ディレクトリ名がコマンドになります。つまり、`nano-banana-2` は `/nano-banana-2` になります。`${CLAUDE_SKILL_DIR}` は Claude Code が提供するスキルディレクトリ変数です。ほかのエージェントでは、スクリプトの実際のパスをそのまま使ってください。
</Tip>

## scripts/nano\_banana\_2.py

Gemini-native 形式を使って `nano-banana-2/scripts/nano_banana_2.py` を作成してください（APIYI のテキストから画像生成 / 画像編集リファレンスページで検証済みの動作コードと同一です）。**Pure Python 標準ライブラリのみ — `pip install` は不要です**:

```python theme={null}
#!/usr/bin/env python3
"""Generate / edit images via APIYI's Nano Banana 2 (gemini-3.1-flash-image-preview). Stdlib only, zero deps."""
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

    model = os.environ.get("APIYI_IMAGE_MODEL", "gemini-3.1-flash-image-preview")
    endpoint = f"https://api.apiyi.com/v1beta/models/{model}:generateContent"

    parser = argparse.ArgumentParser(description="Nano Banana 2 image generation")
    parser.add_argument("prompt", help="Prompt / edit instruction")
    parser.add_argument("-i", "--image", action="append", default=[],
                        help="Input image path (repeatable; presence = edit mode)")
    parser.add_argument("-o", "--out", default="output.png", help="Output filename")
    parser.add_argument("-n", "--count", type=int, default=1,
                        help=f"How many images at once, default 1, max {MAX_COUNT} (concurrent)")
    parser.add_argument("--aspect", default="1:1", help="Aspect ratio (14 options), e.g. 16:9 / 1:4 / 8:1")
    parser.add_argument("--size", default="2K", help="Resolution 512 / 1K / 2K / 4K")
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
  デフォルトのモデル名は `gemini-3.1-flash-image-preview` です。Google は後に `-preview` を含まない安定版名 `gemini-3.1-flash-image` を提供しました。どちらも価格は同じで、動作も同じです。切り替えるには `APIYI_IMAGE_MODEL=gemini-3.1-flash-image` を設定してください。
</Tip>

## なぜ 1 文だけで画像が生成されるのか

多くの人が疑問に思います。コマンドを一度も入力していないのに、どうして「draw a cat」で画像が生成されたのでしょうか？

仕組みはこうです。起動時に、Agent は各スキルの`SKILL.md`から`description`を**最初に読み取ります**（これは「このスキルが何を行い、いつ使うか」を説明する、とても短いメタデータです）。あなたのリクエストがその状況に**一致**すると（例: 「画像を draw / generate / render する」「この画像を...に編集する」）、Agent は**自動的にそのスキルを呼び出すと判断し**、`SKILL.md`全体を読み込み、スクリプトを実行します。コマンドを覚えている必要はありません。

つまり:

* **よく書かれた`description` = より正確な自動起動。** このスキルの説明には、すでに「画像を generate / draw / edit / composite する」といった言い回しが含まれています。
* Agent に推測させたくなく、**完全に制御**したい場合は、以下の**明示的な呼び出し**を使ってください。

## 使い方

### 自然言語（暗黙トリガー）

インストールしたら、エージェントに話しかけるだけです:

| 何と言うか                                 | スキルの動作                            |
| ------------------------------------- | --------------------------------- |
| "16:9 の雪山の朝日ポスターを Nano Banana 2 で描いて" | スクリプトを実行します（`-i` なし）、png 1 枚      |
| "8:1 の超横長の中国風バナーを作って"                 | `--aspect 8:1` を実行します、超横長 png 1 枚 |
| "中国水墨画の風景を 3 種類ちがいで出して"               | `-n 3` を実行します、png 3 枚を同時に処理します    |
| "photo.jpg の背景をぼかして主体を目立たせて"          | `-i photo.jpg` を実行します、png 1 枚     |

### 明示的な呼び出し（より細かく制御）

エージェントに自動判断させたくない場合は、明示的な方法が 2 つあります。

* **スラッシュコマンドに対応するエージェント**（例: Claude Code）:

  ```text theme={null}
  /nano-banana-2 An orange cat napping in a garden, oil painting style --size 2K --aspect 3:2
  ```

* **任意のエージェント / スクリプトを実行するよう伝えるだけ**（最も汎用的）:

  ```text theme={null}
  Run python3 nano-banana-2/scripts/nano_banana_2.py "An orange cat napping in a garden, oil painting style" --size 2K --aspect 3:2
  ```

<Tip>
  **アスペクト比と鮮明さの制御方法**: アスペクト比には `--aspect` を使い（14種類の選択肢があり、Pro にはない `1:4 / 4:1 / 1:8 / 8:1` の超縦長/超横長も含まれます）、解像度には `--size` を使います（`512` / `1K` / `2K` / `4K`。`512` は Nano Banana 2 専用の、コストを抑えられる低解像度階層です）。たとえば "portrait 9:16"、"4K でレンダリング"、または "超横長のバナーを作成して" と伝えるだけで、エージェントがこれらのフラグを自動で追加します。
</Tip>

## 生成された画像の保存先

* `-o` が **ベアファイル名**（例: `-o dog.png`）の場合、画像はすべて **プロジェクトルート直下の `nano-banana-output/` フォルダ** に自動作成されて保存されるため、プロジェクト内のその場所ですぐ見つけられます。
* 「プロジェクトルート」は、スクリプト自身の場所から親ディレクトリへたどって見つかる `.git` または `.claude` を含む最初のディレクトリです。そのため、Agent がどのディレクトリから実行されても、画像はプロジェクト内に保存され、見つけられない一時ディレクトリに入ることはありません。
* スクリプトは画像ごとに絶対パスを 1 つずつ完全な形で出力します。たとえば `Image saved to /Users/you/project/nano-banana-output/dog.png` です。
* デフォルトでは **1 枚だけ** 生成されます。`-n 3` は一度に 3 枚生成し（最大 5 枚で、それ以上は 5 に丸められます）、`-1`、`-2`、`-3` の接尾辞が自動で追加されます。
* `-o` が **ディレクトリを含むパス**（例: `-o images/dog.png` や絶対パス）の場合は、その正確なパスに保存されます（相対パスは現在の作業ディレクトリからの相対パスです）ので、`nano-banana-output/` には入りません。
* 画像編集も同じ仕組みで動作します。出力は新しいファイルになり、**元のファイルは上書きしません**。

<Info>
  Nano Banana 2 には厳格なコンテンツ安全対策があります。スクリプトが `finishReason` を返し、それが `STOP` 以外であったり、拒否テキストを返したりした場合は、内容を調整し、同じ違反するプロンプトを繰り返し再試行しないでください。
</Info>

## 関連ドキュメント

* [Nano Banana 2 Image Generation の概要](/ja/api-capabilities/nano-banana-2-image/overview)
* [テキストから画像への API リファレンス](/ja/api-capabilities/nano-banana-2-image/text-to-image)
* [画像編集 API リファレンス](/ja/api-capabilities/nano-banana-2-image/image-edit)
* [Nano Banana Pro エージェントスキル](/ja/api-capabilities/nano-banana-image/skills)
* [Nano Banana の料金](/ja/api-capabilities/nano-banana-pricing)
