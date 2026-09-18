> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Image Prompt Doctor Skill

> Packages the pre-generation prompt review into a drop-in Agent Skill for Codex, OpenClaw, hermes-agent, Claude Code and others: score a prompt against six elements, flag the vague words that hurt quality, and get a rewritten prompt you can use as-is. It can also review an actual result against the prompt that produced it. Defaults to gpt-5.6-luna.

<Note>
  This page gives you a **drop-in Agent Skill**: run a check over the prompt **before** you generate, fill in the missing elements, strip the vague words that drag quality down, and generate with the rewritten version. The whole thing is two files with **zero third-party dependencies**.
</Note>

When an image disappoints, the prompt is usually the problem — not the model and not the channel. This skill turns the "rewrite layer" from [Advanced Image Generation](/en/api-capabilities/image-advanced-workflow) into something you can drop into any coding agent.

## What the skill does

<CardGroup cols={2}>
  <Card title="Pre-generation diagnosis" icon="clipboard-check">
    Scores subject, environment, light, lens, grading and composition one by one, gives a 0-100 rating, lists the risks, and returns a rewritten prompt ready to copy.
  </Card>

  <Card title="Post-generation review" icon="image-off">
    Pass the actual image along with the original prompt and the model reads it back, pointing out **which sentence of the prompt was not executed** and what the model added on its own, then rewrites accordingly.
  </Card>

  <Card title="Target-model advice" icon="git-compare">
    With `-t` it appends notes specific to that family: reference-image limits, mask support, and what the resolution parameter is called.
  </Card>

  <Card title="Subject-aware checks" icon="layers">
    Portraits get skin and lighting checks, product shots get background and text-ban checks, and illustration automatically down-weights the photorealism checklist.
  </Card>
</CardGroup>

## A full diagnosis, start to finish

The input is what a user would actually type, plus the image it produced:

```bash theme={null}
python3 scripts/prompt_doctor.py "Make me a coffee product shot, make it look nice, make it feel premium" \
  -i result.jpg -t nano-banana -s product
```

<Frame caption="The actual result produced by that casual prompt">
  <img src="https://mintcdn.com/apiyillc/4sMX_MxhL2nRcbPH/images/image-workflow-prompt-before.jpg?fit=max&auto=format&n=4sMX_MxhL2nRcbPH&q=85&s=a2e2025bf74baf40a7b63a424762cb62" alt="Coffee image from the casual prompt: wooden table, grinder, burlap sack and other props, with an invented brand name printed on the cup" width="1280" height="1280" data-path="images/image-workflow-prompt-before.jpg" />
</Frame>

Diagnosis output (excerpt from a real run):

```text theme={null}
[Diagnosis] 18/100 - subject is legible, but with no product-photography constraints the
model expanded the frame into a lifestyle scene

Six elements: subject WEAK  environment MISSING  light MISSING  lens MISSING
              grading WEAK  composition MISSING

Risks:
  - "coffee product shot" never states the product form, material, colour or count, so the
    model invented a latte-art cup on its own.
  - No neutral, controllable background was specified, so the model added a window, a wooden
    table, a grinder, coffee beans, a cloth sack and books - the frame reads as lifestyle
    photography rather than an e-commerce product shot.
  - No key light direction, hardness or fill was given; the result used window light from the
    left with heavy warm shadows, none of it controllable.
  - "look nice" and "feel premium" are abstract quality claims that were never converted into
    a colour temperature, saturation level or photographic medium.
  - The prompt never forbade text, so the model produced "AURA COFFEE ROASTERS" on the cup,
    a plate on the grinder, and "AURA" on the book at lower right - a wrong-brand and
    garbled-text risk for any commercial use.

[Optimized prompt]

An e-commerce product photograph of coffee: the subject is a single matte warm-white ceramic
cup ... (full text omitted)

[Parameter suggestions] size=2K  aspect=1:1; 1:1 suits a square hero image, switch to 4:3 for
a landscape ad and keep the negative space on the right.
```

