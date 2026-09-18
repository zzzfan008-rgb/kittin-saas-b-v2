> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Luck GPT-Image 2 - ComfyUI Nodes

> A community-contributed ComfyUI node pack: three image nodes covering official gpt-image-2 / gpt-image-2.5-flare / gpt-image-2.5-sunburst plus reverse gpt-image-2-all / gpt-image-2-vip, and three prompt-control nodes. Since 2026-09-10 it supports GPT-Image 2.5 with six quality tiers, 16 reference images, mask inpainting and custom resolutions.

## Overview

`Comfyui-Luck-gpt2.0` is a ComfyUI custom node pack contributed by community user luckdvr. It calls APIYI's GPT image models directly inside ComfyUI. The pack currently ships **three image nodes** and **three prompt-control nodes**:

* **`Comfyui-Luck gpt-image-2`** (official): model dropdown offers `gpt-image-2` / `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst`, sends real `size` / `quality`, supports mask inpainting and up to 16 reference images
* **`Comfyui-Luck gpt-2.0 all`** (reverse): calls `gpt-image-2-all`, per-call billing, fast, conversational editing
* **`Comfyui-Luck gpt-image-2-vip`** (reverse): calls `gpt-image-2-vip`, per-call billing, Adobe route
* **Prompt-control nodes**: `GPT-Image-2 文生图提示词控制器` (text-to-image prompt controller) / `图生图提示词控制器` (image-to-image prompt controller) / `文本停留编辑器` (text pause editor). They use a multimodal model to turn your brief into a structured image prompt, and can pause the workflow for manual edits

<Info>
  **2026-09-10 update: GPT-Image 2.5 supported.** The official node adds `gpt-image-2.5-flare` (speed first) and `gpt-image-2.5-sunburst` (quality and editing precision first), and `quality` grows to six tiers (new `xhigh` / `max`). Node names, IDs, widget order and the default model `gpt-image-2` are unchanged, so **existing workflows will not switch model or quality on their own**. After updating the plugin, pick the model in the `model (模型)` dropdown. See "Using GPT-Image 2.5 in the node" below.
</Info>

<Info>
  **Project Info**

  * 🔗 Source: `github.com/luckdvr/Comfyui-Luck-gpt2.0`
  * 📜 License: Apache-2.0
  * 👤 Author: luckdvr
  * ⭐ Community contribution built for APIYI. Report API behavior changes or node errors to the repo's Issues first
</Info>

<Tip>
  **How to tell this apart from the author's other node pack?**

  luckdvr contributes two ComfyUI node packs for APIYI:

  * **[Luck Nano Banana Pro](/en/scenarios/ecosystem/lucknanobananapro-comfyui)**: calls the Gemini line (`gemini-3-pro-image-preview` / `gemini-3.1-flash-image-preview`), emphasizes 14 reference images and engineering-grade retry/timeout
  * **Luck GPT-Image 2 (this page)**: calls the OpenAI line (`gpt-image-2` / `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst` / `gpt-image-2-all` / `gpt-image-2-vip`), emphasizes real `size` / `quality` control, mask inpainting and prompt controllers
</Tip>

## Core Features

<CardGroup cols={2}>
  <Card title="Three nodes, three routes" icon="layers">
    Official `gpt-image-2`, reverse `gpt-2.0 all` and reverse `gpt-image-2-vip` each cover one route. Pick by budget and need
  </Card>

  <Card title="GPT-Image 2.5 twin models" icon="sparkles">
    Switch the official node to `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst`; `-2026-09-08` dated snapshots are also listed for version pinning
  </Card>

  <Card title="Six quality tiers" icon="sliders-horizontal">
    `quality` accepts auto / low / medium / high / xhigh / max; `xhigh` / `max` are accepted by the two 2.5 models only
  </Card>

  <Card title="Up to 16 reference images" icon="images">
    Official node takes `image_01` … `image_16`; the two reverse nodes take up to 14, for multi-image fusion and style transfer
  </Card>

  <Card title="Mask inpainting" icon="eraser">
    Optional `mask` input on the official node targets the edit region precisely (transparent area is repainted, opaque area is kept)
  </Card>

  <Card title="Real resolution + custom size" icon="image">
    auto / 1K / 2K / 4K presets plus custom sizing (max 3840px per edge, 655,360–8,294,400 total pixels)
  </Card>

  <Card title="Prompt controllers" icon="wand-sparkles">
    Default `gemini-3.5-flash` turns a text brief or up to 5 reference images into a structured image prompt, with an optional pause for manual edits
  </Card>

  <Card title="Built-in timeout & retry" icon="refresh-cw">
    Official node defaults to a 600-second timeout; `408` / `429` / `5xx` retry per `retry_times`, so peak-hour jitter is handled
  </Card>
