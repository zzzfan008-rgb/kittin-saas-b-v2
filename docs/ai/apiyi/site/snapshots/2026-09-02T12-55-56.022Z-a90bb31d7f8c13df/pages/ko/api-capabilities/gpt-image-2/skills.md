> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image-2 시리즈 Agent Skill

> gpt-image-2(공식)와 gpt-image-2-all / gpt-image-2-vip(역방향)을 하나의 바로 사용할 수 있는 Agent Skill로 패키징합니다. Codex, OpenClaw, hermes-agent, Claude Code 또는 기타 코딩 Agent에 넣고 --model로 채널을 전환하여 텍스트-이미지, 다중 이미지 융합, 인페인팅에 사용할 수 있습니다.

<Note>
  이 페이지는 **바로 사용할 수 있는 Agent Skill**을 제공합니다: 하나의 스크립트가 **gpt-image-2 (공식)**, **gpt-image-2-all**, **gpt-image-2-vip**(역방향) 세 채널을 모두 지원합니다. 이들은 모두 동일한 OpenAI Images API를 사용하며, 차이는 오직 `--model`뿐입니다. 이미 사용 중인 코딩 Agent에 넣고 하나의 prompt로 이미지를 생성하세요 — 파일은 두 개뿐입니다.
</Note>

## 이 스킬의 기능

하나로 결합된 스킬입니다. 스크립트가 **입력 이미지를 전달했는지 여부**를 자동 감지하여 텍스트-이미지와 이미지 편집 중 무엇을 사용할지 결정합니다:

<CardGroup cols={3}>
  <Card title="텍스트를 이미지로" icon="wand-sparkles">
    프롬프트만 제공하면 → 강력한 텍스트 렌더링과 사실적인 품질을 갖춘 완전히 새로운 이미지가 생성됩니다.
  </Card>

  <Card title="다중 이미지 융합" icon="layers">
    여러 이미지(최대 16장) + 하나의 지시문 → 이미지 1의 사람을 이미지 2의 장면에 넣고, 이미지 3의 스타일을 유지하는 식으로 처리합니다.
  </Card>

  <Card title="인페인팅" icon="image">
    이미지 1장 + `--mask` + 지시문 → 마스크된 영역만 변경합니다(**gpt-image-2 공식만 지원합니다**).
  </Card>
</CardGroup>

## 어떤 모델을 선택해야 하나요

세 채널 모두 **호출 방식은 동일**합니다. 차이는 소스 채널, 가격/속도, 그리고 어떤 매개변수가 반영되는지뿐입니다. 스크립트는 `--model`를 통해 이러한 차이를 자동으로 처리합니다:

| 모델 (`--model`)      | 채널               | 가격                        | 속도                 | `size`           | `quality` / `mask` | 최적 용도                        |
| ------------------- | ---------------- | ------------------------- | ------------------ | ---------------- | ------------------ | ---------------------------- |
| `gpt-image-2` (기본값) | 공식 패스스루          | token 기반 \~\$0.03–0.2/img | \~100–120s         | ✅ 모든 프리셋         | ✅ 예                | 품질 등급, 마스크 인페인팅, 투명 배경       |
| `gpt-image-2-all`   | 역방향 (ChatGPT 라인) | 고정 \$0.03/img             | **가장 빠름 \~30–60s** | ❌ prompt에 직접 작성  | ❌                  | 대량 처리, 속도, prompt 텍스트로 크기 지정 |
| `gpt-image-2-vip`   | 역방향 (Codex 라인)   | 고정 \$0.03/img             | \~90–150s          | ✅ 4K를 포함한 30개 등급 | ❌                  | 저렴한 가격의 고정 출력 크기 / 4K        |

<Tip>
  빠른 규칙: **빠르고 저렴하게** → `gpt-image-2-all`; **고정 크기/4K & 저렴하게** → `gpt-image-2-vip`; **품질 등급, 마스크 인페인팅** → `gpt-image-2`(공식).
</Tip>

## 어떤 Agent가 사용할 수 있습니까

