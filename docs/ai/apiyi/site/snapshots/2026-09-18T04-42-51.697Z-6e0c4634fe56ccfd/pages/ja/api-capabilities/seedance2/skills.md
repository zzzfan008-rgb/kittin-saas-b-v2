> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.0 動画エージェントスキル

> 4つすべてのSeedanceモデル（sd25 / mini / fast / standard）を、すぐに使える1つのエージェントスキルにまとめます。Codex、OpenClaw、Claude Code、または任意のコーディングエージェントに追加するだけで、1文の指示からテキストから動画、画像から動画、参照画像動画を生成できます。スクリプトは非同期タスクをポーリングし、完成した動画クリップを自動的にダウンロードします。

<Note>
  このページには**すぐに使えるAgentスキル**が用意されています。依存関係なしの1つのスクリプトで、4つすべてのSeedanceモデル（`sd25` / `mini` / `fast` / 標準）に対応し、`--model`で切り替えられます。使用するコーディングエージェントに追加すれば、1文だけで動画を生成できます。全体はわずか2ファイルです。これは、このサイト初の**動画モデル用スキル**でもあります。画像とは異なり、動画生成は非同期タスクであり、スクリプトには送信 → ポーリング → ダウンロードという一連のフローがすでに組み込まれています。
</Note>

## このスキルでできること

1つの統合スキルです。スクリプトは**渡す画像の種類とそれぞれの役割**に基づいて生成モードを選びます：

<CardGroup cols={3}>
  <Card title="テキストから動画" icon="clapperboard">
    プロンプトのみ → 新規の動画を生成します。デフォルトで同期済みの音声（会話、効果音、環境音）も付きます。
  </Card>

  <Card title="画像から動画" icon="image-play">
    先頭フレーム画像を渡して静止画をアニメーション化します。最終フレーム画像を追加すると、先頭から末尾への滑らかな遷移になります。
  </Card>

  <Card title="動画への参照" icon="layers">
    最大 9 枚の参照画像を渡すと、それらのキャラクター、オブジェクト、またはスタイルを保持した新しい映像を生成します。
  </Card>
</CardGroup>

## どのモデルを選ぶべきか

4つのモデルはすべて**まったく同じ方法で呼び出し**ます。異なるのは、解像度上限、時間上限、参照制限、速度、価格です。スクリプトは`--model`ごとに違いを処理します。

| モデル（`--model`） | モデルID                             | 最大解像度     | 速度（720p/5秒、計測値） | グループ                                      | 720p/5秒のリスト価格                  | 最適な用途                                    |
| -------------- | --------------------------------- | --------- | --------------- | ----------------------------------------- | ------------------------------ | ---------------------------------------- |
| `mini`（デフォルト）  | `doubao-seedance-2-0-mini-260615` | 720p      | **最速、約87～170秒** | `SeeDance2` 0.18x<br />または`SD2Mini` 0.10x | \$0.4508<br />割引後 **\$0.2504** | 高頻度のエージェント利用、大量利用、迅速なプレビュー               |
| `fast`         | `doubao-seedance-2-0-fast-260128` | 720p      | 約100～290秒       | `SeeDance2` 0.18x<br />または`SD2Fast` 0.15x | \$0.7253<br />割引後 **\$0.6044** | 品質とコストの中間バランス                            |
| `std`          | `doubao-seedance-2-0-260128`      | **1080p** | 約100～290秒       | `SeeDance2` 0.18x                         | \$0.9074                       | 1080p、最高品質                               |
| `sd25`         | `doubao-seedance-2-5-260628`      | **1080p** | 約150秒           | `SeeDance2` 0.18x                         | **\$1.3721**                   | **最大30秒、参照画像30枚、mov出力** — `std`の約1.5倍の価格 |

