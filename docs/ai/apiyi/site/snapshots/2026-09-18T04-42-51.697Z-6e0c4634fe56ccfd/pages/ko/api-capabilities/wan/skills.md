> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan2.7 및 HappyHorse 동영상 에이전트 스킬

> 알리바바 동영상 모델 Wan2.7과 HappyHorse를 바로 사용할 수 있는 하나의 에이전트 스킬로 묶어 — Codex, OpenClaw, Claude Code 또는 다른 코딩 에이전트에 그대로 넣고 한 문장으로 텍스트-투-비디오, 이미지-투-비디오, 레퍼런스-투-비디오, 동영상 편집을 수행할 수 있으며, --model로 시리즈를 전환하고 로컬 이미지를 직접 업로드할 수 있습니다.

<Note>
  이 페이지에는 **바로 사용할 수 있는 Agent Skill**이 포함되어 있습니다. 하나의 무의존성 스크립트로 **Wan2.7**과 **HappyHorse** 시리즈를 모두 지원합니다. 이들은 하나의 엔드포인트, 하나의 요청 구조, 그리고 `Wan&HappyHorse` token 그룹을 공유하며, `--model`로 전환됩니다. 이 스크립트는 사용자가 전달하는 자산(텍스트 / 이미지 / 참조 / 비디오 편집)에 따라 올바른 모델을 자동으로 선택하고, 비동기 제출 → 폴링 → 다운로드의 전체 흐름을 감쌉니다. 전체 구성은 파일 두 개뿐입니다.
</Note>

## 이 스킬이 하는 일

하나의 통합 스킬입니다; 스크립트는 **어떤 자산을 전달하는지**에 따라 생성 모드와 모델 ID를 결정합니다:

<CardGroup cols={2}>
  <Card title="텍스트에서 동영상으로" icon="clapperboard">
    prompt만 지정 → 완전히 새로운 동영상이 생성됩니다; prompt 자동 확장이 기본적으로 켜져 있으므로 짧은 prompt도 잘 작동합니다.
  </Card>

  <Card title="이미지에서 동영상으로" icon="image-play">
    첫 프레임 이미지를 전달해 정지 이미지를 움직이게 합니다 — 로컬 이미지는 바로 업로드되므로 이미지 호스팅이 필요 없습니다.
  </Card>

  <Card title="참조 이미지에서 동영상으로" icon="layers">
    참조 이미지를 전달합니다(Wan은 참조 동영상도 사용합니다) → 캐릭터, 오브젝트 또는 스타일을 유지한 새 영상이 생성됩니다; prompt에서 “이미지 1 / 비디오 1”로 지칭합니다.
  </Card>

  <Card title="동영상 편집" icon="scissors">
    동영상 + 참조 이미지를 전달합니다 → 동영상의 요소를 교체하거나 스타일을 변경합니다; 출력 길이는 원본을 따릅니다.
  </Card>
</CardGroup>

## 어떤 시리즈를 선택할지

두 시리즈의 명칭은 **정확히 동일**하며, 가격, 시각적 완성도, 레퍼런스 에셋 기능에서 차이가 있습니다. 스크립트는 `--model`별로 차이를 처리합니다:

| 시리즈 (`--model`) | 포지셔닝              | 720P 가격   | 1080P 가격  | \~720P/5s  | 레퍼런스 에셋             | 720P/5s 속도(실측) |
| --------------- | ----------------- | --------- | --------- | ---------- | ------------------- | -------------- |
| `wan` (기본값)     | 가성비 선택, 대량 사용에 최적 | \$0.084/s | \$0.14/s  | **\$0.42** | 이미지 + 동영상, 최대 5개 조합 | 45–155s        |
| `happyhorse`    | 품질 지향             | \$0.126/s | \$0.224/s | **\$0.63** | 이미지만, 최대 9개         | 105–125s       |

<Tip>
  일반적인 기준으로는 **일상 및 대량 사용에는 기본 `wan`를 유지하십시오**; **시각적 품질이 가장 중요할 때** → `--model happyhorse`. 둘 다 `Wan&HappyHorse` 그룹(0.14x 요율 배수 ≈ 공식 CNY 가격의 98%, 충전 보너스가 있으면 더 낮아짐)을 공유합니다 — 하나의 token으로 둘 다 사용할 수 있으며, 별도의 할인 그룹은 없습니다. 과금은 초 단위이며, 실패한 작업은 과금되지 않습니다. 전체 요금은 [Wan Overview](/ko/api-capabilities/wan/overview)와 [HappyHorse Overview](/ko/api-capabilities/happyhorse/overview)에서 확인할 수 있습니다.
