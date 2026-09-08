> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Lite Agent Skill

> Package Nano Banana 2 Lite (gemini-3.1-flash-lite-image) as a ready-to-use Agent Skill — drop it into Codex, OpenClaw, hermes-agent, Claude Code, or any coding agent, and call APIYI's platform for text-to-image and image editing with a single sentence.

<Note>
  This page provides a **ready-to-use Agent Skill**: drop it into the coding agent you already use, and you can call APIYI's **Nano Banana 2 Lite** (`gemini-3.1-flash-lite-image`) with natural language (or explicit commands) to generate and edit images. The whole thing is just two files — copy and go.
</Note>

<Tip>
  If you need higher quality or 2K/4K, see the [Nano Banana 2 Agent Skill](/en/api-capabilities/nano-banana-2-image/skills) (up to 4K) or the [Nano Banana Pro Agent Skill](/en/api-capabilities/nano-banana-image/skills) (ultimate quality). This page is **Lite** (fastest and cheapest, focused on 1K, \$0.025/image per-call).
</Tip>

## What this skill does

A single merged skill — the script auto-detects **whether images are passed** to decide between "text-to-image" and "image editing":

<CardGroup cols={3}>
  <Card title="Text-to-Image" icon="wand-sparkles">
    Prompt only → generate a brand-new image, supporting **14 aspect ratios**, 1K canvas, \~4s per image.
  </Card>

  <Card title="Image Editing" icon="image">
    Pass one image + instruction → local edits, style transfer, background replacement, etc.
  </Card>

  <Card title="Multi-Image Compositing" icon="layers">
    Pass multiple images + one instruction → compositing, comparison, outfit swaps, and more.
  </Card>
</CardGroup>