<Tip>
  目安：日常用途およびエージェントのシナリオでは**デフォルトの`mini`を継続して使用**してください。**1080pまたは最高品質が必要** → `--model std`、**30秒のクリップ、参照画像30枚、またはmov出力が必要** → `--model sd25`が唯一の選択肢です（`std`の約1.5倍の価格で、2.0ファミリーと同じグループです）。すべてのアスペクト比は同一解像度ティア内で同価格であり、時間は秒単位で線形に課金され、フレームレートは24fpsに固定されています。割引グループ`SD2Mini` / `SD2Fast`は\*\*2026年10月7日 23:59（UTC+8）\*\*まで適用されます。その後もグループはオンラインのままですが、倍率は0.18xに戻ります。詳細は[概要ページのグループ注記](/ja/api-capabilities/seedance2/overview)を参照してください。
</Tip>

## どのエージェントが使用できますか

<Info>
  Skill は本質的には **フォルダ** です。つまり、エージェントが読むためのノート（`SKILL.md`）と、実際の処理を行うスクリプトから成ります。したがって、**ローカルファイルを読み取り、シェルコマンドを実行できるあらゆるコーディングエージェントは使用できます** — **Codex, OpenClaw, hermes-agent, Claude Code** などです。

  必要条件はただ1つです。エージェントを実行しているマシン（お使いのノートパソコンまたはサーバー）に **Python 3** と **インターネットアクセス** があることです（スクリプトは `api.apiyi.com` を直接呼び出します）。スクリプトは Python 標準ライブラリしか使用しないため、**`pip install` するものは何もありません**。
</Info>

## 3ステップでセットアップ

### ① フォルダーを作成して、ファイルを貼り付ける

スキルフォルダーを作成し、以下の2つのファイルを配置します（完全な内容は次の2つのセクションにあります）。

```
seedance2/
├── SKILL.md
├── scripts/
│   └── seedance_video.py
└── .env          # created in step ②, holds your key
```

### ② その横にキーを置く

`seedance2/.env` に **APIYI APIキー** を記述します（従量課金で `api.apiyi.com` コンソールから作成してください。**token では `SeeDance2` グループを有効にする必要があります**。このグループには4つすべてのモデルが含まれます — `mini` / `fast` には割引された `SD2Mini` / `SD2Fast` も適用されます）。

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

スクリプトはこの `.env` からキーを自動的に読み取るため、**追加の設定や環境変数は必要ありません**。

<Warning>
  `.env` には秘密鍵が保存されます。スキルをプロジェクトリポジトリ内で共有する場合は、**`.env` を `.gitignore` に追加し、決してコミットしないでください**。
</Warning>

### ③ Agent に渡す

* **スキルの自動検出に対応した Agent**（例：Claude Code）：`seedance2/` フォルダー全体を、個人用のスキルディレクトリ `~/.claude/skills/`、またはプロジェクトレベルの `.claude/skills/`（リポジトリと共有）に配置します。
* **その他の Agent**：それぞれのスキル／プラグインの規約に従ってください。あるいは、最も簡単な方法として、**「このフォルダー内の SKILL.md を読んで、その指示に従ってください」と Agent に伝えます**。

