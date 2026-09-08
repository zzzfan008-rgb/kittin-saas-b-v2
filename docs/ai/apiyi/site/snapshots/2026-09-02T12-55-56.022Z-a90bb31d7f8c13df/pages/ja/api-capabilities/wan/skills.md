> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan2.7 と HappyHorse の Video Agent Skill

> Alibaba の動画モデル Wan2.7 と HappyHorse を 1 つのすぐに使える Agent Skill にまとめます。Codex、OpenClaw、Claude Code、または任意のコーディングエージェントにそのまま組み込み、1 文で text-to-video、image-to-video、reference-to-video、video editing を実行できます。--model でシリーズを切り替え、ローカル画像は直接アップロードできます。

<Note>
  このページでは、**すぐに使える Agent Skill** を提供しています。依存関係ゼロのスクリプト 1 つで、**Wan2.7** と **HappyHorse** の両シリーズをカバーします。これらは 1 つのエンドポイント、1 つのリクエスト構造、そして `Wan&HappyHorse` token グループを共有しており、`--model` で切り替えます。このスクリプトは、渡したアセット（text / image / reference / video-edit）から適切なモデルを自動で選び、非同期の送信 → ポーリング → ダウンロードの一連の流れをまとめて処理します。全体はたった 2 ファイルです。
</Note>

## このスキルでできること

1つにまとめたスキルです。スクリプトは、**どのアセットを渡すか** から生成モードとモデル ID を導き出します:

<CardGroup cols={2}>
  <Card title="Text to video" icon="clapperboard">
    promptのみ → 新規の動画を作成します。prompt の自動拡張はデフォルトで有効なので、短いpromptでもうまく機能します。
  </Card>

  <Card title="Image to video" icon="image-play">
    最初のフレーム画像を渡して静止画をアニメーション化します。ローカル画像は直接アップロードされるため、画像ホスティングは不要です。
  </Card>

  <Card title="Reference to video" icon="layers">
    参照画像を渡します（Wan では参照動画も受け付けます）→ キャラクター、オブジェクト、またはスタイルを維持した新しい映像を生成します。prompt 内では「image 1 / video 1」と指定してください。
  </Card>

  <Card title="Video editing" icon="scissors">
    動画 + 参照画像を渡します → 動画内の要素を置き換えたり、スタイルを変更したりします。出力の長さは元のソースに従います。
  </Card>
</CardGroup>

## どのシリーズを選ぶか

2つのシリーズは**まったく同じ名前で呼ばれています**。異なるのは価格、見た目の仕上がり、参照アセット機能です。スクリプトは`--model`ごとの違いを処理します。

| シリーズ（`--model`） | 位置づけ        | 720P価格    | 1080P価格   | \~720P/5s  | 参照アセット       | 720P/5s速度（実測） |
| --------------- | ----------- | --------- | --------- | ---------- | ------------ | ------------- |
| `wan`（デフォルト）    | コスパ重視、量産に最適 | \$0.084/s | \$0.14/s  | **\$0.42** | 画像 + 動画、合計5点 | 45–155s       |
| `happyhorse`    | 品質重視        | \$0.126/s | \$0.224/s | **\$0.63** | 画像のみ、最大9点    | 105–125s      |

<Tip>
  目安としては、**日常利用や大量利用ではデフォルトの`wan`を使い続ける**、**見た目の品質が最優先なら** → `--model happyhorse` です。どちらも`Wan&HappyHorse`グループ（0.14xのレート倍率＝公式CNY価格の約98％、チャージボーナスでさらに安くなります）を共有しており、1つのtokenで両方に対応し、別個の割引グループはありません。課金は秒単位で行われ、失敗したタスクに課金されることはありません。詳細な料金は [Wan 概要](/ja/api-capabilities/wan/overview) と [HappyHorse 概要](/ja/api-capabilities/happyhorse/overview) をご覧ください。
</Tip>

## どのエージェントが使用できますか