</CardGroup>

## Supported APIYI Models

| Model                             | Model ID                                          | Node                           | Use                                                                         | API Docs                                              |
| --------------------------------- | ------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------- | ----------------------------------------------------- |
| GPT-Image 2.5 Flare (official)    | `gpt-image-2.5-flare` (snapshot `-2026-09-08`)    | `Comfyui-Luck gpt-image-2`     | Speed-first text-to-image, six quality tiers, 16 references + mask          | [View](/en/api-capabilities/gpt-image-2/overview)     |
| GPT-Image 2.5 Sunburst (official) | `gpt-image-2.5-sunburst` (snapshot `-2026-09-08`) | `Comfyui-Luck gpt-image-2`     | Quality and editing precision first; go-to for edits and multi-image fusion | [View](/en/api-capabilities/gpt-image-2/overview)     |
| GPT-Image 2 (official)            | `gpt-image-2`                                     | `Comfyui-Luck gpt-image-2`     | Previous generation, four quality tiers, node default                       | [View](/en/api-capabilities/gpt-image-2/overview)     |
| GPT-Image 2 All (reverse)         | `gpt-image-2-all`                                 | `Comfyui-Luck gpt-2.0 all`     | ChatGPT web route, per-call billing, about 30–60 s                          | [View](/en/api-capabilities/gpt-image-2-all/overview) |
| GPT-Image 2 VIP (reverse)         | `gpt-image-2-vip`                                 | `Comfyui-Luck gpt-image-2-vip` | Adobe route, per-call billing, about 90–150 s                               | [View](/en/api-capabilities/gpt-image-2-vip/overview) |

<Info>
  The three official models share **the same price and parameters** and bill per token; both reverse models bill **\$0.03 per image**. For the full official-vs-reverse breakdown see the [gpt-image-2.5 / 2 official vs reverse comparison](/en/api-capabilities/gpt-image-2/vs-gpt-image-2-all).
</Info>

## Using GPT-Image 2.5 in the node

Update the plugin, fully restart ComfyUI, then switch the `model (模型)` dropdown on `Comfyui-Luck gpt-image-2`. Every other widget stays the same. Both 2.5 models support text-to-image, image editing, 16 reference images and mask; the node picks the generations or edits endpoint from `mode` and whether reference images are connected.

| Model                                           | `quality` values                                     | Positioning                                                                  |
| ----------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------- |
| `gpt-image-2`                                   | `auto` / `low` / `medium` / `high`                   | Previous generation, node default                                            |
| `gpt-image-2.5-flare` (incl. dated snapshot)    | `auto` / `low` / `medium` / `high` / `xhigh` / `max` | Speed first; default choice for text-to-image                                |
| `gpt-image-2.5-sunburst` (incl. dated snapshot) | `auto` / `low` / `medium` / `high` / `xhigh` / `max` | Quality and editing precision first; choice for edits and multi-image fusion |

<Warning>
  **Do not carry `quality` over unchanged when moving from `gpt-image-2` to 2.5.** By APIYI's same-size output-token measurements on 2026-09-09, 2.5 `high` maps to the old `medium`, and only 2.5 `max` maps to the old `high`. This is a token-budget correspondence, not a pixel-for-pixel quality guarantee. To match the old `high` budget on 2.5, choose `max`; at the same budget, 2.5 `high` / `xhigh` give you two cheaper middle tiers.
</Warning>