これで完了です。例については [使い方](#how-to-use-it) に進んでください。

## SKILL.md

`seedance2/SKILL.md`を、以下の完全な内容で作成します（`description`には「何をするか + いつ使うか」が記述され、エージェントが自動的にトリガーする際に使用します）。

````markdown theme={null}
---
name: seedance2
description: Generate videos via APIYI's Seedance 2.5 and 2.0 (doubao-seedance-2-5 / doubao-seedance-2-0 series) models — text-to-video, image-to-video (first/last frame), and reference-image-to-video, with synced audio by default. Use this when the user asks to create, generate, or animate a video clip.
allowed-tools: Bash(python3 *)
---

# Seedance Video Skill

Generate videos through the APIYI platform using Seedance 2.5 (`doubao-seedance-2-5-260628`) and 2.0 (`doubao-seedance-2-0` series). Defaults to the fastest and cheapest mini model, with synced audio built in.

## Key configuration

The script auto-reads `APIYI_API_KEY` from a `.env` file in the skill folder (an environment variable of the same name also works).
If it reports "API key not found", ask the user to add a line `APIYI_API_KEY=sk-xxx` to `.env`;
the token must have the `SeeDance2` group enabled with pay-as-you-go billing — **all four models live there**;
`mini` and `fast` also have the discounted `SD2Mini` / `SD2Fast`.

## Usage (important: generation takes 2-5 minutes)

Video generation is an **async task**: the script submits the task and polls until done, so one call usually takes 2-5 minutes in total.
**Run it with a long command timeout (600+ seconds) or in the background** — do not use a default 2-minute timeout, or the script gets killed before the video is ready.

```bash
# テキストから動画へ（デフォルト：mini / 720p / 5秒 / 音声あり）
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "草原で蝶を追いかけるオレンジ色の猫、ゆっくりしたトラッキングショット、自然光" -o cat.mp4

# 画像から動画へ（最初のフレーム — 静止画像をアニメーション化）
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "カメラがゆっくりと前進し、光が流れる" -i photo.jpg -o animated.mp4

# 最初のフレームから最後のフレームへのトランジション
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "最初のフレームから最後のフレームへのスムーズなトランジション" -i first.png --last-frame last.png -o morph.mp4

# 参照画像から動画へ（参照したキャラクターやスタイルを維持、最大9枚）
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "参照画像のキャラクターが雪の中を走る" --ref-image role.png -o run.mp4

# 高品質：標準モデル + 1080p + 10秒
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "秋の渓谷上空を飛ぶドローンショット、シネマティック" --model std --resolution 1080p --duration 10 -o valley.mp4

# Seedance 2.5：30秒クリップ（5秒のクリップの6倍のコスト — 事前にユーザーへ確認）
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "秋の渓谷上空を飛ぶドローン、ワンカットの連続撮影" --model sd25 --duration 30 -o long.mp4

# Seedance 2.5：カラーグレーディング用のmov出力
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "岩に打ち寄せる波、スローモーション" --model sd25 --output-format mov -o waves.mov
```

Parameters:

- 1st positional argument: the prompt (required). Describing scene + camera motion + mood works best.
- `--model`: `mini` (default, fastest and cheapest) / `fast` / `std` / `sd25` (**Seedance 2.5** — up to 30 s, 30 reference images, 1080p and mov; about 1.5x the price of `std`, same group as the 2.0 family).
- `--resolution`: `480p` / `720p` (default) / `1080p` (`sd25` and `std` only). No model supports 4k.
- `--ratio`: `adaptive` (default) / `16:9` / `4:3` / `1:1` / `3:4` / `9:16` / `21:9`; all ratios cost the same within a tier.
- `--duration`: integer seconds, 4-30 on `sd25` and 4-15 on the 2.0 family, default 5; `-1` lets the model decide. Longer costs more.
- `--no-audio`: disable synced audio (on by default).
- `-i / --image`: first-frame image (local path / URL / `asset://` asset ID); passing it switches to image-to-video. Combine with `--last-frame` for first/last-frame mode.
- `--ref-image`: reference image, repeatable — up to 30 on `sd25`, 9 on the 2.0 family; mutually exclusive with `-i`.
- `--output-format`: `mp4` (default) / `mov`, **`sd25` only**. mov has better colour fidelity but limited player support — do not use it for web or mobile distribution.
- `-o / --out`: output file name, default `output.mp4`.

## Clip count and cost (important)

- **One call produces exactly 1 video** — there is no batch flag. If the user wants several, run sequential calls and warn about cost first.
- Video bills by tokens and is far pricier than images (about \$0.45-0.91 list per 720p/5s clip; longer or sharper costs more).
  Unless the user explicitly asks, **keep the defaults mini / 720p / 5s** — never bump duration, resolution, or switch models on your own.
- **On `sd25`, a 30-second clip costs about \$8.18 and a 1080p/5s clip about \$3.09** — an order of magnitude above the default tier, so always confirm with the user first.

## Output location (important)

- With a **bare file name** for `-o` (like `cat.mp4`), the video goes to the **`seedance-output/` folder in the project root**.
- With a **path containing directories**, it saves to that path (relative paths resolve against the current working directory).
- Never write videos to `/tmp`, scratchpads, or other temp folders — the user won't find them.
- The returned video URL expires in 24 hours; the script already downloads the file locally — the local file is the deliverable.

## When done

The script prints the saved path, file size, elapsed time, and billed tokens — report the path back to the user verbatim.
If it reports a failure (including content-moderation rejections), relay the error as-is and do not retry the same prompt.
On "no available channel for this model", ask the user to check the token's groups: all four models need `SeeDance2`; `mini` / `fast` may also use `SD2Mini` / `SD2Fast`.
````

<Tip>
  `name`は小文字とハイフンのみで構成する必要があります。スラッシュコマンドを使用するエージェントでは、フォルダー名がコマンドになります — `seedance2`によって`/seedance2`が得られます。`${CLAUDE_SKILL_DIR}`はClaude Codeのスキルディレクトリ変数です。その他のエージェントでは、スクリプトの実際のパスを使用してください。
</Tip>

## scripts/seedance\_video.py

`seedance2/scripts/seedance_video.py`を作成します — 純粋な Python 標準ライブラリを使用し、このサイトの[動画生成 API リファレンス](/ja/api-capabilities/seedance2/video-generation)と同じリクエストコードで、動作確認済みです。

```python theme={null}
#!/usr/bin/env python3
"""Generate videos via APIYI's Seedance 2.5 / 2.0 (text / image / reference-image to video). Pure stdlib, zero dependencies."""
import argparse
import base64
import json
import os
import shutil
import sys
import time
import urllib.error
import urllib.request

# Line-buffer stdout even when redirected, so agents can tail progress from the background
sys.stdout.reconfigure(line_buffering=True)

TASKS_URL = "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks"

# Short name -> full model ID
MODELS = {
    "sd25": "doubao-seedance-2-5-260628",
    "mini": "doubao-seedance-2-0-mini-260615",
    "fast": "doubao-seedance-2-0-fast-260128",
    "std": "doubao-seedance-2-0-260128",
}
# Resolution caps per model (mini/fast reject 1080p upstream with 400; fail fast client-side)
MODEL_CAPS = {
    "sd25": ("480p", "720p", "1080p"),
    "mini": ("480p", "720p"),
    "fast": ("480p", "720p"),
    "std": ("480p", "720p", "1080p"),
}
# Duration cap: 30 s on 2.5, 15 s on the 2.0 family
MAX_DURATION = {"sd25": 30, "mini": 15, "fast": 15, "std": 15}
# Reference-image cap: 30 on 2.5, 9 on the 2.0 family
MAX_REF_IMAGES_BY_MODEL = {"sd25": 30, "mini": 9, "fast": 9, "std": 9}
RATIOS = ("adaptive", "16:9", "4:3", "1:1", "3:4", "9:16", "21:9")
MAX_REF_IMAGES = 30

# Generation is async: wait a bit before the first poll; 720p/5s takes ~90-170s in practice
POLL_FIRST_DELAY = 25
POLL_INTERVAL = 15
POLL_TIMEOUT = 15 * 60


def load_api_key():
    """Prefer the environment variable; otherwise look for .env in the script dir and its parent."""
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
    """Walk up from the script location to the first dir containing .git or .claude; else use cwd."""
    d = os.path.dirname(os.path.abspath(__file__))
    while True:
        if os.path.isdir(os.path.join(d, ".git")) or os.path.isdir(os.path.join(d, ".claude")):
            return d
        parent = os.path.dirname(d)
        if parent == d:
            return os.getcwd()
        d = parent


def resolve_path(out):
    """Bare file name -> save under <project root>/seedance-output/ so it's easy to find; else use the given path."""
    if os.path.dirname(out):
        return os.path.abspath(out)
    out_dir = os.path.join(project_root(), "seedance-output")
    os.makedirs(out_dir, exist_ok=True)
    return os.path.join(out_dir, out)


def image_source(src):
    """Image inputs: pass URLs / asset:// / data: through as-is; encode local files as base64 data URIs."""
    if src.startswith(("http://", "https://", "asset://", "data:")):
        return src
    if not os.path.exists(src):
        sys.exit(f"Image file not found: {src}")
    ext = src.lower().rsplit(".", 1)[-1]
    mime = {"png": "image/png", "webp": "image/webp"}.get(ext, "image/jpeg")
    with open(src, "rb") as f:
        return f"data:{mime};base64,{base64.b64encode(f.read()).decode()}"


def api_request(url, api_key, body=None):
    """The gateway labels responses content-encoding: gzip without compressing them — Accept-Encoding: identity is required."""
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
        raise RuntimeError(f"Request failed HTTP {e.code}: {e.read().decode(errors='replace')[:800]}")


def download(url, path):
    """Download the result video: it's a signed URL — do NOT send the Authorization header."""
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
        sys.exit("API key not found: add a line APIYI_API_KEY=sk-xxx to .env in the skill folder"
                 " (the token needs the SeeDance2 group; mini / fast may also use SD2Mini / SD2Fast)")

    parser = argparse.ArgumentParser(description="Seedance 2.5 / 2.0 video generation")
    parser.add_argument("prompt", help="prompt (scene + camera motion + mood)")
    parser.add_argument("--model", default="mini", choices=sorted(MODELS),
                        help="mini=fastest & cheapest (default) / fast / std / "
                             "sd25=Seedance 2.5 (up to 30 s, 30 reference images, 1080p and mov)")
    parser.add_argument("--resolution", default="720p", choices=("480p", "720p", "1080p"),
                        help="resolution, default 720p")
    parser.add_argument("--ratio", default="adaptive", choices=RATIOS,
                        help="aspect ratio, default adaptive (same price across ratios per tier)")
    parser.add_argument("--duration", type=int, default=5,
                        help="duration in integer seconds (4-30 on sd25, 4-15 on the 2.0 family), "
                             "or -1 to let the model decide; default 5")
    parser.add_argument("--output-format", default=None, choices=("mp4", "mov"),
                        help="output container, sd25 only; mov has better colour fidelity but limited player support")
    parser.add_argument("--no-audio", action="store_true",
                        help="disable synced audio (on by default)")
    parser.add_argument("--seed", type=int, default=None, help="random seed, for reproducibility")
    parser.add_argument("-i", "--image", help="first-frame image (local path / URL / asset://); enables image-to-video")
    parser.add_argument("--last-frame", help="last-frame image, used together with -i")
    parser.add_argument("--ref-image", action="append", default=[],
                        help=f"reference image (repeatable; up to {MAX_REF_IMAGES} on sd25, 9 on the 2.0 family); "
                             "mutually exclusive with -i")
    parser.add_argument("-o", "--out", default="output.mp4", help="output file name")
    args = parser.parse_args()

    if args.image and args.ref_image:
        sys.exit("First-frame mode (-i) and reference mode (--ref-image) are mutually exclusive.")
    if args.last_frame and not args.image:
        sys.exit("--last-frame must be used together with -i (first-frame image).")
    max_refs = MAX_REF_IMAGES_BY_MODEL[args.model]
    if len(args.ref_image) > max_refs:
        sys.exit(f"{args.model} accepts at most {max_refs} reference images"
                 f"{' (use --model sd25 for 30)' if max_refs == 9 else ''}.")
    max_dur = MAX_DURATION[args.model]
    if args.duration != -1 and not 4 <= args.duration <= max_dur:
        sys.exit(f"{args.model} supports durations of 4-{max_dur} whole seconds, or -1 for smart duration"
                 f"{' (use --model sd25 for 30 s)' if max_dur == 15 else ''}.")
    if args.resolution not in MODEL_CAPS[args.model]:
        sys.exit(f"{args.model} supports up to {MODEL_CAPS[args.model][-1]}; "
                 f"use --model sd25 or --model std for 1080p.")
    # 2.5 forces ratio=adaptive on first-frame / first+last-frame tasks; fail fast client-side
    if args.model == "sd25" and args.image and args.ratio != "adaptive":
        sys.exit("Seedance 2.5 requires --ratio adaptive for first-frame / first+last-frame tasks (upstream constraint).")
    if args.output_format and args.model != "sd25":
        sys.exit("--output-format is supported on Seedance 2.5 (--model sd25) only.")

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
        sys.exit(f"Submission failed: {e}")
    task_id = task.get("id")
    if not task_id:
        sys.exit(f"Submission failed, response: {json.dumps(task, ensure_ascii=False)[:500]}")
    print(f"Task submitted task_id={task_id}; generation usually takes 2-5 minutes, polling...")

    t0 = time.time()
    time.sleep(POLL_FIRST_DELAY)
    while True:
        try:
            task = api_request(f"{TASKS_URL}/{task_id}", api_key)
        except (RuntimeError, OSError) as e:  # network hiccups don't stop the poll loop
            print(f"  poll error (continuing): {e}")
            time.sleep(POLL_INTERVAL)
            continue
        status = task.get("status", "unknown")
        elapsed = round(time.time() - t0)
        print(f"  [{elapsed:>4}s] status={status}")
        if status in ("succeeded", "failed", "expired"):
            break
        if time.time() - t0 > POLL_TIMEOUT:
            sys.exit(f"Polling timed out ({POLL_TIMEOUT}s). The task is still server-side; query it later:\n"
                     f"  GET {TASKS_URL}/{task_id}")
        time.sleep(POLL_INTERVAL)

    if status != "succeeded":
        err = task.get("error") or task
        sys.exit(f"Generation failed (status={status}): {json.dumps(err, ensure_ascii=False)[:500]}")

    video_url = (task.get("content") or {}).get("video_url")
    if not video_url:
        sys.exit(f"Task succeeded but no video URL returned: {json.dumps(task, ensure_ascii=False)[:500]}")

    path = resolve_path(args.out)
    size = download(video_url, path)
    tokens = (task.get("usage") or {}).get("completion_tokens", "?")
    print(f"Video saved to {path} ({size / 1e6:.1f} MB, {round(time.time() - t0)}s elapsed, "
          f"billed {tokens} tokens)")


if __name__ == "__main__":
    main()
```

## モデルの切り替え方法

モデルの切り替えは\*\*`--model`だけ\*\*で、4つの値を指定します。

```text theme={null}
... seedance_video.py "prompt"                                    # default mini (fastest & cheapest)
... seedance_video.py "prompt" --model fast                       # fast edition
... seedance_video.py "prompt" --model std --resolution 1080p     # standard edition
... seedance_video.py "prompt" --model sd25 --duration 30         # Seedance 2.5 - up to 30 seconds
```

<Info>
  **token のグループによって呼び出せるモデルが決まります**：`SeeDance2`（0.18x）は**4つすべてのモデル**（`sd25` / `std` / `fast` / `mini`）に対応します。割引グループは**単一モデル用のレーン**です。`SD2Mini`（0.10x）は`mini`のみに、`SD2Fast`（0.15x）は`fast`のみに対応し、割引 token で他のモデルを呼び出すと「このモデルに利用可能なチャネルがありません」と返されます。**`SeeDance2`の token が1つあれば十分です**。利用量に見合うようになったら、専用の割引 token を開設してください。詳しくは[概要ページのグループに関する注記](/ja/api-capabilities/seedance2/overview)をご覧ください。
</Info>

## 2〜5分の待ち時間を想定してください（重要）

動画生成は**非同期タスク**です。画像機能との最大の違いはここです。

* スクリプトが全体の流れをまとめて処理します。送信 → 15秒ごとにポーリング → 成功時に mp4 を自動ダウンロード。**720p/5秒のクリップは、開始から終了まで約2〜3分かかります**。1080p や長い尺ではさらに時間がかかります。
* **コマンドには長めのタイムアウト（600秒以上）を設定するか、バックグラウンドで実行してください**。多くのエージェントはデフォルトの2分でコマンドを終了させてしまい、動画が完成する前に止まってしまいます。その点は`SKILL.md`に明記されており、Claude Code のようにバックグラウンド実行に対応したエージェントは自動的に処理します。
* もしポーリングがタイムアウト（15分）しても、タスクはサーバー側でまだキューに入っています。スクリプトは`task_id`と検索用コマンドを出力するので、後から取得できます。**無駄な課金はありません**。Seedance 2.0 は送信時に事前チャージし、完了時に差額を返金します。また、拒否された送信（HTTP 400）は課金されません。

## 1文で動画が生成される理由

よくある疑問です。私はコマンドを入力していないのに、どうして「猫の動画を作成して」でクリップが生成されたのでしょうか？

仕組みはこうです。起動時に、エージェントは各スキルの`description`をその`SKILL.md`で読み込みます（つまり「このスキルが何をするのか、いつ使うのか」を示す短いメタデータです）。あなたのリクエストがその説明に**一致**すると（たとえば「動画を生成する／作成する」「この画像をアニメーション化する」など）、エージェントは**自分でそのスキルを呼び出すと判断し**、完全な`SKILL.md`を読み込み、スクリプトを実行します。コマンドを覚えておく必要はありません。

エージェントの推測に頼りたくない場合は、下記の**明示的な呼び出し**を使うことで、**完全に制御**できます。

## 使い方

### 自然言語（暗黙トリガー）

インストール後は、エージェントに話しかけるだけです：

| あなたが言うこと                     | スキルの動作                                             |
| ---------------------------- | -------------------------------------------------- |
| "草の上を走る猫の動画を生成して"            | デフォルトの `mini` / 720p / 5 s、音声付きの mp4 1本            |
| "このポスターをモーション動画にして"          | `-i poster.png` を追加し、先頭フレームの画像から動画化                |
| "10 秒の 1080p のドローンショット"      | `--model std --resolution 1080p --duration 10` を追加 |
| "これらのキャラクター画像をパルクールクリップに使って" | 参照画像付きで `--ref-image` を追加                          |
| "背景音なし"                      | `--no-audio` を追加                                   |

### 明示的な呼び出し（より細かく制御）

* **スラッシュコマンド対応のエージェント**（例：Claude Code）:

  ```text theme={null}
  /seedance2 Drone shot over an autumn valley, golden forest, cinematic --duration 8 --ratio 16:9
  ```

* **任意のエージェント / スクリプトを直接実行するよう指示**（最も汎用的）:

  ```text theme={null}
  Run python3 seedance2/scripts/seedance_video.py "Drone shot over an autumn valley, cinematic" --duration 8
  ```

## 生成されたビデオの保存先

* `-o` に対して **ディレクトリを含まないファイル名**（`-o cat.mp4` のような）を使うと、ビデオはプロジェクトルート直下の **`seedance-output/` フォルダ** に（自動作成で）保存され、プロジェクト内に配置されます。
* 「プロジェクトルート」= スクリプトから上方向にたどって見つかる、`.git` または `.claude` を含む最初のディレクトリです。**エージェントがどこで実行されても、ビデオはプロジェクト内に残り、一時フォルダに紛れません。**
* 完了時には、スクリプトが **完全な絶対パスを含む 1 行** を、ファイルサイズ、経過時間、課金された token とともに出力します。例: `Video saved to /Users/you/project/seedance-output/cat.mp4 (3.8 MB, 132s elapsed, billed 108900 tokens)`。
* 返される video URL の有効期限は 24 時間です。そのため、スクリプトは必ず最初にダウンロードします。**ローカルの mp4 が納品物**であり、結果として URL を保持しないでください。
* **ディレクトリを含むパス**（`-o videos/cat.mp4` のような、または絶対パス）を使うと、`seedance-output/` を省略してその場所に正確に保存されます。

## 関連ドキュメント

* [Seedance 2.0 概要](/ja/api-capabilities/seedance2/overview)（モデル、価格、グループ）
* [動画生成 API リファレンス](/ja/api-capabilities/seedance2/video-generation)（完全なパラメータとエンドポイント）
* [アセット参照による動画生成](/ja/api-capabilities/seedance2/asset-reference)（キャラクターの一貫性、`asset://` アセット）
* [GPT-Image-2 シリーズ エージェントスキル](/ja/api-capabilities/gpt-image-2/skills)（画像側の姉妹版）
* [Nano Banana Pro エージェントスキル](/ja/api-capabilities/nano-banana-image/skills)
