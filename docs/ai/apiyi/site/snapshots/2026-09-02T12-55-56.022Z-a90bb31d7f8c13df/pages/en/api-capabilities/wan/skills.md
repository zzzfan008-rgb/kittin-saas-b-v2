> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan2.7 and HappyHorse Video Agent Skill

> Wrap the Alibaba video models Wan2.7 and HappyHorse into one ready-to-use Agent Skill — drop it into Codex, OpenClaw, Claude Code, or any coding agent and do text-to-video, image-to-video, reference-to-video, and video editing with a single sentence, switching series via --model, with local images uploaded directly.

<Note>
  This page ships a **ready-to-use Agent Skill**: one zero-dependency script covers both the **Wan2.7** and **HappyHorse** series — they share one endpoint, one request structure, and one `Wan&HappyHorse` token group, switched with `--model`. The script **picks the right model automatically** from the assets you pass (text / image / reference / video-edit) and wraps the full async submit → poll → download flow. The whole thing is just two files.
</Note>

## What the skill does

One combined skill; the script derives the generation mode and model ID from **which assets you pass**:

<CardGroup cols={2}>
  <Card title="Text to video" icon="clapperboard">
    Prompt only → a brand-new video; prompt auto-expansion is on by default, so short prompts work well too.
  </Card>

  <Card title="Image to video" icon="image-play">
    Pass a first-frame image to animate a still — local images upload directly, no image host needed.
  </Card>

  <Card title="Reference to video" icon="layers">
    Pass reference images (Wan also takes reference videos) → new footage keeping the characters, objects, or style; refer to them as "image 1 / video 1" in the prompt.
  </Card>

  <Card title="Video editing" icon="scissors">
    Pass a video + reference images → replace or restyle elements in the video; output duration follows the source.
  </Card>
</CardGroup>

## Which series to choose

The two series are **called exactly the same way**; they differ in price, visual finish, and reference-asset capabilities. The script handles the differences per `--model`:

| Series (`--model`) | Positioning                 | 720P price | 1080P price | \~720P/5s  | Reference assets            | 720P/5s speed (measured) |
| ------------------ | --------------------------- | ---------- | ----------- | ---------- | --------------------------- | ------------------------ |
| `wan` (default)    | value pick, best for volume | \$0.084/s  | \$0.14/s    | **\$0.42** | images + videos, 5 combined | 45–155s                  |
| `happyhorse`       | quality-oriented            | \$0.126/s  | \$0.224/s   | **\$0.63** | images only, up to 9        | 105–125s                 |

