> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image-2 Series Agent Skill

> Package gpt-image-2 (official) plus gpt-image-2-all / gpt-image-2-vip (reverse) into one ready-to-use Agent Skill. Drop it into Codex, OpenClaw, hermes-agent, Claude Code, or any coding Agent and switch channels with --model for text-to-image, multi-image fusion, and inpainting.

<Note>
  This page provides a **ready-to-use Agent Skill**: one script covers all three channels — **gpt-image-2 (official)**, **gpt-image-2-all**, and **gpt-image-2-vip** (reverse). They all use the same OpenAI Images API; only `--model` differs. Drop it into the coding Agent you already use and generate images with a single prompt — just two files.
</Note>

## What the skill does

A single combined skill. The script auto-detects **whether you pass input images** to decide between text-to-image and image editing:

<CardGroup cols={3}>
  <Card title="Text to image" icon="wand-sparkles">
    Prompt only → a brand-new image, with strong text rendering and photoreal quality.
  </Card>

  <Card title="Multi-image fusion" icon="layers">
    Multiple images (up to 16) + one instruction → put person from image 1 into scene from image 2, keep the style of image 3, etc.
  </Card>

  <Card title="Inpainting" icon="image">
    One image + a `--mask` + an instruction → change only the masked region (**only gpt-image-2 official supports this**).
  </Card>
</CardGroup>

## Which model to choose

All three channels are **called identically**; they differ only in source channel, price/speed, and which params are honored. The script handles these differences automatically by `--model`:

| Model (`--model`)       | Channel                | Price                        | Speed                | `size`                  | `quality` / `mask` | Best for                                                |
| ----------------------- | ---------------------- | ---------------------------- | -------------------- | ----------------------- | ------------------ | ------------------------------------------------------- |
| `gpt-image-2` (default) | Official passthrough   | token-based \~\$0.03–0.2/img | \~100–120s           | ✅ any preset            | ✅ yes              | quality tiers, mask inpainting, transparent backgrounds |
| `gpt-image-2-all`       | Reverse (ChatGPT line) | flat \$0.03/img              | **fastest \~30–60s** | ❌ write into prompt     | ❌                  | volume, speed, sizing via prompt text                   |
| `gpt-image-2-vip`       | Reverse (Codex line)   | flat \$0.03/img              | \~90–150s            | ✅ 30 tiers incl. **4K** | ❌                  | locked output size / 4K at a low price                  |

<Tip>
  Quick rule: **fast & cheap** → `gpt-image-2-all`; **locked size/4K & cheap** → `gpt-image-2-vip`; **quality tiers, mask inpainting** → `gpt-image-2` (official).
</Tip>

## Which Agents can use it

<Info>
  A Skill is essentially just **a folder**: a set of instructions for the Agent to read (`SKILL.md`) + a script that does the work. So **any coding Agent that can read local files and run shell commands can use it** — for example **Codex, OpenClaw, hermes-agent, Claude Code**, and more.

  The only requirement: the machine running the Agent (your computer or server) has **Python 3** installed and **network access** (the script calls `api.apiyi.com` directly). That's it — it is not tied to any specific Agent.
</Info>

## Set up in 3 steps

### ① Create the folder, paste the files, install the dependency

Create a skill folder with these two files (full contents in the next two sections). This skill calls via the OpenAI SDK, so install one dependency first:

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

### ② Put your key in the same folder

Write your **APIYI API Key** (create one in the `api.apiyi.com` console) into `gpt-image-2/.env`:

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

The script reads the key from this `.env` automatically — **no extra configuration or environment variables needed**.

<Warning>
  `.env` holds your secret key. If you share this skill via a project repo, **be sure to add `.env` to `.gitignore` and never commit it to git**.
</Warning>

### ③ Hand it to your Agent

* **Agents that auto-discover skills** (e.g. Claude Code): drop the whole `gpt-image-2/` folder into its skills directory — personal `~/.claude/skills/`, or project-level `.claude/skills/` (shared via the repo).
* **Other Agents**: place it per their own skill/plugin convention; or simplest of all — **just tell the Agent to "read the SKILL.md in this folder and follow it"**.

Once installed, you're ready — jump to [How to use it](#how-to-use-it) for examples.

## SKILL.md

Create `gpt-image-2/SKILL.md` with the full content below (the `description` states "what it does + when to use it", which is what the Agent uses to auto-trigger it):

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
# Text to image (default gpt-image-2 official, with quality)
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "An orange cat in sunglasses at a seaside bar, cinematic" -o cat.png --size 1536x1024 --quality high

# Fastest & cheapest: reverse 'all' (put size in the prompt, do not pass size)
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "Flat-illustration festival poster, portrait 2:3" -o poster.png --model gpt-image-2-all

# Need locked 4K: reverse 'vip'
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "Aerial city night view" -o city.png --model gpt-image-2-vip --size 3840x2160

