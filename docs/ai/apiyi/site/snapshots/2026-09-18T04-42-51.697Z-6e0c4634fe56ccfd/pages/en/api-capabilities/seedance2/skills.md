> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.0 Video Agent Skill

> Wrap all four Seedance models (sd25 / mini / fast / standard) into one ready-to-use Agent Skill — drop it into Codex, OpenClaw, Claude Code, or any coding agent and generate text-to-video, image-to-video, and reference-image videos with a single sentence; the script polls the async task and downloads the finished clip automatically.

<Note>
  This page ships a **ready-to-use Agent Skill**: one zero-dependency script covers all four Seedance models (`sd25` / `mini` / `fast` / standard), switched with `--model`. Put it into whichever coding agent you use and a single sentence produces a video — the whole thing is just two files. It is also this site's **first video-model skill**: unlike images, video generation is an async task, and the script already wraps the full submit → poll → download flow.
</Note>

## What the skill does

One combined skill; the script picks the generation mode from **which images you pass and their roles**:

<CardGroup cols={3}>
  <Card title="Text to video" icon="clapperboard">
    Prompt only → a brand-new video, with synced audio by default (dialogue, sound effects, ambience).
  </Card>

  <Card title="Image to video" icon="image-play">
    Pass a first-frame image to animate a still; add a last-frame image for a smooth first-to-last transition.
  </Card>

  <Card title="Reference to video" icon="layers">
    Pass up to 9 reference images → new footage that keeps their characters, objects, or style.
  </Card>
</CardGroup>

## Which model to choose

All four models are **called exactly the same way**; they differ in resolution cap, duration cap, reference limits, speed, and price. The script handles the differences per `--model`:

| Model (`--model`) | Model ID                          | Max resolution | Speed (720p/5s, measured) | Group                                     | 720p/5s list price                    | Best for                                                                        |
| ----------------- | --------------------------------- | -------------- | ------------------------- | ----------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------- |
| `mini` (default)  | `doubao-seedance-2-0-mini-260615` | 720p           | **fastest, \~87–170s**    | `SeeDance2` 0.18x<br />or `SD2Mini` 0.10x | \$0.4508<br />discounted **\$0.2504** | high-frequency agent use, volume, quick previews                                |
| `fast`            | `doubao-seedance-2-0-fast-260128` | 720p           | \~100–290s                | `SeeDance2` 0.18x<br />or `SD2Fast` 0.15x | \$0.7253<br />discounted **\$0.6044** | quality/cost middle ground                                                      |
| `std`             | `doubao-seedance-2-0-260128`      | **1080p**      | \~100–290s                | `SeeDance2` 0.18x                         | \$0.9074                              | 1080p, highest quality                                                          |
| `sd25`            | `doubao-seedance-2-5-260628`      | **1080p**      | \~150s                    | `SeeDance2` 0.18x                         | **\$1.3721**                          | **up to 30 s, 30 reference images, mov output** — about 1.5× the price of `std` |

<Tip>
  Rule of thumb: **stick with the default `mini` for everyday and agent scenarios**; **need 1080p or top quality** → `--model std`; **need 30-second clips, 30 reference images, or mov output** → `--model sd25` is the only option (about 1.5× the price of `std`, same group as the 2.0 family). All aspect ratios cost the same within a resolution tier, duration bills linearly per second, and the frame rate is fixed at 24fps. The discount groups `SD2Mini` / `SD2Fast` run until **October 7, 2026 23:59 (UTC+8)**; after that the groups stay online and the multiplier returns to 0.18x — see the [group notes on the overview page](/en/api-capabilities/seedance2/overview).
</Tip>

## Which Agents can use it

<Info>
  A Skill is essentially **a folder**: a note for the agent to read (`SKILL.md`) plus a script that does the work. So **any coding agent that can read local files and run shell commands can use it** — **Codex, OpenClaw, hermes-agent, Claude Code**, and the like.

  The only requirement: the machine running the agent (your laptop or a server) has **Python 3** and **internet access** (the script calls `api.apiyi.com` directly). The script uses only the Python standard library — **nothing to `pip install`**.