Node-level behavior worth knowing before you build a workflow:

* **No silent downgrade**: choosing `xhigh` / `max` on the old `gpt-image-2`, or an invalid model / quality, makes the node raise an error before sending. It never swaps the tier for you
* **Use `auto` sparingly**: `auto` is a dynamic reasoning tier, so cost and latency for the same prompt drift between tiers. Pick a tier explicitly to control spend
* **Pin dated snapshots in production**: `gpt-image-2.5-flare-2026-09-08` / `gpt-image-2.5-sunburst-2026-09-08` in the dropdown freeze the model version, so an alias change upstream does not move you
* **Keep the 600-second timeout**: for 2.5 `xhigh` / `max`, 2K / 4K or complex edits, keep the default or raise it. A synchronous request may still be billed after the client times out, and automatic retries can add cost; set `retry_times` to `1` if you do not want retries

## Node Parameters

### `Comfyui-Luck gpt-image-2` (official)

Widget labels on the panel carry a Chinese suffix, such as `api_key (API密钥)`; the tables below list the English field names only.

| Parameter               | Type   | Required | Default            | Description                                                                                                                               |
| ----------------------- | ------ | -------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `api_key`               | string | Yes      | -                  | APIYI token. A dedicated key with a usage cap is recommended                                                                              |
| `prompt`                | string | Yes      | -                  | Generation or editing instruction                                                                                                         |
| `mode`                  | enum   | Yes      | `AUTO`             | `AUTO` / `text2img` / `img2img`; `AUTO` decides from whether reference images are connected                                               |
| `model`                 | enum   | Yes      | `gpt-image-2`      | `gpt-image-2` / `gpt-image-2.5-flare` / `gpt-image-2.5-sunburst` / `gpt-image-2.5-flare-2026-09-08` / `gpt-image-2.5-sunburst-2026-09-08` |
| `api_base`              | enum   | Yes      | `api.apiyi.com/v1` | API domain, see Installation step 4                                                                                                       |
| `image_size`            | enum   | Yes      | `2K`               | `auto (不传size)` / `1K` / `2K` / `4K` / `custom (自定义)`                                                                                     |
| `aspect_ratio`          | enum   | Yes      | `16:9`             | 20 options: AUTO, 1:4, 4:1, 1:8, 8:1, 1:1, 1:2, 2:1, 1:3, 3:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 9:21, 21:9                       |
| `custom_size`           | string | No       | `1600x1200`        | Used only when `image_size` is `custom`, format `WxH`                                                                                     |
| `quality`               | enum   | Yes      | `auto`             | `auto` / `low` / `medium` / `high` / `xhigh` / `max`; the last two are 2.5 only                                                           |
| `output_format`         | enum   | Yes      | `png`              | `png` / `jpeg` / `webp`                                                                                                                   |
| `output_compression`    | int    | Yes      | 85                 | 0–100, applies to jpeg / webp only                                                                                                        |
| `seed`                  | int    | Yes      | 0                  | ComfyUI-local control (forces a re-run); **never sent to the API**                                                                        |
| `timeout_seconds`       | int    | Yes      | 600                | Read timeout, range 60–1800; connect timeout is fixed at 30 s                                                                             |
| `retry_times`           | int    | Yes      | 3                  | Range 1–10; `408` / `429` / `5xx` are retried automatically                                                                               |
| `image_01` … `image_16` | IMAGE  | No       | -                  | Reference images, up to 16                                                                                                                |
| `mask`                  | MASK   | No       | -                  | Inpainting mask, must be used together with `image_01`; the area where the ComfyUI mask value is 1 is repainted                           |

Four constraints on `custom_size`: no edge above 3840px, width and height both multiples of 16, long edge / short edge at most 3:1, total pixels between 655,360 and 8,294,400. The ratios `1:4` / `4:1` / `1:8` / `8:1` exceed the official 3:1 limit, so the node snaps them to the nearest legal boundary size; `4K + 1:1` uses `2880x2880` rather than `3840x3840` because the latter exceeds the total-pixel cap.