<Tip>
  Rule of thumb: **stick with the default `wan` for everyday and volume use**; **when visual quality matters most** → `--model happyhorse`. Both share the `Wan&HappyHorse` group (0.14x multiplier ≈ 98% of the official CNY price, lower still with top-up bonuses) — one token serves both, and there is no separate discount group. Billing is per second; failed tasks are never billed. Full pricing in the [Wan Overview](/en/api-capabilities/wan/overview) and [HappyHorse Overview](/en/api-capabilities/happyhorse/overview).
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
wan/
├── SKILL.md
├── scripts/
│   └── wan_video.py
└── .env          # created in step ②, holds your key
```

### ② Put your key next to it

Write your **APIYI API key** into `wan/.env` (create one in the `api.apiyi.com` console; **the token must have the `Wan&HappyHorse` group enabled** with pay-as-you-go billing — per-call billing tokens cannot be routed):

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

The script reads the key from this `.env` automatically — **no extra configuration or environment variables needed**.

<Warning>
  `.env` holds your secret key. If the skill is shared inside a project repository, **add `.env` to `.gitignore` and never commit it**.
</Warning>

### ③ Hand it to your Agent

* **Agents with skill auto-discovery** (e.g. Claude Code): put the whole `wan/` folder into its skills directory — personal `~/.claude/skills/`, or project-level `.claude/skills/` (shared with the repo).
* **Other agents**: follow their own skill/plugin conventions; or simplest of all — **tell the agent to "read the SKILL.md in this folder and follow it"**.

That's it — jump to [How to use it](#how-to-use-it) for examples.

## SKILL.md

Create `wan/SKILL.md` with the full content below (the `description` states "what it does + when to use it", which is what the agent uses to auto-trigger it):

````markdown theme={null}
---
name: wan
description: Generate videos via APIYI's Wan2.7 and HappyHorse (Alibaba) models — text-to-video, image-to-video (first frame), reference-image/video-to-video, and video editing. Use this when the user asks to create, generate, or animate a video clip, or to restyle/edit an existing video.
allowed-tools: Bash(python3 *)
---

# Wan2.7 / HappyHorse Video Skill

Generate videos through the APIYI platform using Alibaba's video models. One script covers two series, switched by `--model`:

- `wan` (default): the Wan2.7 series, cheaper (720P about \$0.084/s).
- `happyhorse`: the HappyHorse-1.1 series, quality-oriented, about 1.5× the price of wan; no reference-video support.

The script picks the model from the assets you pass: no image = text-to-video; `-i` first frame = image-to-video; `--ref-image`/`--ref-video` = reference-to-video; `--video`+`--ref-image` = video editing.

## Key configuration

The script auto-reads `APIYI_API_KEY` from a `.env` file in the skill folder (an environment variable of the same name also works).
If it reports "API key not found", ask the user to add a line `APIYI_API_KEY=sk-xxx` to `.env`;
the token must have the `Wan&HappyHorse` group enabled with pay-as-you-go billing (per-call billing tokens cannot be routed).

## Usage (important: generation takes 2-5 minutes)

Video generation is an **async task**: the script submits and polls until done, so one call usually takes 2-5 minutes (longer for 1080P or long clips).
**Run it with a long command timeout (600+ seconds) or in the background** — do not use a default 2-minute timeout, or the script gets killed before the video is ready.

```bash
# Text to video (default wan / 720P / 5 s)
python3 ${CLAUDE_SKILL_DIR}/scripts/wan_video.py "Tokyo street at night, neon lights, pedestrians with umbrellas, rainy mood" -o tokyo.mp4

# Image to video (first frame; local path or public URL both work — local files auto-upload as base64)
python3 ${CLAUDE_SKILL_DIR}/scripts/wan_video.py "Camera slowly pushes in, light flows" -i photo.jpg -o animated.mp4

# Reference images to video (keep character/style; refer to assets as "image 1 / image 2" in the prompt)
python3 ${CLAUDE_SKILL_DIR}/scripts/wan_video.py "The character from image 1 runs through snow" --ref-image role.png -o run.mp4

# Video editing (modify elements in a video using reference images)
python3 ${CLAUDE_SKILL_DIR}/scripts/wan_video.py "Replace the person in video 1 with the character from image 1" --video https://example.com/src.mp4 --ref-image https://example.com/role.png -o edited.mp4

