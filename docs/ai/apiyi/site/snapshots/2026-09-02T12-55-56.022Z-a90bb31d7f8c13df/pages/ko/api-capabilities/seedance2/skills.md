> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.0 동영상 에이전트 스킬

> 네 가지 Seedance 모델(sd25 / mini / fast / standard)을 바로 사용할 수 있는 하나의 에이전트 스킬로 통합합니다 — Codex, OpenClaw, Claude Code 또는 모든 코딩 에이전트에 추가하여 한 문장으로 텍스트-동영상, 이미지-동영상 및 참조 이미지 기반 동영상을 생성할 수 있으며, 스크립트가 비동기 작업을 폴링하고 완성된 클립을 자동으로 다운로드합니다.

<Note>
  이 페이지는 **바로 사용할 수 있는 에이전트 스킬**을 제공합니다. 종속성이 전혀 없는 하나의 스크립트로 네 가지 Seedance 모델(`sd25` / `mini` / `fast` / 표준)을 모두 지원하며, `--model`로 전환할 수 있습니다. 사용하는 코딩 에이전트에 이 스킬을 추가하면 한 문장만으로 동영상을 생성할 수 있으며, 전체 구성은 파일 두 개뿐입니다. 또한 이 사이트의 **첫 번째 동영상 모델 스킬**입니다. 이미지와 달리 동영상 생성은 비동기 작업이며, 이 스크립트는 제출 → 폴링 → 다운로드의 전체 흐름을 이미 래핑합니다.
</Note>

## 이 기능이 수행하는 작업

하나로 결합된 기능으로, 스크립트는 **전달하는 이미지와 이미지의 역할**에 따라 생성 모드를 선택합니다.

<CardGroup cols={3}>
  <Card title="텍스트에서 동영상으로" icon="clapperboard">
    prompt만 입력하면 기본적으로 대화, 음향 효과, 주변음이 동기화된 완전히 새로운 동영상이 생성됩니다.
  </Card>

  <Card title="이미지에서 동영상으로" icon="image-play">
    첫 프레임 이미지를 전달하여 정지 이미지를 애니메이션으로 만들고, 마지막 프레임 이미지를 추가하여 첫 프레임에서 마지막 프레임으로 자연스럽게 전환되도록 합니다.
  </Card>

  <Card title="참조 이미지에서 동영상으로" icon="layers">
    최대 9개의 참조 이미지를 전달하면 해당 이미지의 캐릭터, 객체 또는 스타일을 유지하는 새로운 영상이 생성됩니다.
  </Card>
</CardGroup>

## 선택할 모델

네 모델 모두 **정확히 동일한 방식으로 호출**되며, 해상도 상한, 길이 상한, 참조 제한, 속도 및 가격이 다릅니다. 스크립트는 `--model`에 따라 차이를 처리합니다:

| 모델 (`--model`) | 모델 ID                             | 최대 해상도    | 속도 (720p/5초, 측정값)     | 그룹                                        | 720p/5초 정가                     | 적합한 용도                                                |
| -------------- | --------------------------------- | --------- | --------------------- | ----------------------------------------- | ------------------------------ | ----------------------------------------------------- |
| `mini` (기본값)   | `doubao-seedance-2-0-mini-260615` | 720p      | **가장 빠름, 약 87\~170초** | `SeeDance2` 0.18x<br />또는 `SD2Mini` 0.10x | \$0.4508<br />할인가 **\$0.2504** | 고빈도 에이전트 사용, 대량 처리, 빠른 미리보기                           |
| `fast`         | `doubao-seedance-2-0-fast-260128` | 720p      | 약 100\~290초           | `SeeDance2` 0.18x<br />또는 `SD2Fast` 0.15x | \$0.7253<br />할인가 **\$0.6044** | 품질과 비용의 균형                                            |
| `std`          | `doubao-seedance-2-0-260128`      | **1080p** | 약 100\~290초           | `SeeDance2` 0.18x                         | \$0.9074                       | 1080p, 최고 품질                                          |
| `sd25`         | `doubao-seedance-2-5-260628`      | **1080p** | 약 150초                | `SeeDance2` 0.18x                         | **\$1.3721**                   | **최대 30초, 참조 이미지 30개, mov 출력** — `std`보다 약 1.5배 높은 가격 |

