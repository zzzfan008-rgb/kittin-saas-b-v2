> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Luck Nano Banana Pro - ComfyUI Node

> A community-contributed advanced ComfyUI node: up to 14 reference images, 1K/2K/4K output, 15 aspect ratios, configurable retry/timeout — built for production.

## Overview

`Comfyui-LuckNanoBananaPro` is a ComfyUI custom node contributed by community user luckdvr. It calls Gemini 3 Pro Image Preview / Flash through APIYI for **text-to-image and multi-image editing**. Compared to basic nodes, its biggest strength is **engineering polish**: built-in timeout/retry, real-time progress, native ComfyUI seed modes, and up to 14 stacked image inputs — ideal for heavier production workflows.

<Info>
  **Project Info**

  * 🔗 Source: `github.com/luckdvr/Comfyui-LuckNanoBananaPro`
  * 📜 License: MIT / Apache-2.0 (dual)
  * 👤 Author: luckdvr
  * ⭐ Community contribution, built for APIYI
</Info>

<Tip>
  **How to pick among the three ComfyUI nodes?**

  Three community ComfyUI nodes for Nano Banana are available — pick the right one:

  * **[Nano Banana ComfyUI Nodes](/en/scenarios/ecosystem/nano-banana-comfyui)**: full-featured (conversational editing, multi-turn memory), great for interactive creation
  * **[APIYI Nano Banana Node (Lite)](/en/scenarios/ecosystem/apiyi-nano-banana-node)**: minimal codebase, great for learning and customization
  * **Luck Nano Banana Pro (this page)**: engineering-rich parameters (timeout, retry, 14 image inputs), built for stable production
</Tip>

## Core Features

<CardGroup cols={2}>
  <Card title="Up to 14 image inputs" icon="images">
    `image_01` \~ `image_14` slots stack up to 14 reference images, matching Nano Banana Pro's theoretical input ceiling
  </Card>

  <Card title="Multi-tier resolution" icon="image">
    **1K / 2K / 4K** output with adaptive timeout — balance speed and quality
  </Card>

  <Card title="15 aspect ratios" icon="ratio">
    Rich presets covering vertical, horizontal, square, and cinematic widescreen
  </Card>

  <Card title="Dual-model switch" icon="layers">
    Toggle between `gemini-3-pro-image-preview` (Pro) and `gemini-3.1-flash-image-preview` (Flash)
  </Card>

  <Card title="Timeout & retry" icon="refresh-cw">
    `timeout_seconds` (10-600s) + `retry_times` (1-20) — stable even at peak hours
  </Card>

  <Card title="Real-time progress" icon="gauge">
    Built-in status / percentage / elapsed-time display — no more black-box runs
  </Card>

  <Card title="Native seed modes" icon="dices">
    Supports ComfyUI's standard fixed / random / increment / decrement seed patterns
  </Card>

  <Card title="MIT / Apache-2.0 dual license" icon="shield">
    Permissive license — commercial and derivative work welcome
  </Card>
</CardGroup>

## Supported APIYI Models

| Model                 | Model ID                         | Use                                                 | API Docs                                                |
| --------------------- | -------------------------------- | --------------------------------------------------- | ------------------------------------------------------- |
| Nano Banana Pro       | `gemini-3-pro-image-preview`     | High-quality image generation & multi-image editing | [View](/en/api-capabilities/nano-banana-image/overview) |
| Nano Banana 2 (Flash) | `gemini-3.1-flash-image-preview` | Fast generation, lower cost                         | [View](/en/api-capabilities/gemini/native)              |

## Node Parameters

