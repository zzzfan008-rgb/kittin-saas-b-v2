> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# APIYI GPT-Image 2 Image-Gen Skills

> Community-contributed dual-Skill pack: call gpt-image-2 (official) and gpt-image-2-all (reverse) from Codex CLI, Cursor, Gemini CLI, and other AI coding tools with a single sentence.

## Overview

`apiyi-gpt-image-2-gen` and `apiyi-gpt-image-2-all-gen` are two open-source AI Agent Skills contributed by community user wuchubuzai2018. They let you call APIYI's two OpenAI GPT image models — **official `gpt-image-2`** (fine-grained control, token-based billing, 4K) and **reverse `gpt-image-2-all`** (conversational, per-call billing, ChatGPT parity) — directly from **Codex CLI, OpenCode, Gemini CLI, GitHub Copilot, Cursor, Amp**, and any Skills-compatible tool, via a single natural-language prompt.

<Info>
  **Project Info**

  * 🔗 Source: `github.com/wuchubuzai2018/expert-skills-hub`
  * 📦 Skill IDs: `apiyi-gpt-image-2-gen` (official), `apiyi-gpt-image-2-all-gen` (reverse)
  * 👤 Author: wuchubuzai2018
  * ⭐ Community contribution, shares the same repository as the author's [Nano Banana Pro Image-Gen Skill](/en/scenarios/ecosystem/nano-banana-skill)
</Info>

<Tip>
  **Which skill should I pick?**

  * **`apiyi-gpt-image-2-gen` (official, recommended)**: controllable `size / quality / output-format / compression`, supports 4K (3840×2160), custom sizes, and semantic editing; token-based billing — best when you have specific quality or size requirements
  * **`apiyi-gpt-image-2-all-gen` (reverse)**: needs only a `prompt` plus optional `response-format`; size/ratio described in the prompt; per-call billing (\$0.03/call); parity with the ChatGPT web experience — best for natural-language direct output, strong text rendering, iterative edits
  * Full side-by-side: [official vs reverse comparison](/en/api-capabilities/gpt-image-2/vs-gpt-image-2-all)
</Tip>

## Core Features

<CardGroup cols={2}>
  <Card title="One-sentence image generation" icon="wand-sparkles">
    Describe in Chinese or English right inside your AI coding assistant and get an image back
  </Card>

  <Card title="Dual-model coverage" icon="layers">
    Official `gpt-image-2` and reverse `gpt-image-2-all` are both available — pick per scenario
  </Card>

  <Card title="4K + custom sizes (official)" icon="image">
    Official Skill supports 1024², 1536×1024, 2048², **3840×2160** presets and custom dimensions
  </Card>

  <Card title="Quality / format control (official)" icon="sliders-horizontal">
    `quality` (low / medium / high / auto) + output format (png / jpeg / webp) + compression 0-100
  </Card>

  <Card title="Up to 5 reference images" icon="images">
    Both skills support up to 5 stacked reference images for multi-image fusion and style transfer
  </Card>

  <Card title="Multi-tool compatible" icon="puzzle">
    Works in Codex CLI, OpenCode, Gemini CLI, GitHub Copilot, Cursor, Amp
  </Card>

  <Card title="Node.js + Python runtimes" icon="terminal">
    Ships both `generate_image.js` and `generate_image.py`
  </Card>

  <Card title="Zero-friction setup" icon="key">
    Set `APIYI_API_KEY` once; use `-k` for temporary overrides
  </Card>
</CardGroup>

## Supported APIYI Models

| Model                               | Model ID          | Skill                       | Billing           | API Docs                                              |
| ----------------------------------- | ----------------- | --------------------------- | ----------------- | ----------------------------------------------------- |
| GPT-Image 2 (official, recommended) | `gpt-image-2`     | `apiyi-gpt-image-2-gen`     | Per-token metered | [View](/en/api-capabilities/gpt-image-2/overview)     |
| GPT-Image 2 All (reverse)           | `gpt-image-2-all` | `apiyi-gpt-image-2-all-gen` | \$0.03 per call   | [View](/en/api-capabilities/gpt-image-2-all/overview) |

## Quick Start: 3 Steps

