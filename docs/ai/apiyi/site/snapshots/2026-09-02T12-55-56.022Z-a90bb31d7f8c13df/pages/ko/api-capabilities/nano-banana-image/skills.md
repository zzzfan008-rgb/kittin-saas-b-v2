> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Pro Agent Skill

> Nano Banana Pro(gemini-3-pro-image)를 Codex, OpenClaw, hermes-agent, Claude Code 또는 다른 코딩 Agent에 바로 사용할 수 있는 Agent Skill로 패키지화합니다. 단일 프롬프트로 APIYI에 텍스트-이미지 및 이미지 편집을 요청합니다.

<Note>
  이 페이지는 **바로 사용할 수 있는 Agent Skill**을 제공합니다. 이미 사용 중인 코딩 Agent에 그대로 넣고, 자연어(또는 명시적인 명령)로 APIYI 플랫폼의 **Nano Banana Pro**(`gemini-3-pro-image`)를 호출하여 이미지 생성과 편집을 수행할 수 있습니다. 전체는 단 두 개의 파일로 구성되어 있으므로 복사해서 바로 사용하시면 됩니다.
</Note>

## 스킬이 하는 일

하나로 결합된 단일 스킬입니다. 이 스크립트는 **입력 이미지를 전달하는지 여부**를 자동 감지하여 텍스트를 이미지로와 이미지 편집 중에서 결정합니다:

<CardGroup cols={3}>
  <Card title="텍스트를 이미지로" icon="wand-sparkles">
    프롬프트만 입력하면 → 10가지 종횡비와 1K/2K/4K 해상도를 지원하는 완전히 새로운 이미지를 생성합니다.
  </Card>

  <Card title="이미지 편집" icon="image">
    이미지 1장 + 지시문 → 로컬 편집, 스타일 변경, 배경 교체 등.
  </Card>

  <Card title="다중 이미지 합성" icon="layers">
    여러 이미지 + 하나의 지시문 → 합성, 비교, 의상 교체 등.
  </Card>
</CardGroup>

## 어느 에이전트가 사용할 수 있습니까

<Info>
  스킬은 본질적으로 **하나의 폴더**에 불과합니다. 에이전트가 읽을 수 있는 지침 묶음(`SKILL.md`)과 작업을 수행하는 스크립트로 이루어집니다. 따라서 **로컬 파일을 읽고 셸 명령을 실행할 수 있는 모든 코딩 에이전트는 사용할 수 있습니다** — 예를 들어 **Codex, OpenClaw, hermes-agent, Claude Code** 등이 있습니다.

  유일한 요구사항은 에이전트를 실행하는 머신(사용자 컴퓨터 또는 서버)에 **Python 3**가 설치되어 있고 **네트워크 액세스**가 있어야 한다는 점입니다(스크립트가 `api.apiyi.com`를 직접 호출합니다). 이것이 전부입니다 — 특정 에이전트에 종속되지 않습니다.
</Info>

## 3단계로 설정하기

### ① 폴더를 만들고 파일을 붙여넣기

다음 두 파일이 들어 있는 스킬 폴더를 만드십시오(전체 내용은 다음 두 섹션에 있습니다):

```
nano-banana-pro/
├── SKILL.md
├── scripts/
│   └── nano_banana.py
└── .env          # created in step ②, holds your key
```

### ② 같은 폴더에 키를 넣기

`api.apiyi.com` 콘솔에서 생성한 **APIYI API Key**를 `nano-banana-pro/.env`에 기록하십시오:

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

스크립트는 이 `.env`에서 키를 자동으로 읽어옵니다. — **추가 설정이나 환경 변수는 필요하지 않습니다**.

<Warning>
  `.env`에는 비밀 키가 들어 있습니다. 프로젝트 리포지토리를 통해 이 스킬을 공유하는 경우, **`.env`를 `.gitignore`에 반드시 추가하고 git에 절대 커밋하지 마십시오**.
</Warning>

### ③ 에이전트에 전달하기

* **스킬을 자동 감지하는 에이전트**(예: Claude Code)의 경우: 전체 `nano-banana-pro/` 폴더를 해당 스킬 디렉터리에 넣으십시오. 개인용 `~/.claude/skills/`이거나, 프로젝트 수준의 `.claude/skills/`일 수 있습니다(리포지토리를 통해 공유됨).
* **다른 에이전트**의 경우: 해당 에이전트의 자체 스킬/플러그인 규칙에 맞게 배치하십시오. 아니면 가장 간단하게는 — **에이전트에게 “이 폴더의 SKILL.md를 읽고 따라오세요”라고 지시하십시오**.

