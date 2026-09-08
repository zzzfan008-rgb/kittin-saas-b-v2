> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# APIYI Nano Banana ComfyUI Node (Lightweight Example)

> A lightweight ComfyUI custom node contributed by the community — drop-in Nano Banana Pro / 2 image generation inside your workflows, perfect for quick starts and further extension.

## Overview

`api_yi_nano_banana_node` is a **lightweight ComfyUI custom node** contributed by community partner JerrIsTheBesta. It focuses on "drop-in simplicity + easy extension." Just drop it into your `custom_nodes` directory, restart ComfyUI, and you can call APIYI's Nano Banana Pro / Nano Banana 2 image generation directly in your workflow — a perfect starting point for learning and customization.

<Info>
  **Project Info**

  * 🔗 Source: `github.com/JerrIsTheBesta/api_yi_nano_banana_node`
  * 📜 License: MIT
  * 👤 Author: JerrIsTheBesta
  * ⭐ Contributed by a community partner — positioned as an **example you can extend**
</Info>

<Tip>
  **Who is this for?**

  This node focuses on the two most common operations: text-to-image and multi-image editing. The code is minimal and readable. If you need richer capabilities (conversational editing, 14-image blending, etc.), check out the [full-featured Nano Banana ComfyUI node](/en/scenarios/ecosystem/nano-banana-comfyui), or fork this one and extend it.
</Tip>

## Core Features

<CardGroup cols={2}>
  <Card title="Two core nodes" icon="workflow">
    `APIYI Text to Image` + `APIYI Multi Image Edit` — covers the two most common workflows
  </Card>

  <Card title="Dual-model switching" icon="layers">
    Choose between `gemini-3-pro-image-preview` (Nano Banana Pro) and `gemini-3.1-flash-image-preview`
  </Card>

  <Card title="High-res output" icon="image">
    Supports **2K / 4K** output with automatic timeout tuning based on resolution
  </Card>

  <Card title="Rich aspect ratios" icon="ratio">
    Built-in 1:1, 16:9, 9:16, 4:3, 3:4, 3:2, 2:3, 21:9, 5:4, 4:5 — 10 ratios total
  </Card>

  <Card title="Multi-image editing" icon="images">
    `Multi Image Edit` accepts up to **5 reference images** for blending / style transfer
  </Card>

  <Card title="Lightweight & hackable" icon="code">
    Pure Python with minimal deps (requests / Pillow / numpy). Clean structure, easy to customize
  </Card>
</CardGroup>

## Supported APIYI Models

| Model                 | Model ID                         | Use                                     | API Docs                                                |
| --------------------- | -------------------------------- | --------------------------------------- | ------------------------------------------------------- |
| Nano Banana Pro       | `gemini-3-pro-image-preview`     | High-quality image generation & editing | [View](/en/api-capabilities/nano-banana-image/overview) |
| Nano Banana 2 (Flash) | `gemini-3.1-flash-image-preview` | Fast generation, lower cost             | [View](/en/api-capabilities/gemini/native)              |

## Node Details

### APIYI Text to Image

Generates images from a text prompt — **no input image required**. Outputs: generated image + filename identifier.

### APIYI Multi Image Edit

Accepts **up to 5 input images** for blending, editing, or composition. Outputs: result image, filename, count of images actually used.

### Node Parameters

| Parameter      | Type   | Required | Default                      | Description                                               |
| -------------- | ------ | -------- | ---------------------------- | --------------------------------------------------------- |
| `api_key`      | string | Yes      | -                            | APIYI token — we recommend a dedicated key with usage cap |
| `prompt`       | string | Yes      | -                            | Text prompt                                               |
| `model`        | enum   | Yes      | `gemini-3-pro-image-preview` | Model (Pro / Flash)                                       |
| `resolution`   | enum   | No       | `2K`                         | Output resolution (2K / 4K, 4K auto-extends timeout)      |
| `aspect_ratio` | enum   | No       | `1:1`                        | 10 aspect ratios available                                |
| `images`       | IMAGE  | No       | -                            | Reference images for Multi Image Edit (up to 5)           |

## Installation