<Steps>
  <Step title="Step 1: Get your APIYI key">
    1. Visit the [APIYI Console](https://api.apiyi.com) and sign in
    2. Under **Tokens**, generate a new key (starts with `sk-`)
    3. Recommended: create a dedicated key with a usage cap

    <Info>
      New users get a free trial credit — enough to try both GPT image models.
    </Info>
  </Step>

  <Step title="Step 2: Install the skill(s) — pick one or install both">
    **Official `gpt-image-2` (recommended)**:

    ```bash theme={null}
    npx skills add https://github.com/wuchubuzai2018/expert-skills-hub --skill apiyi-gpt-image-2-gen
    ```

    **Reverse `gpt-image-2-all`**:

    ```bash theme={null}
    npx skills add https://github.com/wuchubuzai2018/expert-skills-hub --skill apiyi-gpt-image-2-all-gen
    ```

    <Warning>
      Node.js is required; Python scripts work as a backup runtime. If Node.js isn't installed, grab it at `nodejs.org`.
    </Warning>
  </Step>

  <Step title="Step 3: Configure the API key">
    Set the env var (we recommend persisting it in `~/.zshrc` / `~/.bashrc`):

    ```bash theme={null}
    export APIYI_API_KEY="sk-your-apiyi-key"
    ```

    Windows PowerShell:

    ```powershell theme={null}
    $env:APIYI_API_KEY="sk-your-apiyi-key"
    ```
  </Step>
</Steps>

Done! Any Skills-compatible AI coding tool can now trigger the two skills via natural language.

## Command-Line Parameters

### `apiyi-gpt-image-2-gen` (official)

| Parameter              | Short | Required | Description                                                                                                        | Example                    |
| ---------------------- | ----- | -------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| `--prompt`             | `-p`  | Yes      | Generation prompt or edit instruction                                                                              | `"An orange cat on grass"` |
| `--filename`           | `-f`  | No       | Output path (auto timestamped if omitted)                                                                          | `"cat.png"`                |
| `--size`               | `-s`  | No       | Preset (`1024x1024` / `1536x1024` / `1024x1536` / `2048x2048` / `2048x1152` / `3840x2160` / `2160x3840`) or custom | `"2048x1152"`              |
| `--quality`            | `-q`  | No       | `low` / `medium` / `high` / `auto`                                                                                 | `"high"`                   |
| `--output-format`      | `-o`  | No       | `png` (default) / `jpeg` / `webp`                                                                                  | `"webp"`                   |
| `--output-compression` | `-c`  | No       | 0-100 (jpeg / webp only)                                                                                           | `80`                       |
| `--input-image`        | `-i`  | No       | Reference image(s), up to 5                                                                                        | `"portrait.png"`           |
| `--api-key`            | `-k`  | No       | Override env var for one call                                                                                      | `"sk-xxx"`                 |

**Supported aspect ratios**: `1:1`, `3:2`, `2:3`, `16:9`, `9:16`, plus any custom ratio within 3:1.

**Custom size constraints**: each edge ≤ 3840px; both dimensions divisible by 16; total pixels between 655,360 and 8,294,400.

**Typical latency**: 120–150s per request (longer for complex 4K scenes).

### `apiyi-gpt-image-2-all-gen` (reverse)

| Parameter           | Short | Required | Description                                                    | Example                            |
| ------------------- | ----- | -------- | -------------------------------------------------------------- | ---------------------------------- |
| `--prompt`          | `-p`  | Yes      | Conversational prompt (size/ratio described inside the prompt) | `"widescreen 16:9 cyberpunk city"` |
| `--filename`        | `-f`  | No       | Output path (auto timestamped PNG if omitted)                  | `"city.png"`                       |
| `--response-format` | `-r`  | No       | `url` (default, R2 CDN \~24h valid) or `b64_json`              | `"b64_json"`                       |
| `--input-image`     | `-i`  | No       | Reference image(s), up to 5                                    | `"ref.png"`                        |
| `--api-key`         | `-k`  | No       | Override env var for one call                                  | `"sk-xxx"`                         |

<Info>
  The reverse skill **does not accept** `size` / `quality` / `aspect_ratio` CLI flags — describe all of that in the prompt (e.g., `"vertical 9:16 mobile poster"`, `"1024x1024 square"`). Latency: 60–300s.
</Info>

## Usage Examples

### Example 1: Official text-to-image with precise control

```bash theme={null}
node scripts/generate_image.js \
  -p "Cinematic product shot of a minimalist ceramic teacup, soft morning light, 35mm lens" \
  -f "teacup.png" \
  -s "3840x2160" \
  -q "high" \
  -o "png"
```

### Example 2: Official image editing (reference image)

```bash theme={null}
node scripts/generate_image.js \
  -p "replace the background with a sunset beach, keep the subject intact" \
  -i "portrait.png" \
  -f "portrait-beach.jpg" \
  -s "2048x1152" \
  -q "high" \
  -o "jpeg" \
  -c 85
```

### Example 3: Official multi-image fusion

```bash theme={null}
node scripts/generate_image.js \
  -p "put the person from img 1 into the scene from img 2, lighting style from img 3" \
  -i person.png scene.png light.png \
  -f merged.png \
  -q high
```

### Example 4: Reverse conversational (size via prompt)

```bash theme={null}
node scripts/generate_image.js \
  -p "widescreen 16:9 cinematic frame: a girl in hanfu under cherry blossoms, watercolor style, soft light" \
  -f "sakura.png" \
  -r url
```

### Example 5: Invoke from AI coding tools

After installing, just ask the assistant in Cursor / Codex CLI, etc.:

* "Use apiyi-gpt-image-2-gen to generate a 3840x2160 high-quality cyberpunk city wallpaper"
* "Call apiyi-gpt-image-2-all-gen to turn photo.jpg into Studio Ghibli style"
* "Use the official skill to produce a 1:1 logo, high quality, webp format"

The assistant will pick the right skill and assemble the CLI flags for you.

## FAQ

<AccordionGroup>
  <Accordion title="Which skill should I pick?">
    * Need **exact size** (e.g., 3840×2160), **quality tiers** (low/medium/high), or **specific output formats** (webp / compression) → pick **official `apiyi-gpt-image-2-gen`**
    * Prefer **ChatGPT-parity conversational flow**, **flat per-call pricing** (\$0.03), **strong text rendering**, and are fine expressing size in natural language → pick **reverse `apiyi-gpt-image-2-all-gen`**
    * Full side-by-side: [official vs reverse comparison](/en/api-capabilities/gpt-image-2/vs-gpt-image-2-all)
  </Accordion>

  <Accordion title="`npx skills` install fails">
    1. Confirm Node.js is installed (`node -v`)
    2. Verify network access to GitHub
    3. If `npx skills` is unavailable, clone manually:

    ```bash theme={null}
    git clone https://github.com/wuchubuzai2018/expert-skills-hub.git
    ```

    Then copy either `skills/apiyi-gpt-image-2-gen` or `skills/apiyi-gpt-image-2-all-gen` into your local Skills directory.
  </Accordion>

  <Accordion title="API key invalid error">
    1. Check that `APIYI_API_KEY` is set correctly (starts with `sk-`)
    2. Balance — see [Balance seems enough but calls fail](/en/faq/balance-insufficient)
    3. For a quick test, pass `-k "sk-xxx"` inline
  </Accordion>

  <Accordion title="Official skill rejects my custom size">
    Custom `size` must satisfy:

    * each edge ≤ 3840px
    * both dimensions divisible by 16
    * total pixels between 655,360 and 8,294,400
      For example, `2048x3072` is valid; `3000x2000` is rejected because 3000 isn't divisible by 16.
  </Accordion>

  <Accordion title="How long is the reverse skill's URL valid?">
    The reverse skill's default R2 CDN URL is valid for roughly **24 hours**. For production, pass `-r b64_json` to receive Base64 and persist locally, or download the asset right away.
  </Accordion>

  <Accordion title="Which AI coding tools are supported?">
    Tested with: Codex CLI, OpenCode, Gemini CLI, GitHub Copilot, Cursor, Amp. Any Skills-compatible tool should work.
  </Accordion>
</AccordionGroup>

## Related Resources

<CardGroup cols={2}>
  <Card title="gpt-image-2 (official) docs" icon="book" href="/en/api-capabilities/gpt-image-2/overview">
    Native 2K/4K generation, per-token billing
  </Card>

  <Card title="gpt-image-2-all (reverse) docs" icon="book" href="/en/api-capabilities/gpt-image-2-all/overview">
    ChatGPT parity, \$0.03 per call
  </Card>

  <Card title="Official vs Reverse comparison" icon="scale" href="/en/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    17-dimension side-by-side
  </Card>

  <Card title="Nano Banana Pro Skill (same author)" icon="puzzle" href="/en/scenarios/ecosystem/nano-banana-skill">
    Sister Skill from the same repo — Gemini image generation
  </Card>

  <Card title="Luck GPT-Image 2 ComfyUI Nodes" icon="workflow" href="/en/scenarios/ecosystem/luckgpt2-comfyui">
    Same models, ComfyUI-node flavor
  </Card>

  <Card title="APIYI Console" icon="settings" href="https://www.apiyi.com">
    Manage keys, usage, and channels
  </Card>
</CardGroup>