<Info>
  Skill은 본질적으로 **폴더**일 뿐입니다: Agent가 읽을 수 있도록 한 지침(`SKILL.md`) + 작업을 수행하는 스크립트의 집합입니다. 따라서 로컬 파일을 읽고 셸 명령을 실행할 수 있는 모든 코딩 Agent가 이를 사용할 수 있습니다 — 예를 들어 **Codex, OpenClaw, hermes-agent, Claude Code** 등이 있습니다.

  유일한 요구 사항은 Agent를 실행하는 머신(사용자 컴퓨터 또는 서버)에 **Python 3**가 설치되어 있고 **네트워크 액세스**가 있어야 한다는 것입니다(스크립트가 `api.apiyi.com`를 직접 호출합니다). 그뿐입니다 — 특정 Agent에 종속되지 않습니다.
</Info>

## 3단계로 설정하기

### ① 폴더를 만들고, 파일을 붙여넣고, 종속성을 설치합니다

전체 내용은 다음 두 섹션에 있는 두 파일로 구성된 스킬 폴더를 만듭니다. 이 스킬은 OpenAI SDK를 통해 호출하므로, 먼저 종속성 하나를 설치합니다:

```bash theme={null}
pip install openai
```

```
gpt-image-2/
├── SKILL.md
├── scripts/
│   └── gpt_image.py
└── .env          # created in step ②, holds your key
```

### ② 같은 폴더에 키를 넣습니다

`api.apiyi.com` 콘솔에서 하나를 생성한 **APIYI API Key**를 `gpt-image-2/.env`에 기록합니다:

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

이 스크립트는 이 `.env`에서 키를 자동으로 읽습니다 — **추가 설정이나 환경 변수는 필요하지 않습니다**.

<Warning>
  `.env`에는 비밀 키가 들어 있습니다. 이 스킬을 프로젝트 리포지토리로 공유하는 경우, **반드시 `.env`을 `.gitignore`에 추가하고 git에 절대 커밋하지 마십시오**.
</Warning>

### ③ Agent에 전달합니다

* **스킬을 자동으로 검색하는 에이전트**(예: Claude Code): 전체 `gpt-image-2/` 폴더를 해당 스킬 디렉터리에 넣으십시오 — 개인용 `~/.claude/skills/` 또는 프로젝트 수준 `.claude/skills/`(리포지토리로 공유됨)입니다.
* **다른 에이전트**: 각자의 스킬/플러그인 규칙에 따라 배치하거나, 가장 간단하게는 \*\*“이 폴더의 SKILL.md를 읽고 따르십시오”\*\*라고 에이전트에게 지시하면 됩니다.