<Steps>
  <Step title="Step 1: Drop into custom_nodes">
    Inside your ComfyUI installation, clone the repo under `custom_nodes`:

    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/JerrIsTheBesta/api_yi_nano_banana_node.git
    ```
  </Step>

  <Step title="Step 2: Install Python deps">
    Deps are minimal — ComfyUI typically ships with torch. Install the rest if missing:

    ```bash theme={null}
    pip install requests pillow numpy
    ```
  </Step>

  <Step title="Step 3: Restart ComfyUI">
    After restart, search `APIYI` in the node palette to find:

    * `APIYI Text to Image`
    * `APIYI Multi Image Edit`
  </Step>

  <Step title="Step 4: Configure APIYI key">
    * Visit the [APIYI Console](https://www.apiyi.com) → Tokens, and **create a dedicated key with a usage cap** (security best practice)
    * Paste the key into the node's `api_key` field
    * No endpoint setup needed — the node uses `https://api.apiyi.com` internally
  </Step>

  <Step title="Step 5: Build a simple workflow">
    * **Text-to-image**: `APIYI Text to Image` → `Preview Image`
    * **Multi-image edit**: multiple `Load Image` → `APIYI Multi Image Edit` → `Preview Image`
  </Step>
</Steps>

## Usage Examples

### Example 1: Text to Image

```
Node: APIYI Text to Image
prompt: "A cute corgi astronaut floating in a neon-lit space station, cinematic lighting"
model: gemini-3-pro-image-preview
resolution: 2K
aspect_ratio: 16:9
```

### Example 2: Multi-Image Blending

```
Node: APIYI Multi Image Edit
images: [person photo, outfit reference, background reference]
prompt: "Replace the outfit with the reference clothing, and set the scene in the reference background"
resolution: 4K
aspect_ratio: 1:1
```

## Extension Ideas

This project is positioned as an **example and starting point** — fork and extend as needed:

<CardGroup cols={2}>
  <Card title="Conversational editing" icon="messages-square">
    Maintain session context inside the node for iterative refinement
  </Card>

  <Card title="More reference images" icon="images">
    Raise the limit to 14 images to match Nano Banana Pro's full capacity
  </Card>

  <Card title="Seed control" icon="dices">
    Add a seed parameter for reproducible generations
  </Card>

  <Card title="Batch output" icon="layers">
    Emit batches of images into downstream ComfyUI nodes
  </Card>
</CardGroup>

## FAQ

<AccordionGroup>
  <Accordion title="Installed the node but can't find it in the palette?">
    1. Make sure the repo is inside `ComfyUI/custom_nodes/`
    2. Fully restart ComfyUI (not just refresh the frontend)
    3. Check ComfyUI's console for any Python import errors
  </Accordion>

  <Accordion title="Calls fail with 401 / 403?">
    Check:

    1. `api_key` is correct and not restricted to the wrong channel
    2. The selected model is on the token's whitelist
    3. Account balance is sufficient — see [Balance seems enough but calls fail](/en/faq/balance-insufficient)
  </Accordion>

  <Accordion title="4K resolution times out frequently?">
    The node auto-extends timeout for 4K, but if it still fails:

    1. Check network path to the API (see [CDN image/video downloads are slow](/en/faq/cdn-download-slow))
    2. Fall back to 2K or Flash during peak hours
  </Accordion>

  <Accordion title="Is the API key exposure safe?">
    The author explicitly recommends **not** using your master key — create a dedicated token with a usage cap in the APIYI console for this node, so any leak has limited blast radius.
  </Accordion>

  <Accordion title="How is this different from the other ComfyUI-Nano-Banana-apiyi node?">
    * This node: **lightweight example**, 2 nodes only, minimal deps — ideal for onboarding and customization
    * [Full version](/en/scenarios/ecosystem/nano-banana-comfyui): richer feature set (conversational editing, 14-image blending), built for production workflows
  </Accordion>
</AccordionGroup>

## Related Resources

<CardGroup cols={2}>
  <Card title="Nano Banana Pro API" icon="book" href="/en/api-capabilities/nano-banana-image/overview">
    Full API reference for Nano Banana Pro
  </Card>

  <Card title="Full ComfyUI Node" icon="workflow" href="/en/scenarios/ecosystem/nano-banana-comfyui">
    The full-featured Nano Banana ComfyUI node pack
  </Card>

  <Card title="Scenario Overview" icon="rocket" href="/en/scenarios">
    Browse more APIYI scenarios
  </Card>

  <Card title="APIYI Console" icon="settings" href="https://www.apiyi.com">
    Manage API keys and usage
  </Card>
</CardGroup>
