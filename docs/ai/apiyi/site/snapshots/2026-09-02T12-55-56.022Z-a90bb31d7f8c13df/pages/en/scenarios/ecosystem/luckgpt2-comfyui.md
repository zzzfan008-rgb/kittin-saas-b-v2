> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Luck GPT-Image 2 - ComfyUI Nodes

> A community-contributed dual-node pack: call gpt-image-2 (official) and gpt-image-2-all (reverse) directly in ComfyUI — covers text-to-image, reference-image editing, mask inpainting, and custom resolutions.

## Overview

`Comfyui-Luck-gpt2.0` is a ComfyUI custom node pack contributed by community user luckdvr. It lets you call APIYI's two GPT image models directly inside ComfyUI — **official `gpt-image-2`** and **reverse-engineered `gpt-image-2-all`**. The two nodes divide work clearly: the former focuses on fine-grained parameters (resolution, quality, mask, multi-reference), while the latter delivers the ChatGPT-parity conversational image experience, with built-in timeout/retry — ideal for production workflows.

<Info>
  **Project Info**

  * 🔗 Source: `github.com/luckdvr/Comfyui-Luck-gpt2.0`
  * 📜 License: Apache-2.0
  * 👤 Author: luckdvr
  * ⭐ Community contribution, built for APIYI
</Info>

<Tip>
  **How to tell this apart from the author's other node pack?**

  luckdvr contributes two ComfyUI node packs for APIYI:

  * **[Luck Nano Banana Pro](/en/scenarios/ecosystem/lucknanobananapro-comfyui)**: calls the Gemini line (`gemini-3-pro-image-preview` / `gemini-3.1-flash-image-preview`) — emphasizes 14 reference images and engineering-grade retry/timeout
  * **Luck GPT-Image 2 (this page)**: calls the OpenAI line (`gpt-image-2` / `gpt-image-2-all`) — emphasizes dual-endpoint switching (chat\_completions / images\_api) and mask inpainting
</Tip>

## Core Features

<CardGroup cols={2}>
  <Card title="Two nodes, two routes" icon="layers">
    `Comfyui-Luck gpt-image-2` (official) and `Comfyui-Luck gpt-2.0 all` (reverse) — pick whichever fits the scene
  </Card>

  <Card title="Up to 5 reference images" icon="images">
    The official node accepts up to 5 reference images for complex fusion and style transfer
  </Card>

  <Card title="Mask inpainting" icon="eraser">
    Optional mask input to precisely target the edit region for local changes
  </Card>

  <Card title="Multi-tier + custom resolution" icon="image">
    1K / 2K / 4K presets plus custom sizing (max 3840px per edge, 655,360–8,294,400 total pixels)
  </Card>

  <Card title="15 aspect ratios" icon="ratio">
    AUTO, 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9, 1:4, 4:1, 1:8, 8:1
  </Card>

  <Card title="Quality & output format" icon="sliders-horizontal">
    `quality` (auto / low / medium / high) + output format (png / jpeg / webp) + compression 0-100
  </Card>

  <Card title="Dual endpoints (reverse node)" icon="git-branch">
    `gpt-image-2-all` supports switching between `chat_completions` and `images_api` endpoints
  </Card>

  <Card title="Built-in timeout & retry" icon="refresh-cw">
    Timeout and retry parameters built in — stable even at peak hours
  </Card>
</CardGroup>

## Supported APIYI Models

| Model                     | Model ID          | Node                       | Use                                                                  | API Docs                                              |
| ------------------------- | ----------------- | -------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------- |
| GPT-Image 2 (official)    | `gpt-image-2`     | `Comfyui-Luck gpt-image-2` | Native 2K/4K text-to-image, reference-image editing, mask inpainting | [View](/en/api-capabilities/gpt-image-2/overview)     |
| GPT-Image 2 All (reverse) | `gpt-image-2-all` | `Comfyui-Luck gpt-2.0 all` | ChatGPT-parity conversational image generation, per-call billing     | [View](/en/api-capabilities/gpt-image-2-all/overview) |

<Info>
  For a full side-by-side, see the [gpt-image-2 (official) vs gpt-image-2-all (reverse) comparison](/en/api-capabilities/gpt-image-2/vs-gpt-image-2-all).
</Info>

## Node Parameters

### `Comfyui-Luck gpt-image-2` (official)

| Parameter             | Type   | Required | Default | Description                                                 |
| --------------------- | ------ | -------- | ------- | ----------------------------------------------------------- |
| `api_key`             | string | Yes      | -       | APIYI token — we recommend a dedicated key with a usage cap |
| `prompt`              | string | Yes      | -       | Generation or editing instruction                           |
| `image_1` … `image_5` | IMAGE  | No       | -       | Reference images, up to 5                                   |
| `mask`                | MASK   | No       | -       | Optional mask for inpainting (white area = edit region)     |
| `size`                | enum   | No       | `2K`    | Output resolution (1K / 2K / 4K / custom)                   |
| `custom_size`         | string | No       | -       | Used when `size` is `custom`, e.g. `2048x3072`              |
| `aspect_ratio`        | enum   | No       | `AUTO`  | One of 15 aspect ratios                                     |
| `quality`             | enum   | No       | `auto`  | auto / low / medium / high                                  |
| `output_format`       | enum   | No       | `png`   | png / jpeg / webp                                           |
| `output_compression`  | int    | No       | 80      | 0-100 (applies to jpeg / webp only)                         |