# Switch to HappyHorse, ask for 1080P
python3 ${CLAUDE_SKILL_DIR}/scripts/wan_video.py "Drone shot over an autumn valley, cinematic" --model happyhorse --resolution 1080P --duration 8 -o valley.mp4
```

Parameters:

- 1st positional argument: the prompt (required). With multiple assets, refer to them in order as "image 1 / video 1".
- `--model`: `wan` (default) / `happyhorse`.
- `--resolution`: `720P` (default) / `1080P` (note the uppercase P; there is no 480P tier).
- `--ratio`: `16:9` / `9:16` / `1:1` / `4:3` / `3:4` (ignored when a first-frame image is given; happyhorse docs don't list it — sent only when passed explicitly).
- `--duration`: integer seconds 2-15, default 5; capped at 10 with reference videos; edit mode follows the source video.
- `--negative`: negative prompt. `--no-prompt-extend`: disable prompt auto-expansion (on by default).
- `-i / --image`: first-frame image (local path or URL). `--ref-image`: reference image, repeatable (wan: 5 combined with videos; happyhorse: up to 9). `--ref-video`: reference video URL (wan only). `--video`: video to edit (URL).
- `-o / --out`: output file name, default `output.mp4`.

## Asset inputs (important)

- Image assets: **local files and public URLs both work** — the script converts local files to base64 data URIs (verified working on both series; official docs only document the URL path).
- Video assets (`--ref-video` / `--video`): prefer public URLs; base64-encoding large videos inflates the payload and may exceed request limits.

## Clip count and cost (important)

- **One call produces exactly 1 video** — there is no batch flag. If the user wants several, run sequential calls and warn about cost first.
- Billing is per second: wan 720P \$0.084/s (about \$0.42 for 5 s), 1080P \$0.14/s; happyhorse is about 1.5× wan.
  Unless the user explicitly asks, **keep the defaults wan / 720P / 5s** — never bump duration, resolution, or switch to happyhorse on your own.
- Failed tasks are never billed; duplicate submissions bill twice — do not auto-retry the same request.

## Output location (important)

- With a **bare file name** for `-o` (like `cat.mp4`), the video goes to the **`wan-output/` folder in the project root**.
- With a **path containing directories**, it saves to that path (relative paths resolve against the current working directory).
- Never write videos to `/tmp`, scratchpads, or other temp folders — the user won't find them.
- The result URL expires in 24 hours; the script already downloads the file locally — the local file is the deliverable.

## When done

The script prints the saved path, file size, and elapsed time — report the path back to the user verbatim.
If it reports a failure (including content-moderation rejections), relay the error as-is and do not retry the same prompt.
On "no available channel for this model", ask the user to check the token's group includes `Wan&HappyHorse` and billing mode is pay-as-you-go.
````

<Tip>
  `name` must be lowercase letters + hyphens. In agents with slash commands, the folder name is the command — `wan` gives you `/wan`. `${CLAUDE_SKILL_DIR}` is Claude Code's skill-directory variable; in other agents just use the script's actual path.
</Tip>

## scripts/wan\_video.py

Create `wan/scripts/wan_video.py` — pure Python standard library, same request code as this site's API reference pages, verified working:

```python theme={null}
#!/usr/bin/env python3
"""Generate videos via APIYI's Wan2.7 / HappyHorse (text / image / reference to video, video editing). Pure stdlib, zero dependencies."""
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

# DashScope passthrough endpoint. NEVER use the flat /v1/videos path — it drops the media field
CREATE_URL = "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis"
TASK_URL = "https://api.apiyi.com/v1/tasks/{}"

# family x mode -> model ID. Edit-model naming is irregular (happyhorse is 1.0 with a hyphen) — don't hand-build these
FAMILY_MODELS = {
    "wan": {"t2v": "wan2.7-t2v", "i2v": "wan2.7-i2v",
            "r2v": "wan2.7-r2v", "edit": "wan2.7-videoedit"},
    "happyhorse": {"t2v": "happyhorse-1.1-t2v", "i2v": "happyhorse-1.1-i2v",
                   "r2v": "happyhorse-1.1-r2v", "edit": "happyhorse-1.0-video-edit"},
}
# r2v reference caps: wan 5 images+videos combined, happyhorse images only, up to 9
MAX_REFS = {"wan": 5, "happyhorse": 9}
RATIOS = ("16:9", "9:16", "1:1", "4:3", "3:4")

# Generation is async: 720P/5s takes ~70-140s in practice, 1080P/long clips can exceed 5 minutes
POLL_FIRST_DELAY = 15
POLL_INTERVAL = 8
POLL_TIMEOUT = 20 * 60


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
    """Bare file name -> save under <project root>/wan-output/ so it's easy to find; else use the given path."""
    if os.path.dirname(out):
        return os.path.abspath(out)
    out_dir = os.path.join(project_root(), "wan-output")
    os.makedirs(out_dir, exist_ok=True)
    return os.path.join(out_dir, out)


def media_source(src):
    """Asset inputs: pass URLs / data: through as-is; encode local files as base64 data URIs (verified on both series)."""
    if src.startswith(("http://", "https://", "data:")):
        return src
    if not os.path.exists(src):
        sys.exit(f"Asset file not found: {src}")
    ext = src.lower().rsplit(".", 1)[-1]
    mime = {"png": "image/png", "webp": "image/webp", "mp4": "video/mp4",
            "mov": "video/quicktime"}.get(ext, "image/jpeg")
    with open(src, "rb") as f:
        return f"data:{mime};base64,{base64.b64encode(f.read()).decode()}"