<Tip>
  경험칙: **일상적인 사용 및 에이전트 시나리오에는 기본 `mini`을 사용하십시오**. **1080p 또는 최고 품질이 필요하면** → `--model std`를 사용하십시오. **30초 클립, 참조 이미지 30개 또는 mov 출력이 필요하면** → `--model sd25`만 사용할 수 있습니다(`std`보다 약 1.5배 높은 가격이며, 2.0 제품군과 동일한 그룹입니다). 모든 화면 비율은 해상도 등급 내에서 동일한 비용이 적용되며, 길이는 초당 선형으로 과금되고 프레임 속도는 24fps로 고정됩니다. 할인 그룹 `SD2Mini` / `SD2Fast`은 \*\*2026년 9월 7일 23:59 (UTC+8)\*\*까지 적용됩니다. 이후에도 그룹은 계속 활성 상태로 유지되며 요율 배수는 0.18x로 돌아갑니다. 자세한 내용은 [개요 페이지의 그룹 참고 사항](/ko/api-capabilities/seedance2/overview)을 참조하십시오.
</Tip>

## 어떤 에이전트가 이를 사용할 수 있습니까

<Info>
  Skill은 본질적으로 **폴더**입니다. 에이전트가 읽을 수 있는 메모(`SKILL.md`)와 작업을 수행하는 스크립트로 구성됩니다. 따라서 **로컬 파일을 읽고 셸 명령을 실행할 수 있는 모든 코딩 에이전트가 이를 사용할 수 있습니다** — **Codex, OpenClaw, hermes-agent, Claude Code** 등이 해당합니다.

  유일한 요구 사항은 에이전트를 실행하는 시스템(사용자의 노트북 또는 서버)에 **Python 3**와 **인터넷 액세스**가 있어야 한다는 것입니다(스크립트가 `api.apiyi.com`을 직접 호출합니다). 이 스크립트는 Python 표준 라이브러리만 사용하므로 **`pip install`할 필요가 없습니다**.
</Info>

## 3단계로 설정하기

### ① 폴더를 만들고 파일 붙여넣기

스킬 폴더를 만들고 아래 두 파일을 넣습니다(전체 내용은 다음 두 섹션에 있습니다).

```
seedance2/
├── SKILL.md
├── scripts/
│   └── seedance_video.py
└── .env          # created in step ②, holds your key
```

### ② 옆에 키 배치하기

**APIYI API 키**를 `seedance2/.env`에 입력합니다(사용량 기반 과금으로 `api.apiyi.com` 콘솔에서 생성합니다. **키에는 `SeeDance2` 그룹이 활성화되어 있어야 하며**, 이 그룹에는 네 가지 모델이 모두 포함됩니다 — `mini` / `fast`에도 할인된 `SD2Mini` / `SD2Fast`이 적용됩니다).

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

스크립트는 이 `.env`에서 키를 자동으로 읽으므로 **추가 설정이나 환경 변수가 필요하지 않습니다**.

<Warning>
  `.env`에는 비밀 키가 저장됩니다. 프로젝트 저장소 내부에서 스킬을 공유하는 경우 **`.env`를 `.gitignore`에 추가하고 절대 커밋하지 마십시오**.
</Warning>

### ③ 에이전트에 전달하기

* **스킬 자동 검색을 지원하는 에이전트**(예: Claude Code): 전체 `seedance2/` 폴더를 해당 에이전트의 스킬 디렉터리에 넣습니다 — 개인용 `~/.claude/skills/` 또는 프로젝트 수준의 `.claude/skills/`(저장소와 공유됨)에 넣습니다.
* **그 외 에이전트**: 각 에이전트의 스킬/플러그인 규칙을 따릅니다. 또는 가장 간단하게 **에이전트에 “이 폴더의 SKILL.md를 읽고 그 지침을 따르세요”라고 말하면 됩니다**.