<Note>
  The node does not send `background` / `moderation` / `response_format` / `input_fidelity`; all of them fall back to API defaults. For transparent backgrounds and similar options call the API directly, see the [transparent background FAQ](/en/faq/image-transparent-background).
</Note>

### `Comfyui-Luck gpt-2.0 all` (reverse)

| Parameter               | Type   | Required | Default            | Description                                                                                                                        |
| ----------------------- | ------ | -------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `api_key`               | string | Yes      | -                  | APIYI token                                                                                                                        |
| `prompt`                | string | Yes      | -                  | Conversational generation / editing instruction                                                                                    |
| `mode`                  | enum   | Yes      | `AUTO`             | `AUTO` / `text2img` / `img2img`                                                                                                    |
| `model`                 | enum   | Yes      | `gpt-image-2-all`  | Single fixed option                                                                                                                |
| `api_base`              | enum   | Yes      | `api.apiyi.com/v1` | API domain                                                                                                                         |
| `endpoint`              | enum   | Yes      | `images_api`       | `images_api` (`/v1/images/generations` or `/v1/images/edits`) / `chat_completions` (conversational or online-URL reference images) |
| `aspect_ratio`          | enum   | Yes      | `AUTO`             | 22 options (adds `2:5` / `5:2` over the official node). **Only prepended to the prompt as text**, not a hard size control          |
| `response_format`       | enum   | Yes      | `url`              | `url` / `b64_json`, sent on the `images_api` endpoint only                                                                         |
| `seed`                  | int    | Yes      | 0                  | Local control only, never sent                                                                                                     |
| `timeout_seconds`       | int    | Yes      | 300                | Range 30–1200                                                                                                                      |
| `retry_times`           | int    | Yes      | 3                  | Range 1–10                                                                                                                         |
| `image_01` … `image_14` | IMAGE  | No       | -                  | Reference images, up to 14                                                                                                         |

`gpt-image-2-all` does not accept the `size` / `quality` / `n` / `aspect_ratio` API fields and the node never sends them; 2K / 4K can only be described in the prompt with no pixel guarantee. `url` output is usually a temporary CDN link valid for about a day, so re-host it if you need it long-term.

### `Comfyui-Luck gpt-image-2-vip` (reverse)

Same widgets as `gpt-2.0 all` plus two size controls:

| Parameter      | Type | Required | Default           | Description                                                                                                                                                                         |
| -------------- | ---- | -------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`        | enum | Yes      | `gpt-image-2-vip` | Single fixed option                                                                                                                                                                 |
| `image_size`   | enum | Yes      | `2K Recommended`  | `1K Fast` / `2K Recommended` / `4K Detail`; **currently a UI hint kept for old workflows, the node does not send `size`**                                                           |
| `aspect_ratio` | enum | Yes      | `16:9`            | 10 options: 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9; used only as a prompt prefix fallback                                                                              |
| others         | -    | -        | -                 | `api_key` / `prompt` / `mode` / `api_base` / `endpoint` / `response_format` / `seed` / `timeout_seconds` (300) / `retry_times` (3) / `image_01` … `image_14`, same as `gpt-2.0 all` |

<Note>
  The author built this node against APIYI's 2026-06-23 notice that `size` was disabled, so it does not send `size` by default. On the APIYI side `size` for `gpt-image-2-vip` was restored on 2026-07-22 (30 common sizes, see the [gpt-image-2-vip docs](/en/api-capabilities/gpt-image-2-vip/overview)); the plugin has not caught up yet. To lock real output sizes inside ComfyUI today, use the official node `Comfyui-Luck gpt-image-2`. Reverse `b64_json` carries a `data:image/png;base64,` prefix, which the node decodes automatically.
</Note>

### Prompt-control nodes

| Node                    | Default model      | Purpose                                                                                                                                                                                 |
| ----------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GPT-Image-2 文生图提示词控制器` | `gemini-3.5-flash` | Turns a text brief into a structured image prompt suited to the GPT-Image line                                                                                                          |
| `图生图提示词控制器`             | `gemini-3.5-flash` | Reads up to 5 reference images (`reference_image_01` required, `02`–`05` optional) plus an optional `subject_image`, and writes a prompt with style, composition and layout constraints |
| `文本停留编辑器`               | -                  | Pauses the workflow here; edit the text, then click `Continue` on the node to resume                                                                                                    |

