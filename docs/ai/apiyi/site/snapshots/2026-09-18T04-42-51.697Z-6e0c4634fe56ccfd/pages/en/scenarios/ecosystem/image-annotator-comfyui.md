> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Image Annotator - ComfyUI Node

> Community-contributed interactive annotation node: draw points/boxes/polygons directly on images to mark edit regions — a huge prompt-writing shortcut when paired with Nano Banana.

## Overview

`comfyui-image-annotator` is an **interactive image annotation ComfyUI node** contributed by community user luckdvr. Its core value: **lowering the prompt-writing barrier**. Instead of struggling to describe "replace the red button in the top-left corner," you simply **circle, click, or box** the area you want to change and let the model see exactly where to edit. Designed to sit **before** the Nano Banana Pro node in a three-stage pipeline: "image → annotate → API."

<Info>
  **Project Info**

  * 🔗 Source: `github.com/luckdvr/comfyui-image-annotator`
  * 📜 License: MIT
  * 👤 Author: luckdvr
  * ⭐ Community contribution — same author as [Luck Nano Banana Pro](/en/scenarios/ecosystem/lucknanobananapro-comfyui)
</Info>

<Tip>
  **Recommended workflow: Image → Annotator → API node**

  ```
  LoadImage  ─►  ImageAnnotator  ─►  Luck Nano Banana Pro  ─►  SaveImage
                 (mark the area to edit)      (edit per annotation + prompt)
  ```

  Best fit: **users who struggle with English prompts or precise "where to edit" descriptions**. Let the mouse handle *where*, and a one-liner prompt handle *what*.
</Tip>

## Core Features

<CardGroup cols={2}>
  <Card title="Three annotation types" icon="pen-tool">
    **Points (⦿)**: single-click · **Rectangles (▢)**: drag-to-draw · **Polygons (⬡)**: multi-click with auto-close
  </Card>

  <Card title="Real-time rendering" icon="eye">
    Annotations render live on the canvas — WYSIWYG, no round-trip to preview
  </Card>

  <Card title="Zoom / pan / select" icon="move">
    Built-in canvas controls let you annotate precisely even on large images
  </Card>

  <Card title="50-step undo" icon="undo">
    Up to 50 undo steps — experiment freely without fear
  </Card>

  <Card title="Dual outputs" icon="square-split-horizontal">
    Emits both the **annotated image** (for the model) and **annotation JSON** (for downstream parsing)
  </Card>

  <Card title="Customizable styling" icon="palette">
    Stroke color, stroke width, fill transparency, point size — all configurable
  </Card>
</CardGroup>

## Supported APIYI Models

This node **does not call any API** on its own — it only annotates. The annotated image can feed any APIYI model that accepts image input. Best pairings:

| Model                   | Model ID                     | Use                                          | API Docs                                                |
| ----------------------- | ---------------------------- | -------------------------------------------- | ------------------------------------------------------- |
| Nano Banana Pro         | `gemini-3-pro-image-preview` | Region-targeted image editing / blending     | [View](/en/api-capabilities/nano-banana-image/overview) |
| Gemini / Qwen-VL family | various                      | Image understanding, annotation-grounded VQA | [View](/en/api-capabilities/gemini/native)              |

## Node Details

### Input

| Parameter | Type  | Required | Description           |
| --------- | ----- | -------- | --------------------- |
| `image`   | IMAGE | Yes      | The image to annotate |

### Outputs

| Output             | Type   | Description                                                                              |
| ------------------ | ------ | ---------------------------------------------------------------------------------------- |
| `annotated_image`  | IMAGE  | Image with rendered annotation marks (feed directly into downstream API node)            |
| `annotations_json` | STRING | JSON string describing annotation positions/types (for nodes that need structured input) |

## Installation