Feeding that rewritten prompt back to the same model (`gemini-3-pro-image`), unchanged:

<Frame caption="Regenerated from the rewritten prompt: a clean, usable e-commerce hero shot">
  <img src="https://mintcdn.com/apiyillc/4sMX_MxhL2nRcbPH/images/image-prompt-doctor-e2e.jpg?fit=max&auto=format&n=4sMX_MxhL2nRcbPH&q=85&s=5ea65d564076d1ce6ed768ff0c7a0e60" alt="Coffee image from the rewritten prompt: a warm-white ceramic latte cup on a neutral light grey background, clear light direction, shadow falling to the rear right, no text anywhere, generous negative space" width="1280" height="1280" data-path="images/image-prompt-doctor-e2e.jpg" />
</Frame>

Every prop is gone, the background is a controllable neutral grey, the shadow has a direction, no brand name was invented, and there is room for copy. **The model did not change. Only the prompt did.**

## When to run the diagnosis

Not every generation needs a review. Decide by how specific the request already is:

| What your request looks like                                     | What to do                                                      |
| ---------------------------------------------------------------- | --------------------------------------------------------------- |
| Casual, subject only ("a coffee product shot, make it nice")     | **Diagnose first, then generate** — the biggest payoff          |
| You generated something and it is far off                        | **Review mode** (`-i` with the actual result) to find the cause |
| Light position, focal length and composition are already written | Skip it and generate                                            |
| Generating a whole series in one style                           | Diagnose once to settle the prompt, then reuse it               |

<Info>
  This skill only rewrites prompts; it **does not generate images**. Pair it with the [Nano Banana Pro Skill](/en/api-capabilities/nano-banana-image/skills) or the [GPT-Image-2 Series Skill](/en/api-capabilities/gpt-image-2/skills) for a complete review-then-generate flow.
</Info>

## Which agents it works in

<Info>
  A Skill is really just **a folder**: one file telling the agent what it is (`SKILL.md`) plus a script that does the work. So **any coding agent that can read local files and run commands can use it** — Codex, OpenClaw, hermes-agent, Claude Code and others.

  The only requirement: the machine running the agent has **Python 3** and **network access** (the script talks to `api.apiyi.com` directly). This skill uses **only the Python standard library — nothing to pip install**.
</Info>

## Install in three steps

### 1. Create the folder and paste the files

Create a skill folder with these two files (full contents in the two sections below):

```
image-prompt-doctor/
├── SKILL.md
├── scripts/
│   └── prompt_doctor.py
└── .env          # created in step 2, holds your key
```

No `pip install` needed.

### 2. Add your key next to it

Put your **APIYI API key** (created in the `api.apiyi.com` console) in `image-prompt-doctor/.env`:

```bash theme={null}
APIYI_API_KEY=sk-your-api-key
```

The script reads the key from this `.env` automatically — **no other configuration or environment variable required**.

<Warning>
  `.env` holds your secret. If this skill is shared through a project repository, **add `.env` to `.gitignore` and never commit it**.
</Warning>

### 3. Hand it to the agent

* **Agents with skill auto-discovery** (such as Claude Code): drop the whole `image-prompt-doctor/` folder into their skills directory — user level at `~/.claude/skills/`, or project level at `.claude/skills/` (shared through the repo).
* **Any other agent**: place it according to that agent's own skill/plugin convention; or simplest of all — **just tell the agent to "read SKILL.md in this folder and follow it."**