* Both controllers call APIYI `POST /v1/chat/completions`; the model dropdown offers `gemini-3.5-flash` / `gpt-5.5` / `gpt-4o` / `gpt-4.1-mini` / `gemini-2.5-flash` / `gemini-2.5-pro`
* The image-to-image controller only does image understanding and prompt enhancement. For real multi-image reference or fusion, connect the same images to the downstream image node as well
* The pause editor's `edited_text` is a single string for an image node's `prompt`; `edited_texts` is a list output reserved for batch text workflows. After the pause, **click `Continue` on the node**. Do not press the main Run button again, or ComfyUI re-queues and re-runs the upstream prompt enhancement

## Installation

<Steps>
  <Step title="Step 1: Clone into custom_nodes">
    Inside your ComfyUI install:

    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/luckdvr/Comfyui-Luck-gpt2.0.git
    ```

    Existing users can `git pull` in that folder to get 2.5 support.
  </Step>

  <Step title="Step 2: Install dependencies">
    ```bash theme={null}
    cd Comfyui-Luck-gpt2.0
    python3 -m pip install -r requirements.txt
    ```
  </Step>

  <Step title="Step 3: Fully restart ComfyUI">
    Search `Comfyui-Luck` in the node palette to find the three image nodes and three prompt nodes. Refreshing the frontend is not enough; restart the process after updating the plugin.
  </Step>

  <Step title="Step 4: Configure the APIYI key and domain">
    * Visit the [APIYI Console](https://www.apiyi.com) → Tokens, create a key (a usage cap is recommended)
    * Paste it into the node's `api_key` field
    * Pick one `api_base`: `https://api.apiyi.com/v1` (primary) / `https://b.apiyi.com/v1` (mainland China backup) / `https://vip.apiyi.com/v1` (overseas direct). The node accepts the base URL with or without `/v1`
  </Step>

  <Step title="Step 5: Import an example workflow">
    The repo ships two examples:

    * `example_workflow.json`: one example per image node (the official one uses `size=2048x1152` + `quality=high` + `jpeg`), with Chinese Note nodes explaining how to choose
    * `example_workflow_gpt_image_2_5.json`: a standalone 2.5 example, Flare text-to-image → Sunburst edit → preview, defaulting to `1K + 1:1`, `quality=high`, a 600-second timeout and `retry_times=1`

    API keys in the examples are empty; fill yours in to run. Clear the key before sharing your own workflow.
  </Step>
</Steps>

## Usage Examples

### Example 1: 2.5 Flare 4K high-quality text-to-image

```
Node: Comfyui-Luck gpt-image-2
model: gpt-image-2.5-flare
prompt: "Cinematic portrait of a samurai in a misty bamboo forest, volumetric light, 85mm lens, photorealistic"
image_size: 4K
aspect_ratio: 2:3
quality: max
output_format: png
```

`max` is the 2.5 tier with the same token budget as the old `gpt-image-2` `high`; try `high` or `xhigh` first if you want faster and cheaper.

### Example 2: 2.5 Sunburst mask inpainting

```
Node: Comfyui-Luck gpt-image-2
model: gpt-image-2.5-sunburst
mode: img2img
image_01: original photo
mask: the area to replace
prompt: "replace the sky with dramatic sunset clouds, keep everything else intact"
image_size: 2K
quality: high
```

### Example 3: Flare text-to-image → Sunburst edit chain

Matches `example_workflow_gpt_image_2_5.json` in the repo:

```
[Comfyui-Luck gpt-image-2 · gpt-image-2.5-flare]
  prompt: "product shot of a matte black ceramic mug on a walnut table, soft window light"
  image_size: 1K · aspect_ratio: 1:1 · quality: high
  image ─────────────────────────────┐
                                      ▼
[Comfyui-Luck gpt-image-2 · gpt-image-2.5-sunburst]
  mode: img2img · image_01: ← output of the node above
  prompt: "add a thin gold rim to the mug, keep lighting and background unchanged"
  quality: high
  image ──▶ PreviewImage
```

