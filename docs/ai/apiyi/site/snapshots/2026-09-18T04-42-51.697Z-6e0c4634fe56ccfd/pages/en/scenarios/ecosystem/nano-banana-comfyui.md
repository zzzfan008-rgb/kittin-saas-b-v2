> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana ComfyUI Nodes

> Community open-source ComfyUI custom nodes for calling Nano Banana Pro and Nano Banana 2 image generation models via APIYI, featuring text-to-image, image-to-image, and multi-turn chat capabilities.

## Overview

ComfyUI-Nano-Banana-apiyi is a community-contributed collection of ComfyUI custom nodes, purpose-built for APIYI users. It lets you call Google's most powerful image generation models — Nano Banana Pro and Nano Banana 2 — directly within ComfyUI workflows, **without needing a Google Cloud account**. Just an APIYI API key is all you need to start creating.

<Info>
  **Project Info**

  * 🔗 Source Code: `github.com/pdmaker/ComfyUI-Nano-Banana-apiyi`
  * 📜 License: MIT
  * 👤 Author: Community contribution (original repo was removed; now using a backup mirror)
  * ⭐ Community contributed, adapted for APIYI
</Info>

## Why This Node

<CardGroup cols={2}>
  <Card title="Zero Barrier Entry" icon="key">
    No Google Cloud account needed — use your APIYI key to access Nano Banana Pro and Nano Banana 2 models
  </Card>

  <Card title="Multi-Modal Generation" icon="images">
    Text-to-image, image-to-image, and multi-image fusion (up to 14 reference images) for all creative needs
  </Card>

  <Card title="Multi-Turn Chat Editing" icon="messages-square">
    Unique conversational image generation with context memory for iterative refinement
  </Card>

  <Card title="Ultra-High Resolution" icon="expand">
    Supports 512px, 1K, 2K, 4K output with 14 aspect ratios, covering posters, wallpapers, social media, and more
  </Card>
</CardGroup>

## Supported APIYI Models

| Model Name      | Model ID                         | Features                              | API Docs                                              |
| --------------- | -------------------------------- | ------------------------------------- | ----------------------------------------------------- |
| Nano Banana Pro | `gemini-3-pro-image-preview`     | Flagship quality, full-featured       | [View Docs](/en/api-capabilities/nano-banana-image)   |
| Nano Banana 2   | `gemini-3.1-flash-image-preview` | Pro-level quality + Flash-level speed | [View Docs](/en/api-capabilities/nano-banana-2-image) |

<Tip>
  **Which model to choose?** Pick Nano Banana Pro for ultimate quality; pick Nano Banana 2 for best cost-performance (as low as \$0.025/image). Both models can be used in the same ComfyUI workflow.
</Tip>

## Four Core Nodes

This plugin provides 4 functional nodes covering different use cases:

| Node Name                         | Model | Core Capability                                               | Best For              |
| --------------------------------- | ----- | ------------------------------------------------------------- | --------------------- |
| **Nano Banana AIO**               | Pro   | Text-to-image + image-to-image (1-6 refs) + search grounding  | High-quality creation |
| **Nano Banana Multi-Turn Chat**   | Pro   | Conversational image editing                                  | Iterative refinement  |
| **Nano Banana 2 AIO**             | Flash | Text-to-image + image-to-image (up to 14 refs) + image search | Fast batch generation |
| **Nano Banana 2 Multi-Turn Chat** | Flash | Conversational editing + extreme aspect ratios                | Quick iteration       |

## Getting Started: Installation & Setup