That is the whole install. Jump to [how to use it](#how-to-use-it) for examples.

## SKILL.md

Create `image-prompt-doctor/SKILL.md` with the full content below (the `description` states "what it does + when to use it", which is what the agent uses to auto-trigger it):

````markdown theme={null}
---
name: image-prompt-doctor
description: Diagnose and optimize an image-generation prompt before generating, or review a disappointing result against the prompt that produced it. Use this whenever the user is about to generate an image from a casual or vague prompt, asks why an image came out wrong, or asks to improve/rewrite an image prompt.
allowed-tools: Bash(python3 *)
---

# Image Prompt Doctor

Review the prompt **before** generating: fill in the missing elements, strip the vague words that
drag quality down, and generate with the rewritten version. You can also feed the actual result
back **after** generating so the model can point out which requirement was not executed.

An API call is a single atomic call. The prompt reaches the model verbatim, with none of the
automatic rewriting a web app does for you — so prompt quality decides the hit rate outright.

## When to use it

- The user's request is casual ("a coffee product shot, make it nice") — **diagnose first, then generate**;
- The user says the image is wrong or far off — **use review mode and read the image back**;
- The user directly asks to improve a prompt.

Skip it when the request is already specific (light position, focal length and composition all present) and just generate.

## Two ways to run it

### Option 1: call the script (default, uses gpt-5.6-luna)

```bash
# Diagnose before generating
python3 ${CLAUDE_SKILL_DIR}/scripts/prompt_doctor.py "a coffee product shot, make it nice" -t nano-banana -s product

# Review after generating: pass the actual result
python3 ${CLAUDE_SKILL_DIR}/scripts/prompt_doctor.py "change the cup in the red box to black, leave everything else" -i result.png

# JSON for programmatic use
python3 ${CLAUDE_SKILL_DIR}/scripts/prompt_doctor.py "Chinese ink landscape illustration" -s illustration --json
```

Arguments:

- First positional argument: the prompt to diagnose (required).
- `-i / --image`: path to an actual result, repeatable, up to 4; **passing any switches on review mode**.
- `-t / --target`: target image model, one of `nano-banana` / `gpt-image` / `seedream` / `flux` / `grok`; appends notes specific to that family (reference limits, mask support, parameter names). Omit if unsure.
- `-s / --scene`: subject, one of `portrait` / `product` / `scene` / `illustration`; defaults to `auto`. Illustration automatically down-weights the photorealism checks.
- `--model`: the text model used for diagnosis, default `gpt-5.6-luna` (cheap, accepts images). The `APIYI_TEXT_MODEL` environment variable overrides it.
- `--json`: emit raw JSON.

Key: the script reads `APIYI_API_KEY` from a `.env` file in the skill folder, or from an
environment variable of the same name. If it reports "no key found", ask the user to add a line
`APIYI_API_KEY=sk-xxx` to `.env`.

### Option 2: do it yourself (no key, or no appetite for the extra spend)

There is nothing secret in the rubric — apply the standard below directly, with no API call at all.
Keep the output format identical so the user sees the same thing either way.

## The rubric

**Six elements**, each marked OK (clearly stated) / WEAK (mentioned but vague) / MISSING (absent):

| Element | Test |
|---|---|
| Subject | Are material, colour, count and state specific |
| Environment | What the background is, what is sharp and what is blurred |
| Light | Direction, hardness, fill — **there must be one identifiable key light** |
| Lens | Focal length, aperture, camera height, tilt |
| Grading | White balance bias, saturation, film or digital character |
| Composition | Where the subject sits, where the negative space is |

**Risks you must report:**

- **Vague quality words** (8K / ultra HD / ultra detailed / masterpiece / perfect): they add no resolution and push the frame toward an over-sharpened, oversaturated render — the core of the AI look. Recommend deleting them in favour of specific light, lens and medium.
- **Resolution written into the prompt**: has no effect. Resolution comes only from parameters such as `size` / `imageSize`.
- **Several edits crammed into one sentence**: the single-shot hit rate drops sharply; split into rounds and change one class of thing at a time.
- **Pronouns like "this" or "the thing in the red box"**: the most common failure in editing tasks; name the object.
- **No statement about text in the image**: the model will invent brand names and copy, which makes the frame commercially unusable. Either state what text should appear, or forbid text explicitly.
- **Real people, celebrities, copyrighted characters, minors, violence or adult content**: these get blocked upstream; flag them for rewriting first.

**Rewriting principles**: fill in what is missing rather than padding with adjectives; leave anything
the user specified exactly as written; for realism add specific light positions, focal length and
aperture, a medium, and deliberate imperfections (pores, stray hair, wear, water rings) instead of
abstractions like "realistic" or "premium"; do not emit a separate negative-prompt field — write
what to avoid into the prompt body.

## Output and what to do next

Relay the diagnosis to the user faithfully: score, missing elements, risks, the rewritten prompt,
what changed, and the parameter suggestions.

Then **confirm before generating**: a rewrite can shift the intent (turning "coffee" into "a latte",
for instance), so let the user look first. Once they approve, pass the rewritten prompt to a
generation skill such as `nano-banana-pro`, using the `size` / `aspect` from the parameter suggestions.

If the user says "don't ask, just generate", go straight to generation with the rewritten prompt and
hand back the diagnosis summary alongside the image.

## Boundaries

- This skill only rewrites prompts. It **does not generate images**, and it makes no compliance judgment beyond flagging likely moderation blocks.
- A rewritten prompt can still miss on the first try — single-sample variance is inherent to these models. Retry or switch models.
- Anything that can only be fixed by a parameter (resolution, aspect ratio, reference images) is flagged, never written into the prompt body.
````

## scripts/prompt\_doctor.py

Create `image-prompt-doctor/scripts/prompt_doctor.py` with the full content below (Python standard library only, nothing to install):

````python theme={null}
#!/usr/bin/env python3
"""Image prompt doctor: review a prompt, flag missing elements, return a rewritten version.

Calls a text model through APIYI (default gpt-5.6-luna). Standard library only, no dependencies.
Two modes:
  1) pre-generation diagnosis  -- prompt only
  2) post-generation review    -- prompt plus the actual result, so the model can read it back
"""
import argparse
import base64
import json
import os
import sys
import urllib.error
import urllib.request

DEFAULT_MODEL = "gpt-5.6-luna"
BASE_URL = "https://api.apiyi.com/v1/chat/completions"
MAX_IMAGES = 4

# Extra notes per target family, appended only when --target is given
TARGET_NOTES = {
    "nano-banana": "Target is Nano Banana (Gemini family): long natural-language sentences work well, "
                   "so write flowing paragraphs rather than keyword piles; up to 14 reference images; "
                   "resolution goes in imageSize (1K/2K/4K) and aspect ratio in aspectRatio.",
    "gpt-image": "Target is the GPT-Image family: strong instruction following and accurate in-image text, "
                 "so specifying exact text is safe; up to 16 reference images; only the official-relay "
                 "gpt-image-2 supports mask inpainting and background=transparent; resolution goes in size.",
    "seedream": "Target is Seedream: strong with Chinese-language briefs; up to 10 reference images "
                "(inputs plus outputs must stay at or below 15); 5.0 and 5.0-pro can be prompted to "
                "return a PNG with a transparent background.",
    "flux": "Target is FLUX: prefers clearly structured description; FLUX.2 pro/max/flex take up to 8 "
            "reference images, Kontext takes 1.",
    "grok": "Target is Grok Imagine: reference images only take effect on /v1/images/edits — passing them "
            "to /v1/images/generations silently discards them and still bills; up to 4 reference images.",
}

SCENE_NOTES = {
    "portrait": "This is a portrait. Check especially: is there one key light with a stated direction and "
                "hardness, are focal length and aperture given, is natural skin requested (pores, fuzz, "
                "shine), is retouching disabled, is the subject moved off dead centre.",
    "product": "This is a product or e-commerce shot. Check especially: is the background specified as "
               "neutral and controllable, are key light and fill written out, is the shadow direction given, "
               "is text and branding explicitly forbidden (otherwise the model invents them), is negative "
               "space left for copy.",
    "scene": "This is an environment. Check especially: specific time and weather, one identifiable key "
             "light, camera height and focal length, whether wear and clutter were added for realism, "
             "whether people are asked not to face the camera.",
    "illustration": "This is illustration, not photorealism. Down-weight the realism checklist and instead "
                    "check: is the style named specifically (medium, brushwork, era, school), the palette, "
                    "the line and colouring method, composition and negative space.",
}

SYSTEM = """You are an image prompt diagnostician serving developers and designers who call image
models directly over an API. An API call is a single atomic call: the prompt reaches the model
verbatim, with none of the automatic rewriting a web app does, so prompt quality decides the hit rate.

## Rubric

First mark each of the six elements ok (clearly stated) / weak (mentioned but vague) / missing:

1 subject: are material, colour, count and state specific
2 environment: what the background is, what is sharp and what is blurred
3 light: direction, hardness, fill -- there must be one identifiable key light
4 lens: focal length, aperture, camera height, tilt
5 tone: white balance bias, saturation, film or digital character
6 composition: where the subject sits in the frame, where the negative space is

## Risks you must report

- Vague quality words such as 8K / ultra HD / ultra detailed / masterpiece / perfect: they add no
  resolution and push the frame toward an over-sharpened, oversaturated render, which is the core of
  the AI look. Always recommend deleting them in favour of specific light, lens and medium.
- Resolution written into the prompt (4K/8K/high definition): no effect. Resolution comes only from
  parameters such as size / imageSize.
- Several unrelated edits crammed into one sentence: the single-shot hit rate drops sharply; split
  into rounds.
- Pronouns such as "this" or "the thing in the red box" instead of naming the object: the most
  common failure in editing tasks.
- No statement about text in the image: the model may invent brand names or copy, which makes the
  frame commercially unusable. Either state what text should appear, or forbid text explicitly.
- Real people, celebrities, copyrighted characters, minors, violence or adult content: these get
  blocked upstream and need rewriting first.

## Rewriting principles

- Fill in what is missing; do not pad the prompt with adjectives to make it longer.
- Leave anything the user specified exactly as written.
- For realism, add specific light positions, focal length and aperture, a film or digital medium, and
  deliberate imperfections (pores, stray hair, wear, water rings) rather than abstractions such as
  "realistic" or "premium".
- Do not emit negative-prompt syntax (most image models have no separate negative prompt field);
  write what to avoid into the prompt body.
- optimized_prompt and changes must use the same language as the user's original prompt.

## Output

Emit exactly this JSON, with no code fence and no extra commentary:

{
  "score": integer 0-100 for how usable this prompt is in a single shot,
  "verdict": "one-line summary, at most 20 words",
  "elements": {"subject":"ok|weak|missing","environment":"...","light":"...","lens":"...","tone":"...","composition":"..."},
  "risks": ["one sentence each, stating the problem and its consequence; empty array if none"],
  "optimized_prompt": "the full rewritten prompt, ready to use as-is",
  "changes": ["what changed and why, one per entry"],
  "suggested_params": {"size":"1K|2K|4K","aspect":"e.g. 1:1 / 16:9","note":"parameter advice, empty string if none"}
}"""

REVIEW_EXTRA = """

## This run is a post-generation review

The user already generated an image from the prompt below; the actual result is attached. Check it
against the prompt line by line: what was honoured, what was not, and what the model added on its
own. In risks, state explicitly which sentence of the prompt was not executed, and rewrite
optimized_prompt to target those deviations rather than generically filling in elements."""


def load_api_key():
    """Prefer the environment variable; otherwise look for .env beside the script or one level up."""
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


def image_data_url(path):
    mime = "image/png" if path.lower().endswith(".png") else "image/jpeg"
    with open(path, "rb") as f:
        return f"data:{mime};base64," + base64.b64encode(f.read()).decode()


def build_messages(prompt, images, target, scene):
    system = SYSTEM
    if images:
        system += REVIEW_EXTRA
    extras = [TARGET_NOTES[target]] if target else []
    if scene and scene != "auto":
        extras.append(SCENE_NOTES[scene])
    if extras:
        system += "\n\n## Extra constraints for this run\n\n" + "\n".join("- " + e for e in extras)

    content = [{"type": "text", "text": "Prompt to diagnose:\n\n" + prompt}]
    for path in images:
        content.append({"type": "image_url", "image_url": {"url": image_data_url(path)}})
    return [{"role": "system", "content": system},
            {"role": "user", "content": content}]


def diagnose(api_key, model, messages):
    payload = json.dumps({
        "model": model,
        "messages": messages,
        "response_format": {"type": "json_object"},
    }).encode()
    req = urllib.request.Request(
        BASE_URL, data=payload, method="POST",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            resp = json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"request failed HTTP {e.code}: {e.read().decode(errors='replace')[:500]}")

    text = resp["choices"][0]["message"]["content"].strip()
    if text.startswith("```"):                      # defensive: some models still wrap in a fence
        text = text.split("\n", 1)[1].rsplit("```", 1)[0]
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        raise RuntimeError("model did not return valid JSON, raw output:\n" + text[:800])


MARK = {"ok": "OK", "weak": "WEAK", "missing": "MISSING"}
LABEL = {"subject": "subject", "environment": "environment", "light": "light",
         "lens": "lens", "tone": "grading", "composition": "composition"}


def render(r):
    out = [f"[Diagnosis] {r.get('score', '?')}/100 - {r.get('verdict', '')}", ""]
    els = r.get("elements", {})
    out.append("Six elements: " + "  ".join(
        f"{LABEL.get(k, k)} {MARK.get(v, '?')}" for k, v in els.items()))

    risks = r.get("risks") or []
    if risks:
        out += ["", "Risks:"] + [f"  - {x}" for x in risks]
    else:
        out += ["", "Risks: none"]

    out += ["", "[Optimized prompt]", "", r.get("optimized_prompt", "")]

    changes = r.get("changes") or []
    if changes:
        out += ["", "[What changed]"] + [f"  - {x}" for x in changes]

    p = r.get("suggested_params") or {}
    bits = []
    if p.get("size"):
        bits.append(f"size={p['size']}")
    if p.get("aspect"):
        bits.append(f"aspect={p['aspect']}")
    line = "  ".join(bits)
    if p.get("note"):
        line = (line + "; " if line else "") + p["note"]
    if line:
        out += ["", "[Parameter suggestions] " + line]
    return "\n".join(out)


def main():
    parser = argparse.ArgumentParser(description="Diagnose and optimize an image prompt")
    parser.add_argument("prompt", help="the prompt to diagnose")
    parser.add_argument("-i", "--image", action="append", default=[],
                        help=f"path to an actual result, repeatable (up to {MAX_IMAGES}); switches on review mode")
    parser.add_argument("-t", "--target", choices=sorted(TARGET_NOTES),
                        help="target image model, to append notes specific to that family")
    parser.add_argument("-s", "--scene", choices=["auto"] + sorted(SCENE_NOTES), default="auto",
                        help="subject, default auto (no subject-specific checks appended)")
    parser.add_argument("--model", default=os.environ.get("APIYI_TEXT_MODEL", DEFAULT_MODEL),
                        help=f"text model used for diagnosis, default {DEFAULT_MODEL}")
    parser.add_argument("--json", action="store_true", help="emit raw JSON for programmatic use")
    args = parser.parse_args()

    api_key = load_api_key()
    if not api_key:
        sys.exit("no API key found: add a line APIYI_API_KEY=sk-xxx to .env in the skill folder, "
                 "or set the environment variable of the same name")

    if len(args.image) > MAX_IMAGES:
        sys.exit(f"at most {MAX_IMAGES} images, got {len(args.image)}")
    for path in args.image:
        if not os.path.exists(path):
            sys.exit(f"image not found: {path}")

    messages = build_messages(args.prompt, args.image, args.target, args.scene)
    try:
        result = diagnose(api_key, args.model, messages)
    except RuntimeError as e:
        sys.exit(str(e))

    print(json.dumps(result, ensure_ascii=False, indent=2) if args.json else render(result))


if __name__ == "__main__":
    main()
````

## Switching the diagnosis model

The default is `gpt-5.6-luna` — cheap (\$0.2 input / \$1.2 output per million tokens) and it accepts image input, which review mode needs. Two ways to change it:

```bash theme={null}
# Override for one run
... prompt_doctor.py "your prompt" --model gemini-3.5-flash

# Change the default: add a line to image-prompt-doctor/.env
APIYI_TEXT_MODEL=gemini-3.5-flash
```

<Warning>
  Two things to watch when switching: **review mode requires a model that accepts image input** (a text-only model errors out on an attached image) — see [Vision Understanding](/en/api-capabilities/vision-understanding) for the list. And the script sends `response_format: {"type": "json_object"}`, so a model without JSON mode may return fenced text instead (the script strips fences defensively, but prefer a model that supports JSON mode).
</Warning>

## Why one sentence triggers the diagnosis

A common question: I never typed a command, so why did saying "draw me an image" make it review the prompt first?

Here is the mechanism: at startup the agent **reads the `description` in each skill's `SKILL.md`** — a short piece of metadata saying what the skill does and when it applies. When what you say **matches** that description ("draw me a …", "why did this image come out wrong", "improve this prompt"), the agent **decides on its own to invoke the skill**, reads the full `SKILL.md`, and runs the script. You never memorize a command.

SKILL.md also states that a request which is already specific does not need the treatment, so it will not intervene on every prompt. When you want **complete control**, use explicit invocation below.

## How to use it

### Natural language (implicit trigger)

Once installed, just talk to the agent:

| You say                                                | What the skill does                                       |
| ------------------------------------------------------ | --------------------------------------------------------- |
| "Draw me a coffee product shot, make it look nice"     | Casual request → diagnose, report, confirm, then generate |
| "Why did this image come out wrong?" (with an image)   | Review mode via `-i`, reading the image back              |
| "Improve this prompt"                                  | Diagnosis only, no generation                             |
| "Generate with gpt-image-2, but check my prompt first" | Adds `-t gpt-image` for family-specific notes             |
| "Skip the diagnosis, just generate"                    | Bypasses this skill and calls the generation skill        |

### Explicit invocation (more control)

* **Agents with slash commands** (such as Claude Code):

  ```text theme={null}
  /image-prompt-doctor a woman smiling by a cafe window -s portrait
  ```

* **Any agent / just tell it to run the script** (most universal):

  ```text theme={null}
  Run python3 image-prompt-doctor/scripts/prompt_doctor.py "a woman smiling by a cafe window" -s portrait
  ```

## Where the diagnosis goes

* This skill **writes no files**. The result prints to the terminal and the agent relays it to you — score, six-element marks, risks, the rewritten prompt, what changed, and parameter suggestions.

* To feed the result into your own program, add `--json`; the output is a structured object (`score` / `elements` / `risks` / `optimized_prompt` / `changes` / `suggested_params`) that you can redirect to a file:

  ```bash theme={null}
  python3 image-prompt-doctor/scripts/prompt_doctor.py "your prompt" --json > diagnosis.json
  ```

* **Confirm the rewritten prompt before using it**: a rewrite can shift the intent (turning "coffee" into "a latte"), and SKILL.md already tells the agent to ask first.

* Images passed to review mode are **never modified or overwritten** — they are read-only input.

## Cost

One diagnosis costs a few thousand tokens. At `gpt-5.6-luna` list price that is a fraction of a cent, while a single `high` quality generation costs tens of times more. **Diagnosing before generating saves more in avoided retries than it costs.**

Review mode uploads an image, which is billed as input tokens — slightly more, still far below one generation.

## Related documentation

* [Advanced Image Generation: Workflow and Realism](/en/api-capabilities/image-advanced-workflow) (where this skill sits in the full pipeline)
* [How to Get the Image You Want](/en/api-capabilities/image-generation-success-tips) (rescuing a single failed call)
* [Nano Banana Pro Agent Skill](/en/api-capabilities/nano-banana-image/skills) (the companion generation skill to chain onto the diagnosis)
* [GPT-Image-2 Series Agent Skill](/en/api-capabilities/gpt-image-2/skills) (same, for the GPT line)
* [GPT-5.6 Luna](/en/models/gpt-5-6-luna) (the default diagnosis model: specs, pricing and endpoint support)