<Info>
  Skill は実質的には **フォルダ** です: エージェントが読むためのメモ (`SKILL.md`) と、作業を行うスクリプトが入っています。したがって、**ローカルファイルを読み取り、シェルコマンドを実行できるあらゆるコーディングエージェントなら使用できます** — **Codex, OpenClaw, hermes-agent, Claude Code** などです。

  必要条件は1つだけです: エージェントを実行するマシン（お使いのノートPCやサーバー）に **Python 3** と **インターネット接続** があり、（スクリプトが `api.apiyi.com` を直接呼び出します）。スクリプトは Python の標準ライブラリしか使用しません — **`pip install`** は不要です。
</Info>

## 3ステップで設定する

### ① フォルダを作成して、ファイルを貼り付けます

スキルフォルダを作成し、下の2つのファイルを配置します（完全な内容は次の2つのセクションにあります）:

```
wan/
├── SKILL.md
├── scripts/
│   └── wan_video.py
└── .env          # created in step ②, holds your key
```

### ② その隣にキーを書き込みます

`wan/.env` に **APIYI APIキー** を書き込みます（`api.apiyi.com` コンソールで1つ作成します。**その token には `Wan&HappyHorse` グループが有効になっている必要があります**。従量課金 billing を使用してください。呼び出しごとの課金 token はルーティングできません）:

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

このスクリプトは、この `.env` からキーを自動的に読み込みます — **追加の設定や環境変数は不要です**。

<Warning>
  `.env` には秘密 key が格納されています。スキルがプロジェクトリポジトリ内で共有される場合は、**`.env` を `.gitignore` に追加し、決してコミットしないでください**。
</Warning>

### ③ エージェントに渡します

* **スキルの自動検出に対応したエージェント**（例: Claude Code）の場合: この `wan/` フォルダ全体を、そのスキルディレクトリに入れてください — 個人用の `~/.claude/skills/`、またはプロジェクトレベルの `.claude/skills/`（リポジトリと共有）。
* **その他のエージェント**: それぞれのスキル/プラグインの規約に従ってください。最も簡単なのは — **エージェントに「このフォルダの SKILL.md を読んで、それに従ってください」と伝えることです**。

