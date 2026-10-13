> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana 2.1 에이전트 스킬

> Nano Banana 2.1(gemini-nano-banana-2.1)을 즉시 사용 가능한 에이전트 스킬로 패키징합니다. Codex, OpenClaw, hermes-agent, Claude Code 또는 모든 코딩 에이전트에 추가하여 단일 prompt로 APIYI를 호출하고 텍스트 기반 이미지 생성 및 이미지 편집을 수행할 수 있습니다.

<Note>
  이 페이지에서는 **즉시 사용 가능한 Agent Skill**을 제공합니다. 이미 사용 중인 코딩 Agent에 추가한 뒤, 자연어(또는 명시적 명령어)로 APIYI 플랫폼의 **Nano Banana 2.1**(`gemini-nano-banana-2.1`)을 호출하여 이미지 생성 및 편집을 수행할 수 있습니다. 전체 구성은 두 개의 파일로만 이루어져 있어 복사 후 바로 사용할 수 있습니다.
</Note>

<Tip>
  최상급 품질의 **Pro** 스킬(`gemini-3-pro-image`)을 원하신다면 [Nano Banana Pro Agent Skill](/ko/api-capabilities/nano-banana-image/skills)을 참고하십시오. 이 페이지에서 다루는 모델은 **Nano Banana 2.1**(더 뛰어난 품질과 텍스트 렌더링을 제공하는 Nano Banana 2의 업그레이드 버전)입니다. 이전 버전을 계속 사용 중이신가요? [Nano Banana 2 Agent Skill](/ko/api-capabilities/nano-banana-2-image/skills)을 참고하십시오.
</Tip>

## 스킬 기능

단일 통합 스킬입니다. 스크립트가 **입력 이미지 전달 여부**를 자동으로 감지하여 텍스트 투 이미지와 이미지 편집 중 수행할 작업을 결정합니다:

<CardGroup cols={3}>
  <Card title="텍스트 투 이미지" icon="wand-sparkles">
    prompt만 입력 → **14가지 화면비** 및 1K/2K/4K 해상도를 갖춘 완전히 새로운 이미지 생성.
  </Card>

  <Card title="이미지 편집" icon="image">
    이미지 1장 + 지시어 → 부분 편집, 스타일 변경, 배경 교체 등.
  </Card>

  <Card title="다중 이미지 합성" icon="layers">
    여러 이미지 + 지시어 1개 → 합성, 비교, 의상 교체 등.
  </Card>
</CardGroup>

Pro 대비 Nano Banana 2.1은 네 가지 **초세로/초가로** 화면비(`1:4 / 4:1 / 1:8 / 8:1`)를 추가로 제공하며, 호출당 단 \$0.045/image(1K / 2K / 4K 동일 가격)로 대량 생성에 더욱 적합합니다. 단, **512px는 지원하지 않으므로** 썸네일 등급이 필요하다면 Nano Banana 2를 사용하십시오.

## 어떤 Agent가 사용할 수 있습니까

<Info>
  Skill은 본질적으로 **하나의 폴더**일 뿐입니다. 즉, Agent가 읽을 지침 세트(`SKILL.md`)와 작업을 수행하는 스크립트의 조합입니다. 따라서 **로컬 파일을 읽고 셸 명령을 실행할 수 있는 모든 코딩 Agent에서 이를 사용할 수 있습니다**. 예를 들어 **Codex, OpenClaw, hermes-agent, Claude Code** 등이 있습니다.

  유일한 요구 사항은 Agent를 실행하는 머신(컴퓨터 또는 서버)에 **Python 3**가 설치되어 있고 **네트워크 접근**이 가능해야 한다는 점뿐입니다(스크립트가 `api.apiyi.com`을 직접 호출합니다). 이것이 전부이며, 특정 Agent에 종속되지 않습니다.
</Info>

## 3단계로 설정하기

### ① 폴더 생성 및 파일 붙여넣기

다음 두 파일이 포함된 스킬 폴더를 생성합니다(전체 내용은 다음 두 섹션 참조):

```
nano-banana-2-1/
├── SKILL.md
├── scripts/
│   └── nano_banana_2_1.py
└── .env          # created in step ②, holds your key
```

### ② 동일한 폴더에 키 저장하기

**APIYI API Key**(`api.apiyi.com` 콘솔에서 생성)를 `nano-banana-2-1/.env`에 입력합니다:

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

스크립트가 이 `.env`에서 자동으로 키를 읽어오므로 **추가 설정이나 환경 변수가 필요하지 않습니다**.