</Tip>

## 어떤 에이전트가 사용할 수 있나요

<Info>
  스킬은 본질적으로 **폴더 하나**입니다: 에이전트가 읽을 메모(`SKILL.md`)와 작업을 수행하는 스크립트로 구성됩니다. 따라서 **로컬 파일을 읽고 셸 명령을 실행할 수 있는 모든 코딩 에이전트는 이를 사용할 수 있습니다** — **Codex, OpenClaw, hermes-agent, Claude Code** 등입니다.

  유일한 요구 사항은 에이전트를 실행하는 머신(노트북이나 서버)에 **Python 3**와 **인터넷 연결**이 있어야 한다는 점입니다(스크립트가 `api.apiyi.com`를 직접 호출합니다). 이 스크립트는 Python 표준 라이브러리만 사용하므로 — **`pip install`할 필요는 없습니다**.
</Info>

## 3단계로 설정하기

### ① 폴더를 만들고 파일을 붙여 넣습니다

스킬 폴더를 만들고 아래의 두 파일을 넣습니다(전체 내용은 다음 두 섹션에 있습니다):

```
wan/
├── SKILL.md
├── scripts/
│   └── wan_video.py
└── .env          # created in step ②, holds your key
```

### ② 키를 옆에 넣습니다

`wan/.env`에 **APIYI API key**를 적습니다(`api.apiyi.com` 콘솔에서 하나를 생성하십시오. **token에는 반드시 `Wan&HappyHorse` 그룹이 활성화되어 있어야 하며** 종량제 과금이어야 합니다. 호출당 과금 token은 라우팅할 수 없습니다):

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

스크립트는 이 `.env`에서 키를 자동으로 읽습니다 — **추가 설정이나 환경 변수는 필요하지 않습니다**.

<Warning>
  `.env`에는 비밀 키가 들어 있습니다. 이 스킬이 프로젝트 레포지토리 안에서 공유되는 경우, **`.env`를 `.gitignore`에 추가하고 절대 커밋하지 마십시오**.
</Warning>

### ③ Agent에 전달합니다

* **스킬 자동 발견 기능이 있는 Agent**(예: Claude Code): 전체 `wan/` 폴더를 스킬 디렉터리에 넣으십시오 — 개인 `~/.claude/skills/` 또는 프로젝트 수준 `.claude/skills/`(레포지토리와 공유)입니다.
* **다른 Agent**: 해당 Agent의 스킬/플러그인 규칙을 따르십시오. 또는 가장 간단하게는 — **Agent에게 “이 폴더의 SKILL.md를 읽고 그대로 따르라”고 지시하십시오**.