<Steps>
  <Step title="Step 1: Check Prerequisites">
    Make sure you have the following installed:

    * **ComfyUI** (latest version) — if not installed, see: `github.com/comfyanonymous/ComfyUI`
    * **Python 3.12+**
    * **Git**

    <Warning>
      Python version must be 3.12 or higher. Lower versions may cause dependency installation failures.
    </Warning>
  </Step>

  <Step title="Step 2: Download Node Code">
    Open your terminal, navigate to ComfyUI's custom nodes directory, and clone the repository:

    ```bash theme={null}
    cd ComfyUI/custom_nodes
    git clone https://github.com/pdmaker/ComfyUI-Nano-Banana-apiyi.git
    ```
  </Step>

  <Step title="Step 3: Install Dependencies">
    Enter the plugin directory and install required dependencies:

    ```bash theme={null}
    cd ComfyUI-Nano-Banana-apiyi
    pip3 install -r requirements.txt
    ```

    For Nano Banana 2 node support, also install:

    ```bash theme={null}
    pip3 install google-genai --upgrade
    ```
  </Step>

  <Step title="Step 4: Get Your APIYI Key">
    1. Visit [APIYI Console](https://api.apiyi.com) to register/login
    2. Go to the Token section
    3. Generate a new API key
    4. Copy the key (starts with `sk-`)

    <Info>
      New users get free trial credits, enough to experience Nano Banana image generation.
    </Info>
  </Step>

  <Step title="Step 5: Configure Environment Variables">
    In the plugin directory, copy the template file and fill in your credentials:

    ```bash theme={null}
    cp .env.api.template .env
    ```

    Edit the `.env` file with your APIYI key and Base URL:

    ```bash theme={null}
    GOOGLE_API_KEY=sk-your-apiyi-key
    CUSTOM_BASE_URL=https://api.apiyi.com
    ```

    <Tip>
      **Key Config**: `CUSTOM_BASE_URL` must be set to `https://api.apiyi.com` so all requests route through APIYI — no Google Cloud account needed. The code automatically appends the correct API version path.
    </Tip>
  </Step>

  <Step title="Step 6: Restart ComfyUI and Verify">
    After restarting ComfyUI, search for `Nano Banana` in the node list. You should see 4 new nodes:

    * Nano Banana AIO
    * Nano Banana Multi-Turn Chat
    * Nano Banana 2 AIO
    * Nano Banana 2 Multi-Turn Chat

    If you can see these nodes, the installation is successful!
  </Step>
</Steps>

## Hands-On Tutorial: From Text to Image

### Scenario 1: Text-to-Image (Basic)

The simplest usage — input a text description, generate an image.

<Steps>
  <Step title="Add Node">
    Right-click on the ComfyUI canvas, search for and add the **Nano Banana AIO** node (or Nano Banana 2 AIO).
  </Step>

  <Step title="Write Your Prompt">
    Enter your desired image description in the `prompt` field, for example:

    ```
    An orange tabby cat sitting on a windowsill, Tokyo nightscape outside, cyberpunk style, neon lights, high detail, cinematic quality
    ```
  </Step>

  <Step title="Configure Parameters">
    * **image\_count**: Number of images to generate (1-10)
    * **aspect\_ratio**: Choose ratio, e.g., `16:9` (landscape wallpaper) or `9:16` (phone wallpaper)
    * **image\_size**: Resolution — recommend `2K` or `4K`
    * **temperature**: Creativity level, 0.0 most conservative, 2.0 most creative
  </Step>

  <Step title="Run the Workflow">
    Click ComfyUI's **Queue Prompt** button and wait a few seconds to see the generated image.
  </Step>
</Steps>

### Scenario 2: Image Editing & Fusion

Use reference images to guide generation — great for style transfer, element fusion, and more.

1. Connect your reference images to the `image_1` through `image_6` inputs of the **Nano Banana AIO** node
2. Describe the desired effect in `prompt`, e.g., "Convert this photo to watercolor painting style"
3. The model combines reference images and text description to generate new images

<Tip>
  **Nano Banana 2 AIO Exclusive**: Supports up to 14 reference images (10 objects + 4 character consistency references), ideal for creative projects requiring consistent character appearance.
</Tip>

### Scenario 3: Multi-Turn Conversational Editing

The most unique feature — refine images step by step, like chatting.

1. Add the **Nano Banana Multi-Turn Chat** node
2. Round 1: Enter initial description, generate base image
3. Round 2: Enter modification, e.g., "Change the background to a beach"
4. Round 3: Continue refining, e.g., "Add sunset lighting"
5. Each round builds on the conversation memory

Toggle `reset_chat` to clear conversation history and start fresh.

## Node Parameters Reference

### Nano Banana AIO / Nano Banana 2 AIO

| Parameter                 | Type    | Required | Description                              |
| ------------------------- | ------- | -------- | ---------------------------------------- |
| `prompt`                  | string  | Yes      | Image description text                   |
| `image_count`             | integer | No       | Number of images (1-10), default 1       |
| `aspect_ratio`            | enum    | No       | Aspect ratio (11 options / NB2 has 14)   |
| `image_size`              | enum    | No       | Resolution: 512px (NB2 only), 1K, 2K, 4K |
| `temperature`             | float   | No       | Creativity 0.0-2.0                       |
| `use_search`              | boolean | No       | Enable Google search grounding           |
| `image_1` \~ `image_6/14` | image   | No       | Reference image inputs                   |

### Supported Aspect Ratios

| Standard (shared by both nodes) | Nano Banana 2 Exclusive     |
| ------------------------------- | --------------------------- |
| 1:1, 2:3, 3:2, 3:4, 4:3         | 1:4 (ultra-tall vertical)   |
| 4:5, 5:4, 9:16, 16:9            | 4:1 (ultra-wide horizontal) |
| 21:9, Auto (AI auto-select)     | 1:8, 8:1 (extreme ratios)   |

## FAQ

<AccordionGroup>
  <Accordion title="Can't find the nodes after installation?">
    Check the following:

    1. Plugin folder is in the `ComfyUI/custom_nodes/` directory
    2. You ran `pip3 install -r requirements.txt`
    3. For Nano Banana 2 nodes, also run `pip install google-genai --upgrade`
    4. You **restarted** ComfyUI (not just refreshed the browser — restart the backend)
  </Accordion>

  <Accordion title="API Key invalid error?">
    Please verify:

    1. `GOOGLE_API_KEY` in `.env` file is your APIYI key (starts with `sk-`)
    2. `CUSTOM_BASE_URL` is set to `https://api.apiyi.com`
    3. Your APIYI account has sufficient balance (check in the console)
  </Accordion>

  <Accordion title="Slow generation or timeout?">
    * 4K resolution takes longer — try 1K first for testing
    * Multiple images (image\_count greater than 1) increases processing time
    * If timeouts are frequent, try lower resolution or fewer images
  </Accordion>

  <Accordion title="Nano Banana Pro vs Nano Banana 2 — which to choose?">
    * **Nano Banana Pro** (`gemini-3-pro-image-preview`): Finer quality, ideal for premium creations
    * **Nano Banana 2** (`gemini-3.1-flash-image-preview`): Faster, cheaper (from \$0.025/image), more reference images and extreme ratios
    * For daily creation, Nano Banana 2 is recommended; for ultimate quality, choose Pro
  </Accordion>

  <Accordion title="How to get an APIYI API key?">
    Visit [APIYI Console](https://api.apiyi.com/token), register an account and generate a new key in the Token section. New users receive free trial credits.
  </Accordion>

  <Accordion title="Image generation failed due to content safety?">
    Nano Banana models have built-in content safety checks. Some descriptions may trigger restrictions. Suggestions:

    1. Adjust your prompt to avoid sensitive content
    2. See [Nano Banana Image Failure Troubleshooting](/en/faq/nano-banana-image-failure) for more help
  </Accordion>
</AccordionGroup>

## Related Resources

<CardGroup cols={2}>
  <Card title="Nano Banana Pro Docs" icon="banana" href="/en/api-capabilities/nano-banana-image">
    View Nano Banana Pro full API documentation and pricing
  </Card>

  <Card title="Nano Banana 2 Docs" icon="banana" href="/en/api-capabilities/nano-banana-2-image">
    View Nano Banana 2 full API documentation and pricing
  </Card>

  <Card title="Image Failure Troubleshooting" icon="circle-question-mark" href="/en/faq/nano-banana-image-failure">
    Nano Banana image generation troubleshooting guide
  </Card>

  <Card title="APIYI - Token Management" icon="settings" href="https://api.apiyi.com/token">
    Manage API keys, view usage and balance
  </Card>
</CardGroup>