<Warning>
  `.env`에는 비밀 키가 저장됩니다. 프로젝트 저장소를 통해 이 스킬을 공유하는 경우, **반드시 `.env`을 `.gitignore`에 추가하고 git에 절대 커밋하지 마십시오**.
</Warning>

### ③ 에이전트에 전달하기

* **스킬 자동 감지를 지원하는 에이전트**(예: Claude Code): `nano-banana-2-1/` 폴더 전체를 해당 에이전트의 스킬 디렉터리에 넣습니다. 개인용은 `~/.claude/skills/`, 프로젝트 수준(저장소를 통해 공유)은 `.claude/skills/`입니다.
* **기타 에이전트**: 자체 스킬/플러그인 규칙에 따라 배치하거나, 가장 간단하게는 **에이전트에게 "이 폴더의 SKILL.md를 읽고 지침을 따르십시오"라고 지시하면 됩니다**.

설치가 완료되면 모든 준비가 끝납니다. 예시는 [사용 방법](#how-to-use-it)을 확인하십시오.

## SKILL.md

아래 전체 내용으로 `nano-banana-2-1/SKILL.md`을 생성합니다(`description`에는 에이전트가 자동 트리거에 사용하는 "수행하는 작업 + 사용 시점"이 명시되어 있습니다).

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
# 텍스트-이미지 생성 (기본 1장)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2_1.py "A shiba inu wearing an astronaut helmet, cinematic lighting" -o dog.png --size 2K --aspect 16:9

# 울트라 와이드 배너 (Nano Banana 2.1 전용 8:1 / 4:1 울트라 와이드 비율)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2_1.py "Chinese ink long-scroll banner" -o banner.png --aspect 8:1 --size 2K

# 이미지 편집 (단일 이미지)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2_1.py "Replace the background with a cyberpunk night city" -i input.jpg -o edited.png

# 다중 이미지 합성 (-i 반복)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2_1.py "Composite these two people into one office group photo" -i a.png -i b.png -o merged.png

# 동일한 prompt의 여러 변형을 한 번에 생성 (최대 5개, 동시 생성)
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
  `name`은 영문 소문자와 하이픈(-)이어야 하며 **`claude` / `anthropic`와 같은 예약어를 포함해서는 안 됩니다**. 슬래시 명령어를 지원하는 에이전트에서는 디렉터리 이름이 명령어가 되며, `nano-banana-2-1`는 `/nano-banana-2`가 됩니다. `${CLAUDE_SKILL_DIR}`는 Claude Code에서 제공하는 스킬 디렉터리 변수이며, 다른 에이전트에서는 스크립트의 실제 경로를 사용하시면 됩니다.
</Tip>

## scripts/nano\_banana\_2\_1.py

Gemini 네이티브 형식을 사용하여 `nano-banana-2-1/scripts/nano_banana_2_1.py`을(를) 생성합니다 (APIYI 텍스트-이미지 변환 / 이미지 편집 레퍼런스 페이지의 검증된 정상 작동 코드와 동일합니다). **순수 Python 표준 라이브러리 — `pip install` 설치 불필요**:

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
  기본 모델 이름은 `gemini-nano-banana-2.1`입니다. 이전 버전으로 임시 전환하려면 `APIYI_IMAGE_MODEL=gemini-3.1-flash-image`(으)로 설정하십시오 (이전 버전은 `--size 512`도 지원합니다).
</Tip>

## 한 문장으로 이미지가 생성되는 이유

명령어를 직접 입력한 적이 없는데 어떻게 "고양이 그려줘"라는 문장만으로 이미지가 생성되는지 궁금해하는 경우가 많습니다.

작동 방식은 다음과 같습니다. 시작 시 에이전트는 **`description`을(를) 각 스킬의 `SKILL.md`에서 먼저 읽습니다**(이는 "이 스킬이 어떤 역할을 하며 언제 사용해야 하는지"를 설명하는 매우 짧은 메타데이터입니다). 사용자의 요청이 해당 시나리오와 **일치하면**(예: "이미지 그리기 / 생성 / 렌더링", "이 이미지를 ...로 편집"), 에이전트는 **자동으로 스킬 호출을 결정**하고 전체 `SKILL.md`을(를) 읽은 후 스크립트를 실행합니다. 즉, 사용자가 어떠한 명령어도 외우거나 입력할 필요가 없습니다.

따라서:

* **잘 작성된 `description` = 더욱 정확한 자동 트리거.** 이 스킬의 설명에는 이미 "이미지 생성 / 그리기 / 편집 / 합성"과 같은 표현이 포함되어 있습니다.
* 에이전트의 추측에 맡기지 않고 **완전한 제어**를 원하신다면, 아래의 **명시적 호출** 방식을 사용하십시오.

## 사용 방법

### 자연어 (암시적 트리거)

설치가 완료되면 에이전트와 대화하기만 하면 됩니다:

| 사용자 입력 | 스킬 동작 |
| - | - |
| "nano banana 2로 16:9 설산 일출 포스터 그려줘" | 스크립트 실행(`-i` 없음), png 1장 |
| "8:1 초광폭 중국풍 배너 만들어줘" | `--aspect 8:1` 실행, 초광폭 png 1장 |
| "서로 다른 수묵 산수화 3장 그려줘" | `-n 3` 실행, png 3장 동시 실행 |
| "피사체가 강조되도록 photo.jpg의 배경을 흐리게 처리해줘" | `-i photo.jpg` 실행, png 1장 |

### 명시적 호출 (더 세밀한 제어)

에이전트가 스스로 결정하는 것을 원하지 않는 경우, 두 가지 명시적 방법이 있습니다:

* **슬래시 명령어를 지원하는 에이전트** (예: Claude Code):

  ```text theme={null}
  /nano-banana-2-1 An orange cat napping in a garden, oil painting style --size 2K --aspect 3:2
  ```

* **모든 에이전트 / 스크립트 직접 실행 지시** (가장 범용적):

  ```text theme={null}
  Run python3 nano-banana-2-1/scripts/nano_banana_2_1.py "An orange cat napping in a garden, oil painting style" --size 2K --aspect 3:2
  ```

<Tip>
  **종횡비 및 선명도 제어 방법**: 종횡비에는 `--aspect`를 사용하고(Pro에는 없는 `1:4 / 4:1 / 1:8 / 8:1` 초세로형/초가로형 옵션을 포함한 14가지 옵션 제공), 해상도에는 `--size`를 사용합니다(`1K` / `2K` / `4K` 지원, `512`은 지원되지 않음). "세로형 9:16", "4K로 렌더링해줘", "초광폭 배너 만들어줘"와 같이 말하기만 하면 에이전트가 이러한 플래그를 자동으로 추가합니다.
</Tip>

## 생성된 이미지가 저장되는 위치

* `-o`이(가) **단순 파일 이름**(예: `-o dog.png`)인 경우, 이미지는 모두 **프로젝트 루트의 `nano-banana-2-1-output/` 폴더**(자동 생성됨)에 저장되므로 프로젝트 내에서 바로 확인할 수 있습니다.
* "프로젝트 루트" = 스크립트 자체 위치에서 상위 디렉터리로 탐색하여 `.git` 또는 `.claude`을(를) 포함하는 첫 번째 디렉터리를 의미합니다. 따라서 **에이전트가 어느 디렉터리에서 실행되든 이미지는 프로젝트 내에 저장되며**, 찾을 수 없는 임시 디렉터리로 들어가지 않습니다.
* 스크립트는 이미지마다 **전체 절대 경로를 하나씩 출력합니다**(예: `Image saved to /Users/you/project/nano-banana-2-1-output/dog.png`).
* 기본적으로 **단 1개의 이미지만 생성합니다**. `-n 3`은(는) 한 번에 3개를 생성하며(최대 5개, 그 이상은 5개로 제한됨), 자동으로 `-1`, `-2`, `-3` 접미사가 추가됩니다.
* `-o`이(가) **디렉터리가 포함된 경로**(예: `-o images/dog.png` 또는 절대 경로)인 경우, 해당 정확한 경로에 저장되며(상대 경로는 현재 작업 디렉터리 기준) `nano-banana-2-1-output/`에는 들어가지 않습니다.
* 이미지 편집도 동일하게 작동합니다. 출력은 새로운 파일이며 **원본을 덮어쓰지 않습니다**.

<Info>
  Nano Banana 2.1에는 엄격한 콘텐츠 안전 제어가 적용되어 있습니다. 스크립트가 `STOP` 이외의 `finishReason`을(를) 보고하거나 거부 텍스트를 반환하는 경우, 콘텐츠를 적절히 조정하고 위반되는 동일한 prompt를 반복해서 재시도하지 마십시오.
</Info>

## 관련 문서

* [Nano Banana 2.1 이미지 생성 개요](/ko/api-capabilities/gemini-nano-banana-2.1/overview)
* [Text-to-Image API 레퍼런스](/ko/api-capabilities/gemini-nano-banana-2.1/text-to-image)
* [이미지 편집 API 레퍼런스](/ko/api-capabilities/gemini-nano-banana-2.1/image-edit)
* [Nano Banana Pro 에이전트 스킬](/ko/api-capabilities/nano-banana-image/skills)
* [Nano Banana 요금](/ko/api-capabilities/nano-banana-pricing)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.