설치가 끝나면 바로 사용할 수 있습니다 — 예시는 [사용 방법](#how-to-use-it)을 확인하십시오.

## SKILL.md

아래의 전체 내용을 가진 `gpt-image-2/SKILL.md`를 생성합니다(`description`은 “무엇을 하는지 + 언제 사용하는지”를 설명하며, 에이전트가 이를 자동으로 트리거할 때 사용하는 내용입니다):

````markdown theme={null}
---
name: gpt-image-2
description: Generate or edit images via APIYI's gpt-image-2 (official) and gpt-image-2-all / gpt-image-2-vip (reverse) models. Use this when the user asks to create, draw, render, or generate an image/illustration/poster, or to edit, retouch, restyle, fuse, or inpaint existing images.
allowed-tools: Bash(python3 *)
---

# GPT-Image-2 Series Image Skill

Generate or edit images through the APIYI platform using the gpt-image-2 series. One script covers three channels, switched by `--model`:

- `gpt-image-2` (default, official): supports `size` / `quality` / `mask` inpainting; token-based billing.
- `gpt-image-2-all` (reverse, ChatGPT line): fastest, flat \$0.03/img; **no `size`/`quality`** — put size in the prompt.
- `gpt-image-2-vip` (reverse, Codex line): can lock `size` (30 tiers incl. 4K), flat \$0.03/img; **no `quality`/`mask`**.

## Key configuration

The script auto-reads `APIYI_API_KEY` from a `.env` file in the skill folder (an environment variable of the same name also works).
The script depends on the OpenAI SDK; if it reports a missing package, ask the user to run `pip install openai`.

## Usage

The first argument is the prompt; for editing/fusion, pass one or more local image paths with `-i`:

```bash
# 텍스트를 이미지로 변환하기(기본 gpt-image-2 공식, 고품질 포함)
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "해변 바에 있는 선글라스를 쓴 주황색 고양이, 시네마틱" -o cat.png --size 1536x1024 --quality high

# 가장 빠르고 가장 저렴함: 'all' 반전(크기는 prompt에 넣고 size는 전달하지 않음)
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "평면 일러스트 축제 포스터, 세로 2:3" -o poster.png --model gpt-image-2-all

# 고정 4K가 필요함: 'vip' 반전
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "도시 야경 항공 뷰" -o city.png --model gpt-image-2-vip --size 3840x2160

# 다중 이미지 융합(최대 16개, -i 반복)
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "이미지 1의 인물을 이미지 2의 장면에 넣고, 이미지 3의 색감을 유지" -i person.png -i scene.png -i style.png -o fused.png

# 인페인팅(마스크, gpt-image-2 공식만)
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "마스크된 영역을 원형 창으로 바꾸기" -i room.png --mask mask.png -o edited.png

# 여러 개를 한 번에(최대 5개, 동시 실행)
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "축제 포스터 초안" -o draft.png -n 3 --model gpt-image-2-all
```

Arguments:

- 1st positional arg: the prompt (required).
- `--model`: `gpt-image-2` (default) / `gpt-image-2-all` / `gpt-image-2-vip`. You can also set a default with `APIYI_IMAGE_MODEL=...` in `.env`.
- `-i / --image`: input image path, repeatable (up to 16); omitted = text-to-image, present = edit/fusion.
- `-o / --out`: output filename, defaults to `output.png`.
- `-n / --count`: how many at once, **default 1**, max 5 (client-side concurrency; the script never sends `n`, avoiding per-image overbilling on reverse channels).
- `--size`: size, default `auto` (`gpt-image-2-all` ignores it — write size/ratio into the prompt).
- `--quality`: `low`/`medium`/`high`/`auto`, **only effective on `gpt-image-2` official** (the script omits it for reverse models).
- `--format`: `png`/`jpeg`/`webp`, official only.
- `--mask`: mask image, official edit only (PNG with alpha, applies to the first image).
- `--background`: `transparent`/`opaque`/`auto`, official only. With `transparent`, `--format` must be `png` or `webp`.

## Choice & red lines (important)

- **Default `gpt-image-2` (official)**: use it for quality tiers and mask inpainting.
- **Fast/cheap** → `gpt-image-2-all`; **locked size/4K** → `gpt-image-2-vip`.
- For reverse models (all/vip), **never pass `quality`**; for **`gpt-image-2-all` never pass `size`** (put it in the prompt). The script gates this automatically, but follow it when calling the script directly too.
- **Transparent backgrounds**: only official `gpt-image-2` has a `background` parameter. Add `--background transparent` to get a real alpha-channel image (`--format` must be `png`/`webp`). The reverse models all/vip have no such parameter — you can only ask for it in the prompt, and it is occasionally unreliable.

## Number of images & cost

- **Default to a single image**; use `-n` only when the user explicitly asks, max 5.
- Reverse all/vip are flat \$0.03/img; official gpt-image-2 is token-based and `--quality high` is pricier (~\$0.21/img at 1K) — drop to `medium`/`low` or use a reverse model when budget matters.

## Output location (important)

- A **bare filename** for `-o` saves into a **`gpt-image-output/` folder at the project root**; a **path with a directory** is saved as given.
- Do not write images to `/tmp`, scratchpad, or other temp directories — the user won't find them.

## After running

The script prints one full path per image — report them all back to the user. If a request is rejected by moderation, relay the reason as-is and do not retry the same prompt.
````

<Tip>
  `name`는 소문자와 하이픈만 사용해야 합니다. 슬래시 명령을 지원하는 에이전트에서는 디렉터리 이름이 명령입니다 — `gpt-image-2`가 `/gpt-image-2`가 됩니다. `${CLAUDE_SKILL_DIR}`은 Claude Code가 제공하는 스킬 디렉터리 변수입니다. 다른 에이전트에서는 스크립트의 실제 경로를 사용하면 됩니다.
</Tip>

## scripts/gpt\_image.py

APIYI(`base_url="https://api.apiyi.com/v1"`)를 가리키도록 설정된 OpenAI SDK를 사용하여 `gpt-image-2/scripts/gpt_image.py`를 생성합니다:

```python theme={null}
#!/usr/bin/env python3
"""Generate / edit images via APIYI's gpt-image-2 series (gpt-image-2 official / gpt-image-2-all / gpt-image-2-vip reverse).
All use the OpenAI Images API (/v1/images/generations + /v1/images/edits), switched by --model. Needs: pip install openai"""
import argparse
import base64
import os
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor

from openai import OpenAI

# Max images generated concurrently per call (server returns 1 per call; this simulates more client-side)
MAX_COUNT = 5

# Per-model capability gating: whether these params are accepted (never send the unaccepted ones)
MODEL_CAPS = {
    "gpt-image-2":     {"size": True,  "quality": True,  "output_format": True,  "mask": True,  "background": True},   # official
    "gpt-image-2-all": {"size": False, "quality": False, "output_format": False, "mask": False, "background": False},  # reverse, ChatGPT
    "gpt-image-2-vip": {"size": True,  "quality": False, "output_format": False, "mask": False, "background": False},  # reverse, Codex
}


def caps_of(model):
    # Unknown models fall back to the official capability set
    return MODEL_CAPS.get(model, MODEL_CAPS["gpt-image-2"])


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


def resolve_paths(out, count):
    """Decide output paths. Bare filename -> <project_root>/gpt-image-output/; a path with a dir -> as given."""
    if os.path.dirname(out):
        base_path = os.path.abspath(out)
    else:
        out_dir = os.path.join(project_root(), "gpt-image-output")
        os.makedirs(out_dir, exist_ok=True)
        base_path = os.path.join(out_dir, out)

    if count == 1:
        return [base_path]
    base, ext = os.path.splitext(base_path)
    return [f"{base}-{i}{ext}" for i in range(1, count + 1)]


def decode_image(item):
    """Get image bytes: b64_json may be pure base64 or a data:image-prefixed data URL (reverse models); or only a url."""
    raw = getattr(item, "b64_json", None)
    if raw:
        if raw.startswith("data:"):
            raw = raw.split(",", 1)[1]  # strip the data:image/png;base64, prefix
        return base64.b64decode(raw)
    url = getattr(item, "url", None)
    if url:
        with urllib.request.urlopen(url, timeout=360) as r:
            return r.read()
    raise RuntimeError("response has neither b64_json nor url")


def one_image(client, model, args):
    """Make one request, return image bytes; raise on failure (caught by _safe). Never sends n (default 1; concurrency for more)."""
    cap = caps_of(model)
    if args.image:
        # Edit / multi-image fusion: reopen files each call to avoid sharing handles across threads
        files = [open(p, "rb") for p in args.image]
        try:
            kwargs = dict(model=model, image=files if len(files) > 1 else files[0], prompt=args.prompt)
            if cap["size"] and args.size:
                kwargs["size"] = args.size
            if cap["quality"] and args.quality:
                kwargs["quality"] = args.quality
            if cap["output_format"] and args.format:
                kwargs["output_format"] = args.format
            if cap["background"] and args.background and args.background != "auto":
                kwargs["background"] = args.background
            if cap["mask"] and args.mask:
                kwargs["mask"] = open(args.mask, "rb")
            resp = client.images.edit(**kwargs)
        finally:
            for fh in files:
                fh.close()
    else:
        # Text to image
        kwargs = dict(model=model, prompt=args.prompt)
        if cap["size"] and args.size:
            kwargs["size"] = args.size
        if cap["quality"] and args.quality:
            kwargs["quality"] = args.quality
        if cap["output_format"] and args.format:
            kwargs["output_format"] = args.format
        if cap["background"] and args.background and args.background != "auto":
            kwargs["background"] = args.background
        resp = client.images.generate(**kwargs)
    return decode_image(resp.data[0])


def main():
    api_key = load_api_key()
    if not api_key:
        sys.exit("No API key found: add a line APIYI_API_KEY=sk-xxx to the .env in the skill folder")

    default_model = os.environ.get("APIYI_IMAGE_MODEL", "gpt-image-2")
    # Synchronous blocking call; image generation is slow, so give a generous 360s timeout
    client = OpenAI(api_key=api_key, base_url="https://api.apiyi.com/v1", timeout=360)

    parser = argparse.ArgumentParser(description="gpt-image-2 series image generation")
    parser.add_argument("prompt", help="Prompt / edit instruction")
    parser.add_argument("--model", default=default_model,
                        help="gpt-image-2 (official) / gpt-image-2-all (fastest) / gpt-image-2-vip (lockable size)")
    parser.add_argument("-i", "--image", action="append", default=[],
                        help="Input image path (repeatable, up to 16; presence = edit/fusion mode)")
    parser.add_argument("-o", "--out", default="output.png", help="Output filename")
    parser.add_argument("-n", "--count", type=int, default=1,
                        help=f"How many at once, default 1, max {MAX_COUNT} (client-side concurrency)")
    parser.add_argument("--size", default="auto",
                        help="Size, e.g. 1024x1024 / 2048x1152 / auto (gpt-image-2-all ignores it; put it in the prompt)")
    parser.add_argument("--quality", default="high",
                        help="Quality low / medium / high / auto (only effective on gpt-image-2 official)")
    parser.add_argument("--format", default="png", help="Output format png / jpeg / webp (official only)")
    parser.add_argument("--mask", help="Mask image (official edit only, PNG with alpha, applies to the first image)")
    parser.add_argument("--background", default="auto", choices=["transparent", "opaque", "auto"],
                        help="Background; transparent yields an alpha-channel image (official only, needs --format png/webp)")
    args = parser.parse_args()

    # jpeg has no alpha channel and is mutually exclusive with transparency — catch it locally, do not hand the user a 400
    if args.background == "transparent" and args.format == "jpeg":
        sys.exit("--background transparent cannot be combined with --format jpeg (no alpha channel); use png or webp")

    count = args.count
    if count < 1:
        count = 1
    if count > MAX_COUNT:
        print(f"Note: max {MAX_COUNT} at once; clamped {args.count} to {MAX_COUNT}.", file=sys.stderr)
        count = MAX_COUNT

    paths = resolve_paths(args.out, count)

    def task(path):
        data = one_image(client, args.model, args)
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

## 모델 전환 방법

채널 전환은 \*\*`--model`\*\*일 뿐이며, 세 가지 값 중 하나입니다:

```text theme={null}
... gpt_image.py "prompt"                              # default gpt-image-2 (official)
... gpt_image.py "prompt" --model gpt-image-2-all      # reverse, fastest, cheapest
... gpt_image.py "prompt" --model gpt-image-2-vip --size 3840x2160   # reverse, locked 4K
```

기본 채널을 변경하려면(매번 `--model`를 전달하지 않도록 하려면) `gpt-image-2/.env`에 한 줄을 추가합니다:

```bash theme={null}
APIYI_IMAGE_MODEL=gpt-image-2-all
```

<Info>
  스크립트는 base64와 url 응답을 모두 자동으로 처리합니다(역방향 모델의 `b64_json`에는 `data:image;base64,` 접두사가 포함되어 있으며, 스크립트가 이를 제거합니다). URL 출력을 반드시 필요로 하는 경우에만 APIYI 콘솔에서 token의 과금 그룹을 `image2_OSS`로 변경하면 됩니다. 일반 생성에서는 필요하지 않습니다.
</Info>

## 왜 한 문장만으로 이미지가 생성됩니까

사람들은 종종 이렇게 궁금해합니다. 명령을 한 번도 입력하지 않았는데, 어떻게 "draw a cat"이 이미지로 만들어졌을까요?

작동 방식은 이렇습니다. 시작 시 에이전트는 **먼저 각 스킬의 `SKILL.md`에서 `description`를 읽습니다**(이 스킬이 무엇을 하며 언제 사용해야 하는지를 아주 짧게 설명하는 메타데이터입니다). 요청이 이 시나리오와 **일치하면**(예: "draw / generate / render an image", "fuse these images"), 에이전트는 **자동으로 스킬을 호출하기로 결정하고**, 전체 `SKILL.md`를 읽은 뒤 스크립트를 실행합니다. 이 모든 과정은 사용자가 어떤 명령도 기억할 필요 없이 이루어집니다.

에이전트가 추측하지 않게 하고 **완전한 제어**를 원하신다면, 아래의 **명시적 호출**을 사용하십시오.

## 사용 방법

### 자연어(암시적 트리거)

설치한 후에는 에이전트에게 말하기만 하면 됩니다:

| 말하는 내용                             | 스킬 동작                                                   |
| ---------------------------------- | ------------------------------------------------------- |
| "gpt-image-2로 영화 같은 고양이를 그려 줘"     | 기본 gpt-image-2, png 1개                                  |
| "포스터를 빠르고 저렴하게 만들어 줘"              | 에이전트가 `--model gpt-image-2-all`를 추가합니다                  |
| "도시의 4K 야경을 렌더링해 줘"                | 에이전트가 `--model gpt-image-2-vip --size 3840x2160`를 추가합니다 |
| "person.png 속 인물을 scene.png에 넣어 줘" | `-i person.png -i scene.png`를 실행하고, 합성된 이미지             |

### 명시적 호출(더 많은 제어)

* **슬래시 명령을 지원하는 에이전트**(예: Claude Code):

  ```text theme={null}
  /gpt-image-2 Cyberpunk city rainy night, neon sign close-up --model gpt-image-2-vip --size 2048x1152
  ```

* **모든 에이전트 / 그냥 스크립트를 실행하라고 지시하는 경우**(가장 범용적):

  ```text theme={null}
  Run python3 gpt-image-2/scripts/gpt_image.py "Cyberpunk city rainy night, neon sign close-up" --model gpt-image-2-all
  ```

## 생성된 이미지가 저장되는 위치

* `-o`가 **파일명만 있는 경우**(예: `-o cat.png`), 이미지들은 모두 **프로젝트 루트의 `gpt-image-output/` 폴더**에 저장됩니다(자동 생성됨). 따라서 프로젝트 안에서 바로 찾을 수 있습니다.
* "프로젝트 루트" = 스크립트 자체 위치에서 상위로 올라가며 찾았을 때 `.git` 또는 `.claude`를 포함하는 첫 번째 디렉터리입니다. 즉, **Agent가 어느 디렉터리에서 실행되든 이미지가 프로젝트 안에 저장되므로**, 찾을 수 없는 임시 디렉터리에 들어가지 않습니다.
* 스크립트는 이미지당 전체 절대 경로를 하나씩 출력합니다. 예: `Image saved to /Users/you/project/gpt-image-output/cat.png`.
* 기본적으로는 **이미지 1장만** 생성합니다. `-n 3`는 한 번에 3장을 생성하며(최대 5장), `-1`, `-2`, `-3` 접미사가 자동으로 추가됩니다.
* `-o`가 **디렉터리가 포함된 경로**(예: `-o images/cat.png` 또는 절대 경로)인 경우, 해당 정확한 경로에 저장되며 `gpt-image-output/`로 들어가지 않습니다.
* 편집 / 퓨전도 같은 방식으로 동작합니다. 출력은 새 파일이며 **원본을 덮어쓰지 않습니다**.

## 관련 문서

* [GPT-Image-2-All 에이전트 스킬](/ko/api-capabilities/gpt-image-2-all/skills) (역순, 가장 빠름)
* [GPT-Image-2-VIP 에이전트 스킬](/ko/api-capabilities/gpt-image-2-vip/skills) (역순, 4K 잠금)
* [GPT-Image-2 이미지 생성 개요](/ko/api-capabilities/gpt-image-2/overview)
* [Nano Banana Pro 에이전트 스킬](/ko/api-capabilities/nano-banana-image/skills)