# Multi-image fusion (up to 16, repeat -i)
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "Put the person from image 1 into the scene of image 2, keep colors of image 3" -i person.png -i scene.png -i style.png -o fused.png

# Inpainting (mask, only gpt-image-2 official)
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "Replace the masked area with a round window" -i room.png --mask mask.png -o edited.png

# Several at once (max 5, concurrent)
python3 ${CLAUDE_SKILL_DIR}/scripts/gpt_image.py "Festival poster drafts" -o draft.png -n 3 --model gpt-image-2-all
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
  `name` must be lowercase letters + hyphens. On Agents that support slash commands, the directory name is the command — `gpt-image-2` becomes `/gpt-image-2`. `${CLAUDE_SKILL_DIR}` is a skill-directory variable provided by Claude Code; on other Agents just use the script's actual path.
</Tip>

## scripts/gpt\_image.py

Create `gpt-image-2/scripts/gpt_image.py` using the OpenAI SDK pointed at APIYI (`base_url="https://api.apiyi.com/v1"`):

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

## How to switch model

Switching channel is **just `--model`**, one of three values:

```text theme={null}
... gpt_image.py "prompt"                              # default gpt-image-2 (official)
... gpt_image.py "prompt" --model gpt-image-2-all      # reverse, fastest, cheapest
... gpt_image.py "prompt" --model gpt-image-2-vip --size 3840x2160   # reverse, locked 4K
```

To change the default channel (so you don't pass `--model` every time), add a line to `gpt-image-2/.env`:

```bash theme={null}
APIYI_IMAGE_MODEL=gpt-image-2-all
```

<Info>
  The script **handles both** base64 and url responses automatically (the reverse models' `b64_json` carries a `data:image;base64,` prefix, which the script strips). You only need to switch your token's billing group to `image2_OSS` in the APIYI console if you **strictly require URL output** — regular generation does not need it.
</Info>

## Why a single sentence generates an image

People often wonder: I never typed a command, so how did "draw a cat" produce an image?

Here's how: at startup, the Agent **first reads the `description` from each skill's `SKILL.md`** (a very short piece of metadata describing "what this skill does and when to use it"). When your request **matches** that scenario (e.g. "draw / generate / render an image", "fuse these images"), the Agent **automatically decides to invoke the skill**, reads the full `SKILL.md`, and runs the script — all without you remembering any command.

When you don't want the Agent to guess and want **full control**, use the **explicit invocation** below.

## How to use it

### Natural language (implicit trigger)

Once installed, just talk to the Agent:

| What you say                                  | Skill behavior                                        |
| --------------------------------------------- | ----------------------------------------------------- |
| "Draw a cinematic cat with gpt-image-2"       | Default gpt-image-2, 1 png                            |
| "Make a poster, fast and cheap"               | Agent adds `--model gpt-image-2-all`                  |
| "Render a 4K city night view"                 | Agent adds `--model gpt-image-2-vip --size 3840x2160` |
| "Put the person in person.png into scene.png" | Runs `-i person.png -i scene.png`, fused image        |

### Explicit invocation (more control)

* **Agents that support slash commands** (e.g. Claude Code):

  ```text theme={null}
  /gpt-image-2 Cyberpunk city rainy night, neon sign close-up --model gpt-image-2-vip --size 2048x1152
  ```

* **Any Agent / just tell it to run the script** (most universal):

  ```text theme={null}
  Run python3 gpt-image-2/scripts/gpt_image.py "Cyberpunk city rainy night, neon sign close-up" --model gpt-image-2-all
  ```

## Where the generated image goes

* When `-o` is a **bare filename** (e.g. `-o cat.png`), images are all saved into a **`gpt-image-output/` folder at the project root** (created automatically), so you'll find them right there in your project.
* "Project root" = the first directory containing `.git` or `.claude` found by walking up from the script's own location — so **no matter which directory the Agent runs from, images land inside the project**, never in a temp directory you can't find.
* The script **prints one full absolute path per image**, e.g. `Image saved to /Users/you/project/gpt-image-output/cat.png`.
* By default it generates **just 1 image**; `-n 3` produces 3 at once (max 5), with a `-1`, `-2`, `-3` suffix added automatically.
* When `-o` is a **path with a directory** (e.g. `-o images/cat.png` or an absolute path), it is saved at that exact path and does not go into `gpt-image-output/`.
* Editing / fusion works the same way: the output is a new file and **does not overwrite your original**.

## Related docs

* [GPT-Image-2-All Agent Skill](/en/api-capabilities/gpt-image-2-all/skills) (reverse, fastest)
* [GPT-Image-2-VIP Agent Skill](/en/api-capabilities/gpt-image-2-vip/skills) (reverse, locked 4K)
* [GPT-Image-2 Image Generation overview](/en/api-capabilities/gpt-image-2/overview)
* [Nano Banana Pro Agent Skill](/en/api-capabilities/nano-banana-image/skills)