</Info>

## Set up in 3 steps

### ① Create the folder, paste the files

Create a skill folder and drop in the two files below (full contents in the next two sections):

```
seedance2/
├── SKILL.md
├── scripts/
│   └── seedance_video.py
└── .env          # created in step ②, holds your key
```

### ② Put your key next to it

Write your **APIYI API key** into `seedance2/.env` (create one in the `api.apiyi.com` console with pay-as-you-go billing; **the token must have the `SeeDance2` group enabled**, which covers all four models — `mini` / `fast` also have the discounted `SD2Mini` / `SD2Fast`):

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

The script reads the key from this `.env` automatically — **no extra configuration or environment variables needed**.

<Warning>
  `.env` holds your secret key. If the skill is shared inside a project repository, **add `.env` to `.gitignore` and never commit it**.
</Warning>

### ③ Hand it to your Agent

* **Agents with skill auto-discovery** (e.g. Claude Code): put the whole `seedance2/` folder into its skills directory — personal `~/.claude/skills/`, or project-level `.claude/skills/` (shared with the repo).
* **Other agents**: follow their own skill/plugin conventions; or simplest of all — **tell the agent to "read the SKILL.md in this folder and follow it"**.

That's it — jump to [How to use it](#how-to-use-it) for examples.

## SKILL.md

Create `seedance2/SKILL.md` with the full content below (the `description` states "what it does + when to use it", which is what the agent uses to auto-trigger it):

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
# Text to video (default mini / 720p / 5 s / with audio)
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "An orange cat chasing butterflies on a meadow, slow tracking shot, natural light" -o cat.mp4

# Image to video (first frame — animate a still image)
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "Camera slowly pushes in, light flows" -i photo.jpg -o animated.mp4

# First-to-last-frame transition
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "Smooth transition from the first frame to the last" -i first.png --last-frame last.png -o morph.mp4

# Reference images to video (keep the referenced character/style, up to 9 images)
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "The character from the reference images runs through snow" --ref-image role.png -o run.mp4

# High quality: standard model + 1080p + 10 s
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "Drone shot over an autumn valley, cinematic" --model std --resolution 1080p --duration 10 -o valley.mp4

# Seedance 2.5: 30-second clip (costs 6x a 5-second one — confirm with the user first)
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "Drone flying over an autumn valley, one continuous take" --model sd25 --duration 30 -o long.mp4

# Seedance 2.5: mov output for colour grading
python3 ${CLAUDE_SKILL_DIR}/scripts/seedance_video.py "Waves breaking on rocks, slow motion" --model sd25 --output-format mov -o waves.mov
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
  `name` must be lowercase letters + hyphens. In agents with slash commands, the folder name is the command — `seedance2` gives you `/seedance2`. `${CLAUDE_SKILL_DIR}` is Claude Code's skill-directory variable; in other agents just use the script's actual path.
</Tip>

## scripts/seedance\_video.py

Create `seedance2/scripts/seedance_video.py` — pure Python standard library, same request code as this site's [video generation API reference](/en/api-capabilities/seedance2/video-generation), verified working:

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

## How to switch model

Switching models is **just `--model`**, four values:

```text theme={null}
... seedance_video.py "prompt"                                    # default mini (fastest & cheapest)
... seedance_video.py "prompt" --model fast                       # fast edition
... seedance_video.py "prompt" --model std --resolution 1080p     # standard edition
... seedance_video.py "prompt" --model sd25 --duration 30         # Seedance 2.5 - up to 30 seconds
```

<Info>
  **The token's group decides which models it can call**: `SeeDance2` (0.18x) carries **all four models** (`sd25` / `std` / `fast` / `mini`); the discount groups are **single-model lanes** — `SD2Mini` (0.10x) only carries `mini`, `SD2Fast` (0.15x) only carries `fast`, and calling any other model with a discount token returns "no available channel for this model". **One token on `SeeDance2` is enough**; open dedicated discount tokens once your volume justifies it — see the [group notes on the overview page](/en/api-capabilities/seedance2/overview).