def api_request(url, api_key, body=None, extra_headers=None):
    """The gateway labels responses content-encoding: gzip without compressing them — Accept-Encoding: identity is required."""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept-Encoding": "identity",
    }
    if extra_headers:
        headers.update(extra_headers)
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers,
                                 method="POST" if body is not None else "GET")
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Request failed HTTP {e.code}: {e.read().decode(errors='replace')[:800]}")


def download(url, path):
    """Download the result video: it's a signed OSS URL — NEVER send the Authorization header (403 if you do)."""
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=300) as r, open(path, "wb") as f:
        shutil.copyfileobj(r, f)
    return os.path.getsize(path)


def detect_mode(args):
    if args.video:
        return "edit"
    if args.image:
        return "i2v"
    if args.ref_image or args.ref_video:
        return "r2v"
    return "t2v"


def build_media(args, mode):
    media = []
    if mode == "i2v":
        media.append({"type": "first_frame", "url": media_source(args.image)})
    elif mode == "r2v":
        for src in args.ref_image:
            media.append({"type": "reference_image", "url": media_source(src)})
        for src in args.ref_video:
            media.append({"type": "reference_video", "url": media_source(src)})
    elif mode == "edit":
        media.append({"type": "video", "url": media_source(args.video)})
        for src in args.ref_image:
            media.append({"type": "reference_image", "url": media_source(src)})
    return media