| Parameter               | Type   | Required | Default                      | Description                                               |
| ----------------------- | ------ | -------- | ---------------------------- | --------------------------------------------------------- |
| `api_key`               | string | Yes      | -                            | APIYI token — we recommend a dedicated key with usage cap |
| `prompt`                | string | Yes      | -                            | Generation or editing instruction                         |
| `model`                 | enum   | Yes      | `gemini-3-pro-image-preview` | Model selection (Pro / Flash)                             |
| `image_size`            | enum   | No       | `2K`                         | Output resolution (1K / 2K / 4K)                          |
| `aspect_ratio`          | enum   | No       | `1:1`                        | One of 15 aspect ratios                                   |
| `timeout_seconds`       | int    | No       | 120                          | Per-request timeout (10-600s)                             |
| `retry_times`           | int    | No       | 3                            | Retry count on failure (1-20)                             |
| `seed`                  | int    | No       | 0                            | Random seed (works with ComfyUI's seed modes)             |
| `image_01` … `image_14` | IMAGE  | No       | -                            | Optional reference images (up to 14)                      |

## Installation

<Steps>
  <Step title="Step 1: Clone into custom_nodes">
    Inside your ComfyUI install:

    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/luckdvr/Comfyui-LuckNanoBananaPro.git
    ```
  </Step>

  <Step title="Step 2: Install dependencies">
    ```bash theme={null}
    cd Comfyui-LuckNanoBananaPro
    python3 -m pip install -r requirements.txt
    ```
  </Step>

  <Step title="Step 3: Restart ComfyUI">
    Search `Luck Nano Banana Pro` in the node palette to find it.
  </Step>

  <Step title="Step 4: Configure APIYI key">
    * Visit [APIYI Console](https://www.apiyi.com) → Tokens, **create a dedicated key with a usage cap** (best practice)
    * Paste the key into the `api_key` field
    * The node already points at `api.apiyi.com` — no endpoint setup required
  </Step>

  <Step title="Step 5: Build your workflow">
    * **Text-to-image**: just set `prompt`, leave image inputs empty
    * **Multi-image editing**: wire multiple `Load Image` into `image_01`, `image_02`, etc., with a prompt describing the edit
  </Step>
</Steps>

## Usage Examples

### Example 1: High-stability text-to-image

```
prompt: "Cinematic product shot of a minimalist ceramic teacup on a wooden tray, soft morning light, 35mm lens, shallow depth of field"
model: gemini-3-pro-image-preview
image_size: 4K
aspect_ratio: 3:2
timeout_seconds: 300
retry_times: 5
```

### Example 2: Multi-image blending

```
image_01: person photo
image_02: outfit reference
image_03: scene reference
image_04: lighting reference
prompt: "Photorealistic portrait: subject from image_01 wearing outfit from image_02, in the setting of image_03, with lighting style of image_04"
image_size: 2K
aspect_ratio: 4:5
```

### Example 3: Seed sweeps

Use ComfyUI's native seed management in `increment` mode to batch-run multiple seeds and compare variations of the same prompt.

## FAQ

<AccordionGroup>
  <Accordion title="Node not found after installing?">
    1. Confirm the repo lives at `ComfyUI/custom_nodes/Comfyui-LuckNanoBananaPro`
    2. Dependencies installed without errors (requests / Pillow / numpy especially)
    3. Fully restart ComfyUI (refresh alone is not enough)
  </Accordion>

  <Accordion title="4K times out often?">
    The node lets you tune `timeout_seconds` directly:

    * Start with `timeout_seconds=300` for 4K
    * Pair with `retry_times=5` for automatic retries against network jitter
    * If still flaky, see [CDN image/video downloads are slow](/en/faq/cdn-download-slow) to optimize your network path
  </Accordion>

  <Accordion title="Will all 14 reference images be used?">
    You can wire up to 14, but **whether they're actually used** depends on your prompt. Reference them explicitly in the prompt (e.g., `image_01`, `image_02`) or describe each one's role — the model will pick up on your instructions.
  </Accordion>

  <Accordion title="Calls return 401 / 403?">
    1. Check `api_key` and ensure it's not restricted to the wrong channel
    2. Selected model must be on the token's whitelist
    3. Account balance — see [Balance seems enough but calls fail](/en/faq/balance-insufficient)
  </Accordion>

  <Accordion title="How is this different from the other two Nano Banana ComfyUI nodes?">
    * [nano-banana-comfyui (full-featured)](/en/scenarios/ecosystem/nano-banana-comfyui): emphasizes **conversational editing** and multi-turn memory
    * [apiyi-nano-banana-node (lite)](/en/scenarios/ecosystem/apiyi-nano-banana-node): minimal code, great for learning/customization
    * **Luck Nano Banana Pro (this page)**: engineering parameters (timeout / retry / 14 images), built for batch and production
  </Accordion>
</AccordionGroup>

## Related Resources

<CardGroup cols={2}>
  <Card title="Nano Banana Pro API" icon="book" href="/en/api-capabilities/nano-banana-image/overview">
    Full model capabilities and API reference
  </Card>

  <Card title="Luck GPT-Image 2 (same author)" icon="puzzle" href="/en/scenarios/ecosystem/luckgpt2-comfyui">
    luckdvr's OpenAI-line ComfyUI nodes: `gpt-image-2` + `gpt-image-2-all`
  </Card>

  <Card title="ComfyUI node collection" icon="workflow" href="/en/scenarios">
    Browse all Nano Banana ComfyUI nodes
  </Card>

  <Card title="FAQ: CDN download slow" icon="gauge" href="/en/faq/cdn-download-slow">
    4K images downloading slowly? Read this
  </Card>

  <Card title="APIYI Console" icon="settings" href="https://www.apiyi.com">
    Manage keys, usage, and channels
  </Card>
</CardGroup>
