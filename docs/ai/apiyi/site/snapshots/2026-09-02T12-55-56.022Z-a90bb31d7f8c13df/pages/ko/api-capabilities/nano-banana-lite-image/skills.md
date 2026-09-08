> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Lite 에이전트 스킬

> Nano Banana 2 Lite (gemini-3.1-flash-lite-image)를 즉시 사용할 수 있는 에이전트 스킬로 패키징합니다. Codex, OpenClaw, hermes-agent, Claude Code 또는 다른 코딩 에이전트에 그대로 넣고, 한 문장만으로 APIYI 플랫폼의 텍스트-투-이미지와 이미지 편집을 호출할 수 있습니다.

<Note>
  이 페이지는 **즉시 사용할 수 있는 Agent Skill**을 제공합니다. 이미 사용 중인 코딩 에이전트에 넣으면, 자연어(또는 명시적 명령)로 APIYI의 **Nano Banana 2 Lite** (`gemini-3.1-flash-lite-image`)를 호출하여 이미지를 생성하고 편집할 수 있습니다. 전체는 파일 두 개뿐입니다 — 복사해서 바로 사용하면 됩니다.
</Note>

<Tip>
  더 높은 품질이나 2K/4K가 필요하면 [Nano Banana 2 Agent Skill](/ko/api-capabilities/nano-banana-2-image/skills) (최대 4K) 또는 [Nano Banana Pro Agent Skill](/ko/api-capabilities/nano-banana-image/skills) (최고 품질)을 참고하십시오. 이 페이지는 **Lite**입니다(가장 빠르고 가장 저렴하며, 1K에 초점을 맞추고, \$0.025/image 호출당).
</Tip>

## 이 기능이 하는 일

단일 통합 스킬입니다 — 스크립트가 이미지가 전달되었는지 자동 감지하여 “text-to-image”와 “image editing” 중에서 결정합니다:

<CardGroup cols={3}>
  <Card title="텍스트-투-이미지" icon="wand-sparkles">
    프롬프트만 입력하면 → 완전히 새로운 이미지를 생성하며, **14개 가로세로 비율**, 1K 캔버스, 이미지당 약 4초를 지원합니다.
  </Card>

  <Card title="이미지 편집" icon="image">
    이미지 1장 + 지시문을 전달하면 → 부분 편집, 스타일 전이, 배경 교체 등을 수행합니다.
  </Card>

  <Card title="멀티이미지 합성" icon="layers">
    이미지 여러 장 + 지시문 1개를 전달하면 → 합성, 비교, 의상 교체 등 더 많은 작업을 수행합니다.
  </Card>
</CardGroup>

Nano Banana 2 Lite는 **속도와 비용**에 맞춰 설계되었습니다: 이미지당 약 4초, Nano Banana 2보다 약 2.7배 빠르며, 실제로는 token 기반 평균 약 \$0.018/call(구글의 요율의 40%)이고 호출당 \$0.025/image입니다 — 높은 동시 실행 수, 빠른 반복, 대량 처리에 이상적입니다.

## 어떤 에이전트가 이를 사용할 수 있습니까

<Info>
  **Skill**은 본질적으로 **하나의 폴더**일 뿐입니다: 에이전트용으로 작성된 설명(`SKILL.md`) + 작업을 수행하는 스크립트입니다. 따라서 **로컬 파일을 읽고 명령줄을 실행할 수 있는 모든 코딩 에이전트는 이를 사용할 수 있습니다** — 예를 들어 **Codex, OpenClaw, hermes-agent, Claude Code** 등이 있습니다.

  유일한 요구사항은 에이전트를 실행하는 머신(사용자 컴퓨터 또는 서버)에 **Python 3**가 설치되어 있고 **인터넷 접속**이 가능해야 한다는 점입니다(스크립트가 `api.apiyi.com`에 직접 연결됩니다). 그게 전부입니다 — 특정 에이전트는 필요하지 않습니다.
</Info>

## 세 단계로 설치

### ① 폴더를 만들고 파일을 붙여 넣습니다

스킬 폴더를 만들고 아래 두 파일을 추가합니다(전체 내용은 다음 두 섹션에 있습니다):

```
nano-banana-lite/
├── SKILL.md
├── scripts/
│   └── nano_banana_lite.py
└── .env          # created in step ②, holds your Key
```

### ② 같은 폴더에 Key를 작성합니다

`nano-banana-lite/.env`에, `api.apiyi.com` 콘솔에서 생성한 **APIYI API Key**를 추가합니다:

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

스크립트는 이 `.env`에서 Key를 자동으로 읽습니다 — **추가 설정이나 환경 변수는 필요하지 않습니다**.