これで完了です — 例については [使い方](#how-to-use-it) をご覧ください。

## SKILL.md

以下の完全な内容を含む `wan/SKILL.md` を作成してください（`description` には「何をするか + いつ使うか」が記載されており、エージェントが自動トリガーする際に使われます）:

````markdown theme={null}
---
name: wan
description: Generate videos via APIYI's Wan2.7 and HappyHorse (Alibaba) models — text-to-video, image-to-video (first frame), reference-image/video-to-video, and video editing. Use this when the user asks to create, generate, or animate a video clip, or to restyle/edit an existing video.
allowed-tools: Bash(python3 *)
---

# Wan2.7 / HappyHorse Video Skill

Generate videos through the APIYI platform using Alibaba's video models. One script covers two series, switched by `--model`:

- `wan` (default): the Wan2.7 series, cheaper (720P about \$0.084/s).
- `happyhorse`: the HappyHorse-1.1 series, quality-oriented, about 1.5× the price of wan; no reference-video support.

The script picks the model from the assets you pass: no image = text-to-video; `-i` first frame = image-to-video; `--ref-image`/`--ref-video` = reference-to-video; `--video`+`--ref-image` = video editing.

## Key configuration

The script auto-reads `APIYI_API_KEY` from a `.env` file in the skill folder (an environment variable of the same name also works).
If it reports "API key not found", ask the user to add a line `APIYI_API_KEY=sk-xxx` to `.env`;
the token must have the `Wan&HappyHorse` group enabled with pay-as-you-go billing (per-call billing tokens cannot be routed).

## Usage (important: generation takes 2-5 minutes)

Video generation is an **async task**: the script submits and polls until done, so one call usually takes 2-5 minutes (longer for 1080P or long clips).
**Run it with a long command timeout (600+ seconds) or in the background** — do not use a default 2-minute timeout, or the script gets killed before the video is ready.

```bash
# テキストから動画へ（デフォルト wan / 720P / 5 s）
python3 ${CLAUDE_SKILL_DIR}/scripts/wan_video.py "夜の東京の街、ネオンの光、傘を差した歩行者、雨の雰囲気" -o tokyo.mp4

# 画像から動画へ（最初のフレーム; ローカルパスまたは公開 URL のどちらでも動作します — ローカルファイルは base64 として自動アップロードされます）
python3 ${CLAUDE_SKILL_DIR}/scripts/wan_video.py "カメラがゆっくり寄り、光が流れる" -i photo.jpg -o animated.mp4

# 参照画像から動画へ（キャラクター/スタイルを維持; プロンプト内ではアセットを "image 1 / image 2" として参照してください）
python3 ${CLAUDE_SKILL_DIR}/scripts/wan_video.py "image 1 のキャラクターが雪の中を走る" --ref-image role.png -o run.mp4

# 動画編集（参照画像を使って動画内の要素を変更）
python3 ${CLAUDE_SKILL_DIR}/scripts/wan_video.py "動画 1 の人物を image 1 のキャラクターに置き換える" --video https://example.com/src.mp4 --ref-image https://example.com/role.png -o edited.mp4

# HappyHorse に切り替え、1080P を指定
python3 ${CLAUDE_SKILL_DIR}/scripts/wan_video.py "秋の谷の上空をドローンで撮影したシネマティックなショット" --model happyhorse --resolution 1080P --duration 8 -o valley.mp4
```

Parameters:

- 1st positional argument: the prompt (required). With multiple assets, refer to them in order as "image 1 / video 1".
- `--model`: `wan` (default) / `happyhorse`.
- `--resolution`: `720P` (default) / `1080P` (note the uppercase P; there is no 480P tier).
- `--ratio`: `16:9` / `9:16` / `1:1` / `4:3` / `3:4` (ignored when a first-frame image is given; happyhorse docs don't list it — sent only when passed explicitly).
- `--duration`: integer seconds 2-15, default 5; capped at 10 with reference videos; edit mode follows the source video.
- `--negative`: negative prompt. `--no-prompt-extend`: disable prompt auto-expansion (on by default).
- `-i / --image`: first-frame image (local path or URL). `--ref-image`: reference image, repeatable (wan: 5 combined with videos; happyhorse: up to 9). `--ref-video`: reference video URL (wan only). `--video`: video to edit (URL).
- `-o / --out`: output file name, default `output.mp4`.

## Asset inputs (important)

- Image assets: **local files and public URLs both work** — the script converts local files to base64 data URIs (verified working on both series; official docs only document the URL path).
- Video assets (`--ref-video` / `--video`): prefer public URLs; base64-encoding large videos inflates the payload and may exceed request limits.

## Clip count and cost (important)

- **One call produces exactly 1 video** — there is no batch flag. If the user wants several, run sequential calls and warn about cost first.
- Billing is per second: wan 720P \$0.084/s (about \$0.42 for 5 s), 1080P \$0.14/s; happyhorse is about 1.5× wan.
  Unless the user explicitly asks, **keep the defaults wan / 720P / 5s** — never bump duration, resolution, or switch to happyhorse on your own.
- Failed tasks are never billed; duplicate submissions bill twice — do not auto-retry the same request.

## Output location (important)

- With a **bare file name** for `-o` (like `cat.mp4`), the video goes to the **`wan-output/` folder in the project root**.
- With a **path containing directories**, it saves to that path (relative paths resolve against the current working directory).
- Never write videos to `/tmp`, scratchpads, or other temp folders — the user won't find them.
- The result URL expires in 24 hours; the script already downloads the file locally — the local file is the deliverable.

## When done

The script prints the saved path, file size, and elapsed time — report the path back to the user verbatim.
If it reports a failure (including content-moderation rejections), relay the error as-is and do not retry the same prompt.
On "no available channel for this model", ask the user to check the token's group includes `Wan&HappyHorse` and billing mode is pay-as-you-go.
````

<Tip>
  `name` は小文字の英字 + ハイフンである必要があります。スラッシュコマンド対応のエージェントでは、フォルダ名がコマンドです — `wan` で `/wan` を取得できます。`${CLAUDE_SKILL_DIR}` は Claude Code の skill-directory 変数です。他のエージェントでは、スクリプトの実際のパスをそのまま使用してください。
</Tip>

## scripts/wan\_video.py

`wan/scripts/wan_video.py` を作成します — 純粋な Python 標準ライブラリで、このサイトの API リファレンスページと同じリクエストコード、動作確認済み:

```python theme={null}
#!/usr/bin/env python3
"""Generate videos via APIYI's Wan2.7 / HappyHorse (text / image / reference to video, video editing). Pure stdlib, zero dependencies."""
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

# DashScope passthrough endpoint. NEVER use the flat /v1/videos path — it drops the media field
CREATE_URL = "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis"
TASK_URL = "https://api.apiyi.com/v1/tasks/{}"

# family x mode -> model ID. Edit-model naming is irregular (happyhorse is 1.0 with a hyphen) — don't hand-build these
FAMILY_MODELS = {
    "wan": {"t2v": "wan2.7-t2v", "i2v": "wan2.7-i2v",
            "r2v": "wan2.7-r2v", "edit": "wan2.7-videoedit"},
    "happyhorse": {"t2v": "happyhorse-1.1-t2v", "i2v": "happyhorse-1.1-i2v",
                   "r2v": "happyhorse-1.1-r2v", "edit": "happyhorse-1.0-video-edit"},
}
# r2v reference caps: wan 5 images+videos combined, happyhorse images only, up to 9
MAX_REFS = {"wan": 5, "happyhorse": 9}
RATIOS = ("16:9", "9:16", "1:1", "4:3", "3:4")

# Generation is async: 720P/5s takes ~70-140s in practice, 1080P/long clips can exceed 5 minutes
POLL_FIRST_DELAY = 15
POLL_INTERVAL = 8
POLL_TIMEOUT = 20 * 60


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
    """Bare file name -> save under <project root>/wan-output/ so it's easy to find; else use the given path."""
    if os.path.dirname(out):
        return os.path.abspath(out)
    out_dir = os.path.join(project_root(), "wan-output")
    os.makedirs(out_dir, exist_ok=True)
    return os.path.join(out_dir, out)


def media_source(src):
    """Asset inputs: pass URLs / data: through as-is; encode local files as base64 data URIs (verified on both series)."""
    if src.startswith(("http://", "https://", "data:")):
        return src
    if not os.path.exists(src):
        sys.exit(f"Asset file not found: {src}")
    ext = src.lower().rsplit(".", 1)[-1]
    mime = {"png": "image/png", "webp": "image/webp", "mp4": "video/mp4",
            "mov": "video/quicktime"}.get(ext, "image/jpeg")
    with open(src, "rb") as f:
        return f"data:{mime};base64,{base64.b64encode(f.read()).decode()}"


def api_request(url, api_key, body=None, extra_headers=None):
    """The gateway labels responses content-encoding: gzip without compressing them — Accept-Encoding: identity is required."""
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
        raise RuntimeError(f"Request failed HTTP {e.code}: {e.read().decode(errors='replace')[:800]}")


def download(url, path):
    """Download the result video: it's a signed OSS URL — NEVER send the Authorization header (403 if you do)."""
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
        sys.exit("API key not found: add a line APIYI_API_KEY=sk-xxx to .env in the skill folder"
                 " (the token must have the Wan&HappyHorse group enabled, pay-as-you-go billing)")

    parser = argparse.ArgumentParser(description="Wan2.7 / HappyHorse video generation")
    parser.add_argument("prompt", help="prompt (scene + camera + mood; refer to assets as 'image 1 / video 1')")
    parser.add_argument("--model", default="wan", choices=sorted(FAMILY_MODELS),
                        help="wan=Wan2.7 (default, cheaper) / happyhorse=HappyHorse-1.1 (quality-oriented)")
    parser.add_argument("--resolution", default="720P", type=str.upper,
                        choices=("720P", "1080P"), help="resolution, default 720P (note: no 480P)")
    parser.add_argument("--ratio", default=None, choices=RATIOS,
                        help="aspect ratio (ignored with a first-frame image; undocumented for happyhorse — sent only when passed)")
    parser.add_argument("--duration", type=int, default=5,
                        help="duration 2-15 integer seconds, default 5; capped at 10 with reference videos; edit mode follows the source")
    parser.add_argument("--negative", help="negative prompt (things to avoid, under 500 chars)")
    parser.add_argument("--no-prompt-extend", action="store_true",
                        help="disable prompt auto-expansion (on by default; helps short prompts)")
    parser.add_argument("--seed", type=int, default=None, help="random seed, for reproducibility")
    parser.add_argument("-i", "--image", help="first-frame image (local path or URL); enables image-to-video")
    parser.add_argument("--ref-image", action="append", default=[],
                        help="reference image, repeatable (wan: 5 combined with videos; happyhorse: up to 9)")
    parser.add_argument("--ref-video", action="append", default=[],
                        help="reference video URL, repeatable (wan only)")
    parser.add_argument("--video", help="video to edit (URL; edit mode, requires --ref-image)")
    parser.add_argument("-o", "--out", default="output.mp4", help="output file name")
    args = parser.parse_args()

    if args.image and (args.ref_image or args.ref_video):
        sys.exit("First-frame mode (-i) and reference mode (--ref-image/--ref-video) are mutually exclusive.")
    if args.video and args.image:
        sys.exit("Video-edit mode (--video) and first-frame mode (-i) are mutually exclusive.")
    if args.video and not args.ref_image:
        sys.exit("Video-edit mode needs at least 1 reference image (--ref-image).")
    if args.model == "happyhorse" and args.ref_video:
        sys.exit("happyhorse does not support reference videos (--ref-video); wan only.")
    n_refs = len(args.ref_image) + len(args.ref_video)
    if n_refs > MAX_REFS[args.model]:
        sys.exit(f"{args.model} allows at most {MAX_REFS[args.model]} reference assets, got {n_refs}.")
    if not 2 <= args.duration <= 15:
        sys.exit("Duration must be an integer of 2-15 seconds.")
    if args.ref_video and args.duration > 10:
        sys.exit("Duration is capped at 10 seconds when reference videos are included.")

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
        sys.exit(f"Submission failed: {e}")
    task_id = (resp.get("output") or {}).get("task_id") or resp.get("task_id")
    if not task_id:
        sys.exit(f"Submission failed, response: {json.dumps(resp, ensure_ascii=False)[:500]}")
    print(f"Task submitted model={model} task_id={task_id}; generation usually takes 2-5 minutes, polling...")

    t0 = time.time()
    time.sleep(POLL_FIRST_DELAY)
    while True:
        try:
            task = api_request(TASK_URL.format(task_id), api_key)
        except (RuntimeError, OSError) as e:  # network hiccups don't stop the poll loop
            print(f"  poll error (continuing): {e}")
            time.sleep(POLL_INTERVAL)
            continue
        status = str(task.get("status", "unknown")).lower()
        progress = task.get("progress", "")
        elapsed = round(time.time() - t0)
        # progress often sits at 30 (upstream only reports 0/10/30/100) — it is not stuck
        print(f"  [{elapsed:>4}s] status={status}" + (f" progress={progress}" if progress != "" else ""))
        if status in ("completed", "failed"):
            break
        if time.time() - t0 > POLL_TIMEOUT:
            sys.exit(f"Polling timed out ({POLL_TIMEOUT}s). The task is still server-side; query it later:\n"
                     f"  GET {TASK_URL.format(task_id)}")
        time.sleep(POLL_INTERVAL)

    if status != "completed":
        err = task.get("error") or task.get("fail_reason") or task
        sys.exit(f"Generation failed (status={status}): {json.dumps(err, ensure_ascii=False)[:500]}"
                 "\n(failed tasks are never billed)")

    result_url = task.get("result_url")
    if not result_url:
        sys.exit(f"Task completed but no video URL returned: {json.dumps(task, ensure_ascii=False)[:500]}")

    path = resolve_path(args.out)
    size = download(result_url, path)
    print(f"Video saved to {path} ({size / 1e6:.1f} MB, {round(time.time() - t0)}s elapsed, "
          f"model {model})")


if __name__ == "__main__":
    main()
```

## シリーズの切り替え方法

シリーズの切り替えは **`--model`だけ** です。スクリプトが「シリーズ × アセットタイプ」からモデル ID を算出します：

```text theme={null}
... wan_video.py "prompt"                        # default wan (Wan2.7 series)
... wan_video.py "prompt" --model happyhorse     # HappyHorse-1.1 series
```

<Info>
  **モデル ID 生成表**（覚える必要はありません — スクリプトが自動で選びます）:

  | 渡すアセット                        | モード        | wan                | happyhorse                  |
  | ----------------------------- | ---------- | ------------------ | --------------------------- |
  | prompt のみ                     | テキストから動画   | `wan2.7-t2v`       | `happyhorse-1.1-t2v`        |
  | `-i` 最初のフレーム                  | 画像から動画     | `wan2.7-i2v`       | `happyhorse-1.1-i2v`        |
  | `--ref-image` / `--ref-video` | リファレンスから動画 | `wan2.7-r2v`       | `happyhorse-1.1-r2v`        |
  | `--video` + `--ref-image`     | 動画編集       | `wan2.7-videoedit` | `happyhorse-1.0-video-edit` |
</Info>

## アセット入力: ローカル画像はそのまま使えます（確認済み）

公式ドキュメントでは、メディアは公開アクセス可能な https の URL である必要があるとされていますが、当社のテストでは両方のシリーズが **base64 の data URI を受け付ける** ことが確認できました。そのため、スクリプトはローカル画像を自動変換し、`-i photo.jpg` または `--ref-image role.png` にローカルパスを指定してもそのまま使えます。画像ホストは不要です。動画アセット（`--ref-video` / `--video`）については、引き続き公開 URL が推奨されます。base64 エンコードでは大きなファイルのサイズが約 3 分の 1 増加し、リクエスト制限を超える可能性があるためです。

## 2〜5分の待機を想定してください（重要）

動画生成は **非同期タスク** です。

* スクリプトは全体の流れをまとめて処理します。送信（`X-DashScope-Async` ヘッダー付き）→ 8秒ごとにポーリング → 成功時に mp4 を自動ダウンロード。**720P/5秒のクリップは、端から端までで約45〜155秒かかります（実測）**。1080P 以上、またはより長い場合は 5分を超えることがあります。
* `progress` の値が **長時間30%のままでも正常です**（上流は 0/10/30/100 しか報告しません）— 停止しているわけではありません。
* **コマンドのタイムアウトは長めに設定する（600秒以上）か、バックグラウンドで実行してください** — 多くのエージェントはデフォルトの2分後にコマンドを終了してしまい、動画の準備が整う前に切断されます。`SKILL.md` にもその旨が記載されています。
* もしポーリングがタイムアウトしても（20分）、タスクはサーバー側に残っています。スクリプトは `task_id` とクエリ用コマンドを出力します。**失敗したタスクは課金されません**。ただし、重複送信すると二重課金になるため、スクリプトは自動再試行しません。

## なぜ1文だけで動画が生成されるのか

よくある質問です。私はコマンドを入力していないのに、どうして「動画を作成する」でクリップが生成されたのでしょうか？

仕組みはこうです。起動時に、エージェントは各スキルの`description`をその`SKILL.md`内で**読み取ります**（そのスキルが何をするか、いつ使うかを示す短いメタデータです）。リクエストがその説明に**一致すると**（たとえば「動画を生成する/作成する」、「この画像をアニメーション化する」、「このクリップを編集する」）、エージェントは**自分でそのスキルを呼び出すと判断し**、完全な`SKILL.md`を読み、スクリプトを実行します。コマンドを覚えておく必要はありません。

エージェントの推測に頼りたくない場合は、下の**明示的な呼び出し**を使うと、**完全な制御**が可能です。

## 使い方

### 自然言語（暗黙のトリガー）

インストール後は、エージェントに話しかけるだけです。

| あなたの指示                     | Skill の動作                                     |
| -------------------------- | --------------------------------------------- |
| 「雨の東京の夜の通りの動画を生成して」        | デフォルトの `wan` / 720P / 5 s                     |
| 「このポスターをモーション動画に変換して」      | `-i poster.png`を追加し、ローカル画像を自動アップロードします        |
| 「1080P でより高品質なモデルを使って」     | `--model happyhorse --resolution 1080P`を追加します |
| 「画像1のキャラクターを画像2のシーン内を走らせて」 | 2 つの `--ref-image`を追加し、参照から動画へ変換します           |
| 「この動画の人物をこのキャラクターに置き換えて」   | `--video` + `--ref-image`を追加し、動画編集を行います       |

### 明示的な呼び出し（より細かく制御）

* **スラッシュコマンド対応のエージェント**（例: Claude Code）:

  ```text theme={null}
  /wan Drone shot over an autumn valley, golden forest, cinematic --duration 8 --ratio 16:9
  ```

* **任意のエージェント / スクリプトを直接実行するよう指示**（最も汎用的）:

  ```text theme={null}
  Run python3 wan/scripts/wan_video.py "Drone shot over an autumn valley, cinematic" --duration 8
  ```

## 生成された動画の保存先

* `-o` の **ファイル名だけ**（たとえば `-o cat.mp4`）を指定すると、動画は **プロジェクトルート内の`wan-output/`フォルダ**（自動作成）に保存されます。シリーズはどちらもこのフォルダを共有します。
* 「project root」とは、スクリプトから親方向へたどったときに見つかる `.git` または `.claude` を含む最初のディレクトリです。**エージェントがどこで実行されても、動画はプロジェクト内に残り、一時フォルダに紛れて失われることはありません。**
* 完了時には、スクリプトが **フルの絶対パスを1行で出力**し、あわせてファイルサイズと経過時間も表示します。たとえば `Video saved to /Users/you/project/wan-output/tokyo.mp4 (4.9 MB, 153s elapsed, model wan2.7-t2v)` のようになります。
* 計測された出力には **音声トラック付き**（ステレオ AAC）で含まれます。
* 結果 URL の**有効期限は 24 時間**です。そのため、スクリプトは常に最初にダウンロードします。**ローカルの mp4 が納品物です**。URL を結果として保持しないでください。
* ディレクトリを含むパス（たとえば `-o videos/cat.mp4` または絶対パス）を指定すると、`wan-output/` をスキップして、その場所に正確に保存されます。

## 関連ドキュメント

* [Wan 動画生成の概要](/ja/api-capabilities/wan/overview) (モデル、料金、グループ)
* [Wan2.7 Text-to-Video API リファレンス](/ja/api-capabilities/wan/text-to-video)
* [Wan2.7 Reference-to-Video API リファレンス](/ja/api-capabilities/wan/reference-to-video)
* [HappyHorse 動画エージェントスキル](/ja/api-capabilities/happyhorse/skills) (差分をまとめたサテライトページ)
* [Seedance 2.0 動画エージェントスキル](/ja/api-capabilities/seedance2/skills) (Volcengine 側の姉妹版)