<Steps>
  <Step title="Step 1: Clone into custom_nodes">
    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/luckdvr/comfyui-image-annotator.git
    ```
  </Step>

  <Step title="Step 2: Restart ComfyUI">
    No extra dependencies — uses ComfyUI's built-in environment. After restart, search `ImageAnnotator` in the node palette.
  </Step>

  <Step title="Step 3: Wire up the three-stage workflow">
    Connect the nodes in sequence:

    ```
    LoadImage → ImageAnnotator → Luck Nano Banana Pro → SaveImage
    ```

    Circle the area to edit on the `ImageAnnotator` canvas, then write a simple prompt in the downstream API node (e.g., "replace the marked area with a red sports car") and run.
  </Step>
</Steps>

## Usage Examples

### Example 1: Local replacement (beginner friendly)

<Steps>
  <Step title="Load the source image">
    `LoadImage` — load a photo of your living room
  </Step>

  <Step title="Annotate the target region">
    `ImageAnnotator` — draw a rectangle around the empty space next to the sofa
  </Step>

  <Step title="Write a one-liner prompt">
    `Luck Nano Banana Pro` — prompt: "Put a green indoor plant in the marked area"
  </Step>

  <Step title="Run and save">
    The model adds a plant exactly in your box and leaves the rest untouched
  </Step>
</Steps>

### Example 2: Multi-region precise edits

Use **polygon** to outline clothing + **point** for a hat location + **rectangle** for the background, then prompt:

```
Change the clothing in polygon 1 to a black suit, add a hat at point 1,
replace the background in rectangle 1 with a sunset beach
```

The model will make distinct edits in each region.

### Example 3: Visual Q\&A / understanding

With Gemini / Qwen-VL: ask the model to explain "what is the object inside the rectangle and what's its role in the scene." Annotations give the model precise visual anchors.

## FAQ

<AccordionGroup>
  <Accordion title="Why is this great for people who struggle with prompts?">
    Traditional image editing requires you to describe *both* where and how — tough for non-native English speakers and AI beginners.

    With this node, **location info comes from the mouse**, so the prompt only needs to describe *what* to change. Descriptions that used to take 3-5 sentences become a single short phrase.
  </Accordion>

  <Accordion title="Do the annotation marks affect generation quality?">
    Yes — **in a good way**. Most multimodal models (Nano Banana, Gemini, Qwen-VL) recognize annotation symbols on the image as "user-indicated target regions" and follow instructions more precisely.

    If you're worried about visual interference, lower stroke width and use semi-transparent fill in the node settings.
  </Accordion>

  <Accordion title="Node not found after installation?">
    1. Confirm the directory: `ComfyUI/custom_nodes/comfyui-image-annotator`
    2. Fully restart ComfyUI (frontend refresh is not enough)
    3. Check ComfyUI's console for errors
  </Accordion>

  <Accordion title="Can I output JSON only without rendering?">
    Yes — just connect only the `annotations_json` output downstream. Useful when you want to pass coordinates into a custom script for post-processing.
  </Accordion>

  <Accordion title="Best practices when pairing with Luck Nano Banana Pro?">
    Recommended pipeline: `LoadImage → ImageAnnotator → Luck Nano Banana Pro`

    * Wire `ImageAnnotator.annotated_image` into `Luck Nano Banana Pro.image_01`
    * Use natural-language prompts describing "what to do to the marked region"
    * If the first result is off, use Luck Nano Banana Pro's `retry_times` or seed modes to re-run
  </Accordion>
</AccordionGroup>

## Related Resources

<CardGroup cols={2}>
  <Card title="Luck Nano Banana Pro Node" icon="workflow" href="/en/scenarios/ecosystem/lucknanobananapro-comfyui">
    The author's API-calling node — pairs perfectly with this one
  </Card>

  <Card title="Nano Banana Pro API" icon="book" href="/en/api-capabilities/nano-banana-image/overview">
    Full Nano Banana Pro capabilities
  </Card>

  <Card title="ComfyUI node collection" icon="layers" href="/en/scenarios">
    Browse all Nano Banana ComfyUI nodes
  </Card>

  <Card title="APIYI Console" icon="settings" href="https://www.apiyi.com">
    Manage keys, usage, and channels
  </Card>
</CardGroup>