### Example 4: Reverse conversational image

```
Node: Comfyui-Luck gpt-2.0 all
endpoint: images_api
aspect_ratio: 9:16
prompt: "A girl in hanfu standing under a cherry blossom tree, watercolor style, soft lighting"
response_format: url
timeout_seconds: 300
retry_times: 3
```

### Example 5: Prompt controller → pause and edit → generate

```
5 reference images
  ├─ into 图生图提示词控制器 reference_image_01 ~ reference_image_05
  └─ also into Comfyui-Luck gpt-image-2 image_01 ~ image_05

图生图提示词控制器 optimized_prompt
  └─ into 文本停留编辑器 text_list

文本停留编辑器 edited_text
  └─ into Comfyui-Luck gpt-image-2 prompt (model: gpt-image-2.5-sunburst)
```

Queue the run on the final `PreviewImage` / `SaveImage`. When the flow stops at the pause editor, edit the text and click `Continue` on the node. If one image is a subject that must be locked, also connect it to the controller's `subject_image` and place it on the image node's `image_01`.

## FAQ

<AccordionGroup>
  <Accordion title="Which of the three image nodes should I pick?">
    * **`Comfyui-Luck gpt-image-2` (official)**: real `size` / `quality`, native mask, up to 16 references, per-token billing. Choose it when you need exact sizes, local edits or the six 2.5 quality tiers; default to `gpt-image-2.5-flare` for text-to-image and `gpt-image-2.5-sunburst` for edits
    * **`Comfyui-Luck gpt-2.0 all` (reverse)**: per-call billing (\$0.03 per image), about 30–60 s, ChatGPT web route. Choose it for iterative edits and strong text rendering when hard size control is not needed
    * **`Comfyui-Luck gpt-image-2-vip` (reverse)**: per-call billing (\$0.03 per image), about 90–150 s, Adobe route. A second reverse route to keep on hand; the plugin does not send `size` today
    * Full comparison: [official vs reverse](/en/api-capabilities/gpt-image-2/vs-gpt-image-2-all)
  </Accordion>

  <Accordion title="Will existing workflows switch to 2.5 after updating the plugin?">
    No. Node names, IDs, widget order and the default model `gpt-image-2` are unchanged, so an old workflow keeps running `gpt-image-2` at its original quality. To use 2.5, switch the `model (模型)` dropdown manually and re-pick `quality` using the table above.
  </Accordion>

  <Accordion title="After switching to 2.5 with the same high, why is it cheaper and blurrier?">
    2.5 re-divided the quality tiers. In APIYI's same-size measurements on 2026-09-09, 2.5 `high` outputs about a quarter of the tokens of `gpt-image-2` `high`, matching the old `medium`; to get the old `high` budget on 2.5 choose `max`. Conversely, at the same budget 2.5 adds `high` / `xhigh` as two cheaper middle tiers. Run your own prompts once per tier and compare `usage.output_tokens` before going to production.
  </Accordion>

  <Accordion title="Does the plugin support gpt-image-2.5-all / gpt-image-2.5-vip?">
    The two reverse nodes currently list only `gpt-image-2-all` and `gpt-image-2-vip`. The ChatGPT web app behind `gpt-image-2-all` has been upgraded to Images 2.5, so that model already produces 2.5 images and behaves and costs the same as `gpt-image-2.5-all`, see the [gpt-image-2.5-all docs](/en/api-capabilities/gpt-image-2-all/overview). `gpt-image-2.5-flare-vip` / `gpt-image-2.5-sunburst-vip` are not in the node dropdown yet; call the API directly if you need them.
  </Accordion>

  <Accordion title="Node not found after installing?">
    1. Confirm the folder sits at `ComfyUI/custom_nodes/Comfyui-Luck-gpt2.0`
    2. `pip install -r requirements.txt` completed without errors
    3. Fully restart ComfyUI (refreshing the frontend alone is not enough)
  </Accordion>

  <Accordion title="4K, xhigh / max or custom sizes time out a lot?">
    * The official node defaults to a 600-second read timeout; keep or raise it for 2.5 `xhigh` / `max` and 2K / 4K. A `408 Timeout` usually means the provider-side generation task timed out, not a wrong node parameter
    * A synchronous request may still be billed after the client times out, and automatic retries can add cost; set `retry_times` to `1` to disable retries
    * If your server network is slow, see [CDN image/video downloads are slow](/en/faq/cdn-download-slow)
    * Switch `api_base` to `b.apiyi.com/v1` / `vip.apiyi.com/v1` if the default domain is flaky
  </Accordion>

  <Accordion title="Loading an old workflow reports Value 3 smaller than min of 30?">
    The old workflow's widget order no longer matches the node, so `retry_times=3` was read as `timeout_seconds=3`. Use the current `example_workflow.json` from the repo, or delete and re-add the node.
  </Accordion>

  <Accordion title="After connecting the pause editor, gpt-image-2 reports Value not in list?">
    Converting `prompt` into an input socket leaves the old workflow one prompt placeholder short, so the widgets after it shift by one (for example `mode` reads `gpt-image-2`, `api_base` reads `2K`). The current node passes validation and restores the shifted values at run time; if the panel still shows them shifted, reload the current workflow or re-add `Comfyui-Luck gpt-image-2`.
  </Accordion>

  <Accordion title="b64_json from the reverse nodes comes back with a prefix?">
    Reverse `gpt-image-2-all` / `gpt-image-2-vip` return `b64_json` with a `data:image/png;base64,` prefix, while the official `gpt-image-2` line does not. All three nodes decode both forms automatically, so wire the output straight into `PreviewImage`. Details in the [official vs reverse comparison](/en/api-capabilities/gpt-image-2/vs-gpt-image-2-all).
  </Accordion>

  <Accordion title="Calls return 401 / 403?">
    1. Check `api_key` validity and whether it is restricted by group
    2. Make sure the selected model is whitelisted on the token
    3. Balance issues: see [Balance seems enough but calls fail](/en/faq/balance-insufficient)
  </Accordion>
