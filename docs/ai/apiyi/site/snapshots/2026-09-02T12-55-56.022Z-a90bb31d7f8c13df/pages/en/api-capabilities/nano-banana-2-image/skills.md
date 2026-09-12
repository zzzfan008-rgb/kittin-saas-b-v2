> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana 2 Agent Skill

> Package Nano Banana 2 (gemini-3.1-flash-image-preview) as a ready-to-use Agent Skill. Drop it into Codex, OpenClaw, hermes-agent, Claude Code, or any coding Agent and call APIYI for text-to-image and image editing with a single prompt.

<Note>
  This page provides a **ready-to-use Agent Skill**: drop it into the coding Agent you already use, and use natural language (or an explicit command) to call **Nano Banana 2** (`gemini-3.1-flash-image-preview`) on the APIYI platform for image generation and editing. The whole thing is just two files — copy and go.
</Note>

<Tip>
  If you want the **Pro** skill instead (`gemini-3-pro-image`, top-tier quality), see [Nano Banana Pro Agent Skill](/en/api-capabilities/nano-banana-image/skills). This page is **Nano Banana 2** (Pro-level quality at Flash-tier speed, better value).
</Tip>

## What the skill does

A single combined skill. The script auto-detects **whether you pass input images** to decide between text-to-image and image editing:

<CardGroup cols={3}>
  <Card title="Text to image" icon="wand-sparkles">
    Prompt only → a brand-new image, with **14 aspect ratios** and 512/1K/2K/4K resolution.
  </Card>

  <Card title="Image editing" icon="image">
    One image + an instruction → local edits, restyle, background replacement, and more.
  </Card>

  <Card title="Multi-image compositing" icon="layers">
    Multiple images + one instruction → compositing, comparison, outfit swaps, etc.
  </Card>
</CardGroup>

Versus Pro, Nano Banana 2 adds four **ultra-tall/ultra-wide** ratios (`1:4 / 4:1 / 1:8 / 8:1`) and an exclusive **512px** low-res tier, at just \$0.055/image per call (token-based as low as \~\$0.025/image) — better suited for volume.

## Which Agents can use it

<Info>
  A Skill is essentially just **a folder**: a set of instructions for the Agent to read (`SKILL.md`) + a script that does the work. So **any coding Agent that can read local files and run shell commands can use it** — for example **Codex, OpenClaw, hermes-agent, Claude Code**, and more.

  The only requirement: the machine running the Agent (your computer or server) has **Python 3** installed and **network access** (the script calls `api.apiyi.com` directly). That's it — it is not tied to any specific Agent.
</Info>

## Set up in 3 steps

### ① Create the folder and paste the files

Create a skill folder with these two files (full contents in the next two sections):

```
nano-banana-2/
├── SKILL.md
├── scripts/
│   └── nano_banana_2.py
└── .env          # created in step ②, holds your key
```

### ② Put your key in the same folder

Write your **APIYI API Key** (create one in the `api.apiyi.com` console) into `nano-banana-2/.env`:

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

The script reads the key from this `.env` automatically — **no extra configuration or environment variables needed**.

<Warning>
  `.env` holds your secret key. If you share this skill via a project repo, **be sure to add `.env` to `.gitignore` and never commit it to git**.
</Warning>

### ③ Hand it to your Agent

* **Agents that auto-discover skills** (e.g. Claude Code): drop the whole `nano-banana-2/` folder into its skills directory — personal `~/.claude/skills/`, or project-level `.claude/skills/` (shared via the repo).
* **Other Agents**: place it per their own skill/plugin convention; or simplest of all — **just tell the Agent to "read the SKILL.md in this folder and follow it"**.

Once installed, you're ready — jump to [How to use it](#how-to-use-it) for examples.

## SKILL.md

Create `nano-banana-2/SKILL.md` with the full content below (the `description` states "what it does + when to use it", which is what the Agent uses to auto-trigger it):

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
# Text to image (1 image by default)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2.py "A shiba inu wearing an astronaut helmet, cinematic lighting" -o dog.png --size 2K --aspect 16:9

# Ultra-wide banner (Nano Banana 2's exclusive 8:1 / 4:1 ultra-wide ratios)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2.py "Chinese ink long-scroll banner" -o banner.png --aspect 8:1 --size 2K

# Image editing (one image)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2.py "Replace the background with a cyberpunk night city" -i input.jpg -o edited.png

# Multi-image compositing (repeat -i)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2.py "Composite these two people into one office group photo" -i a.png -i b.png -o merged.png

# Several variants of the same prompt at once (max 5, generated concurrently)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_2.py "Chinese ink landscape illustration" -o landscape.png -n 3 --aspect 16:9
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
  `name` must be lowercase letters + hyphens and **must not contain reserved words like `claude` / `anthropic`**. On Agents that support slash commands, the directory name is the command — `nano-banana-2` becomes `/nano-banana-2`. `${CLAUDE_SKILL_DIR}` is a skill-directory variable provided by Claude Code; on other Agents just use the script's actual path.
