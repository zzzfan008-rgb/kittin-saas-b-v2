> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana 2 에이전트 스킬

> Nano Banana 2 (gemini-3.1-flash-image-preview)를 바로 사용할 수 있는 에이전트 스킬로 패키징합니다. Codex, OpenClaw, hermes-agent, Claude Code 또는 기타 코딩 에이전트에 넣고, 하나의 prompt로 APIYI를 호출하여 text-to-image와 이미지 편집을 수행할 수 있습니다.

<Note>
  이 페이지는 **바로 사용할 수 있는 Agent Skill**을 제공합니다. 이미 사용 중인 코딩 에이전트에 그대로 넣고, 자연어(또는 명시적인 명령)를 사용하여 APIYI 플랫폼에서 이미지 생성 및 편집용 **Nano Banana 2** (`gemini-3.1-flash-image-preview`)를 호출하십시오. 전체는 단 두 파일뿐이므로, 복사해서 바로 사용하면 됩니다.
</Note>

<Tip>
  대신 **Pro** 스킬이 필요하시면(`gemini-3-pro-image`, 최상위 품질), [Nano Banana Pro 에이전트 Skill](/ko/api-capabilities/nano-banana-image/skills)을 참고하십시오. 이 페이지는 **Nano Banana 2**(Flash급 속도에 Pro급 품질, 더 뛰어난 가성비)입니다.
</Tip>

## 이 스킬의 기능

하나로 결합된 스킬입니다. 스크립트가 **입력 이미지를 전달했는지** 자동 감지하여 텍스트-이미지와 이미지 편집 중 무엇을 사용할지 결정합니다:

<CardGroup cols={3}>
  <Card title="텍스트-이미지" icon="wand-sparkles">
    프롬프트만 입력하면 → **14가지 종횡비**와 512/1K/2K/4K 해상도를 갖춘 완전히 새로운 이미지를 생성합니다.
  </Card>

  <Card title="이미지 편집" icon="image">
    이미지 1장 + 지시문 → 부분 편집, 스타일 변경, 배경 교체 등.
  </Card>

  <Card title="다중 이미지 합성" icon="layers">
    여러 이미지 + 지시문 1개 → 합성, 비교, 의상 교체 등.
  </Card>
</CardGroup>

Pro와 비교하면, Nano Banana 2는 네 가지 **초고세로/초광각** 비율(`1:4 / 4:1 / 1:8 / 8:1`)과 전용 **512px** 저해상도 티어를 추가로 제공하며, 호출당 이미지 1장 기준 \$0.055에 불과합니다(token 기준으로는 이미지당 약 \$0.025까지 가능) — 대량 사용에 더 적합합니다.

## 어떤 에이전트가 사용할 수 있는지

<Info>
  스킬은 본질적으로 **폴더 하나**에 불과합니다. 즉, 에이전트가 읽을 지침(`SKILL.md`)과 작업을 수행하는 스크립트로 이루어진 집합입니다. 따라서 로컬 파일을 읽고 셸 명령을 실행할 수 있는 **모든 코딩 에이전트가 이를 사용할 수 있습니다** — 예를 들어 **Codex, OpenClaw, hermes-agent, Claude Code** 등이 있습니다.

  유일한 요구 사항은 에이전트를 실행하는 머신(사용자 컴퓨터 또는 서버)에 **Python 3**가 설치되어 있고 **네트워크 액세스**가 있어야 한다는 점입니다(스크립트가 `api.apiyi.com`을 직접 호출합니다). 그것이 전부입니다 — 특정 에이전트에 종속되지 않습니다.
</Info>

## 3단계로 설정하기

### ① 폴더를 만들고 파일을 붙여넣기

다음 두 파일이 들어 있는 스킬 폴더를 만드십시오(전체 내용은 다음 두 섹션에 있습니다):

```
nano-banana-2/
├── SKILL.md
├── scripts/
│   └── nano_banana_2.py
└── .env          # created in step ②, holds your key
```

### ② 같은 폴더에 키 넣기

`api.apiyi.com` 콘솔에서 생성한 **APIYI API Key**를 `nano-banana-2/.env`에 적으십시오:

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

스크립트는 이 `.env`에서 키를 자동으로 읽어옵니다 — **추가 설정이나 환경 변수는 필요하지 않습니다**.

<Warning>
  `.env`에는 비밀 키가 들어 있습니다. 이 스킬을 프로젝트 저장소로 공유하는 경우, **반드시 `.env`를 `.gitignore`에 추가하고 git에 절대 커밋하지 마십시오**.
</Warning>

### ③ 에이전트에게 전달하기