def main():
    api_key = load_api_key()
    if not api_key:
        sys.exit("API key not found: add a line APIYI_API_KEY=sk-xxx to .env in the skill folder"
                 " (the token must have the Wan&HappyHorse group enabled, pay-as-you-go billing)")

    parser = argparse.ArgumentParser(description="Wan2.7 / HappyHorse video generation")
    parser.add_argument("prompt", help="prompt (scene + camera + mood; refer to assets as 'image 1 / video 1')")
    parser.add_argument("--model", default="wan", choices=sorted(FAMILY_MODELS),
                        help="wan=Wan2.7 (default, cheaper) / happyhorse=HappyHorse-1.1 (quality-oriented)")
    parser.add_argument("--resolution", default="720P", type=str.upper,
                        choices=("720P", "1080P"), help="resolution, default 720P (note: no 480P)")
    parser.add_argument("--ratio", default=None, choices=RATIOS,
                        help="aspect ratio (ignored with a first-frame image; undocumented for happyhorse — sent only when passed)")
    parser.add_argument("--duration", type=int, default=5,
                        help="duration 2-15 integer seconds, default 5; capped at 10 with reference videos; edit mode follows the source")
    parser.add_argument("--negative", help="negative prompt (things to avoid, under 500 chars)")
    parser.add_argument("--no-prompt-extend", action="store_true",
                        help="disable prompt auto-expansion (on by default; helps short prompts)")
    parser.add_argument("--seed", type=int, default=None, help="random seed, for reproducibility")
    parser.add_argument("-i", "--image", help="first-frame image (local path or URL); enables image-to-video")
    parser.add_argument("--ref-image", action="append", default=[],
                        help="reference image, repeatable (wan: 5 combined with videos; happyhorse: up to 9)")
    parser.add_argument("--ref-video", action="append", default=[],
                        help="reference video URL, repeatable (wan only)")
    parser.add_argument("--video", help="video to edit (URL; edit mode, requires --ref-image)")
    parser.add_argument("-o", "--out", default="output.mp4", help="output file name")
    args = parser.parse_args()

    if args.image and (args.ref_image or args.ref_video):
        sys.exit("First-frame mode (-i) and reference mode (--ref-image/--ref-video) are mutually exclusive.")
    if args.video and args.image:
        sys.exit("Video-edit mode (--video) and first-frame mode (-i) are mutually exclusive.")
    if args.video and not args.ref_image:
        sys.exit("Video-edit mode needs at least 1 reference image (--ref-image).")
    if args.model == "happyhorse" and args.ref_video:
        sys.exit("happyhorse does not support reference videos (--ref-video); wan only.")
    n_refs = len(args.ref_image) + len(args.ref_video)
    if n_refs > MAX_REFS[args.model]:
        sys.exit(f"{args.model} allows at most {MAX_REFS[args.model]} reference assets, got {n_refs}.")
    if not 2 <= args.duration <= 15:
        sys.exit("Duration must be an integer of 2-15 seconds.")
    if args.ref_video and args.duration > 10:
        sys.exit("Duration is capped at 10 seconds when reference videos are included.")

    mode = detect_mode(args)
    model = FAMILY_MODELS[args.model][mode]

    input_part = {"prompt": args.prompt}
    if args.negative:
        input_part["negative_prompt"] = args.negative
    media = build_media(args, mode)
    if media:
        input_part["media"] = media

    parameters = {
        "resolution": args.resolution,
        "duration": args.duration,
        "prompt_extend": not args.no_prompt_extend,
    }
    if args.ratio:
        parameters["ratio"] = args.ratio
    if args.seed is not None:
        parameters["seed"] = args.seed

    body = {"model": model, "input": input_part, "parameters": parameters}

    try:
        resp = api_request(CREATE_URL, api_key, body,
                           extra_headers={"X-DashScope-Async": "enable"})
    except (RuntimeError, OSError) as e:
        sys.exit(f"Submission failed: {e}")
    task_id = (resp.get("output") or {}).get("task_id") or resp.get("task_id")
    if not task_id:
        sys.exit(f"Submission failed, response: {json.dumps(resp, ensure_ascii=False)[:500]}")
    print(f"Task submitted model={model} task_id={task_id}; generation usually takes 2-5 minutes, polling...")

    t0 = time.time()
    time.sleep(POLL_FIRST_DELAY)
    while True:
        try:
            task = api_request(TASK_URL.format(task_id), api_key)
        except (RuntimeError, OSError) as e:  # network hiccups don't stop the poll loop
            print(f"  poll error (continuing): {e}")
            time.sleep(POLL_INTERVAL)
            continue
        status = str(task.get("status", "unknown")).lower()
        progress = task.get("progress", "")
        elapsed = round(time.time() - t0)
        # progress often sits at 30 (upstream only reports 0/10/30/100) — it is not stuck
        print(f"  [{elapsed:>4}s] status={status}" + (f" progress={progress}" if progress != "" else ""))
        if status in ("completed", "failed"):
            break
        if time.time() - t0 > POLL_TIMEOUT:
            sys.exit(f"Polling timed out ({POLL_TIMEOUT}s). The task is still server-side; query it later:\n"
                     f"  GET {TASK_URL.format(task_id)}")
        time.sleep(POLL_INTERVAL)

    if status != "completed":
        err = task.get("error") or task.get("fail_reason") or task
        sys.exit(f"Generation failed (status={status}): {json.dumps(err, ensure_ascii=False)[:500]}"
                 "\n(failed tasks are never billed)")

    result_url = task.get("result_url")
    if not result_url:
        sys.exit(f"Task completed but no video URL returned: {json.dumps(task, ensure_ascii=False)[:500]}")

    path = resolve_path(args.out)
    size = download(result_url, path)
    print(f"Video saved to {path} ({size / 1e6:.1f} MB, {round(time.time() - t0)}s elapsed, "
          f"model {model})")


if __name__ == "__main__":
    main()