### `Comfyui-Luck gpt-2.0 all` (reverse)

| Parameter         | Type   | Required | Default            | Description                       |
| ----------------- | ------ | -------- | ------------------ | --------------------------------- |
| `api_key`         | string | Yes      | -                  | APIYI token                       |
| `prompt`          | string | Yes      | -                  | Conversational image prompt       |
| `endpoint`        | enum   | No       | `chat_completions` | `chat_completions` / `images_api` |
| `response_format` | enum   | No       | -                  | `b64_json` / `url` etc.           |
| `timeout_seconds` | int    | No       | -                  | Per-request timeout               |
| `retry_times`     | int    | No       | -                  | Retry count on failure            |

## Installation

<Steps>
  <Step title="Step 1: Clone into custom_nodes">
    Inside your ComfyUI install:

    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/luckdvr/Comfyui-Luck-gpt2.0.git
    ```
  </Step>

  <Step title="Step 2: Install dependencies">
    ```bash theme={null}
    cd Comfyui-Luck-gpt2.0
    python3 -m pip install -r requirements.txt
    ```
  </Step>

  <Step title="Step 3: Restart ComfyUI">
    Search `Luck gpt-image-2` or `Luck gpt-2.0 all` in the node palette to find them.
  </Step>

  <Step title="Step 4: Configure APIYI key">
    * Visit [APIYI Console](https://www.apiyi.com) → Tokens, create a new key (use a usage cap for safety)
    * Paste it into the `api_key` field
    * The node defaults to `api.apiyi.com`; you can switch to backup domains `vip.apiyi.com` / `b.apiyi.com` if needed
  </Step>

  <Step title="Step 5: Import the example workflow">
    The repo ships with `example_workflow.json` — import it into ComfyUI as a starting point.
  </Step>
</Steps>

## Usage Examples

### Example 1: Official 4K high-quality text-to-image

```
Node: Comfyui-Luck gpt-image-2
prompt: "Cinematic portrait of a samurai in a misty bamboo forest, volumetric light, 85mm lens, photorealistic"
size: 4K
aspect_ratio: 2:3
quality: high
output_format: png
```

### Example 2: Mask inpainting (official)

```
Node: Comfyui-Luck gpt-image-2
image_1: original photo
mask: the area to be replaced (white = edit region)
prompt: "replace the sky with dramatic sunset clouds, keep everything else intact"
size: 2K
quality: high
```

### Example 3: Reverse conversational image

```
Node: Comfyui-Luck gpt-2.0 all
endpoint: chat_completions
prompt: "A girl in hanfu standing under a cherry blossom tree, watercolor style, soft lighting"
response_format: b64_json
timeout_seconds: 180
retry_times: 3
```

## FAQ

<AccordionGroup>
  <Accordion title="Which node should I pick?">
    * **`gpt-image-2` (official)**: controllable parameters, native mask support, per-token billing, fine-grained resolution/quality — best when you have specific size requirements or need local edits
    * **`gpt-image-2-all` (reverse)**: per-call billing (\$0.03/call), conversational natural-language prompts, parity with the ChatGPT web experience — best for iterative edits and strong text rendering
    * Full side-by-side: [official vs reverse comparison](/en/api-capabilities/gpt-image-2/vs-gpt-image-2-all)
  </Accordion>

  <Accordion title="Node not found after installing?">
    1. Confirm the folder sits at `ComfyUI/custom_nodes/Comfyui-Luck-gpt2.0`
    2. `pip install -r requirements.txt` completed without errors
    3. Fully restart ComfyUI (refreshing the frontend alone is not enough)
  </Accordion>

  <Accordion title="4K or custom sizes time out a lot?">
    * Raise `timeout_seconds` on the reverse node
    * If your server network is slow, see [CDN image/video downloads are slow](/en/faq/cdn-download-slow)
    * Switch to backup domains `vip.apiyi.com` / `b.apiyi.com` if the default endpoint is flaky
  </Accordion>

  <Accordion title="b64_json comes back with a prefix?">
    The reverse `gpt-image-2-all` returns `b64_json` with a `data:image/png;base64,` prefix, while the official `gpt-image-2` does not. Details in the [official vs reverse comparison](/en/api-capabilities/gpt-image-2/vs-gpt-image-2-all).
  </Accordion>

  <Accordion title="Calls return 401 / 403?">
    1. Check `api_key` validity and whether it's restricted by channel
    2. Make sure the selected model is whitelisted on the token
    3. Balance issues — see [Balance seems enough but calls fail](/en/faq/balance-insufficient)
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
    17-dimension side-by-side table
  </Card>

  <Card title="ComfyUI node collection" icon="workflow" href="/en/scenarios">
    Browse more APIYI-adapted ComfyUI nodes
  </Card>

  <Card title="Luck Nano Banana Pro (same author)" icon="puzzle" href="/en/scenarios/ecosystem/lucknanobananapro-comfyui">
    luckdvr's Gemini-line ComfyUI node
  </Card>

  <Card title="APIYI GPT-Image 2 Skills (same models)" icon="puzzle" href="/en/scenarios/ecosystem/apiyi-gpt-image-skills">
    AI Agent Skill flavor for the same two GPT image models
  </Card>

  <Card title="APIYI Console" icon="settings" href="https://www.apiyi.com">
    Manage keys, usage, and channels
  </Card>
</CardGroup>