* **스킬을 자동으로 검색하는 에이전트**(예: Claude Code)의 경우: 전체 `nano-banana-2/` 폴더를 해당 스킬 디렉터리에 넣으십시오 — 개인 `~/.claude/skills/` 또는 프로젝트 수준 `.claude/skills/`(저장소를 통해 공유됨)입니다.
* **다른 에이전트**의 경우: 각자 정한 스킬/플러그인 규칙에 맞게 배치하십시오. 또는 가장 간단한 방법으로는 **에이전트에게 “이 폴더의 SKILL.md를 읽고 따르십시오”라고 지시하면 됩니다**.

설치가 완료되면 준비가 끝납니다 — 예시는 [사용 방법](#how-to-use-it)으로 이동하십시오.

## SKILL.md

`nano-banana-2/SKILL.md`를 아래 전체 내용으로 생성합니다(`description`에는 “무엇을 하는지 + 언제 사용하는지”가 적혀 있으며, 이는 Agent가 자동으로 트리거하는 데 사용됩니다):

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
# 텍스트를 이미지로 (기본값으로 이미지 1개)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2.py "우주비행사 헬멧을 쓴 시바 이누, 영화 같은 조명" -o dog.png --size 2K --aspect 16:9

# 초광각 배너 (Nano Banana 2의 전용 8:1 / 4:1 초광각 비율)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2.py "중국 수묵 장권 배너" -o banner.png --aspect 8:1 --size 2K

# 이미지 편집 (이미지 1개)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2.py "배경을 사이버펑크 야경 도시로 바꾸기" -i input.jpg -o edited.png

# 다중 이미지 합성 (-i를 반복)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2.py "이 두 사람을 하나의 사무실 그룹 사진으로 합성하기" -i a.png -i b.png -o merged.png

# 동일한 prompt의 여러 변형을 한 번에 (최대 5개, 동시에 생성)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2.py "중국 수묵 풍경 일러스트" -o landscape.png -n 3 --aspect 16:9
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
  `name`은 소문자와 하이픈으로만 이루어져야 하며 **`claude` / `anthropic` 같은 예약어를 포함해서는 안 됩니다**. 슬래시 명령을 지원하는 Agent에서는 디렉터리 이름이 명령입니다 — `nano-banana-2`가 `/nano-banana-2`가 됩니다. `${CLAUDE_SKILL_DIR}`는 Claude Code가 제공하는 skill-directory 변수입니다. 다른 Agent에서는 스크립트의 실제 경로를 사용하십시오.
</Tip>

## scripts/nano\_banana\_2.py

APIYI 텍스트-이미지 / 이미지 편집 참고 페이지의 검증된 작동 코드와 동일한 Gemini 네이티브 형식으로 `nano-banana-2/scripts/nano_banana_2.py`를 생성합니다. **순수 Python 표준 라이브러리만 사용하며 — `pip install`는 필요하지 않습니다**:

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
  기본 모델 이름은 `gemini-3.1-flash-image-preview`입니다. Google은 이후 `-preview`, `gemini-3.1-flash-image` 없이 안정화된 이름을 출시했습니다. 두 이름은 가격이 같고 모두 작동합니다. 전환하려면 `APIYI_IMAGE_MODEL=gemini-3.1-flash-image`를 설정합니다.
</Tip>

## 왜 한 문장만으로 이미지가 생성되는가

많은 분이 이렇게 궁금해합니다. 명령어를 한 번도 입력하지 않았는데, 어떻게 “고양이를 그려라”가 이미지를 생성했을까요?

작동 방식은 다음과 같습니다. 시작 시 에이전트는 각 스킬의 `description`에서 `SKILL.md`를 **먼저 읽습니다**(“이 스킬이 무엇을 하며 언제 사용해야 하는지”를 설명하는 매우 짧은 메타데이터입니다). 요청이 해당 시나리오와 **일치하면**(예: “이미지를 그리기 / 생성하기 / 렌더링하기”, “이 이미지를 ...로 편집하기”), 에이전트는 **자동으로 그 스킬을 호출하기로 결정하고**, 전체 `SKILL.md`를 읽은 뒤 스크립트를 실행합니다. 이 모든 과정은 사용자가 어떤 명령어도 기억하지 않아도 자동으로 이루어집니다.

따라서:

* **잘 작성된 `description` = 더 정확한 자동 트리거링입니다.** 이 스킬의 설명에는 이미 “이미지 생성 / 그리기 / 편집 / 합성” 같은 표현이 포함되어 있습니다.
* 에이전트가 추측하지 않게 하고 **완전한 제어**를 원하신다면, 아래의 **명시적 호출**을 사용하십시오.

## 사용 방법

### 자연어(암시적 트리거)

설치가 끝나면 에이전트와 그냥 대화하면 됩니다:

| 사용자가 말하는 내용                                                   | 스킬 동작                             |
| ------------------------------------------------------------- | --------------------------------- |
| "Draw a 16:9 snow-mountain sunrise poster with Nano Banana 2" | 스크립트를 실행합니다(`-i` 없음), png 1개      |
| "8:1 초광폭 중국풍 배너를 만들어 주세요"                                     | `--aspect 8:1`를 실행합니다, 초광폭 png 1개 |
| "중국 수묵 풍경 3개를 서로 다르게 만들어 주세요"                                 | `-n 3`를 실행합니다, png 3개를 동시에        |
| "photo.jpg의 배경을 흐리게 해서 피사체를 강조해 주세요"                          | `-i photo.jpg`를 실행합니다, png 1개     |

### 명시적 호출(더 많은 제어)

에이전트가 스스로 결정하게 하고 싶지 않을 때는, 두 가지 명시적 방법이 있습니다:

* **슬래시 명령을 지원하는 에이전트**(예: Claude Code):

  ```text theme={null}
  /nano-banana-2 An orange cat napping in a garden, oil painting style --size 2K --aspect 3:2
  ```

* **모든 에이전트 / 그냥 스크립트를 실행하라고 지시**(가장 범용적):

  ```text theme={null}
  Run python3 nano-banana-2/scripts/nano_banana_2.py "An orange cat napping in a garden, oil painting style" --size 2K --aspect 3:2
  ```

<Tip>
  **종횡비와 선명도를 제어하는 방법**: 종횡비에는 `--aspect`를 사용하고(14가지 옵션, Pro에 없는 `1:4 / 4:1 / 1:8 / 8:1` 초세로형/초가로형 포함), 해상도에는 `--size`를 사용합니다(`512` / `1K` / `2K` / `4K`, 여기서 `512`은 Nano Banana 2의 전용 저비용 저해상도 등급입니다). 그냥 "portrait 9:16", "render in 4K", 또는 "make an ultra-wide banner"라고 말하면 에이전트가 이러한 플래그를 자동으로 추가합니다.
</Tip>

## 생성된 이미지의 저장 위치

* `-o`가 **디렉터리 경로가 없는 파일 이름**(예: `-o dog.png`)인 경우, 이미지들은 모두 **프로젝트 루트의 `nano-banana-output/` 폴더**에 자동으로 저장됩니다. 따라서 프로젝트 안에서 바로 찾을 수 있습니다.
* "프로젝트 루트" = 스크립트 자체의 위치에서 위로 올라가며 찾은 `.git` 또는 `.claude`를 포함하는 첫 번째 디렉터리입니다. 즉, **에이전트가 어느 디렉터리에서 실행되든 이미지가 프로젝트 안에 저장되며**, 찾을 수 없는 임시 디렉터리에 저장되지 않습니다.
* 스크립트는 이미지마다 전체 절대 경로를 하나씩 출력합니다. 예: `Image saved to /Users/you/project/nano-banana-output/dog.png`.
* 기본값은 **이미지 1장만 생성**합니다. `-n 3`는 한 번에 3장을 생성하며(최대 5장, 그보다 많으면 5장으로 제한됨), `-1`, `-2`, `-3` 접미사가 자동으로 추가됩니다.
* `-o`가 **디렉터리가 있는 경로**(예: `-o images/dog.png` 또는 절대 경로)인 경우, 해당 정확한 경로에 저장되며(상대 경로는 현재 작업 디렉터리를 기준으로 합니다) `nano-banana-output/`에는 저장되지 않습니다.
* 이미지 편집도 같은 방식으로 동작합니다. 출력은 새 파일이며 **원본을 덮어쓰지 않습니다**.

<Info>
  Nano Banana 2는 엄격한 콘텐츠 안전 제어를 갖추고 있습니다. 스크립트가 `finishReason`를 `STOP`가 아닌 값으로 보고하거나 거절 텍스트를 반환하면, 콘텐츠를 그에 맞게 조정하고 동일한 위반 prompt를 반복해서 재시도하지 마십시오.
</Info>

## 관련 문서

* [Nano Banana 2 이미지 생성 개요](/ko/api-capabilities/nano-banana-2-image/overview)
* [텍스트-투-이미지 API 레퍼런스](/ko/api-capabilities/nano-banana-2-image/text-to-image)
* [이미지 편집 API 레퍼런스](/ko/api-capabilities/nano-banana-2-image/image-edit)
* [Nano Banana Pro 에이전트 스킬](/ko/api-capabilities/nano-banana-image/skills)
* [Nano Banana 가격](/ko/api-capabilities/nano-banana-pricing)