</Tip>

## scripts/nano\_banana\_2.py

Create `nano-banana-2/scripts/nano_banana_2.py` using the Gemini-native format (identical to the verified, working code on the APIYI text-to-image / image-edit reference pages). **Pure Python standard library — no `pip install` needed**:

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
  The default model name is `gemini-3.1-flash-image-preview`. Google later shipped the stable name without `-preview`, `gemini-3.1-flash-image`; both share the same price and work. To switch, set `APIYI_IMAGE_MODEL=gemini-3.1-flash-image`.
</Tip>

## Why a single sentence generates an image

People often wonder: I never typed a command, so how did "draw a cat" produce an image?

Here's how: at startup, the Agent **first reads the `description` from each skill's `SKILL.md`** (a very short piece of metadata describing "what this skill does and when to use it"). When your request **matches** that scenario (e.g. "draw / generate / render an image", "edit this image to..."), the Agent **automatically decides to invoke the skill**, reads the full `SKILL.md`, and runs the script — all without you remembering any command.

So:

* **A well-written `description` = more accurate auto-triggering.** This skill's description already covers phrasings like "generate / draw / edit / composite an image".
* When you don't want the Agent to guess and want **full control**, use the **explicit invocation** below.

## How to use it

### Natural language (implicit trigger)

Once installed, just talk to the Agent:

| What you say                                                  | Skill behavior                        |
| ------------------------------------------------------------- | ------------------------------------- |
| "Draw a 16:9 snow-mountain sunrise poster with nano banana 2" | Runs the script (no `-i`), 1 png      |
| "Make an 8:1 ultra-wide Chinese-style banner"                 | Runs `--aspect 8:1`, 1 ultra-wide png |
| "Give me 3 different Chinese ink landscapes"                  | Runs `-n 3`, 3 pngs concurrently      |
| "Blur the background of photo.jpg to emphasize the subject"   | Runs `-i photo.jpg`, 1 png            |

### Explicit invocation (more control)

When you don't want the Agent to decide for itself, two explicit ways:

* **Agents that support slash commands** (e.g. Claude Code):

  ```text theme={null}
  /nano-banana-2 An orange cat napping in a garden, oil painting style --size 2K --aspect 3:2
  ```

* **Any Agent / just tell it to run the script** (most universal):

  ```text theme={null}
  Run python3 nano-banana-2/scripts/nano_banana_2.py "An orange cat napping in a garden, oil painting style" --size 2K --aspect 3:2
  ```

<Tip>
  **How to control aspect ratio and sharpness**: use `--aspect` for the aspect ratio (14 options, including the `1:4 / 4:1 / 1:8 / 8:1` ultra-tall/ultra-wide ones Pro lacks), and `--size` for the resolution (`512` / `1K` / `2K` / `4K`, where `512` is Nano Banana 2's exclusive money-saving low-res tier). Just say "portrait 9:16", "render in 4K", or "make an ultra-wide banner" and the Agent will add these flags automatically.
</Tip>

## Where the generated image goes

* When `-o` is a **bare filename** (e.g. `-o dog.png`), images are all saved into a **`nano-banana-output/` folder at the project root** (created automatically), so you'll find them right there in your project.
* "Project root" = the first directory containing `.git` or `.claude` found by walking up from the script's own location — so **no matter which directory the Agent runs from, images land inside the project**, never in a temp directory you can't find.
* The script **prints one full absolute path per image**, e.g. `Image saved to /Users/you/project/nano-banana-output/dog.png`.
* By default it generates **just 1 image**; `-n 3` produces 3 at once (max 5, anything more is clamped to 5), with a `-1`, `-2`, `-3` suffix added automatically.
* When `-o` is a **path with a directory** (e.g. `-o images/dog.png` or an absolute path), it is saved at that exact path (relative paths are relative to the current working directory) and does not go into `nano-banana-output/`.
* Image editing works the same way: the output is a new file and **does not overwrite your original**.

<Info>
  Nano Banana 2 has strict content-safety controls. If the script reports a `finishReason` other than `STOP` or returns a rejection text, adjust your content accordingly and do not repeatedly retry the same violating prompt.
</Info>

## Related docs

* [Nano Banana 2 Image Generation overview](/en/api-capabilities/nano-banana-2-image/overview)
* [Text-to-Image API reference](/en/api-capabilities/nano-banana-2-image/text-to-image)
* [Image Editing API reference](/en/api-capabilities/nano-banana-2-image/image-edit)
* [Nano Banana Pro Agent Skill](/en/api-capabilities/nano-banana-image/skills)
* [Nano Banana pricing](/en/api-capabilities/nano-banana-pricing)