이제 끝났습니다 — 예시는 [사용 방법](#how-to-use-it)으로 이동하여 확인하십시오.

## SKILL.md

`seedance2/SKILL.md`에 아래 전체 내용을 작성합니다(`description`에는 “무엇을 수행하는지 + 언제 사용하는지”가 명시되어 있으며, 에이전트는 이를 사용하여 자동으로 트리거합니다).

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
# 텍스트를 동영상으로 변환(기본 Mini / 720p / 5초 / 오디오 포함)
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "초원에서 나비를 쫓는 주황색 고양이, 느린 트래킹 숏, 자연광" -o cat.mp4

# 이미지를 동영상으로 변환(첫 번째 프레임 — 정지 이미지에 애니메이션 적용)
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "카메라가 천천히 줌인하고 빛이 흐르는 장면" -i photo.jpg -o animated.mp4

# 첫 번째 프레임에서 마지막 프레임으로 전환
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "첫 번째 프레임에서 마지막 프레임으로 부드럽게 전환" -i first.png --last-frame last.png -o morph.mp4

# 참조 이미지를 동영상으로 변환(참조된 캐릭터/스타일 유지, 최대 9개 이미지)
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "참조 이미지의 캐릭터가 눈밭을 달리는 장면" --ref-image role.png -o run.mp4

# 고품질: 표준 모델 + 1080p + 10초
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "가을 계곡 위를 비행하는 드론 숏, 영화 같은 분위기" --model std --resolution 1080p --duration 10 -o valley.mp4

# Seedance 2.5: 30초 클립(5초 클립의 6배 비용 — 먼저 사용자에게 확인)
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "가을 계곡 위를 한 번에 연속 촬영하며 비행하는 드론" --model sd25 --duration 30 -o long.mp4

# Seedance 2.5: 색 보정용 mov 출력
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "바위에 부딪히는 파도, 슬로 모션" --model sd25 --output-format mov -o waves.mov
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
  `name`은 소문자와 하이픈만 사용해야 합니다. 슬래시 명령을 지원하는 에이전트에서는 폴더 이름이 명령어입니다 — `seedance2`이(가) `/seedance2`을 제공합니다. `${CLAUDE_SKILL_DIR}`은 Claude Code의 스킬 디렉터리 변수입니다. 다른 에이전트에서는 스크립트의 실제 경로를 사용합니다.
</Tip>

## scripts/seedance\_video.py

`seedance2/scripts/seedance_video.py`을 생성합니다. 순수 Python 표준 라이브러리를 사용하며, 이 사이트의 [동영상 생성 API 레퍼런스](/ko/api-capabilities/seedance2/video-generation)와 동일한 요청 코드로 검증되어 작동합니다.

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

## 모델을 전환하는 방법

모델 전환은 **`--model`** 네 가지 값만으로 가능합니다:

```text theme={null}
... seedance_video.py "prompt"                                    # default mini (fastest & cheapest)
... seedance_video.py "prompt" --model fast                       # fast edition
... seedance_video.py "prompt" --model std --resolution 1080p     # standard edition
... seedance_video.py "prompt" --model sd25 --duration 30         # Seedance 2.5 - up to 30 seconds
```

<Info>
  **token의 그룹에 따라 호출할 수 있는 모델이 결정됩니다**: `SeeDance2` (0.18x)는 **네 가지 모델 모두**(`sd25` / `std` / `fast` / `mini`)를 포함합니다. 할인 그룹은 **단일 모델 전용 경로**입니다. `SD2Mini` (0.10x)는 `mini`만 포함하고, `SD2Fast` (0.15x)는 `fast`만 포함합니다. 할인 token으로 다른 모델을 호출하면 “이 모델에 사용할 수 있는 채널이 없습니다”가 반환됩니다. **`SeeDance2`의 token 하나면 충분합니다**. 사용량이 전용 할인 token을 사용할 만큼 충분해지면 전용 할인 token을 발급하십시오. 자세한 내용은 [개요 페이지의 그룹 참고 사항](/ko/api-capabilities/seedance2/overview)을 참조하십시오.
</Info>

## 2\~5분 정도 기다려야 합니다(중요)

동영상 생성은 **비동기 작업**이며, 이미지 기능과 가장 큰 차이점은 다음과 같습니다.

* 스크립트가 전체 흐름을 처리합니다. 제출 → 15초마다 폴링 → 성공 시 mp4 자동 다운로드 순서입니다. **720p/5초 클립은 처음부터 끝까지 약 2\~3분이 걸리며**, 1080p 또는 더 긴 영상은 시간이 더 소요됩니다.
* **명령에 긴 타임아웃(600초 이상)을 지정하거나 백그라운드에서 실행하십시오.** 많은 에이전트는 기본 2분 후에 명령을 종료하므로 동영상이 준비되기 전에 중단될 수 있습니다. `SKILL.md`에 이 내용이 명시되어 있으며, Claude Code와 같이 백그라운드 실행을 지원하는 에이전트는 이를 자동으로 처리합니다.
* 폴링이 15분 후 타임아웃되더라도 작업은 서버 측 대기열에 남아 있습니다. 스크립트는 나중에 동영상을 가져올 수 있도록 `task_id`과 조회 명령을 출력합니다. **비용이 낭비되지 않습니다.** Seedance 2.0은 제출 시 요금을 먼저 청구한 후 완료 시 차액을 환불하며, 거부된 제출(HTTP 400)에는 요금이 청구되지 않습니다.

## 문장 하나만으로 동영상이 생성되는 이유

자주 묻는 질문입니다. 명령을 입력한 적이 없는데 어떻게 “고양이 동영상을 만들어 줘”라는 요청으로 클립이 생성되었습니까?

작동 방식은 다음과 같습니다. 시작할 때 에이전트는 각 스킬의 `description`을 해당 `SKILL.md`에서 읽습니다(“이 스킬이 무엇을 하며 언제 사용하는지”를 설명하는 짧은 메타데이터입니다). 사용자의 요청이 해당 설명과 **일치하면**(예: “동영상을 생성해 줘/만들어 줘”, “이 이미지를 애니메이션으로 만들어 줘”), 에이전트는 **스스로 스킬을 호출하기로 결정하고**, 전체 `SKILL.md`를 읽은 다음 스크립트를 실행합니다. 따라서 사용자가 명령을 외울 필요가 없습니다.

에이전트의 추측에 의존하고 싶지 않다면, **완전한 제어**를 위해 아래의 **명시적 호출**을 사용하십시오.

## 사용 방법

### 자연어(암시적 트리거)

설치가 완료되면 에이전트에게 말하기만 하면 됩니다.

| 말하는 내용                      | 스킬 동작                                             |
| --------------------------- | ------------------------------------------------- |
| “잔디 위를 달리는 고양이 동영상을 생성해 줘”  | 기본 `mini` / 720p / 5초, 오디오가 포함된 mp4 하나            |
| “이 포스터를 모션 동영상으로 변환해 줘”     | `-i poster.png` 추가, 첫 프레임 이미지-투-동영상               |
| “10초 길이의 1080p 드론 촬영 영상”    | `--model std --resolution 1080p --duration 10` 추가 |
| “이 캐릭터 이미지들을 파쿠르 클립에 사용해 줘” | 참조 이미지와 함께 `--ref-image` 추가                       |
| “배경음은 넣지 마”                 | `--no-audio` 추가                                   |

### 명시적 호출(더 세밀한 제어)

* **슬래시 명령을 지원하는 에이전트**(예: Claude Code):

  ```text theme={null}
  /seedance2 Drone shot over an autumn valley, golden forest, cinematic --duration 8 --ratio 16:9
  ```

* **모든 에이전트 / 스크립트를 직접 실행하도록 지시**(가장 범용적):

  ```text theme={null}
  Run python3 seedance2/scripts/seedance_video.py "Drone shot over an autumn valley, cinematic" --duration 8
  ```

## 생성된 동영상이 저장되는 위치

* `-o`에 **파일 이름만** 지정하면(예: `-o cat.mp4`), 동영상은 **프로젝트 루트의 `seedance-output/` 폴더**(자동 생성됨), 즉 프로젝트 내부에 저장됩니다.
* “프로젝트 루트”란 스크립트에서 상위 디렉터리로 올라가며 찾은 `.git` 또는 `.claude`가 포함된 첫 번째 디렉터리입니다. **에이전트가 어디에서 실행되더라도 동영상은 프로젝트에 저장되며**, 임시 폴더에 유실되지 않습니다.
* 완료되면 스크립트가 **전체 절대 경로와 파일 크기, 경과 시간, 과금된 token을 포함한 한 줄을 출력합니다**. 예: `Video saved to /Users/you/project/seedance-output/cat.mp4 (3.8 MB, 132s elapsed, billed 108900 tokens)`.
* 반환된 동영상 URL은 **24시간 후 만료**되므로 스크립트는 항상 먼저 다운로드합니다. **로컬 mp4 파일이 결과물**이므로 URL을 결과로 보관해서는 안 됩니다.
* **디렉터리가 포함된 경로**(예: `-o videos/cat.mp4` 또는 절대 경로)를 지정하면 `seedance-output/`을 건너뛰고 해당 위치에 정확히 저장합니다.

## 관련 문서

* [Seedance 2.0 개요](/ko/api-capabilities/seedance2/overview) (모델, 과금, 그룹)
* [동영상 생성 API 레퍼런스](/ko/api-capabilities/seedance2/video-generation) (전체 매개변수 및 엔드포인트)
* [자산 참조 동영상 생성](/ko/api-capabilities/seedance2/asset-reference) (캐릭터 일관성, `asset://` 자산)
* [GPT-Image-2 시리즈 에이전트 스킬](/ko/api-capabilities/gpt-image-2/skills) (이미지 측 자매 기능)
* [Nano Banana Pro 에이전트 스킬](/ko/api-capabilities/nano-banana-image/skills)