이상입니다 — 예제는 [사용 방법](#how-to-use-it)으로 이동하십시오.

## SKILL.md

아래의 전체 내용으로 `wan/SKILL.md`를 생성하십시오 (`description`에는 “무엇을 하는지 + 언제 사용해야 하는지”가 적혀 있으며, 이는 에이전트가 자동으로 트리거하는 데 사용하는 정보입니다):

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
# 텍스트를 동영상으로 (기본 wan / 720P / 5 s)
python3 ${CLAUDE_SKILL_DIR}/scripts/wan_video.py "밤의 도쿄 거리, 네온사인, 우산을 든 보행자, 비 오는 분위기" -o tokyo.mp4

# 이미지를 동영상으로 (첫 프레임; 로컬 경로나 공개 URL 모두 작동합니다 — 로컬 파일은 base64로 자동 업로드됩니다)
python3 ${CLAUDE_SKILL_DIR}/scripts/wan_video.py "카메라가 천천히 밀려들고, 빛이 흐릅니다" -i photo.jpg -o animated.mp4

# 참조 이미지를 동영상으로 (캐릭터/스타일 유지; prompt에서 에셋을 "image 1 / image 2"로 지칭합니다)
python3 ${CLAUDE_SKILL_DIR}/scripts/wan_video.py "image 1의 캐릭터가 눈 속을 달립니다" --ref-image role.png -o run.mp4

# 동영상 편집 (참조 이미지를 사용하여 동영상의 요소를 수정합니다)
python3 ${CLAUDE_SKILL_DIR}/scripts/wan_video.py "video 1의 사람을 image 1의 캐릭터로 교체합니다" --video https://example.com/src.mp4 --ref-image https://example.com/role.png -o edited.mp4

# HappyHorse로 전환하고 1080P를 요청합니다
python3 ${CLAUDE_SKILL_DIR}/scripts/wan_video.py "가을 계곡 위를 나는 드론 샷, 시네마틱" --model happyhorse --resolution 1080P --duration 8 -o valley.mp4
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
  `name`는 소문자와 하이픈만 사용해야 합니다. 슬래시 명령을 지원하는 에이전트에서는 폴더 이름이 명령입니다 — `wan`를 입력하면 `/wan`를 사용할 수 있습니다. `${CLAUDE_SKILL_DIR}`는 Claude Code의 skill-directory 변수이며, 다른 에이전트에서는 스크립트의 실제 경로를 사용하십시오.
</Tip>

## scripts/wan\_video.py

Create `wan/scripts/wan_video.py` — pure Python standard library, same request code as this site's API reference pages, verified working:

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

## 시리즈를 전환하는 방법

시리즈 전환은 \*\*그저 `--model`\*\*입니다. 스크립트가 “series × asset type”에서 모델 ID를 도출합니다:

```text theme={null}
... wan_video.py "prompt"                        # default wan (Wan2.7 series)
... wan_video.py "prompt" --model happyhorse     # HappyHorse-1.1 series
```

<Info>
  **Model ID 도출 표** (외울 필요는 없습니다 — 스크립트가 자동으로 선택합니다):

  | 전달하는 자산                       | 모드         | wan                | happyhorse                  |
  | ----------------------------- | ---------- | ------------------ | --------------------------- |
  | prompt만                       | 텍스트-투-비디오  | `wan2.7-t2v`       | `happyhorse-1.1-t2v`        |
  | `-i` 첫 프레임                    | 이미지-투-비디오  | `wan2.7-i2v`       | `happyhorse-1.1-i2v`        |
  | `--ref-image` / `--ref-video` | 레퍼런스-투-비디오 | `wan2.7-r2v`       | `happyhorse-1.1-r2v`        |
  | `--video` + `--ref-image`     | 동영상 편집     | `wan2.7-videoedit` | `happyhorse-1.0-video-edit` |
</Info>

## 자산 입력: 로컬 이미지는 그대로 작동합니다(검증됨)

공식 문서에서는 미디어가 공개적으로 접근 가능한 https URL이어야 한다고 설명하지만, 저희 테스트에서는 두 시리즈 모두 base64 데이터 URI를 **허용**하는 것으로 확인되었습니다. 따라서 스크립트가 로컬 이미지를 자동으로 변환하며, `-i photo.jpg` 또는 `--ref-image role.png`에 로컬 경로를 사용해도 그대로 작동하므로 이미지 호스팅이 필요하지 않습니다. 동영상 자산(`--ref-video` / `--video`)의 경우에는 여전히 공개 URL이 권장됩니다. base64 인코딩은 큰 파일의 크기를 약 3분의 1 정도 늘리므로 요청 제한을 초과할 수 있습니다.

## 2\~5분 대기 예상(중요)

동영상 생성은 **비동기 작업**입니다:

* 스크립트가 전체 흐름을 감쌉니다: 제출(`X-DashScope-Async` 헤더 사용) → 8초마다 폴링 → 성공 시 mp4를 자동 다운로드합니다. **720P/5초 클립은 전체적으로 약 45\~155초가 걸립니다(측정값)**; 1080P 또는 더 긴 경우 5분을 초과할 수 있습니다.
* `progress` 값이 **오랫동안 30%에 머무르는 것은 정상입니다**(상위 시스템은 0/10/30/100만 보고합니다) — 멈춘 것이 아닙니다.
* **명령의 타임아웃을 충분히 길게 설정(600초 이상)하거나 백그라운드에서 실행하십시오** — 많은 에이전트가 기본 2분 후에 명령을 종료해 버리며, 그때는 동영상이 아직 준비되지 않았습니다. `SKILL.md`에서 이를 명시합니다.
* 폴링이 타임아웃(20분)에 도달하더라도 작업은 여전히 서버 측에 있습니다. 스크립트는 `task_id`와 조회 명령을 출력합니다. **실패한 작업은 절대 과금되지 않습니다**; 중복 제출은 두 번 과금되므로, 스크립트는 자동 재시도를 하지 않습니다.

## 단 한 문장이 동영상을 생성하는 이유

자주 묻는 질문입니다. 저는 명령을 입력하지 않았는데, 어떻게 “make a video”가 클립을 생성했습니까?

작동 방식은 다음과 같습니다. 시작 시 에이전트는 **각 스킬의 `description`를 해당 `SKILL.md`에서 읽습니다**(“이 스킬이 무엇을 하며 언제 사용해야 하는지”를 설명하는 짧은 메타데이터입니다). 사용자의 요청이 그 설명과 **일치하면**(예: “generate/make a video”, “animate this image”, “edit this clip”), 에이전트는 **스스로 해당 스킬을 호출하기로 결정하고**, 전체 `SKILL.md`를 읽은 뒤 스크립트를 실행합니다 — 사용자는 명령을 외울 필요가 없습니다.

에이전트의 추측에 의존하고 싶지 않다면, 아래의 **명시적 호출**을 사용하여 **완전한 제어**를 하십시오.

## 사용 방법

### 자연어(암시적 트리거)

설치한 후에는 에이전트에게 그냥 말하면 됩니다:

| 말씀하신 내용                                 | 동작                                             |
| --------------------------------------- | ---------------------------------------------- |
| "비 오는 도쿄 거리의 밤 동영상을 생성해 주세요"            | 기본 `wan` / 720P / 5초                           |
| "이 포스터를 모션 동영상으로 바꿔 주세요"                | `-i poster.png`을 추가하고, 로컬 이미지는 자동으로 업로드됩니다     |
| "더 고화질 모델을 1080P로 사용해 주세요"              | `--model happyhorse --resolution 1080P`를 추가합니다 |
| "이미지 1의 캐릭터가 이미지 2의 장면을 가로질러 달리게 해 주세요" | `--ref-image` 두 개를 추가하고, 참조 기반 동영상으로 처리합니다     |
| "이 동영상의 사람을 이 캐릭터로 바꿔 주세요"              | `--video` + `--ref-image`를 추가하고, 동영상 편집을 수행합니다 |

### 명시적 호출(더 세밀한 제어)

* **슬래시 명령이 있는 에이전트** (예: Claude Code):

  ```text theme={null}
  /wan Drone shot over an autumn valley, golden forest, cinematic --duration 8 --ratio 16:9
  ```

* **모든 에이전트 / 스크립트를 직접 실행하라고 지시** (가장 범용적):

  ```text theme={null}
  Run python3 wan/scripts/wan_video.py "Drone shot over an autumn valley, cinematic" --duration 8
  ```

## 생성된 동영상이 저장되는 위치

* `-o`의 파일명만 사용할 때(예: `-o cat.mp4`), 동영상은 **프로젝트 루트의 `wan-output/` 폴더**(자동 생성됨)에 저장됩니다; 두 시리즈가 이 폴더를 공유합니다.
* “프로젝트 루트” = 스크립트에서 위로 올라가며 찾은 `.git` 또는 `.claude`를 포함하는 첫 번째 디렉터리입니다 — 에이전트가 어디에서 실행되든 동영상은 프로젝트에 그대로 남아 있으며, 임시 폴더에서 사라지지 않습니다.
* 완료되면 스크립트는 전체 절대 경로와 파일 크기, 경과 시간을 포함한 한 줄을 출력합니다. 예: `Video saved to /Users/you/project/wan-output/tokyo.mp4 (4.9 MB, 153s elapsed, model wan2.7-t2v)`.
* 생성된 결과물에는 오디오 트랙(스테레오 AAC)이 포함되어 제공됩니다.
* 결과 URL은 24시간 후 만료되므로 스크립트는 항상 먼저 다운로드합니다 — 로컬 mp4가 최종 산출물입니다; URL을 결과로 남겨두지 마십시오.
* 디렉터리를 포함한 경로(예: `-o videos/cat.mp4` 또는 절대 경로)를 사용하면 `wan-output/`를 건너뛰고 해당 위치에 정확히 저장됩니다.

## 관련 문서

* [Wan Video 생성 개요](/ko/api-capabilities/wan/overview) (모델, 과금, 그룹)
* [Wan2.7 Text-to-Video API 레퍼런스](/ko/api-capabilities/wan/text-to-video)
* [Wan2.7 Reference-to-Video API 레퍼런스](/ko/api-capabilities/wan/reference-to-video)
* [HappyHorse Video Agent 스킬](/ko/api-capabilities/happyhorse/skills) (차이점을 설명하는 보조 페이지)
* [Seedance 2.0 Video Agent 스킬](/ko/api-capabilities/seedance2/skills) (Volcengine 측의 자매 항목)