</AccordionGroup>

## Related Resources

<CardGroup cols={2}>
  <Card title="gpt-image-2.5 / 2 (official) docs" icon="book" href="/en/api-capabilities/gpt-image-2/overview">
    flare / sunburst / gpt-image-2 share price and parameters, native 2K/4K, per-token billing
  </Card>

  <Card title="GPT-image-2.5 launch explainer" icon="newspaper" href="/en/news/gpt-image-2-5-launch">
    Flare is faster, Sunburst is more precise; six quality tiers and migration advice
  </Card>

  <Card title="gpt-image-2-all (reverse) docs" icon="book" href="/en/api-capabilities/gpt-image-2-all/overview">
    ChatGPT web route, \$0.03 per image
  </Card>

  <Card title="gpt-image-2-vip (reverse) docs" icon="book" href="/en/api-capabilities/gpt-image-2-vip/overview">
    Adobe route, \$0.03 per image, 30 supported sizes
  </Card>

  <Card title="Official vs Reverse comparison" icon="scale" href="/en/api-capabilities/gpt-image-2/vs-gpt-image-2-all">
    One table for the differences between official and reverse
  </Card>

  <Card title="ComfyUI node collection" icon="workflow" href="/en/scenarios">
    Browse more APIYI-adapted ComfyUI nodes
  </Card>

  <Card title="Luck Nano Banana Pro (same author)" icon="puzzle" href="/en/scenarios/ecosystem/lucknanobananapro-comfyui">
    luckdvr's Gemini-line ComfyUI node
  </Card>

  <Card title="APIYI GPT-Image 2 Skills (same models)" icon="puzzle" href="/en/scenarios/ecosystem/apiyi-gpt-image-skills">
    AI Agent Skill flavor of the GPT image models
  </Card>

  <Card title="APIYI Console" icon="settings" href="https://www.apiyi.com">
    Manage keys, usage, and groups
  </Card>
</CardGroup>