```

## How to switch series

Switching series is **just `--model`**; the script derives the model ID from "series × asset type":

```text theme={null}
... wan_video.py "prompt"                        # default wan (Wan2.7 series)
... wan_video.py "prompt" --model happyhorse     # HappyHorse-1.1 series
```

<Info>
  **Model ID derivation table** (no need to memorize — the script picks automatically):

  | Assets you pass               | Mode               | wan                | happyhorse                  |
  | ----------------------------- | ------------------ | ------------------ | --------------------------- |
  | prompt only                   | text-to-video      | `wan2.7-t2v`       | `happyhorse-1.1-t2v`        |
  | `-i` first frame              | image-to-video     | `wan2.7-i2v`       | `happyhorse-1.1-i2v`        |
  | `--ref-image` / `--ref-video` | reference-to-video | `wan2.7-r2v`       | `happyhorse-1.1-r2v`        |
  | `--video` + `--ref-image`     | video editing      | `wan2.7-videoedit` | `happyhorse-1.0-video-edit` |
</Info>

## Asset inputs: local images just work (verified)

The official docs say media must be publicly reachable https URLs, but our tests show both series **accept base64 data URIs** — so the script auto-converts local images, and `-i photo.jpg` or `--ref-image role.png` with a local path just works, no image host needed. For video assets (`--ref-video` / `--video`), public URLs are still recommended: base64-encoding inflates large files by about a third and may exceed request limits.

## Expect a 2-5 minute wait (important)

Video generation is an **async task**:

* The script wraps the whole flow: submit (with the `X-DashScope-Async` header) → poll every 8 seconds → auto-download the mp4 on success. **A 720P/5s clip takes about 45–155 seconds end to end (measured)**; 1080P or longer can exceed 5 minutes.
* The `progress` value **sitting at 30% for a long time is normal** (upstream only reports 0/10/30/100) — it is not stuck.
* **Give the command a long timeout (600+ seconds) or run it in the background** — many agents kill commands after a default 2 minutes, before the video is ready. The `SKILL.md` states this.
* If polling ever times out (20 minutes), the task is still server-side; the script prints the `task_id` and a query command. **Failed tasks are never billed**; duplicate submissions bill twice, so the script never auto-retries.

## Why a single sentence generates a video

A common question: I never typed a command — how did "make a video" produce a clip?

Here's how: on startup, the agent **reads each skill's `description` in its `SKILL.md`** (a short piece of metadata stating "what this skill does and when to use it"). When your request **matches** that description (say "generate/make a video", "animate this image", "edit this clip"), the agent **decides to invoke the skill on its own**, reads the full `SKILL.md`, and runs the script — you never memorize a command.

When you'd rather not rely on the agent guessing, use the **explicit invocation** below for **full control**.

## How to use it

### Natural language (implicit trigger)

Once installed, just talk to your agent:

| You say                                                            | Skill behavior                                 |
| ------------------------------------------------------------------ | ---------------------------------------------- |
| "Generate a video of a rainy Tokyo street at night"                | default `wan` / 720P / 5 s                     |
| "Turn this poster into a motion video"                             | adds `-i poster.png`, local image auto-uploads |
| "Use the higher-quality model at 1080P"                            | adds `--model happyhorse --resolution 1080P`   |
| "Make the character from image 1 run through the scene in image 2" | adds two `--ref-image`, reference-to-video     |
| "Replace the person in this video with this character"             | adds `--video` + `--ref-image`, video editing  |

### Explicit invocation (more control)

* **Agents with slash commands** (e.g. Claude Code):

  ```text theme={null}
  /wan Drone shot over an autumn valley, golden forest, cinematic --duration 8 --ratio 16:9
  ```

* **Any agent / tell it to run the script directly** (most universal):

  ```text theme={null}
  Run python3 wan/scripts/wan_video.py "Drone shot over an autumn valley, cinematic" --duration 8
  ```

## Where the generated video goes

* With a **bare file name** for `-o` (like `-o cat.mp4`), the video lands in the **`wan-output/` folder in the project root** (auto-created); both series share this folder.
* The "project root" = the first directory containing `.git` or `.claude` found walking up from the script — **wherever the agent runs, the video stays in your project**, never lost in a temp folder.
* On completion the script **prints one line with the full absolute path**, plus file size and elapsed time, e.g. `Video saved to /Users/you/project/wan-output/tokyo.mp4 (4.9 MB, 153s elapsed, model wan2.7-t2v)`.
* Measured outputs ship **with an audio track** (stereo AAC).
* The result URL **expires in 24 hours**, which is why the script always downloads first — **the local mp4 is the deliverable**; never keep the URL as the result.
* With a **path containing directories** (like `-o videos/cat.mp4` or an absolute path), it saves exactly there, skipping `wan-output/`.

## Related docs

* [Wan Video Generation Overview](/en/api-capabilities/wan/overview) (models, pricing, groups)
* [Wan2.7 Text-to-Video API Reference](/en/api-capabilities/wan/text-to-video)
* [Wan2.7 Reference-to-Video API Reference](/en/api-capabilities/wan/reference-to-video)
* [HappyHorse Video Agent Skill](/en/api-capabilities/happyhorse/skills) (satellite page with the differences)
* [Seedance 2.0 Video Agent Skill](/en/api-capabilities/seedance2/skills) (the Volcengine-side sibling)