설치가 끝나면 준비 완료입니다 — 예제는 [사용 방법](#how-to-use-it)을 확인하십시오.

## SKILL.md

`nano-banana-pro/SKILL.md`을(를) 다음의 전체 내용으로 생성하십시오. (`description`은 "무엇을 하는지 + 언제 사용하는지"를 뜻하며, Agent가 이를 기준으로 자동 트리거합니다):

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
# 텍스트를 이미지로 (기본값으로 이미지 1장)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana.py "우주비행사 헬멧을 쓴 시바견, 영화 같은 조명" -o dog.png --size 2K --aspect 16:9

# 이미지 편집 (이미지 1장)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana.py "배경을 사이버펑크 야경 도시로 바꾸기" -i input.jpg -o edited.png

# 여러 이미지 합성 (-i를 반복)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana.py "이 두 사람을 하나의 사무실 단체 사진으로 합성하기" -i a.png -i b.png -o merged.png

# 동일한 prompt의 여러 변형을 한 번에 (최대 5개, 동시에 생성됨)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana.py "수묵 산수 일러스트" -o landscape.png -n 3 --aspect 16:9
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
  `name`는 소문자와 하이픈만 사용할 수 있으며 **`claude` / `anthropic` 같은 예약어를 포함하면 안 됩니다**. 슬래시 명령을 지원하는 에이전트에서는 디렉터리 이름이 곧 명령입니다 — `nano-banana-pro`는 `/nano-banana-pro`가 됩니다. `${CLAUDE_SKILL_DIR}`는 Claude Code가 제공하는 스킬 디렉터리 변수입니다. 다른 에이전트에서는 스크립트의 실제 경로를 사용하십시오.
</Tip>

## scripts/nano\_banana.py

`nano-banana-pro/scripts/nano_banana.py`를 Gemini 네이티브 형식으로 생성하십시오(검증된, 작동하는 APIYI 텍스트-투-이미지 / 이미지 편집 참조 페이지의 코드와 동일합니다). **순수 Python 표준 라이브러리만 사용하며 `pip install`는 필요하지 않습니다**:

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
  기본 모델 이름은 `gemini-3-pro-image`(안정된 이름)입니다. 기존 `gemini-3-pro-image-preview`를 사용하려면 `APIYI_IMAGE_MODEL=gemini-3-pro-image-preview`를 설정하십시오 — 둘은 같은 가격이며 기능적으로 동일합니다.
</Tip>

## 왜 한 문장만으로 이미지가 생성되는가

많은 분들이 이렇게 궁금해합니다. 명령을 한 번도 입력하지 않았는데, 어떻게 "draw a cat"이 이미지를 생성했을까요?

작동 방식은 이렇습니다. 시작할 때 에이전트는 **각 스킬의 `SKILL.md`에서 `description`을 먼저 읽습니다**(즉, 이 스킬이 무엇을 하고 언제 사용해야 하는지를 설명하는 아주 짧은 메타데이터입니다). 사용자의 요청이 해당 상황과 **일치하면**(예: "draw / generate / render an image", "edit this image to..."), 에이전트는 **자동으로 해당 스킬을 호출하기로 결정하고**, 전체 `SKILL.md`를 읽은 뒤 스크립트를 실행합니다. 이 모든 과정은 사용자가 어떤 명령도 기억하지 않아도 자동으로 이루어집니다.

따라서:

* **잘 작성된 `description` = 더 정확한 자동 트리거링입니다.** 이 스킬의 설명에는 이미 "generate / draw / edit / composite an image" 같은 표현이 포함되어 있습니다.
* 에이전트가 추측하지 않도록 하고 **완전한 제어**를 원하신다면, 아래의 **명시적 호출**을 사용하십시오.

## 사용 방법

### 자연어(암시적 트리거)

설치한 뒤에는 Agent와 대화하기만 하면 됩니다:

| 말하는 내용                                  | Skill 동작                           |
| --------------------------------------- | ---------------------------------- |
| "nano banana로 16:9 눈 덮인 산의 일출 포스터를 그려줘" | 스크립트를 실행합니다(`-i` 없음), png 1개       |
| "photo.jpg의 배경을 흐리게 해서 주제를 강조해줘"        | `-i photo.jpg`를 실행합니다, png 1개      |
| "서로 다른 중국 수묵 산수화 3개를 만들어줘"              | `-n 3`를 실행합니다, png 3개를 동시에 생성합니다   |
| "a.png와 b.png의 사람들을 한 장의 사진으로 합성해줘"     | `-i a.png -i b.png`를 실행합니다, png 1개 |

### 명시적 호출(더 많은 제어)

Agent가 스스로 판단하지 않게 하고 싶을 때는, 두 가지 명시적 방법이 있습니다:

* **슬래시 명령을 지원하는 에이전트**(예: Claude Code):

  ```text theme={null}
  /nano-banana-pro An orange cat napping in a garden, oil painting style --size 4K --aspect 3:2
  ```

* **모든 에이전트 / 스크립트를 실행하라고만 지시하는 방식**(가장 범용적임):

  ```text theme={null}
  Run python3 nano-banana-pro/scripts/nano_banana.py "An orange cat napping in a garden, oil painting style" --size 4K --aspect 3:2
  ```

<Tip>
  **종횡비와 선명도를 제어하는 방법**: 종횡비에는 `--aspect`를 사용하고(예: `--aspect 16:9`, 10가지 옵션), 해상도에는 `--size`를 사용합니다(`1K` / `2K` / `4K`). "세로 9:16으로 해줘", "정사각형 이미지로 해줘", 또는 "4K로 렌더링해줘"라고만 말하면 에이전트가 이러한 플래그를 자동으로 추가합니다.
</Tip>

## 생성된 이미지가 저장되는 위치

* `-o`가 **일반 파일명**인 경우(예: `-o dog.png`), 이미지들은 모두 **프로젝트 루트의 `nano-banana-output/` 폴더**에 저장됩니다(자동으로 생성됩니다). 따라서 프로젝트 안에서 바로 찾을 수 있습니다.
* “Project root”는 스크립트의 자체 위치에서 상위로 올라가면서 발견되는 `.git` 또는 `.claude`를 포함하는 첫 번째 디렉터리입니다. 즉, 에이전트가 어느 디렉터리에서 실행되든 이미지가 프로젝트 내부에 저장되며, 찾을 수 없는 임시 디렉터리에 저장되지 않습니다.
* 스크립트는 이미지마다 전체 절대 경로를 하나씩 출력합니다. 예: `Image saved to /Users/you/project/nano-banana-output/dog.png`.
* 기본값은 **이미지 1장** 생성입니다. `-n 3`를 사용하면 한 번에 3장을 생성하며(최대 5장, 그보다 많으면 5장으로 제한됨), `-1`, `-2`, `-3` 접미사가 자동으로 추가됩니다.
* `-o`가 디렉터리가 포함된 경로인 경우(예: `-o images/dog.png` 또는 절대 경로), 해당 정확한 경로에 저장되며(상대 경로는 현재 작업 디렉터리를 기준으로 합니다) `nano-banana-output/`로 들어가지 않습니다.
* 이미지 편집도 같은 방식으로 동작합니다. 출력은 새 파일이며 **원본을 덮어쓰지 않습니다**.

<Info>
  Nano Banana Pro에는 엄격한 콘텐츠 안전 제어가 적용됩니다. 스크립트가 `finishReason`을(를) `STOP`과(와) 다르게 보고하거나 거부 텍스트를 반환하면, 그에 맞게 콘텐츠를 조정하고 동일한 위반 prompt를 반복해서 다시 시도하지 마십시오. 생성 레퍼런스의 [오류 처리 가이드](/ko/api-capabilities/nano-banana-image/overview)를 참고하십시오.
</Info>

## 관련 문서

* [Nano Banana Pro 이미지 생성 개요](/ko/api-capabilities/nano-banana-image/overview)
* [텍스트-이미지 API 레퍼런스](/ko/api-capabilities/nano-banana-image/text-to-image)
* [이미지 편집 API 레퍼런스](/ko/api-capabilities/nano-banana-image/image-edit)
* [Nano Banana 요금](/ko/api-capabilities/nano-banana-pricing)