Nano Banana 2 Lite is built for **speed and cost**: \~4s per image, \~2.7x faster than Nano Banana 2, token-based averaging \~\$0.018/call in practice (40% of Google's rate) and per-call \$0.025/image — ideal for high concurrency, rapid iteration, and volume.

## Which agents can use it

<Info>
  A Skill is essentially just **a folder**: a description written for the agent (`SKILL.md`) + a script that does the work. So **any coding agent that can read local files and run the command line can use it** — e.g. **Codex, OpenClaw, hermes-agent, Claude Code**, and more.

  The only requirement: the machine running the agent (your computer or server) has **Python 3** installed and **internet access** (the script connects directly to `api.apiyi.com`). That's it — no specific agent required.
</Info>

## Install in three steps

### ① Create the folder, paste the files

Create a skill folder and add the two files below (full contents in the next two sections):

```
nano-banana-lite/
├── SKILL.md
├── scripts/
│   └── nano_banana_lite.py
└── .env          # created in step ②, holds your Key
```

### ② Write your Key in the same folder

In `nano-banana-lite/.env`, add your **APIYI API Key** (created in the `api.apiyi.com` console):

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

The script reads the Key from this `.env` automatically — **no extra config or environment variables needed**.

<Warning>
  `.env` holds your secret key. If this skill will be shared with a project repo, **be sure to add `.env` to `.gitignore` and never commit it to git**.
</Warning>

### ③ Hand it to the agent

* **Agents with skill auto-discovery** (like Claude Code): put the whole `nano-banana-lite/` folder into its skills directory — user-level `~/.claude/skills/` or project-level `.claude/skills/` (shared with the repo).
* **Other agents**: place it per their own skill/plugin conventions; or simplest of all — **just tell the agent "read the SKILL.md in this folder and follow it"**.

Once installed, jump to [How to use](#how-to-use) for examples.

## SKILL.md

Create `nano-banana-lite/SKILL.md` with the full contents below (the `description` states "what it does + when to use", which the agent uses to auto-trigger):

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
# Text-to-image (1 image by default)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_lite.py "A Shiba Inu wearing an astronaut helmet, cinematic lighting" -o dog.png --aspect 16:9

# Ultra-wide banner (8:1 / 4:1 etc.)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_lite.py "Chinese-style landscape scroll banner" -o banner.png --aspect 8:1

# Image editing (pass 1 image)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_lite.py "Replace the background with a cyberpunk city at night" -i input.jpg -o edited.png

# Multi-image compositing (pass multiple, repeat -i)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_lite.py "Put these two people into one office group photo" -i a.png -i b.png -o merged.png

# Generate multiple variants at once (up to 5, concurrent)
python3 ${CLAUDE_SKILL_DIR}/scripts/nano_banana_lite.py "Chinese-style landscape illustration" -o shanshui.png -n 3 --aspect 16:9
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
  `name` must be lowercase letters + hyphens and **must not contain reserved words like `claude` / `anthropic`**. In agents with slash commands, the folder name is the command name — `nano-banana-lite` means `/nano-banana-lite`. `${CLAUDE_SKILL_DIR}` is the skill-directory variable Claude Code provides; other agents just use the script's actual path.
</Tip>

## scripts/nano\_banana\_lite.py

Create `nano-banana-lite/scripts/nano_banana_lite.py` using the Gemini native format (identical to this site's text-to-image / image-editing code, verified working). **Pure Python standard library — no `pip install` needed**:

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
  The model name defaults to `gemini-3.1-flash-lite-image`. Lite is focused on the 1K canvas — keep `--size` at `1K`; for 2K/4K or stronger quality, use the Nano Banana 2 / Pro skills (you can also switch model via the `APIYI_IMAGE_MODEL` environment variable).
</Tip>

## Why a single sentence generates an image

Many people wonder: I didn't type a command, so how does saying "draw a cat" produce an image?

Here's how: when the agent starts, it **first reads the `description` in each skill's `SKILL.md`** (a short piece of metadata stating "what this skill does and when to use it"). When your request **matches** that description's scenario (e.g. "draw/generate/render an image", "change this image to…"), the agent **automatically decides to invoke this skill**, reads the full `SKILL.md`, and runs the script — all without you memorizing any commands.

So:

* **A well-written `description` = more accurate auto-triggering**. This skill's description already covers phrasings like "generate/draw/edit/composite an image".
* When you don't want the agent to guess and want **100% control**, use the **explicit invocation** below.

## How to use

### Natural language (implicit trigger)

Once installed, just talk to the agent:

| You say                                                            | Skill behavior                                            |
| ------------------------------------------------------------------ | --------------------------------------------------------- |
| "Use nano banana lite to make a 16:9 snow-mountain sunrise poster" | Calls the script (no `-i`), outputs 1 png                 |
| "Make an 8:1 ultra-wide Chinese-style banner"                      | Calls the script `--aspect 8:1`, outputs 1 ultra-wide png |
| "Give me 3 different Chinese-style landscapes"                     | Calls the script `-n 3`, outputs 3 pngs concurrently      |
| "Blur the background of photo.jpg to highlight the person"         | Calls the script `-i photo.jpg`, outputs 1 png            |

### Explicit invocation (more control)

When you don't want the agent to decide for itself, two explicit options:

* **Agents with slash commands** (like Claude Code):

  ```text theme={null}
  /nano-banana-lite An orange cat napping in a garden, oil-painting style --aspect 3:2
  ```

* **Any agent / just tell it to run the script** (most universal):

  ```text theme={null}
  Run python3 nano-banana-lite/scripts/nano_banana_lite.py "An orange cat napping in a garden, oil-painting style" --aspect 3:2
  ```

<Tip>
  **Controlling the ratio**: use `--aspect` to pick the aspect ratio (1 of 14, including the ultra-tall/ultra-wide `1:4 / 4:1 / 1:8 / 8:1`). Lite is focused on the 1K canvas, so no resolution needs to be specified. Just say "portrait 9:16" or "make an ultra-wide banner" and the agent will add the aspect parameter automatically.
</Tip>

## Where the generated images are

* When `-o` is just a **filename** (e.g. `-o dog.png`), images are saved to the **`nano-banana-output/` folder at the project root** (auto-created), so you can find them right there in the project.
* The "project root" = the first directory containing `.git` or `.claude` found by walking up from the script — **no matter which directory the agent runs in, images land inside the project**, not in a temp directory where you'd lose them.
* The script **prints one full absolute path per image**, e.g. `Image saved to /Users/you/project/nano-banana-output/dog.png`.
* By default **only 1 image** is generated; `-n 3` outputs 3 at once (max 5, auto-capped above that), with `-1`, `-2`, `-3` suffixes added to the filename.
* When you pass a **path with a directory** (e.g. `-o images/dog.png` or an absolute path), it saves to your given path (relative paths relative to the current working directory), not into `nano-banana-output/`.
* Image editing works the same way: the output is a new file and **never overwrites your original**.

<Info>
  Nano Banana 2 Lite has strict content-safety controls. If the script reports `finishReason` other than `STOP` or returns a rejection text, adjust the content per the message — don't repeatedly retry the same violating prompt.
</Info>

## Related Documentation

* [Nano Banana Lite Image Generation Overview](/en/api-capabilities/nano-banana-lite-image/overview)
* [Text-to-Image API Reference](/en/api-capabilities/nano-banana-lite-image/text-to-image)
* [Image Editing API Reference](/en/api-capabilities/nano-banana-lite-image/image-edit)
* [Nano Banana 2 Agent Skill](/en/api-capabilities/nano-banana-2-image/skills)
* [Nano Banana Pricing](/en/api-capabilities/nano-banana-pricing)