</Info>

## Expect a 2-5 minute wait (important)

Video generation is an **async task** — the biggest difference from the image skills:

* The script wraps the whole flow: submit → poll every 15 seconds → auto-download the mp4 on success. **A 720p/5s clip takes about 2-3 minutes end to end**; 1080p or longer durations take more.
* **Give the command a long timeout (600+ seconds) or run it in the background** — many agents kill commands after a default 2 minutes, before the video is ready. The `SKILL.md` states this, and agents with background execution (like Claude Code) handle it automatically.
* If polling ever times out (15 minutes), the task is still queued server-side; the script prints the `task_id` and a query command so you can fetch it later. **No money is wasted** — Seedance 2.0 pre-charges on submission and refunds the difference on completion, and rejected submissions (HTTP 400) are never billed.

## Why a single sentence generates a video

A common question: I never typed a command — how did "make a video of a cat" produce a clip?

Here's how: on startup, the agent **reads each skill's `description` in its `SKILL.md`** (a short piece of metadata stating "what this skill does and when to use it"). When your request **matches** that description (say "generate/make a video", "animate this image"), the agent **decides to invoke the skill on its own**, reads the full `SKILL.md`, and runs the script — you never memorize a command.

When you'd rather not rely on the agent guessing, use the **explicit invocation** below for **full control**.

## How to use it

### Natural language (implicit trigger)

Once installed, just talk to your agent:

| You say                                         | Skill behavior                                      |
| ----------------------------------------------- | --------------------------------------------------- |
| "Generate a video of a cat running on grass"    | default `mini` / 720p / 5 s, one mp4 with audio     |
| "Turn this poster into a motion video"          | adds `-i poster.png`, first-frame image-to-video    |
| "A 10-second 1080p drone shot"                  | adds `--model std --resolution 1080p --duration 10` |
| "Use these character images for a parkour clip" | adds `--ref-image` with the references              |
| "No background sound"                           | adds `--no-audio`                                   |

### Explicit invocation (more control)

* **Agents with slash commands** (e.g. Claude Code):

  ```text theme={null}
  /seedance2 Drone shot over an autumn valley, golden forest, cinematic --duration 8 --ratio 16:9
  ```

* **Any agent / tell it to run the script directly** (most universal):

  ```text theme={null}
  Run python3 seedance2/scripts/seedance_video.py "Drone shot over an autumn valley, cinematic" --duration 8
  ```

## Where the generated video goes

* With a **bare file name** for `-o` (like `-o cat.mp4`), the video lands in the **`seedance-output/` folder in the project root** (auto-created), right inside your project.
* The "project root" = the first directory containing `.git` or `.claude` found walking up from the script — **wherever the agent runs, the video stays in your project**, never lost in a temp folder.
* On completion the script **prints one line with the full absolute path**, plus file size, elapsed time, and billed tokens, e.g. `Video saved to /Users/you/project/seedance-output/cat.mp4 (3.8 MB, 132s elapsed, billed 108900 tokens)`.
* The returned video URL **expires in 24 hours**, which is why the script always downloads first — **the local mp4 is the deliverable**; never keep the URL as the result.
* With a **path containing directories** (like `-o videos/cat.mp4` or an absolute path), it saves exactly there, skipping `seedance-output/`.

## Related docs

* [Seedance 2.0 Overview](/en/api-capabilities/seedance2/overview) (models, pricing, groups)
* [Video Generation API Reference](/en/api-capabilities/seedance2/video-generation) (full parameters and endpoints)
* [Asset-Referenced Video Generation](/en/api-capabilities/seedance2/asset-reference) (character consistency, `asset://` assets)
* [GPT-Image-2 Series Agent Skill](/en/api-capabilities/gpt-image-2/skills) (the image-side sibling)
* [Nano Banana Pro Agent Skill](/en/api-capabilities/nano-banana-image/skills)