<Warning>
  `.env`에는 비밀 키가 들어 있습니다. 이 스킬을 프로젝트 repo와 공유할 예정이라면, **`.env`를 `.gitignore`에 추가하고 git에는 절대 커밋하지 마십시오**.
</Warning>

### ③ 에이전트에 전달합니다

* **스킬 자동 검색을 지원하는 에이전트**(예: Claude Code): 전체 `nano-banana-lite/` 폴더를 해당 스킬 디렉터리, 즉 사용자 수준의 `~/.claude/skills/` 또는 프로젝트 수준의 `.claude/skills/`(repo와 공유됨)에 넣습니다.
* **다른 에이전트**: 각자의 스킬/플러그인 규칙에 맞게 배치합니다. 또는 가장 간단하게는 **에이전트에게 "이 폴더의 SKILL.md를 읽고 따르세요"라고 말하면 됩니다**.

설치가 끝나면 예시는 [사용 방법](#how-to-use)을 확인하십시오.

## SKILL.md

`nano-banana-lite/SKILL.md`를 아래의 전체 내용으로 생성합니다(`description`은 "무엇을 하는지 + 언제 사용하는지"를 나타내며, 에이전트가 자동으로 트리거할 때 사용합니다):

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
# 텍스트-투-이미지 (기본 1장)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_lite.py "우주비행사 헬멧을 쓴 시바견, 시네마틱 조명" -o dog.png --aspect 16:9

# 초광각 배너 (8:1 / 4:1 등)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_lite.py "중국식 산수 두루마리 배너" -o banner.png --aspect 8:1

# 이미지 편집 (이미지 1장 전달)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_lite.py "배경을 밤의 사이버펑크 도시로 바꿔 주세요" -i input.jpg -o edited.png

# 다중 이미지 합성 (여러 장 전달, -i를 반복)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_lite.py "이 두 사람을 하나의 사무실 단체 사진에 넣어 주세요" -i a.png -i b.png -o merged.png

# 여러 변형을 한 번에 생성 (최대 5개, 동시 실행)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_lite.py "중국식 산수 일러스트" -o shanshui.png -n 3 --aspect 16:9
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
  `name`는 소문자와 하이픈이어야 하며 **`claude` / `anthropic` 같은 예약어를 포함해서는 안 됩니다**. 슬래시 명령이 있는 에이전트에서는 폴더 이름이 명령 이름입니다 — `nano-banana-lite`는 `/nano-banana-lite`를 의미합니다. `${CLAUDE_SKILL_DIR}`는 Claude Code가 제공하는 스킬 디렉터리 변수입니다. 다른 에이전트는 스크립트의 실제 경로를 사용하면 됩니다.
</Tip>

## scripts/nano\_banana\_lite.py

Gemini 네이티브 형식으로 `nano-banana-lite/scripts/nano_banana_lite.py`를 생성하세요(이 사이트의 텍스트-이미지 / 이미지 편집 코드와 동일하며, 작동이 검증되었습니다). **순수 Python 표준 라이브러리만 사용합니다 — `pip install`는 필요하지 않습니다**:

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
  모델 이름의 기본값은 `gemini-3.1-flash-lite-image`입니다. Lite는 1K 캔버스에 중점을 둡니다 — `--size`를 `1K`로 유지하세요; 2K/4K 또는 더 강한 품질이 필요하면 Nano Banana 2 / Pro 스킬을 사용하세요(`APIYI_IMAGE_MODEL` 환경 변수로 모델을 전환할 수도 있습니다).
</Tip>

## 한 문장으로 이미지가 생성되는 이유

많은 분들이 궁금해합니다. 명령을 입력하지 않았는데, 「고양이를 그려줘」라고 말하는 것만으로 어떻게 이미지가 생성되는 것일까요?

작동 방식은 이렇습니다. 에이전트가 시작되면, 각 스킬의 `SKILL.md`에 있는 `description`를 **먼저 읽습니다**(“이 스킬이 무엇을 하고 언제 사용해야 하는지”를 설명하는 짧은 메타데이터입니다). 사용자의 요청이 그 설명의 상황과 **일치하면**(예: “이미지를 그리기/생성/렌더링”, “이 이미지를 …로 변경”), 에이전트는 **자동으로 이 스킬을 호출하기로 결정**하고, `SKILL.md` 전체를 읽은 다음 스크립트를 실행합니다. 이 모든 과정은 사용자가 어떤 명령도 외울 필요 없이 이루어집니다.

따라서:

* **잘 작성된 `description` = 더 정확한 자동 트리거링**입니다. 이 스킬의 설명에는 이미 “이미지 생성/그리기/편집/합성”과 같은 표현이 포함되어 있습니다.
* 에이전트가 추측하지 않게 하고 **100% 제어**를 원하신다면, 아래의 **명시적 호출**을 사용하십시오.

## 사용 방법

### 자연어(암묵적 트리거)

설치한 뒤에는 에이전트에게 그냥 말하면 됩니다:

| 사용자가 말하는 내용                                                        | 스킬 동작                                         |
| ------------------------------------------------------------------ | --------------------------------------------- |
| "Use nano banana lite to make a 16:9 snow-mountain sunrise poster" | 스크립트를 호출합니다(`-i` 없음), png 1개를 출력합니다           |
| "Make an 8:1 ultra-wide Chinese-style banner"                      | 스크립트를 호출합니다 `--aspect 8:1`, 초광폭 png 1개를 출력합니다 |
| "Give me 3 different Chinese-style landscapes"                     | 스크립트를 호출합니다 `-n 3`, png 3개를 동시에 출력합니다         |
| "Blur the background of photo.jpg to highlight the person"         | 스크립트를 호출합니다 `-i photo.jpg`, png 1개를 출력합니다     |

### 명시적 호출(더 많은 제어)

에이전트가 스스로 결정하게 하고 싶지 않다면, 두 가지 명시적 옵션이 있습니다:

* **슬래시 명령이 있는 에이전트**(예: Claude Code):

  ```text theme={null}
  /nano-banana-lite An orange cat napping in a garden, oil-painting style --aspect 3:2
  ```

* **모든 에이전트 / 그냥 스크립트를 실행하라고 지시**(가장 범용적):

  ```text theme={null}
  Run python3 nano-banana-lite/scripts/nano_banana_lite.py "An orange cat napping in a garden, oil-painting style" --aspect 3:2
  ```

<Tip>
  **비율 조정**: `--aspect`를 사용하여 종횡비를 선택합니다(14개 중 1개이며, 세로가 매우 길거나 가로가 매우 넓은 `1:4 / 4:1 / 1:8 / 8:1`도 포함됩니다). Lite는 1K 캔버스에 집중하므로 해상도를 따로 지정할 필요가 없습니다. "portrait 9:16" 또는 "make an ultra-wide banner"라고만 말하면 에이전트가 aspect 매개변수를 자동으로 추가합니다.
</Tip>

## 생성된 이미지 위치

* `-o`가 **파일명**뿐인 경우(예: `-o dog.png`), 이미지는 프로젝트 루트의 **`nano-banana-output/` 폴더**에 저장됩니다(자동 생성되므로), 프로젝트 안에서 바로 찾을 수 있습니다.
* "프로젝트 루트" = 스크립트에서 위로 올라가며 찾은 `.git` 또는 `.claude`을 포함하는 첫 번째 디렉터리입니다 — **에이전트가 어느 디렉터리에서 실행되든 이미지가 임시 디렉터리가 아니라 프로젝트 내부에 저장되므로**, 나중에 잃어버릴 일이 없습니다.
* 스크립트는 이미지마다 전체 절대 경로를 하나씩 출력합니다. 예: `Image saved to /Users/you/project/nano-banana-output/dog.png`.
* 기본값으로는 이미지 1장만 생성됩니다. `-n 3`는 한 번에 3장을 출력하며(최대 5장, 그 이상은 자동으로 제한됨), 파일명에 `-1`, `-2`, `-3` 접미사가 추가됩니다.
* 디렉터리가 포함된 **경로**를 전달하면(예: `-o images/dog.png` 또는 절대 경로), `nano-banana-output/`이 아니라 사용자가 지정한 경로에 저장됩니다(상대 경로는 현재 작업 디렉터리를 기준으로 합니다).
* 이미지 편집도 같은 방식으로 동작합니다. 출력은 새 파일이며 **원본을 절대로 덮어쓰지 않습니다**.

<Info>
  Nano Banana 2 Lite는 엄격한 콘텐츠 안전 제어를 사용합니다. 스크립트가 `STOP`가 아닌 `finishReason`를 보고하거나 거부 텍스트를 반환하면, 메시지에 따라 내용을 조정하십시오. 같은 위반 prompt를 반복해서 다시 시도하지 마십시오.
</Info>

## 관련 문서

* [Nano Banana Lite 이미지 생성 개요](/ko/api-capabilities/nano-banana-lite-image/overview)
* [텍스트-투-이미지 API 레퍼런스](/ko/api-capabilities/nano-banana-lite-image/text-to-image)
* [이미지 편집 API 레퍼런스](/ko/api-capabilities/nano-banana-lite-image/image-edit)
* [Nano Banana 2 에이전트 스킬](/ko/api-capabilities/nano-banana-2-image/skills)
* [Nano Banana 가격](/ko/api-capabilities/nano-banana-pricing)
